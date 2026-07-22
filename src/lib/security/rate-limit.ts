import "server-only";
import { createHmac } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export function requestFingerprint(request: Request) {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET;
  if (!secret) return null;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "local";
  const bucket = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret).update(`${bucket}:${address}`).digest("hex");
}

export async function consumeRateLimit(request: Request, action: "register" | "login", limit: number) {
  const fingerprint = requestFingerprint(request);
  const admin = createSupabaseAdminClient();
  if (!fingerprint || !admin) return { allowed: true, configured: false };
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_fingerprint: fingerprint,
    p_action: action,
    p_limit: limit,
  });
  if (error) return { allowed: false, configured: true };
  return { allowed: Boolean(data), configured: true };
}

