import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = await readFile(
  path.join(
    process.cwd(),
    "src/app/api/practice/session/route.ts",
  ),
  "utf8",
);

describe("practice session persistence contract", () => {
  it("persists the seed, shuffle setting, stable choice IDs, and source variant", () => {
    expect(source).toContain(
      'isReleaseFeatureEnabled("mock_choice_shuffle")',
    );
    expect(source).toContain("shuffle_choices: shuffleChoices");
    expect(source).toContain("session_seed: seed");
    expect(source).toContain("question_variant_id:");
    expect(source).toContain(
      "choice_order: presentation.choices.map((choice) => choice.id)",
    );
  });

  it("records a proof-carrying account session when every question is materialized", () => {
    expect(source).toContain('p_event: "practice_session"');
    expect(source).toContain("p_reference_id: sessionId");
    expect(source).toContain(
      "hasCompletePracticeQuestionMapping(",
    );
    expect(source).toContain(
      'from("practice_sessions").delete().eq("id", sessionId)',
    );
  });

  it("falls back to device storage before creating a partial account session", () => {
    expect(source).toContain('let storage: "account" | "guest" = "guest"');
    expect(source).toContain(
      "일부 신규 문항이 계정 저장소와 동기화되기 전이라 이번 기록은 이 기기에 저장됩니다.",
    );
    expect(source).toContain("storageNotice");
  });

  it("locks a validated past-exam year range into the stored session filter", () => {
    expect(source).toContain("yearFrom:");
    expect(source).toContain("yearTo:");
    expect(source).toContain("filterPracticeContentByYearRange(");
    expect(source).toContain("yearRange:");
  });
});
