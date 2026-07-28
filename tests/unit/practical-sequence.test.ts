import { describe, expect, it } from "vitest";
import {
  isCorrectSequence,
  isValidSequencePermutation,
  moveSequenceItem,
  shuffleSequence,
} from "@/lib/practical-sequence";

describe("practical sequence helpers", () => {
  const canonical = ["step-1", "step-2", "step-3", "step-4"];

  it("accepts only a complete permutation and grades the exact order", () => {
    expect(isValidSequencePermutation(canonical, canonical)).toBe(true);
    expect(
      isValidSequencePermutation(
        ["step-2", "step-1", "step-3", "step-4"],
        canonical,
      ),
    ).toBe(true);
    expect(
      isValidSequencePermutation(
        ["step-1", "step-1", "step-3", "step-4"],
        canonical,
      ),
    ).toBe(false);
    expect(isCorrectSequence(canonical, canonical)).toBe(true);
    expect(
      isCorrectSequence(
        ["step-2", "step-1", "step-3", "step-4"],
        canonical,
      ),
    ).toBe(false);
  });

  it("moves one card without changing the remaining order", () => {
    expect(moveSequenceItem(canonical, 3, 1)).toEqual([
      "step-1",
      "step-4",
      "step-2",
      "step-3",
    ]);
  });

  it("guarantees a shuffled initial order even with an unchanged random draw", () => {
    expect(shuffleSequence(canonical, () => 0.999)).not.toEqual(canonical);
    expect(new Set(shuffleSequence(canonical, () => 0.25))).toEqual(
      new Set(canonical),
    );
  });
});
