import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migrationPath = join(
  root,
  "supabase",
  "migrations",
  "0003_account_purge_state_machine.sql",
);
const edgeFunctionPath = join(
  root,
  "supabase",
  "functions",
  "purge-inactive-accounts",
  "index.ts",
);

describe("account purge migration contract", () => {
  it("adds an additive, versioned claim state and backfills learners from deployment time", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("add column if not exists activity_version bigint");
    expect(sql).toContain("add column if not exists purge_claimed_at timestamptz");
    expect(sql).toContain("add column if not exists purge_committed_at timestamptz");
    expect(sql).toContain("add column if not exists state public.account_status");
    expect(sql).toContain("create table if not exists public.account_purge_outbox");
    expect(sql).not.toMatch(
      /account_purge_outbox[\s\S]{0,500}references\s+auth\.users/i,
    );
    expect(sql).toMatch(/purge_after\s*=\s*now\(\)\s*\+\s*interval '168 hours'/);
    expect(sql).toContain("p.role = 'learner'");
    expect(sql).toContain("create or replace function public.handle_new_auth_user()");
    expect(sql).toContain("insert into public.account_activity(user_id)");
    expect(sql).not.toMatch(/\bdrop\s+(table|column|type)\b/i);
    expect(sql).not.toMatch(/provider_(?:access|refresh)?_?token/i);
  });

  it("revokes direct activity touches and grants only the proof-carrying overload to service_role", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain(
      "revoke all on function public.touch_account_activity() from authenticated",
    );
    expect(sql).toContain(
      "grant execute on function public.touch_account_activity(uuid,text,uuid) to service_role",
    );
    expect(sql).toContain("'oauth_callback'");
    expect(sql).toContain("'practice_session'");
    expect(sql).toContain("'practice_attempt'");
    expect(sql).toContain("'note'");
    expect(sql).toContain("'bookmark'");
    expect(sql).toContain("recent owned practice session required");
    expect(sql).toContain("recent owned note required");
    expect(sql).toContain("recent owned bookmark required");
    expect(sql).toContain("activity_version = a.activity_version + 1");
    expect(sql).toContain("set last_activity_at = v_now");
    expect(sql).toContain("purge_after = v_now + interval '168 hours'");
    expect(sql).toContain("state = 'active'");
    expect(sql).toContain("purge_claimed_at = null");
  });

  it("claims at the exact boundary with CAS and excludes every non-learner profile", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("a.activity_version = p_expected_activity_version");
    expect(sql).toContain("a.purge_after <= p_cutoff");
    expect(sql).toContain("a.state = 'active'");
    expect(sql).toContain("p.role = 'learner'");
    expect(sql).toContain("state = 'purge_pending'");
    expect(sql).toContain("purge_claimed_at = v_claimed_at");
    expect(sql).toContain("create or replace function public.commit_account_purge_claim");
    expect(sql).toContain("create or replace function public.verify_account_purge_outbox");
    expect(sql).toContain("create or replace function public.complete_account_purge_outbox");
    expect(sql).toContain("insert into public.account_purge_events");
    expect(sql).toContain("a.state <> 'deleted'");
  });
});

describe("purge Edge Function contract", () => {
  it("keeps every destructive provider action disabled unless explicit flags are true", () => {
    const source = readFileSync(edgeFunctionPath, "utf8");

    expect(source).toContain('Deno.env.get("ACCOUNT_PURGE_ENABLED")');
    expect(source).toContain('Deno.env.get("ACCOUNT_PURGE_AUTH_DELETE_ENABLED")');
    expect(source).toContain('Deno.env.get("ACCOUNT_PURGE_KAKAO_UNLINK_ENABLED")');
    expect(source).toContain('Deno.env.get("KAKAO_ADMIN_KEY")');
    expect(source).toContain('=== "true"');
    expect(source.indexOf("if (!purgeEnabled || !authDeleteEnabled)")).toBeLessThan(
      source.indexOf("const supabase = createClient"),
    );
  });

  it("uses claim and authoritative readback paths without storing provider tokens", () => {
    const source = readFileSync(edgeFunctionPath, "utf8");

    expect(source).toMatch(/rpc\(\s*"claim_inactive_account"/);
    expect(source).toMatch(/rpc\(\s*"verify_account_purge_claim"/);
    expect(source).toMatch(/rpc\(\s*"commit_account_purge_claim"/);
    expect(source).toMatch(/rpc\(\s*"verify_account_purge_outbox"/);
    expect(source).toMatch(/rpc\(\s*"complete_account_purge_outbox"/);
    expect(source).toContain("auth.admin.getUserById");
    expect(source).toContain("https://kapi.kakao.com/v2/app/users");
    expect(source).toContain("anonymous_user_hash");
    expect(source).not.toContain("failures.push");
    expect(source).not.toMatch(/\.from\([^)]*\)\.(?:insert|upsert|update)\([^)]*provider[_ ]?token/is);
    expect(source).not.toContain("access_token");
    expect(source).not.toContain("refresh_token");
    expect(source).toContain('.from("account_purge_outbox")');
    expect(source).toContain('.eq("status", "pending")');
    expect(source.indexOf('"commit_account_purge_claim"')).toBeLessThan(
      source.indexOf("auth.admin.deleteUser"),
    );
    expect(source.indexOf('"complete_account_purge_outbox"')).toBeGreaterThan(
      source.indexOf("auth.admin.deleteUser"),
    );
  });
});
