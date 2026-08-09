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

  it("records a proof-carrying session activity and fails closed on partial storage", () => {
    expect(source).toContain('p_event: "practice_session"');
    expect(source).toContain("p_reference_id: sessionId");
    expect(source).toContain(
      "items.length !== selected.questions.length",
    );
    expect(source).toContain(
      'from("practice_sessions").delete().eq("id", sessionId)',
    );
  });

  it("chunks full-bank question lookup and item persistence without weakening rollback", () => {
    expect(source).toContain("const SUPABASE_BATCH_SIZE = 500");
    expect(source).toContain("for (const externalIds of chunkValues(");
    expect(source).toContain("for (const itemBatch of chunkValues(items))");
    expect(source).toContain("if (storageError || items.length !== selected.questions.length)");
  });

  it("locks a validated past-exam year range into the stored session filter", () => {
    expect(source).toContain("yearFrom:");
    expect(source).toContain("yearTo:");
    expect(source).toContain("filterPracticeContentByYearRange(");
    expect(source).toContain("yearRange:");
  });
});
