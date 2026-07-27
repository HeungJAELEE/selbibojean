import type {
  LearnerContentPolicy,
  PracticalConcept,
  PracticalQuestion,
  PracticalWrittenExamCard,
} from "@/lib/domain/practical-types";

/**
 * 제목이나 본문의 문자열 검색 대신 검수된 ID에 공개 정책을 연결한다.
 * 원본 데이터는 유지하고 학습자용 selector에서만 제외한다.
 */
export const LEARNER_CONTENT_POLICY_BY_ID: Readonly<
  Record<string, LearnerContentPolicy>
> = {
  "PCON-SUP-002": {
    topic: "welding_calculation",
    visibility: "internal_reference_only",
  },
  "EXP-SUP-002": {
    topic: "welding_calculation",
    visibility: "internal_reference_only",
  },
  "PCON-SUP-018": {
    topic: "welding_calculation",
    visibility: "internal_reference_only",
  },
  "EXP-SUP-018": {
    topic: "welding_calculation",
    visibility: "internal_reference_only",
  },
};

const DEFAULT_LEARNER_POLICY: LearnerContentPolicy = {
  topic: "other",
  visibility: "learner_public",
};

export function getLearnerContentPolicy(id: string): LearnerContentPolicy {
  return LEARNER_CONTENT_POLICY_BY_ID[id] ?? DEFAULT_LEARNER_POLICY;
}

export function isLearnerVisiblePolicy(policy: LearnerContentPolicy) {
  return (
    policy.topic !== "welding_calculation" &&
    policy.visibility === "learner_public"
  );
}

export function isLearnerVisibleContentId(id: string) {
  return isLearnerVisiblePolicy(getLearnerContentPolicy(id));
}

export function isLearnerVisiblePracticalConcept(
  concept: Pick<PracticalConcept, "id">,
) {
  return isLearnerVisibleContentId(concept.id);
}

export function isLearnerVisiblePracticalQuestion(
  question: Pick<PracticalQuestion, "id" | "conceptIds">,
) {
  return (
    isLearnerVisibleContentId(question.id) &&
    question.conceptIds.every(isLearnerVisibleContentId)
  );
}

export function isLearnerVisiblePracticalWrittenExamCard(
  card: Pick<
    PracticalWrittenExamCard,
    | "conceptIds"
    | "supplementalConceptIds"
    | "pastQuestionIds"
    | "variantQuestionIds"
    | "predictedQuestionIds"
  >,
) {
  return [
    ...card.conceptIds,
    ...card.supplementalConceptIds,
    ...card.pastQuestionIds,
    ...card.variantQuestionIds,
    ...card.predictedQuestionIds,
  ].every(isLearnerVisibleContentId);
}
