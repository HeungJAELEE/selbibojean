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
    expect(component).toContain("originalRatio, shuffleChoices, yearFrom, yearTo, guestQuestionIds");
  });

  it("uses the written mock release gate", () => {
    expect(page).toContain("isReleaseFeatureEnabled(");
    expect(page).toContain('"mock_choice_shuffle"');
    expect(page).toContain("choiceShuffleEnabled={choiceShuffleEnabled}");
  });

  it("offers and persists an exact past-exam year range", () => {
    expect(page).toContain("getWrittenMockSetupMetadata()");
    expect(page).toContain("availableYears={setup.availableYears}");
    expect(component).toContain("기출 연도 범위");
    expect(component).toContain("yearFrom, yearTo, guestQuestionIds");
    expect(component).toContain("범위 밖 연도로 보충하지 않습니다");
  });
});
