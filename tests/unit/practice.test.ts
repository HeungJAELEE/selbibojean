import { describe, expect, it } from "vitest";
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
    const feedback = gradeQuestion(makeQuestion(1), "U-1-c2", "unsure", lesson);
    expect(feedback.isCorrect).toBe(false);
    expect(feedback.errorReason).toBe("개념 혼동");
    expect(feedback.lesson.href).toBe("/written/theory/lesson-a#principle");
    expect(feedback.selectedChoice.incorrectPoint).toBe("조건이 다름");
    expect(feedback.conceptSupport?.title).toBe("시험 개념");
    expect(feedback.conceptSupport?.blocks[0].id).toBe("principle");
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
