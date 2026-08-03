import { findForbiddenPreSubmitFields } from "@/lib/security/answer-leak";
import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import { WELDING_CBT_ANSWER_REVIEWS } from "@/data/source/welding-cbt-answer-review";
import type { GeneratedContent } from "@/lib/domain/types";
import {
  isPublishableQuestion,
  toPublicQuestion,
} from "@/lib/domain/practice";

export type ConflictTheoryReviewItem = {
  id: string;
  stem: string;
  choices: Array<{
    id: string;
    text: string;
  }>;
  reason: string;
};

type ConflictTheoryReviewScope = {
  lessonId?: string;
  subjectId?: string;
  relatedQuestionIds?: string[];
};

const MULTIPLE_ANSWER_SIGNAL = /복수정답|복수|다중정답/u;
const WELDING_UNGRADED_SIGNAL =
  /answer_conflict|answer_lesson_conflict|multiple_or|missing_condition|condition_omitted|condition_is_ambiguous|calculation_derivation_unverified|905/iu;
const WELDING_CALCULATION_SIGNAL =
  /calculation|formula|905|계산|환산/iu;

export function selectConflictTheoryReviewItems(
  content: GeneratedContent,
  {
    lessonId,
    subjectId,
    relatedQuestionIds = [],
  }: ConflictTheoryReviewScope,
): ConflictTheoryReviewItem[] {
  const relatedIds = new Set(relatedQuestionIds);

  const directItems = content.questions.flatMap((question) => {
    const audit = question.audit;
    const belongsToScope =
      (lessonId !== undefined &&
        (question.lessonId === lessonId || relatedIds.has(question.id))) ||
      (subjectId !== undefined && question.subjectId === subjectId);
    const hasMissingAsset =
      audit?.assetStatus === "missing" ||
      question.publication?.blockers.includes("asset_required") ||
      question.verification?.riskTags.includes("asset_required");

    if (
      !belongsToScope ||
      audit?.auditDisposition !== "held_answer_conflict" ||
      hasMissingAsset ||
      isPublishableQuestion(question)
    ) {
      return [];
    }

    const publicProjection = toPublicQuestion(question);
    if (findForbiddenPreSubmitFields(publicProjection).length > 0) {
      return [];
    }

    const item: ConflictTheoryReviewItem = {
      id: publicProjection.id,
      stem: publicProjection.stem,
      choices: publicProjection.choices.map(({ id, text }) => ({ id, text })),
      reason: toLearnerSafeConflictReason(audit.reviewNote),
    };

    return findForbiddenPreSubmitFields(item).length === 0 ? [item] : [];
  });

  return subjectId === "subject-2"
    ? [...directItems, ...selectWeldingUngradedReviewItems()]
    : directItems;
}

function selectWeldingUngradedReviewItems(): ConflictTheoryReviewItem[] {
  const recordById = new Map(
    rawWeldingCbtBank.records.map((record) => [record.canonicalId, record]),
  );

  return WELDING_CBT_ANSWER_REVIEWS.entries.flatMap((review) => {
    if (
      review.reviewStatus !== "hold" ||
      (
        review.assessmentKind !== "safety" &&
        !review.holdReasons.some((reason) =>
          WELDING_UNGRADED_SIGNAL.test(reason),
        )
      )
    ) {
      return [];
    }

    const record = recordById.get(review.canonicalId);
    if (
      !record ||
      record.assetStatus !== "not_required" ||
      record.sourceImageUrls.length > 0
    ) {
      return [];
    }

    const calculationConditionMissing = review.holdReasons.some((reason) =>
      WELDING_CALCULATION_SIGNAL.test(reason),
    );
    const item: ConflictTheoryReviewItem = {
      id: record.canonicalId,
      stem: record.stem,
      choices: record.choices.map((text, index) => ({
        id: `${record.canonicalId}-choice-${index + 1}`,
        text,
      })),
      reason: calculationConditionMissing
        ? "계산에 필요한 공식·환산계수의 기준상태 또는 적용 조건을 직접 검증하지 못해 비채점 검토 문항으로만 공개합니다."
        : review.assessmentKind === "safety"
          ? "공식 안전자료를 조회했지만 네 선택지 전부를 확정할 직접 근거가 부족해 조건부 참고·비채점 문항으로 공개합니다."
        : "복원 답안과 이론 근거가 충돌하거나 단일 정답을 가르는 조건이 생략되어 비채점 검토 문항으로만 공개합니다.",
    };

    return findForbiddenPreSubmitFields(item).length === 0 ? [item] : [];
  });
}

function toLearnerSafeConflictReason(reviewNote: string) {
  if (MULTIPLE_ANSWER_SIGNAL.test(reviewNote)) {
    return "단일정답 여부 또는 복수정답 인정 범위가 확정되지 않아 판정 기준을 검토 중입니다.";
  }

  return "공개 답안과 기존 해설 또는 기술 근거가 일치하지 않아 판정 기준을 검토 중입니다.";
}
