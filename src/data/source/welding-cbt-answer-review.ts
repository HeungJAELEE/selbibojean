import { z } from "zod";

import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";
import {
  WELDING_CBT_LEAF_TARGETS,
  type WeldingCbtLeafLessonId,
} from "@/data/source/welding-cbt-lesson-taxonomy";
import { GENERIC_CONTENT_PATTERNS } from "@/lib/content/enrichment";
import { weldingCbtLeafLessons } from "@/lib/content/welding-cbt-leaf-lessons";
import { WELDING_CBT_ANSWER_REVIEWS_PART_01 } from "@/data/source/welding-cbt-answer-reviews/part-01";
import { WELDING_CBT_ANSWER_REVIEWS_PART_02 } from "@/data/source/welding-cbt-answer-reviews/part-02";
import { WELDING_CBT_ANSWER_REVIEWS_PART_03 } from "@/data/source/welding-cbt-answer-reviews/part-03";
import { WELDING_CBT_ANSWER_REVIEWS_PART_04 } from "@/data/source/welding-cbt-answer-reviews/part-04";
import { WELDING_CBT_ANSWER_REVIEWS_PART_05 } from "@/data/source/welding-cbt-answer-reviews/part-05";
import { WELDING_CBT_ANSWER_REVIEWS_PART_06 } from "@/data/source/welding-cbt-answer-reviews/part-06";
import { WELDING_CBT_ANSWER_REVIEWS_PART_07 } from "@/data/source/welding-cbt-answer-reviews/part-07";
import { WELDING_CBT_ANSWER_REVIEWS_PART_08 } from "@/data/source/welding-cbt-answer-reviews/part-08";
import { WELDING_CBT_ANSWER_REVIEWS_PART_09 } from "@/data/source/welding-cbt-answer-reviews/part-09";
import { WELDING_CBT_ANSWER_REVIEWS_PART_10 } from "@/data/source/welding-cbt-answer-reviews/part-10";
import { WELDING_CBT_ANSWER_REVIEWS_PART_11 } from "@/data/source/welding-cbt-answer-reviews/part-11";
import { WELDING_CBT_ANSWER_REVIEWS_PART_12 } from "@/data/source/welding-cbt-answer-reviews/part-12";
import { WELDING_CBT_ANSWER_REVIEWS_PART_13 } from "@/data/source/welding-cbt-answer-reviews/part-13";
import { WELDING_CBT_ANSWER_REVIEWS_PART_14 } from "@/data/source/welding-cbt-answer-reviews/part-14";
import { WELDING_CBT_ANSWER_REVIEWS_PART_15 } from "@/data/source/welding-cbt-answer-reviews/part-15";
import { WELDING_CBT_ANSWER_REVIEWS_PART_16 } from "@/data/source/welding-cbt-answer-reviews/part-16";
import { WELDING_CBT_ANSWER_REVIEWS_PART_17 } from "@/data/source/welding-cbt-answer-reviews/part-17";
import { WELDING_CBT_ANSWER_REVIEWS_PART_18 } from "@/data/source/welding-cbt-answer-reviews/part-18";
import { WELDING_CBT_ANSWER_REVIEWS_PART_19 } from "@/data/source/welding-cbt-answer-reviews/part-19";
import { WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_A } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-01-a";
import { WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_B } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-01-b";
import { WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_C } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-01-c";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_01 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-01";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_02 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-02";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_03 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-03";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_04 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-04";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_05 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-05";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_06 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-06";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_07 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-07";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_08 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-08";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_09 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-09";
import { WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_10 } from "@/data/source/welding-cbt-answer-reviews/gpt-hold-batch-10";
import {
  WELDING_CBT_INDEPENDENT_APPROVAL_DECISIONS,
  WELDING_CBT_INDEPENDENT_HOLD_DECISIONS,
  WELDING_CBT_INDEPENDENT_REVIEWED_AT,
  WELDING_CBT_INDEPENDENT_REVIEWER,
} from "@/data/source/welding-cbt-independent-review-decisions";

export const WELDING_CBT_ANSWER_REVIEW_PART_COUNT = 19;

export const WELDING_CBT_ASSESSMENT_KINDS = [
  "calculation",
  "definition",
  "safety",
  "identification",
  "principle",
  "application",
] as const;

export const WELDING_CBT_CHOICE_RELATIONS = [
  "supports",
  "refuted_by",
  "contradicts",
  "out_of_scope",
  "unit_error",
  "substitution_error",
  "confused_with",
  "missing_condition",
] as const;

