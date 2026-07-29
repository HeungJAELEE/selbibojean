import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import content from "@/data/generated/content.json";
import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";
import {
  getWrittenVisualSelection,
  WRITTEN_VISUAL_COVERED_GROUP_IDS,
  WRITTEN_VISUAL_REGISTERED_AID_IDS,
} from "@/data/source/written-visual-coverage";
import { getApprovedWeldingProcessContent } from "@/lib/content/welding-process-approved";
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

  it("keeps only directly matched, reviewed lesson visuals", () => {
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

    const vibrationIsolation = generated.lessons.find(
      (lesson) => lesson.id === "lesson-1qi34a4",
    );
    expect(vibrationIsolation).toBeDefined();
    expect(getWrittenVisualSelection(vibrationIsolation as Lesson)).toEqual({
      visualAids: [],
      diagramIds: [],
      externalVisuals: [],
    });
  });

  it("keeps every selected external asset local and checksum-matched", () => {
    const externalVisuals = new Map(
      generated.lessons.flatMap((lesson) =>
        getWrittenVisualSelection(lesson).externalVisuals.map(
          (visual) => [visual.id, visual] as const,
        ),
      ),
    );

    for (const visual of externalVisuals.values()) {
      const asset = readFileSync(
        join(process.cwd(), "public", visual.imagePath.replace(/^\//, "")),
      );
      expect(
        createHash("sha256").update(asset).digest("hex").toUpperCase(),
        visual.id,
      ).toBe(visual.assetSha256);
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

  it("does not use butt-welding position photos as a fallback for process or shielding lessons", () => {
    const shielding = getApprovedWeldingProcessContent().lessons.find(
      (lesson) => lesson.id === "lesson-welding-process-shielding",
    );
    expect(shielding).toBeDefined();

    const selection = getWrittenVisualSelection(shielding as Lesson);
    expect(selection.visualAids).toEqual([]);
    expect(selection.diagramIds).toEqual([]);
    expect(selection.externalVisuals).toEqual([]);
  });

  it("connects compressor definitions to the classification diagram without leaking it to neighboring lessons", () => {
    const compressor = generated.lessons.find(
      (lesson) => lesson.id === "lesson-1jbssv6",
    );
    const capacityControl = generated.lessons.find(
      (lesson) => lesson.id === "lesson-8gxwir",
    );
    const aftercooler = generated.lessons.find(
      (lesson) => lesson.id === "lesson-y0oy73",
    );

    expect(compressor).toBeDefined();
    expect(capacityControl).toBeDefined();
    expect(aftercooler).toBeDefined();
    expect(
      getWrittenVisualSelection(compressor as Lesson).diagramIds,
    ).toContain("compressor-classification");
    expect(
      getWrittenVisualSelection(capacityControl as Lesson).diagramIds,
    ).not.toContain("compressor-classification");
    expect(
      getWrittenVisualSelection(aftercooler as Lesson).diagramIds,
    ).not.toContain("compressor-classification");
  });

  it("uses reviewed Wikimedia visuals instead of a generic fallback for water hammer", () => {
    const waterHammer = generated.lessons.find(
      (candidate) => candidate.id === "lesson-10oupjp",
    );
    expect(waterHammer).toBeDefined();

    const selection = getWrittenVisualSelection(waterHammer as Lesson);
    expect(selection.visualAids).toEqual([]);
    expect(selection.diagramIds).toEqual([]);
    expect(selection.externalVisuals).toHaveLength(2);
    expect(selection.externalVisuals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "wikimedia-water-hammer-pressure",
          anchorId: "diagnosis",
          licenseLabel: "Public domain",
        }),
        expect.objectContaining({
          id: "wikimedia-water-hammer-damage",
          licenseLabel: "CC BY-SA 3.0",
          author: "CEphoto, Uwe Aranas",
        }),
      ]),
    );
  });

  it.each([
    [
      "lesson-sttpqh",
      "wikimedia-hydraulic-gas-accumulator",
      "Ingvald Straume",
      "CC0 1.0",
    ],
    [
      "lesson-1y9qr6c",
      "wikimedia-inductive-proximity-sensor",
      "Ekbsensor",
      "CC BY-SA 4.0",
    ],
  ] as const)(
    "adds a source-governed real photo to %s",
    (lessonId, externalVisualId, author, licenseLabel) => {
      const lesson = generated.lessons.find((candidate) => candidate.id === lessonId);
      expect(lesson).toBeDefined();

      const selection = getWrittenVisualSelection(lesson as Lesson);
      expect(selection.externalVisuals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: externalVisualId,
            author,
            licenseLabel,
            assetDownloadUrl: expect.stringContaining("upload.wikimedia.org"),
            assetSha256: expect.stringMatching(/^[A-F0-9]{64}$/),
          }),
        ]),
      );
    },
  );
});
