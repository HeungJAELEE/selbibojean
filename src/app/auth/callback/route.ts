import { NextResponse } from "next/server";
import { safeLocalRedirect } from "@/lib/auth/safe-local-redirect";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeLocalRedirect(url.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!code || !supabase || !admin) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_config", url.origin),
    );
  }
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_exchange", url.origin),
    );
  }
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=oauth_user", url.origin),
    );
  }
  const { data: touched, error: touchError } = await admin.rpc(
    "touch_account_activity",
    {
      p_user_id: data.user.id,
      p_event: "oauth_callback",
      p_reference_id: null,
    },
  );
  if (touchError || !Array.isArray(touched) || touched.length !== 1) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=activity_write", url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
