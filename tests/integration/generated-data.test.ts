import { readFile } from "node:fs/promises";
import path from "node:path";
import katex from "katex";
import { describe, expect, it } from "vitest";
import type { GeneratedContent } from "@/lib/domain/types";
import { isPublishableLesson, isPublishableQuestion } from "@/lib/domain/practice";
import { getLessonFamilies, getLessonFamily } from "@/lib/content/lesson-families";
import { getLessonSubcategories } from "@/lib/content/lesson-subcategories";
import { getPastExamExamples, getPastExamExamplesForLessons } from "@/lib/content/past-exam-examples";
import { createPracticePresentations, getSafeOriginalsByQuestion } from "@/lib/content/practice-presentations";

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

  it("uses practical inspection cases and verified trap choices instead of mechanical choice lists", () => {
    const generatedLessons = data.lessons.filter((lesson) => lesson.blocks.some((block) => block.id === "field-case"));
    expect(generatedLessons.length).toBeGreaterThan(1200);
    expect(generatedLessons.every((lesson) =>
      lesson.blocks.some((block) =>
        block.id === "field-case" &&
        block.title === "실무 점검 예시" &&
        block.body.includes("**현장 상황**") &&
        block.body.includes("**점검 순서**") &&
        block.body.includes("**판정 예시**"),
      ),
    )).toBe(true);
    expect(generatedLessons.every((lesson) =>
      lesson.blocks.some((block) =>
        block.id === "trap" &&
        block.title === "시험에서 자주 나오는 실제 함정 보기" &&
        block.body.includes("### 함정 보기 1") &&
        block.body.includes("**왜 그럴듯한가:**") &&
        block.body.includes("**틀린 부분:**") &&
        block.body.includes("**판단 기준:**"),
      ),
    )).toBe(true);

    const allLessonText = data.lessons.flatMap((lesson) => lesson.blocks.map((block) => `${block.title}\n${block.body}`)).join("\n");
    expect(allLessonText).not.toContain("보기와 유사 개념 비교");
    expect(allLessonText).not.toContain("대표문제의 오답 보기:");
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

  it("promotes semantic subcategories into complete, collision-free lesson families", () => {
    const allFamilyLessonIds: string[] = [];
    let familyCount = 0;

    for (const group of data.conceptGroups) {
      const families = getLessonFamilies(data, group.id);
      familyCount += families.length;
      allFamilyLessonIds.push(...families.flatMap((family) => family.lessons.map((lesson) => lesson.id)));

      expect(families.every((family) =>
        family.relatedTerms.length > 0
        && family.scope.length > 40
        && family.mechanism.length > 40
        && family.comparison.length > 0
        && family.trapQuestions.length <= 5,
      ), group.title).toBe(true);
    }

    const publicLessonIds = data.lessons
      .filter(isPublishableLesson)
      .map((lesson) => lesson.id);
    expect(new Set(allFamilyLessonIds)).toEqual(new Set(publicLessonIds));
    expect(allFamilyLessonIds).toHaveLength(publicLessonIds.length);
    expect(familyCount).toBe(195);
  });

  it("teaches P, I, and D as one curated comparison family", () => {
    const family = getLessonFamily(data, "s1-g11", "action");
    expect(family).toBeTruthy();
    expect(family?.label).toBe("P·I·D 제어동작");
    expect(family?.relatedTerms).toEqual(expect.arrayContaining([
      "P·비례동작",
      "I·적분동작",
      "D·미분동작",
      "PI·PID 제어",
    ]));
    expect(family?.comparison.map((item) => item.term)).toEqual(["P 제어", "I 제어", "D 제어", "PI·PID"]);
    expect(family?.comparison.every((item) => !/U-\d{3}/.test(item.effect))).toBe(true);
    expect(family?.fieldCases.map((item) => item.focus)).toEqual(["P 제어", "I 제어", "D 제어"]);
    expect(family?.trapQuestions.slice(0, 3).map((question) => question.id)).toEqual(["U-683", "U-556", "U-329"]);
    expect(family?.trapQuestions.every(isPublishableQuestion)).toBe(true);
    expect(family?.trapQuestions.length).toBe(4);
    expect(family?.lessons.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "적분제어",
      "미분제어",
      "제어편차",
      "비례게인·비례대",
    ]));
  });

  it("uses actual exam criteria instead of repeating generic comparison cautions", () => {
    const lubricantFamily = getLessonFamily(data, "s4-g14", "application");
    const adhesiveFamily = getLessonFamily(data, "s3-g08", "surface");
    const accumulatorFamily = getLessonFamily(data, "s1-g02", "accumulator");
    const weldingFamily = getLessonFamily(data, "s2-g01", "classification");

    expect(lubricantFamily).toBeTruthy();
    expect(adhesiveFamily).toBeTruthy();
    expect(new Set(lubricantFamily?.comparison.map((item) => item.effect)).size).toBeGreaterThan(2);
    expect(new Set(lubricantFamily?.comparison.map((item) => item.caution)).size).toBeGreaterThan(2);
    expect(lubricantFamily?.comparison.every((item) => item.effect !== item.role)).toBe(true);
    expect(lubricantFamily?.comparison.every(
      (item) => item.caution !== "명칭만으로 판단하지 말고 대상·조건·기능이 모두 맞는지 확인한다.",
    )).toBe(true);
    expect(adhesiveFamily?.trapQuestions.map((question) => question.id)).toContain("U-727");
    expect(accumulatorFamily?.comparison.every((item) => !/U-\d{3}/.test(item.effect))).toBe(true);
    expect(weldingFamily?.comparison.every((item) => !/U-\d{3}/.test(item.effect))).toBe(true);
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

  it("surfaces answer-safe actual past exam originals for nearly every public lesson", () => {
    const publishedLessons = data.lessons.filter((lesson) => lesson.contentStatus === "published");
    const coveredLessons = publishedLessons.filter((lesson) => getPastExamExamples(data, lesson.id, 3).length > 0);

    expect(publishedLessons).toHaveLength(1190);
    expect(coveredLessons).toHaveLength(1176);

    for (const lesson of coveredLessons) {
      const examples = getPastExamExamples(data, lesson.id, 3);
      expect(examples.length).toBeLessThanOrEqual(3);
      expect(new Set(examples.map((example) => example.stem.normalize("NFKC"))).size).toBe(examples.length);
      expect(examples.every((example) => example.choices.length >= 4)).toBe(true);
      expect(examples.every((example) =>
        example.choiceIds.length === example.choices.length
        && new Set(example.choiceIds).size === example.choiceIds.length,
      )).toBe(true);
      for (const example of examples) {
        const canonical = data.questions.find((question) => question.id === example.canonicalId);
        expect(canonical).toBeTruthy();
        expect(new Set(example.choiceIds)).toEqual(new Set(canonical?.choices.map((choice) => choice.id)));
      }
      expect(JSON.stringify(examples)).not.toContain("correctChoiceId");
      expect(JSON.stringify(examples)).not.toContain("answerText");
      expect(JSON.stringify(examples)).not.toContain("explanation");
      expect(JSON.stringify(examples)).not.toContain("\"answer\":");
    }

    const orificeExamples = getPastExamExamples(data, "lesson-tcxwqa", 3);
    expect(orificeExamples).toHaveLength(1);
    expect(orificeExamples.map((example) => example.year)).toEqual([2018]);
    expect(orificeExamples.map((example) => example.questionNumber)).toEqual([88]);
  });

  it("aggregates answer-safe actual originals across a lesson family", () => {
    const family = getLessonFamily(data, "s1-g11", "action");
    const examples = getPastExamExamplesForLessons(data, family?.lessons.map((lesson) => lesson.id) ?? [], 6);

    expect(examples.length).toBeGreaterThan(0);
    expect(new Set(examples.map((example) => example.externalId)).size).toBe(examples.length);
    expect(examples.every((example) => example.choiceIds.length === example.choices.length)).toBe(true);
    expect(JSON.stringify(examples)).not.toContain("correctChoiceId");
    expect(JSON.stringify(examples)).not.toContain("answerText");
    expect(JSON.stringify(examples)).not.toContain("explanation");
  });

  it("mixes only answer-aligned actual originals into random practice", () => {
    const publishedQuestions = data.questions.filter(isPublishableQuestion);
    const originalsByQuestion = getSafeOriginalsByQuestion(publishedQuestions, data.variants);

    expect(originalsByQuestion.size).toBe(1300);
    expect([...originalsByQuestion.values()].flat()).toHaveLength(1377);

    const sample = publishedQuestions.slice(0, 20);
    const mixed = createPracticePresentations(sample, data.variants, 50, 20260723);
    const originalFocused = createPracticePresentations(sample, data.variants, 100, 20260723);
    const conceptFocused = createPracticePresentations(sample, data.variants, 0, 20260723);

    expect(mixed.filter((question) => question.provenance.original)).toHaveLength(10);
    expect(originalFocused.filter((question) => question.provenance.original).length).toBeGreaterThan(10);
    expect(conceptFocused.every((question) => !question.provenance.original)).toBe(true);

    for (const presented of originalFocused.filter((question) => question.provenance.original)) {
      const canonical = publishedQuestions.find((question) => question.id === presented.id);
      expect(canonical).toBeTruthy();
      expect(new Set(presented.choices.map((choice) => choice.id))).toEqual(new Set(canonical?.choices.map((choice) => choice.id)));
      expect(JSON.stringify(presented)).not.toContain("correctChoiceId");
      expect(JSON.stringify(presented)).not.toContain("answerText");
      expect(JSON.stringify(presented)).not.toContain("explanation");
    }
  });
});
