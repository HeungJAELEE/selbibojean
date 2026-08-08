import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import { getLessonFamilies } from "@/lib/content/lesson-families";
import {
  getApprovedWeldingProcessContent,
  mergeApprovedWeldingProcessContent,
} from "@/lib/content/welding-process-approved";
import { isPublishableQuestion, toPublicQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

describe("아크용접 공정별 보강 콘텐츠", () => {
  it("피복아크·TIG·GMAW·FCAW·SAW·차폐 조건 레슨과 문제를 공개 게이트에 통과시킨다", () => {
    const supplement = getApprovedWeldingProcessContent();

    expect(supplement.lessons.map((lesson) => lesson.title)).toEqual([
      "피복아크용접(SMAW)",
      "TIG용접(GTAW)",
      "MIG·MAG·CO₂용접(GMAW)",
      "플럭스코어드아크용접(FCAW)",
      "서브머지드아크용접(SAW)",
      "아크용접 차폐 조건",
    ]);
    expect(supplement.questions).toHaveLength(6);
    expect(supplement.questions.every(isPublishableQuestion)).toBe(true);
    expect(
      supplement.lessons.every(
        (lesson) =>
          lesson.contentStatus === "published" &&
          lesson.quality.passed &&
          lesson.relatedQuestionIds.length === 1,
      ),
    ).toBe(true);
  });

  it("공정별 레슨을 하나의 비교 가족으로 묶는다", () => {
    const supplement = getApprovedWeldingProcessContent();
    const content = {
      formatVersion: 2,
      subjects: [],
      conceptGroups: [],
      questions: supplement.questions,
      lessons: supplement.lessons,
      variants: [],
      backlog: [],
      report: {} as GeneratedContent["report"],
    } satisfies GeneratedContent;

    const processFamily = getLessonFamilies(content, "s2-g02").find(
      (family) => family.id === "process",
    );

    expect(processFamily?.lessons).toHaveLength(6);
    expect(processFamily?.comparison.map((item) => item.term)).toContain(
      "서브머지드·SAW",
    );
    expect(processFamily?.comparison.map((item) => item.term)).toContain(
      "차폐 조건",
    );
    expect(processFamily?.trapQuestions).toHaveLength(5);
  });

  it("기존 CO₂ 레슨을 사용자 원문 기준의 공정별 본문으로 보강한다", () => {
    const merged = mergeApprovedWeldingProcessContent(
      generatedContent as GeneratedContent,
    );
    const co2Lesson = merged.lessons.find((lesson) => lesson.title === "CO₂ 아크용접");

    expect(co2Lesson?.blocks.find((block) => block.id === "definition")?.body).toContain(
      "연속 송급되는 소모성 솔리드 와이어",
    );
    expect(co2Lesson?.blocks.find((block) => block.id === "exam-point")?.body).toContain(
      "방풍",
    );
  });

  it("답안 제출 전에는 정답·해설·선택지 피드백을 노출하지 않는다", () => {
    const publicQuestion = toPublicQuestion(
      getApprovedWeldingProcessContent().questions[0],
    );

    expect(publicQuestion).not.toHaveProperty("correctChoiceId");
    expect(publicQuestion).not.toHaveProperty("answerText");
    expect(publicQuestion).not.toHaveProperty("explanation");
    expect(publicQuestion.choices[0]).not.toHaveProperty("feedback");
  });

  it("각 오답 보기에 공정별 전극·차폐 차이를 설명하는 고유 근거가 있다", () => {
    const questions = getApprovedWeldingProcessContent().questions;

    for (const question of questions) {
      const wrongFeedback = question.choices
        .filter((choice) => choice.id !== question.correctChoiceId)
        .map((choice) => choice.feedback.incorrectPoint);

      expect(wrongFeedback.every((feedback) => feedback && feedback.length >= 20)).toBe(true);
      expect(new Set(wrongFeedback).size).toBe(wrongFeedback.length);
    }
  });
});
