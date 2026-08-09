import {
  getReviewedCbtVariantAnswerIndex,
  mapReviewedCbtVariantChoices,
} from "@/lib/content/reviewed-cbt-variants";
import type { GeneratedContent, Question } from "@/lib/domain/types";

type Variant = GeneratedContent["variants"][number];

export function buildReviewedCbtVariantGradingQuestion(
  question: Question,
  variant: Variant | undefined,
): Question | null {
  if (
    !variant ||
    variant.reviewState !== "published" ||
    !variant.reviewed ||
    variant.canonicalId !== question.id
  ) {
    return null;
  }
  const mapping = mapReviewedCbtVariantChoices(question, variant);
  const answerIndex = getReviewedCbtVariantAnswerIndex(variant);
  if (!mapping || answerIndex === null) return null;

  const correctChoiceId = mapping[answerIndex]?.id;
  if (!correctChoiceId || correctChoiceId !== question.correctChoiceId) {
    return null;
  }
  const reasonsByIndex = new Map(
    variant.reviewed.choiceByChoiceReasons.map((reason) => [
      reason.choiceIndex,
      reason,
    ]),
  );
  const correctText = variant.choices[answerIndex].trim();

  return {
    ...question,
    stem: variant.stem.trim(),
    choices: mapping.map((mappedChoice, index) => {
      const text = variant.choices[index].trim();
      const reason = reasonsByIndex.get(index)?.reason.trim();
      if (!reason) {
        throw new Error(
          `검수 완료 기출의 선택지 근거가 없습니다: ${variant.externalId}`,
        );
      }
      const isCorrect = index === answerIndex;
      return {
        ...mappedChoice,
        order: index + 1,
        text,
        feedback: {
          rationale: reason,
          plausibleReason: isCorrect
            ? "문제의 조건과 직접 판단근거를 모두 충족합니다."
            : `${text}에 해당하는 개념은 있으나 이 문항의 조건에는 맞지 않습니다.`,
          incorrectPoint: isCorrect ? null : reason,
          keyRule: variant.reviewed!.directSolution,
          differenceFromCorrect: isCorrect
            ? null
            : `정답 보기 '${correctText}'와 적용 조건 또는 판단근거가 다릅니다.`,
        },
      };
    }),
    correctChoiceId,
    answerText: variant.reviewed.reviewedAnswerText,
    explanation: variant.reviewed.directSolution,
    sourceLabel: variant.sourceUrl,
  };
}
