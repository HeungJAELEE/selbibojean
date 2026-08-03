import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConflictTheoryReview } from "@/components/conflict-theory-review";
import generatedContent from "@/data/generated/content.json";
import {
  selectConflictTheoryReviewItems,
} from "@/lib/content/conflict-theory-review";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { findForbiddenPreSubmitFields } from "@/lib/security/answer-leak";
import {
  isPublishableQuestion,
  selectPracticeQuestions,
} from "@/lib/domain/practice";
import type { GeneratedContent, Question } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);
const MULTIPLE_ANSWER_CONFLICT_ID = "U-484";

describe("conflict theory review", () => {
  it("projects an answer-conflict hold into an answer-free learner item", () => {
    const question = getConflictQuestion(MULTIPLE_ANSWER_CONFLICT_ID);
    const items = selectConflictTheoryReviewItems(content, {
      lessonId: question.lessonId,
    });
    const item = items.find(
      (candidate) => candidate.id === MULTIPLE_ANSWER_CONFLICT_ID,
    );

    expect(item).toBeDefined();
    expect(Object.keys(item!)).toEqual(["id", "stem", "choices", "reason"]);
    expect(item!.choices).toEqual(
      question.choices.map(({ id, text }) => ({ id, text })),
    );
    expect(item!.reason).not.toContain("③·④");
    expect(findForbiddenPreSubmitFields(item)).toEqual([]);

    const serialized = JSON.stringify(item);
    expect(serialized).not.toContain(question.explanation);
    expect(serialized).not.toContain(question.audit!.reviewNote);
    expect(serialized).not.toContain(question.audit!.nextAction);
  });

  it("keeps image-missing and answer-bearing DTO projections out of the surface", () => {
    const question = getConflictQuestion(MULTIPLE_ANSWER_CONFLICT_ID);
    const imageMissing = {
      ...question,
      audit: {
        ...question.audit!,
        assetStatus: "missing" as const,
      },
    };
    const dtoLeaking = {
      ...question,
      id: `${question.id}-dto-leak`,
      solution: "server-only answer",
    } as Question & { solution: string };

    expect(
      selectConflictTheoryReviewItems(
        { ...content, questions: [imageMissing] },
        { lessonId: question.lessonId },
      ),
    ).toEqual([]);
    expect(
      selectConflictTheoryReviewItems(
        { ...content, questions: [dtoLeaking] },
        { lessonId: question.lessonId },
      ),
    ).toEqual([]);
  });

  it("keeps all conflict-review items outside scored practice selection", () => {
    const conflictQuestions = content.questions.filter(
      (question) =>
        question.audit?.auditDisposition === "held_answer_conflict",
    );
    const scoredIds = new Set(
      selectPracticeQuestions(content.questions, {}, "all", 37).questions.map(
        (question) => question.id,
      ),
    );

    expect(conflictQuestions.length).toBeGreaterThan(0);
    expect(conflictQuestions.every((question) => !isPublishableQuestion(question)))
      .toBe(true);
    expect(conflictQuestions.every((question) => !scoredIds.has(question.id)))
      .toBe(true);
  });

  it("groups answer-conflict holds by subject for the reachable review page", () => {
    const items = selectConflictTheoryReviewItems(content, {
      subjectId: "subject-1",
    });

    expect(items.map((item) => item.id)).toContain(
      MULTIPLE_ANSWER_CONFLICT_ID,
    );
    expect(items.every((item) => findForbiddenPreSubmitFields(item).length === 0))
      .toBe(true);
  });

  it("removes promoted welding calculations while keeping unresolved safety holds answer-free", () => {
    const items = selectConflictTheoryReviewItems(content, {
      subjectId: "subject-2",
    });
    const acetylene = items.find(
      (item) =>
        item.id === "wcbt-50ea9e7d-008c-45e1-a35c-21ad26b026cc",
    );

    expect(acetylene).toBeUndefined();
    expect(items).toHaveLength(2);
    expect(items.some((item) => item.reason.includes("공식 안전자료"))).toBe(
      true,
    );
    expect(items.every((item) => findForbiddenPreSubmitFields(item).length === 0))
      .toBe(true);
  });

  it("renders a clearly labeled, static and ungraded review surface", () => {
    const question = getConflictQuestion(MULTIPLE_ANSWER_CONFLICT_ID);
    const items = selectConflictTheoryReviewItems(content, {
      lessonId: question.lessonId,
    });
    const protectedItem = items.find(
      (candidate) => candidate.id === MULTIPLE_ANSWER_CONFLICT_ID,
    );

    expect(protectedItem).toBeDefined();
    const { container } = render(
      <ConflictTheoryReview items={[protectedItem!]} />,
    );
    const surface = screen.getByTestId("conflict-theory-review");

    expect(
      within(surface).getByRole("heading", {
        name: "조건부 참고·비채점 검토 문항",
      }),
    ).toBeVisible();
    expect(
      within(surface).getAllByText("조건부 참고·비채점 검토 문항"),
    ).toHaveLength(2);
    expect(surface).toHaveTextContent(
      "연습·모의고사·오답 통계에는 포함되지 않습니다.",
    );
    expect(surface).toHaveTextContent(
      "정답과 해설은 검토가 끝나기 전까지 공개하지 않습니다.",
    );
    expect(container.querySelector("form, button, input, [role='radio']"))
      .toBeNull();
    expect(surface).not.toHaveTextContent(question.audit!.reviewNote);
    expect(surface).not.toHaveTextContent(question.explanation);
    expect(surface).not.toHaveTextContent("③·④");
  });
});

function getConflictQuestion(questionId: string) {
  const question = content.questions.find(
    (candidate) => candidate.id === questionId,
  );
  if (
    !question ||
    question.audit?.auditDisposition !== "held_answer_conflict"
  ) {
    throw new Error(`Missing answer-conflict fixture: ${questionId}`);
  }
  return question;
}
