import { describe, expect, it } from "vitest";
import {
  supplementalWrittenLessonIds,
  supplementalWrittenLessons,
} from "@/lib/content/supplemental-written-lessons";
import {
  supplementalVisualAidRegistry,
  type SupplementalVisualAidId,
} from "@/components/supplemental-visual-aid";

describe("supplemental written lessons", () => {
  it("covers the requested written-exam reinforcement topics without question links", () => {
    expect(supplementalWrittenLessons).toHaveLength(14);
    expect(supplementalWrittenLessonIds.size).toBe(14);
    expect(new Set(supplementalWrittenLessons.map((lesson) => lesson.subjectId))).toEqual(
      new Set(["subject-1", "subject-2", "subject-3", "subject-4"]),
    );

    for (const lesson of supplementalWrittenLessons) {
      expect(lesson.contentRole).toBe("supplemental");
      expect(lesson.relatedQuestionIds).toEqual([]);
      expect(lesson.title).not.toContain("+보강용");
      expect(lesson.contentStatus).toBe("published");
      expect(lesson.sourceNeeded).toBe(false);
      expect(lesson.quality.passed).toBe(true);
    }
  });

  it("uses the required definition-to-source block sequence", () => {
    const expectedKinds = [
      "definition",
      "principle",
      "formula",
      "selection",
      "exam_point",
      "trap",
      "source",
    ];

    for (const lesson of supplementalWrittenLessons) {
      expect(lesson.blocks.map((block) => block.kind)).toEqual(expectedKinds);
      expect(lesson.blocks.map((block) => block.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      const sourceBlock = lesson.blocks.at(-1);
      expect(sourceBlock?.body).toMatch(/https:\/\//);
      expect(sourceBlock?.body).not.toMatch(/example\.com/);
    }
  });

  it("links every declared visual to the self-authored registry", () => {
    const visualIds = supplementalWrittenLessons
      .map((lesson) => lesson.visualAidId)
      .filter((id): id is SupplementalVisualAidId => Boolean(id));

    expect(new Set(visualIds).size).toBe(6);
    for (const visualAidId of visualIds) {
      const metadata = supplementalVisualAidRegistry[visualAidId];
      expect(metadata.source).toBe("자체 제작");
      expect(metadata.license).toBe("프로젝트 자체 제작물");
      expect(metadata.altText.length).toBeGreaterThan(20);
      expect(metadata.description.length).toBeGreaterThan(20);
    }
  });
});
