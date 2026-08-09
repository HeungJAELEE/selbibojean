import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { createPracticePresentations } from "../src/lib/content/practice-presentations";
import {
  countPublicOriginalVariantsBySubject,
  getPublicOriginalVariantYears,
  getSafeOriginalsByQuestion,
} from "../src/lib/content/practice-presentations";
import { buildRuntimeContent } from "../src/lib/content/runtime-content";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "../src/lib/domain/practice";
import type { GeneratedContent } from "../src/lib/domain/types";

const privateOutputDirectory = path.join(process.cwd(), ".runtime-assets", "data");
const workerAssetDirectory = path.join(process.cwd(), "public", "data");
const privateBusanMediaDirectory = path.join(
  process.cwd(),
  "assets",
  "private",
  "practical",
  "test-centers",
  "busan-kopo",
);
const publicBusanMediaDirectory = path.join(
  process.cwd(),
  "public",
  "practical",
  "test-centers",
  "busan-kopo",
);
const sourceFile = path.join(process.cwd(), "src", "data", "generated", "content.json");
const outputDirectories = [privateOutputDirectory, workerAssetDirectory];
const subjectIds = ["subject-1", "subject-2", "subject-3", "subject-4"] as const;

await Promise.all(
  outputDirectories.map(async (outputDirectory) => {
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });
  }),
);

const source = await readFile(sourceFile);

// Fail the build before emitting an asset when the canonical source is not valid JSON.
const generatedContent = JSON.parse(source.toString("utf8")) as GeneratedContent;
const runtimeContent = buildRuntimeContent(generatedContent);
const runtimeSource = Buffer.from(JSON.stringify(runtimeContent));

const publishedBySubject = countPublicOriginalVariantsBySubject(
  runtimeContent.questions,
  runtimeContent.variants,
);
const safeOriginals = getSafeOriginalsByQuestion(
  runtimeContent.questions,
  runtimeContent.variants,
);
const questionById = new Map(
  runtimeContent.questions.map((question) => [question.id, question]),
);
const safeOriginalQuestionIds = new Set(safeOriginals.keys());
const availableBySubject = Object.fromEntries(
  runtimeContent.subjects.map((subject) => [
    subject.id,
    new Set(
      runtimeContent.questions
        .filter(
          (question) =>
            question.subjectId === subject.id &&
            (isPublishableQuestion(question) ||
              safeOriginalQuestionIds.has(question.id)),
        )
        .map((question) => question.id),
    ).size,
  ]),
);
const availableYears = getPublicOriginalVariantYears(
  runtimeContent.questions,
  runtimeContent.variants,
);
const availableByYearRange: Record<string, Record<string, number>> = {};
const publishedByYearRange: Record<string, Record<string, number>> = {};
for (const from of availableYears) {
  for (const to of availableYears) {
    if (from > to) continue;
    const rangeCounts = countPublicOriginalVariantsBySubject(
      runtimeContent.questions,
      runtimeContent.variants,
      from,
      to,
    );
    const idsBySubject = new Map<string, Set<string>>();
    for (const [questionId, variants] of safeOriginals) {
      if (
        !variants.some(
          (variant) =>
            variant.year !== null && variant.year >= from && variant.year <= to,
        )
      ) continue;
      const subjectId = questionById.get(questionId)?.subjectId;
      if (!subjectId) continue;
      const ids = idsBySubject.get(subjectId) ?? new Set<string>();
      ids.add(questionId);
      idsBySubject.set(subjectId, ids);
    }
    availableByYearRange[`${from}-${to}`] = Object.fromEntries(
      runtimeContent.subjects.map((subject) => [
        subject.id,
        idsBySubject.get(subject.id)?.size ?? 0,
      ]),
    );
    publishedByYearRange[`${from}-${to}`] = Object.fromEntries(
      runtimeContent.subjects.map((subject) => [
        subject.id,
        rangeCounts[subject.id] ?? 0,
      ]),
    );
  }
}
const mockSetupMetadata = {
  subjects: runtimeContent.subjects,
  availableBySubject,
  publishedBySubject,
  availableYears,
  availableByYearRange,
  publishedByYearRange,
};

