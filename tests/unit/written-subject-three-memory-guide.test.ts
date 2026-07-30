import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectThreeMemoryGuideLessonTitles,
  WRITTEN_SUBJECT_THREE_MEMORY_GUIDE,
  WRITTEN_SUBJECT_THREE_SOURCE_BOUNDARY,
} from "@/data/source/written-subject-three-memory-guide";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableLesson } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);

describe("written subject three memory guide", () => {
  it("keeps the integrated guide at fourteen distinct bundles", () => {
    expect(WRITTEN_SUBJECT_THREE_MEMORY_GUIDE).toHaveLength(14);
    expect(
      new Set(WRITTEN_SUBJECT_THREE_MEMORY_GUIDE.map((bundle) => bundle.id)).size,
    ).toBe(14);
    expect(
      new Set(WRITTEN_SUBJECT_THREE_MEMORY_GUIDE.map((bundle) => bundle.part)),
    ).toEqual(
      new Set([
        "도면·측정",
        "가공·재료",
        "조립·기계요소",
        "배관·유체기계",
        "구동설비 보전",
      ]),
    );
  });

  it("keeps every bundle useful for memorization and contextualizes trap wording", () => {
    for (const bundle of WRITTEN_SUBJECT_THREE_MEMORY_GUIDE) {
      expect(bundle.facts.length).toBeGreaterThanOrEqual(5);
      expect(bundle.traps.length).toBeGreaterThanOrEqual(3);
      for (const formula of bundle.formulas ?? []) {
        expect(formula.label.trim()).not.toBe("");
        expect(formula.formula.trim()).not.toBe("");
        expect(formula.note.trim()).not.toBe("");
      }
      for (const trap of bundle.traps) {
        expect(trap.statement.trim().length).toBeGreaterThan(10);
        expect(trap.correction.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("links every curated detail title to an existing public subject-three lesson", () => {
    const publicSubjectThreeTitles = new Set(
      content.lessons
        .filter(
          (lesson) =>
            lesson.subjectId === "subject-3" && isPublishableLesson(lesson),
        )
        .map((lesson) => lesson.title),
    );

    const linkedTitles = getSubjectThreeMemoryGuideLessonTitles();
    expect(linkedTitles.length).toBeGreaterThanOrEqual(75);
    expect(new Set(linkedTitles).size).toBe(linkedTitles.length);
    expect(
      linkedTitles.filter((title) => !publicSubjectThreeTitles.has(title)),
    ).toEqual([]);
  });

  it("preserves the learning flow without publishing the private source URL", () => {
    const serializedGuide = JSON.stringify(WRITTEN_SUBJECT_THREE_MEMORY_GUIDE);

    expect(serializedGuide).not.toContain("notion.site");
    expect(WRITTEN_SUBJECT_THREE_SOURCE_BOUNDARY).toContain("공식 규격");
    expect(WRITTEN_SUBJECT_THREE_SOURCE_BOUNDARY).toContain("장비 매뉴얼");
    expect(serializedGuide).toContain("뜨임은 소려 또는 템퍼링");
    expect(serializedGuide).toContain("마찰 전동");
  });

  it("does not republish equipment-dependent values without an official basis", () => {
    const serializedGuide = JSON.stringify(WRITTEN_SUBJECT_THREE_MEMORY_GUIDE);

    for (const unverifiedValue of [
      "관 바깥지름의 4배",
      "0.03mm 이하",
      "120℃",
      "130℃",
      "50kgf",
      "500~700℃",
      "9.5~17.5",
    ]) {
      expect(serializedGuide).not.toContain(unverifiedValue);
    }
  });
});
