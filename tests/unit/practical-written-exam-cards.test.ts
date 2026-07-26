import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PRACTICAL_WRITTEN_EXAM_CARD_SEEDS } from "@/data/source/practical-written-exam-cards";
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
  ).then(
    (value) => JSON.parse(value) as PracticalWrittenGovernanceManifest,
  ),
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
  it("defines the ten representative exam cards exactly once", () => {
    expect(PRACTICAL_WRITTEN_EXAM_CARD_SEEDS).toHaveLength(10);
    expect(
      new Set(PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.map((card) => card.id)).size,
    ).toBe(10);
    expect(
      PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.map((card) => card.id),
    ).toEqual([
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
      expect(
        pastQuestions.every((question) => question.kind === "past"),
        `${card.id} has a non-past question in pastQuestionIds`,
      ).toBe(true);
      expect(
        predictedQuestions.every(
          (question) => question.kind === "predicted",
        ),
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
});
