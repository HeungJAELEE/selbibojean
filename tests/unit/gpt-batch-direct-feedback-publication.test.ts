import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const reviewedQuestionIds = [
  "U-615",
  "U-906",
  "U-363",
  "U-378",
  "U-450",
  "U-451",
  "U-524",
  "U-597",
  "U-728",
  "U-841",
  "U-929",
  "U-975",
  "U-1023",
  "U-1077",
  "U-1113",
  "U-1120",
  "U-1213",
  "U-1215",
  "U-1285",
  "U-1318",
  "U-1323",
  "U-1362",
  "U-292",
  "U-472",
  "U-541",
  "U-741",
  "U-867",
  "U-892",
  "U-894",
  "U-984",
] as const;

const historicalBoundaryIds = [
  "U-615",
  "U-524",
  "U-597",
  "U-1120",
  "U-1215",
  "U-1318",
  "U-1323",
  "U-1362",
  "U-472",
  "U-541",
  "U-894",
] as const;

const runtime = buildRuntimeContent(generatedContent as GeneratedContent);
const questionById = new Map(
  runtime.questions.map((question) => [question.id, question]),
);

describe("GPT reviewed direct-feedback batch", () => {
  it("publishes the exact 30 reviewed questions with distinct choice feedback", () => {
    expect(new Set(reviewedQuestionIds).size).toBe(30);

    for (const questionId of reviewedQuestionIds) {
      const question = questionById.get(questionId);
      expect(question, questionId).toBeDefined();
      expect(isPublishableQuestion(question!), questionId).toBe(true);
      expect(question?.approvedReview?.directSolution, questionId).toBeTruthy();
      expect(question?.approvedReview?.conceptBinding.assertionText, questionId)
        .toBeTruthy();
      expect(question?.choices, questionId).toHaveLength(4);
      expect(
        new Set(
          question?.choices.map((choice) => choice.feedback.rationale.trim()),
        ).size,
        questionId,
      ).toBe(4);
      expect(
        question?.choices.find(
          (choice) => choice.id === question.correctChoiceId,
        )?.feedback.incorrectPoint,
        questionId,
      ).toBeNull();
    }
  });

  it("keeps reconstructed exam conventions scoped instead of presenting them as universal field rules", () => {
    for (const questionId of historicalBoundaryIds) {
      const solution = questionById.get(questionId)?.approvedReview
        ?.directSolution ?? "";
      expect(solution, questionId).toMatch(
        /문항|시험|과거|기출|복원|실제|현행|제조사|규격|표준|도면/,
      );
      expect(solution, questionId).not.toMatch(
        /모든 .{0,20}(?:무조건|항상) 적용/,
      );
    }
  });
});
