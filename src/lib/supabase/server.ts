import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getPublicSupabaseEnv, getServerSupabaseEnv } from "./env";

export async function createSupabaseServerClient() {
  const env = getPublicSupabaseEnv();
  if (!env.success) return null;
  const cookieStore = await cookies();
  return createServerClient(env.data.NEXT_PUBLIC_SUPABASE_URL, env.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; middleware/route handlers refresh them.
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const env = getServerSupabaseEnv();
  if (!env.success) return null;
  return createClient(env.data.NEXT_PUBLIC_SUPABASE_URL, env.data.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

