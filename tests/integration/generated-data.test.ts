import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { GeneratedContent } from "@/lib/domain/types";
import { isPublishableQuestion } from "@/lib/domain/practice";

const data = JSON.parse(await readFile(path.join(process.cwd(), "src/data/generated/content.json"), "utf8")) as GeneratedContent;

describe("27th workbook reconciliation", () => {
  it("matches every agreed row count", () => {
    expect(data.report.rows).toEqual({ originals: 2384, canonicalQuestions: 1396, mappings: 2384, backlog: 276 });
    expect(data.report.exactMatch).toBe(true);
    expect(data.report.numberOnlyAnswers).toBe(109);
    expect(data.report.reviewStatusCount).toBe(351);
  });
  it("keeps 44 concept groups and every original-to-canonical relation", () => {
    expect(data.conceptGroups).toHaveLength(44);
    expect(data.variants).toHaveLength(2384);
    expect(data.variants.every((variant) => Boolean(variant.canonicalId))).toBe(true);
  });
  it("keeps unverified content out of public practice", () => {
    const publicQuestions = data.questions.filter((question) => question.contentStatus === "published");
    expect(publicQuestions.length).toBeGreaterThan(0);
    expect(publicQuestions.every(isPublishableQuestion)).toBe(true);
    expect(data.questions.filter((question) => question.contentStatus !== "published").length).toBeGreaterThan(0);
  });

  it("passes lesson and per-choice quality gates in every concept group", () => {
    expect(data.formatVersion).toBe(2);
    expect(data.report.quality.lessonPassed).toBe(data.lessons.length);
    expect(data.report.quality.lessonFailed).toBe(0);
    expect(data.report.quality.choiceFeedbackPassed).toBe(
      data.questions.reduce((total, question) => total + question.choices.length, 0),
    );
    expect(data.report.quality.choiceFeedbackFailed).toBe(0);
    expect(data.report.quality.genericPhraseMatches).toBe(0);
    expect(data.report.groupQuality).toHaveLength(44);
    expect(data.report.groupQuality.every((group) =>
      group.lessonPassed === group.lessonCount && group.choiceFeedbackPassed === group.choiceFeedbackCount,
    )).toBe(true);
  });

  it("keeps the three approved golden lessons rich and structured", () => {
    for (const title of ["용접 분류", "디스크브레이크 누유", "오일휩 진단기법"]) {
      const lesson = data.lessons.find((candidate) => candidate.title === title);
      expect(lesson, `${title} 레슨`).toBeTruthy();
      expect(lesson?.quality.passed).toBe(true);
      expect(lesson?.blocks.some((block) => block.body.includes("|---|"))).toBe(true);
      expect(lesson?.blocks.some((block) => block.kind === "trap")).toBe(true);
    }
  });
});