const evidenceRefSchema = z.object({
  kind: z.enum([
    "lesson_block",
    "official_source",
    "calculation_derivation",
    "source_question",
  ]),
  ref: z.string().min(1),
});

const conceptBindingSchema = z.object({
  lessonId: z.string().min(1),
  lessonBlockId: z.string().min(1),
  assertionText: z.string().min(12),
  evidenceRefs: z.array(evidenceRefSchema).min(1),
});

const choiceFeedbackSchema = z.object({
  choiceIndex: z.number().int().min(0),
  relation: z.enum(WELDING_CBT_CHOICE_RELATIONS),
  rationale: z.string().min(12),
  plausibleReason: z.string().min(8),
  incorrectPoint: z.string().min(8).nullable(),
  keyRule: z.string().min(12),
  differenceFromCorrect: z.string().min(8).nullable(),
});

export const weldingCbtAnswerReviewEntrySchema = z
  .object({
    canonicalId: z.string().regex(/^wcbt-[0-9a-f-]{36}$/u),
    contentDigest: z.string().regex(/^[0-9a-f]{64}$/u),
    authoringDisposition: z.enum([
      "pending",
      "publish_candidate",
      "hold_candidate",
    ]),
    reviewStatus: z.enum(["pending", "approved", "hold"]),
    assessmentKind: z.enum(WELDING_CBT_ASSESSMENT_KINDS),
    primaryLeafLessonId: z.string().nullable(),
    conceptBinding: conceptBindingSchema.nullable(),
    answerExplanation: z.string().min(24).nullable(),
    solutionSteps: z.array(z.string().min(8)),
    keyRule: z.string().min(12).nullable(),
    choiceFeedback: z.array(choiceFeedbackSchema).nullable(),
    essentialRank: z.number().int().min(1).max(5).nullable(),
    essentialRationale: z.string().min(12).nullable(),
    holdReasons: z.array(z.string().min(8)),
    author: z.string().min(1).nullable(),
    authoredAt: z.iso.datetime().nullable(),
    reviewer: z.string().min(1).nullable(),
    reviewedAt: z.iso.datetime().nullable(),
  })
  .superRefine((entry, context) => {
    if (
      entry.authoringDisposition === "pending" &&
      entry.reviewStatus === "pending"
    ) {
      const hasAuthoredContent =
        entry.primaryLeafLessonId !== null ||
        entry.conceptBinding !== null ||
        entry.answerExplanation !== null ||
        entry.solutionSteps.length > 0 ||
        entry.keyRule !== null ||
        entry.choiceFeedback !== null ||
        entry.essentialRank !== null ||
        entry.essentialRationale !== null ||
        entry.holdReasons.length > 0 ||
        entry.author !== null ||
        entry.authoredAt !== null ||
        entry.reviewer !== null ||
        entry.reviewedAt !== null;
      if (hasAuthoredContent) {
        context.addIssue({
          code: "custom",
          message: "ANSWER_REVIEW_PENDING_HAS_AUTHORED_CONTENT",
        });
      }
      return;
    }

    if (
      entry.authoringDisposition === "publish_candidate" &&
      entry.reviewStatus === "pending"
    ) {
      const leafLessonId =
        entry.primaryLeafLessonId as WeldingCbtLeafLessonId | null;
      const invalidCandidate =
        !leafLessonId ||
        !(leafLessonId in WELDING_CBT_LEAF_TARGETS) ||
        !entry.conceptBinding ||
        entry.conceptBinding.lessonId !== leafLessonId ||
        !entry.answerExplanation ||
        entry.solutionSteps.length === 0 ||
        !entry.keyRule ||
        !entry.choiceFeedback ||
        entry.choiceFeedback.length === 0 ||
        entry.holdReasons.length > 0 ||
        !entry.author ||
        !entry.authoredAt ||
        entry.reviewer !== null ||
        entry.reviewedAt !== null;
      if (invalidCandidate) {
        context.addIssue({
          code: "custom",
          message: "ANSWER_REVIEW_INVALID_PUBLISH_CANDIDATE",
        });
      }
      if (
        (entry.essentialRank === null) !==
        (entry.essentialRationale === null)
      ) {
        context.addIssue({
          code: "custom",
          message: "ANSWER_REVIEW_ESSENTIAL_METADATA_INCOMPLETE",
        });
      }
      return;
    }

    if (
      entry.authoringDisposition === "hold_candidate" &&
      entry.reviewStatus === "pending"
    ) {
      const invalidCandidate =
        entry.primaryLeafLessonId !== null ||
        entry.conceptBinding !== null ||
        entry.answerExplanation !== null ||
        entry.solutionSteps.length > 0 ||
        entry.keyRule !== null ||
        entry.choiceFeedback !== null ||
        entry.essentialRank !== null ||
        entry.essentialRationale !== null ||
        entry.holdReasons.length === 0 ||
        !entry.author ||
        !entry.authoredAt ||
        entry.reviewer !== null ||
        entry.reviewedAt !== null;
      if (invalidCandidate) {
        context.addIssue({
          code: "custom",
          message: "ANSWER_REVIEW_INVALID_HOLD_CANDIDATE",
        });
      }
      return;
    }

    if (entry.reviewStatus === "hold") {
      const invalidHold =
        entry.authoringDisposition !== "hold_candidate" ||
        entry.primaryLeafLessonId !== null ||
        entry.conceptBinding !== null ||
        entry.answerExplanation !== null ||
        entry.solutionSteps.length > 0 ||
        entry.keyRule !== null ||
        entry.choiceFeedback !== null ||
        entry.essentialRank !== null ||
        entry.essentialRationale !== null ||
        entry.holdReasons.length === 0 ||
        !entry.author ||
        !entry.authoredAt ||
        !entry.reviewer ||
        !entry.reviewedAt;
      if (invalidHold) {
        context.addIssue({
          code: "custom",
          message: "ANSWER_REVIEW_INVALID_HOLD",
        });
      }
      return;
    }

    const leafLessonId =
      entry.primaryLeafLessonId as WeldingCbtLeafLessonId | null;
    if (
      entry.authoringDisposition !== "publish_candidate" ||
      !leafLessonId ||
      !(leafLessonId in WELDING_CBT_LEAF_TARGETS) ||
      !entry.conceptBinding ||
      entry.conceptBinding.lessonId !== leafLessonId ||
      !entry.answerExplanation ||
      entry.solutionSteps.length === 0 ||
      !entry.keyRule ||
      !entry.choiceFeedback ||
      entry.choiceFeedback.length === 0 ||
      !entry.author ||
      !entry.authoredAt ||
      !entry.reviewer ||
      !entry.reviewedAt ||
      entry.holdReasons.length > 0
    ) {
      context.addIssue({
        code: "custom",
        message: "ANSWER_REVIEW_INVALID_APPROVAL",
      });
    }
    if (
      (entry.essentialRank === null) !==
      (entry.essentialRationale === null)
    ) {
      context.addIssue({
        code: "custom",
        message: "ANSWER_REVIEW_ESSENTIAL_METADATA_INCOMPLETE",
      });
    }
  });

