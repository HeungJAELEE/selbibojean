import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sql = await readFile(
  path.join(
    process.cwd(),
    "supabase/migrations/0004_cbt_audit_and_practice_snapshots.sql",
  ),
  "utf8",
);

describe("CBT audit and practice snapshot migration", () => {
  it("keeps source authority, fidelity, answer evidence, and resolution separate", () => {
    expect(sql).toContain("create type public.source_authority");
    expect(sql).toContain("create type public.content_fidelity");
    expect(sql).toContain("create type public.answer_evidence");
    expect(sql).toContain("create type public.audit_resolution");
    expect(sql).not.toContain("audit_status");
  });

  it("persists stable choice order and attempt classification snapshots", () => {
    expect(sql).toContain("choice_order text[]");
    expect(sql).toContain("validate_source_observation_answer_choice");
    expect(sql).toContain(
      "choice.question_id = variant.canonical_question_id",
    );
    expect(sql).toContain("question_variant_id uuid");
    expect(sql).toContain("exam_track_id uuid");
    expect(sql).toContain("syllabus_version_id uuid");
    expect(sql).toContain("create trigger attempts_classification_snapshot");
    expect(sql).toContain("new.exam_track_id := v_exam_track_id");
    expect(sql).toContain("new.syllabus_version_id := v_syllabus_version_id");
    expect(sql).toContain("practice_session.user_id = new.user_id");
  });

  it("defaults every independent release flag to disabled", () => {
    for (const flag of [
      "mock_choice_shuffle",
      "google_oauth",
      "kakao_oauth",
      "account_purge",
      "learning_analytics",
      "busan_kopo_media",
    ]) {
      expect(sql).toContain(`('${flag}', false`);
    }
    expect(sql).toContain("'track_bank_' || code");
  });

  it("allows only admin profiles to mutate audit evidence", () => {
    expect(sql).toContain("admins manage source observations");
    expect(sql).toContain("profiles.role = 'admin'");
    expect(sql).toContain("alter table public.source_observations enable row level security");
  });
});
