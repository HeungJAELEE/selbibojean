import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("random practice choice shuffle contract", () => {
  const component = readFileSync(
    "src/components/random-practice.tsx",
    "utf8",
  );
  const page = readFileSync(
    "src/app/written/practice/random/page.tsx",
    "utf8",
  );

  it("shows the control and submits its value", () => {
    expect(component).toContain("보기 순서 섞기");
    expect(component).toContain("originalRatio, shuffleChoices, guestQuestionIds");
  });

  it("uses the written mock release gate", () => {
    expect(page).toContain('isReleaseFeatureEnabled("mock_choice_shuffle")');
    expect(page).toContain("choiceShuffleEnabled={choiceShuffleEnabled}");
  });
});
