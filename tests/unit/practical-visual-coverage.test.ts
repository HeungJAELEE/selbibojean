import { describe, expect, it } from "vitest";
import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";
import {
  PRACTICAL_VISUAL_COVERAGE,
  visualAidIdsForSubjectSummary,
} from "@/data/source/practical-visual-coverage";
import { PRACTICAL_WRITTEN_EXAM_CARD_SEEDS } from "@/data/source/practical-written-exam-cards";

const aidsById = new Map(PRACTICAL_VISUAL_AIDS.map((aid) => [aid.id, aid]));
const sequenceStepIds = new Set(
  PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.flatMap((card) =>
    card.sequenceSteps.map((step) => step.id),
  ),
);

describe("representative practical visual coverage", () => {
  it("tracks five ready items and the held gear-damage item", () => {
    expect(PRACTICAL_VISUAL_COVERAGE).toHaveLength(6);
    expect(
      PRACTICAL_VISUAL_COVERAGE.filter((item) => item.status === "ready"),
    ).toHaveLength(5);
    expect(
      PRACTICAL_VISUAL_COVERAGE.find(
        (item) => item.id === "visual-coverage-gear-damage",
      ),
    ).toMatchObject({
      status: "held",
      visualAidIds: [],
    });
  });

  it("links every ready item to reviewed public assets and stable sequence IDs", () => {
    for (const item of PRACTICAL_VISUAL_COVERAGE) {
      for (const stepId of item.sequenceStepIds) {
        expect(sequenceStepIds.has(stepId), `${item.id}: ${stepId}`).toBe(true);
      }
      if (item.status !== "ready") continue;

      expect(item.visualAidIds.length, item.id).toBeGreaterThan(0);
      for (const visualAidId of item.visualAidIds) {
        expect(aidsById.get(visualAidId), item.id).toMatchObject({
          publicUseStatus: "public",
          technicalReviewStatus: "verified",
        });
      }
    }
  });

  it("limits subject summary visuals to the curated low-density set", () => {
    expect(visualAidIdsForSubjectSummary("subject-3")).toHaveLength(2);
    expect(visualAidIdsForSubjectSummary("subject-4")).toHaveLength(3);
    expect(visualAidIdsForSubjectSummary("subject-1")).toEqual([]);
  });

  it("contains no learner-public AI-generated asset", () => {
    expect(
      PRACTICAL_VISUAL_AIDS.filter(
        (aid) =>
          aid.publicUseStatus === "public" &&
          aid.originType === "ai_generated",
      ),
    ).toEqual([]);
  });
});
