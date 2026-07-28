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
  it("tracks every curated visual coverage item as ready", () => {
    expect(PRACTICAL_VISUAL_COVERAGE).toHaveLength(49);
    expect(
      PRACTICAL_VISUAL_COVERAGE.filter((item) => item.status === "ready"),
    ).toHaveLength(49);
    expect(
      PRACTICAL_VISUAL_COVERAGE.filter((item) => item.status === "held"),
    ).toEqual([]);
    expect(
      PRACTICAL_VISUAL_COVERAGE.find(
        (item) => item.id === "visual-coverage-gear-damage",
      ),
    ).toMatchObject({
      status: "ready",
      visualAidIds: ["diagram-gear-damage"],
    });
    expect(
      PRACTICAL_VISUAL_COVERAGE.find(
        (item) => item.id === "visual-coverage-bearing-heating",
      ),
    ).toMatchObject({
      status: "ready",
      visualAidIds: ["diagram-bearing-induction-heating-sequence"],
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
    expect(visualAidIdsForSubjectSummary("subject-2")).toHaveLength(1);
    expect(visualAidIdsForSubjectSummary("subject-3")).toHaveLength(3);
    expect(visualAidIdsForSubjectSummary("subject-4")).toHaveLength(3);
    expect(visualAidIdsForSubjectSummary("subject-1")).toEqual([]);
  });

  it("places reviewed NCS reference images on their learner concepts and cards", () => {
    expect(
      PRACTICAL_VISUAL_COVERAGE.find(
        (item) => item.id === "visual-coverage-spherical-roller-bearing",
      ),
    ).toMatchObject({
      conceptIds: ["PCON-004"],
      examCardIds: ["PWEC-BEARING-IDENTIFICATION"],
      visualAidIds: ["ncs-spherical-roller-bearing"],
      status: "ready",
    });
    expect(
      PRACTICAL_VISUAL_COVERAGE.find(
        (item) => item.id === "visual-coverage-accumulator-safety-circuit",
      ),
    ).toMatchObject({
      conceptIds: ["PCON-040"],
      visualAidIds: ["ncs-accumulator-safety-circuit"],
      status: "ready",
    });
    expect(
      PRACTICAL_VISUAL_COVERAGE.find(
        (item) => item.id === "visual-coverage-brake-condition-examples",
      ),
    ).toMatchObject({
      conceptIds: ["PCON-SUP-030"],
      examCardIds: [],
      questionIds: [],
      sequenceStepIds: [],
      visualAidIds: ["ncs-brake-condition-examples"],
      status: "ready",
    });
    expect(
      PRACTICAL_VISUAL_COVERAGE.find(
        (item) =>
          item.id === "visual-coverage-brake-pad-lining-inspection",
      ),
    ).toMatchObject({
      examCardIds: ["PWEC-BRAKE-PAD-LINING-INSPECTION"],
      questionIds: ["EXP-VIS-BRAKE-PAD-LINING-01"],
      sequenceStepIds: [],
      visualAidIds: ["ncs-brake-pad-lining-inspection"],
      status: "ready",
    });
  });

  it("keeps brake condition examples out of exam prompts and sequences", () => {
    const visualAid = aidsById.get("ncs-brake-condition-examples");
    const publicIdentifiers = [
      ...(visualAid?.imagePaths ?? []),
      ...(visualAid?.frames.map((frame) => frame.id) ?? []),
    ].join(" ");

    expect(visualAid).toMatchObject({
      technicalReviewStatus: "verified",
      usageTypes: ["concept_explanation"],
      answerCritical: false,
    });
    expect(visualAid?.usageTypes).not.toContain("past_exam_prompt");
    expect(visualAid?.usageTypes).not.toContain("variant_exam_prompt");
    expect(visualAid?.usageTypes).not.toContain("sequence_step");
    expect(publicIdentifiers).not.toMatch(
      /crack|wear|fluid|contaminated|overheat/,
    );
  });

  it("uses neutral public frame identifiers for the brake inspection prompt", () => {
    const visualAid = aidsById.get("ncs-brake-pad-lining-inspection");
    const publicIdentifiers = [
      ...(visualAid?.imagePaths ?? []),
      ...(visualAid?.frames.map((frame) => frame.id) ?? []),
    ].join(" ");

    expect(visualAid).toMatchObject({
      technicalReviewStatus: "verified",
      usageTypes: [
        "recognition",
        "concept_explanation",
        "variant_exam_prompt",
      ],
    });
    expect(visualAid?.usageTypes).not.toContain("sequence_step");
    expect(publicIdentifiers).not.toMatch(
      /fluid|surface|thickness|lining-dimension/,
    );
  });

  it("contains no learner-public AI-generated asset", () => {
    expect(
      PRACTICAL_VISUAL_AIDS.filter(
        (aid) => aid.publicUseStatus !== "public",
      ),
    ).toEqual([]);
    expect(
      PRACTICAL_VISUAL_AIDS.filter(
        (aid) =>
          aid.publicUseStatus === "public" &&
          aid.originType === "ai_generated",
      ),
    ).toEqual([]);
  });
});
