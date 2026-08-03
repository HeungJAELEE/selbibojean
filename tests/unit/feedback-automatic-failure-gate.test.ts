import { describe, expect, it, vi } from "vitest";

import generatedContent from "@/data/generated/content.json";
import { applyIndependentReviewGates } from "@/data/source/written-direct-question-reviews/independent-review-gates";
import {
  parseWrittenDirectQuestionReviews,
  type WrittenDirectQuestionReview,
} from "@/data/source/written-direct-question-reviews/schema";
import { applyWrittenDirectFeedback } from "@/lib/content/written-direct-feedback";
import { isPublishableQuestion, toPublicQuestion } from "@/lib/domain/practice";
import type {
  GeneratedContent,
  Lesson,
  Question,
  QuestionAudit,
} from "@/lib/domain/types";

const injectedReviews = vi.hoisted(
  () => [] as WrittenDirectQuestionReview[],
);

vi.mock("@/data/source/written-direct-question-reviews", () => ({
  WRITTEN_DIRECT_QUESTION_REVIEWS: injectedReviews,
}));

type ApprovedReview = Extract<
  WrittenDirectQuestionReview,
  { decision: "approve" }
>;

type FixtureOptions = {
  stem?: string;
  directSolution?: string;
  incorrectRationale?: string;
  assertionText?: string;
  lessonBody?: string;
  lessonConceptGroupId?: string;
  reviewBlockId?: string;
  audit?: QuestionAudit;
  reviewCorrectChoiceId?: string;
};

type FeedbackFixture = {
  question: Question;
  lesson: Lesson;
  review: ApprovedReview;
  additionalLessons?: Lesson[];
};

const sourceContent = generatedContent as GeneratedContent;
const questionTemplate = sourceContent.questions[0];
const lessonTemplate = sourceContent.lessons[0];
const lessonBlockTemplate = lessonTemplate.blocks[0];

function feedbackFixture(
  id: string,
  {
    stem = `${id} 설비의 고유 기능을 묻는 문항은?`,
    directSolution = `${id} 설비는 유체 압력을 검출하는 전용 계기로서 계통의 압력 상태를 판별한다.`,
    incorrectRationale = `${id}의 두 번째 보기는 온도를 감지하는 장치이므로 유체 압력 검출 기능과 일치하지 않는다.`,
    assertionText = `${id} 설비는 유체 압력을 검출하여 계통 상태를 확인한다.`,
    lessonBody = `핵심 이론: ${assertionText}`,
    lessonConceptGroupId = "s1-g01",
    reviewBlockId = "rule",
    audit,
    reviewCorrectChoiceId,
  }: FixtureOptions = {},
): FeedbackFixture {
  const lessonId = `lesson-${id.toLowerCase()}`;
  const choiceIds = [1, 2, 3, 4].map((order) => `${id}-c${order}`);
  const question: Question = {
    ...questionTemplate,
    id,
    canonicalNumber: Number(id.replace(/\D/gu, "")) || 1,
    subjectId: "subject-1",
    conceptGroupId: "s1-g01",
    lessonId,
    lessonAnchor: "rule",
    stem,
    choices: choiceIds.map((choiceId, index) => ({
      id: choiceId,
      order: index + 1,
      text: `${id} 선택지 ${index + 1}`,
      feedback: {
        rationale: "",
        plausibleReason: "",
        incorrectPoint: null,
        keyRule: "",
        differenceFromCorrect: null,
      },
    })),
    correctChoiceId: choiceIds[0],
    answerText: `${id} 선택지 1`,
    explanation: "",
    contentStatus: "in_review",
    publication: { readiness: "review", blockers: ["content_quality"] },
    audit,
    approvedReview: undefined,
    validation: {
      answer: true,
      explanation: false,
      choiceFeedback: false,
      theoryLink: false,
      contentQuality: false,
    },
  };
  const lesson: Lesson = {
    ...lessonTemplate,
    id: lessonId,
    subjectId: "subject-1",
    conceptGroupId: lessonConceptGroupId,
    blocks: [
      {
        ...lessonBlockTemplate,
        id: "rule",
        body: lessonBody,
      },
    ],
    relatedQuestionIds: [id],
  };
  const review: ApprovedReview = {
    questionId: id,
    subjectId: "subject-1",
    decision: "approve",
    correctChoiceId: reviewCorrectChoiceId ?? choiceIds[0],
    directSolution,
    choiceRationales: [
      {
        choiceId: choiceIds[0],
        verdict: "correct",
        rationale: `${id}의 첫 번째 보기는 유체 압력을 직접 검출하므로 문항의 기능 조건을 충족한다.`,
      },
      {
        choiceId: choiceIds[1],
        verdict: "incorrect",
        rationale: incorrectRationale,
      },
      {
        choiceId: choiceIds[2],
        verdict: "incorrect",
        rationale: `${id}의 세 번째 보기는 회전 속도를 검출하므로 압력 상태를 판별하는 계기와 용도가 다르다.`,
      },
      {
        choiceId: choiceIds[3],
        verdict: "incorrect",
        rationale: `${id}의 네 번째 보기는 유량을 검출하므로 압력이라는 대상 물리량과 구별해야 한다.`,
      },
    ],
    misconception: `${id}의 계기 이름만 보고 실제로 검출하는 물리량을 구분하지 못하는 오류다.`,
    existingLessonId: lessonId,
    existingBlockId: reviewBlockId,
    assertionText,
    evidenceUrls: ["https://example.com/source"],
    reviewedAt: "2026-08-03T00:00:00.000+09:00",
  };

  return { question, lesson, review };
}

