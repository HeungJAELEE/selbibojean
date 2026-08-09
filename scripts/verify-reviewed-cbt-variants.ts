import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import generatedContent from "../src/data/generated/content.json";
import { isUsablePastExamVariant } from "../src/lib/content/past-exam-examples";
import { isSafeOriginalPracticeVariant } from "../src/lib/content/practice-presentations";
import {
  applyReviewedCbtTheoryAndCanonicalChanges,
  getReviewedCbtVariantAnswerIndex,
  getReviewedCbtVariantPresentation,
  mapReviewedCbtVariantChoices,
  reviewedCbtVariantManifest,
  validateReviewedCbtVariantManifest,
} from "../src/lib/content/reviewed-cbt-variants";
import { buildRuntimeContent } from "../src/lib/content/runtime-content";
import { buildSupabaseMaterialization } from "../src/lib/content/supabase-materialization";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "../src/lib/domain/practice";
import {
  PUBLICATION_BLOCKERS,
  type GeneratedContent,
  type ReviewedCbtVariantRecord,
} from "../src/lib/domain/types";

const source = generatedContent as GeneratedContent;
const failures: string[] = [];

validateReviewedCbtVariantManifest(source, reviewedCbtVariantManifest);
const effectiveSource = applyReviewedCbtTheoryAndCanonicalChanges(
  source,
  reviewedCbtVariantManifest,
);
const runtime = buildRuntimeContent(source);
const recordsById = new Map(
  reviewedCbtVariantManifest.records.map((record) => [
    record.externalId,
    record,
  ]),
);
const runtimeVariantsById = new Map(
  runtime.variants.map((variant) => [variant.externalId, variant]),
);
const runtimeQuestionsById = new Map(
  runtime.questions.map((question) => [question.id, question]),
);
const runtimeLessonsById = new Map(
  runtime.lessons.map((lesson) => [lesson.id, lesson]),
);

const theoryLessonAdditions =
  reviewedCbtVariantManifest.theoryLessonAdditions ?? [];
const canonicalQuestionChanges =
  reviewedCbtVariantManifest.canonicalQuestionChanges ?? [];

type ReviewedRecordWithTheoryLink = ReviewedCbtVariantRecord & {
  theoryLink: NonNullable<ReviewedCbtVariantRecord["theoryLink"]>;
};

function hasTheoryLink(
  record: ReviewedCbtVariantRecord | undefined,
): record is ReviewedRecordWithTheoryLink {
  return record?.theoryLink != null;
}

type TaxonomyRepairMigration = ReviewedCbtVariantRecord["migration"] & {
  taxonomyRepair?: {
    applied: boolean;
    currentConceptGroupId: string;
    targetConceptGroupId: string | null;
    sourceStatedTargetFamily: string;
  };
};

type Batch13TheoryLinkSnapshot = {
  canonicalId: string;
  lessonId: string;
  lessonAnchor: string;
  conceptGroupId: string;
  conceptId: string;
  canonicalStem: string;
};

type Batch13Correction = {
  correctionId: string;
  kind: string;
  externalId?: string;
  canonicalId?: string;
  beforeSha256?: string;
  afterSha256?: string;
  before?: { theoryLink?: Batch13TheoryLinkSnapshot };
  after?: { theoryLink?: Batch13TheoryLinkSnapshot };
};

const batch13CorrectionLedgerPath =
  "docs/audit-work/cbt-system-migration/import-batch-13/integration-correction-ledger.jsonl";
const batch13Corrections = parseJsonl<Batch13Correction>(
  readFileSync(batch13CorrectionLedgerPath, "utf8"),
);
const batch13RecordSupersessions = new Map(
  batch13Corrections
    .filter(
      (correction) =>
        correction.kind === "record_theory_link_supersession" &&
        correction.externalId,
    )
    .map((correction) => [correction.externalId!, correction]),
);

verifyManifestDigest();
verifySourceFilesAndBatchExactSets();
verifyRuntimeVariants();
verifyTheoryAndCanonicalExtensions();
verifyFinalCanonicalPublicationBlockers();
verifyReleaseRuntimeCounts();
verifyBatch01Contracts();
verifyBatch02Contracts();
verifyBatch03Contracts();
verifyBatch04Contracts();
verifyBatch05Contracts();
verifyBatch06Contracts();
verifyBatch07Contracts();
verifyBatch08Contracts();
verifyBatch09Contracts();
verifyBatch10Contracts();
verifyBatch11Contracts();
verifyBatch12Contracts();
verifyBatch13Contracts();
verifySupabaseProjection();

if (failures.length > 0) {
  console.error(failures.slice(0, 100).join("\n"));
  process.exit(1);
}

const states = countStates(runtime.variants);
console.log(
  `PASS: reviewed CBT imports verified (${reviewedCbtVariantManifest.records.length} records; ${states.published ?? 0} published; ${states.choice_conflict ?? 0} choice conflicts; ${states.hold ?? 0} holds; ${states.unreviewed ?? 0} gated; ${reviewedCbtVariantManifest.theoryLessonAdditions?.length ?? 0} theory additions; ${reviewedCbtVariantManifest.canonicalQuestionChanges?.length ?? 0} canonical overlays; source stem and ordered-choice hashes preserved).`,
);

function verifyManifestDigest() {
  const recordsSha256 = sha256(
    JSON.stringify(reviewedCbtVariantManifest.records),
  );
  if (recordsSha256 !== reviewedCbtVariantManifest.recordsSha256) {
    failures.push(
      `reviewed CBT record digest mismatch: ${recordsSha256} != ${reviewedCbtVariantManifest.recordsSha256}`,
    );
  }
  if (recordsById.size !== reviewedCbtVariantManifest.records.length) {
    failures.push("reviewed CBT external IDs are not unique");
  }
}

function verifySourceFilesAndBatchExactSets() {
  let recordOffset = 0;
  for (const batch of reviewedCbtVariantManifest.batches) {
    const batchRecords = reviewedCbtVariantManifest.records.slice(
      recordOffset,
      recordOffset + batch.recordCount,
    );
    recordOffset += batch.recordCount;

    const sourceRows = batch.sourceFiles.flatMap((sourceFile) => {
      const raw = normalizeTextFile(readFileSync(sourceFile.path, "utf8"));
      const actualSha256 = sha256(raw);
      if (actualSha256 !== sourceFile.sha256) {
        failures.push(
          `${batch.batchId}: source file digest mismatch for ${sourceFile.path}`,
        );
      }
      return sourceFile.path.startsWith(
        "docs/audit-work/cbt-source-reviews/final/",
      )
        ? parseJsonl<{ externalId: string }>(raw)
        : [];
    });
    if (
      !sameExactSet(
        sourceRows.map((row) => row.externalId),
        batchRecords.map((record) => record.externalId),
      )
    ) {
      failures.push(`${batch.batchId}: source/review exact-set mismatch`);
    }

    const batchStates = countRecordStates(batchRecords);
    if (
      (batchStates.candidate ?? 0) + (batchStates.published ?? 0) !==
        batch.candidateCount ||
      (batchStates.choice_conflict ?? 0) !== batch.choiceConflictCount ||
      (batchStates.hold ?? 0) !== batch.holdCount
    ) {
      failures.push(
        `${batch.batchId}: state counts do not match batch metadata`,
      );
    }
    const variantSpecificCount = batchRecords.filter(
      (record) => record.variantSpecificFeedbackRequired,
    ).length;
    if (
      variantSpecificCount !== (batch.variantSpecificFeedbackCount ?? 0)
    ) {
      failures.push(
        `${batch.batchId}: variant-specific choice count mismatch`,
      );
    }
  }
  if (recordOffset !== reviewedCbtVariantManifest.records.length) {
    failures.push("reviewed CBT batch record offsets are incomplete");
  }
}

function verifyRuntimeVariants() {
  const sourceVariantIds = new Set(
    source.variants.map((variant) => variant.externalId),
  );
  const runtimeSourceVariants = runtime.variants.filter((variant) =>
    sourceVariantIds.has(variant.externalId),
  );
  if (runtimeSourceVariants.length !== source.variants.length) {
    failures.push("runtime source-variant exact set changed");
  }

  const expectedStates = countRecordStates(
    reviewedCbtVariantManifest.records,
  );
  const actualStates = countStates(runtimeSourceVariants);
  expectedStates.unreviewed =
    source.variants.length - reviewedCbtVariantManifest.records.length;
  for (const state of [
    "candidate",
    "published",
    "choice_conflict",
    "hold",
    "unreviewed",
  ] as const) {
    if ((actualStates[state] ?? 0) !== (expectedStates[state] ?? 0)) {
      failures.push(
        `runtime state mismatch for ${state}: ${actualStates[state] ?? 0} != ${expectedStates[state] ?? 0}`,
      );
    }
  }
  if (
    (actualStates.published ?? 0) !== 2267 ||
    (actualStates.hold ?? 0) !== 98 ||
    (actualStates.choice_conflict ?? 0) !== 19
  ) {
    failures.push("reviewed CBT publication split must be 2267/98/19");
  }

  for (const variant of runtimeSourceVariants) {
    const record = recordsById.get(variant.externalId);
    if (!record) {
      if (variant.reviewState !== "unreviewed") {
        failures.push(`${variant.externalId}: unimported variant is not gated`);
      }
      continue;
    }

    const presentation = getReviewedCbtVariantPresentation(record);
    if (
      variant.canonicalId !== record.canonicalId ||
      variant.stem !== presentation.stem ||
      JSON.stringify(variant.choices) !== JSON.stringify(presentation.choices)
    ) {
      failures.push(`${variant.externalId}: reviewed payload was not applied`);
    }
    if (variant.reviewState !== record.review.runtimeStatus) {
      failures.push(`${variant.externalId}: review state mismatch`);
    }
    if (variant.reviewState !== "published" && isUsablePastExamVariant(variant)) {
      failures.push(`${variant.externalId}: non-published variant reached learner DTO`);
    }

    const answerBearing =
      record.review.runtimeStatus === "candidate" ||
      record.review.runtimeStatus === "published";
    if (!answerBearing) {
      if (variant.answer || variant.explanation) {
        failures.push(
          `${variant.externalId}: non-scoring variant retains active answer data`,
        );
      }
      continue;
    }

    const question = runtimeQuestionsById.get(variant.canonicalId);
    if (!question) {
      failures.push(`${variant.externalId}: runtime canonical question missing`);
      continue;
    }
    if (record.variantSpecificFeedbackRequired) {
      if (
        record.choiceIdMapping.length !== 0 ||
        !record.review.publicationBlockers.includes(
          "variant_specific_choice_contract_pending",
        )
      ) {
        failures.push(
          `${variant.externalId}: variant-specific choice blocker is invalid`,
        );
      }
      if (!isSafeOriginalPracticeVariant(question, variant)) {
        failures.push(
          `${variant.externalId}: published variant-specific choice contract is not usable`,
        );
      }
      const mappedChoices = mapReviewedCbtVariantChoices(question, variant);
      const answerIndex = getReviewedCbtVariantAnswerIndex(variant);
      if (
        !mappedChoices ||
        mappedChoices.length !== record.choices.length ||
        new Set(mappedChoices.map((choice) => choice.id)).size !==
          record.choices.length ||
        answerIndex === null ||
        mappedChoices[answerIndex]?.id !== question.correctChoiceId
      ) {
        failures.push(
          `${variant.externalId}: runtime choice contract does not preserve stable grading`,
        );
      }
      continue;
    }

    const answerIndex = record.reviewedAnswerIndex;
    if (
      answerIndex === null ||
      record.choiceIdMapping[answerIndex] !== question.correctChoiceId
    ) {
      failures.push(`${variant.externalId}: candidate answer mapping mismatch`);
    }
  }
}