export type WeldingCbtAnswerReviewEntry = z.infer<
  typeof weldingCbtAnswerReviewEntrySchema
>;

export type PublishableWeldingCbtAnswerReviewEntry =
  WeldingCbtAnswerReviewEntry & {
    authoringDisposition: "publish_candidate";
    reviewStatus: "approved";
    primaryLeafLessonId: WeldingCbtLeafLessonId;
    conceptBinding: NonNullable<WeldingCbtAnswerReviewEntry["conceptBinding"]>;
    answerExplanation: string;
    solutionSteps: string[];
    keyRule: string;
    choiceFeedback: NonNullable<WeldingCbtAnswerReviewEntry["choiceFeedback"]>;
    author: string;
    authoredAt: string;
    reviewer: string;
    reviewedAt: string;
  };

export function isWeldingCbtAnswerReviewPublishable(
  entry: WeldingCbtAnswerReviewEntry,
): entry is PublishableWeldingCbtAnswerReviewEntry {
  return Boolean(
    entry.authoringDisposition === "publish_candidate" &&
    entry.reviewStatus === "approved" &&
    entry.primaryLeafLessonId &&
    entry.primaryLeafLessonId in WELDING_CBT_LEAF_TARGETS &&
    entry.conceptBinding &&
    entry.conceptBinding.lessonId === entry.primaryLeafLessonId &&
    entry.answerExplanation &&
    entry.solutionSteps.length > 0 &&
    entry.keyRule &&
    entry.choiceFeedback &&
    entry.choiceFeedback.length > 0 &&
    entry.author &&
    entry.authoredAt &&
    entry.reviewer &&
    entry.reviewedAt &&
    entry.holdReasons.length === 0 &&
    validateWeldingCbtAnswerReviewQuality(entry).length === 0,
  );
}

