import { describe, expect, it } from "vitest";
import { WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_B as entries } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-01-b";

describe("GPT batch 01-B publication candidates", () => {
  it("keeps the requested candidates structurally complete", () => {
    expect(entries).toHaveLength(16);
    for (const entry of entries) {
      expect(entry.authoringDisposition).toBe("publish_candidate");
      expect(entry.reviewStatus).toBe("pending");
      expect(entry.choiceFeedback).toHaveLength(4);
      expect(new Set(entry.choiceFeedback.map((choice) => choice.choiceIndex))).toEqual(new Set([0, 1, 2, 3]));
      expect(entry.conceptBinding.evidenceRefs.some((reference) => reference.kind === "source_question" && reference.ref === entry.canonicalId)).toBe(true);
      expect(entry.conceptBinding.evidenceRefs.some((reference) => reference.kind === "lesson_block" && reference.ref === `${entry.primaryLeafLessonId}#${entry.conceptBinding.lessonBlockId}`)).toBe(true);
      for (const choice of entry.choiceFeedback) expect(choice.rationale.length).toBeGreaterThanOrEqual(6);
    }
  });
});
