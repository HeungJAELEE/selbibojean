import rawEditorial from "./practical-written-gpt-editorial.json";
import { PRACTICAL_WRITTEN_EXAM_CARD_SEEDS } from "./practical-written-exam-cards";

export type PracticalWrittenConceptBridge = {
  definitionSupport: string;
  backgroundSupport: string;
  examPattern: string;
};

export type PracticalWrittenExamCardEditorial = {
  questionId: string;
  recognitionPoints: string[];
  reasoningSummary: string[];
  answerSkeleton: string[];
  commonWrongAnswers: string[];
  variationAxes: string[];
  conceptBridge: PracticalWrittenConceptBridge;
  needsSource: boolean;
  sourceNeedReason: string | null;
};

export type PracticalConceptEnhancementReview = {
  conceptId: string;
  learningGoals: string[];
  definition: string;
  principle: string;
  examFormats: string[];
  requiredKeywords: string[];
  traps: string[];
  ncsLearningPoints: string[];
  sourceReviewNote: string;
  needsSource: boolean;
};

const editorial = rawEditorial as {
  formatVersion: string;
  sourceKind: string;
  reviewedAt: string;
  terminalMarker: string;
  localResolution: {
    appliedCardReviews: number;
    preservedCuratedCardReviews: number;
    resolvedBlockers: Array<{
      issue: string;
      resolution: string;
    }>;
  };
  examCards: PracticalWrittenExamCardEditorial[];
  conceptEnhancements: PracticalConceptEnhancementReview[];
  review: {
    blockers: string[];
    important: string[];
    minor: string[];
    verdict: string;
  };
};

export const PRACTICAL_WRITTEN_GPT_EDITORIAL_META = {
  formatVersion: editorial.formatVersion,
  sourceKind: editorial.sourceKind,
  reviewedAt: editorial.reviewedAt,
  terminalMarker: editorial.terminalMarker,
  localResolution: editorial.localResolution,
  review: editorial.review,
} as const;

export const PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_REVIEWS =
  editorial.examCards;

const curatedPastQuestionIds = new Set(
  PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.flatMap((card) => card.pastQuestionIds),
);

export const PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_BY_QUESTION_ID = new Map(
  editorial.examCards
    .filter((item) => !curatedPastQuestionIds.has(item.questionId))
    .map((item) => [item.questionId, item] as const),
);

/**
 * 기존 교과서형 개념 원고를 자동 덮어쓰지 않고 GPT 독립 검토 결과를
 * ID별 대조 자료로 보존한다. NCS locator가 없는 항목은 needsSource를
 * 유지하므로 이 배열만으로 NCS 근거가 확정되지 않는다.
 */
export const PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS =
  editorial.conceptEnhancements;
