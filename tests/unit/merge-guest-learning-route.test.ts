import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getQuestion: vi.fn(),
  getLesson: vi.fn(),
  gradeQuestion: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/content/repository", () => ({
  getQuestion: mocks.getQuestion,
  getLesson: mocks.getLesson,
}));

vi.mock("@/lib/domain/practice", () => ({
  isPublishableQuestion: () => true,
  isPublishableLesson: () => true,
  gradeQuestion: mocks.gradeQuestion,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createServerClient,
}));

const attempt = {
  questionId: "question-1",
  selectedChoiceId: "choice-2",
  isCorrect: true,
  selfRating: "unsure",
  attemptKind: "initial",
  attemptedAt: "2026-08-01T00:00:00.000Z",
  dueAt: "2026-08-04T00:00:00.000Z",
};

describe("POST /api/account/merge-guest-learning", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getQuestion.mockResolvedValue({ id: "question-1", lessonId: "lesson-1" });
    mocks.getLesson.mockResolvedValue({ id: "lesson-1" });
    mocks.gradeQuestion.mockReturnValue({ isCorrect: false });
  });

  it("requires an authenticated account", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );

    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attempts: [attempt] }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("treats Supabase AuthSessionMissingError as an unauthenticated request", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { name: "AuthSessionMissingError", message: "Auth session missing!" },
        }),
      },
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );

    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attempts: [attempt] }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("recomputes correctness on the server before merging", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc,
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );

    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attempts: [attempt] }),
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("merge_guest_learning", {
      p_payload: [
        expect.objectContaining({
          clientAttemptId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
          ),
          questionId: "question-1",
          selectedChoiceId: "choice-2",
          isCorrect: false,
        }),
      ],
    });
  });

  it("derives the same idempotency key when a legacy payload is retried", async () => {
    const payloads: unknown[] = [];
    const rpc = vi.fn().mockImplementation(
      async (_name: string, args: { p_payload: unknown }) => {
        payloads.push(args.p_payload);
        return { data: 1, error: null };
      },
    );
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      rpc,
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );
    const request = () =>
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attempts: [attempt] }),
      });

    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(200);
    expect(payloads).toHaveLength(2);
    expect(payloads[1]).toEqual(payloads[0]);
  });

  it("keeps legacy idempotency keys stable when the merge order changes", async () => {
    const payloads: Array<Array<{ questionId: string; clientAttemptId: string }>> = [];
    const rpc = vi.fn().mockImplementation(
      async (_name: string, args: { p_payload: Array<{ questionId: string; clientAttemptId: string }> }) => {
        payloads.push(args.p_payload);
        return { data: args.p_payload.length, error: null };
      },
    );
    mocks.getQuestion.mockImplementation(async (questionId: string) => ({
      id: questionId,
      lessonId: "lesson-1",
    }));
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      rpc,
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );
    const secondAttempt = {
      ...attempt,
      questionId: "question-2",
      selectedChoiceId: "choice-3",
      attemptedAt: "2026-08-01T00:01:00.000Z",
    };
    const request = (attempts: unknown[]) =>
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attempts }),
      });

    expect((await POST(request([attempt, secondAttempt]))).status).toBe(200);
    expect((await POST(request([secondAttempt, attempt]))).status).toBe(200);

    const firstKeys = Object.fromEntries(
      payloads[0].map((item) => [item.questionId, item.clientAttemptId]),
    );
    const secondKeys = Object.fromEntries(
      payloads[1].map((item) => [item.questionId, item.clientAttemptId]),
    );
    expect(secondKeys).toEqual(firstKeys);
  });

  it("preserves an idempotency key created by the current client", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      rpc,
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );
    const clientAttemptId = "40000000-0000-4000-8000-000000000010";

    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          attempts: [{ ...attempt, clientAttemptId }],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("merge_guest_learning", {
      p_payload: [expect.objectContaining({ clientAttemptId })],
    });
  });

  it("does not report success when the database merges only part of the batch", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );

    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attempts: [attempt] }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ merged: 0 });
  });
  it("returns a retryable error when account lookup fails", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "auth unavailable" },
        }),
      },
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );

    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attempts: [attempt] }),
      }),
    );

    expect(response.status).toBe(503);
  });

  it("rejects a malformed current-client idempotency key", async () => {
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );
    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          attempts: [{ ...attempt, clientAttemptId: "not-a-uuid" }],
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createServerClient).not.toHaveBeenCalled();
  });

});
