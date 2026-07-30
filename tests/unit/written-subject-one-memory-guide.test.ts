import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectOneMemoryGuideLessonTitles,
  WRITTEN_SUBJECT_ONE_MEMORY_GUIDE,
} from "@/data/source/written-subject-one-memory-guide";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableLesson } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);

describe("written subject one memory guide", () => {
  it("keeps the integrated guide at twenty-three distinct memory bundles", () => {
    expect(WRITTEN_SUBJECT_ONE_MEMORY_GUIDE).toHaveLength(23);
    expect(new Set(WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.map((bundle) => bundle.id)).size).toBe(23);
    expect(new Set(WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.map((bundle) => bundle.part))).toEqual(
      new Set(["공유압 기초", "공유압 기기·회로", "전기·전자", "PLC·자동제어"]),
    );
  });

  it("preserves rewritten trap statements with a contextual correction", () => {
    for (const bundle of WRITTEN_SUBJECT_ONE_MEMORY_GUIDE) {
      expect(bundle.facts.length).toBeGreaterThanOrEqual(5);
      expect(bundle.traps.length).toBeGreaterThanOrEqual(3);
      for (const trap of bundle.traps) {
        expect(trap.statement.trim().length).toBeGreaterThan(10);
        expect(trap.correction.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("links every curated detail title to an existing public subject-one lesson", () => {
    const publicSubjectOneTitles = new Set(
      content.lessons
        .filter(
          (lesson) =>
            lesson.subjectId === "subject-1" && isPublishableLesson(lesson),
        )
        .map((lesson) => lesson.title),
    );

    const linkedTitles = getSubjectOneMemoryGuideLessonTitles();
    expect(linkedTitles.length).toBeGreaterThanOrEqual(50);
    expect(new Set(linkedTitles).size).toBe(linkedTitles.length);
    expect(
      linkedTitles.filter((title) => !publicSubjectOneTitles.has(title)),
    ).toEqual([]);
  });

  it("does not publish the private editorial source URL", () => {
    expect(JSON.stringify(WRITTEN_SUBJECT_ONE_MEMORY_GUIDE)).not.toContain(
      "notion.site",
    );
  });
});
