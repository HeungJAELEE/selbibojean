import { describe, expect, it } from "vitest";
import { gradeQuestion, selectPracticeQuestions, toPublicQuestion } from "@/lib/domain/practice";
import type { Question } from "@/lib/domain/types";

function makeQuestion(index: number): Question {
  return {
    id: `U-${index}`,
    canonicalNumber: index,
    subjectId: "subject-1",
    conceptGroupId: "s1-g01",
    conceptId: "concept-a",
    lessonId: "lesson-a",
    lessonAnchor: "principle",
    stem: `문제 ${index}`,
    choices: [1, 2, 3, 4].map((order) => ({
      id: `U-${index}-c${order}`,
      order,
      text: `보기 ${order}`,
      feedback: {
        rationale: `근거 ${order}`,
        plausibleReason: "그럴듯한 이유",
        incorrectPoint: order === 1 ? null : "조건이 다름",
        keyRule: "핵심 규칙",
        differenceFromCorrect: order === 1 ? null : "정답과 다름",
      },
    })),
    correctChoiceId: `U-${index}-c1`,
    answerText: "보기 1",
    explanation: "충분히 검증된 전체 해설입니다.",
    errorReason: "개념 혼동",
    sourceLabel: "source",
    reviewStatus: "확정",
    contentStatus: "published",
    validation: { answer: true, explanation: true, choiceFeedback: true, theoryLink: true },
  };
}

describe("random practice", () => {
  it("uses each question at most once and caps to availability", () => {
    const result = selectPracticeQuestions(Array.from({ length: 12 }, (_, index) => makeQuestion(index + 1)), {}, 20, 42);
    expect(result.questions).toHaveLength(12);
    expect(new Set(result.questions.map((question) => question.id)).size).toBe(12);
    expect(result.limited).toBe(true);
  });

  it("keeps the same deterministic order for a seed", () => {
    const questions = Array.from({ length: 20 }, (_, index) => makeQuestion(index + 1));
    const first = selectPracticeQuestions(questions, {}, 10, 2026).questions.map((question) => question.id);
    const second = selectPracticeQuestions(questions, {}, 10, 2026).questions.map((question) => question.id);
    expect(first).toEqual(second);
  });

  it("does not expose answers or feedback before submission", () => {
    const payload = JSON.stringify(toPublicQuestion(makeQuestion(1)));
    expect(payload).not.toContain("correctChoiceId");
    expect(payload).not.toContain("answerText");
    expect(payload).not.toContain("전체 해설");
    expect(payload).not.toContain("plausibleReason");
  });

  it("returns selected-choice reasoning and the exact lesson anchor after submission", () => {
    const feedback = gradeQuestion(makeQuestion(1), "U-1-c2", "unsure");
    expect(feedback.isCorrect).toBe(false);
    expect(feedback.errorReason).toBe("개념 혼동");
    expect(feedback.lesson.href).toBe("/written/theory/lesson-a#principle");
    expect(feedback.selectedChoice.incorrectPoint).toBe("조건이 다름");
  });
});

