import { readFile } from "node:fs/promises";

const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const dataset = JSON.parse(await readFile("src/data/generated/cbt-source-reconstruction.json", "utf8"));
const questionsById = new Map(content.questions.map((question) => [question.id, question]));
const failures = [];

for (const record of dataset.records) {
  const question = questionsById.get(record.canonicalId);
  if (!question) {
    failures.push(`${record.externalId}: canonical question missing`);
    continue;
  }
  if (record.publicationStatus !== "hold") failures.push(`${record.externalId}: unreviewed reconstruction escaped HOLD`);
  if (record.answerEvidence !== "unknown") failures.push(`${record.externalId}: source answer gained unsupported evidence`);
  if (!record.publicationHoldReasons.includes("source_answer_review_required")) failures.push(`${record.externalId}: answer review gate missing`);
  if (!record.publicationHoldReasons.includes("source_direct_solution_review_required")) failures.push(`${record.externalId}: solution review gate missing`);
  if (!record.publicationHoldReasons.includes("source_choice_feedback_review_required")) failures.push(`${record.externalId}: choice feedback review gate missing`);
  if (!record.publicationHoldReasons.includes("source_theory_link_review_required")) failures.push(`${record.externalId}: theory review gate missing`);
  if (record.theoryLink?.lessonId !== question.lessonId || record.theoryLink?.conceptId !== question.conceptId || record.theoryLink?.conceptGroupId !== question.conceptGroupId || record.theoryLink?.lessonAnchor !== question.lessonAnchor) failures.push(`${record.externalId}: theory identity changed`);
  if (record.variantChoiceIds.length !== record.source.exactChoices.length || new Set(record.variantChoiceIds).size !== record.variantChoiceIds.length) failures.push(`${record.externalId}: source choice IDs invalid`);
  if (record.variantChoiceIds.some((choiceId, index) => choiceId !== `${record.externalId}-source-c${index + 1}`)) failures.push(`${record.externalId}: source choice ID is not deterministic`);
  if (record.stableChoiceMappingStatus === "unavailable" && !record.publicationHoldReasons.includes("variant_specific_choice_contract_required")) failures.push(`${record.externalId}: variant-specific choice contract gate missing`);
}

if (dataset.sourceCounts.publicationReady !== 0 || dataset.sourceCounts.publicationHolds !== dataset.records.length) failures.push("global publication HOLD counts invalid");
if (failures.length) {
  console.error(failures.slice(0, 100).join("\n"));
  process.exit(1);
}
console.log(`CBT reconstruction publication gate verified: ${dataset.records.length} HOLD records`);