function verifyTheoryAndCanonicalExtensions() {
  const additions = reviewedCbtVariantManifest.theoryLessonAdditions ?? [];
  const changes = reviewedCbtVariantManifest.canonicalQuestionChanges ?? [];
  const effectiveLessonIds = new Set(
    effectiveSource.lessons.map((lesson) => lesson.id),
  );
  const effectiveQuestionIds = new Set(
    effectiveSource.questions.map((question) => question.id),
  );

  for (const addition of additions) {
    const lesson = runtimeLessonsById.get(addition.lesson.id);
    if (
      !effectiveLessonIds.has(addition.lesson.id) ||
      !lesson ||
      lesson.contentStatus === "published" ||
      lesson.publication?.readiness === "ready" ||
      addition.directExternalIds.length === 0
    ) {
      failures.push(
        `${addition.lesson.id}: direct-theory addition is not safely gated`,
      );
    }
    for (const externalId of addition.directExternalIds) {
      const record = recordsById.get(externalId);
      if (record?.theoryLink?.lessonId !== addition.lesson.id) {
        failures.push(
          `${externalId}: direct-theory addition does not match record link`,
        );
      }
    }
  }

  for (const change of changes) {
    const question = runtimeQuestionsById.get(change.question.id);
    if (
      !effectiveQuestionIds.has(change.question.id) ||
      !question ||
      question.contentStatus === "published" ||
      question.publication?.readiness === "ready"
    ) {
      failures.push(
        `${change.question.id}: canonical overlay is not safely gated`,
      );
    }
    for (const externalId of change.affectedExternalIds) {
      if (recordsById.get(externalId)?.canonicalId !== change.question.id) {
        failures.push(
          `${externalId}: canonical overlay target does not match manifest record`,
        );
      }
    }
  }
}

function verifyFinalCanonicalPublicationBlockers() {
  const allowed = new Set<string>(PUBLICATION_BLOCKERS);
  for (const change of canonicalQuestionChanges) {
    const publication = change.question.publication;
    if (!publication) {
      failures.push(
        `${change.question.id}: canonical publication contract missing`,
      );
      continue;
    }
    const invalid = publication.blockers.filter(
      (blocker) => !allowed.has(blocker),
    );
    if (invalid.length) {
      failures.push(
        `${change.question.id}: non-canonical publication blockers ${invalid.join(", ")}`,
      );
    }
  }
  for (const canonicalId of [
    "U-1215",
    "U-1161",
    "U-1166",
    "U-1072",
    "U-1089",
  ]) {
    const change = canonicalQuestionChanges.find(
      (candidate) => candidate.question.id === canonicalId,
    );
    const blockers = change?.question.publication?.blockers ?? [];
    if (!blockers.includes("answer_conflict")) {
      failures.push(`${canonicalId}: canonical answer-conflict blocker missing`);
    }
  }
  for (const canonicalId of ["U-649", "U-478"]) {
    const change = canonicalQuestionChanges.find(
      (candidate) => candidate.question.id === canonicalId,
    );
    const blockers = change?.question.publication?.blockers ?? [];
    if (!blockers.includes("mapping_unverified")) {
      failures.push(`${canonicalId}: canonical mapping blocker missing`);
    }
  }
}

function verifyReleaseRuntimeCounts() {
  const publishableQuestions = runtime.questions.filter(isPublishableQuestion);
  const publishableLessons = runtime.lessons.filter(isPublishableLesson);
  if (publishableQuestions.length !== 1490) {
    failures.push(
      `runtime publishable question count ${publishableQuestions.length} != 1490`,
    );
  }
  if (publishableLessons.length !== 1283) {
    failures.push(
      `runtime publishable lesson count ${publishableLessons.length} != 1283`,
    );
  }
}

function verifyBatch01Contracts() {
  const expectedNormalized = new Set([
    "2006-4-Q09",
    "2006-4-Q15",
    "2006-4-Q84",
    "2006-4-Q89",
    "2007-4-Q40",
  ]);
  const expectedLowContext = new Set([
    "2006-4-Q11",
    "2007-4-Q36",
    "2007-4-Q50",
    "2007-4-Q61",
    "2007-4-Q82",
  ]);
  const expectedChoiceConflicts = new Set([
    "2006-4-Q34",
    "2006-4-Q49",
    "2006-4-Q60",
    "2006-4-Q93",
    "2007-4-Q49",
    "2007-4-Q66",
  ]);
  const expectedImageHolds = new Set([
    "2006-4-Q17",
    "2006-4-Q37",
    "2006-4-Q88",
    "2006-4-Q91",
    "2007-4-Q02",
    "2007-4-Q10",
    "2007-4-Q93",
  ]);

  for (const record of reviewedCbtVariantManifest.records.slice(0, 200)) {
    if (
      Boolean(record.presentationNormalization) !==
      expectedNormalized.has(record.externalId)
    ) {
      failures.push(`${record.externalId}: normalization exact-set mismatch`);
    }
    if (
      expectedLowContext.has(record.externalId) &&
      record.review.runtimeStatus !== "published"
    ) {
      failures.push(`${record.externalId}: low-context registration was lost`);
    }
    if (
      expectedChoiceConflicts.has(record.externalId) !==
      (record.review.runtimeStatus === "choice_conflict")
    ) {
      failures.push(`${record.externalId}: choice-conflict exact-set mismatch`);
    }
    if (
      expectedImageHolds.has(record.externalId) !==
      (record.review.runtimeStatus === "hold" &&
        record.review.issueLabel === "필수 이미지 확인")
    ) {
      failures.push(`${record.externalId}: image-hold exact-set mismatch`);
    }
  }

  verifyQueueExactSet(
    "batch 01 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-01/image-verification-queue.jsonl",
    expectedImageHolds,
  );
  verifyQueueExactSet(
    "batch 01 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-01/choice-conflict-queue.jsonl",
    expectedChoiceConflicts,
  );
  verifyQueueExactSet(
    "batch 01 normalization ledger",
    "docs/audit-work/cbt-system-migration/import-batch-01/normalization-ledger.jsonl",
    expectedNormalized,
  );

  const normalizedQ09 = runtimeVariantsById.get("2006-4-Q09");
  const rawQ09 = recordsById.get("2006-4-Q09");
  if (
    normalizedQ09?.choices[1] !== "소음계" ||
    rawQ09?.choices[1] !== "소음기" ||
    rawQ09.presentationNormalization?.normalizedChoices[1] !== "소음계"
  ) {
    failures.push("2006-4-Q09: raw/normalized presentation contract failed");
  }
}

