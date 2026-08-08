import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getContent: vi.fn(),
  createPresentations: vi.fn(),
  filterByYear: vi.fn(),
  buildWeakFocus: vi.fn(),
  selectAllocated: vi.fn(),
  selectQuestions: vi.fn(),
  createAdminClient: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/content/repository", () => ({
  getContent: mocks.getContent,
}));
vi.mock("@/lib/content/practice-presentations", () => ({
  createPracticePresentations: mocks.createPresentations,
  filterPracticeContentByYearRange: mocks.filterByYear,
}));
vi.mock("@/lib/domain/practice", () => ({
  buildWeakFocus: mocks.buildWeakFocus,
  selectAllocatedPracticeQuestions: mocks.selectAllocated,
  selectPracticeQuestions: mocks.selectQuestions,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: mocks.createAdminClient,
  createSupabaseServerClient: mocks.createServerClient,
}));
vi.mock("@/lib/release-features", () => ({
  isReleaseFeatureEnabled: () => false,
}));

const request = () =>
  new Request("http://localhost/api/practice/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "all", count: 1, originalRatio: 0 }),
  });

describe("POST /api/practice/session auth classification", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getContent.mockResolvedValue({
      questions: [],
      variants: [],
      conceptGroups: [],
    });
    mocks.filterByYear.mockReturnValue({ questions: [], variants: [] });
    mocks.selectQuestions.mockReturnValue({
      questions: [],
      availableCount: 0,
      limited: false,
      requestedCount: 1,
    });
    mocks.createPresentations.mockReturnValue([]);
    mocks.createAdminClient.mockReturnValue(null);
  });

  it("treats AuthSessionMissingError as the normal guest state", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: {
            name: "AuthSessionMissingError",
            message: "Auth session missing!",
          },
        }),
      },
    });
    const { POST } = await import("@/app/api/practice/session/route");

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      storage: "guest",
      questions: [],
    });
  });

  it("fails closed when the auth service lookup fails", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: {
            name: "AuthRetryableFetchError",
            message: "auth unavailable",
          },
        }),
      },
    });
    const { POST } = await import("@/app/api/practice/session/route");

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(mocks.selectQuestions).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.",
    });
  });
});