export type WeldingCbtAnswerReviewError = {
  code: string;
  canonicalId: string | null;
  detail: string;
};

const originalRawAuthoredEntries = [
  ...WELDING_CBT_ANSWER_REVIEWS_PART_01,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_02,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_03,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_04,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_05,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_06,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_07,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_08,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_09,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_10,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_11,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_12,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_13,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_14,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_15,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_16,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_17,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_18,
  ...WELDING_CBT_ANSWER_REVIEWS_PART_19,
] as readonly unknown[];

const gptReplacementEntries = [
  ...WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_A,
  ...WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_B,
  ...WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_C,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_01,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_02,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_03,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_04,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_05,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_06,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_07,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_08,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_09,
  ...WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_10,
] as readonly unknown[];

const CALCULATION_STEP_OVERRIDES: Readonly<Record<string, readonly string[]>> =
  {
    "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe": [
      "계산식: 시험 근사식은 V[L]≈용기 내용적[L]×충전압력 수치입니다.",
      "대입·단위: V=33.7L×120=4044L로 계산합니다.",
      "결과: 4044L를 선택합니다.",
    ],
  };

function normalizeLearnerFacingChoiceMarkers(entry: unknown): unknown {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;

  const candidate = entry as Record<string, unknown>;
  const normalizeText = (value: unknown) =>
    typeof value === "string"
      ? value
          .replace(
            /\bchoiceId\s+([0-3])\b/giu,
            (_match, zeroBasedIndex: string) =>
              `${Number(zeroBasedIndex) + 1}번 보기`,
          )
          .replace(/^Formula:\s*/iu, "계산식: ")
          .replace(/^Substitution with units:\s*/iu, "대입·단위: ")
          .replace(/^Result:\s*/iu, "결과: ")
      : value;
  const normalizeFeedback = (value: unknown) => {
    if (!Array.isArray(value)) return value;
    return value.map((feedback) => {
      if (
        !feedback ||
        typeof feedback !== "object" ||
        Array.isArray(feedback)
      ) {
        return feedback;
      }
      const item = feedback as Record<string, unknown>;
      return {
        ...item,
        rationale: normalizeText(item.rationale),
        plausibleReason: normalizeText(item.plausibleReason),
        incorrectPoint: normalizeText(item.incorrectPoint),
        keyRule: normalizeText(item.keyRule),
        differenceFromCorrect: normalizeText(item.differenceFromCorrect),
      };
    });
  };
  const overriddenSolutionSteps =
    typeof candidate.canonicalId === "string"
      ? CALCULATION_STEP_OVERRIDES[candidate.canonicalId]
      : undefined;

  return {
    ...candidate,
    answerExplanation: normalizeText(candidate.answerExplanation),
    solutionSteps: overriddenSolutionSteps
      ? [...overriddenSolutionSteps]
      : Array.isArray(candidate.solutionSteps)
        ? candidate.solutionSteps.map(normalizeText)
        : candidate.solutionSteps,
    keyRule: normalizeText(candidate.keyRule),
    choiceFeedback: normalizeFeedback(candidate.choiceFeedback),
  };
}

const gptReplacementByCanonicalId = new Map<string, unknown>();
for (const entry of gptReplacementEntries) {
  const candidate = entry as { canonicalId?: string };
  if (
    !candidate.canonicalId ||
    gptReplacementByCanonicalId.has(candidate.canonicalId)
  ) {
    throw new Error(
      `WELDING_CBT_GPT_REPLACEMENT_DUPLICATE_ID:${candidate.canonicalId ?? "missing"}`,
    );
  }
  gptReplacementByCanonicalId.set(
    candidate.canonicalId,
    normalizeLearnerFacingChoiceMarkers(entry),
  );
}

const replacedGptIds = new Set<string>();
const rawAuthoredEntries = originalRawAuthoredEntries.map((entry) => {
  const canonicalId = (entry as { canonicalId?: string }).canonicalId;
  if (!canonicalId) return entry;
  const replacement = gptReplacementByCanonicalId.get(canonicalId);
  if (!replacement) return entry;
  replacedGptIds.add(canonicalId);
  return replacement;
});

