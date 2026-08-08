import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

const GENERIC_ERROR = "아이디 또는 비밀번호를 확인해 주세요.";

export async function POST(request: Request) {
  const limited = await consumeRateLimit(request, "login", 12);
  if (!limited.allowed) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 429 });
  }
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }
  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();
  if (!admin || !supabase) return NextResponse.json({ error: "Supabase 환경 설정 후 로그인할 수 있습니다." }, { status: 503 });
  const { data: credential } = await admin
    .from("username_credentials")
    .select("internal_email,user_id")
    .eq("username", parsed.data.username)
    .maybeSingle();
  const email = credential?.internal_email ?? "missing@accounts.invalid";
  const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || !credential) return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  const { data: touched, error: touchError } = await admin.rpc(
    "touch_account_activity",
    {
      p_user_id: credential.user_id,
      p_event: "login",
      p_reference_id: null,
    },
  );
  if (touchError || !Array.isArray(touched) || touched.length !== 1) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Supabase 계정 활동 기록을 확인할 수 없습니다." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true });
}
