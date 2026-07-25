import { describe, expect, it } from "vitest";
import rawQbank from "@/data/source/bda-qbank-v04.json";
import { bdaContent } from "@/data/source/bda-content";
import {
  bdaNotionModules,
  bdaNotionPracticeQuestions,
  bdaNotionSourcePages,
} from "@/data/source/bda-notion-library";
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
    expect(bdaNotionPracticeQuestions).toHaveLength(16);
    for (const question of bdaNotionPracticeQuestions) {
      expect(question.sourceType).toBe("self_authored");
      expect(question.reviewStatus).toBe("verified");
      expect(question.contentStatus).toBe("published");
      expect(question.choices).toHaveLength(4);
      expect(question.choices.some((choice) => choice.id === question.correctChoiceId)).toBe(true);
    }
  });
});
