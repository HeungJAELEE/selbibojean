import { describe, expect, it } from "vitest";
import content from "@/data/generated/content.json";
import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";
import {
  getWrittenVisualSelection,
  WRITTEN_VISUAL_COVERED_GROUP_IDS,
  WRITTEN_VISUAL_REGISTERED_AID_IDS,
} from "@/data/source/written-visual-coverage";
import type { GeneratedContent, Lesson } from "@/lib/domain/types";

const generated = content as GeneratedContent;
const visualAidById = new Map(
  PRACTICAL_VISUAL_AIDS.map((visualAid) => [visualAid.id, visualAid] as const),
);

describe("written visual coverage", () => {
  it("covers all 44 written concept groups with a verified asset pool", () => {
    const groupIds = new Set(generated.conceptGroups.map((group) => group.id));

    expect(WRITTEN_VISUAL_COVERED_GROUP_IDS).toEqual(groupIds);
    for (const visualAidId of WRITTEN_VISUAL_REGISTERED_AID_IDS) {
      expect(visualAidById.get(visualAidId), visualAidId).toMatchObject({
        publicUseStatus: "public",
        technicalReviewStatus: "verified",
      });
    }
  });

  it("keeps every lesson inside a covered concept group and verifies curated photos", () => {
    for (const lesson of generated.lessons) {
      const selection = getWrittenVisualSelection(lesson);
      expect(
        WRITTEN_VISUAL_COVERED_GROUP_IDS.has(lesson.conceptGroupId),
        lesson.id,
      ).toBe(true);
      for (const visualAid of selection.visualAids) {
        expect(visualAid.publicUseStatus, visualAid.id).toBe("public");
        expect(visualAid.technicalReviewStatus, visualAid.id).toBe("verified");
      }
    }
  });

  it.each([
    ["마그네토 볼베어링", "magneto-bearing-comparison", "ncs-bearing-types"],
    ["핀틀체인", "pintle-chain-construction", null],
    ["나사브레이크", "screw-load-brake", null],
    ["아베 원리", "abbe-principle", null],
  ] as const)(
    "connects %s to its dedicated learning visual",
    (title, diagramId, visualAidId) => {
      const lesson = generated.lessons.find((candidate) => candidate.title === title);
      expect(lesson).toBeDefined();

      const selection = getWrittenVisualSelection(lesson as Lesson);
      expect(selection.diagramIds).toContain(diagramId);
      if (visualAidId) {
        expect(selection.visualAids.map((visualAid) => visualAid.id)).toContain(
          visualAidId,
        );
      }
    },
  );

  it("does not attach an unrelated practical photo as a generic group fallback", () => {
    const screwBrake = generated.lessons.find(
      (candidate) => candidate.title === "나사브레이크",
    );
    expect(screwBrake).toBeDefined();

    const selection = getWrittenVisualSelection(screwBrake as Lesson);
    expect(selection.visualAids).toEqual([]);
    expect(selection.diagramIds).toEqual(["screw-load-brake"]);
  });
});
