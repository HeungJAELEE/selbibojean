import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bdaCourseDomains,
  bdaCourseLibrarySchema,
  bdaCourseRoles,
  bdaPracticalTracks,
  buildCourseReviewFlags,
  classifyCourseDomain,
  classifyCourseHandling,
  classifyCourseRole,
  classifyCourseSourceGroup,
  classifyExamRelevance,
  classifyPracticalTrack,
  cleanCourseTitle,
  extractCourseWeek,
  makeCourseItemId,
  normalizeCoursePath,
  type BdaCourseLibrary,
  type BdaCourseLibraryItem,
} from "../src/lib/domain/bda-course-library";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = resolve(currentFile, "..", "..");
const outputPath = join(
  projectRoot,
  "src",
  "data",
  "generated",
  "bda-course-library.json",
);
const sourceRoot = process.argv[2] ? resolve(process.argv[2]) : "";
const MAX_CAPTURE_BYTES = 256 * 1024;
const CONCURRENCY = 4;

if (!sourceRoot) {
  throw new Error(
    "사용법: npm run import:bda-course-library -- <AI 교육자료 폴더>",
  );
}

type ScannedFile = {
  absolutePath: string;
  relativePath: string;
  bytes: number;
};

async function walkFiles(root: string) {
  const files: ScannedFile[] = [];
  const pending = [root];

  while (pending.length > 0) {
    const directory = pending.pop();
    if (!directory) continue;
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) =>
      left.name.localeCompare(right.name, "ko", { numeric: true }),
    );

    for (const entry of entries) {
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        pending.push(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      const fileStat = await stat(absolutePath);
      files.push({
        absolutePath,
        relativePath: normalizeCoursePath(relative(root, absolutePath)),
        bytes: fileStat.size,
      });
    }
  }

  return files.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath, "ko", {
      numeric: true,
    }),
  );
}

async function inspectFile(file: ScannedFile): Promise<BdaCourseLibraryItem> {
  const rawFileName = basename(file.relativePath);
  const extension = (
    rawFileName.toLocaleLowerCase("en") === ".ds_store"
      ? ".ds_store"
      : extname(file.relativePath).toLocaleLowerCase("en") || ".unknown"
  ).normalize("NFC");
  const captureLimit =
    extension === ".ipynb" && file.bytes <= 64 * 1024 * 1024
      ? file.bytes
      : MAX_CAPTURE_BYTES;
  const hash = createHash("sha256");
  const capture: Buffer[] = [];
  let capturedBytes = 0;
  let lineBreaks = 0;

  for await (const chunk of createReadStream(file.absolutePath)) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    hash.update(buffer);
    if (extension === ".csv") {
      let newlineIndex = buffer.indexOf(10);
      while (newlineIndex !== -1) {
        lineBreaks += 1;
        newlineIndex = buffer.indexOf(10, newlineIndex + 1);
      }
    }
    if (capturedBytes < captureLimit) {
      const remaining = captureLimit - capturedBytes;
      const slice = buffer.subarray(0, remaining);
      capture.push(slice);
      capturedBytes += slice.length;
    }
  }

  const previewBuffer = Buffer.concat(capture);
  const previewText = previewBuffer.toString("utf8").replace(/^\uFEFF/, "");
  const domain = classifyCourseDomain(file.relativePath);
  const role = classifyCourseRole(file.relativePath, extension);
  const practicalTrack = classifyPracticalTrack(
    file.relativePath,
    domain,
    role,
  );
  const handling = classifyCourseHandling(role, extension);
  const item: BdaCourseLibraryItem = {
    id: makeCourseItemId(file.relativePath),
    relativePath: file.relativePath,
    fileName: rawFileName.normalize("NFC"),
    title: cleanCourseTitle(rawFileName),
    extension,
    bytes: file.bytes,
    sha256: hash.digest("hex"),
    sourceGroup: classifyCourseSourceGroup(file.relativePath),
    week: extractCourseWeek(file.relativePath),
    domain,
    role,
    practicalTrack,
    examRelevance: classifyExamRelevance(practicalTrack, role),
    handling,
    reviewFlags: buildCourseReviewFlags({
      role,
      extension,
      bytes: file.bytes,
    }),
  };

  if (extension === ".ipynb") {
    Object.assign(item, inspectNotebook(previewText, file.bytes));
  } else if (extension === ".csv") {
    item.csv = inspectCsv(previewText, lineBreaks, file.bytes);
  } else if ([".py", ".sql", ".md", ".txt", ".toml"].includes(extension)) {
    const firstMeaningfulLine = previewText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith("#!"));
    if (firstMeaningfulLine) {
      item.firstMeaningfulLine = firstMeaningfulLine.slice(0, 180);
    }
  }

  return bdaCourseLibrarySchema.shape.items.element.parse(item);
}

