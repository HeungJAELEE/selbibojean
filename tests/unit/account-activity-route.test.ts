import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createServerClient,
  createSupabaseAdminClient: mocks.createAdminClient,
}));

function recentAttemptLookup(result: { data: { id: string } | null; error: unknown }) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.gte.mockReturnValue(builder);
  return builder;
}

describe("POST /api/account/activity", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rejects a generic authenticated ping without server evidence", async () => {
    const lookup = recentAttemptLookup({ data: null, error: null });
    mocks.createServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: crypto.randomUUID() } } }) },
      from: vi.fn().mockReturnValue(lookup),
    });
    mocks.createAdminClient.mockReturnValue({ rpc: vi.fn() });
    const { POST } = await import("@/app/api/account/activity/route");

    const response = await POST(
      new Request("http://localhost/api/account/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "ping" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createAdminClient.mock.results[0]?.value.rpc).not.toHaveBeenCalled();
  });

  it("touches only after a recent owned attempt is read back", async () => {
    const userId = crypto.randomUUID();
    const attemptId = crypto.randomUUID();
    const lookup = recentAttemptLookup({ data: { id: attemptId }, error: null });
    const rpc = vi.fn().mockResolvedValue({
      data: [{ activity_version: 4, state: "active", purge_after: "2026-08-08T00:00:00.000Z" }],
      error: null,
    });
    mocks.createServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
      from: vi.fn().mockReturnValue(lookup),
    });
    mocks.createAdminClient.mockReturnValue({ rpc });
    const { POST } = await import("@/app/api/account/activity/route");

    const response = await POST(
      new Request("http://localhost/api/account/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "practice_attempt", referenceId: attemptId }),
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("touch_account_activity", {
      p_user_id: userId,
      p_event: "practice_attempt",
      p_reference_id: attemptId,
    });
  });

  it("fails closed when the privileged touch does not read back a row", async () => {
    const userId = crypto.randomUUID();
    const attemptId = crypto.randomUUID();
    const lookup = recentAttemptLookup({ data: { id: attemptId }, error: null });
    mocks.createServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
      from: vi.fn().mockReturnValue(lookup),
    });
    mocks.createAdminClient.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const { POST } = await import("@/app/api/account/activity/route");

    const response = await POST(
      new Request("http://localhost/api/account/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "practice_attempt", referenceId: attemptId }),
      }),
    );

    expect(response.status).toBe(503);
  });
});
