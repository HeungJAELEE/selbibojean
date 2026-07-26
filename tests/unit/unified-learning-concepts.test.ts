import { describe, expect, it } from "vitest";
import writtenContent from "@/data/generated/content.json";
import practicalContent from "@/data/generated/practical-content.json";
import practicalGovernance from "@/data/generated/practical-written-governance.json";
import {
  getUnifiedConceptForPracticalConcept,
  getUnifiedConceptForWrittenLesson,
  getUnifiedLearningConcept,
  UNIFIED_LEARNING_CONCEPTS,
} from "@/data/source/unified-learning-concepts";
import { PRACTICAL_WORK_TASKS } from "@/data/source/practical-work-tasks";

describe("unified learning concept bridge", () => {
  it("publishes exactly the five non-destructive pilot concepts", () => {
    expect(UNIFIED_LEARNING_CONCEPTS.map((concept) => concept.id)).toEqual([
      "bearing",
      "loto",
      "hydraulic-pressure-control-valves",
      "vernier-caliper",
      "welding-overlap",
    ]);
  });

  it("links only existing written, practical, task, question, and evidence IDs", () => {
    const writtenLessonIds = new Set(
      writtenContent.lessons.map((lesson) => lesson.id),
    );
    const writtenQuestionIds = new Set(
      writtenContent.questions.map((question) => question.id),
    );
    const practicalConceptIds = new Set(
      practicalContent.concepts.map((concept) => concept.id),
    );
    const practicalQuestionIds = new Set(
      practicalContent.questions.map((question) => question.id),
    );
    const practicalTaskIds = new Set(PRACTICAL_WORK_TASKS.map((task) => task.id));
    const evidenceIds = new Set(
      practicalGovernance.evidence.map((evidence) => evidence.id),
    );

    for (const bridge of UNIFIED_LEARNING_CONCEPTS) {
      expect(bridge.memoryPoints.length).toBeGreaterThanOrEqual(3);
      expect(bridge.memoryPoints.length).toBeLessThanOrEqual(5);
      expect(bridge.writtenLessonIds.every((id) => writtenLessonIds.has(id))).toBe(
        true,
      );
      expect(
        bridge.writtenQuestionIds.every((id) => writtenQuestionIds.has(id)),
      ).toBe(true);
      expect(
        bridge.practicalConceptIds.every((id) => practicalConceptIds.has(id)),
      ).toBe(true);
      expect(
        bridge.practicalQuestionIds.every((id) => practicalQuestionIds.has(id)),
      ).toBe(true);
      expect(bridge.practicalTaskIds.every((id) => practicalTaskIds.has(id))).toBe(
        true,
      );
      expect(
        bridge.practicalEvidenceIds.every((id) => evidenceIds.has(id)),
      ).toBe(true);
      expect(
        bridge.relatedConceptIds.every((id) =>
          UNIFIED_LEARNING_CONCEPTS.some((candidate) => candidate.id === id),
        ),
      ).toBe(true);
    }
  });

  it("keeps single-domain concepts single-domain instead of inventing a duplicate", () => {
    const loto = getUnifiedLearningConcept("loto");
    expect(loto?.writtenLessonIds).toEqual([]);
    expect(loto?.writtenQuestionIds).toEqual([]);
    expect(loto?.defaultMode).toBe("practical");
  });

  it("resolves the existing lesson and practical concept URLs back to one bridge", () => {
    expect(getUnifiedConceptForWrittenLesson("lesson-11c19ti")?.id).toBe(
      "bearing",
    );
    expect(getUnifiedConceptForPracticalConcept("PCON-004")?.id).toBe(
      "bearing",
    );
    expect(getUnifiedConceptForWrittenLesson("lesson-1nygfrv")?.id).toBe(
      "vernier-caliper",
    );
    expect(getUnifiedConceptForPracticalConcept("PCON-014")?.id).toBe(
      "vernier-caliper",
    );
  });

  it("contains no grading answer or rubric payload", () => {
    const payload = JSON.stringify(UNIFIED_LEARNING_CONCEPTS);
    for (const forbiddenField of [
      "modelAnswer",
      "correctAnswer",
      "gradingRequiredKeywords",
      "acceptedAnswers",
      "rubric",
      "calculationSteps",
      "choiceFeedback",
    ]) {
      expect(payload).not.toContain(forbiddenField);
    }
  });
});