if (replacedGptIds.size !== gptReplacementByCanonicalId.size) {
  const missing = [...gptReplacementByCanonicalId.keys()].filter(
    (canonicalId) => !replacedGptIds.has(canonicalId),
  );
  throw new Error(
    `WELDING_CBT_GPT_REPLACEMENT_SOURCE_MISSING:${missing.join(",")}`,
  );
}

const rawEntries = rawAuthoredEntries.map((entry) => {
  const candidate = entry as {
    canonicalId?: string;
    author?: string | null;
    authoredAt?: string | null;
  };
  if (!candidate.canonicalId) return entry;

  const approvalDecision =
    WELDING_CBT_INDEPENDENT_APPROVAL_DECISIONS[
      candidate.canonicalId as keyof typeof WELDING_CBT_INDEPENDENT_APPROVAL_DECISIONS
    ];
  if (approvalDecision) {
    return {
      ...candidate,
      reviewStatus: "approved" as const,
      essentialRank: null,
      essentialRationale: null,
      reviewer: WELDING_CBT_INDEPENDENT_REVIEWER,
      reviewedAt: WELDING_CBT_INDEPENDENT_REVIEWED_AT,
    };
  }

  const decision =
    WELDING_CBT_INDEPENDENT_HOLD_DECISIONS[candidate.canonicalId];
  if (!decision) return entry;

  return {
    ...candidate,
    authoringDisposition: "hold_candidate" as const,
    reviewStatus: "hold" as const,
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [...decision.reasons],
    author: candidate.author ?? WELDING_CBT_INDEPENDENT_REVIEWER,
    authoredAt: candidate.authoredAt ?? WELDING_CBT_INDEPENDENT_REVIEWED_AT,
    reviewer: WELDING_CBT_INDEPENDENT_REVIEWER,
    reviewedAt: WELDING_CBT_INDEPENDENT_REVIEWED_AT,
  };
}) as readonly unknown[];

const GENERIC_FILLER_PATTERNS = [
  ...GENERIC_CONTENT_PATTERNS,
  "정답과 다릅니다",
  "같은 분야의 용어나 조건",
  "문제의 긍정형·부정형",
  "정답처럼 보일 수 있으므로",
  "다시 확인해야 합니다",
] as const;

const CORRUPTED_TEXT_MARKERS = [
  "\uFFFD",
  "?⑹",
  "?덉",
  "?뺤",
  "吏곸",
  "蹂닿",
  "媛숈",
  "쨌",
] as const;

function normalizeText(value: string) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

function normalizeComparableText(value: string) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function genericFillerMatch(entry: WeldingCbtAnswerReviewEntry) {
  if (entry.authoringDisposition !== "publish_candidate") return null;
  const fields = [
    entry.answerExplanation ?? "",
    ...entry.solutionSteps,
    entry.keyRule ?? "",
    ...(entry.choiceFeedback ?? []).flatMap((feedback) => [
      feedback.rationale,
      feedback.plausibleReason,
      feedback.incorrectPoint ?? "",
      feedback.keyRule,
      feedback.differenceFromCorrect ?? "",
    ]),
  ].map(normalizeText);
  return (
    GENERIC_FILLER_PATTERNS.find((pattern) =>
      fields.some((field) => field.includes(pattern)),
    ) ?? null
  );
}

function corruptedTextMatch(entry: WeldingCbtAnswerReviewEntry) {
  if (entry.authoringDisposition !== "publish_candidate") return null;
  const fields = [
    entry.answerExplanation ?? "",
    ...entry.solutionSteps,
    entry.keyRule ?? "",
    entry.conceptBinding?.assertionText ?? "",
    ...(entry.choiceFeedback ?? []).flatMap((feedback) => [
      feedback.rationale,
      feedback.plausibleReason,
      feedback.incorrectPoint ?? "",
      feedback.keyRule,
      feedback.differenceFromCorrect ?? "",
    ]),
  ];
  return (
    CORRUPTED_TEXT_MARKERS.find((marker) =>
      fields.some((field) => field.includes(marker)),
    ) ?? null
  );
}

type AnswerReviewSource = {
  choices: readonly string[];
  correctIndex: number;
};

const answerReviewSourceByKey = new Map<string, AnswerReviewSource | null>();
for (const record of rawWeldingCbtBank.records) {
  if (record.correctIndex === null) continue;
  const key = `${record.canonicalId}:${record.canonicalFingerprint}`;
  const current = answerReviewSourceByKey.get(key);
  const candidate = {
    choices: record.choices,
    correctIndex: record.correctIndex,
  };
  if (
    current &&
    (current.correctIndex !== candidate.correctIndex ||
      JSON.stringify(current.choices) !== JSON.stringify(candidate.choices))
  ) {
    answerReviewSourceByKey.set(key, null);
  } else if (current === undefined) {
    answerReviewSourceByKey.set(key, candidate);
  }
}

