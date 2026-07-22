import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const encoder = new TextEncoder();

async function anonymousHash(userId: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`purge:${userId}`));
  return [...new Uint8Array(signature)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const auditSecret = Deno.env.get("PURGE_AUDIT_HMAC_SECRET");
  if (!url || !serviceKey || !auditSecret) return Response.json({ error: "missing server configuration" }, { status: 500 });
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: candidates, error } = await supabase
    .from("account_activity")
    .select("user_id,purge_after,account_status")
    .eq("account_status", "active")
    .lte("purge_after", new Date().toISOString())
    .order("purge_after")
    .limit(1000);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let purged = 0;
  const failures: string[] = [];
  for (const candidate of candidates ?? []) {
    const { data: claimed } = await supabase
      .from("account_activity")
      .update({ account_status: "purge_pending" })
      .eq("user_id", candidate.user_id)
      .eq("account_status", "active")
      .lte("purge_after", new Date().toISOString())
      .select("user_id")
      .maybeSingle();
    if (!claimed) continue;
    const userHash = await anonymousHash(candidate.user_id, auditSecret);
    const { error: auditError } = await supabase
      .from("account_purge_events")
      .insert({ anonymous_user_hash: userHash, reason: "inactivity", purged_at: new Date().toISOString() });
    if (auditError) {
      failures.push(`${candidate.user_id}: audit failed`);
      await supabase.from("account_activity").update({ account_status: "active" }).eq("user_id", candidate.user_id);
      continue;
    }
    const { error: deleteError } = await supabase.auth.admin.deleteUser(candidate.user_id);
    if (deleteError) {
      failures.push(`${candidate.user_id}: auth delete failed`);
      await supabase.from("account_purge_events").delete().eq("anonymous_user_hash", userHash).eq("reason", "inactivity");
      await supabase.from("account_activity").update({ account_status: "active" }).eq("user_id", candidate.user_id);
      continue;
    }
    purged += 1;
  }
  return Response.json({ scanned: candidates?.length ?? 0, purged, failures });
});
