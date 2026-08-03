import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const runtime = buildRuntimeContent(generatedContent as GeneratedContent);
const requiredSubjectIds = [
  "subject-1",
  "subject-2",
  "subject-3",
  "subject-4",
] as const;
const genericFeedbackPatterns = [
  /복원 답(?:과|이) 다릅니다/u,
  /정답(?: 보기)?와 다릅니다/u,
  /같은 분야의 용어나 조건/u,
  /문제의 대상이 사람·장비·재료·공정/u,
  /같은 단어가 포함됐다는 이유만으로/u,
  /이 레슨에 연결된 CBT 원문/u,
  /정답 보기와 다릅니다/u,
];

describe("written direct-feedback coverage", () => {
  it("keeps symbolic truth-table identification out of the numerical calculation gate", () => {
    const question = runtime.questions.find(
      (candidate) => candidate.id === "U-408",
    );

    expect(question).toBeDefined();
    expect(question?.approvedReview?.directSolution).toContain("NOR");
    expect(question && isPublishableQuestion(question)).toBe(true);
  });

  it.each(requiredSubjectIds)(
    "%s has at least 20 independently reviewed public questions",
    (subjectId) => {
      const publicQuestions = runtime.questions.filter(
        (question) =>
          question.subjectId === subjectId && isPublishableQuestion(question),
      );

      expect(publicQuestions.length).toBeGreaterThanOrEqual(20);

      for (const question of publicQuestions) {
        const approvedReview = question.approvedReview;
        const lesson = runtime.lessons.find(
          (candidate) => candidate.id === question.lessonId,
        );
        const block = lesson?.blocks.find(
          (candidate) => candidate.id === question.lessonAnchor,
        );
        const feedbackText = [
          approvedReview?.directSolution ?? "",
          approvedReview?.conceptBinding.assertionText ?? "",
          ...question.choices.map((choice) => choice.feedback.rationale),
        ];

        expect(approvedReview, question.id).toBeDefined();
        expect(question.choices, question.id).toHaveLength(4);
        expect(new Set(question.choices.map((choice) => choice.id)).size).toBe(4);
        expect(
          question.choices.every(
            (choice) => choice.feedback.rationale.trim().length >= 12,
          ),
          question.id,
        ).toBe(true);
        expect(approvedReview?.conceptBinding.assertionText.trim(), question.id)
          .not.toBe("");
        expect(lesson, question.id).toBeDefined();
        expect(lesson?.subjectId, question.id).toBe(question.subjectId);
        expect(lesson?.conceptGroupId, question.id).toBe(
          question.conceptGroupId,
        );
        expect(block, question.id).toBeDefined();
        expect(approvedReview?.conceptBinding.href, question.id).toBe(
          `/written/theory/${question.lessonId}#${question.lessonAnchor}`,
        );
        expect(
          feedbackText.some((text) =>
            genericFeedbackPatterns.some((pattern) => pattern.test(text)),
          ),
          question.id,
        ).toBe(false);
      }
    },
  );

  it("keeps every unreviewed target-subject question outside publication", () => {
    const invalid = runtime.questions.filter(
      (question) =>
        requiredSubjectIds.includes(
          question.subjectId as (typeof requiredSubjectIds)[number],
        ) &&
        !question.approvedReview &&
        isPublishableQuestion(question),
    );

    expect(invalid).toEqual([]);
  });

  it("does not create review-only theory blocks to satisfy the gate", () => {
    expect(
      runtime.lessons.flatMap((lesson) =>
        lesson.blocks.filter((block) => block.id.startsWith("review-")),
      ),
    ).toEqual([]);
  });
});
