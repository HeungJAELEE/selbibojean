import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeRateLimit: vi.fn(),
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createServerClient,
  createSupabaseAdminClient: mocks.createAdminClient,
}));

function credentialLookup(
  credential: { internal_email: string; user_id: string } | null,
) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: credential, error: null }),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

describe("POST /api/auth/login activity contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true });
  });

  it("records login through the privileged proof-carrying RPC", async () => {
    const userId = crypto.randomUUID();
    const rpc = vi.fn().mockResolvedValue({
      data: [{ activity_version: 2, state: "active", purge_after: "2026-08-08T00:00:00.000Z" }],
      error: null,
    });
    mocks.createAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(
        credentialLookup({ internal_email: "u_test@accounts.invalid", user_id: userId }),
      ),
      rpc,
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn(),
      },
    });
    const { POST } = await import("@/app/api/auth/login/route");

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: "user_01", password: "password1" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("touch_account_activity", {
      p_user_id: userId,
      p_event: "login",
      p_reference_id: null,
    });
  });

  it("signs the session back out when activity readback fails", async () => {
    const userId = crypto.randomUUID();
    const signOut = vi.fn().mockResolvedValue({ error: null });
    mocks.createAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(
        credentialLookup({ internal_email: "u_test@accounts.invalid", user_id: userId }),
      ),
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        signOut,
      },
    });
    const { POST } = await import("@/app/api/auth/login/route");

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: "user_01", password: "password1" }),
      }),
    );

    expect(response.status).toBe(503);
    expect(signOut).toHaveBeenCalledOnce();
  });
});
