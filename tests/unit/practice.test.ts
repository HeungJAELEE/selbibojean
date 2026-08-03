import { describe, expect, it } from "vitest";
import { orderPracticeChoices } from "@/lib/content/practice-choice-order";
import { buildWeakFocus, gradeQuestion, isPublishableQuestion, selectAllocatedPracticeQuestions, selectPracticeQuestions, toPublicQuestion } from "@/lib/domain/practice";
import type { Lesson, Question } from "@/lib/domain/types";

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
    publication: { readiness: "ready", blockers: [] },
    verification: {
      status: "verified",
      method: "source_backed_reconstruction",
      variantCount: 2,
      sourceUrls: ["https://example.com/source"],
      riskTags: ["editorial_reconstruction"],
      note: "원문 대조 완료",
      reviewedAt: "2026-07-23T00:00:00.000Z",
    },
    approvedReview: {
      directSolution: "문제 조건과 각 보기를 직접 대조한 승인 풀이입니다.",
      conceptBinding: {
        assertionText: "문제의 정답을 가르는 기존 이론 블록의 직접 판단근거입니다.",
        href: "/written/theory/lesson-a#principle",
      },
    },
    validation: { answer: true, explanation: true, choiceFeedback: true, theoryLink: true, contentQuality: true },
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

  it("changes the randomized order when a new session uses a different seed", () => {
    const questions = Array.from({ length: 20 }, (_, index) => makeQuestion(index + 1));
    const first = selectPracticeQuestions(questions, {}, 20, 2026).questions.map((question) => question.id);
    const second = selectPracticeQuestions(questions, {}, 20, 2027).questions.map((question) => question.id);
    expect(first).not.toEqual(second);
    expect(new Set(first)).toEqual(new Set(second));
  });

  it("shuffles choice IDs deterministically by session and variant while preserving fixed order", () => {
    const choices = ["choice-a", "choice-b", "choice-c", "choice-d"].map((id) => ({ id }));
    const first = orderPracticeChoices(choices, 20260801, "variant-1", true).map((choice) => choice.id);
    const repeated = orderPracticeChoices(choices, 20260801, "variant-1", true).map((choice) => choice.id);
    const nextSession = orderPracticeChoices(choices, 20260802, "variant-1", true).map((choice) => choice.id);

    expect(repeated).toEqual(first);
    expect(nextSession).not.toEqual(first);
    expect(orderPracticeChoices(choices, 20260801, "variant-1", false)).toEqual(choices);
  });

  it("maps approved feedback by stable choice ID after choices are shuffled", () => {
    const question = makeQuestion(1);
    question.approvedReview = {
      directSolution: "승인된 직접 풀이",
      conceptBinding: {
        assertionText: "문제와 직접 연결된 승인 개념입니다.",
        href: "/written/theory/lesson-canonical#structure",
      },
    };
    question.choices = orderPracticeChoices(
      question.choices,
      20260803,
      "approved-variant",
      true,
    );

    const feedback = gradeQuestion(question, "U-1-c3", "unsure");

    expect(feedback.approvedReview).toEqual({
      directSolution: "승인된 직접 풀이",
      conceptBinding: {
        assertionText: "문제와 직접 연결된 승인 개념입니다.",
        href: "/written/theory/lesson-canonical#structure",
      },
      selectedChoiceReason: "근거 3",
    });
    expect(feedback.selectedChoice.id).toBe("U-1-c3");
    expect(feedback.lesson.href).toBe(
      "/written/theory/lesson-canonical#structure",
    );
    expect(feedback.conceptSupport).toBeNull();
  });

  it("expands repeated mistakes into related questions from the weakest groups", () => {
    const questions = Array.from({ length: 12 }, (_, index) => {
      const question = makeQuestion(index + 1);
      question.conceptGroupId = index < 5 ? "s1-g01" : index < 9 ? "s1-g02" : "s1-g03";
      return question;
    });
    const focus = buildWeakFocus(questions, ["U-1", "U-1", "U-2", "U-6"], "subject-1", 2);

    expect(focus.fallback).toBe(false);
    expect(focus.groups).toEqual([
      { id: "s1-g01", mistakes: 3 },
      { id: "s1-g02", mistakes: 1 },
    ]);
    expect(focus.questionIds).toHaveLength(9);
    expect(focus.questionIds).toContain("U-5");
    expect(focus.questionIds).toContain("U-9");
  });

  it("builds an 80-question mock with exactly 20 unique questions per subject", () => {
    const questions = Array.from({ length: 100 }, (_, index) => {
      const question = makeQuestion(index + 1);
      question.subjectId = `subject-${Math.floor(index / 25) + 1}`;
      return question;
    });
    const result = selectAllocatedPracticeQuestions(
      questions,
      [1, 2, 3, 4].map((code) => ({ subjectId: `subject-${code}`, count: 20 })),
      80,
    );

    expect(result.questions).toHaveLength(80);
    expect(new Set(result.questions.map((question) => question.id)).size).toBe(80);
    expect(result.breakdown.map((item) => item.actualCount)).toEqual([20, 20, 20, 20]);
  });

  it("does not expose answers or feedback before submission", () => {
    const question = makeQuestion(1);
    question.approvedReview = {
      directSolution: "제출 전 비공개 승인 풀이",
      conceptBinding: {
        assertionText: "제출 전 비공개 승인 개념",
        href: "/written/theory/lesson-secret#trap",
      },
      calculation: {
        formula: "SECRET_FORMULA",
        substitution: "SECRET_SUBSTITUTION",
        result: "SECRET_RESULT",
        unit: "SECRET_UNIT",
      },
    };
    question.audit = {
      questionId: question.id,
      scope: "high_risk_public",
      sourceContentStatus: "published",
      auditDisposition: "cbt_corrected",
      evidenceLevel: "primary",
      cbtAnswer: "공개 CBT 답",
      verifiedAnswer: "검증된 답",
      evidenceUrls: ["https://example.com/official"],
      reviewNote: "공식 근거로 답을 보정했습니다.",
      nextAction: "정기 검토",
      assetStatus: "not_required",
      reviewedAt: "2026-07-23T00:00:00.000Z",
    };
    const payload = JSON.stringify(toPublicQuestion(question));
    expect(payload).not.toContain("correctChoiceId");
    expect(payload).not.toContain("answerText");
    expect(payload).not.toContain("전체 해설");
    expect(payload).not.toContain("plausibleReason");
    expect(payload).not.toContain("readiness");
    expect(payload).not.toContain("source_backed_reconstruction");
    expect(payload).not.toContain("example.com/source");
    expect(payload).not.toContain("auditDisposition");
    expect(payload).not.toContain("cbtAnswer");
    expect(payload).not.toContain("verifiedAnswer");
    expect(payload).not.toContain("evidenceUrls");
    expect(payload).not.toContain("공식 근거로 답을 보정했습니다.");
    expect(payload).not.toContain("approvedReview");
    expect(payload).not.toContain("제출 전 비공개 승인 풀이");
    expect(payload).not.toContain("제출 전 비공개 승인 개념");
    expect(payload).not.toContain("SECRET_FORMULA");
  });

  it("blocks every held audit disposition from public practice", () => {
    const dispositions = [
      "held_answer_conflict",
      "held_asset_missing",
      "held_source_missing",
    ] as const;

    for (const auditDisposition of dispositions) {
      const question = makeQuestion(1);
      question.audit = {
        questionId: question.id,
        scope: "review_queue",
        sourceContentStatus: "in_review",
        auditDisposition,
        evidenceLevel: null,
        cbtAnswer: "CBT 공개답",
        verifiedAnswer: null,
        evidenceUrls: [],
        reviewNote: "공개할 수 없는 보류 사유가 있습니다.",
        nextAction: "원문과 상위 근거를 추가 확인합니다.",
        assetStatus:
          auditDisposition === "held_asset_missing" ? "missing" : "not_required",
        reviewedAt: "2026-07-23T00:00:00.000Z",
      };

      expect(isPublishableQuestion(question)).toBe(false);
    }
  });

  it("keeps every written subject out of public practice until direct feedback is approved", () => {
    for (const subjectId of [
      "subject-1",
      "subject-2",
      "subject-3",
      "subject-4",
    ]) {
      const question = makeQuestion(1);
      question.subjectId = subjectId;
      delete question.approvedReview;
      expect(isPublishableQuestion(question)).toBe(false);
    }
  });

  it("returns selected-choice reasoning and the exact lesson anchor after submission", () => {
    const lesson: Lesson = {
      id: "lesson-a",
      subjectId: "subject-1",
      conceptGroupId: "s1-g01",
      conceptId: "concept-a",
      title: "시험 개념",
      aliases: [],
      summary: ["첫 번째 핵심 요약입니다.", "두 번째 핵심 요약입니다.", "세 번째 핵심 요약입니다."],
      blocks: [
        { id: "principle", kind: "principle", title: "작동 원리", body: "문제와 직접 연결되는 작동 원리입니다.", order: 1 },
        { id: "trap", kind: "trap", title: "오답 함정", body: "혼동 기준을 비교합니다.", order: 2 },
      ],
      relatedQuestionIds: ["U-1"],
      coverageStatus: "covered",
      contentStatus: "published",
      sourceNeeded: false,
      reviewedAt: null,
      quality: { tier: "standard", substantiveCharacters: 800, genericPhraseMatches: [], languageIssueMatches: [], sourceLinked: true, passed: true },
    };
    const question = makeQuestion(1);
    delete question.approvedReview;
    const feedback = gradeQuestion(question, "U-1-c2", "unsure", lesson);
    expect(feedback.isCorrect).toBe(false);
    expect(feedback.errorReason).toBe("개념 혼동");
    expect(feedback.lesson.href).toBe("/written/theory/lesson-a#principle");
    expect(feedback.feedbackQuality).toBe("pending_review");
    expect(feedback.selectedChoice.incorrectPoint).toBeNull();
    expect(feedback.conceptSupport).toBeNull();
    expect(feedback.feedbackNotice).toContain("선택지별 풀이와 개념 연결을 검수 중");
  });

  it("BUG-R-PRACTICE-CONCEPT-SUPPORT: omits full exam-pattern banks from inline feedback", () => {
    const question = makeQuestion(1);
    question.lessonAnchor = "exam-point";
    question.approvedReview!.conceptBinding.href =
      "/written/theory/lesson-a#exam-point";
    const lesson: Lesson = {
      id: "lesson-a",
      subjectId: "subject-1",
      conceptGroupId: "s1-g01",
      conceptId: "concept-a",
      title: "시험 개념",
      aliases: [],
      summary: ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
      blocks: [
        {
          id: "definition",
          kind: "definition",
          title: "정의",
          body: "제출 뒤 바로 복습할 수 있는 짧은 정의입니다.",
          order: 1,
        },
        {
          id: "principle",
          kind: "principle",
          title: "원리",
          body: "정답 판단에 필요한 핵심 원리입니다.",
          order: 2,
        },
        {
          id: "exam-point",
          kind: "exam_point",
          title: "시험에 자주 출제되는 유형",
          body: Array.from(
            { length: 20 },
            (_, index) => `질문 ${index + 1}\n판단 기준 ${index + 1}`,
          ).join("\n\n---\n\n"),
          order: 3,
        },
        {
          id: "trap",
          kind: "trap",
          title: "오답 함정",
          body: "혼동하기 쉬운 조건을 확인합니다.",
          order: 4,
        },
      ],
      relatedQuestionIds: [question.id],
      coverageStatus: "covered",
      contentStatus: "published",
      sourceNeeded: false,
      reviewedAt: null,
      quality: {
        tier: "standard",
        substantiveCharacters: 800,
        genericPhraseMatches: [],
        languageIssueMatches: [],
        sourceLinked: true,
        passed: true,
      },
    };

    const feedback = gradeQuestion(question, "U-1-c1", "known", lesson);

    expect(feedback.lesson.href).toBe("/written/theory/lesson-a#exam-point");
    expect(feedback.conceptSupport).toBeNull();
  });

  it("returns CBT correction evidence only after grading", () => {
    const question = makeQuestion(1);
    question.audit = {
      questionId: question.id,
      scope: "high_risk_public",
      sourceContentStatus: "published",
      auditDisposition: "cbt_corrected",
      evidenceLevel: "primary",
      cbtAnswer: "② 공개 CBT 답",
      verifiedAnswer: "① 검증 답",
      evidenceUrls: ["https://example.com/official-standard"],
      reviewNote: "공식 표준에 따라 CBT 공개답을 보정했습니다.",
      nextAction: "정기 검토",
      assetStatus: "not_required",
      reviewedAt: "2026-07-23T00:00:00.000Z",
    };

    const feedback = gradeQuestion(question, "U-1-c1", "known");

    expect(feedback.answerAudit).toEqual({
      auditDisposition: "cbt_corrected",
      cbtAnswer: "② 공개 CBT 답",
      verifiedAnswer: "① 검증 답",
      evidenceUrls: ["https://example.com/official-standard"],
      reviewNote: "공식 표준에 따라 CBT 공개답을 보정했습니다.",
    });
  });
});