function verifyBatch02Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-02",
  );
  if (!batch) {
    failures.push("batch 02 metadata is missing");
    return;
  }
  const records = reviewedCbtVariantManifest.records.slice(200, 400);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-02/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 02 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    lessonId: string;
    lessonAnchor: string;
    variantSpecificFeedbackRequired: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-02/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 02 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor
    ) {
      failures.push(`${row.externalId}: direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 02 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-02/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 02 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-02/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 189 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      11 ||
    variantSpecificIds.size !== 165 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 14 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 12
  ) {
    failures.push("batch 02 summary counts changed unexpectedly");
  }

  const expectedExamples = [
    ["2009-4-Q41", "U-1253", "lesson-cbt-cbn-tool-material"],
    ["2009-4-Q46", "U-1256", "lesson-cbt-shaper-cutting-speed"],
    ["2009-4-Q54", "U-1257", "lesson-cbt-shaft-assembly-failure"],
    ["2009-4-Q56", "U-1394", "lesson-cbt-shaft-drawing-rules"],
    ["2009-4-Q84", "U-1400", "lesson-cbt-poppet-valve-components"],
  ] as const;
  for (const [externalId, canonicalId, lessonId] of expectedExamples) {
    const record = recordsById.get(externalId);
    if (
      record?.canonicalId !== canonicalId ||
      record.theoryLink?.lessonId !== lessonId ||
      !runtimeLessonsById.has(lessonId)
    ) {
      failures.push(`${externalId}: expected direct theory remap is missing`);
    }
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-02/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Before: string;
    sourceContentUnchanged: boolean;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  if (
    !batchSummary.sourceContentUnchanged ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Before
  ) {
    failures.push("batch 02 changed the workbook-derived content.json");
  }
}


function verifyBatch03Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-03",
  );
  if (!batch) {
    failures.push("batch 03 metadata is missing");
    return;
  }
  const records = reviewedCbtVariantManifest.records.slice(400, 600);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-03/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 03 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    lessonId: string;
    lessonAnchor: string;
    variantSpecificFeedbackRequired: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-03/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 03 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired
    ) {
      failures.push(`${row.externalId}: batch 03 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 03 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-03/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 03 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-03/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 03 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-03/choice-conflict-queue.jsonl",
    new Set(batch.holdResolution.choiceConflictNonScoring),
  );
  verifyQueueExactSet(
    "batch 03 answer-key correction ledger",
    "docs/audit-work/cbt-system-migration/import-batch-03/answer-key-correction-ledger.jsonl",
    new Set(["2010-4-Q59"]),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 190 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 2 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      8 ||
    variantSpecificIds.size !== 167 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 3 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 3
  ) {
    failures.push("batch 03 summary counts changed unexpectedly");
  }

  const corrected = recordsById.get("2010-4-Q59");
  const correctedQuestion = runtimeQuestionsById.get("U-1215");
  if (
    corrected?.sourceAnswerIndex !== 0 ||
    corrected.reviewedAnswerIndex !== 2 ||
    corrected.review.runtimeStatus !== "published" ||
    corrected.choiceIdMapping[2] !== "U-1215-c3" ||
    corrected.theoryLink?.lessonId !==
      "lesson-cbt-safety-valve-simmering-correction" ||
    correctedQuestion?.correctChoiceId !== "U-1215-c3" ||
    correctedQuestion.lessonId !==
      "lesson-cbt-safety-valve-simmering-correction" ||
    correctedQuestion.publication?.readiness !== "blocked"
  ) {
    failures.push("2010-4-Q59: answer-key correction contract failed");
  }

  for (const externalId of ["2011-4-Q42", "2011-4-Q59"]) {
    const conflict = recordsById.get(externalId);
    if (
      conflict?.review.runtimeStatus !== "choice_conflict" ||
      conflict.choiceConflict?.scoringPolicy !== "non_scoring" ||
      !conflict.directSolution.startsWith("선택지 충돌:")
    ) {
      failures.push(`${externalId}: batch 03 choice-conflict contract failed`);
    }
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-03/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Before: string;
    sourceContentUnchanged: boolean;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  if (
    !batchSummary.sourceContentUnchanged ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Before
  ) {
    failures.push("batch 03 changed the workbook-derived content.json");
  }
}


function verifyBatch04Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-04",
  );
  if (!batch) {
    failures.push("batch 04 metadata is missing");
    return;
  }
  const records = reviewedCbtVariantManifest.records.slice(600, 800);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-04/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 04 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    variantSpecificFeedbackRequired: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-04/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 04 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor ||
      record.theoryLink.conceptGroupId !== row.conceptGroupId ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired
    ) {
      failures.push(`${row.externalId}: batch 04 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 04 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-04/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 04 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-04/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 04 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-04/choice-conflict-queue.jsonl",
    new Set(batch.holdResolution.choiceConflictNonScoring),
  );
  verifyQueueExactSet(
    "batch 04 answer-key correction ledger",
    "docs/audit-work/cbt-system-migration/import-batch-04/answer-key-correction-ledger.jsonl",
    new Set(["2013-4-Q48"]),
  );
  verifyQueueExactSet(
    "batch 04 dry-run override ledger",
    "docs/audit-work/cbt-system-migration/import-batch-04/dry-run-decision-overrides.jsonl",
    new Set(["2012-4-Q08"]),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 193 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 1 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      6 ||
    variantSpecificIds.size !== 158 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 2 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 2
  ) {
    failures.push("batch 04 summary counts changed unexpectedly");
  }

  const corrected = recordsById.get("2013-4-Q48");
  const correctedQuestion = runtimeQuestionsById.get("U-1072");
  if (
    corrected?.sourceAnswerIndex !== 0 ||
    corrected.reviewedAnswerIndex !== 2 ||
    corrected.review.runtimeStatus !== "published" ||
    corrected.choiceIdMapping[2] !== "U-1072-c3" ||
    corrected.theoryLink?.lessonId !==
      "lesson-cbt-forward-curved-fan-power-curve" ||
    correctedQuestion?.correctChoiceId !== "U-1072-c3" ||
    correctedQuestion.lessonId !==
      "lesson-cbt-forward-curved-fan-power-curve" ||
    correctedQuestion.publication?.readiness !== "blocked"
  ) {
    failures.push("2013-4-Q48: answer-key correction contract failed");
  }

  const conflict = recordsById.get("2013-4-Q84");
  const conflictQuestion = runtimeQuestionsById.get("U-1089");
  if (
    conflict?.review.runtimeStatus !== "choice_conflict" ||
    conflict.choiceConflict?.scoringPolicy !== "non_scoring" ||
    !conflict.directSolution.startsWith("선택지 충돌:") ||
    conflict.theoryLink?.lessonId !==
      "lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict" ||
    conflict.theoryLink.conceptGroupId !== "s1-g08" ||
    conflictQuestion?.conceptGroupId !== "s1-g08" ||
    conflictQuestion.lessonId !==
      "lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict"
  ) {
    failures.push("2013-4-Q84: choice-conflict/theory correction failed");
  }

  const dryRunOverride = recordsById.get("2012-4-Q08");
  if (
    dryRunOverride?.canonicalId !== "U-1099" ||
    dryRunOverride.currentCanonicalId !== "U-1099" ||
    dryRunOverride.migration.mappingClass !==
      "DRY_RUN_REASSIGNMENT_OVERRIDDEN_BY_DIRECT_CANONICAL_REVIEW"
  ) {
    failures.push("2012-4-Q08: dry-run reassignment override failed");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-04/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Before: string;
    sourceContentUnchanged: boolean;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  if (
    !batchSummary.sourceContentUnchanged ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Before
  ) {
    failures.push("batch 04 changed the workbook-derived content.json");
  }
}


function verifyBatch05Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-05",
  );
  if (!batch) {
    failures.push("batch 05 metadata is missing");
    return;
  }
  const records = reviewedCbtVariantManifest.records.slice(800, 1000);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-05/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 05 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    variantSpecificFeedbackRequired: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-05/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 05 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor ||
      record.theoryLink.conceptGroupId !== row.conceptGroupId ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired
    ) {
      failures.push(`${row.externalId}: batch 05 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 05 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-05/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 05 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-05/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 05 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-05/choice-conflict-queue.jsonl",
    new Set(batch.holdResolution.choiceConflictNonScoring),
  );
  verifyQueueExactSet(
    "batch 05 answer-key correction ledger",
    "docs/audit-work/cbt-system-migration/import-batch-05/answer-key-correction-ledger.jsonl",
    new Set(["2014-4-Q87"]),
  );
  verifyQueueExactSet(
    "batch 05 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-05/canonical-reassignment-ledger.jsonl",
    new Set(["2014-4-Q51"]),
  );
  verifyQueueExactSet(
    "batch 05 manual choice mapping ledger",
    "docs/audit-work/cbt-system-migration/import-batch-05/manual-choice-mapping-ledger.jsonl",
    new Set(["2014-4-Q87"]),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 191 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 1 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      8 ||
    variantSpecificIds.size !== 154 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 0 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 0
  ) {
    failures.push("batch 05 summary counts changed unexpectedly");
  }

  const corrected = recordsById.get("2014-4-Q87");
  const correctedQuestion = runtimeQuestionsById.get("U-990");
  if (
    corrected?.sourceAnswerIndex !== 3 ||
    corrected.reviewedAnswerIndex !== 1 ||
    corrected.review.runtimeStatus !== "published" ||
    corrected.variantSpecificFeedbackRequired ||
    JSON.stringify(corrected.choiceIdMapping) !==
      JSON.stringify(["U-990-c2", "U-990-c3", "U-990-c1", "U-990-c4"]) ||
    corrected.choiceIdMapping[1] !== correctedQuestion?.correctChoiceId ||
    corrected.theoryLink?.lessonId !== "lesson-117o0xo" ||
    correctedQuestion?.correctChoiceId !== "U-990-c3" ||
    correctedQuestion.lessonId !== "lesson-117o0xo"
  ) {
    failures.push("2014-4-Q87: answer-key correction contract failed");
  }

  const conflict = recordsById.get("2014-2-Q40");
  if (
    conflict?.review.runtimeStatus !== "choice_conflict" ||
    conflict.choiceConflict?.scoringPolicy !== "non_scoring" ||
    JSON.stringify(conflict.choiceConflict.choiceIndices) !==
      JSON.stringify([1, 2]) ||
    !conflict.directSolution.startsWith("선택지 충돌:") ||
    conflict.theoryLink?.lessonId !== "lesson-1qwoyl1"
  ) {
    failures.push("2014-2-Q40: choice-conflict contract failed");
  }

  const reassigned = recordsById.get("2014-4-Q51");
  if (
    reassigned?.currentCanonicalId !== "U-100" ||
    reassigned.canonicalId !== "U-362" ||
    reassigned.theoryLink?.lessonId !== "lesson-w8vtqs" ||
    reassigned.theoryLink.conceptGroupId !== "s3-g06" ||
    reassigned.migration.canonicalAction !== "REASSIGN_CANONICAL" ||
    !reassigned.variantSpecificFeedbackRequired
  ) {
    failures.push("2014-4-Q51: semantic canonical reassignment failed");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-05/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Before: string;
    sourceContentUnchanged: boolean;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  if (
    !batchSummary.sourceContentUnchanged ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Before
  ) {
    failures.push("batch 05 changed the workbook-derived content.json");
  }
}


function verifyBatch06Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-06",
  );
  if (!batch) {
    failures.push("batch 06 metadata is missing");
    return;
  }

  const records = reviewedCbtVariantManifest.records.slice(1000, 1200);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-06/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 06 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    variantSpecificFeedbackRequired: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-06/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 06 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    const supersession = batch13RecordSupersessions.get(row.externalId);
    const previousLink = supersession?.before?.theoryLink;
    const effectiveLink = supersession?.after?.theoryLink ?? row;
    if (
      supersession &&
      (!previousLink ||
        previousLink.lessonId !== row.lessonId ||
        previousLink.lessonAnchor !== row.lessonAnchor ||
        previousLink.conceptGroupId !== row.conceptGroupId)
    ) {
      failures.push(
        `${row.externalId}: batch 13 supersession does not bind the historical batch 06 matrix`,
      );
    }
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== effectiveLink.lessonId ||
      record.theoryLink.lessonAnchor !== effectiveLink.lessonAnchor ||
      record.theoryLink.conceptGroupId !== effectiveLink.conceptGroupId ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired
    ) {
      failures.push(`${row.externalId}: batch 06 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 06 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-06/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 06 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-06/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 06 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-06/choice-conflict-queue.jsonl",
    new Set(batch.holdResolution.choiceConflictNonScoring),
  );
  verifyQueueExactSet(
    "batch 06 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-06/canonical-reassignment-ledger.jsonl",
    new Set(["2015-4-Q69"]),
  );
  verifyQueueExactSet(
    "batch 06 low-context registration ledger",
    "docs/audit-work/cbt-system-migration/import-batch-06/low-context-registration-ledger.jsonl",
    new Set(["2015-2-Q49", "2015-2-Q70", "2015-4-Q47", "2015-4-Q91"]),
  );
  verifyQueueExactSet(
    "batch 06 answer-key correction ledger",
    "docs/audit-work/cbt-system-migration/import-batch-06/answer-key-correction-ledger.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 06 manual choice mapping ledger",
    "docs/audit-work/cbt-system-migration/import-batch-06/manual-choice-mapping-ledger.jsonl",
    new Set(),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 190 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 4 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      6 ||
    variantSpecificIds.size !== 165 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 0 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 0 ||
    batch.lowContextRegistrationCount !== 4
  ) {
    failures.push("batch 06 summary counts changed unexpectedly");
  }

  const conflictContracts = new Map<string, number[]>([
    ["2015-2-Q42", [0, 1, 2, 3]],
    ["2015-4-Q20", [1, 3]],
    ["2015-4-Q46", [0, 1, 2, 3]],
    ["2015-4-Q55", [0, 2]],
  ]);
  for (const [externalId, indices] of conflictContracts) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "choice_conflict" ||
      record.choiceConflict?.scoringPolicy !== "non_scoring" ||
      JSON.stringify(record.choiceConflict.choiceIndices) !==
        JSON.stringify(indices) ||
      !record.directSolution.startsWith("선택지 충돌:") ||
      record.reviewedAnswerIndex !== null ||
      record.choiceIdMapping.length !== 0
    ) {
      failures.push(`${externalId}: batch 06 choice-conflict contract failed`);
    }
  }

  const reassigned = recordsById.get("2015-4-Q69");
  if (
    reassigned?.currentCanonicalId !== "U-889" ||
    reassigned.canonicalId !== "U-390" ||
    reassigned.theoryLink?.lessonId !== "lesson-18pfbo5" ||
    reassigned.theoryLink.conceptGroupId !== "s4-g14" ||
    reassigned.migration.canonicalAction !== "REASSIGN_CANONICAL" ||
    !reassigned.variantSpecificFeedbackRequired
  ) {
    failures.push("2015-4-Q69: semantic canonical reassignment failed");
  }

  const imageHold = recordsById.get("2015-4-Q88");
  if (
    imageHold?.review.runtimeStatus !== "hold" ||
    imageHold.review.issueLabel !== "필수 이미지 확인" ||
    imageHold.reviewedAnswerIndex !== null ||
    imageHold.choiceIdMapping.length !== 0 ||
    imageHold.formulaUnitSubstitution === null
  ) {
    failures.push("2015-4-Q88: image/formula hold contract failed");
  }

  for (const externalId of [
    "2015-2-Q49",
    "2015-2-Q70",
    "2015-4-Q47",
    "2015-4-Q91",
  ]) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "published" ||
      record.review.theoryLinkStatus !==
        "direct_existing_theory_low_context_exam_intent" ||
      !record.review.answerConflictOrMultipleAnswerRisk
    ) {
      failures.push(`${externalId}: low-context policy contract failed`);
    }
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-06/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Before: string;
    sourceContentUnchanged: boolean;
    formulaUnitSubstitutionCount: number;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  if (
    !batchSummary.sourceContentUnchanged ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Before ||
    batchSummary.formulaUnitSubstitutionCount !== 20
  ) {
    failures.push("batch 06 source/formula summary contract failed");
  }
}


function verifyBatch07Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-07",
  );
  if (!batch) {
    failures.push("batch 07 metadata is missing");
    return;
  }

  const records = reviewedCbtVariantManifest.records.slice(1200, 1370);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-07/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 170 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 07 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    conceptId: string;
    variantSpecificFeedbackRequired: boolean;
    lowContextPolicyApplied: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-07/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 170 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 07 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor ||
      record.theoryLink.conceptGroupId !== row.conceptGroupId ||
      record.theoryLink.conceptId !== row.conceptId ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired ||
      (record.review.theoryLinkStatus ===
        "direct_existing_theory_low_context_exam_intent") !==
        row.lowContextPolicyApplied
    ) {
      failures.push(`${row.externalId}: batch 07 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 07 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-07/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 07 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-07/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 07 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-07/choice-conflict-queue.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 07 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-07/canonical-reassignment-ledger.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 07 answer-key correction ledger",
    "docs/audit-work/cbt-system-migration/import-batch-07/answer-key-correction-ledger.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 07 manual choice mapping ledger",
    "docs/audit-work/cbt-system-migration/import-batch-07/manual-choice-mapping-ledger.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 07 low-context registration ledger",
    "docs/audit-work/cbt-system-migration/import-batch-07/low-context-registration-ledger.jsonl",
    new Set(batch.holdResolution.lowContextRegistered),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 165 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 0 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      5 ||
    variantSpecificIds.size !== 136 ||
    records.filter((record) => record.choiceIdMapping.length > 0).length !== 29 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 0 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 0 ||
    batch.lowContextRegistrationCount !== 32
  ) {
    failures.push("batch 07 summary counts changed unexpectedly");
  }

  const holdIds = [
    "2016-4-Q10",
    "2016-4-Q26",
    "2016-4-Q58",
    "2017-2-Q32",
    "2017-2-Q33",
  ];
  for (const externalId of holdIds) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "hold" ||
      record.review.issueLabel !== "필수 이미지 확인" ||
      record.reviewedAnswerIndex !== null ||
      record.reviewedAnswerText !== "" ||
      record.choiceIdMapping.length !== 0 ||
      !record.review.publicationBlockers.includes("required_source_image_review")
    ) {
      failures.push(`${externalId}: batch 07 image-HOLD contract failed`);
    }
  }

  const formulaHold = recordsById.get("2016-4-Q10");
  const formulaContract = formulaHold?.formulaUnitSubstitution;
  if (
    typeof formulaContract !== "object" ||
    formulaContract === null ||
    formulaContract.formula !==
      "무감쇠 1자유도계의 각고유진동수는 ωn=√(k/m)이다" ||
    !formulaContract.result.includes("HOLD")
  ) {
    failures.push("2016-4-Q10: image/formula HOLD contract failed");
  }

  for (const externalId of [
    "2016-4-Q70",
    "2016-4-Q83",
    "2016-4-Q90",
    "2017-2-Q43",
  ]) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "published" ||
      !record.review.answerConflictOrMultipleAnswerRisk ||
      record.reviewedAnswerIndex === null
    ) {
      failures.push(`${externalId}: text-sufficient image policy contract failed`);
    }
  }

  for (const externalId of batch.holdResolution.lowContextRegistered) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "published" ||
      record.review.theoryLinkStatus !==
        "direct_existing_theory_low_context_exam_intent" ||
      !record.review.answerConflictOrMultipleAnswerRisk
    ) {
      failures.push(`${externalId}: batch 07 low-context policy failed`);
    }
  }

  if (
    records.some(
      (record) =>
        record.currentCanonicalId !== record.canonicalId ||
        record.migration.canonicalAction !== "KEEP_CURRENT_CANONICAL",
    )
  ) {
    failures.push("batch 07 unexpectedly reassigns a canonical question");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-07/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Expected: string;
    contentHashBindingVerified: boolean;
    formulaUnitSubstitutionCount: number;
    dryRunMappingSha256: string;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  const dryRunMappingSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-07/mapping-dry-run-input.jsonl",
      "utf8",
    ),
  );
  if (
    !batchSummary.contentHashBindingVerified ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Expected ||
    dryRunMappingSha256 !== batchSummary.dryRunMappingSha256 ||
    batchSummary.formulaUnitSubstitutionCount !== 8
  ) {
    failures.push("batch 07 source/formula binding contract failed");
  }
}


