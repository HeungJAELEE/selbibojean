import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WELDING_CBT_TRACK_MANIFESTS } from "../src/data/source/welding-cbt-source-manifest";
import {
  extractExamUrls,
  parseWeldingCbtExamPage,
  sha256,
  type WeldingCbtSourceRecord,
} from "../src/lib/content/welding-cbt-parser";

type IdRegistry = {
  version: 1;
  canonicalIds: Record<string, string>;
  occurrenceIds: Record<string, string>;
};

type ImportedRecord = WeldingCbtSourceRecord & {
  canonicalId: string;
  externalId: string;
  canonicalFingerprint: string;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(
  root,
  "src",
  "data",
  "source",
  "welding-cbt-id-registry.json",
);
const outputPath = path.join(
  root,
  "src",
  "data",
  "generated",
  "welding-cbt-bank.json",
);
const reportDirectory = path.join(
  root,
  "outputs",
  "welding-cbt-import-20260802",
);
const reportPath = path.join(reportDirectory, "import-report.json");
const SOURCE_AS_OF = "2026-08-02T14:59:59.000Z";

function normalizeForFingerprint(value: string) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function canonicalFingerprint(record: WeldingCbtSourceRecord) {
  return sha256(
    JSON.stringify({
      stem: normalizeForFingerprint(record.stem),
      choices: record.choices.map(normalizeForFingerprint),
    }),
  );
}

function occurrenceKey(record: WeldingCbtSourceRecord) {
  return [
    record.trackKey,
    record.examDate,
    String(record.questionNumber),
  ].join(":");
}

function stableId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

async function fetchText(url: string) {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "seolbi-learning-platform-source-audit/1.0 (+source verification)",
        },
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
      }
    }
  }
  throw new Error(
    `${url} fetch failed after 3 attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, worker),
  );
  return results;
}

const registry = JSON.parse(
  await readFile(registryPath, "utf8"),
) as IdRegistry;
if (
  registry.version !== 1 ||
  !registry.canonicalIds ||
  !registry.occurrenceIds
) {
  throw new Error("Invalid welding CBT ID registry");
}

const pages: Array<{
  trackKey: string;
  url: string;
  pageTitle: string;
  examDate: string;
  sha256: string;
  selectedQuestionCount: number;
  approvedQuestionCount: number;
  heldQuestionCount: number;
}> = [];
const importedRecords: ImportedRecord[] = [];
const categoryDigests: Record<string, string> = {};

for (const manifest of WELDING_CBT_TRACK_MANIFESTS) {
  const categoryHtml = await fetchText(manifest.categoryUrl);
  categoryDigests[manifest.key] = sha256(categoryHtml);
  const examUrls = extractExamUrls(
    categoryHtml,
    manifest.categoryUrl,
    manifest.examPathPrefix,
  );
  if (examUrls.length === 0) {
    throw new Error(`${manifest.title}: no exam URLs discovered`);
  }

  const parsedPages = await mapWithConcurrency(
    examUrls,
    2,
    async (url) => {
      const html = await fetchText(url);
      const records = parseWeldingCbtExamPage(html, url, manifest);
      if (records.length === 0) {
        throw new Error(`${url}: no target questions parsed`);
      }
      return { url, records };
    },
  );

  for (const { url, records } of parsedPages) {
    for (const record of records) {
      const fingerprint = canonicalFingerprint(record);
      const occurrence = occurrenceKey(record);
      registry.canonicalIds[fingerprint] ??= stableId("wcbt");
      registry.occurrenceIds[occurrence] ??= stableId("wcbtv");
      importedRecords.push({
        ...record,
        canonicalId: registry.canonicalIds[fingerprint],
        externalId: registry.occurrenceIds[occurrence],
        canonicalFingerprint: fingerprint,
      });
    }
    pages.push({
      trackKey: manifest.key,
      url,
      pageTitle: records[0].pageTitle,
      examDate: records[0].examDate,
      sha256: records[0].sourcePageSha256,
      selectedQuestionCount: records.length,
      approvedQuestionCount: records.filter(
        (record) => record.auditResolution === "approved",
      ).length,
      heldQuestionCount: records.filter(
        (record) => record.auditResolution === "hold",
      ).length,
    });
  }
}

const occurrenceKeys = importedRecords.map(occurrenceKey);
if (new Set(occurrenceKeys).size !== occurrenceKeys.length) {
  throw new Error("Duplicate welding CBT occurrence keys detected");
}
if (
  importedRecords.some(
    (record) =>
      record.correctIndex !== null &&
      (record.correctIndex < 0 ||
        record.correctIndex >= record.choices.length),
  )
) {
  throw new Error("A correct answer does not map to a stable choice");
}

const trackSummary = WELDING_CBT_TRACK_MANIFESTS.map((manifest) => {
  const records = importedRecords.filter(
    (record) => record.trackKey === manifest.key,
  );
  const trackPages = pages.filter((page) => page.trackKey === manifest.key);
  return {
    trackKey: manifest.key,
    title: manifest.title,
    categoryUrl: manifest.categoryUrl,
    pageCount: trackPages.length,
    selectedQuestionCount: records.length,
    approvedQuestionCount: records.filter(
      (record) => record.auditResolution === "approved",
    ).length,
    heldQuestionCount: records.filter(
      (record) => record.auditResolution === "hold",
    ).length,
    imageRightsHoldCount: records.filter(
      (record) => record.assetStatus === "rights_hold",
    ).length,
  };
});

const output = {
  version: 1,
  generatedAt: SOURCE_AS_OF,
  policy: {
    sourceAuthority: "mirror_capture",
    contentUse: "historical_exam_reproduction",
    promptAndChoices: "exact",
    externalExplanationsUsed: false,
    imagePolicy: "rights_hold",
  },
  categoryDigests,
  trackSummary,
  pages,
  records: importedRecords,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(reportDirectory, { recursive: true });
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
await writeFile(outputPath, `${JSON.stringify(output)}\n`, "utf8");
await writeFile(
  reportPath,
  `${JSON.stringify(
    {
      ...output,
      records: undefined,
      outputSha256: sha256(JSON.stringify(output)),
      canonicalQuestionCount: new Set(
        importedRecords.map((record) => record.canonicalId),
      ).size,
      occurrenceCount: importedRecords.length,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      outputPath,
      reportPath,
      canonicalQuestionCount: new Set(
        importedRecords.map((record) => record.canonicalId),
      ).size,
      occurrenceCount: importedRecords.length,
      tracks: trackSummary,
    },
    null,
    2,
  ),
);
