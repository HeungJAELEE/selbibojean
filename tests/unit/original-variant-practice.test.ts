import { describe, expect, it } from "vitest";

import {
  gradeReviewedOriginalVariant,
  isReviewedExactOriginalVariant,
  OriginalVariantPracticeError,
  toReviewedOriginalPublicQuestion,
} from "@/lib/content/original-variant-practice";
import type { GeneratedContent, Question } from "@/lib/domain/types";

type Variant = GeneratedContent["variants"][number];

function makeQuestion(): Question {
  return {
    id: "U-1",
    canonicalNumber: 1,
    subjectId: "subject-1",
    conceptGroupId: "s1-g01",
    conceptId: "concept-a",
    lessonId: "lesson-a",
    lessonAnchor: "principle",
    stem: "대표 문제",
    choices: [1, 2, 3, 4].map((order) => ({
      id: `U-1-c${order}`,
      order,
      text: `대표 보기 ${order}`,
      feedback: {
        rationale: `대표 근거 ${order}`,
        plausibleReason: "혼동 가능성",
        incorrectPoint: order === 1 ? null : "조건이 다릅니다.",
        keyRule: "대표 핵심 규칙",
        differenceFromCorrect: order === 1 ? null : "정답 조건과 다릅니다.",
      },
    })),
    correctChoiceId: "U-1-c1",
    answerText: "대표 보기 1",
    explanation: "대표 문제의 검증된 해설입니다.",
    errorReason: "개념 혼동",
    sourceLabel: "canonical source",
    reviewStatus: "확정",
    contentStatus: "published",
    publication: { readiness: "ready", blockers: [] },
    verification: {
      status: "verified",
      method: "source_backed_reconstruction",
      variantCount: 1,
      sourceUrls: ["https://example.com/source"],
      riskTags: ["historical_context"],
      note: "원문 대조 완료",
      reviewedAt: "2026-08-05T00:00:00.000Z",
    },
    approvedReview: {
      directSolution: "대표 문제의 직접 풀이입니다.",
      conceptBinding: {
        assertionText: "대표 문제와 연결된 이론 근거입니다.",
        href: "/written/theory/lesson-a#principle",
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

function makeVariant(): Variant {
  return {
    externalId: "2006-4-Q01",
    canonicalId: "U-1",
    relationship: "original",
    year: 2006,
    sessionLabel: "4회",
    questionNumber: 1,
    conceptAlias: "대표 개념",
    subjectCode: 1,
    stem: "원문 문제",
    choices: ["원문 정답", "원문 오답 2", "원문 오답 3", "원문 오답 4"],
    answer: "① 원문 정답",
    explanation: "원문 해설",
    sourceUrl: "https://example.com/exam/2006-4#q1",
    reviewStatus: "GPT Pro 원문대조 완료",
    verificationNote: "회차 원문과 대조함",
    sourceFidelity: "exact",
    sourceReview: {
      answerConfidence: "confirmed",
      directSolution: "원문 조건을 대입하면 첫 번째 보기가 정답입니다.",
      calculation: null,
      choiceByChoiceReasons: [
        "원문 조건과 일치합니다.",
        "두 번째 조건은 원문과 다릅니다.",
        "세 번째 조건은 원문과 다릅니다.",
        "네 번째 조건은 원문과 다릅니다.",
      ],
      conceptKeywords: ["대표 개념"],
      theorySupplement: "원문 정답을 가르는 직접 이론 근거입니다.",
      imageRequirement: "none",
      answerConflictOrMultipleAnswerRisk: null,
    },
  };
}

describe("reviewed original variant publication gate", () => {
  it("publishes and grades only a confirmed, conflict-free exact variant", () => {
    const question = makeQuestion();
    const variant = makeVariant();

    expect(isReviewedExactOriginalVariant(variant)).toBe(true);
    const publicQuestion = toReviewedOriginalPublicQuestion(
      question,
      variant,
      20260805,
      false,
    );
    expect(publicQuestion.stem).toBe("원문 문제");
    expect(publicQuestion.choices.slice(0, 2)).toEqual([
      { id: "2006-4-Q01:choice:1", order: 1, text: "원문 정답" },
      { id: "2006-4-Q01:choice:2", order: 2, text: "원문 오답 2" },
    ]);
    expect(
      gradeReviewedOriginalVariant(
        question,
        variant,
        "2006-4-Q01:choice:1",
        "known",
      ).isCorrect,
    ).toBe(true);
  });

  it.each(["likely", "conflict", "unknown"] as const)(
    "rejects %s answer confidence",
    (answerConfidence) => {
      const variant = makeVariant();
      variant.sourceReview!.answerConfidence = answerConfidence;

      expect(isReviewedExactOriginalVariant(variant)).toBe(false);
    },
  );

  it("rejects any recorded conflict or multiple-answer risk", () => {
    const variant = makeVariant();
    variant.sourceReview!.answerConflictOrMultipleAnswerRisk =
      "두 보기가 같은 조건으로 해석될 수 있음";

    expect(isReviewedExactOriginalVariant(variant)).toBe(false);
  });

  it.each([
    ["empty answer", (variant: Variant) => {
      variant.answer = "   ";
    }],
    ["ambiguous fuzzy answer", (variant: Variant) => {
      variant.answer = "펌프 압력";
      variant.choices = [
        "주 펌프 압력",
        "보조 펌프 압력",
        "유량",
        "동력",
      ];
    }],
    ["empty choice", (variant: Variant) => {
      variant.choices[2] = "   ";
    }],
    ["duplicate choice", (variant: Variant) => {
      variant.choices[2] = variant.choices[1];
    }],
    ["missing choice reason", (variant: Variant) => {
      variant.sourceReview!.choiceByChoiceReasons.pop();
    }],
  ])("rejects a variant with %s", (_label, mutate) => {
    const variant = makeVariant();
    mutate(variant);

    expect(isReviewedExactOriginalVariant(variant)).toBe(false);
  });

  it("raises a typed domain error for a foreign synthetic choice ID", () => {
    const question = makeQuestion();
    const variant = makeVariant();

    expect(() =>
      gradeReviewedOriginalVariant(
        question,
        variant,
        "another-variant:choice:1",
        "unsure",
      ),
    ).toThrowError(
      expect.objectContaining({
        name: "OriginalVariantPracticeError",
        code: "ORIGINAL_VARIANT_CHOICE_INVALID",
        externalId: "2006-4-Q01",
      }),
    );
    expect(() =>
      gradeReviewedOriginalVariant(
        question,
        variant,
        "another-variant:choice:1",
        "unsure",
      ),
    ).toThrow(OriginalVariantPracticeError);
  });
});
