import { describe, expect, it } from "vitest";
import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";
import {
  canUsePracticalVisualAid,
  learnerVisiblePracticalVisualAid,
} from "@/lib/domain/practical-visual-policy";
import type { PracticalVisualAid } from "@/lib/domain/practical-types";

const aid = (id: string) => {
  const found = PRACTICAL_VISUAL_AIDS.find((item) => item.id === id);
  expect(found, `missing visual aid ${id}`).toBeDefined();
  return found!;
};

describe("practical visual publication policy", () => {
  it("allows only exact NCS-origin assets in reconstructed past prompts", () => {
    expect(
      canUsePracticalVisualAid(
        aid("ncs-bearing-four-types"),
        "past_exam_prompt",
      ),
    ).toBe(true);
    expect(
      canUsePracticalVisualAid(
        aid("diagram-oee-six-losses"),
        "past_exam_prompt",
      ),
    ).toBe(false);
  });

  it("allows verified self-authored assets for variant prompts only when declared", () => {
    const variant = {
      ...aid("diagram-oee-six-losses"),
      usageTypes: ["variant_exam_prompt"],
    } satisfies PracticalVisualAid;

    expect(canUsePracticalVisualAid(variant, "variant_exam_prompt")).toBe(true);
    expect(canUsePracticalVisualAid(variant, "past_exam_prompt")).toBe(false);
  });

  it("never exposes AI-generated assets to learners", () => {
    const generated = {
      ...aid("diagram-oee-six-losses"),
      originType: "ai_generated",
    } satisfies PracticalVisualAid;

    expect(learnerVisiblePracticalVisualAid(generated)).toBe(false);
    expect(
      canUsePracticalVisualAid(generated, "summary_diagram"),
    ).toBe(false);
  });
});