function getAnswerReviewSource(entry: WeldingCbtAnswerReviewEntry) {
  return (
    answerReviewSourceByKey.get(
      `${entry.canonicalId}:${entry.contentDigest}`,
    ) ?? null
  );
}

function isSimpleAnswerRestatement(value: string, correctChoice: string) {
  const normalizedValue = normalizeComparableText(value);
  const normalizedAnswer = normalizeComparableText(correctChoice);
  return (
    normalizedAnswer.length > 0 &&
    (normalizedValue === normalizedAnswer ||
      (normalizedValue.includes(normalizedAnswer) &&
        normalizedValue.length - normalizedAnswer.length <= 12))
  );
}

function reusedFieldDetail(
  fields: ReadonlyArray<{ name: string; value: string }>,
) {
  const fieldByValue = new Map<string, string>();
  for (const field of fields) {
    const value = normalizeComparableText(field.value);
    const previous = fieldByValue.get(value);
    if (value && previous) return `${previous} == ${field.name}`;
    fieldByValue.set(value, field.name);
  }
  return null;
}

function duplicateWrongFeedbackDetail(entry: WeldingCbtAnswerReviewEntry) {
  const wrongFeedback = (entry.choiceFeedback ?? []).filter(
    (feedback) => feedback.relation !== "supports",
  );
  for (const field of ["rationale", "incorrectPoint", "keyRule"] as const) {
    const choiceByValue = new Map<string, number>();
    for (const feedback of wrongFeedback) {
      const value = normalizeComparableText(feedback[field] ?? "");
      const previous = choiceByValue.get(value);
      if (value && previous !== undefined) {
        return `${field}: choice ${previous} == choice ${feedback.choiceIndex}`;
      }
      choiceByValue.set(value, feedback.choiceIndex);
    }
  }
  return null;
}

function choiceFeedbackSpecificityDetail(
  entry: WeldingCbtAnswerReviewEntry,
  source: AnswerReviewSource,
) {
  for (const feedback of entry.choiceFeedback ?? []) {
    const choiceText = source.choices[feedback.choiceIndex];
    if (!choiceText)
      return `choice ${feedback.choiceIndex}: source choice missing`;
    const fields = [
      { name: "rationale", value: feedback.rationale },
      { name: "keyRule", value: feedback.keyRule },
      ...(feedback.incorrectPoint === null
        ? []
        : [{ name: "incorrectPoint", value: feedback.incorrectPoint }]),
    ];
    const repeatedField = reusedFieldDetail(fields);
    if (repeatedField) {
      return `choice ${feedback.choiceIndex}: ${repeatedField}`;
    }
    const repeatedChoice = fields.find(
      (field) =>
        normalizeComparableText(field.value) ===
        normalizeComparableText(choiceText),
    );
    if (repeatedChoice) {
      return `choice ${feedback.choiceIndex}: ${repeatedChoice.name}`;
    }
  }
  return null;
}

function choiceFeedbackExactSetDetail(
  entry: WeldingCbtAnswerReviewEntry,
  source: AnswerReviewSource,
) {
  const feedback = entry.choiceFeedback ?? [];
  const indices = feedback.map((item) => item.choiceIndex);
  const expectedIndices = source.choices.map((_, index) => index);
  if (
    source.choices.length !== 4 ||
    feedback.length !== 4 ||
    new Set(indices).size !== feedback.length ||
    expectedIndices.some((index) => !indices.includes(index))
  ) {
    return `expected [${expectedIndices.join(",")}], observed [${indices.join(",")}]`;
  }
  for (const item of feedback) {
    const correct = item.choiceIndex === source.correctIndex;
    if (
      (correct && item.relation !== "supports") ||
      (!correct && item.relation === "supports") ||
      (correct &&
        (item.incorrectPoint !== null ||
          item.differenceFromCorrect !== null)) ||
      (!correct &&
        (item.incorrectPoint === null || item.differenceFromCorrect === null))
    ) {
      return `choice ${item.choiceIndex}: relation or correct/wrong fields mismatch`;
    }
  }
  return null;
}