function verifyBatch08Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-08",
  );
  if (!batch) {
    failures.push("batch 08 metadata is missing");
    return;
  }

  const records = reviewedCbtVariantManifest.records.slice(1370, 1570);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-08/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 08 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    currentCanonicalId: string;
    targetCanonicalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    conceptId: string;
    variantSpecificFeedbackRequired: boolean;
    canonicalReassignmentApplied: boolean;
    canonicalOverlayApplied: boolean;
    lowContextPolicyApplied: boolean;
    sourceNeededTheoryGate: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-08/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 08 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor ||
      record.theoryLink.conceptGroupId !== row.conceptGroupId ||
      record.theoryLink.conceptId !== row.conceptId ||
      record.canonicalId !== row.targetCanonicalId ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired
    ) {
      failures.push(`${row.externalId}: batch 08 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 08 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-08/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 08 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-08/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 08 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-08/choice-conflict-queue.jsonl",
    new Set(["2018-2-Q10"]),
  );
  verifyQueueExactSet(
    "batch 08 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-08/canonical-reassignment-ledger.jsonl",
    new Set(["2018-4-Q19"]),
  );
  verifyQueueExactSet(
    "batch 08 low-context registration ledger",
    "docs/audit-work/cbt-system-migration/import-batch-08/low-context-registration-ledger.jsonl",
    new Set(batch.holdResolution.lowContextRegistered),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 191 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 1 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      8 ||
    variantSpecificIds.size !== 153 ||
    records.filter((record) => record.choiceIdMapping.length > 0).length !== 38 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 1 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 1 ||
    batch.lowContextRegistrationCount !== 30
  ) {
    failures.push("batch 08 summary counts changed unexpectedly");
  }

  for (const externalId of [
    "2017-2-Q60",
    "2018-2-Q05",
    "2018-2-Q21",
    "2018-2-Q45",
    "2018-2-Q83",
    "2018-4-Q15",
    "2018-4-Q18",
    "2018-4-Q37",
  ]) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "hold" ||
      record.review.issueLabel !== "필수 이미지 확인" ||
      record.reviewedAnswerIndex !== null ||
      record.reviewedAnswerText !== "" ||
      record.choiceIdMapping.length !== 0 ||
      !record.review.publicationBlockers.includes("required_source_image_review")
    ) {
      failures.push(`${externalId}: batch 08 image-HOLD contract failed`);
    }
  }

  const conflict = recordsById.get("2018-2-Q10");
  if (
    conflict?.review.runtimeStatus !== "choice_conflict" ||
    conflict.reviewedAnswerIndex !== null ||
    conflict.choiceIdMapping.length !== 0 ||
    conflict.choiceConflict?.scoringPolicy !== "non_scoring" ||
    JSON.stringify(conflict.choiceConflict.choiceIndices) !==
      JSON.stringify([0, 1, 2, 3]) ||
    !conflict.directSolution.startsWith("선택지 충돌:")
  ) {
    failures.push("2018-2-Q10: choice-conflict contract failed");
  }

  const reassigned = recordsById.get("2018-4-Q19");
  if (
    !hasTheoryLink(reassigned) ||
    reassigned.currentCanonicalId !== "U-026" ||
    reassigned.canonicalId !== "U-997" ||
    reassigned.migration.canonicalAction !== "REASSIGN_CANONICAL" ||
    reassigned.theoryLink.lessonId !== "lesson-lqjgxa" ||
    JSON.stringify(reassigned.choiceIdMapping) !==
      JSON.stringify(["U-997-c2", "U-997-c1", "U-997-c4", "U-997-c3"])
  ) {
    failures.push("2018-4-Q19: canonical reassignment contract failed");
  }

  const repaired = recordsById.get("2018-4-Q35");
  if (
    !hasTheoryLink(repaired) ||
    repaired.canonicalId !== "U-649" ||
    repaired.migration.canonicalAction !== "APPLY_CANONICAL_OVERLAY" ||
    repaired.migration.theoryAction !== "ADD_DIRECT_THEORY_LESSON" ||
    repaired.theoryLink.lessonId !==
      "lesson-cbt-gang-system-process-layout" ||
    JSON.stringify(repaired.choiceIdMapping) !==
      JSON.stringify(["U-649-c1", "U-649-c2", "U-649-c3", "U-649-c4"])
  ) {
    failures.push("2018-4-Q35: canonical/theory repair contract failed");
  }

  const lessonAddition = theoryLessonAdditions.find(
    (addition) =>
      addition.lesson.id === "lesson-cbt-gang-system-process-layout",
  );
  const canonicalChange = canonicalQuestionChanges.find(
    (change) => change.question.id === "U-649",
  );
  if (
    !lessonAddition ||
    lessonAddition.lesson.sourceNeeded !== true ||
    lessonAddition.lesson.publication?.readiness !== "blocked" ||
    !canonicalChange ||
    canonicalChange.action !== "replace" ||
    canonicalChange.question.lessonId !==
      "lesson-cbt-gang-system-process-layout" ||
    JSON.stringify(canonicalChange.affectedExternalIds) !==
      JSON.stringify(["2015-2-Q23", "2018-4-Q35"])
  ) {
    failures.push("batch 08 U-649 lesson/canonical overlay contract failed");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-08/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Expected: string;
    contentHashBindingVerified: boolean;
    formulaUnitSubstitutionCount: number;
    dryRunMappingSha256: string;
    canonicalReassignmentCount: number;
    canonicalTheoryRepairCount: number;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  const dryRunMappingSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-08/mapping-dry-run-input.jsonl",
      "utf8",
    ),
  );
  if (
    !batchSummary.contentHashBindingVerified ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Expected ||
    dryRunMappingSha256 !== batchSummary.dryRunMappingSha256 ||
    batchSummary.formulaUnitSubstitutionCount !== 8 ||
    batchSummary.canonicalReassignmentCount !== 1 ||
    batchSummary.canonicalTheoryRepairCount !== 1
  ) {
    failures.push("batch 08 source/repair/formula binding contract failed");
  }
}


function verifyBatch09Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-09",
  );
  if (!batch) {
    failures.push("batch 09 metadata is missing");
    return;
  }

  const records = reviewedCbtVariantManifest.records.slice(1570, 1770);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-09/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 09 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    currentCanonicalId: string;
    targetCanonicalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    conceptId: string;
    variantSpecificFeedbackRequired: boolean;
    canonicalReassignmentApplied: boolean;
    canonicalOverlayApplied: boolean;
    lowContextPolicyApplied: boolean;
    sourceNeededTheoryGate: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-09/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 09 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor ||
      record.theoryLink.conceptGroupId !== row.conceptGroupId ||
      record.theoryLink.conceptId !== row.conceptId ||
      record.canonicalId !== row.targetCanonicalId ||
      record.currentCanonicalId !== row.currentCanonicalId ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired ||
      row.canonicalReassignmentApplied ||
      row.canonicalOverlayApplied ||
      row.sourceNeededTheoryGate
    ) {
      failures.push(`${row.externalId}: batch 09 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 09 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-09/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 09 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-09/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 09 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-09/choice-conflict-queue.jsonl",
    new Set(["2019-2-Q32"]),
  );
  verifyQueueExactSet(
    "batch 09 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-09/canonical-reassignment-ledger.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 09 canonical repair ledger",
    "docs/audit-work/cbt-system-migration/import-batch-09/canonical-theory-repair-impact-ledger.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 09 low-context registration ledger",
    "docs/audit-work/cbt-system-migration/import-batch-09/low-context-registration-ledger.jsonl",
    new Set(batch.holdResolution.lowContextRegistered),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 192 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 1 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      7 ||
    variantSpecificIds.size !== 164 ||
    records.filter((record) => record.choiceIdMapping.length > 0).length !== 28 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 0 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 0 ||
    batch.lowContextRegistrationCount !== 26
  ) {
    failures.push("batch 09 summary counts changed unexpectedly");
  }

  for (const externalId of [
    "2018-4-Q89",
    "2019-1-Q01",
    "2019-1-Q91",
    "2019-1-Q92",
    "2019-1-Q98",
    "2019-2-Q21",
    "2019-2-Q35",
  ]) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "hold" ||
      record.review.issueLabel !== "필수 이미지 확인" ||
      record.reviewedAnswerIndex !== null ||
      record.reviewedAnswerText !== "" ||
      record.choiceIdMapping.length !== 0 ||
      !record.review.publicationBlockers.includes("required_source_image_review")
    ) {
      failures.push(`${externalId}: batch 09 image-HOLD contract failed`);
    }
  }

  const conflict = recordsById.get("2019-2-Q32");
  if (
    conflict?.review.runtimeStatus !== "choice_conflict" ||
    conflict.reviewedAnswerIndex !== null ||
    conflict.reviewedAnswerText !== "" ||
    conflict.choiceIdMapping.length !== 0 ||
    conflict.choiceConflict?.scoringPolicy !== "non_scoring" ||
    JSON.stringify(conflict.choiceConflict.choiceIndices) !==
      JSON.stringify([1, 2]) ||
    !conflict.directSolution.startsWith("선택지 충돌:")
  ) {
    failures.push("2019-2-Q32: choice-conflict contract failed");
  }

  for (const externalId of batch.holdResolution.lowContextRegistered) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "published" ||
      record.review.theoryLinkStatus !==
        "direct_existing_theory_low_context_exam_intent" ||
      !record.review.answerConflictOrMultipleAnswerRisk
    ) {
      failures.push(`${externalId}: batch 09 low-context policy failed`);
    }
  }

  if (
    records.some(
      (record) =>
        record.currentCanonicalId !== record.canonicalId ||
        ![
          "KEEP_CURRENT_CANONICAL",
          "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW",
        ].includes(record.migration.canonicalAction),
    )
  ) {
    failures.push("batch 09 unexpectedly reassigns a canonical question");
  }

  const theoryAdditions = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-09/theory-lesson-additions.json",
      "utf8",
    ),
  ) as unknown[];
  const canonicalChanges = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-09/canonical-question-changes.json",
      "utf8",
    ),
  ) as unknown[];
  if (theoryAdditions.length !== 0 || canonicalChanges.length !== 0) {
    failures.push("batch 09 unexpectedly adds theory or canonical overlays");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-09/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Expected: string;
    contentHashBindingVerified: boolean;
    formulaUnitSubstitutionCount: number;
    dryRunMappingSha256: string;
    canonicalReassignmentCount: number;
    canonicalTheoryRepairCount: number;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  const dryRunMappingSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-09/mapping-dry-run-input.jsonl",
      "utf8",
    ),
  );
  if (
    !batchSummary.contentHashBindingVerified ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Expected ||
    dryRunMappingSha256 !== batchSummary.dryRunMappingSha256 ||
    batchSummary.formulaUnitSubstitutionCount !== 12 ||
    batchSummary.canonicalReassignmentCount !== 0 ||
    batchSummary.canonicalTheoryRepairCount !== 0
  ) {
    failures.push("batch 09 source/formula binding contract failed");
  }
}