function inspectNotebook(previewText: string, totalBytes: number) {
  if (totalBytes > 64 * 1024 * 1024) {
    const cellTypes = [...previewText.matchAll(/"cell_type"\s*:\s*"([^"]+)"/g)];
    const codeCells = cellTypes.filter((match) => match[1] === "code").length;
    const markdownCells = cellTypes.filter(
      (match) => match[1] === "markdown",
    ).length;
    return {
      notebook: {
        totalCells: codeCells + markdownCells,
        codeCells,
        markdownCells,
        firstHeading: extractNotebookHeading(previewText),
      },
    };
  }

  try {
    const parsed = JSON.parse(previewText) as {
      cells?: Array<{ cell_type?: string; source?: string[] | string }>;
    };
    const cells = parsed.cells ?? [];
    const codeCells = cells.filter((cell) => cell.cell_type === "code").length;
    const markdownCells = cells.filter(
      (cell) => cell.cell_type === "markdown",
    ).length;
    const firstHeading = cells
      .filter((cell) => cell.cell_type === "markdown")
      .flatMap((cell) =>
        Array.isArray(cell.source) ? cell.source : [cell.source ?? ""],
      )
      .map((line) => line.replace(/^#+\s*/, "").trim())
      .find(Boolean);
    return {
      notebook: {
        totalCells: cells.length,
        codeCells,
        markdownCells,
        ...(firstHeading ? { firstHeading: firstHeading.slice(0, 180) } : {}),
      },
    };
  } catch {
    return {
      notebook: {
        totalCells: 0,
        codeCells: 0,
        markdownCells: 0,
        firstHeading: extractNotebookHeading(previewText),
      },
    };
  }
}

function extractNotebookHeading(previewText: string) {
  const matched = previewText.match(/#+\s*([^"\\\r\n]+)/);
  return matched?.[1]?.trim().slice(0, 180);
}

function inspectCsv(
  previewText: string,
  lineBreaks: number,
  totalBytes: number,
) {
  const firstLine = previewText.split(/\r?\n/, 1)[0] ?? "";
  const allColumns = parseCsvHeader(firstLine);
  return {
    columnCount: allColumns.length,
    columns: allColumns.slice(0, 40),
    approximateLineCount:
      totalBytes === 0 ? 0 : Math.max(0, lineBreaks - 1),
    truncatedColumns: allColumns.length > 40,
  };
}

function parseCsvHeader(header: string) {
  const columns: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < header.length; index += 1) {
    const character = header[index];
    if (character === '"') {
      if (quoted && header[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      columns.push(current.trim().slice(0, 120));
      current = "";
    } else {
      current += character;
    }
  }
  columns.push(current.trim().slice(0, 120));
  return columns.filter(Boolean);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index], index);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function completeCounts<const T extends readonly string[]>(
  keys: T,
  counts: Record<string, number>,
): Record<T[number], number> {
  return Object.fromEntries(
    keys.map((key) => [key, counts[key] ?? 0]),
  ) as Record<T[number], number>;
}

async function main() {
  const sourceStat = await stat(sourceRoot);
  if (!sourceStat.isDirectory()) {
    throw new Error(`자료 루트가 폴더가 아닙니다: ${sourceRoot}`);
  }

  const files = await walkFiles(sourceRoot);
  const items = await mapWithConcurrency(files, CONCURRENCY, inspectFile);
  const canonicalByHash = new Map<string, string>();
  for (const item of items) {
    const canonicalId = canonicalByHash.get(item.sha256);
    if (canonicalId) item.duplicateOf = canonicalId;
    else canonicalByHash.set(item.sha256, item.id);
  }

  const relevanceValues = items.map((item) => item.examRelevance);
  const library: BdaCourseLibrary = {
    formatVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceLabel: "2026 AI·데이터 실무 교육자료 로컬 스냅샷",
    policy: {
      sourceBinariesIncluded: false,
      absolutePathsIncluded: false,
      publicDownloadEnabled: false,
      storageMode: "metadata-only",
    },
    stats: {
      totalFiles: items.length,
      totalBytes: items.reduce((total, item) => total + item.bytes, 0),
      duplicateFiles: items.filter((item) => item.duplicateOf).length,
      reviewRequiredFiles: items.filter(
        (item) =>
          item.handling !== "metadata-only" || item.reviewFlags.length > 0,
      ).length,
      byExtension: countBy(items.map((item) => item.extension)),
      byDomain: completeCounts(
        bdaCourseDomains,
        countBy(items.map((item) => item.domain)),
      ),
      byRole: completeCounts(
        bdaCourseRoles,
        countBy(items.map((item) => item.role)),
      ),
      byPracticalTrack: completeCounts(
        bdaPracticalTracks,
        countBy(items.map((item) => item.practicalTrack)),
      ),
      byRelevance: completeCounts(
        ["core", "supporting", "supplementary", "manual-review"] as const,
        countBy(relevanceValues),
      ),
    },
    items,
  };

  const parsed = bdaCourseLibrarySchema.parse(library);
  await mkdir(resolve(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

  const megabytes = (parsed.stats.totalBytes / 1024 / 1024).toFixed(1);
  console.log(
    `BDA_COURSE_LIBRARY_IMPORTED files=${parsed.stats.totalFiles} size_mb=${megabytes} duplicates=${parsed.stats.duplicateFiles} output=${outputPath}`,
  );
}

await main();