function applyFixtures(fixtures: FeedbackFixture[]) {
  injectedReviews.splice(
    0,
    injectedReviews.length,
    ...fixtures.map(({ review }) => review),
  );
  return applyWrittenDirectFeedback({
    ...sourceContent,
    questions: fixtures.map(({ question }) => question),
    lessons: fixtures.flatMap(({ lesson, additionalLessons = [] }) => [
      lesson,
      ...additionalLessons,
    ]),
  });
}

describe("written direct-feedback independent review routing", () => {
  it("publishes a non-whitelisted approve candidate after schema and downstream gates pass", () => {
    const fixture = feedbackFixture("Q-NOT-WHITELISTED");
    const [parsed] = parseWrittenDirectQuestionReviews([fixture.review]);
    const [routed] = applyIndependentReviewGates([parsed]);

    expect(routed).toEqual(parsed);
    fixture.review = routed as ApprovedReview;
    expect(isPublishableQuestion(applyFixtures([fixture]).questions[0])).toBe(
      true,
    );
  });

  it("preserves an original hold decision", () => {
    const review: WrittenDirectQuestionReview = {
      questionId: "Q-HELD",
      subjectId: "subject-1",
      decision: "hold",
      holdReason: "정답 근거가 충돌하여 사람의 재검토가 필요합니다.",
      evidenceUrls: [],
      reviewedAt: "2026-08-03T00:00:00.000+09:00",
    };

    expect(applyIndependentReviewGates([review])).toEqual([review]);
  });
});