function verifyBatch10Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-10",
  );
  if (!batch) {
    failures.push("batch 10 metadata is missing");
    return;
  }

  const records = reviewedCbtVariantManifest.records.slice(1770, 1970);
  const expectedIds = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-10/external-ids.json",
      "utf8",
    ),
  ) as string[];
  if (
    expectedIds.length !== 200 ||
    JSON.stringify(expectedIds) !==
      JSON.stringify(records.map((record) => record.externalId))
  ) {
    failures.push("batch 10 ordered external-ID contract failed");
  }

  const directLinks = parseJsonl<{
    externalId: string;
    currentCanonicalId: string;
    targetCanonicalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
    conceptId: string;
    variantSpecificFeedbackRequired: boolean;
    canonicalReassignmentApplied: boolean;
    canonicalOverlayApplied: boolean;
    lowContextPolicyApplied: boolean;
    sourceNeededTheoryGate: boolean;
    answerKeyConflictPending: boolean;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-10/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  );
  if (
    directLinks.length !== 200 ||
    !sameExactSet(
      directLinks.map((row) => row.externalId),
      expectedIds,
    )
  ) {
    failures.push("batch 10 direct-theory matrix exact-set mismatch");
  }
  for (const row of directLinks) {
    const record = recordsById.get(row.externalId);
    if (
      !record?.theoryLink ||
      record.theoryLink.lessonId !== row.lessonId ||
      record.theoryLink.lessonAnchor !== row.lessonAnchor ||
      record.theoryLink.conceptGroupId !== row.conceptGroupId ||
      record.theoryLink.conceptId !== row.conceptId ||
      record.canonicalId !== row.targetCanonicalId ||
      record.currentCanonicalId !== row.currentCanonicalId ||
      Boolean(record.variantSpecificFeedbackRequired) !==
        row.variantSpecificFeedbackRequired ||
      (record.migration.canonicalAction === "REASSIGN_CANONICAL") !==
        row.canonicalReassignmentApplied ||
      (record.migration.canonicalAction === "APPLY_CANONICAL_OVERLAY") !==
        row.canonicalOverlayApplied ||
      row.sourceNeededTheoryGate ||
      (row.externalId === "2020-3B-Q28") !== row.answerKeyConflictPending
    ) {
      failures.push(`${row.externalId}: batch 10 direct-theory matrix mismatch`);
    }
  }

  const variantSpecificIds = new Set(
    records
      .filter((record) => record.variantSpecificFeedbackRequired)
      .map((record) => record.externalId),
  );
  verifyQueueExactSet(
    "batch 10 variant-specific choice queue",
    "docs/audit-work/cbt-system-migration/import-batch-10/variant-specific-choice-contract-queue.jsonl",
    variantSpecificIds,
  );
  verifyQueueExactSet(
    "batch 10 image-verification queue",
    "docs/audit-work/cbt-system-migration/import-batch-10/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 10 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-10/choice-conflict-queue.jsonl",
    new Set(["2019-2-Q86", "2020-12B-Q92"]),
  );
  verifyQueueExactSet(
    "batch 10 answer-key conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-10/answer-key-conflict-queue.jsonl",
    new Set(["2020-3B-Q28"]),
  );
  verifyQueueExactSet(
    "batch 10 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-10/canonical-reassignment-ledger.jsonl",
    new Set(["2020-12B-Q75", "2020-3B-Q26"]),
  );
  verifyQueueExactSet(
    "batch 10 canonical repair ledger",
    "docs/audit-work/cbt-system-migration/import-batch-10/canonical-theory-repair-ledger.jsonl",
    new Set(["2020-12B-Q86"]),
  );
  verifyQueueExactSet(
    "batch 10 low-context registration ledger",
    "docs/audit-work/cbt-system-migration/import-batch-10/low-context-registration-ledger.jsonl",
    new Set(batch.holdResolution.lowContextRegistered),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 187 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 2 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      11 ||
    variantSpecificIds.size !== 148 ||
    records.filter((record) => record.choiceIdMapping.length > 0).length !== 39 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 0 ||
    JSON.stringify(batch.canonicalQuestionChangeIds ?? []) !==
      JSON.stringify(["U-478"]) ||
    batch.lowContextRegistrationCount !== 31
  ) {
    failures.push("batch 10 summary counts changed unexpectedly");
  }

  for (const externalId of [
    "2019-2-Q94",
    "2019-2-Q99",
    "2020-12B-Q05",
    "2020-12B-Q08",
    "2020-12B-Q10",
    "2020-12B-Q85",
    "2020-12B-Q87",
    "2020-3B-Q04",
    "2020-3B-Q14",
    "2020-3B-Q39",
  ]) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "hold" ||
      record.review.issueLabel !== "필수 이미지 확인" ||
      record.reviewedAnswerIndex !== null ||
      record.reviewedAnswerText !== "" ||
      record.choiceIdMapping.length !== 0 ||
      !record.review.publicationBlockers.includes("required_source_image_review")
    ) {
      failures.push(`${externalId}: batch 10 image-HOLD contract failed`);
    }
  }

  for (const [externalId, expectedChoiceIndices] of [
    ["2019-2-Q86", [0, 3]],
    ["2020-12B-Q92", [2, 3]],
  ] as const) {
    const conflict = recordsById.get(externalId);
    if (
      conflict?.review.runtimeStatus !== "choice_conflict" ||
      conflict.reviewedAnswerIndex !== null ||
      conflict.reviewedAnswerText !== "" ||
      conflict.choiceIdMapping.length !== 0 ||
      conflict.choiceConflict?.scoringPolicy !== "non_scoring" ||
      JSON.stringify(conflict.choiceConflict.choiceIndices) !==
        JSON.stringify(expectedChoiceIndices) ||
      !conflict.directSolution.startsWith("선택지 충돌:")
    ) {
      failures.push(`${externalId}: batch 10 choice-conflict contract failed`);
    }
  }

  const answerKeyConflict = recordsById.get("2020-3B-Q28");
  if (
    answerKeyConflict?.review.runtimeStatus !== "hold" ||
    answerKeyConflict.review.issueLabel !== "정답키 충돌" ||
    answerKeyConflict.reviewedAnswerIndex !== null ||
    answerKeyConflict.reviewedAnswerText !== "" ||
    answerKeyConflict.choiceIdMapping.length !== 0 ||
    answerKeyConflict.review.scoringDisposition !==
      "excluded_answer_key_conflict" ||
    !answerKeyConflict.review.publicationBlockers.includes(
      "answer_key_correction_pending_runtime_validation",
    ) ||
    answerKeyConflict.migration.mappingClass !== "ANSWER_KEY_CONFLICT_HOLD"
  ) {
    failures.push("2020-3B-Q28: answer-key conflict isolation failed");
  }

  for (const externalId of batch.holdResolution.lowContextRegistered) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "published" ||
      record.review.theoryLinkStatus !==
        "direct_existing_theory_low_context_exam_intent" ||
      !record.review.answerConflictOrMultipleAnswerRisk
    ) {
      failures.push(`${externalId}: batch 10 low-context policy failed`);
    }
  }

  const reassignmentContracts = [
    {
      externalId: "2020-12B-Q75",
      currentCanonicalId: "U-325",
      targetCanonicalId: "U-787",
      lessonId: "lesson-1kx5x2w",
      lessonAnchor: "trap",
      conceptGroupId: "s4-g08",
      conceptId: "concept-1kx5x2w",
    },
    {
      externalId: "2020-3B-Q26",
      currentCanonicalId: "U-060",
      targetCanonicalId: "U-1109",
      lessonId: "lesson-c16ieq",
      lessonAnchor: "principle",
      conceptGroupId: "s4-g09",
      conceptId: "concept-c16ieq",
    },
  ];
  for (const contract of reassignmentContracts) {
    const record = recordsById.get(contract.externalId);
    if (
      !hasTheoryLink(record) ||
      record.currentCanonicalId !== contract.currentCanonicalId ||
      record.canonicalId !== contract.targetCanonicalId ||
      record.theoryLink.lessonId !== contract.lessonId ||
      record.theoryLink.lessonAnchor !== contract.lessonAnchor ||
      record.theoryLink.conceptGroupId !== contract.conceptGroupId ||
      record.theoryLink.conceptId !== contract.conceptId ||
      record.migration.mappingClass !== "SEMANTIC_REPLACE" ||
      record.migration.canonicalAction !== "REASSIGN_CANONICAL"
    ) {
      failures.push(`${contract.externalId}: canonical reassignment failed`);
    }
  }

  const repaired = recordsById.get("2020-12B-Q86");
  if (
    !hasTheoryLink(repaired) ||
    repaired.canonicalId !== "U-478" ||
    repaired.currentCanonicalId !== "U-478" ||
    repaired.theoryLink.lessonId !== "lesson-qnsesu" ||
    repaired.theoryLink.lessonAnchor !== "trap" ||
    repaired.theoryLink.conceptGroupId !== "s1-g06" ||
    repaired.theoryLink.conceptId !== "concept-qnsesu" ||
    repaired.migration.canonicalAction !== "APPLY_CANONICAL_OVERLAY" ||
    repaired.migration.theoryAction !==
      "RELINK_CANONICAL_TO_EXISTING_THEORY_GROUP"
  ) {
    failures.push("2020-12B-Q86: U-478 canonical taxonomy repair failed");
  }

  const theoryAdditions = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-10/theory-lesson-additions.json",
      "utf8",
    ),
  ) as unknown[];
  const canonicalChanges = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-10/canonical-question-changes.json",
      "utf8",
    ),
  ) as Array<{
    action: string;
    question: {
      id: string;
      conceptGroupId: string;
      lessonId: string;
      correctChoiceId: string;
      publication: { readiness: string; blockers: string[] };
    };
    affectedExternalIds: string[];
  }>;
  const canonicalChange = canonicalChanges[0];
  if (
    theoryAdditions.length !== 0 ||
    canonicalChanges.length !== 1 ||
    canonicalChange?.action !== "replace" ||
    canonicalChange.question.id !== "U-478" ||
    canonicalChange.question.conceptGroupId !== "s1-g06" ||
    canonicalChange.question.lessonId !== "lesson-qnsesu" ||
    canonicalChange.question.correctChoiceId !== "U-478-c2" ||
    canonicalChange.question.publication.readiness !== "blocked" ||
    !canonicalChange.question.publication.blockers.includes(
      "canonical_theory_repair_runtime_validation",
    ) ||
    JSON.stringify(canonicalChange.affectedExternalIds) !==
      JSON.stringify(["2007-4-Q84", "2020-12B-Q86"])
  ) {
    failures.push("batch 10 U-478 canonical overlay contract failed");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-10/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Expected: string;
    contentHashBindingVerified: boolean;
    formulaUnitSubstitutionCount: number;
    dryRunMappingSha256: string;
    canonicalReferenceSha256: string;
    canonicalReassignmentCount: number;
    canonicalTheoryRepairCount: number;
    answerKeyConflictCount: number;
    canonicalQuestionChangeCount: number;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  const dryRunMappingSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-10/mapping-dry-run-input.jsonl",
      "utf8",
    ),
  );
  const canonicalReferenceSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-10/canonical-reference-ledger.jsonl",
      "utf8",
    ),
  );
  if (
    !batchSummary.contentHashBindingVerified ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Expected ||
    dryRunMappingSha256 !== batchSummary.dryRunMappingSha256 ||
    canonicalReferenceSha256 !== batchSummary.canonicalReferenceSha256 ||
    batchSummary.formulaUnitSubstitutionCount !== 7 ||
    batchSummary.canonicalReassignmentCount !== 2 ||
    batchSummary.canonicalTheoryRepairCount !== 1 ||
    batchSummary.answerKeyConflictCount !== 1 ||
    batchSummary.canonicalQuestionChangeCount !== 1
  ) {
    failures.push("batch 10 source/formula/canonical binding contract failed");
  }
}


