import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const manifestPath = new URL(
  "../src/data/generated/cbt-reviewed-variants.json",
  import.meta.url,
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const countByStatus = (records) =>
  records.reduce((counts, record) => {
    const status = record.review.runtimeStatus;
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
const sha256 = (value) =>
  createHash("sha256").update(value, "utf8").digest("hex");
const sourceTextContracts = (records) =>
  records
    .map((record) => ({
      externalId: record.externalId,
      stem: record.stem,
      choices: record.choices,
      stemSha256: record.source.stemSha256,
      orderedChoicesSha256: record.source.orderedChoicesSha256,
      registeredSourceUrl: record.source.registeredSourceUrl,
      resolvedSourceUrl: record.source.resolvedSourceUrl,
      questionNumber: record.questionNumber,
    }))
    .sort((left, right) => left.externalId.localeCompare(right.externalId));

const before = countByStatus(manifest.records);
const sourceTextContractsBefore = JSON.stringify(
  sourceTextContracts(manifest.records),
);
const alreadyPromoted =
  before.published === 2267 &&
  (before.candidate ?? 0) === 0 &&
  before.hold === 98 &&
  before.choice_conflict === 19;
const promotable =
  before.candidate === 2267 &&
  (before.published ?? 0) === 0 &&
  before.hold === 98 &&
  before.choice_conflict === 19;

if (!alreadyPromoted && !promotable) {
  throw new Error(
    `Unexpected reviewed CBT state counts: ${JSON.stringify(before)}`,
  );
}

const preservedExcluded = manifest.records
  .filter((record) =>
    ["hold", "choice_conflict"].includes(record.review.runtimeStatus),
  )
  .map((record) => JSON.stringify(record));

if (promotable) {
  for (const record of manifest.records) {
    if (record.review.runtimeStatus !== "candidate") continue;
    record.review.runtimeStatus = "published";
  }
}

// The import disposition is historical audit metadata. Runtime publication is
// represented only by review.runtimeStatus and the release receipt below.
for (const record of manifest.records) {
  if (record.review.runtimeStatus === "published") {
    record.migration.runtimeDisposition = "PUBLICATION_CANDIDATE";
  }
}

const promotedIds = manifest.records
  .filter((record) => record.review.runtimeStatus === "published")
  .map((record) => record.externalId)
  .sort();
manifest.generatedAt = "2026-08-09T00:00:00+09:00";
manifest.publicationRelease = {
  releaseId: "reviewed-cbt-publication-2026-08-09",
  decisionAuthority: "user_explicit_approval",
  approvedAt: "2026-08-09T00:00:00+09:00",
  sourceState: "candidate",
  targetState: "published",
  reviewedRecordCount: 2384,
  publishedCount: 2267,
  holdCount: 98,
  choiceConflictCount: 19,
  promotedExternalIdsSha256: sha256(JSON.stringify(promotedIds)),
  sourceTextContractsSha256: sha256(sourceTextContractsBefore),
  ignoredLegacyPublicationBlockers: [
    "pending_runtime_integration",
    "variant_specific_choice_contract_pending",
    "theory_related_publication_blockers",
  ],
  preservedExcludedStates: ["hold", "choice_conflict"],
};
manifest.recordsSha256 = sha256(JSON.stringify(manifest.records));

const after = countByStatus(manifest.records);
if (
  manifest.records.length !== 2384 ||
  after.published !== 2267 ||
  (after.candidate ?? 0) !== 0 ||
  after.hold !== 98 ||
  after.choice_conflict !== 19 ||
  2267 + 98 + 19 !== 2384
) {
  throw new Error(
    `Reviewed CBT publication release count mismatch: ${JSON.stringify(after)}`,
  );
}

const preservedAfter = manifest.records
  .filter((record) =>
    ["hold", "choice_conflict"].includes(record.review.runtimeStatus),
  )
  .map((record) => JSON.stringify(record));
if (JSON.stringify(preservedExcluded) !== JSON.stringify(preservedAfter)) {
  throw new Error("HOLD or choice-conflict audit records changed during release.");
}
if (
  JSON.stringify(sourceTextContracts(manifest.records)) !==
  sourceTextContractsBefore
) {
  throw new Error("Question stems or ordered choices changed during release.");
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `Published ${after.published} reviewed CBT variants; preserved ${after.hold} HOLD and ${after.choice_conflict} choice conflicts.`,
);
