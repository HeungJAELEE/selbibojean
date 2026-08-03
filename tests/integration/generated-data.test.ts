import { readFile } from "node:fs/promises";
import path from "node:path";
import katex from "katex";
import { describe, expect, it } from "vitest";
import type { GeneratedContent } from "@/lib/domain/types";
import {
  isPublishableLesson,
  isPublishableQuestion,
  toPublicQuestion,
} from "@/lib/domain/practice";
import { getLessonFamilies, getLessonFamily } from "@/lib/content/lesson-families";
import { getLessonSubcategories } from "@/lib/content/lesson-subcategories";
import { getPastExamExamples, getPastExamExamplesForLessons } from "@/lib/content/past-exam-examples";
import {
  createPracticePresentations,
  filterPracticeContentByYearRange,
  getSafeOriginalsByQuestion,
} from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";

const data = JSON.parse(await readFile(path.join(process.cwd(), "src/data/generated/content.json"), "utf8")) as GeneratedContent;
const runtimeData = buildRuntimeContent(data);
const runtimePublicQuestions = runtimeData.questions.filter(isPublishableQuestion);

describe("27th workbook reconciliation", () => {
  it("matches every agreed row count", () => {
    expect(data.report.rows).toEqual({ originals: 2384, canonicalQuestions: 1396, mappings: 2384, backlog: 276 });
    expect(data.questions).toHaveLength(1396);
    expect(new Set(data.questions.map((question) => question.id)).size).toBe(1396);
    expect(data.report.exactMatch).toBe(true);
    expect(data.report.numberOnlyAnswers).toBe(109);
    expect(data.report.reviewStatusCount).toBe(351);
  });
  it("keeps 44 concept groups and every original-to-canonical relation", () => {
    expect(data.conceptGroups).toHaveLength(44);
    expect(data.variants).toHaveLength(2384);
    expect(data.variants.every((variant) => Boolean(variant.canonicalId))).toBe(true);
  });
  it("keeps the workbook ledger intact while exposing only independently reviewed runtime questions", () => {
    const workbookPublishedQuestions = data.questions.filter((question) => question.contentStatus === "published");
    const publishedBySubject = Object.fromEntries(
      runtimeData.subjects.map((subject) => [
        subject.id,
        runtimePublicQuestions.filter((question) => question.subjectId === subject.id).length,
      ]),
    );

    expect(workbookPublishedQuestions).toHaveLength(1314);
    expect(data.questions.filter((question) => question.publication?.readiness === "blocked")).toHaveLength(82);
    expect(workbookPublishedQuestions.some((question) => !isPublishableQuestion(question))).toBe(true);
    expect(runtimePublicQuestions).toHaveLength(2062);
    expect(publishedBySubject).toEqual({
      "subject-1": 314,
      "subject-2": 714,
      "subject-3": 255,
      "subject-4": 779,
    });
    expect(runtimePublicQuestions.every(isPublishableQuestion)).toBe(true);
    expect(runtimePublicQuestions.every((question) => Boolean(question.approvedReview))).toBe(true);
    expect(data.questions.filter((question) => question.contentStatus !== "published").length).toBeGreaterThan(0);
    expect(runtimePublicQuestions.every((question) => question.publication?.readiness === "ready")).toBe(true);
    expect(data.report.publication.ready).toBe(workbookPublishedQuestions.length);
    expect(data.report.publication.ready + data.report.publication.review + data.report.publication.blocked).toBe(data.questions.length);

    const publicProjection = JSON.stringify(
      runtimePublicQuestions.map(toPublicQuestion),
    );
    expect(publicProjection).not.toContain("correctChoiceId");
    expect(publicProjection).not.toContain("answerText");
    expect(publicProjection).not.toContain("\"explanation\":");
    expect(publicProjection).not.toContain("approvedReview");
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
    const family = getLessonFamily(runtimeData, "s1-g11", "action");
    const previouslyPublishedTrapIds = ["U-683", "U-556", "U-329"];
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
    expect(
      data.questions.filter((question) => previouslyPublishedTrapIds.includes(question.id)),
    ).toHaveLength(previouslyPublishedTrapIds.length);
    expect(
      runtimeData.questions
        .filter((question) => previouslyPublishedTrapIds.includes(question.id))
        .filter(isPublishableQuestion),
    ).toHaveLength(previouslyPublishedTrapIds.length);
    expect(family?.trapQuestions.every(isPublishableQuestion)).toBe(true);
    expect(family?.trapQuestions.map((question) => question.id)).toEqual([
      "U-030",
      "U-683",
      "U-556",
      "U-329",
      "U-817",
    ]);
    expect(family?.lessons.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "적분제어",
      "미분제어",
      "제어편차",
      "비례게인·비례대",
    ]));
  });

  it("uses actual exam criteria instead of repeating generic comparison cautions", () => {
    const lubricantFamily = getLessonFamily(runtimeData, "s4-g14", "application");
    const adhesiveFamily = getLessonFamily(runtimeData, "s3-g08", "surface");
    const accumulatorFamily = getLessonFamily(runtimeData, "s1-g02", "accumulator");
    const weldingFamily = getLessonFamily(runtimeData, "s2-g01", "classification");
    const reviewedAdhesiveQuestion = runtimeData.questions.find(
      (question) => question.id === "U-727",
    );

    expect(lubricantFamily).toBeTruthy();
    expect(adhesiveFamily).toBeTruthy();
    expect(new Set(lubricantFamily?.comparison.map((item) => item.caution)).size).toBeGreaterThan(2);
    expect(lubricantFamily?.comparison.every((item) => item.effect !== item.role)).toBe(true);
    expect(lubricantFamily?.comparison.every(
      (item) => item.caution !== "명칭만으로 판단하지 말고 대상·조건·기능이 모두 맞는지 확인한다.",
    )).toBe(true);
    expect(reviewedAdhesiveQuestion).toBeTruthy();
    expect(isPublishableQuestion(reviewedAdhesiveQuestion!)).toBe(true);
    expect(adhesiveFamily?.trapQuestions.map((question) => question.id)).toEqual([
      "U-833",
      "U-727",
      "U-241",
    ]);
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

  it("surfaces answer-safe actual past exam originals only from the runtime-public pool", () => {
    const publishedLessons = runtimeData.lessons.filter(isPublishableLesson);
    const publicQuestionIds = new Set(runtimePublicQuestions.map((question) => question.id));
    const coveredLessons = publishedLessons.filter((lesson) => getPastExamExamples(runtimeData, lesson.id, 3).length > 0);

    expect(publishedLessons).toHaveLength(1362);
    expect(coveredLessons).toHaveLength(1202);

    for (const lesson of coveredLessons) {
      const examples = getPastExamExamples(runtimeData, lesson.id, 3);
      expect(examples.length).toBeLessThanOrEqual(3);
      expect(new Set(examples.map((example) => example.stem.normalize("NFKC"))).size).toBe(examples.length);
      expect(examples.every((example) => example.choices.length >= 4)).toBe(true);
      expect(examples.every((example) => publicQuestionIds.has(example.canonicalId))).toBe(true);
      expect(examples.every((example) =>
        example.choiceIds.length === example.choices.length
        && new Set(example.choiceIds).size === example.choiceIds.length,
      )).toBe(true);
      for (const example of examples) {
        const canonical = runtimeData.questions.find((question) => question.id === example.canonicalId);
        expect(canonical).toBeTruthy();
        expect(new Set(example.choiceIds)).toEqual(new Set(canonical?.choices.map((choice) => choice.id)));
      }
      expect(JSON.stringify(examples)).not.toContain("correctChoiceId");
      expect(JSON.stringify(examples)).not.toContain("answerText");
      expect(JSON.stringify(examples)).not.toContain("explanation");
      expect(JSON.stringify(examples)).not.toContain("\"answer\":");
    }

    const displacementExamples = getPastExamExamples(runtimeData, "lesson-5yr4el", 3);
    expect(displacementExamples.map((example) => example.canonicalId)).toEqual([
      "U-027",
      "U-348",
      "U-008",
    ]);
    expect(displacementExamples.map((example) => example.year)).toEqual([2021, 2020, 2016]);
    expect(displacementExamples.map((example) => example.questionNumber)).toEqual([11, 18, 10]);
  });

  it("aggregates answer-safe actual originals across a lesson family", () => {
    const family = getLessonFamily(runtimeData, "s1-g01", "gas");
    const examples = getPastExamExamplesForLessons(runtimeData, family?.lessons.map((lesson) => lesson.id) ?? [], 6);

    expect(examples.map((example) => example.canonicalId)).toEqual([
      "U-133",
      "U-117",
      "U-747",
      "U-402",
      "U-806",
    ]);
    expect(new Set(examples.map((example) => example.externalId)).size).toBe(examples.length);
    expect(examples.every((example) => example.choiceIds.length === example.choices.length)).toBe(true);
    expect(JSON.stringify(examples)).not.toContain("correctChoiceId");
    expect(JSON.stringify(examples)).not.toContain("answerText");
    expect(JSON.stringify(examples)).not.toContain("explanation");
  });

  it("mixes only answer-aligned actual originals into random practice", () => {
    const publishedQuestions = runtimePublicQuestions;
    const originalsByQuestion = getSafeOriginalsByQuestion(publishedQuestions, runtimeData.variants);

    expect(originalsByQuestion.size).toBe(1845);
    expect([...originalsByQuestion.values()].flat()).toHaveLength(1923);

    const sample = publishedQuestions.slice(0, 20);
    const mixed = createPracticePresentations(sample, runtimeData.variants, 50, 20260723);
    const originalFocused = createPracticePresentations(sample, runtimeData.variants, 100, 20260723);
    const conceptFocused = createPracticePresentations(sample, runtimeData.variants, 0, 20260723);

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

  it("limits the mock pool to answer-safe originals inside the chosen years", () => {
    const result = filterPracticeContentByYearRange(
      runtimePublicQuestions,
      runtimeData.variants,
      2020,
      2021,
    );
    const safe = getSafeOriginalsByQuestion(result.questions, result.variants);

    expect(result.questions.length).toBeGreaterThan(0);
    expect(
      result.variants.every(
        (variant) =>
          variant.year !== null &&
          variant.year >= 2020 &&
          variant.year <= 2021,
      ),
    ).toBe(true);
    expect(
      result.questions.every((question) => safe.has(question.id)),
    ).toBe(true);
  });
});
