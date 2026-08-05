import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputDirectory = path.join(
  root,
  "docs/audit-work/cbt-source-reviews/batches",
);
const outputPath = path.join(
  root,
  "src/data/generated/cbt-source-review-overlays.json",
);
const summaryPath = path.join(
  root,
  "docs/audit-work/cbt-source-reviews/summary.json",
);
const reconstruction = JSON.parse(
  await readFile(
    path.join(root, "src/data/generated/cbt-source-reconstruction.json"),
    "utf8",
  ),
);
const sourceById = new Map(
  reconstruction.records.map((record) => [record.externalId, record]),
);
const allowedConfidence = new Set([
  "confirmed",
  "likely",
  "conflict",
  "unknown",
]);
const allowedImageRequirement = new Set([
  "none",
  "required",
  "source_image_missing",
]);
const genericPatterns = [
  /정답과\s*(?:다르|일치하지)/,
  /같은\s*분야(?:의)?\s*용어/,
  /관련\s*용어(?:이지만|라서)/,
  /그럴듯(?:하|해)/,
  /오답(?:이다|입니다)\.?$/,
  /정답(?:이다|입니다)\.?$/,
];

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(summaryPath), { recursive: true });
const fileNames = (await readdir(inputDirectory)).filter((fileName) =>
  fileName.endsWith(".jsonl"),
).sort();
if (!fileNames.length) {
  throw new Error(`No CBT source review JSONL files found in ${inputDirectory}`);
}

const records = [];
const failures = [];
const inputFiles = [];
for (const fileName of fileNames) {
  const filePath = path.join(inputDirectory, fileName);
  const raw = await readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  inputFiles.push({
    fileName,
    recordCount: lines.length,
    sha256: sha256(raw),
  });
  for (const [lineIndex, line] of lines.entries()) {
    let review;
    try {
      review = JSON.parse(line);
    } catch (error) {
      failures.push(`${fileName}:${lineIndex + 1}: invalid JSON`);
      continue;
    }
    const source = sourceById.get(review.externalId);
    const prefix = `${fileName}:${lineIndex + 1}:${review.externalId ?? "unknown"}`;
    if (!source) {
      failures.push(`${prefix}: source reconstruction record missing`);
      continue;
    }
    if (review.sourceIdentitySha256 !== source.source.sourceIdentitySha256) {
      failures.push(`${prefix}: resolved source identity mismatch`);
    }
    if (
      review.registeredIdentitySha256 !==
      source.source.registeredIdentitySha256
    ) {
      failures.push(`${prefix}: registered source identity mismatch`);
    }
    if (!allowedConfidence.has(review.answerConfidence)) {
      failures.push(`${prefix}: invalid answerConfidence`);
    }
    if (!allowedImageRequirement.has(review.imageRequirement)) {
      failures.push(`${prefix}: invalid imageRequirement`);
    }
    if (
      typeof review.directSolution !== "string" ||
      substantiveLength(review.directSolution) < 30
    ) {
      failures.push(`${prefix}: directSolution is not substantive`);
    }
    if (containsGeneric(review.directSolution)) {
      failures.push(`${prefix}: directSolution contains a generic shortcut`);
    }
    if (
      !Array.isArray(review.choiceByChoiceReasons) ||
      review.choiceByChoiceReasons.length !== source.source.exactChoices.length
    ) {
      failures.push(`${prefix}: choiceByChoiceReasons count mismatch`);
    } else {
      const choiceIndices = review.choiceByChoiceReasons.map(
        (reason) => reason.choiceIndex,
      );
      const expectedIndices = source.source.exactChoices.map((_, index) => index);
      if (JSON.stringify(choiceIndices) !== JSON.stringify(expectedIndices)) {
        failures.push(`${prefix}: choice reason indices are not source order`);
      }
      for (const reason of review.choiceByChoiceReasons) {
        if (
          typeof reason.reason !== "string" ||
          substantiveLength(reason.reason) < 18
        ) {
          failures.push(`${prefix}: choice ${reason.choiceIndex} reason is thin`);
        }
        if (containsGeneric(reason.reason)) {
          failures.push(
            `${prefix}: choice ${reason.choiceIndex} uses a generic shortcut`,
          );
        }
      }
    }
    if (
      !Array.isArray(review.conceptKeywords) ||
      review.conceptKeywords.length === 0
    ) {
      failures.push(`${prefix}: conceptKeywords missing`);
    }
    if (
      typeof review.theorySupplement !== "string" ||
      substantiveLength(review.theorySupplement) < 30
    ) {
      failures.push(`${prefix}: theorySupplement is not substantive`);
    }
    if (
      source.imageRequirement === "required" &&
      review.imageRequirement === "none"
    ) {
      failures.push(`${prefix}: required source image was downgraded to none`);
    }
    if (
      review.answerConfidence === "conflict" ||
      review.answerConfidence === "unknown" ||
      review.answerConflictOrMultipleAnswerRisk !== null ||
      review.imageRequirement === "source_image_missing"
    ) {
      if (review.reviewResolution !== "hold") {
        failures.push(`${prefix}: conflict/unknown/image risk escaped HOLD`);
      }
    }

    const reviewGateReasons = [];
    if (review.answerConfidence !== "confirmed") {
      reviewGateReasons.push(`answer_confidence_${review.answerConfidence}`);
    }
    if (review.answerConflictOrMultipleAnswerRisk !== null) {
      reviewGateReasons.push("answer_conflict_or_multiple_answer_risk");
    }
    if (review.imageRequirement === "source_image_missing") {
      reviewGateReasons.push("source_image_missing");
    }
    if (review.reviewResolution !== "reviewed_candidate") {
      reviewGateReasons.push("review_resolution_hold");
    }
    reviewGateReasons.push("single_capture_uncontested_check_required");

    records.push({
      ...review,
      sourceStemSha256: source.source.stemSha256,
      sourceOrderedChoicesSha256: source.source.orderedChoicesSha256,
      sourceAnswerIndex: source.source.answerIndex,
      canonicalId: source.canonicalId,
      theoryLink: source.theoryLink,
      sourceAuthority: source.sourceAuthority,
      sourceDisplayLabel: source.sourceDisplayLabel,
      publicationStatus: "hold",
      publicationHoldReasons: unique(reviewGateReasons),
    });
  }
}

