import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getQuestion: vi.fn(),
  getLesson: vi.fn(),
  getQuestionVariant: vi.fn(),
  gradeQuestion: vi.fn(),
  gradeReviewedOriginalVariant: vi.fn(),
  isReviewedExactOriginalVariant: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/content/repository", () => ({
  getQuestion: mocks.getQuestion,
  getLesson: mocks.getLesson,
  getQuestionVariant: mocks.getQuestionVariant,
}));

vi.mock("@/lib/content/original-variant-practice", () => ({
  gradeReviewedOriginalVariant: mocks.gradeReviewedOriginalVariant,
  isReviewedExactOriginalVariant: mocks.isReviewedExactOriginalVariant,
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
    mocks.getQuestionVariant.mockResolvedValue({
      canonicalId: "question-1",
      externalId: "variant-1",
    });
    mocks.gradeReviewedOriginalVariant.mockReturnValue({ isCorrect: true });
    mocks.isReviewedExactOriginalVariant.mockReturnValue(true);
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
          questionId: "question-1",
          selectedChoiceId: "choice-2",
          isCorrect: false,
        }),
      ],
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

  it("recomputes an exact source variant and preserves its identity for the merge RPC", async () => {
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
        body: JSON.stringify({
          attempts: [
            {
              ...attempt,
              variantExternalId: "variant-1",
              selectedChoiceId: "variant-1:choice:3",
              isCorrect: false,
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.gradeQuestion).not.toHaveBeenCalled();
    expect(mocks.gradeReviewedOriginalVariant).toHaveBeenCalledWith(
      expect.objectContaining({ id: "question-1" }),
      expect.objectContaining({ externalId: "variant-1" }),
      "variant-1:choice:3",
      "unsure",
      expect.objectContaining({ id: "lesson-1" }),
    );
    expect(rpc).toHaveBeenCalledWith("merge_guest_learning", {
      p_payload: [
        expect.objectContaining({
          questionId: "question-1",
          variantExternalId: "variant-1",
          selectedChoiceId: "variant-1:choice:3",
          isCorrect: true,
        }),
      ],
    });
  });

  it("rejects a source variant that belongs to another canonical question", async () => {
    mocks.getQuestionVariant.mockResolvedValue({
      canonicalId: "question-2",
      externalId: "variant-1",
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc: vi.fn(),
    });
    const { POST } = await import(
      "@/app/api/account/merge-guest-learning/route"
    );

    const response = await POST(
      new Request("http://localhost/api/account/merge-guest-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          attempts: [
            {
              ...attempt,
              variantExternalId: "variant-1",
              selectedChoiceId: "variant-1:choice:1",
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(409);
  });
});
