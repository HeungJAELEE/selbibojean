import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const dataset = JSON.parse(await readFile("src/data/generated/cbt-source-reconstruction.json", "utf8"));
const outputPath = "docs/audit-work/cbt-source-reconstruction/validation.json";
const failures = [];
const variantsById = new Map(content.variants.map((variant) => [variant.externalId, variant]));
const questionsById = new Map(content.questions.map((question) => [question.id, question]));
const safeMappingStatuses = new Set(["source_text_match", "source_current_text_match"]);

if (dataset.formatVersion !== 1) failures.push("formatVersion must be 1");
if (dataset.records.length !== content.variants.length) failures.push(`record count mismatch: ${dataset.records.length} != ${content.variants.length}`);
if (dataset.sessions.length !== 27) failures.push(`session count mismatch: ${dataset.sessions.length} != 27`);
if (dataset.sourceCounts.selectedQuestionsCaptured !== content.variants.length) failures.push("not all selected variants were captured");
if (dataset.sourceCounts.registeredSourceUrls !== 27 || dataset.sourceCounts.resolvedSourceUrls !== 27) failures.push("source URL exact-set mismatch");
if (dataset.sourceCounts.sourceImages !== dataset.sourceCounts.reachableSourceImages) failures.push("one or more required source images are unreachable");

assertUnique(dataset.records.map((record) => record.externalId), "externalId", failures);
assertUnique(dataset.records.map((record) => `${record.registeredSourceUrl}\u0000${record.questionNumber}`), "registered source URL + question number", failures);
assertUnique(dataset.records.map((record) => record.source?.registeredIdentitySha256).filter(Boolean), "registered identity", failures);
assertUnique(dataset.records.map((record) => record.source?.sourceIdentitySha256).filter(Boolean), "resolved identity", failures);

for (const session of dataset.sessions) {
  if (session.duplicateSelectedQuestionNumbers.length) failures.push(`${session.sessionKey}: duplicate question numbers`);
  if (session.missingSelectedQuestionNumbers.length) failures.push(`${session.sessionKey}: missing selected source questions`);
  if (session.selectedCapturedCount !== session.expectedVariantCount) failures.push(`${session.sessionKey}: capture count mismatch`);
  if (!session.examTrackKey) failures.push(`${session.sessionKey}: exam track unresolved`);
  if (!/^https:\/\/cbtbank\.kr\/exam\/(?:de|cet)\d{8}$/.test(session.resolvedSourceUrl)) failures.push(`${session.sessionKey}: unexpected resolved source URL`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(session.pageExamDate ?? "")) failures.push(`${session.sessionKey}: day-precision exam date missing`);
  if (session.restoredCandidateCount + session.holdCount !== session.expectedVariantCount) failures.push(`${session.sessionKey}: resolution count mismatch`);
}

for (const record of dataset.records) {
  const variant = variantsById.get(record.externalId);
  const question = questionsById.get(record.canonicalId);
  if (!variant) {
    failures.push(`${record.externalId}: unknown variant`);
    continue;
  }
  if (!question) failures.push(`${record.externalId}: unknown canonical question`);
  if (record.canonicalId !== variant.canonicalId) failures.push(`${record.externalId}: canonical ID changed`);
  if (record.questionNumber !== variant.questionNumber) failures.push(`${record.externalId}: question number changed`);
  if (record.registeredSourceUrl !== variant.sourceUrl) failures.push(`${record.externalId}: registered source URL changed`);
  if (record.year !== variant.year || record.sessionLabel !== variant.sessionLabel) failures.push(`${record.externalId}: session identity changed`);
  if (record.sourceAuthority !== "mirror_capture" || record.sourceDisplayLabel !== "복원 정답") failures.push(`${record.externalId}: provenance label invalid`);
  if (record.sourceCaptureStatus !== "captured" || !record.source) {
    failures.push(`${record.externalId}: source capture missing`);
    continue;
  }
  if (!record.source.exactStem.trim() || record.source.exactChoices.length < 4) failures.push(`${record.externalId}: incomplete source question`);
  if (record.source.stemSha256 !== sha256(record.source.exactStem)) failures.push(`${record.externalId}: stem SHA mismatch`);
  if (record.source.orderedChoicesSha256 !== sha256(JSON.stringify(record.source.exactChoices))) failures.push(`${record.externalId}: choices SHA mismatch`);
  if (record.source.sourceIdentitySha256 !== sha256([record.resolvedSourceUrl, String(record.questionNumber), record.source.stemSha256, record.source.orderedChoicesSha256].join("\u0000"))) failures.push(`${record.externalId}: resolved identity mismatch`);
  if (record.source.registeredIdentitySha256 !== sha256([record.registeredSourceUrl, String(record.questionNumber), record.source.stemSha256, record.source.orderedChoicesSha256].join("\u0000"))) failures.push(`${record.externalId}: registered identity mismatch`);

  if (record.resolution === "restored_candidate") {
    if (record.holdReasons.length) failures.push(`${record.externalId}: candidate contains HOLD reasons`);
    if (!safeMappingStatuses.has(record.stableChoiceMappingStatus)) failures.push(`${record.externalId}: candidate mapping is not source-text verified`);
    if (!Array.isArray(record.stableChoiceIds) || record.stableChoiceIds.length !== record.source.exactChoices.length) failures.push(`${record.externalId}: candidate stable choice IDs missing`);
    if (record.answerAlignmentStatus !== "match" || record.source.answerIndex === null) failures.push(`${record.externalId}: candidate answer mapping incomplete`);
    if (record.imageRequirement === "source_image_missing" || record.imageStatus === "unreachable") failures.push(`${record.externalId}: candidate source image unresolved`);
  } else if (record.resolution === "hold") {
    if (!record.holdReasons.length) failures.push(`${record.externalId}: HOLD without reason`);
  } else {
    failures.push(`${record.externalId}: unknown resolution`);
  }

  if ((record.answerAlignmentStatus === "conflict" || record.source.answerIndex === null) && record.resolution !== "hold") failures.push(`${record.externalId}: answer conflict escaped HOLD`);
  if (!safeMappingStatuses.has(record.stableChoiceMappingStatus) && record.resolution !== "hold") failures.push(`${record.externalId}: unsafe choice mapping escaped HOLD`);
  if ((record.imageRequirement === "source_image_missing" || record.imageStatus === "unreachable") && record.resolution !== "hold") failures.push(`${record.externalId}: image issue escaped HOLD`);
}

if (dataset.sourceCounts.restoredCandidates + dataset.sourceCounts.holds !== content.variants.length) failures.push("global resolution count mismatch");

const validation = {
  generatedAt: new Date().toISOString(),
  status: failures.length ? "FAIL" : "PASS",
  counts: {
    variants: content.variants.length,
    records: dataset.records.length,
    sessions: dataset.sessions.length,
    restoredCandidates: dataset.sourceCounts.restoredCandidates,
    holds: dataset.sourceCounts.holds,
    sourceImages: dataset.sourceCounts.sourceImages,
    reachableSourceImages: dataset.sourceCounts.reachableSourceImages,
  },
  failures,
};
await writeFile(outputPath, `${JSON.stringify(validation, null, 2)}\n`, "utf8");
if (failures.length) {
  console.error(failures.slice(0, 100).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify(validation));

function assertUnique(values, label, failures) {
  if (new Set(values).size !== values.length) failures.push(`${label} contains duplicates`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