function answerRestatementDetail(
  entry: WeldingCbtAnswerReviewEntry,
  correctChoice: string,
) {
  if (
    entry.answerExplanation &&
    isSimpleAnswerRestatement(entry.answerExplanation, correctChoice)
  ) {
    return "answerExplanation";
  }
  if (
    entry.keyRule &&
    isSimpleAnswerRestatement(entry.keyRule, correctChoice)
  ) {
    return "keyRule";
  }
  if (
    entry.solutionSteps.length > 0 &&
    entry.solutionSteps.every((step) =>
      isSimpleAnswerRestatement(step, correctChoice),
    )
  ) {
    return "solutionSteps";
  }
  return null;
}

export function validateWeldingCbtAnswerReviewQuality(
  entry: WeldingCbtAnswerReviewEntry,
) {
  const errors: WeldingCbtAnswerReviewError[] = [];
  if (
    entry.authoringDisposition !== "publish_candidate" ||
    entry.reviewStatus === "hold"
  ) {
    return errors;
  }
  const addError = (code: string, detail: string) => {
    errors.push({ code, canonicalId: entry.canonicalId, detail });
  };
  const binding = entry.conceptBinding;
  const lesson = binding
    ? weldingCbtLeafLessons.find(
        (candidate) => candidate.id === binding.lessonId,
      )
    : null;
  const block = binding
    ? lesson?.blocks.find((candidate) => candidate.id === binding.lessonBlockId)
    : null;
  if (!block || !binding || binding.lessonId !== entry.primaryLeafLessonId) {
    addError(
      "ANSWER_REVIEW_CONCEPT_ASSERTION_MISMATCH",
      binding?.lessonBlockId ?? "missing",
    );
  }
  const filler = genericFillerMatch(entry);
  if (filler) addError("ANSWER_REVIEW_GENERIC_FILLER", filler);
  const corruptedText = corruptedTextMatch(entry);
  if (corruptedText) {
    addError("ANSWER_REVIEW_CORRUPTED_TEXT", corruptedText);
  }
  const source = getAnswerReviewSource(entry);
  if (!source) {
    addError("ANSWER_REVIEW_SOURCE_ANSWER_MISSING", entry.contentDigest);
    return errors;
  }
  const correctChoice = source.choices[source.correctIndex];
  if (!correctChoice) {
    addError("ANSWER_REVIEW_SOURCE_ANSWER_MISSING", `${source.correctIndex}`);
    return errors;
  }
  const restatement = answerRestatementDetail(entry, correctChoice);
  if (restatement) {
    addError("ANSWER_REVIEW_ANSWER_RESTATEMENT", restatement);
  }
  const reusedAnswerContent = reusedFieldDetail([
    ...(entry.answerExplanation
      ? [{ name: "answerExplanation", value: entry.answerExplanation }]
      : []),
    ...(entry.keyRule ? [{ name: "keyRule", value: entry.keyRule }] : []),
    ...entry.solutionSteps.map((value, index) => ({
      name: `solutionSteps[${index}]`,
      value,
    })),
  ]);
  if (reusedAnswerContent) {
    addError("ANSWER_REVIEW_ANSWER_CONTENT_REUSED", reusedAnswerContent);
  }
  const exactSet = choiceFeedbackExactSetDetail(entry, source);
  if (exactSet) {
    addError("ANSWER_REVIEW_CHOICE_FEEDBACK_EXACT_SET", exactSet);
  }
  const reusedFeedback = duplicateWrongFeedbackDetail(entry);
  if (reusedFeedback) {
    addError("ANSWER_REVIEW_CHOICE_FEEDBACK_REUSED", reusedFeedback);
  }
  const unspecificFeedback = choiceFeedbackSpecificityDetail(entry, source);
  if (unspecificFeedback) {
    addError("ANSWER_REVIEW_CHOICE_FEEDBACK_NOT_SPECIFIC", unspecificFeedback);
  }
  const evidenceKinds = new Set(
    entry.conceptBinding?.evidenceRefs.map((evidence) => evidence.kind) ?? [],
  );
  if (
    entry.assessmentKind === "safety" &&
    !evidenceKinds.has("official_source")
  ) {
    addError("ANSWER_REVIEW_OFFICIAL_SOURCE_REQUIRED", "safety");
  }
  if (
    entry.assessmentKind === "calculation" &&
    !evidenceKinds.has("official_source") &&
    !evidenceKinds.has("calculation_derivation")
  ) {
    addError("ANSWER_REVIEW_CALCULATION_EVIDENCE_REQUIRED", "calculation");
  }
  return errors;
}

