import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectFourMemoryGuideLessonTitles,
  WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE,
  WRITTEN_SUBJECT_FOUR_SOURCE_BOUNDARY,
} from "@/data/source/written-subject-four-memory-guide";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);

describe("written subject four memory guide", () => {
  it("keeps sixteen bundles across the five source flows", () => {
    expect(WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE).toHaveLength(16);
    expect(
      new Set(WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.map((bundle) => bundle.id))
        .size,
    ).toBe(16);
    expect(
      new Set(WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.map((bundle) => bundle.part)),
    ).toEqual(
      new Set([
        "계측·진단",
        "진동·소음",
        "보전·신뢰성",
        "계획·경제성",
        "윤활관리",
      ]),
    );
  });

  it("keeps every short bundle useful without publishing the private source", () => {
    for (const bundle of WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE) {
      expect(bundle.facts.length).toBeGreaterThanOrEqual(5);
      expect(bundle.traps.length).toBeGreaterThanOrEqual(3);
      expect(bundle.detailLessonTitles.length).toBeGreaterThanOrEqual(5);
    }

    expect(JSON.stringify(WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE)).not.toContain(
      "notion.site",
    );
    expect(WRITTEN_SUBJECT_FOUR_SOURCE_BOUNDARY).toContain("Fast·Slow");
    expect(WRITTEN_SUBJECT_FOUR_SOURCE_BOUNDARY).toContain("장비 매뉴얼");
  });

  it("links every curated title to an existing public subject-four lesson", () => {
    const publicTitles = new Set(
      content.lessons
        .filter(
          (lesson) =>
            lesson.subjectId === "subject-4" && isPublishableLesson(lesson),
        )
        .map((lesson) => lesson.title),
    );
    const linkedTitles = getSubjectFourMemoryGuideLessonTitles();

    expect(linkedTitles.length).toBeGreaterThanOrEqual(75);
    expect(new Set(linkedTitles).size).toBe(linkedTitles.length);
    expect(linkedTitles.filter((title) => !publicTitles.has(title))).toEqual([]);
  });

  it("contextualizes the conflicts preserved in the full source", () => {
    const serialized = JSON.stringify(WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE);

    expect(serialized).toContain("오일 와류");
    expect(serialized).toContain("Fast·Slow");
    expect(serialized).toContain("장비 매뉴얼");
    expect(serialized).not.toContain("NAS 12급");
    expect(serialized).not.toContain("최고 유면 90%");
  });

  it("gives every memory bundle an immediate verified CBT route", () => {
    const publicLessons = content.lessons.filter(
      (lesson) =>
        lesson.subjectId === "subject-4" && isPublishableLesson(lesson),
    );
    const publicQuestions = content.questions.filter(
      (question) =>
        question.subjectId === "subject-4" && isPublishableQuestion(question),
    );

    for (const bundle of WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE) {
      const lessonIds = new Set(
        publicLessons
          .filter((lesson) => bundle.detailLessonTitles.includes(lesson.title))
          .map((lesson) => lesson.id),
      );
      const groupIds = new Set(
        publicLessons
          .filter((lesson) => bundle.detailLessonTitles.includes(lesson.title))
          .map((lesson) => lesson.conceptGroupId),
      );
      expect(
        publicQuestions.some(
          (question) =>
            lessonIds.has(question.lessonId) ||
            groupIds.has(question.conceptGroupId),
        ),
        bundle.id,
      ).toBe(true);
    }
  });
});
