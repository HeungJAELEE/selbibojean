import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);

describe("written direct feedback publication boundary", () => {
  it("publishes an approved direct review against an existing theory block", () => {
    const question = content.questions.find(
      (candidate) => candidate.id === "U-073",
    );
    const lesson = content.lessons.find(
      (candidate) => candidate.id === question?.lessonId,
    );
    const block = lesson?.blocks.find(
      (candidate) => candidate.id === question?.lessonAnchor,
    );

    expect(question).toBeDefined();
    expect(isPublishableQuestion(question!)).toBe(true);
    expect(question?.approvedReview?.conceptBinding.href).toBe(
      "/written/theory/lesson-psovio#exam-point",
    );
    expect(block?.body).toContain(
      question?.approvedReview?.conceptBinding.assertionText,
    );
    expect(
      question?.choices.every(
        (choice) => !choice.feedback.rationale.includes("관련 용어이지만"),
      ),
    ).toBe(true);
  });

  it("publishes the newly approved subject-3 direct review", () => {
    const target = content.questions.find(
      (candidate) => candidate.id === "U-085",
    );

    expect(target?.subjectId).toBe("subject-3");
    expect(target?.contentStatus).toBe("published");
    expect(target?.publication?.readiness).toBe("ready");
    expect(target?.approvedReview).toBeDefined();
    expect(isPublishableQuestion(target!)).toBe(true);
  });

  it("publishes records that now pass the independent review gate", () => {
    const accepted = content.questions.find(
      (candidate) => candidate.id === "U-117",
    );
    const newlyAccepted = content.questions.find(
      (candidate) => candidate.id === "U-002",
    );

    expect(isPublishableQuestion(accepted!)).toBe(true);
    expect(accepted?.approvedReview).toBeDefined();
    expect(isPublishableQuestion(newlyAccepted!)).toBe(true);
    expect(newlyAccepted?.approvedReview).toBeDefined();
  });

  it("publishes independently accepted subject-1 backlog reviews", () => {
    const accepted = content.questions.find(
      (candidate) => candidate.id === "U-133",
    );
    const newlyAccepted = content.questions.find(
      (candidate) => candidate.id === "U-551",
    );

    expect(isPublishableQuestion(accepted!)).toBe(true);
    expect(accepted?.approvedReview?.directSolution).toContain("베르누이");
    expect(isPublishableQuestion(newlyAccepted!)).toBe(true);
    expect(newlyAccepted?.approvedReview).toBeDefined();
  });

  it("publishes independently grounded subject-4 backlog items", () => {
    const accepted = content.questions.find(
      (candidate) => candidate.id === "U-022",
    );
    const newlyAccepted = content.questions.find(
      (candidate) => candidate.id === "U-106",
    );

    expect(isPublishableQuestion(accepted!)).toBe(true);
    expect(accepted?.approvedReview?.directSolution).toBeTruthy();
    expect(
      accepted?.choices.every((choice) => choice.feedback.rationale.length > 0),
    ).toBe(true);
    expect(accepted?.approvedReview?.conceptBinding.assertionText).toBeTruthy();
    expect(isPublishableQuestion(newlyAccepted!)).toBe(true);
    expect(newlyAccepted?.approvedReview).toBeDefined();
  });

  it("does not manufacture review-* theory blocks", () => {
    expect(
      content.lessons.some((lesson) =>
        lesson.blocks.some((block) => block.id.startsWith("review-")),
      ),
    ).toBe(false);
  });
});