function verifyBatch11Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-11",
  );
  if (!batch) {
    failures.push("batch 11 metadata is missing");
    return;
  }

  const records = reviewedCbtVariantManifest.records.slice(1970, 2162);
  const batchIds = new Set(records.map((record) => record.externalId));
  const recordsByBatchId = new Map(
    records.map((record) => [record.externalId, record]),
  );
  if (
    records.length !== 192 ||
    batchIds.size !== 192 ||
    records[0]?.externalId !== "2020-3B-Q51" ||
    records.at(-1)?.externalId !== "2021-1-Q100"
  ) {
    failures.push("batch 11 record range or exact set changed unexpectedly");
  }

  verifyQueueExactSet(
    "batch 11 image queue",
    "docs/audit-work/cbt-system-migration/import-batch-11/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 11 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-11/canonical-reassignment-ledger.jsonl",
    new Set(["2021-1-Q100"]),
  );
  verifyQueueExactSet(
    "batch 11 low-context registration ledger",
    "docs/audit-work/cbt-system-migration/import-batch-11/low-context-registration-ledger.jsonl",
    new Set(batch.holdResolution.lowContextRegistered),
  );
  verifyQueueExactSet(
    "batch 11 variant-specific queue",
    "docs/audit-work/cbt-system-migration/import-batch-11/variant-specific-choice-contract-queue.jsonl",
    new Set(
      records
        .filter((record) => record.variantSpecificFeedbackRequired)
        .map((record) => record.externalId),
    ),
  );
  verifyQueueExactSet(
    "batch 11 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-11/choice-conflict-queue.jsonl",
    new Set(),
  );
  verifyQueueExactSet(
    "batch 11 answer-key conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-11/answer-key-conflict-queue.jsonl",
    new Set(),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 182 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      10 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 0 ||
    records.filter((record) => record.choiceIdMapping.length > 0).length !== 48 ||
    records.filter((record) => record.variantSpecificFeedbackRequired).length !==
      134 ||
    batch.lowContextRegistrationCount !== 25 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 0 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 0
  ) {
    failures.push("batch 11 summary counts changed unexpectedly");
  }

  const imageHoldIds = [
    "2020-3B-Q62",
    "2020-3B-Q81",
    "2020-3B-Q97",
    "2020-4-Q02",
    "2020-4-Q37",
    "2020-4-Q53",
    "2020-4-Q89",
    "2020-4-Q91",
    "2021-1-Q27",
    "2021-1-Q30",
  ];
  if (!sameExactSet(batch.holdResolution.imageVerificationQueue, imageHoldIds)) {
    failures.push("batch 11 image-HOLD exact set changed unexpectedly");
  }
  for (const externalId of imageHoldIds) {
    const record = recordsByBatchId.get(externalId);
    if (
      record?.review.runtimeStatus !== "hold" ||
      record.review.issueLabel !== "필수 이미지 확인" ||
      record.reviewedAnswerIndex !== null ||
      record.reviewedAnswerText !== "" ||
      record.choiceIdMapping.length !== 0 ||
      !record.review.publicationBlockers.includes("required_source_image_review") ||
      record.migration.mappingClass !== "IMAGE_VERIFICATION_HOLD"
    ) {
      failures.push(`${externalId}: batch 11 image-HOLD contract failed`);
    }
  }

  for (const externalId of batch.holdResolution.lowContextRegistered) {
    const record = recordsByBatchId.get(externalId);
    if (
      record?.review.runtimeStatus !== "published" ||
      record.review.theoryLinkStatus !==
        "direct_existing_theory_low_context_exam_intent" ||
      !record.review.answerConflictOrMultipleAnswerRisk
    ) {
      failures.push(`${externalId}: batch 11 low-context policy failed`);
    }
  }

  const reassigned = recordsByBatchId.get("2021-1-Q100");
  if (
    !hasTheoryLink(reassigned) ||
    reassigned.currentCanonicalId !== "U-170" ||
    reassigned.canonicalId !== "U-1236" ||
    reassigned.theoryLink.lessonId !== "lesson-10hvc85" ||
    reassigned.theoryLink.lessonAnchor !== "principle" ||
    reassigned.theoryLink.conceptGroupId !== "s1-g04" ||
    reassigned.theoryLink.conceptId !== "concept-10hvc85" ||
    reassigned.migration.mappingClass !== "SEMANTIC_REPLACE" ||
    reassigned.migration.canonicalAction !== "REASSIGN_CANONICAL" ||
    reassigned.migration.theoryAction !== "USE_TARGET_CANONICAL_DIRECT_THEORY" ||
    !reassigned.variantSpecificFeedbackRequired ||
    reassigned.choiceIdMapping.length !== 0 ||
    !reassigned.review.publicationBlockers.includes(
      "variant_specific_choice_contract_pending",
    )
  ) {
    failures.push("2021-1-Q100: valve-chattering canonical reassignment failed");
  }

  const theoryAdditions = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-11/theory-lesson-additions.json",
      "utf8",
    ),
  ) as unknown[];
  const canonicalChanges = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-11/canonical-question-changes.json",
      "utf8",
    ),
  ) as unknown[];
  if (theoryAdditions.length !== 0 || canonicalChanges.length !== 0) {
    failures.push("batch 11 unexpectedly added theory or canonical overlays");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-11/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Expected: string;
    contentHashBindingVerified: boolean;
    formulaUnitSubstitutionCount: number;
    dryRunMappingSha256: string;
    canonicalReferenceSha256: string;
    canonicalReassignmentCount: number;
    canonicalTheoryRepairCount: number;
    answerKeyConflictCount: number;
    canonicalQuestionChangeCount: number;
    cumulativeRecordCount: number;
    unreviewedRecordCount: number;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  const dryRunMappingSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-11/mapping-dry-run-input.jsonl",
      "utf8",
    ),
  );
  const canonicalReferenceSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-11/canonical-reference-ledger.jsonl",
      "utf8",
    ),
  );
  if (
    !batchSummary.contentHashBindingVerified ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Expected ||
    dryRunMappingSha256 !== batchSummary.dryRunMappingSha256 ||
    canonicalReferenceSha256 !== batchSummary.canonicalReferenceSha256 ||
    batchSummary.formulaUnitSubstitutionCount !== 4 ||
    batchSummary.canonicalReassignmentCount !== 1 ||
    batchSummary.canonicalTheoryRepairCount !== 0 ||
    batchSummary.answerKeyConflictCount !== 0 ||
    batchSummary.canonicalQuestionChangeCount !== 0 ||
    batchSummary.cumulativeRecordCount !== 2162 ||
    batchSummary.unreviewedRecordCount !== 222
  ) {
    failures.push("batch 11 source/formula/canonical binding contract failed");
  }
}

