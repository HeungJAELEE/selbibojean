import { describe, expect, it } from "vitest";
import rawQbank from "@/data/source/bda-qbank-v04.json";
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
});
