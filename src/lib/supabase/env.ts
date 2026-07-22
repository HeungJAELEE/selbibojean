import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  USERNAME_EMAIL_DOMAIN: z.string().default("accounts.invalid"),
  RATE_LIMIT_HMAC_SECRET: z.string().min(32),
});

export function getPublicSupabaseEnv() {
  return publicEnvSchema.safeParse(process.env);
}

export function getServerSupabaseEnv() {
  return serverEnvSchema.safeParse(process.env);
}

