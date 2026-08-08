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

const requestPayload = {
  clientAttemptId: "40000000-0000-4000-8000-000000000001",
  questionId: "question-1",
  choiceId: "choice-1",
  selfRating: "known",
  sessionId: "30000000-0000-4000-8000-000000000001",
  attemptKind: "initial",
};

const feedback = {
  isCorrect: true,
  selectedChoice: {},
  correctChoice: { id: "choice-1" },
  lesson: { id: "lesson-1", anchor: "principle" },
};

describe("POST /api/practice/submit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getQuestion.mockResolvedValue({
      id: "question-1",
      lessonId: "lesson-1",
    });
    mocks.getLesson.mockResolvedValue({ id: "lesson-1" });
    mocks.gradeQuestion.mockReturnValue(feedback);
  });

  it("forwards the client idempotency key to the grading RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: "50000000-0000-4000-8000-000000000001",
      error: null,
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      rpc,
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      new Request("http://localhost/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestPayload),
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "record_attempt",
      expect.objectContaining({
        p_client_attempt_id: requestPayload.clientAttemptId,
        p_question_external_id: "question-1",
        p_selected_choice_external_id: "choice-1",
      }),
    );
    await expect(response.json()).resolves.toMatchObject({
      attemptId: "50000000-0000-4000-8000-000000000001",
      isCorrect: true,
    });
  });

  it("does not reveal successful feedback when account persistence fails", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "database unavailable" },
      }),
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      new Request("http://localhost/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestPayload),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "답안을 안전하게 저장하지 못했습니다. 같은 답안을 다시 제출해 주세요.",
    });
  });

  it("treats Supabase AuthSessionMissingError as the normal guest state", async () => {
    const rpc = vi.fn();
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { name: "AuthSessionMissingError", message: "Auth session missing!" },
        }),
      },
      rpc,
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      new Request("http://localhost/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestPayload),
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      attemptId: null,
      isCorrect: true,
    });
  });

  it("still grades a guest attempt without invoking the account RPC", async () => {
    const rpc = vi.fn();
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      rpc,
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      new Request("http://localhost/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestPayload),
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      attemptId: null,
      isCorrect: true,
    });
  });
  it("rejects a malformed idempotency key before grading", async () => {
    const { POST } = await import("@/app/api/practice/submit/route");
    const response = await POST(
      new Request("http://localhost/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...requestPayload,
          clientAttemptId: "not-a-uuid",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.gradeQuestion).not.toHaveBeenCalled();
  });

  it("does not grade as a guest when account lookup fails", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "auth unavailable" },
        }),
      },
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      new Request("http://localhost/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestPayload),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "로그인 상태를 확인하지 못했습니다. 같은 답안을 다시 제출해 주세요.",
    });
  });

});
