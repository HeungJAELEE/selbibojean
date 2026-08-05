import { readFile, writeFile } from "node:fs/promises";

const DATASET_PATH = "src/data/generated/cbt-source-reconstruction.json";
const AUDIT_DIR = "docs/audit-work/cbt-source-reconstruction";
const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const dataset = JSON.parse(await readFile(DATASET_PATH, "utf8"));
const questionsById = new Map(content.questions.map((question) => [question.id, question]));

for (const record of dataset.records) {
  const question = questionsById.get(record.canonicalId);
  record.variantChoiceIds = record.source.exactChoices.map(
    (_, index) => `${record.externalId}-source-c${index + 1}`,
  );
  record.theoryLink = question
    ? {
        lessonId: question.lessonId,
        lessonAnchor: question.lessonAnchor,
        conceptGroupId: question.conceptGroupId,
        conceptId: question.conceptId,
      }
    : null;
  record.canonical = question
    ? {
        stemFidelity: classifyTextFidelity(record.source.exactStem, question.stem),
        orderedChoicesFidelity: classifyChoicesFidelity(
          record.source.exactChoices,
          question.choices
            .slice()
            .sort((left, right) => left.order - right.order)
            .map((choice) => choice.text),
        ),
        answerChoiceId: question.correctChoiceId,
      }
    : null;
  record.answerEvidence = "unknown";
  record.publicationStatus = "hold";
  record.publicationHoldReasons = unique([
    "source_answer_review_required",
    "source_direct_solution_review_required",
    "source_choice_feedback_review_required",
    "source_theory_link_review_required",
    ...(record.stableChoiceMappingStatus === "unavailable"
      ? ["variant_specific_choice_contract_required"]
      : []),
    ...record.holdReasons,
  ]);
}

dataset.sourceCounts.publicationReady = 0;
dataset.sourceCounts.publicationHolds = dataset.records.length;
dataset.sourceCounts.variantSpecificChoiceContractRequired = dataset.records.filter(
  (record) => record.publicationHoldReasons.includes("variant_specific_choice_contract_required"),
).length;
dataset.sourceCounts.canonicalStemExact = dataset.records.filter(
  (record) => record.canonical?.stemFidelity === "exact",
).length;
dataset.sourceCounts.canonicalStemNormalizedExact = dataset.records.filter(
  (record) => record.canonical?.stemFidelity === "normalized_exact",
).length;
dataset.sourceCounts.canonicalChoicesExact = dataset.records.filter(
  (record) => record.canonical?.orderedChoicesFidelity === "exact",
).length;
dataset.sourceCounts.canonicalChoicesNormalizedExact = dataset.records.filter(
  (record) => record.canonical?.orderedChoicesFidelity === "normalized_exact",
).length;

const summaryPath = `${AUDIT_DIR}/publication-summary.json`;
const summary = {
  generatedAt: dataset.generatedAt,
  variants: dataset.records.length,
  publicationReady: dataset.sourceCounts.publicationReady,
  publicationHolds: dataset.sourceCounts.publicationHolds,
  variantSpecificChoiceContractRequired:
    dataset.sourceCounts.variantSpecificChoiceContractRequired,
  canonicalFidelity: {
    stemExact: dataset.sourceCounts.canonicalStemExact,
    stemNormalizedExact: dataset.sourceCounts.canonicalStemNormalizedExact,
    stemMismatch:
      dataset.records.length -
      dataset.sourceCounts.canonicalStemExact -
      dataset.sourceCounts.canonicalStemNormalizedExact,
    choicesExact: dataset.sourceCounts.canonicalChoicesExact,
    choicesNormalizedExact: dataset.sourceCounts.canonicalChoicesNormalizedExact,
    choicesMismatch:
      dataset.records.length -
      dataset.sourceCounts.canonicalChoicesExact -
      dataset.sourceCounts.canonicalChoicesNormalizedExact,
  },
  publicationHoldReasonCounts: countValues(
    dataset.records.flatMap((record) => record.publicationHoldReasons),
  ),
};

await writeFile(DATASET_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary));

function classifyTextFidelity(source, current) {
  if (source === current) return "exact";
  return normalize(source) === normalize(current) ? "normalized_exact" : "mismatch";
}

function classifyChoicesFidelity(source, current) {
  if (JSON.stringify(source) === JSON.stringify(current)) return "exact";
  return JSON.stringify(source.map(normalize)) === JSON.stringify(current.map(normalize))
    ? "normalized_exact"
    : "mismatch";
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .trim();
}

function unique(values) {
  return [...new Set(values)];
}

function countValues(values) {
  return values.reduce((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}
