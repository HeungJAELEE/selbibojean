import { describe, expect, it } from "vitest";
import { bdaContent } from "@/data/source/bda-content";
import {
  bdaContentSchema,
  gradeBdaQuestion,
  isPublishableBdaQuestion,
  toPublicBdaQuestion,
} from "@/lib/domain/bda";

describe("빅데이터분석기사 MVP 콘텐츠", () => {
  const content = bdaContentSchema.parse(bdaContent);

  it("4과목과 과목별 5개 레슨을 연결한다", () => {
    expect(content.subjects).toHaveLength(4);
    expect(content.lessons).toHaveLength(20);

    for (const subject of content.subjects) {
      expect(
        content.lessons.filter((lesson) => lesson.subjectId === subject.id),
      ).toHaveLength(5);
    }
  });

  it("레슨과 공개 문제의 관계가 모두 유효하다", () => {
    const lessonIds = new Set(content.lessons.map((lesson) => lesson.id));
    const subjectIds = new Set(content.subjects.map((subject) => subject.id));
    const questionIds = new Set(content.questions.map((question) => question.id));

    expect(questionIds.size).toBe(content.questions.length);
    for (const question of content.questions) {
      expect(lessonIds.has(question.lessonId)).toBe(true);
      expect(subjectIds.has(question.subjectId)).toBe(true);
      expect(isPublishableBdaQuestion(question)).toBe(true);
      expect(
        question.choices.some(
          (choice) => choice.id === question.correctChoiceId,
        ),
      ).toBe(true);
    }

    for (const lesson of content.lessons) {
      for (const questionId of lesson.questionIds) {
        expect(questionIds.has(questionId)).toBe(true);
      }
    }
  });

  it("제출 전 공개 DTO에서 정답·해설·선택지 피드백을 제거한다", () => {
    const safe = toPublicBdaQuestion(content.questions[0]);
    const serialized = JSON.stringify(safe);

    expect(serialized).not.toContain("correctChoiceId");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("feedback");
    expect(serialized).not.toContain("reviewStatus");
    expect(serialized).not.toContain("evidenceGrade");
    expect(serialized).not.toContain("sourceLabel");
    expect(serialized).not.toMatch(/notion\.(?:site|so)/i);
    expect(safe.choices).toHaveLength(4);
  });

  it("제출 뒤에는 선택지 근거와 연결 이론을 반환한다", () => {
    const question = content.questions[0];
    const feedback = gradeBdaQuestion(question, question.correctChoiceId);

    expect(feedback.isCorrect).toBe(true);
    expect(feedback.explanation).toBeTruthy();
    expect(feedback.selectedChoice.feedback).toBeTruthy();
    expect(feedback.lesson.href).toBe(
      `/bda/written/theory/${question.lessonId}#exam-traps`,
    );
  });
});
