import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase",
  "migrations",
  "0005_variant_attempt_persistence.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8");

describe("variant attempt persistence migration", () => {
  it("stores exactly one canonical or source-variant answer representation", () => {
    expect(sql).toContain("alter column selected_choice_id drop not null");
    expect(sql).toContain(
      "add column if not exists selected_variant_choice_index smallint",
    );
    expect(sql).toContain("attempts_selected_answer_shape_check");
    expect(sql).toMatch(
      /selected_choice_id is not null\s+and selected_variant_choice_index is null/,
    );
    expect(sql).toMatch(
      /selected_choice_id is null\s+and question_variant_id is not null\s+and selected_variant_choice_index is not null/,
    );
  });

  it("validates variant ownership, source choice bounds, and owned session state", () => {
    expect(sql).toContain("create or replace function public.record_variant_attempt");
    expect(sql).toContain(
      "variant.canonical_question_id = question.id",
    );
    expect(sql).toContain(
      "left(p_selected_variant_choice_id, char_length(v_choice_prefix))",
    );
    expect(sql).toContain(
      "v_choice_number > v_choice_count",
    );
    expect(sql).toContain(
      "practice_session.user_id = v_user_id",
    );
    expect(sql).toContain(
      "item.question_variant_id = v_variant_id",
    );
    expect(sql).toContain(
      "p_selected_variant_choice_id = any(v_session_choice_order)",
    );
  });

  it("preserves learning updates and branches guest merges by variant identity", () => {
    expect(sql).toContain("insert into public.mastery");
    expect(sql).toContain("insert into public.review_queue");
    expect(sql).toContain("perform public.touch_account_activity()");
    expect(sql).toContain(
      "if nullif(item ->> 'variantExternalId', '') is not null then",
    );
    expect(sql).toContain("perform public.record_variant_attempt");
    expect(sql).toContain("perform public.record_attempt");
  });
});
