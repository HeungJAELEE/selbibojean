import { NextResponse } from "next/server";
import { safeLocalRedirect } from "@/lib/auth/safe-local-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PROVIDER_FLAGS = {
  google: "ENABLE_GOOGLE_OAUTH",
  kakao: "ENABLE_KAKAO_OAUTH",
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  if (provider !== "google" && provider !== "kakao") {
    return NextResponse.json(
      { error: "지원하지 않는 로그인 방식입니다." },
      { status: 400 },
    );
  }
  if (process.env[PROVIDER_FLAGS[provider]] !== "true") {
    return NextResponse.json(
      { error: "아직 활성화되지 않은 로그인 방식입니다." },
      { status: 404 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "로그인 환경이 설정되지 않았습니다." },
      { status: 503 },
    );
  }
  const next = safeLocalRedirect(url.searchParams.get("next"));
  const callback = new URL("/auth/callback", url.origin);
  callback.searchParams.set("next", next);
  callback.searchParams.set("provider", provider);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback.toString() },
  });
  if (error || !data.url) {
    return NextResponse.json(
      { error: "외부 로그인 요청을 시작하지 못했습니다." },
      { status: 503 },
    );
  }
  return NextResponse.redirect(data.url);
}
