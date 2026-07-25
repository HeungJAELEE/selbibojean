import { describe, expect, it } from "vitest";
import rawQbank from "@/data/source/bda-qbank-v04.json";
import { bdaConceptEnrichments } from "@/data/source/bda-concept-enrichment";
import { bdaLessonConceptMap } from "@/data/source/bda-lesson-concept-map";
import { bdaContent } from "@/data/source/bda-content";
import { generateBdaLearningPractice } from "@/lib/content/bda-learning-practice";
import type { BdaQbank } from "@/lib/domain/bda-qbank";

describe("BDA QBank v0.4 import", () => {
  const qbank = rawQbank as BdaQbank;

  it("keeps the workbook summary counts", () => {
    expect(qbank.stats).toMatchObject({
      sourceInventoryCount: 587,
      learningItemCount: 183,
      conceptCount: 40,
      practicalTaskCount: 58,
      reviewPriorityCount: 68,
    });
  });

  it("keeps reconstructed learning items separate from the source inventory", () => {
    expect(qbank.learningItems).toHaveLength(183);
    expect(qbank.inventory).toHaveLength(587);
    expect(qbank.learningItems.every((item) => item.paraphrasedLearningPrompt)).toBe(true);
    expect(qbank.inventory.some((item) => item.topicSummary === undefined)).toBe(true);
  });

  it("does not import raw third-party question text storage", () => {
    const serializedInventory = JSON.stringify(qbank.inventory);
    expect(serializedInventory).not.toContain("rawTextStorage");
    expect(serializedInventory).not.toContain("raw_text_storage");
  });

  it("retains task safety metadata and linked self-authored snippets", () => {
    expect(qbank.practicalTasks.every((task) => task.dataLeakageChecks)).toBe(true);
    expect(qbank.practicalTasks.every((task) => task.privacyChecks)).toBe(true);
    expect(qbank.codeSnippets.length).toBeGreaterThan(0);
  });

  it("expands every normalized concept and keeps every learning item linked", () => {
    expect(bdaConceptEnrichments).toHaveLength(40);
    expect(new Set(bdaConceptEnrichments.map((item) => item.conceptId)).size).toBe(40);
    expect(qbank.learningItems.every((item) => item.conceptIds.length > 0)).toBe(true);

    for (const concept of qbank.concepts) {
      const enrichment = bdaConceptEnrichments.find((item) => item.conceptId === concept.id);
      expect(enrichment).toBeDefined();
      expect(enrichment?.examFocus.length).toBeGreaterThanOrEqual(2);
      expect(enrichment?.decisionSteps.length).toBeGreaterThanOrEqual(3);
      expect(enrichment?.comparisonRows.length).toBeGreaterThanOrEqual(3);
      expect(enrichment?.practicalSteps.length).toBeGreaterThanOrEqual(2);
      expect(enrichment?.finalChecklist.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("connects all 183 reconstructed learning items to at least one theory lesson", () => {
    const linkedItemIds = new Set<string>();
    for (const conceptIds of Object.values(bdaLessonConceptMap)) {
      qbank.learningItems
        .filter((item) =>
          item.conceptIds.some((conceptId) => conceptIds.includes(conceptId)),
        )
        .forEach((item) => linkedItemIds.add(item.id));
    }

    expect(linkedItemIds.size).toBe(qbank.learningItems.length);
  });

  it("gives every written-theory lesson at least one relevant reconstructed item", () => {
    expect(Object.keys(bdaLessonConceptMap)).toHaveLength(
      bdaContent.lessons.length,
    );

    for (const lesson of bdaContent.lessons) {
      const conceptIds = bdaLessonConceptMap[lesson.id];
      expect(conceptIds?.length).toBeGreaterThan(0);
      expect(
        qbank.learningItems.some((item) =>
          item.conceptIds.some((conceptId) => conceptIds.includes(conceptId)),
        ),
      ).toBe(true);
    }
  });

  it("turns all 183 learning items into complete four-choice practice questions", () => {
    for (const item of qbank.learningItems) {
      const practice = generateBdaLearningPractice(item, qbank.learningItems);
      expect(practice.publicItem.questionStem).toBeTruthy();
      expect(practice.publicItem.choices).toHaveLength(4);
      expect(
        new Set(practice.publicItem.choices.map((choice) => choice.text)).size,
      ).toBe(4);
      expect(
        practice.publicItem.choices.some(
          (choice) => choice.id === practice.correctChoiceId,
        ),
      ).toBe(true);
      expect(practice.publicItem).not.toHaveProperty("correctChoiceId");
    }
  });
});
