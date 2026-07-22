import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerSupabaseEnv } from "@/lib/supabase/env";
import { registerSchema } from "@/lib/validation/auth";

const GENERIC_ERROR = "가입할 수 없습니다. 입력값을 확인하고 잠시 후 다시 시도해 주세요.";

export async function POST(request: Request) {
  const limited = await consumeRateLimit(request, "register", 5);
  if (!limited.allowed) return NextResponse.json({ error: GENERIC_ERROR }, { status: 429 });
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? GENERIC_ERROR }, { status: 400 });
  const env = getServerSupabaseEnv();
  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();
  if (!env.success || !admin || !supabase) return NextResponse.json({ error: "Supabase 환경 설정 후 가입할 수 있습니다." }, { status: 503 });

  const username = parsed.data.username;
  const digest = createHmac("sha256", env.data.RATE_LIMIT_HMAC_SECRET).update(`username:${username}`).digest("hex").slice(0, 40);
  const internalEmail = `u_${digest}@${env.data.USERNAME_EMAIL_DOMAIN}`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: internalEmail,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { account_type: "username" },
  });
  if (createError || !created.user) return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });

  const { error: credentialError } = await admin.from("username_credentials").insert({
    username,
    user_id: created.user.id,
    internal_email: internalEmail,
  });
  if (credentialError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 409 });
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email: internalEmail, password: parsed.data.password });
  if (signInError) return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  if (parsed.data.guestPayload) await supabase.rpc("merge_guest_learning", { p_payload: parsed.data.guestPayload });
  return NextResponse.json({ ok: true, username });
}

