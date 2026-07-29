import { describe, expect, it } from "vitest";
import rawQbank from "@/data/source/bda-qbank-v04.json";
import {
  bdaGeneratedConceptMockQuestions,
  getBdaConceptMockQuestions,
} from "@/data/source/bda-concept-mock-questions";
import { bdaContent } from "@/data/source/bda-content";
import { bdaIntegratedConceptTheories } from "@/data/source/bda-integrated-concept-theory";
import {
  bdaNotionModules,
  bdaNotionPracticeQuestions,
  bdaNotionSourcePages,
} from "@/data/source/bda-notion-library";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";
import type { BdaQbank } from "@/lib/domain/bda-qbank";

describe("BDA Notion child-page learning map", () => {
  const qbank = rawQbank as BdaQbank;

  it("preserves every direct child page as a traceable source", () => {
    expect(bdaNotionSourcePages).toHaveLength(17);
    expect(new Set(bdaNotionSourcePages.map((page) => page.url)).size).toBe(17);
    expect(bdaNotionSourcePages.filter((page) => page.revision === "final")).toHaveLength(4);
  });

  it("maps every normalized Notion module to sources, concepts, lessons, and practice", () => {
    const sourceIds = new Set(bdaNotionSourcePages.map((page) => page.id));
    const conceptIds = new Set(qbank.concepts.map((concept) => concept.id));
    const lessonIds = new Set(bdaContent.lessons.map((lesson) => lesson.id));
    const questionIds = new Set([
      ...bdaContent.questions.map((question) => question.id),
      ...bdaNotionPracticeQuestions.map((question) => question.id),
    ]);

    expect(bdaNotionModules).toHaveLength(31);
    for (const notionModule of bdaNotionModules) {
      expect(sourceIds.has(notionModule.sourcePageId)).toBe(true);
      expect(notionModule.conceptIds.every((conceptId) => conceptIds.has(conceptId))).toBe(true);
      expect(lessonIds.has(notionModule.lessonId)).toBe(true);
      expect(notionModule.questionIds.every((questionId) => questionIds.has(questionId))).toBe(true);
      expect(notionModule.sourceSections.length).toBeGreaterThan(0);
    }
  });

  it("keeps added practice as self-authored, answer-bearing server content", () => {
    expect(bdaNotionPracticeQuestions).toHaveLength(17);
    for (const question of bdaNotionPracticeQuestions) {
      expect(question.sourceType).toBe("self_authored");
      expect(question.reviewStatus).toBe("verified");
      expect(question.contentStatus).toBe("published");
      expect(question.choices).toHaveLength(4);
      expect(question.choices.some((choice) => choice.id === question.correctChoiceId)).toBe(true);
    }
  });

  it("gives every normalized concept exactly five verified mock questions", () => {
    expect(bdaGeneratedConceptMockQuestions.length).toBeGreaterThan(0);
    expect(
      new Set(bdaGeneratedConceptMockQuestions.map((question) => question.id))
        .size,
    ).toBe(bdaGeneratedConceptMockQuestions.length);
    for (const concept of qbank.concepts) {
      const questions = getBdaConceptMockQuestions(concept.id);
      expect(questions).toHaveLength(5);
      expect(new Set(questions.map((question) => question.id)).size).toBe(5);
      for (const question of questions) {
        expect(question.sourceType).toBe("self_authored");
        expect(question.reviewStatus).toBe("verified");
        expect(question.contentStatus).toBe("published");
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices.map((choice) => choice.text)).size).toBe(
          4,
        );
        expect(
          question.choices.some(
            (choice) => choice.id === question.correctChoiceId,
          ),
        ).toBe(true);
      }
    }
  });

  it("keeps SVM, Bayesian, and practical mock answers inside their normalized scope", () => {
    const expectedTerms: Record<string, RegExp> = {
      C024: /서포트 벡터|커널|마진|gamma|스케일/,
      C028: /베이즈|P\(A\|B\)|P\(B\)|조건부 독립/,
      C037:
        /shape|필터|groupby|반올림|동점|결측 문자열|DataFrame|산출물/,
      C038:
        /train\/test|Pipeline|result\.csv|타깃|index|테스트 데이터|전체 데이터/,
      C039: /검정|가설|통계량|p값|등분산|효과 크기|독립성/,
      C040: /누수|민감정보|재현|개인정보|이름을 지운/,
    };

    for (const [conceptId, expectedTerm] of Object.entries(expectedTerms)) {
      for (const question of getBdaConceptMockQuestions(conceptId)) {
        const correctChoice = question.choices.find(
          (choice) => choice.id === question.correctChoiceId,
        );
        expect(correctChoice?.text).toMatch(expectedTerm);
      }
    }
  });

  it("integrates every C001~C040 detail with actual theory or an explicit practical extension", () => {
    const sourceIds = new Set(bdaNotionSourcePages.map((page) => page.id));
    const conceptIds = new Set(qbank.concepts.map((concept) => concept.id));
    const questionIds = new Set([
      ...bdaContent.questions.map((question) => question.id),
      ...bdaNotionPracticeQuestions.map((question) => question.id),
    ]);
    const codeLabIds = new Set(bdaCodeLabs.map((lab) => lab.id));

    expect(bdaIntegratedConceptTheories).toHaveLength(qbank.concepts.length);
    expect(new Set(bdaIntegratedConceptTheories.map((theory) => theory.conceptId)).size)
      .toBe(qbank.concepts.length);

    for (const theory of bdaIntegratedConceptTheories) {
      expect(conceptIds.has(theory.conceptId)).toBe(true);
      expect(theory.learningSummary.length).toBeGreaterThan(60);
      expect(theory.mustKnow.length).toBeGreaterThanOrEqual(3);
      expect(theory.examTraps.length).toBeGreaterThanOrEqual(2);
      expect(theory.practiceQuestionIds.every((questionId) => questionIds.has(questionId))).toBe(true);
      expect(theory.codeLabIds.every((codeLabId) => codeLabIds.has(codeLabId))).toBe(true);
      if (theory.sourceKind === "notion") {
        expect(sourceIds.has(theory.sourcePageId ?? "")).toBe(true);
      }
    }

    expect(bdaIntegratedConceptTheories.filter((theory) => theory.sourceKind === "practical-extension"))
      .toHaveLength(4);
  });
});