describe("written direct-feedback automatic failure gate", () => {
  it("rejects generic plausibility wording requested by the review policy", () => {
    const fixture = feedbackFixture("Q-101", {
      incorrectRationale:
        "이 선택지는 같은 분야 용어라 그럴듯하지만 문항별 판단 근거를 제시하지 않는다.",
    });

    expect(() => applyFixtures([fixture])).toThrowError(
      "WRITTEN_DIRECT_REVIEW_GENERIC_TEXT:Q-101",
    );
  });

  it("rejects a wrong-choice reason that ends with only '정답과 다르다'", () => {
    const fixture = feedbackFixture("Q-102", {
      incorrectRationale:
        "선택지의 표현은 별도 판단 근거 없이 단지 정답과 다르다.",
    });

    expect(() => applyFixtures([fixture])).toThrowError(
      "WRITTEN_DIRECT_REVIEW_INSUFFICIENT_WRONG_REASON:Q-102:Q-102-c2",
    );
  });

  it("rejects an exact explanation reused across different questions", () => {
    const duplicated =
      "압력계는 배관 내부의 유체 압력을 검출하므로 압력 상태를 묻는 조건에 맞는다.";
    const first = feedbackFixture("Q-103", { directSolution: duplicated });
    const second = feedbackFixture("Q-104", { directSolution: duplicated });

    expect(() => applyFixtures([first, second])).toThrowError(
      "WRITTEN_DIRECT_REVIEW_DUPLICATE_EXPLANATION:Q-103:Q-104",
    );
  });

  it("rejects a near-template explanation whose result token alone changed", () => {
    const first = feedbackFixture("Q-105", {
      directSolution:
        "펌프 효율은 입력 동력과 출력 동력을 대조해 계산하므로 선택지 80%가 정답이다.",
    });
    const second = feedbackFixture("Q-106", {
      directSolution:
        "펌프 효율은 입력 동력과 출력 동력을 대조해 계산하므로 선택지 90%가 정답이다.",
    });

    expect(() => applyFixtures([first, second])).toThrowError(
      "WRITTEN_DIRECT_REVIEW_DUPLICATE_EXPLANATION:Q-105:Q-106",
    );
  });

  it.each([
    {
      missing: "formula",
      directSolution:
        "단위: %. 대입: 80kW와 100kW를 사용한다. 결과: 효율은 80%이다.",
    },
    {
      missing: "unit",
      directSolution:
        "공식: 효율=(출력/입력)×100. 대입: (80/100)×100. 결과: 효율은 80이다.",
    },
    {
      missing: "substitution",
      directSolution:
        "공식: 효율=(출력/입력)×100. 단위: %. 결과: 효율은 80%이다.",
    },
    {
      missing: "result",
      directSolution:
        "공식: 효율=(출력/입력)×100. 단위: %. 대입: (80kW/100kW)×100을 계산한다.",
    },
  ])(
    "rejects a calculation explanation missing $missing",
    ({ missing, directSolution }) => {
      const fixture = feedbackFixture("Q-107", {
        stem: "입력이 100kW이고 출력이 80kW일 때 효율은?",
        directSolution,
      });

      expect(() => applyFixtures([fixture])).toThrowError(
        `WRITTEN_DIRECT_REVIEW_CALCULATION_INCOMPLETE:Q-107:${missing}`,
      );
    },
  );

  it("accepts a calculation explanation with formula, unit, substitution, and result", () => {
    const fixture = feedbackFixture("Q-108", {
      stem: "입력이 100kW이고 출력이 80kW일 때 효율은?",
      directSolution:
        "공식: 효율=(출력/입력)×100. 단위: %. 대입: (80kW/100kW)×100. 결과: 효율은 80%이다.",
    });

    const question = applyFixtures([fixture]).questions[0];

    expect(isPublishableQuestion(question)).toBe(true);
  });

  it("accepts a reviewed assertion without requiring an exact sentence in the linked block", () => {
    const fixture = feedbackFixture("Q-109", {
      assertionText: "압력계는 유체 압력을 검출한다.",
      lessonBody: "이 블록은 온도계의 측정 원리만 설명한다.",
    });

    const question = applyFixtures([fixture]).questions[0];

    expect(isPublishableQuestion(question)).toBe(true);
    expect(question.approvedReview?.conceptBinding.assertionText).toBe(
      "압력계는 유체 압력을 검출한다.",
    );
  });

  it("falls back from a cross-category review target to the question's existing same-category target", () => {
    const fixture = feedbackFixture("Q-109A");
    const crossCategoryLesson: Lesson = {
      ...fixture.lesson,
      id: "lesson-q-109a-cross-category",
      conceptGroupId: "s1-g02",
    };
    fixture.review.existingLessonId = crossCategoryLesson.id;
    fixture.additionalLessons = [crossCategoryLesson];

    const question = applyFixtures([fixture]).questions[0];

    expect(isPublishableQuestion(question)).toBe(true);
    expect(question.lessonId).toBe(fixture.question.lessonId);
    expect(question.lessonAnchor).toBe(fixture.question.lessonAnchor);
    expect(question.approvedReview?.conceptBinding.href).toBe(
      `/written/theory/${fixture.question.lessonId}#${fixture.question.lessonAnchor}`,
    );
  });

  it("rejects a cross-category review target when the existing target is also cross-category", () => {
    const fixture = feedbackFixture("Q-109B", {
      lessonConceptGroupId: "s1-g02",
    });
    const otherCrossCategoryLesson: Lesson = {
      ...fixture.lesson,
      id: "lesson-q-109b-other-category",
      conceptGroupId: "s1-g03",
    };
    fixture.review.existingLessonId = otherCrossCategoryLesson.id;
    fixture.additionalLessons = [otherCrossCategoryLesson];

    expect(() => applyFixtures([fixture])).toThrowError(
      "WRITTEN_DIRECT_REVIEW_CONCEPT_MISMATCH:Q-109B",
    );
  });

  it("rejects a review when neither the review nor fallback block exists", () => {
    const fixture = feedbackFixture("Q-109C", {
      reviewBlockId: "missing-rule",
    });
    fixture.question.lessonAnchor = "missing-fallback-rule";

    expect(() => applyFixtures([fixture])).toThrowError(
      "WRITTEN_DIRECT_REVIEW_CONCEPT_MISMATCH:Q-109C",
    );
  });

  it.each([
    {
      disposition: "held_asset_missing" as const,
      reviewCorrectChoiceId: undefined,
    },
    {
      disposition: "held_answer_conflict" as const,
      reviewCorrectChoiceId: "Q-111-c2",
    },
  ])(
    "keeps $disposition outside publication and scoring",
    ({ disposition, reviewCorrectChoiceId }) => {
      const id =
        disposition === "held_asset_missing" ? "Q-110" : "Q-111";
      const fixture = feedbackFixture(id, {
        audit: {
          auditDisposition: disposition,
          evidenceLevel: null,
          cbtAnswer: disposition === "held_answer_conflict" ? "1" : null,
          verifiedAnswer:
            disposition === "held_answer_conflict" ? "2" : null,
          evidenceUrls: [],
          reviewNote: "자동 검증용 HOLD",
          assetStatus:
            disposition === "held_asset_missing" ? "missing" : "not_required",
          nextAction: "사람 검토",
        },
        reviewCorrectChoiceId,
      });

      const question = applyFixtures([fixture]).questions[0];

      expect(question.contentStatus).toBe("in_review");
      expect(question.publication?.readiness).toBe("blocked");
      expect(question.approvedReview).toBeUndefined();
      expect(isPublishableQuestion(question)).toBe(false);
    },
  );

  it("keeps answer and explanation fields out of the pre-submit DTO", () => {
    const fixture = feedbackFixture("Q-112");
    const question = applyFixtures([fixture]).questions[0];
    const publicPayload = JSON.stringify(toPublicQuestion(question));

    expect(publicPayload).not.toContain("correctChoiceId");
    expect(publicPayload).not.toContain("answerText");
    expect(publicPayload).not.toContain("explanation");
    expect(publicPayload).not.toContain("approvedReview");
  });
});
