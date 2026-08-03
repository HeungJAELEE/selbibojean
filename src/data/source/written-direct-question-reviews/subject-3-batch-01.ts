import { GOLDEN_QUESTION_FEEDBACK } from "@/data/source/golden-content";
import type { WrittenDirectQuestionReview } from "./schema";

const feedback = GOLDEN_QUESTION_FEEDBACK["U-073"];

if (!feedback) {
  throw new Error("U-073 direct feedback is missing from golden content.");
}

export const SUBJECT_THREE_DIRECT_REVIEW_BATCH_01 = [
  {
    questionId: "U-073",
    subjectId: "subject-3",
    decision: "approve",
    correctChoiceId: "U-073-c3",
    directSolution:
      "아베의 원리는 측정하려는 길이의 축과 기준 눈금축을 같은 직선 위에 두어 아베 오프셋을 줄이는 원리입니다. 외측 마이크로미터는 스핀들 이동축·측정축·눈금축이 거의 일치하므로 이 조건에 가장 잘 맞습니다.",
    choiceRationales: [1, 2, 3, 4].map((order) => ({
      choiceId: `U-073-c${order}`,
      verdict: order === 3 ? "correct" as const : "incorrect" as const,
      rationale: feedback[order].rationale,
    })),
    misconception:
      "측정기의 분해능이나 일반적인 정밀도와 측정축·기준 눈금축의 일치 조건을 혼동하기 쉽습니다.",
    existingLessonId: "lesson-psovio",
    existingBlockId: "exam-point",
    assertionText:
      "외측 마이크로미터는 스핀들의 이동방향과 측정 치수의 방향이 일치하므로 정답입니다.",
    evidenceUrls: ["https://www.comcbt.com/xe/webhaesul/9630928"],
    reviewedAt: "2026-08-02T00:00:00.000Z",
  },
] satisfies WrittenDirectQuestionReview[];
