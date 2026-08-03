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
    expect(supplementalWrittenLessons).toHaveLength(17);
    expect(supplementalWrittenLessonIds.size).toBe(17);
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

  it("fills the subject-1 electrical and PLC theory-gap clusters with independent references", () => {
    const electrical = supplementalWrittenLessons.find(
      (item) => item.id === "supplemental-written-electrical-core-reference",
    );
    const plc = supplementalWrittenLessons.find(
      (item) =>
        item.id === "supplemental-written-automatic-control-plc-reference",
    );

    expect(electrical?.blocks.find((block) => block.kind === "formula")?.body)
      .toContain("P=√3·V_L·I_L·cosφ");
    expect(electrical?.blocks.find((block) => block.kind === "source")?.body)
      .toContain("se.com");
    expect(plc?.blocks.find((block) => block.kind === "principle")?.body)
      .toContain("입력 판독·프로그램 실행·출력 갱신");
    expect(plc?.blocks.find((block) => block.kind === "source")?.body)
      .toContain("sitrain-learning.siemens.com");
  });

  it("adds the source-backed fluid-power foundation needed by held past questions", () => {
    const lesson = supplementalWrittenLessons.find(
      (item) =>
        item.id === "supplemental-written-fluid-power-core-reference",
    );

    expect(lesson).toMatchObject({
      subjectId: "subject-1",
      conceptGroupId: "s1-g01",
      reviewedAt: "2026-08-03T00:00:00.000+09:00",
      contentRole: "supplemental",
    });
    expect(lesson?.aliases).toEqual(
      expect.arrayContaining([
        "절대압력",
        "파스칼의 원리",
        "베르누이",
        "작동유",
      ]),
    );
    expect(lesson?.blocks.find((block) => block.kind === "formula")?.body)
      .toContain("p_abs=p_gauge+p_atm");
    expect(lesson?.blocks.find((block) => block.kind === "source")?.body)
      .toContain("nist.gov");
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
