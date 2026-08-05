import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const dataset = JSON.parse(await readFile("src/data/generated/cbt-source-reconstruction.json", "utf8"));
const outputPath = "docs/audit-work/cbt-source-reconstruction/validation.json";
const failures = [];
const variantsById = new Map(content.variants.map((variant) => [variant.externalId, variant]));
const questionsById = new Map(content.questions.map((question) => [question.id, question]));

if (dataset.formatVersion !== 1) failures.push("formatVersion must be 1");
if (dataset.records.length !== content.variants.length) {
  failures.push(`record count mismatch: ${dataset.records.length} != ${content.variants.length}`);
}
if (dataset.sessions.length !== 27) failures.push(`session count mismatch: ${dataset.sessions.length} != 27`);
if (dataset.sourceCounts.variants !== content.variants.length) failures.push("sourceCounts.variants mismatch");
if (dataset.sourceCounts.selectedQuestionsCaptured !== content.variants.length) {
  failures.push(`selected source capture incomplete: ${dataset.sourceCounts.selectedQuestionsCaptured} != ${content.variants.length}`);
}
if (dataset.sourceCounts.registeredSourceUrls !== 27) failures.push("registeredSourceUrls must be 27");
if (dataset.sourceCounts.resolvedSourceUrls !== 27) failures.push("resolvedSourceUrls must be 27");

assertUnique(dataset.records.map((record) => record.externalId), "externalId", failures);
assertUnique(
  dataset.records.map((record) => `${record.registeredSourceUrl}\u0000${record.questionNumber}`),
  "registered source URL + question number",
  failures,
);
assertUnique(
  dataset.records.map((record) => record.source?.registeredIdentitySha256).filter(Boolean),
  "registered source identity",
  failures,
);
assertUnique(
  dataset.records.map((record) => record.source?.sourceIdentitySha256).filter(Boolean),
  "resolved source identity",
  failures,
);

for (const session of dataset.sessions) {
  if (session.duplicateSelectedQuestionNumbers.length) {
    failures.push(`${session.sessionKey}: duplicate selected question numbers ${session.duplicateSelectedQuestionNumbers.join(",")}`);
  }
  if (session.missingSelectedQuestionNumbers.length) {
    failures.push(`${session.sessionKey}: missing selected source questions ${session.missingSelectedQuestionNumbers.join(",")}`);
  }
  if (session.selectedCapturedCount !== session.expectedVariantCount) {
    failures.push(`${session.sessionKey}: selected capture count mismatch`);
  }
  if (session.examTrackKey === null) failures.push(`${session.sessionKey}: exam track unresolved`);
  if (!/^https:\/\/cbtbank\.kr\/exam\/(?:de|cet)\d{8}$/.test(session.resolvedSourceUrl)) {
    failures.push(`${session.sessionKey}: unexpected resolved source URL ${session.resolvedSourceUrl}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(session.pageExamDate ?? "")) {
    failures.push(`${session.sessionKey}: day-precision exam date missing`);
  }
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
  if (record.year !== variant.year || record.sessionLabel !== variant.sessionLabel) {
    failures.push(`${record.externalId}: year/session identity changed`);
  }
  if (record.sourceAuthority !== "mirror_capture") failures.push(`${record.externalId}: invalid source authority`);
  if (record.sourceDisplayLabel !== "복원 정답") failures.push(`${record.externalId}: invalid answer display label`);
  if (record.sourceCaptureStatus !== "captured" || !record.source) {
    failures.push(`${record.externalId}: source capture missing`);
    continue;
  }
  if (!record.source.exactStem.trim()) failures.push(`${record.externalId}: empty source stem`);
  if (record.source.exactChoices.length < 4) failures.push(`${record.externalId}: fewer than four source choices`);
  if (record.source.stemSha256 !== sha256(record.source.exactStem)) failures.push(`${record.externalId}: stem SHA mismatch`);
  if (record.source.orderedChoicesSha256 !== sha256(JSON.stringify(record.source.exactChoices))) {
    failures.push(`${record.externalId}: choices SHA mismatch`);
  }
  const expectedResolvedIdentity = sha256([
    record.resolvedSourceUrl,
    String(record.questionNumber),
    record.source.stemSha256,
    record.source.orderedChoicesSha256,
  ].join("\u0000"));
  const expectedRegisteredIdentity = sha256([
    record.registeredSourceUrl,
    String(record.questionNumber),
    record.source.stemSha256,
    record.source.orderedChoicesSha256,
  ].join("\u0000"));
  if (record.source.sourceIdentitySha256 !== expectedResolvedIdentity) failures.push(`${record.externalId}: resolved identity SHA mismatch`);
  if (record.source.registeredIdentitySha256 !== expectedRegisteredIdentity) failures.push(`${record.externalId}: registered identity SHA mismatch`);

  if (record.stableChoiceIds) {
    if (record.stableChoiceIds.length !== record.source.exactChoices.length) {
      failures.push(`${record.externalId}: stable choice ID count mismatch`);
    }
    if (new Set(record.stableChoiceIds).size !== record.stableChoiceIds.length) {
      failures.push(`${record.externalId}: duplicate stable choice IDs`);
    }
    if (question && record.stableChoiceIds.some((choiceId) => !question.choices.some((choice) => choice.id === choiceId))) {
      failures.push(`${record.externalId}: foreign stable choice ID`);
    }
  }

  if (record.resolution === "restored_candidate") {
    if (record.holdReasons.length) failures.push(`${record.externalId}: candidate contains HOLD reasons`);
    if (record.stableChoiceMappingStatus !== "current_text_match") {
      failures.push(`${record.externalId}: candidate choice mapping is not text-verified`);
    }
    if (record.answerAlignmentStatus !== "match") failures.push(`${record.externalId}: candidate answer alignment is not matched`);
    if (!record.stableChoiceIds || record.source.answerIndex === null) failures.push(`${record.externalId}: candidate answer mapping incomplete`);
    if (record.imageRequirement === "source_image_missing" || record.imageStatus === "unreachable") {
      failures.push(`${record.externalId}: candidate has unresolved source image`);
    }
  } else if (record.resolution !== "hold") {
    failures.push(`${record.externalId}: unknown resolution ${record.resolution}`);
  }

  if ((record.answerAlignmentStatus === "conflict" || record.source.answerIndex === null) && record.resolution !== "hold") {
    failures.push(`${record.externalId}: answer conflict escaped HOLD`);
  }
  if ((record.imageRequirement === "source_image_missing" || record.imageStatus === "unreachable") && record.resolution !== "hold") {
    failures.push(`${record.externalId}: image failure escaped HOLD`);
  }
}

const validation = {
  generatedAt: new Date().toISOString(),
  status: failures.length ? "FAIL" : "PASS",
  counts: {
    variants: content.variants.length,
    records: dataset.records.length,
    sessions: dataset.sessions.length,
    restoredCandidates: dataset.records.filter((record) => record.resolution === "restored_candidate").length,
    holds: dataset.records.filter((record) => record.resolution === "hold").length,
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
  const unique = new Set(values);
  if (unique.size !== values.length) failures.push(`${label} contains ${values.length - unique.size} duplicates`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