export function validateWeldingCbtAnswerReviews() {
  const errors: WeldingCbtAnswerReviewError[] = [];
  const parsed = z
    .array(weldingCbtAnswerReviewEntrySchema)
    .safeParse(rawEntries);
  const schemaEntries = parsed.success ? parsed.data : [];
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const index = typeof issue.path[0] === "number" ? issue.path[0] : null;
      const candidate =
        index === null
          ? null
          : (rawEntries[index] as { canonicalId?: unknown });
      errors.push({
        code: issue.message.startsWith("ANSWER_REVIEW_")
          ? issue.message
          : "ANSWER_REVIEW_SCHEMA_INVALID",
        canonicalId:
          typeof candidate?.canonicalId === "string"
            ? candidate.canonicalId
            : null,
        detail: issue.message,
      });
    }
  }

  const projectionById = new Map(
    WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [
      entry.canonicalId,
      entry,
    ]),
  );
  const seen = new Set<string>();
  const essentialRanks = new Set<string>();
  for (const entry of schemaEntries) {
    if (seen.has(entry.canonicalId)) {
      errors.push({
        code: "ANSWER_REVIEW_DUPLICATE_CANONICAL",
        canonicalId: entry.canonicalId,
        detail: entry.canonicalId,
      });
    }
    seen.add(entry.canonicalId);
    const projection = projectionById.get(entry.canonicalId);
    if (!projection) {
      errors.push({
        code: "ANSWER_REVIEW_UNKNOWN_CANONICAL",
        canonicalId: entry.canonicalId,
        detail: entry.canonicalId,
      });
    } else if (projection.contentDigest !== entry.contentDigest) {
      errors.push({
        code: "ANSWER_REVIEW_DIGEST_MISMATCH",
        canonicalId: entry.canonicalId,
        detail: `${projection.contentDigest} != ${entry.contentDigest}`,
      });
    }
    errors.push(...validateWeldingCbtAnswerReviewQuality(entry));
    if (
      entry.reviewStatus === "approved" &&
      entry.primaryLeafLessonId &&
      entry.essentialRank !== null
    ) {
      const rankKey = `${entry.primaryLeafLessonId}:${entry.essentialRank}`;
      if (essentialRanks.has(rankKey)) {
        errors.push({
          code: "ANSWER_REVIEW_DUPLICATE_ESSENTIAL_RANK",
          canonicalId: entry.canonicalId,
          detail: rankKey,
        });
      }
      essentialRanks.add(rankKey);
    }
  }
  for (const entry of WELDING_CBT_LESSON_PROJECTION.entries) {
    if (!seen.has(entry.canonicalId)) {
      errors.push({
        code: "ANSWER_REVIEW_MISSING_CANONICAL",
        canonicalId: entry.canonicalId,
        detail: entry.canonicalId,
      });
    }
  }

  const stats = schemaEntries.reduce(
    (current, entry) => ({
      ...current,
      [entry.reviewStatus]: current[entry.reviewStatus] + 1,
    }),
    { pending: 0, approved: 0, hold: 0 },
  );
  const authoringStats = schemaEntries.reduce(
    (current, entry) => ({
      ...current,
      [entry.authoringDisposition]: current[entry.authoringDisposition] + 1,
    }),
    { pending: 0, publish_candidate: 0, hold_candidate: 0 },
  );
  return {
    ok:
      errors.length === 0 &&
      schemaEntries.length === WELDING_CBT_LESSON_PROJECTION.entries.length,
    errors,
    stats,
    authoringStats,
    pendingCount: stats.pending,
    approvedCount: stats.approved,
    holdCount: stats.hold,
    entryCount: schemaEntries.length,
  };
}

const validation = validateWeldingCbtAnswerReviews();
const parsedEntries = z
  .array(weldingCbtAnswerReviewEntrySchema)
  .safeParse(rawEntries);

export const WELDING_CBT_ANSWER_REVIEWS = {
  version: 1 as const,
  partCount: WELDING_CBT_ANSWER_REVIEW_PART_COUNT,
  entries: parsedEntries.success ? parsedEntries.data : [],
  validation,
};

const answerReviewById = new Map(
  WELDING_CBT_ANSWER_REVIEWS.entries.map((entry) => [entry.canonicalId, entry]),
);

export function getWeldingCbtAnswerReview(canonicalId: string) {
  return answerReviewById.get(canonicalId) ?? null;
}
