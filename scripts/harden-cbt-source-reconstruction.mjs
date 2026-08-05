import { readFile, writeFile } from "node:fs/promises";

const DATASET_PATH = "src/data/generated/cbt-source-reconstruction.json";
const AUDIT_DIR = "docs/audit-work/cbt-source-reconstruction";
const content = JSON.parse(await readFile("src/data/generated/content.json", "utf8"));
const dataset = JSON.parse(await readFile(DATASET_PATH, "utf8"));
const questionsById = new Map(content.questions.map((question) => [question.id, question]));
const variantsById = new Map(content.variants.map((variant) => [variant.externalId, variant]));

for (const record of dataset.records) {
  const canonical = questionsById.get(record.canonicalId);
  const variant = variantsById.get(record.externalId);
  const mapping = deriveTextVerifiedMapping(record.source?.exactChoices, variant?.choices, canonical?.choices);
  const preservedReasons = record.holdReasons.filter((reason) =>
    reason !== "stable_choice_mapping_missing"
    && reason !== "source_answer_canonical_conflict"
  );

  record.stableChoiceIds = mapping.choiceIds;
  record.stableChoiceMappingStatus = mapping.status;
  if (!mapping.choiceIds) preservedReasons.push("stable_choice_mapping_missing");

  record.sourceAnswerChoiceId =
    record.source?.answerIndex !== null && record.source?.answerIndex !== undefined && mapping.choiceIds
      ? mapping.choiceIds[record.source.answerIndex] ?? null
      : null;
  record.answerAlignmentStatus =
    !canonical || record.source?.answerIndex === null || record.source?.answerIndex === undefined || !mapping.choiceIds
      ? "unknown"
      : record.sourceAnswerChoiceId === canonical.correctChoiceId
        ? "match"
        : "conflict";
  if (record.answerAlignmentStatus === "conflict") preservedReasons.push("source_answer_canonical_conflict");

  record.holdReasons = unique(preservedReasons);
  record.resolution = record.holdReasons.length ? "hold" : "restored_candidate";
}

for (const session of dataset.sessions) {
  const records = dataset.records.filter((record) => record.registeredSourceUrl === session.registeredSourceUrl);
  session.restoredCandidateCount = records.filter((record) => record.resolution === "restored_candidate").length;
  session.holdCount = records.filter((record) => record.resolution === "hold").length;
}

dataset.sourceCounts.restoredCandidates = dataset.records.filter((record) => record.resolution === "restored_candidate").length;
dataset.sourceCounts.holds = dataset.records.filter((record) => record.resolution === "hold").length;

const holdReasonCounts = countValues(dataset.records.flatMap((record) => record.holdReasons));
const summary = {
  generatedAt: dataset.generatedAt,
  ...dataset.sourceCounts,
  holdReasonCounts,
  fidelity: {
    stem: countValues(dataset.records.map((record) => record.current.stemFidelity)),
    choices: countValues(dataset.records.map((record) => record.current.choicesFidelity)),
    answers: countValues(dataset.records.map((record) => String(record.current.answerMatchesSource))),
  },
  stableChoiceMapping: countValues(dataset.records.map((record) => record.stableChoiceMappingStatus)),
  answerAlignment: countValues(dataset.records.map((record) => record.answerAlignmentStatus)),
  sessions: dataset.sessions,
};
const mismatchQueue = dataset.records.filter((record) =>
  record.resolution === "hold"
  || record.current.stemFidelity === "mismatch"
  || record.current.choicesFidelity === "mismatch"
  || record.current.answerMatchesSource === false,
);

await writeFile(DATASET_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
await writeFile(`${AUDIT_DIR}/session-summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(
  `${AUDIT_DIR}/mismatch-queue.jsonl`,
  `${mismatchQueue.map((record) => JSON.stringify(record)).join("\n")}\n`,
  "utf8",
);
console.log(JSON.stringify({
  restoredCandidates: dataset.sourceCounts.restoredCandidates,
  holds: dataset.sourceCounts.holds,
  stableChoiceMapping: summary.stableChoiceMapping,
  answerAlignment: summary.answerAlignment,
}));

function deriveTextVerifiedMapping(sourceChoices, currentChoices, canonicalChoices) {
  if (!Array.isArray(sourceChoices) || !Array.isArray(currentChoices) || !Array.isArray(canonicalChoices)) {
    return { choiceIds: null, status: "unavailable" };
  }
  if (sourceChoices.length !== canonicalChoices.length || currentChoices.length !== canonicalChoices.length) {
    return { choiceIds: null, status: "unavailable" };
  }

  const direct = mapUnique(sourceChoices, canonicalChoices, (choice) => choice.text);
  if (direct) return { choiceIds: direct.map((choice) => choice.id), status: "source_text_match" };

  const currentToCanonical = mapUnique(currentChoices, canonicalChoices, (choice) => choice.text);
  if (!currentToCanonical) return { choiceIds: null, status: "unavailable" };
  const sourceToCurrent = mapUnique(sourceChoices, currentChoices, (choice) => choice);
  if (!sourceToCurrent) return { choiceIds: null, status: "unavailable" };

  const currentIdByText = new Map(
    currentChoices.map((choice, index) => [normalize(choice), currentToCanonical[index].id]),
  );
  const mappedIds = sourceChoices.map((choice) => currentIdByText.get(normalize(choice)) ?? null);
  if (mappedIds.some((choiceId) => !choiceId) || new Set(mappedIds).size !== mappedIds.length) {
    return { choiceIds: null, status: "unavailable" };
  }
  return { choiceIds: mappedIds, status: "source_current_text_match" };
}

function mapUnique(sourceValues, candidates, candidateText) {
  const used = new Set();
  const result = [];
  for (const source of sourceValues) {
    const normalizedSource = normalize(source);
    const matches = candidates.filter((candidate, index) =>
      !used.has(index) && normalize(candidateText(candidate)) === normalizedSource,
    );
    if (matches.length !== 1) return null;
    const match = matches[0];
    const index = candidates.indexOf(match);
    used.add(index);
    result.push(match);
  }
  return result.length === sourceValues.length ? result : null;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[\s·ㆍ,.?()\[\]{}'"/\\_\-:;]+/g, "");
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