const compressed = gzipSync(runtimeSource, { level: 9 });
const sourceSha256 = createHash("sha256").update(runtimeSource).digest("hex");
const metadata = {
  formatVersion: 1,
  encoding: "gzip",
  sourceSha256,
  uncompressedBytes: runtimeSource.byteLength,
  compressedBytes: compressed.byteLength,
} as const;

await Promise.all(
  outputDirectories.flatMap((outputDirectory) => [
    writeFile(path.join(outputDirectory, "content.bin"), compressed),
    writeFile(
      path.join(outputDirectory, "content.meta.json"),
      `${JSON.stringify(metadata)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(outputDirectory, "mock-setup.json"),
      `${JSON.stringify(mockSetupMetadata)}\n`,
      "utf8",
    ),
  ]),
);

for (const subjectId of subjectIds) {
  const subjectQuestions = runtimeContent.questions.filter(
    (question) =>
      question.subjectId === subjectId && isPublishableQuestion(question),
  );
  const originalQuestions = createPracticePresentations(
    subjectQuestions,
    runtimeContent.variants,
    100,
    20260729,
  ).filter((question) => question.provenance.original);
  const mockQuestions = createPracticePresentations(
    subjectQuestions,
    runtimeContent.variants,
    0,
    20260729,
  );
  const subjectContent = {
    subjects: runtimeContent.subjects,
    conceptGroups: runtimeContent.conceptGroups.filter(
      (group) => group.subjectId === subjectId,
    ),
    lessons: runtimeContent.lessons.filter(
      (lesson) =>
        lesson.subjectId === subjectId && isPublishableLesson(lesson),
    ).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subjectId: lesson.subjectId,
      conceptGroupId: lesson.conceptGroupId,
      contentRole: lesson.contentRole,
    })),
    questions: [...originalQuestions, ...mockQuestions],
  };
  const subjectSource = Buffer.from(JSON.stringify(subjectContent));
  const subjectCompressed = gzipSync(subjectSource, { level: 9 });
  const subjectMetadata = {
    formatVersion: 1,
    encoding: "gzip",
    sourceSha256: createHash("sha256").update(subjectSource).digest("hex"),
    uncompressedBytes: subjectSource.byteLength,
    compressedBytes: subjectCompressed.byteLength,
  } as const;
  const baseName = `content-${subjectId}`;

  await Promise.all(
    outputDirectories.flatMap((outputDirectory) => [
      writeFile(
        path.join(outputDirectory, `${baseName}.bin`),
        subjectCompressed,
      ),
      writeFile(
        path.join(outputDirectory, `${baseName}.meta.json`),
        `${JSON.stringify(subjectMetadata)}\n`,
        "utf8",
      ),
    ]),
  );
}

// Stage gated public media only after every other preparation step succeeds.
// The owning build/dev wrapper removes this directory in a finally block.
await rm(publicBusanMediaDirectory, { recursive: true, force: true });
if (process.env.ENABLE_BUSAN_KOPO_MEDIA === "true") {
  await mkdir(path.dirname(publicBusanMediaDirectory), { recursive: true });
  await cp(privateBusanMediaDirectory, publicBusanMediaDirectory, {
    recursive: true,
  });
  console.log("Staged release-approved Busan KOPO media.");
} else {
  console.log("Busan KOPO media remains private (release flag is off).");
}

const ratio = ((compressed.byteLength / runtimeSource.byteLength) * 100).toFixed(1);
console.log(
  `Prepared server-only learning content: ${runtimeSource.byteLength} bytes -> ${compressed.byteLength} gzip bytes (${ratio}%).`,
);
console.log(
  "Runtime content staged for the internal ASSETS binding; the Worker blocks external /data requests.",
);
