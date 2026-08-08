import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PRACTICAL_WRITTEN_EXAM_CARD_SEEDS } from "@/data/source/practical-written-exam-cards";
import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";
import type {
  PracticalContent,
  PracticalQuestion,
} from "@/lib/domain/practical-types";
import type { PracticalWrittenGovernanceManifest } from "@/lib/domain/practical-execution-types";

const [content, governance] = await Promise.all([
  readFile(
    path.join(process.cwd(), "src/data/generated/practical-content.json"),
    "utf8",
  ).then((value) => JSON.parse(value) as PracticalContent),
  readFile(
    path.join(
      process.cwd(),
      "src/data/generated/practical-written-governance.json",
    ),
    "utf8",
  ).then((value) => JSON.parse(value) as PracticalWrittenGovernanceManifest),
]);

const conceptsById = new Map(
  content.concepts.map((concept) => [concept.id, concept]),
);
const questionsById = new Map(
  content.questions.map((question) => [question.id, question]),
);
const evidenceIds = new Set(governance.evidence.map((evidence) => evidence.id));

const questionsFor = (ids: string[]): PracticalQuestion[] =>
  ids.map((id) => {
    const question = questionsById.get(id);
    expect(question, `missing question ${id}`).toBeDefined();
    return question!;
  });

describe("practical written exam-first cards", () => {
  it("defines the forty representative exam cards exactly once", () => {
    expect(PRACTICAL_WRITTEN_EXAM_CARD_SEEDS).toHaveLength(42);
    expect(
      new Set(PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.map((card) => card.id)).size,
    ).toBe(42);
    expect(PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.map((card) => card.id)).toEqual([
      "PWEC-BEARING-IDENTIFICATION",
      "PWEC-BEARING-INDUCTION-HEATING",
      "PWEC-SENSOR-HYSTERESIS",
      "PWEC-WELDING-OVERLAP",
      "PWEC-HYDRAULIC-CYLINDER-FORCE",
      "PWEC-LOTO-SEQUENCE",
      "PWEC-VERNIER-READING",
      "PWEC-GEAR-SURFACE-DAMAGE",
      "PWEC-TPM-AUTONOMOUS-MAINTENANCE",
      "PWEC-OEE-CALCULATION",
      "PWEC-GEAR-COUPLING-SEQUENCE",
      "PWEC-TAPERED-BEARING-ASSEMBLY",
      "PWEC-BEARING-DAMAGE-IDENTIFICATION",
      "PWEC-RT-FILM-DEFECT-IDENTIFICATION",
      "PWEC-BRAKE-PAD-LINING-INSPECTION",
      "PWEC-UNIVERSAL-JOINT-OVERHAUL",
      "PWEC-SHAFT-ALIGNMENT-SEQUENCE",
      "PWEC-GEARBOX-DISASSEMBLY",
      "PWEC-BEARING-PULLER-SEQUENCE",
      "PWEC-BUTT-WELDING-1G",
      "PWEC-BUTT-WELDING-3G",
      "PWEC-BUTT-WELDING-2G",
      "PWEC-BUTT-WELDING-4G",
      "PWEC-CYLINDER-GAUGE-MEASUREMENT",
      "PWEC-SINE-CENTER-TAPER-MEASUREMENT",
      "PWEC-BEARING-PRESS-ASSEMBLY",
      "PWEC-AIR-ARC-GOUGING-SEQUENCE",
      "PWEC-CRACK-REPAIR-SEQUENCE",
      "PWEC-BRAKE-ALIGNMENT-SEQUENCE",
      "PWEC-BRAKE-FIXING-SEQUENCE",
      "PWEC-BRAKE-AIR-GAP-ADJUSTMENT",
      "PWEC-GAUGE-BLOCK-THIN-WRINGING",
      "PWEC-GAUGE-BLOCK-THICK-WRINGING",
      "PWEC-VERNIER-MEASUREMENT-SEQUENCE",
      "PWEC-THREE-WIRE-HOLDER-PREPARATION",
      "PWEC-DOVETAIL-ROLLER-MEASUREMENT",
      "PWEC-INTERNAL-TAPER-BALL-MEASUREMENT",
      "PWEC-TIRE-COUPLING-ASSEMBLY",
      "PWEC-MAGNETIC-COUPLING-ASSEMBLY",
      "PWEC-GRID-COUPLING-ASSEMBLY",
      "PWEC-OUTSIDE-MICROMETER-ZERO-ADJUSTMENT",
      "PWEC-DRIVE-UNIT-ASSEMBLY-PROCESS",
    ]);
  });

  it("links every card to existing concepts, questions, and evidence", () => {
    for (const card of PRACTICAL_WRITTEN_EXAM_CARD_SEEDS) {
      for (const conceptId of [
        ...card.conceptIds,
        ...card.supplementalConceptIds,
      ]) {
        expect(
          conceptsById.has(conceptId),
          `${card.id} missing concept ${conceptId}`,
        ).toBe(true);
      }
      for (const evidenceId of card.evidenceIds) {
        expect(
          evidenceIds.has(evidenceId),
          `${card.id} missing evidence ${evidenceId}`,
        ).toBe(true);
      }

      const pastQuestions = questionsFor(card.pastQuestionIds);
      const predictedQuestions = questionsFor(card.predictedQuestionIds);
      expect(card.slug.length, card.id).toBeGreaterThan(0);
      expect(card.primaryFormat, card.id).toBe(card.format);
      expect(card.contentStatus, card.id).toBe("published");
      expect(
        new Set(card.keywordLinks.map((keyword) => keyword.slug)).size,
        card.id,
      ).toBe(card.keywordLinks.length);
      expect(
        pastQuestions.every((question) => question.kind === "past"),
        `${card.id} has a non-past question in pastQuestionIds`,
      ).toBe(true);
      expect(
        predictedQuestions.every((question) => question.kind === "predicted"),
        `${card.id} has a non-predicted question in predictedQuestionIds`,
      ).toBe(true);
    }
  });

  it("keeps each card within the exam-first reading limits", () => {
    for (const card of PRACTICAL_WRITTEN_EXAM_CARD_SEEDS) {
      expect(card.studyKeywords.length, card.id).toBeLessThanOrEqual(5);
      expect(card.recognitionPoints.length, card.id).toBeLessThanOrEqual(3);
      expect(card.commonWrongAnswers.length, card.id).toBeLessThanOrEqual(3);
      expect(card.variationAxes.length, card.id).toBeLessThanOrEqual(4);

      const publicPredictedCount = questionsFor(
        card.predictedQuestionIds,
      ).filter((question) => question.contentStatus === "published").length;
      const displayedPredictionCount =
        Math.min(publicPredictedCount, 3) +
        Math.min(
          card.predictedExamples.length,
          Math.max(0, 3 - publicPredictedCount),
        );
      expect(displayedPredictionCount, card.id).toBeGreaterThanOrEqual(1);
      expect(displayedPredictionCount, card.id).toBeLessThanOrEqual(3);
    }
  });

  it("does not promote welding overlap to an unverified past occurrence", () => {
    const overlap = PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
      (card) => card.id === "PWEC-WELDING-OVERLAP",
    );
    expect(overlap?.pastQuestionIds).toEqual([]);
    expect(overlap?.evidenceIds).toContain("evidence:EXP-W01");
  });

  it("uses reviewed self-authored frames for induction-heating steps", () => {
    const card = PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
      (item) => item.id === "PWEC-BEARING-INDUCTION-HEATING",
    );

    expect(card?.sequenceSteps).toHaveLength(3);
    expect(card?.visualAidIds).toEqual([
      "diagram-bearing-induction-heating-sequence",
    ]);
    expect(card?.sequenceSteps.map((step) => step.visualFrameIds)).toEqual([
      ["diagram-bearing-induction-heating-sequence--check"],
      ["diagram-bearing-induction-heating-sequence--heat"],
      ["diagram-bearing-induction-heating-sequence--fit"],
    ]);
  });

  it("connects reviewed recognition images to bearing and vernier cards", () => {
    expect(
      PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
        (card) => card.id === "PWEC-BEARING-IDENTIFICATION",
      )?.visualAidIds,
    ).toEqual(["ncs-bearing-four-types", "ncs-spherical-roller-bearing"]);
    expect(
      PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
        (card) => card.id === "PWEC-VERNIER-READING",
      )?.visualAidIds,
    ).toEqual(["ncs-vernier-reading"]);
  });

  it("promotes brake pad and lining visuals as inspection images, not an invented sequence", () => {
    const card = PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
      (item) => item.id === "PWEC-BRAKE-PAD-LINING-INSPECTION",
    );

    expect(card).toMatchObject({
      format: "image",
      visualAidIds: ["ncs-brake-pad-lining-inspection"],
      sequenceSteps: [],
    });
    expect(card?.questionPattern).not.toMatch(/순서로 배열/);
  });

  it("maps every new sequence step to a verified frame and shuffles only the prompt", () => {
    for (const cardId of [
      "PWEC-GEAR-COUPLING-SEQUENCE",
      "PWEC-TAPERED-BEARING-ASSEMBLY",
      "PWEC-UNIVERSAL-JOINT-OVERHAUL",
      "PWEC-SHAFT-ALIGNMENT-SEQUENCE",
      "PWEC-GEARBOX-DISASSEMBLY",
      "PWEC-BEARING-PULLER-SEQUENCE",
      "PWEC-BUTT-WELDING-1G",
      "PWEC-BUTT-WELDING-3G",
      "PWEC-BUTT-WELDING-2G",
      "PWEC-BUTT-WELDING-4G",
      "PWEC-BRAKE-ALIGNMENT-SEQUENCE",
      "PWEC-BRAKE-FIXING-SEQUENCE",
      "PWEC-BRAKE-AIR-GAP-ADJUSTMENT",
      "PWEC-GAUGE-BLOCK-THIN-WRINGING",
      "PWEC-GAUGE-BLOCK-THICK-WRINGING",
      "PWEC-VERNIER-MEASUREMENT-SEQUENCE",
      "PWEC-THREE-WIRE-HOLDER-PREPARATION",
      "PWEC-DOVETAIL-ROLLER-MEASUREMENT",
    ]) {
      const card = PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
        (item) => item.id === cardId,
      );
      const visualAid = PRACTICAL_VISUAL_AIDS.find(
        (item) => item.id === card?.visualAidIds[0],
      );
      const frameIds = visualAid?.frames.map((frame) => frame.id) ?? [];

      expect(visualAid?.technicalReviewStatus).toBe("verified");
      expect(visualAid?.promptFrameIds).toHaveLength(frameIds.length);
      expect(visualAid?.promptFrameIds).not.toEqual(frameIds);
      expect(new Set(visualAid?.promptFrameIds)).toEqual(new Set(frameIds));
      for (const step of card?.sequenceSteps ?? []) {
        expect(step.visualFrameIds).toHaveLength(1);
        expect(frameIds).toContain(step.visualFrameIds[0]);
      }
    }
  });

  it("records the tire-coupling ordering item as 2026 round 2 question 10", () => {
    const card = PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
      (item) => item.id === "PWEC-TIRE-COUPLING-ASSEMBLY",
    );

    expect(card?.pastQuestionIds).toEqual(["P-2026-2-Q10"]);
    expect(card?.predictedQuestionIds).toEqual([]);
    expect(card?.sequenceSteps).toHaveLength(4);
    expect(
      card?.sequenceSteps.every((step) => step.visualFrameIds.length === 1),
    ).toBe(true);
  });

  it("connects the subject 4 overview diagrams to their exam cards", () => {
    expect(
      PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
        (card) => card.id === "PWEC-TPM-AUTONOMOUS-MAINTENANCE",
      )?.visualAidIds,
    ).toContain("diagram-autonomous-maintenance-7-steps");
    expect(
      PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.find(
        (card) => card.id === "PWEC-OEE-CALCULATION",
      )?.visualAidIds,
    ).toContain("diagram-oee-six-losses");
  });
});