const duplicateIds = duplicates(records.map((record) => record.externalId));
if (duplicateIds.length) {
  failures.push(`duplicate review externalIds: ${duplicateIds.join(", ")}`);
}
if (failures.length) {
  console.error(failures.slice(0, 100).join("\n"));
  process.exit(1);
}

records.sort((left, right) => left.externalId.localeCompare(right.externalId));
const dataset = {
  formatVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceReconstructionGeneratedAt: reconstruction.generatedAt,
  sourceRecordCount: reconstruction.records.length,
  reviewRecordCount: records.length,
  inputFiles,
  counts: {
    answerConfidence: countValues(records.map((record) => record.answerConfidence)),
    reviewResolution: countValues(records.map((record) => record.reviewResolution)),
    publicationStatus: countValues(records.map((record) => record.publicationStatus)),
    imageRequirement: countValues(records.map((record) => record.imageRequirement)),
  },
  records,
};
await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
await writeFile(
  summaryPath,
  `${JSON.stringify(
    {
      generatedAt: dataset.generatedAt,
      sourceRecordCount: dataset.sourceRecordCount,
      reviewRecordCount: dataset.reviewRecordCount,
      inputFiles,
      counts: dataset.counts,
      publicationReady: 0,
      publicationHolds: records.length,
    },
    null,
    2,
  )}\n`,
  "utf8",
);
console.log(
  `CBT source reviews imported: ${records.length} identity-bound records; publicationReady=0`,
);

function containsGeneric(value) {
  return genericPatterns.some((pattern) => pattern.test(String(value ?? "")));
}

function substantiveLength(value) {
  return String(value ?? "").replace(/\s+/g, "").length;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function unique(values) {
  return [...new Set(values)];
}

function duplicates(values) {
  const seen = new Set();
  const result = new Set();
  for (const value of values) {
    if (seen.has(value)) result.add(value);
    seen.add(value);
  }
  return [...result].sort();
}

function countValues(values) {
  return values.reduce((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}
