import type { PublicQuestion } from "@/lib/domain/types";

export type WrittenSubjectCbtLinkStatus =
  | "direct_original"
  | "partial_context"
  | "no_direct_original";

export type WrittenSubjectFactCbtBinding = {
  factId: string;
  status: WrittenSubjectCbtLinkStatus;
  questionIds: readonly string[];
};

export type WrittenSubjectBundleForCbt = {
  facts: readonly unknown[];
};

export const WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE =
  "현재 로컬 공개 문제셋에서 이 주제와 직접 연결이 검수된 기출을 확인하지 못했습니다.";

export function createWrittenSubjectFactCbtRegistry(
  bindings: readonly WrittenSubjectFactCbtBinding[],
) {
  return new Map(bindings.map((binding) => [binding.factId, binding]));
}

function compareOriginalQuestions(
  left: PublicQuestion,
  right: PublicQuestion,
) {
  const leftExam = left.provenance.exam;
  const rightExam = right.provenance.exam;
  const yearDifference = (rightExam?.year ?? 0) - (leftExam?.year ?? 0);
  if (yearDifference !== 0) return yearDifference;

  const sessionDifference = (rightExam?.sessionLabel ?? "").localeCompare(
    leftExam?.sessionLabel ?? "",
    "ko",
    { numeric: true },
  );
  if (sessionDifference !== 0) return sessionDifference;

  const numberDifference =
    (leftExam?.questionNumber ?? Number.MAX_SAFE_INTEGER) -
    (rightExam?.questionNumber ?? Number.MAX_SAFE_INTEGER);
  if (numberDifference !== 0) return numberDifference;
  return left.id.localeCompare(right.id);
}

export function getReviewedWrittenSubjectBundleCbtSelection(
  bundle: WrittenSubjectBundleForCbt,
  questions: readonly PublicQuestion[],
  bindingsByFactId: ReadonlyMap<string, WrittenSubjectFactCbtBinding>,
  noDirectNote = WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE,
) {
  const directQuestionIds = new Set<string>();

  for (const fact of bundle.facts) {
    if (
      typeof fact !== "object" ||
      fact === null ||
      !("id" in fact) ||
      typeof fact.id !== "string"
    ) {
      continue;
    }
    const binding = bindingsByFactId.get(fact.id);
    if (!binding || binding.status !== "direct_original") continue;
    for (const questionId of binding.questionIds) {
      directQuestionIds.add(questionId);
    }
  }

  const originalQuestionsById = new Map(
    questions
      .filter((question) => question.provenance.original)
      .map((question) => [question.id, question]),
  );
  const selectedQuestions = [...directQuestionIds]
    .map((questionId) => originalQuestionsById.get(questionId))
    .filter((question): question is PublicQuestion => Boolean(question))
    .sort(compareOriginalQuestions)
    .slice(0, 5);

  return {
    questions: selectedQuestions,
    statusNote: selectedQuestions.length === 0 ? noDirectNote : undefined,
  };
}
