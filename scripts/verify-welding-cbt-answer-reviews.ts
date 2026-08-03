import rawWeldingCbtBank from "../src/data/generated/welding-cbt-bank.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  validateWeldingCbtAnswerReviews,
  type WeldingCbtAnswerReviewError,
} from "../src/data/source/welding-cbt-answer-review";
import { weldingCbtLeafLessons } from "../src/lib/content/welding-cbt-leaf-lessons";

type BankRecord = (typeof rawWeldingCbtBank.records)[number];

const allowPending = process.argv.includes("--allow-pending");
const errors: WeldingCbtAnswerReviewError[] = [
  ...validateWeldingCbtAnswerReviews().errors,
];
const bankByCanonicalId = new Map<string, BankRecord[]>();
for (const record of rawWeldingCbtBank.records) {
  const current = bankByCanonicalId.get(record.canonicalId) ?? [];
  current.push(record);
  bankByCanonicalId.set(record.canonicalId, current);
}
const lessonById = new Map(
  weldingCbtLeafLessons.map((lesson) => [lesson.id, lesson]),
);

function error(code: string, canonicalId: string | null, detail: string) {
  errors.push({ code, canonicalId, detail });
}

function normalize(value: string) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

for (const entry of WELDING_CBT_ANSWER_REVIEWS.entries) {
  if (entry.authoringDisposition !== "publish_candidate") continue;
  const records = bankByCanonicalId.get(entry.canonicalId) ?? [];
  const representative = records[0];
  if (!representative) {
    error("ANSWER_REVIEW_BANK_RECORD_MISSING", entry.canonicalId, "no source record");
    continue;
  }
  const choiceFeedback = entry.choiceFeedback ?? [];
  const expectedIndices = representative.choices.map((_, index) => index);
  const actualIndices = choiceFeedback
    .map((feedback) => feedback.choiceIndex)
    .sort((left, right) => left - right);
  if (JSON.stringify(actualIndices) !== JSON.stringify(expectedIndices)) {
    error(
      "ANSWER_REVIEW_CHOICE_EXACT_SET_MISMATCH",
      entry.canonicalId,
      `expected=${expectedIndices.join(",")} actual=${actualIndices.join(",")}`,
    );
  }
  const supports = choiceFeedback.filter(
    (feedback) => feedback.relation === "supports",
  );
  if (
    supports.length !== 1
    || supports[0]?.choiceIndex !== representative.correctIndex
  ) {
    error(
      "ANSWER_REVIEW_CORRECT_CHOICE_BINDING_MISMATCH",
      entry.canonicalId,
      `correctIndex=${representative.correctIndex ?? "null"}`,
    );
  }
  for (const feedback of choiceFeedback) {
    const isCorrect = feedback.choiceIndex === representative.correctIndex;
    if (
      (isCorrect && (
        feedback.incorrectPoint !== null
        || feedback.differenceFromCorrect !== null
      ))
      || (!isCorrect && (
        feedback.incorrectPoint === null
        || feedback.differenceFromCorrect === null
        || feedback.relation === "supports"
      ))
    ) {
      error(
        "ANSWER_REVIEW_CHOICE_FEEDBACK_POLARITY_MISMATCH",
        entry.canonicalId,
        `choiceIndex=${feedback.choiceIndex}`,
      );
    }
  }

  const binding = entry.conceptBinding;
  const lesson = binding ? lessonById.get(binding.lessonId) : null;
  const block = lesson?.blocks.find(
    (candidate) => candidate.id === binding?.lessonBlockId,
  );
  if (!binding || !lesson || !block) {
    error(
      "ANSWER_REVIEW_CONCEPT_BINDING_MISSING",
      entry.canonicalId,
      binding
        ? `${binding.lessonId}#${binding.lessonBlockId}`
        : "null binding",
    );
  } else if (
    binding.lessonId !== entry.primaryLeafLessonId
    || !binding.evidenceRefs.some(
      (reference) =>
        reference.kind === "lesson_block"
        && reference.ref === `${binding.lessonId}#${binding.lessonBlockId}`,
    )
  ) {
    error(
      "ANSWER_REVIEW_LESSON_BLOCK_EVIDENCE_MISSING",
      entry.canonicalId,
      `${binding.lessonId}#${binding.lessonBlockId}`,
    );
  }
  if (
    !binding?.evidenceRefs.some(
      (reference) =>
        reference.kind === "source_question"
        && reference.ref === entry.canonicalId,
    )
  ) {
    error(
      "ANSWER_REVIEW_SOURCE_QUESTION_EVIDENCE_MISSING",
      entry.canonicalId,
      entry.canonicalId,
    );
  }
  const feedbackSignatures = choiceFeedback.map((feedback) => {
    const { choiceIndex, relation, ...explanation } = feedback;
    void choiceIndex;
    void relation;
    return JSON.stringify(explanation);
  });
  if (new Set(feedbackSignatures).size !== feedbackSignatures.length) {
    error(
      "ANSWER_REVIEW_COPIED_CHOICE_FEEDBACK",
      entry.canonicalId,
      "choice feedback must explain each actual choice separately",
    );
  }
  if (
    entry.assessmentKind === "calculation"
    && (
      entry.solutionSteps.length < 2
      || !entry.conceptBinding?.evidenceRefs.some(
        (reference) => reference.kind === "calculation_derivation",
      )
    )
  ) {
    error(
      "ANSWER_REVIEW_CALCULATION_DERIVATION_MISSING",
      entry.canonicalId,
      "calculation requires at least two steps and a derivation reference",
    );
  }
  if (
    entry.assessmentKind === "safety"
    && !entry.conceptBinding?.evidenceRefs.some(
      (reference) =>
        reference.kind === "official_source"
        && /^https:\/\/(?:[^/]+\.)?(?:kosha\.or\.kr|law\.go\.kr|moel\.go\.kr|q-net\.or\.kr|ncs\.go\.kr)\//u
          .test(reference.ref),
    )
  ) {
    error(
      "ANSWER_REVIEW_SAFETY_OFFICIAL_SOURCE_MISSING",
      entry.canonicalId,
      "safety review requires an official source reference",
    );
  }
}

if (!allowPending && WELDING_CBT_ANSWER_REVIEWS.validation.stats.pending > 0) {
  error(
    "ANSWER_REVIEW_INCOMPLETE",
    null,
    `pending=${WELDING_CBT_ANSWER_REVIEWS.validation.stats.pending}`,
  );
}

const report = {
  ok: errors.length === 0,
  allowPending,
  entryCount: WELDING_CBT_ANSWER_REVIEWS.entries.length,
  stats: WELDING_CBT_ANSWER_REVIEWS.validation.stats,
  authoringStats: WELDING_CBT_ANSWER_REVIEWS.validation.authoringStats,
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