function verifyBatch12Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-12",
  );
  if (!batch) {
    failures.push("batch 12 metadata is missing");
    return;
  }

  const records = reviewedCbtVariantManifest.records.slice(2162, 2384);
  const recordsByBatchId = new Map(
    records.map((record) => [record.externalId, record]),
  );
  if (
    records.length !== 222 ||
    new Set(records.map((record) => record.externalId)).size !== 222 ||
    records[0]?.externalId !== "2021-2-Q01" ||
    records.at(-1)?.externalId !== "2022-2-Q80"
  ) {
    failures.push("batch 12 record range or exact set changed unexpectedly");
  }

  verifyQueueExactSet(
    "batch 12 image queue",
    "docs/audit-work/cbt-system-migration/import-batch-12/image-verification-queue.jsonl",
    new Set(batch.holdResolution.imageVerificationQueue),
  );
  verifyQueueExactSet(
    "batch 12 choice-conflict queue",
    "docs/audit-work/cbt-system-migration/import-batch-12/choice-conflict-queue.jsonl",
    new Set(["2021-2-Q13"]),
  );
  verifyQueueExactSet(
    "batch 12 canonical reassignment ledger",
    "docs/audit-work/cbt-system-migration/import-batch-12/canonical-reassignment-ledger.jsonl",
    new Set([
      "2022-1-Q02",
      "2022-1-Q31",
      "2022-1-Q43",
      "2022-1-Q70",
      "2022-2-Q40",
      "2022-2-Q44",
    ]),
  );
  verifyQueueExactSet(
    "batch 12 pending taxonomy-repair ledger",
    "docs/audit-work/cbt-system-migration/import-batch-12/canonical-theory-repair-ledger.jsonl",
    new Set(["2022-1-Q61", "2022-2-Q65"]),
  );
  verifyQueueExactSet(
    "batch 12 low-context registration ledger",
    "docs/audit-work/cbt-system-migration/import-batch-12/low-context-registration-ledger.jsonl",
    new Set(batch.holdResolution.lowContextRegistered),
  );
  verifyQueueExactSet(
    "batch 12 variant-specific queue",
    "docs/audit-work/cbt-system-migration/import-batch-12/variant-specific-choice-contract-queue.jsonl",
    new Set(
      records
        .filter((record) => record.variantSpecificFeedbackRequired)
        .map((record) => record.externalId),
    ),
  );

  if (
    records.filter((record) => record.review.runtimeStatus === "published")
      .length !== 210 ||
    records.filter((record) => record.review.runtimeStatus === "hold").length !==
      11 ||
    records.filter(
      (record) => record.review.runtimeStatus === "choice_conflict",
    ).length !== 1 ||
    records.filter((record) => record.choiceIdMapping.length > 0).length !== 45 ||
    records.filter((record) => record.variantSpecificFeedbackRequired).length !==
      165 ||
    batch.lowContextRegistrationCount !== 30 ||
    (batch.theoryLessonAdditionIds?.length ?? 0) !== 0 ||
    (batch.canonicalQuestionChangeIds?.length ?? 0) !== 0
  ) {
    failures.push("batch 12 summary counts changed unexpectedly");
  }

  const imageHoldIds = [
    "2021-2-Q01",
    "2021-2-Q06",
    "2021-2-Q27",
    "2021-2-Q97",
    "2021-4-Q05",
    "2022-1-Q75",
    "2022-1-Q80",
    "2022-2-Q13",
    "2022-2-Q14",
    "2022-2-Q22",
    "2022-2-Q27",
  ];
  if (!sameExactSet(batch.holdResolution.imageVerificationQueue, imageHoldIds)) {
    failures.push("batch 12 image-HOLD exact set changed unexpectedly");
  }
  for (const externalId of imageHoldIds) {
    const record = recordsByBatchId.get(externalId);
    if (
      record?.review.runtimeStatus !== "hold" ||
      record.review.issueLabel !== "필수 이미지 확인" ||
      record.reviewedAnswerIndex !== null ||
      record.reviewedAnswerText !== "" ||
      record.choiceIdMapping.length !== 0 ||
      !record.review.publicationBlockers.includes("required_source_image_review") ||
      record.migration.mappingClass !== "IMAGE_VERIFICATION_HOLD"
    ) {
      failures.push(`${externalId}: batch 12 image-HOLD contract failed`);
    }
  }

  const conflict = recordsByBatchId.get("2021-2-Q13");
  if (
    conflict?.review.runtimeStatus !== "choice_conflict" ||
    conflict.review.issueLabel !== "선택지 충돌" ||
    conflict.reviewedAnswerIndex !== null ||
    conflict.reviewedAnswerText !== "" ||
    conflict.choiceIdMapping.length !== 0 ||
    conflict.migration.mappingClass !== "CHOICE_CONFLICT_NON_SCORING" ||
    !conflict.review.publicationBlockers.includes(
      "choice_conflict_non_scoring",
    )
  ) {
    failures.push("2021-2-Q13: choice-conflict contract failed");
  }

  const reassignments: Array<
    [string, string, string, string, string, string, string]
  > = [
    ["2022-1-Q02", "U-RMS-001", "U-812", "lesson-68po9a", "principle", "s4-g02", "concept-68po9a"],
    ["2022-1-Q31", "U-187", "U-829", "lesson-qih1ef", "principle", "s4-g08", "concept-qih1ef"],
    ["2022-1-Q43", "U-197", "U-136", "lesson-o98wx8", "diagnosis", "s3-g06", "concept-o98wx8"],
    ["2022-1-Q70", "U-210", "U-1180", "lesson-1mpu74e", "principle", "s1-g12", "concept-1mpu74e"],
    ["2022-2-Q40", "U-233", "U-640", "lesson-17ocpdn", "trap", "s4-g12", "concept-17ocpdn"],
    ["2022-2-Q44", "U-237", "U-661", "lesson-z6u1mg", "principle", "s3-g03", "concept-z6u1mg"],
  ];
  for (const [externalId, currentId, targetId, lessonId, anchor, groupId, conceptId] of reassignments) {
    const record = recordsByBatchId.get(externalId);
    if (
      !hasTheoryLink(record) ||
      record.currentCanonicalId !== currentId ||
      record.canonicalId !== targetId ||
      record.theoryLink.lessonId !== lessonId ||
      record.theoryLink.lessonAnchor !== anchor ||
      record.theoryLink.conceptGroupId !== groupId ||
      record.theoryLink.conceptId !== conceptId ||
      record.migration.mappingClass !== "SEMANTIC_REPLACE" ||
      record.migration.canonicalAction !== "REASSIGN_CANONICAL" ||
      record.migration.theoryAction !== "USE_TARGET_CANONICAL_DIRECT_THEORY"
    ) {
      failures.push(`${externalId}: batch 12 canonical reassignment failed`);
    }
  }

  const pendingTaxonomyRepairs: Array<
    [string, string, string, string, string]
  > = [
    [
      "2022-1-Q61",
      "U-208",
      "s1-g08",
      "유압 유량·속도제어 계열",
      "direct_concept_group_taxonomy_mismatch_hydraulic_regeneration_in_pneumatic_group",
    ],
    [
      "2022-2-Q65",
      "U-250",
      "s1-g02",
      "공압 액추에이터·방향제어 계열",
      "direct_concept_group_taxonomy_mismatch_pneumatic_stopper_cylinder_in_hydraulic_group",
    ],
  ];
  for (const [externalId, canonicalId, currentGroupId, targetFamily, sourceBlocker] of pendingTaxonomyRepairs) {
    const record = recordsByBatchId.get(externalId);
    if (!hasTheoryLink(record)) {
      failures.push(`${externalId}: pending taxonomy-repair contract failed`);
      continue;
    }
    const migration = record.migration as TaxonomyRepairMigration;
    const repair = migration.taxonomyRepair;
    if (
      record.canonicalId !== canonicalId ||
      record.review.runtimeStatus !== "published" ||
      record.theoryLink.conceptGroupId !== currentGroupId ||
      record.migration.mappingClass !== "THEORY_TAXONOMY_REPAIR_PENDING" ||
      record.migration.canonicalAction !==
        "PRESERVE_CURRENT_CANONICAL_PENDING_TAXONOMY_REPAIR" ||
      record.migration.theoryAction !==
        "PRESERVE_AUDIT_THEORY_PENDING_EXACT_TAXONOMY_TARGET" ||
      repair?.applied !== false ||
      repair.currentConceptGroupId !== currentGroupId ||
      repair.targetConceptGroupId !== null ||
      repair.sourceStatedTargetFamily !== targetFamily ||
      !record.review.publicationBlockers.includes(sourceBlocker) ||
      !record.review.publicationBlockers.includes(
        "canonical_theory_repair_exact_target_pending",
      )
    ) {
      failures.push(`${externalId}: pending taxonomy-repair contract failed`);
    }
  }

  const theoryAdditions = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-12/theory-lesson-additions.json",
      "utf8",
    ),
  ) as unknown[];
  const canonicalChanges = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-12/canonical-question-changes.json",
      "utf8",
    ),
  ) as unknown[];
  const repairLedger = parseJsonl<{
    externalId: string;
    applied: boolean;
    targetConceptGroupId: string | null;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-12/canonical-theory-repair-ledger.jsonl",
      "utf8",
    ),
  );
  if (
    theoryAdditions.length !== 0 ||
    canonicalChanges.length !== 0 ||
    repairLedger.length !== 2 ||
    repairLedger.some(
      (repair) => repair.applied || repair.targetConceptGroupId !== null,
    )
  ) {
    failures.push("batch 12 conservative taxonomy boundary failed");
  }

  const batchSummary = JSON.parse(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-12/batch-summary.json",
      "utf8",
    ),
  ) as {
    sourceContentSha256Expected: string;
    contentHashBindingVerified: boolean;
    formulaUnitSubstitutionCount: number;
    dryRunMappingSha256: string;
    canonicalReferenceSha256: string;
    canonicalReassignmentCount: number;
    canonicalTheoryRepairAppliedCount: number;
    canonicalTheoryRepairPendingCount: number;
    canonicalQuestionChangeCount: number;
    cumulativeRecordCount: number;
    unreviewedRecordCount: number;
    allSourceVariantsCovered: boolean;
  };
  const sourceContentSha256 = sha256(
    readFileSync("src/data/generated/content.json", "utf8"),
  );
  const dryRunMappingSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-12/mapping-dry-run-input.jsonl",
      "utf8",
    ),
  );
  const canonicalReferenceSha256 = sha256(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-12/canonical-reference-ledger.jsonl",
      "utf8",
    ),
  );
  if (
    !batchSummary.contentHashBindingVerified ||
    sourceContentSha256 !== batchSummary.sourceContentSha256Expected ||
    dryRunMappingSha256 !== batchSummary.dryRunMappingSha256 ||
    canonicalReferenceSha256 !== batchSummary.canonicalReferenceSha256 ||
    batchSummary.formulaUnitSubstitutionCount !== 11 ||
    batchSummary.canonicalReassignmentCount !== 6 ||
    batchSummary.canonicalTheoryRepairAppliedCount !== 0 ||
    batchSummary.canonicalTheoryRepairPendingCount !== 2 ||
    batchSummary.canonicalQuestionChangeCount !== 0 ||
    batchSummary.cumulativeRecordCount !== 2384 ||
    batchSummary.unreviewedRecordCount !== 0 ||
    !batchSummary.allSourceVariantsCovered
  ) {
    failures.push("batch 12 source/formula/canonical binding contract failed");
  }
}

