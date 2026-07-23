import { readFile } from "node:fs/promises";
import path from "node:path";
import katex from "katex";
import { describe, expect, it } from "vitest";
import type { GeneratedContent } from "@/lib/domain/types";
import { isPublishableQuestion } from "@/lib/domain/practice";
import { getLessonSubcategories } from "@/lib/content/lesson-subcategories";

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
    expect(publicQuestions).toHaveLength(1314);
    expect(data.questions.filter((question) => question.publication?.readiness === "blocked")).toHaveLength(82);
    expect(publicQuestions.every(isPublishableQuestion)).toBe(true);
    expect(data.questions.filter((question) => question.contentStatus !== "published").length).toBeGreaterThan(0);
    expect(publicQuestions.every((question) => question.publication?.readiness === "ready")).toBe(true);
    expect(data.report.publication.ready).toBe(publicQuestions.length);
    expect(data.report.publication.ready + data.report.publication.review + data.report.publication.blocked).toBe(data.questions.length);
  });

  it("records a source-backed disposition for every canonical question", () => {
    expect(data.questions.every((question) => Boolean(question.verification))).toBe(true);
    expect(data.report.verification.verified).toBe(1314);
    expect(data.report.verification.blocked).toBe(82);
    expect(data.report.verification.sourceBackedReconstruction).toBe(1015);
    expect(data.report.verification.authoritativeSourceVerified).toBe(4);
    expect(data.report.verification.manualSourceRequired).toBe(82);
    expect(data.questions.every((question) => (question.verification?.sourceUrls.length ?? 0) > 0)).toBe(true);

    const blocked = data.questions.filter((question) => question.publication?.readiness === "blocked");
    expect(blocked.every((question) => question.verification?.riskTags.some((risk) =>
      ["asset_required", "answer_conflict", "authoritative_source_required"].includes(risk),
    ))).toBe(true);
  });

  it("passes lesson and per-choice quality gates in every concept group", () => {
    expect(data.formatVersion).toBe(2);
    const publishedLessons = data.lessons.filter((lesson) => lesson.contentStatus === "published");
    expect(publishedLessons.length).toBeGreaterThan(0);
    expect(publishedLessons.every((lesson) => lesson.quality.passed)).toBe(true);
    expect(data.lessons.every((lesson) => lesson.quality.passed)).toBe(true);
    expect(publishedLessons.every((lesson) => !lesson.sourceNeeded)).toBe(true);
    expect(data.report.quality.choiceFeedbackPassed).toBe(
      data.questions.reduce((total, question) => total + question.choices.length, 0),
    );
    expect(data.report.quality.choiceFeedbackFailed).toBe(0);
    expect(data.report.quality.genericPhraseMatches).toBe(0);
    expect(data.report.quality.languageIssueMatches).toBe(0);
    expect(data.report.groupQuality).toHaveLength(44);
    expect(data.report.groupQuality.every((group) =>
      group.publishedLessonPassed === group.publishedLessonCount && group.choiceFeedbackPassed === group.choiceFeedbackCount,
    )).toBe(true);
    expect(data.report.warnings).toEqual([]);
  });

  it("has no spacing-only duplicate concepts inside the same subject", () => {
    const keys = data.lessons.map((lesson) =>
      `${lesson.subjectId}:${lesson.title.normalize("NFKC").toLocaleLowerCase("ko").replace(/[\s·ㆍ,.()\[\]{}'"/\\_-]+/g, "")}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
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

  it("keeps the reported problem lessons in their correct groups with natural Korean", () => {
    const fluidComparison = data.lessons.find((lesson) => lesson.title === "공압·유압 비교");
    const abbe = data.lessons.find((lesson) => lesson.title === "아베 원리");
    expect(fluidComparison?.conceptGroupId).toBe("s1-g01");
    expect(abbe?.conceptGroupId).toBe("s3-g01");
    expect(fluidComparison?.quality.languageIssueMatches).toEqual([]);
    expect(abbe?.quality.languageIssueMatches).toEqual([]);
    expect(abbe?.blocks.some((block) => block.body.includes("체결·운동전달"))).toBe(false);
    expect(fluidComparison?.blocks.some((block) => block.body.includes("A+, A−"))).toBe(false);
  });

  it("places every public lesson once in a semantic subcategory", () => {
    for (const group of data.conceptGroups) {
      const lessons = data.lessons.filter(
        (lesson) => lesson.contentStatus === "published" && lesson.conceptGroupId === group.id,
      );
      const categories = getLessonSubcategories(group.id, lessons);
      const categorizedIds = categories.flatMap((category) => category.lessons.map((lesson) => lesson.id));

      expect(categorizedIds, group.title).toHaveLength(lessons.length);
      expect(new Set(categorizedIds).size, group.title).toBe(lessons.length);
      expect(categories.every((category) => category.lessons.length > 0), group.title).toBe(true);
    }
  });

  it("uses subject-matter categories for the long lubricant lesson group", () => {
    const lessons = data.lessons.filter(
      (lesson) => lesson.contentStatus === "published" && lesson.conceptGroupId === "s4-g14",
    );
    const categories = getLessonSubcategories("s4-g14", lessons);

    expect(categories.map((category) => category.label)).toEqual(expect.arrayContaining([
      "열화·산화·유화·오염",
      "그리스 종류·특성·급유",
      "윤활유 첨가제",
      "용도별 윤활유",
      "시험·판정·시료채취",
    ]));
    expect(categories.find((category) => category.label === "그리스 종류·특성·급유")?.lessons.length).toBeGreaterThan(20);
  });

  it("keeps every stored inline and display formula valid for KaTeX", () => {
    const bodies = data.lessons.flatMap((lesson) => lesson.blocks.map((block) => block.body));
    let inlineCount = 0;
    let displayCount = 0;

    for (const body of bodies) {
      const displayFormulas = [...body.matchAll(/\$\$([\s\S]*?)\$\$/g)];
      displayCount += displayFormulas.length;
      for (const match of displayFormulas) {
        expect(() => katex.renderToString(match[1].trim(), { displayMode: true, strict: false, throwOnError: true })).not.toThrow();
      }

      const withoutDisplayMath = body.replace(/\$\$[\s\S]*?\$\$/g, "");
      const inlineFormulas = [...withoutDisplayMath.matchAll(/(?<!\$)\$([^\n$]+?)\$(?!\$)/g)];
      inlineCount += inlineFormulas.length;
      for (const match of inlineFormulas) {
        expect(() => katex.renderToString(match[1].trim(), { strict: false, throwOnError: true })).not.toThrow();
      }
    }

    expect(inlineCount).toBe(238);
    expect(displayCount).toBe(16);
  });
});
