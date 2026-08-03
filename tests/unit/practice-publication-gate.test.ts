import { describe, expect, it } from "vitest";

import {
  isPublishableQuestion,
  selectAllocatedPracticeQuestions,
  selectPracticeQuestions,
  toPublicQuestion,
} from "@/lib/domain/practice";
import type { Question } from "@/lib/domain/types";

function makeQuestion(id: string): Question {
  return {
    id,
    canonicalNumber: Number(id.replace(/\D/g, "")) || 1,
    subjectId: "subject-2",
    conceptGroupId: "s2-g01",
    conceptId: "concept-welding",
    lessonId: "lesson-welding",
    lessonAnchor: "principle",
    stem: `${id} 공개 후보`,
    choices: [1, 2, 3, 4].map((order) => ({
      id: `${id}-c${order}`,
      order,
      text: `보기 ${order}`,
      feedback: {
        rationale: `근거 ${order}`,
        plausibleReason: "오답처럼 보이는 이유",
        incorrectPoint: order === 1 ? null : "조건이 다릅니다.",
        keyRule: "검증된 핵심 규칙",
        differenceFromCorrect: order === 1 ? null : "정답 조건과 다릅니다.",
      },
    })),
    correctChoiceId: `${id}-c1`,
    answerText: "보기 1",
    explanation: "검증된 해설",
    errorReason: "개념 혼동",
    sourceLabel: "approved welding review",
    reviewStatus: "답안 검토 승인",
    contentStatus: "published",
    publication: { readiness: "ready", blockers: [] },
    verification: {
      status: "verified",
      method: "source_backed_reconstruction",
      variantCount: 1,
      sourceUrls: ["https://example.com/welding-source"],
      riskTags: ["historical_context"],
      note: "원문과 승인 검토를 대조했습니다.",
      reviewedAt: "2026-08-03T00:00:00.000Z",
    },
    audit: {
      auditDisposition: "verified",
      evidenceLevel: "primary",
      cbtAnswer: "보기 1",
      verifiedAnswer: "보기 1",
      evidenceUrls: ["https://example.com/welding-source"],
      reviewNote: "승인 검토 완료",
      assetStatus: "not_required",
      nextAction: "없음",
    },
    approvedReview: {
      directSolution:
        "보기 1이 독립 검토된 이론 명제와 일치하므로 정답입니다.",
      conceptBinding: {
        assertionText:
          "보기 1의 공정 조건은 독립 검토된 이론 블록의 설명과 일치합니다.",
        href: "/written/theory/lesson-welding#principle",
      },
    },
    validation: {
      answer: true,
      explanation: true,
      choiceFeedback: true,
      theoryLink: true,
      contentQuality: true,
    },
  };
}

function candidateIds(questions: Question[]) {
  return {
    random: selectPracticeQuestions(questions, {}, "all", 20260803)
      .questions.map((question) => question.id),
    mock: selectAllocatedPracticeQuestions(
      questions,
      [{ subjectId: "subject-2", count: questions.length }],
      20260803,
    ).questions.map((question) => question.id),
    theory: questions
      .filter(
        (question) =>
          question.lessonId === "lesson-welding" &&
          isPublishableQuestion(question),
      )
      .map((question) => question.id),
  };
}

const validationKeys = [
  "answer",
  "explanation",
  "choiceFeedback",
  "theoryLink",
  "contentQuality",
] as const;

describe("practice publication gate", () => {
  it("keeps an approved welding question in random, mock, and theory candidates", () => {
    const approved = makeQuestion("approved-1");

    expect(candidateIds([approved])).toEqual({
      random: ["approved-1"],
      mock: ["approved-1"],
      theory: ["approved-1"],
    });

    const publicQuestion = toPublicQuestion(approved);
    expect(publicQuestion).not.toHaveProperty("correctChoiceId");
    expect(publicQuestion).not.toHaveProperty("answerText");
    expect(publicQuestion).not.toHaveProperty("explanation");
    expect(publicQuestion).not.toHaveProperty("approvedReview");
    expect(publicQuestion.choices.every((choice) => !("feedback" in choice))).toBe(
      true,
    );
  });

  it.each([
    [
      "missing independently approved direct feedback",
      (question: Question) => {
        question.approvedReview = undefined;
      },
    ],
    [
      "blocked publication",
      (question: Question) => {
        question.publication = {
          readiness: "blocked",
          blockers: ["answer_unverified"],
        };
      },
    ],
    [
      "review publication",
      (question: Question) => {
        question.publication = {
          readiness: "review",
          blockers: ["mapping_unverified"],
        };
      },
    ],
    [
      "missing publication assessment",
      (question: Question) => {
        question.publication = undefined;
      },
    ],
    [
      "blocked verification",
      (question: Question) => {
        question.verification = {
          ...question.verification!,
          status: "blocked",
          method: "manual_source_required",
        };
      },
    ],
    [
      "missing verification assessment",
      (question: Question) => {
        question.verification = undefined;
      },
    ],
  ])(
    "excludes a %s question from random, mock, and theory candidates",
    (_label, mutate) => {
      const approved = makeQuestion("approved-1");
      const held = makeQuestion("held-2");
      mutate(held);

      expect(candidateIds([approved, held])).toEqual({
        random: ["approved-1"],
        mock: ["approved-1"],
        theory: ["approved-1"],
      });
    },
  );

  it.each(validationKeys)(
    "excludes a question when %s validation fails",
    (validationKey) => {
      const approved = makeQuestion("approved-1");
      const invalid = makeQuestion("invalid-2");
      invalid.validation[validationKey] = false;

      expect(candidateIds([approved, invalid])).toEqual({
        random: ["approved-1"],
        mock: ["approved-1"],
        theory: ["approved-1"],
      });
    },
  );
});
