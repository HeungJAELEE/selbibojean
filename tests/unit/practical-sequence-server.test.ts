import { describe, expect, it } from "vitest";

import { getPracticalPromptVisualUsage } from "@/lib/practical-sequence-server";

describe("getPracticalPromptVisualUsage", () => {
  it("never routes a reconstructed past question through explanation visuals", () => {
    expect(
      getPracticalPromptVisualUsage({
        kind: "past",
        examEvidenceStatus: "past_reconstructed",
      }),
    ).toBe("past_exam_prompt");
  });

  it("routes authored predictions through the variant prompt policy", () => {
    expect(
      getPracticalPromptVisualUsage({
        kind: "predicted",
        examEvidenceStatus: "predicted_related",
      }),
    ).toBe("variant_exam_prompt");
  });
});
