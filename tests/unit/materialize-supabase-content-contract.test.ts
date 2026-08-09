import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Supabase content materialization contract", () => {
  it("reconciles renamed concepts by their stable primary key", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts/materialize-supabase-content.ts"),
      "utf8",
    );

    expect(source).toMatch(
      /"concepts",\s*plan\.concepts,\s*[\s\S]*?"id",/,
    );
    expect(source).not.toContain(
      '"concept_group_id,canonical_name",\n  );',
    );
  });

  it("replaces only the primary concept edge when taxonomy changes", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts/materialize-supabase-content.ts"),
      "utf8",
    );

    expect(source).toContain("replacePrimaryQuestionConcepts");
    expect(source).toContain('.eq("role", "primary")');
    expect(source).toContain(
      "await replacePrimaryQuestionConcepts(client, plan.questionConcepts)",
    );
  });

  it("removes only unreferenced stale concepts owned by the current plan", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts/materialize-supabase-content.ts"),
      "utf8",
    );

    expect(source).toContain("pruneOrphanedConcepts");
    expect(source).toContain("relationCount > 0");
    expect(source).toContain(
      "await pruneOrphanedConcepts(client, plan.concepts)",
    );
  });

  it("archives stale questions without deleting learning history", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts/materialize-supabase-content.ts"),
      "utf8",
    );

    expect(source).toContain("archiveStaleQuestions");
    expect(source).toContain('.update({ status: "draft" })');
    expect(source).not.toMatch(/from\("questions"\)\s*\.delete\(\)/);
    expect(source).toContain("countRowsByIds");
  });
});