function verifyBatch13Contracts() {
  const batch = reviewedCbtVariantManifest.batches.find(
    (candidate) => candidate.batchId === "import-13",
  );
  if (!batch) {
    failures.push("batch 13 metadata is missing");
    return;
  }

  if (
    reviewedCbtVariantManifest.batches.at(-1)?.batchId !== "import-13" ||
    batch.recordCount !== 0 ||
    batch.candidateCount !== 0 ||
    batch.choiceConflictCount !== 0 ||
    batch.holdCount !== 0 ||
    (batch.variantSpecificFeedbackCount ?? 0) !== 0 ||
    reviewedCbtVariantManifest.records.length !== 2384
  ) {
    failures.push("batch 13 zero-record integration metadata is invalid");
  }

  const expectedCorrectionKinds = new Map([
    ["canonical_previous_digest_rebind", 2],
    ["record_theory_link_supersession", 2],
    ["choice_conflict_contract_normalization", 5],
    ["runtime_validator_contract_fix", 1],
    ["runtime_publication_precedence_fix", 1],
    ["runtime_taxonomy_repair_override", 1],
  ]);
  for (const [kind, expected] of expectedCorrectionKinds) {
    const actual = batch13Corrections.filter(
      (correction) => correction.kind === kind,
    ).length;
    if (actual !== expected) {
      failures.push(`batch 13 correction kind ${kind}: ${actual} != ${expected}`);
    }
  }
  if (batch13Corrections.length !== 12) {
    failures.push("batch 13 correction ledger count changed unexpectedly");
  }

  const sourceQuestionsById = new Map(
    source.questions.map((question) => [question.id, question]),
  );
  for (const canonicalId of ["U-649", "U-478"]) {
    const change = reviewedCbtVariantManifest.canonicalQuestionChanges?.find(
      (candidate) => candidate.question.id === canonicalId,
    );
    const sourceQuestion = sourceQuestionsById.get(canonicalId);
    const correction = batch13Corrections.find(
      (candidate) =>
        candidate.kind === "canonical_previous_digest_rebind" &&
        candidate.canonicalId === canonicalId,
    );
    const actualDigest = sourceQuestion
      ? sha256(JSON.stringify(sourceQuestion))
      : "";
    if (
      !change ||
      !sourceQuestion ||
      change.previousQuestionSha256 !== actualDigest ||
      change.previousQuestionHashBasis !==
        ("content_json_full_question_contract" as const) ||
      correction?.afterSha256 !== actualDigest
    ) {
      failures.push(`${canonicalId}: batch 13 canonical digest rebind failed`);
    }
  }

  const recordLinkExpectations = [
    [
      "2015-2-Q23",
      "U-649",
      "lesson-cbt-gang-system-process-layout",
      "definition",
      "s4-g10",
      "concept-cd7x17",
    ],
    [
      "2007-4-Q84",
      "U-478",
      "lesson-qnsesu",
      "trap",
      "s1-g06",
      "concept-qnsesu",
    ],
  ] as const;
  for (const [externalId, canonicalId, lessonId, anchor, groupId, conceptId] of recordLinkExpectations) {
    const record = recordsById.get(externalId);
    if (
      record?.canonicalId !== canonicalId ||
      record.theoryLink?.lessonId !== lessonId ||
      record.theoryLink.lessonAnchor !== anchor ||
      record.theoryLink.conceptGroupId !== groupId ||
      record.theoryLink.conceptId !== conceptId ||
      !batch13RecordSupersessions.has(externalId) ||
      (externalId === "2015-2-Q23" &&
        (!record.variantSpecificFeedbackRequired ||
          !record.review.publicationBlockers.includes(
            "variant_specific_choice_contract_pending",
          )))
    ) {
      failures.push(`${externalId}: batch 13 cross-batch theory repair failed`);
    }
  }

  const conflictExpectations = new Map([
    ["2018-2-Q10", "no_unique_answer_all_choices_resistance_based"],
    ["2019-2-Q32", "multiple_incorrect_choices"],
    ["2019-2-Q86", "multiple_incorrect_choices"],
    ["2020-12B-Q92", "official_multiple_answers"],
    ["2021-2-Q13", "official_multiple_answers"],
  ]);
  for (const [externalId, conflictType] of conflictExpectations) {
    const record = recordsById.get(externalId);
    if (
      record?.review.runtimeStatus !== "choice_conflict" ||
      record.review.scoringDisposition !== "non_scoring_choice_conflict" ||
      record.choiceConflict?.label !== "선택지 충돌" ||
      record.choiceConflict.conflictType !== conflictType ||
      record.choiceConflict.scoringPolicy !== "non_scoring" ||
      !record.choiceConflict.sourceAnswerTreatment.trim() ||
      !record.directSolution.startsWith("선택지 충돌:")
    ) {
      failures.push(`${externalId}: batch 13 conflict normalization failed`);
    }
  }

  const answerKeyHold = recordsById.get("2020-3B-Q28");
  if (
    answerKeyHold?.review.runtimeStatus !== "hold" ||
    answerKeyHold.review.issueLabel !== "정답키 충돌" ||
    answerKeyHold.review.scoringDisposition !== "excluded_answer_key_conflict" ||
    answerKeyHold.reviewedAnswerIndex !== null ||
    answerKeyHold.choiceIdMapping.length !== 0 ||
    answerKeyHold.migration.mappingClass !== "ANSWER_KEY_CONFLICT_HOLD"
  ) {
    failures.push("2020-3B-Q28: batch 13 answer-key HOLD contract failed");
  }

  for (const canonicalId of ["U-1161", "U-1166", "U-1089"]) {
    const question = runtimeQuestionsById.get(canonicalId);
    if (
      !question ||
      question.contentStatus === "published" ||
      question.publication?.readiness === "ready" ||
      !question.publication?.blockers.includes("answer_conflict") ||
      question.audit?.auditDisposition !== "held_answer_conflict"
    ) {
      failures.push(
        `${canonicalId}: legacy written audit overrode the newer non-scoring gate`,
      );
    }
    const lesson = question
      ? runtimeLessonsById.get(question.lessonId)
      : undefined;
    if (
      !lesson ||
      lesson.contentStatus === "published" ||
      lesson.publication?.readiness === "ready"
    ) {
      failures.push(`${canonicalId}: gated canonical lesson was published`);
    }
  }

  if (!batch.canonicalTheoryRepairs.includes("lesson-qnsesu:s1-g06")) {
    failures.push("batch 13 taxonomy repair override is missing");
  }
  const repairedQuestion = runtimeQuestionsById.get("U-478");
  const repairedLesson = runtimeLessonsById.get("lesson-qnsesu");
  if (
    repairedQuestion?.conceptGroupId !== "s1-g06" ||
    repairedLesson?.conceptGroupId !== "s1-g06"
  ) {
    failures.push(
      "batch 13 taxonomy repair metadata did not propagate to runtime content",
    );
  }

  if (repairedQuestion?.audit?.auditDisposition !== "held_runtime_validation") {
    failures.push("U-478: runtime-validation audit hold is missing");
  }
  const gangSystemQuestion = runtimeQuestionsById.get("U-649");
  if (gangSystemQuestion?.audit?.auditDisposition !== "held_source_missing") {
    failures.push("U-649: source-missing audit hold is missing");
  }

  const restoredSources = parseJsonl<{
    path: string;
    sha256: string;
    size: number;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-13/restored-source-files-ledger.jsonl",
      "utf8",
    ),
  );
  if (restoredSources.length !== 16) {
    failures.push("batch 13 restored-source ledger count changed unexpectedly");
  }
  for (const restored of restoredSources) {
    const raw = normalizeTextFile(readFileSync(restored.path, "utf8"));
    if (
      Buffer.byteLength(raw, "utf8") !== restored.size ||
      sha256(raw) !== restored.sha256
    ) {
      failures.push(`${restored.path}: restored source integrity mismatch`);
    }
  }

  const historicalBatch06 = parseJsonl<{
    externalId: string;
    lessonId: string;
    lessonAnchor: string;
    conceptGroupId: string;
  }>(
    readFileSync(
      "docs/audit-work/cbt-system-migration/import-batch-06/direct-theory-link-matrix.jsonl",
      "utf8",
    ),
  ).find((row) => row.externalId === "2015-2-Q23");
  if (
    historicalBatch06?.lessonId !== "lesson-zoxye2" ||
    historicalBatch06.lessonAnchor !== "principle" ||
    historicalBatch06.conceptGroupId !== "s4-g07"
  ) {
    failures.push("batch 13 mutated the historical batch 06 theory matrix");
  }
}

function verifySupabaseProjection() {
  const plan = buildSupabaseMaterialization(
    runtime,
    "00000000-0000-0000-0000-000000000001",
  );
  const reviewedIds = new Set(recordsById.keys());
  const reviewedRows = plan.questionVariants.filter((row) =>
    reviewedIds.has(row.external_id),
  );
  const rowStates = reviewedRows.reduce<Record<string, number>>(
    (counts, row) => {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
      return counts;
    },
    {},
  );
  if (
    (rowStates.published ?? 0) !== 2267 ||
    (rowStates.draft ?? 0) !== 117
  ) {
    failures.push("Supabase reviewed CBT projection must preserve 2267 published and 117 excluded rows");
  }
  const forbiddenKeys = new Set([
    "reviewedAnswerIndex",
    "sourceAnswerIndex",
    "directSolution",
    "choiceByChoiceReasons",
    "reviewedAnswerText",
    "sourceAnswerText",
    "choiceIdMapping",
  ]);
  for (const row of reviewedRows) {
    const leakedKey = findForbiddenKey(row.payload, forbiddenKeys);
    if (leakedKey) {
      failures.push(
        `${row.external_id}: pre-submit Supabase payload leaks ${leakedKey}`,
      );
    }
  }
}

function verifyQueueExactSet(
  label: string,
  path: string,
  expected: Set<string>,
) {
  const rows = parseJsonl<{ externalId: string }>(readFileSync(path, "utf8"));
  if (!sameExactSet(rows.map((row) => row.externalId), [...expected])) {
    failures.push(`${label} exact-set mismatch`);
  }
}

function countStates(variants: GeneratedContent["variants"]) {
  return variants.reduce<Record<string, number>>((counts, variant) => {
    const state = variant.reviewState ?? "legacy";
    counts[state] = (counts[state] ?? 0) + 1;
    return counts;
  }, {});
}

function countRecordStates(
  records: typeof reviewedCbtVariantManifest.records,
) {
  return records.reduce<Record<string, number>>((counts, record) => {
    const state = record.review.runtimeStatus;
    counts[state] = (counts[state] ?? 0) + 1;
    return counts;
  }, {});
}

function parseJsonl<T>(value: string): T[] {
  return value
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function sameExactSet(left: string[], right: string[]) {
  if (
    left.length !== right.length ||
    new Set(left).size !== left.length ||
    new Set(right).size !== right.length
  ) {
    return false;
  }
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function findForbiddenKey(
  value: unknown,
  forbiddenKeys: Set<string>,
): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findForbiddenKey(item, forbiddenKeys);
      if (match) return match;
    }
    return null;
  }
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) return key;
    const match = findForbiddenKey(child, forbiddenKeys);
    if (match) return match;
  }
  return null;
}

function sha256(value: string) {
  return createHash("sha256")
    .update(normalizeTextFile(value), "utf8")
    .digest("hex");
}

function normalizeTextFile(value: string) {
  return value.replace(/\r\n/gu, "\n");
}
