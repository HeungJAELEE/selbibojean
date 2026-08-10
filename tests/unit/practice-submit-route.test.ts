import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getQuestion: vi.fn(),
  getLesson: vi.fn(),
  getQuestionVariant: vi.fn(),
  gradeQuestion: vi.fn(),
  gradeReviewedOriginalVariant: vi.fn(),
  isReviewedExactOriginalVariant: vi.fn(),
  isSafeOriginalPracticeVariant: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/content/repository", () => ({
  getQuestion: mocks.getQuestion,
  getLesson: mocks.getLesson,
  getQuestionVariant: mocks.getQuestionVariant,
}));

vi.mock("@/lib/content/original-variant-practice", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/lib/content/original-variant-practice")
    >();
  return {
    ...actual,
    gradeReviewedOriginalVariant: mocks.gradeReviewedOriginalVariant,
    isReviewedExactOriginalVariant: mocks.isReviewedExactOriginalVariant,
  };
});

vi.mock("@/lib/domain/practice", () => ({
  isPublishableQuestion: () => true,
  isPublishableLesson: () => true,
  gradeQuestion: mocks.gradeQuestion,
}));

vi.mock("@/lib/content/practice-presentations", () => ({
  isSafeOriginalPracticeVariant: mocks.isSafeOriginalPracticeVariant,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createServerClient,
}));

const feedback = {
  isCorrect: true,
  errorReason: null,
  selectedChoice: {
    incorrectPoint: null,
    differenceFromCorrect: null,
  },
};

function submit(body: Record<string, unknown>) {
  return new Request("http://localhost/api/practice/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      questionId: "question-1",
      choiceId: "choice-1",
      selfRating: "known",
      attemptKind: "initial",
      ...body,
    }),
  });
}

describe("POST /api/practice/submit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getQuestion.mockResolvedValue({
      id: "question-1",
      lessonId: "lesson-1",
    });
    mocks.getLesson.mockResolvedValue({ id: "lesson-1" });
    mocks.getQuestionVariant.mockResolvedValue({
      canonicalId: "question-1",
      externalId: "variant-1",
    });
    mocks.gradeQuestion.mockReturnValue(feedback);
    mocks.gradeReviewedOriginalVariant.mockReturnValue(feedback);
    mocks.isReviewedExactOriginalVariant.mockReturnValue(true);
    mocks.isSafeOriginalPracticeVariant.mockReturnValue(false);
  });

  it("records an authenticated exact source variant through the variant RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: "attempt-variant-1",
      error: null,
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc,
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      submit({
        variantExternalId: "variant-1",
        choiceId: "variant-1:choice:2",
        sessionId: "8b653d16-a046-443a-a2dd-1af595ed8655",
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("record_variant_attempt", {
      p_question_external_id: "question-1",
      p_variant_external_id: "variant-1",
      p_selected_variant_choice_id: "variant-1:choice:2",
      p_is_correct: true,
      p_self_rating: "known",
      p_error_reason: null,
      p_session_id: "8b653d16-a046-443a-a2dd-1af595ed8655",
      p_attempt_kind: "initial",
      p_error_narrative: null,
    });
    await expect(response.json()).resolves.toMatchObject({
      attemptId: "attempt-variant-1",
    });
  });

  it("rejects a malformed source choice before any persistence call", async () => {
    const rpc = vi.fn();
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc,
    });
    const { OriginalVariantPracticeError } = await import(
      "@/lib/content/original-variant-practice"
    );
    mocks.gradeReviewedOriginalVariant.mockImplementation(() => {
      throw new OriginalVariantPracticeError(
        "ORIGINAL_VARIANT_CHOICE_INVALID",
        "variant-1",
        "invalid choice",
      );
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      submit({
        variantExternalId: "variant-1",
        choiceId: "choice-from-another-question",
      }),
    );

    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("keeps canonical answers on the existing canonical RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: "attempt-canonical-1",
      error: null,
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc,
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(submit({}));

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "record_attempt",
      expect.objectContaining({
        p_question_external_id: "question-1",
        p_selected_choice_external_id: "choice-1",
      }),
    );
    expect(rpc).not.toHaveBeenCalledWith(
      "record_variant_attempt",
      expect.anything(),
    );
  });

  it("accepts the U-297 legacy 2020-4-Q71 presentation but grades and records it canonically", async () => {
    mocks.getQuestion.mockResolvedValue({
      id: "U-297",
      lessonId: "lesson-297",
      stem: "스퍼·헬리컬·베벨기어 등 밀폐식 기어장치에 적합한 급유법은?",
    });
    mocks.getLesson.mockResolvedValue({ id: "lesson-297" });
    mocks.getQuestionVariant.mockResolvedValue({
      canonicalId: "U-297",
      externalId: "2020-4-Q71",
    });
    mocks.isReviewedExactOriginalVariant.mockReturnValue(false);
    mocks.isSafeOriginalPracticeVariant.mockReturnValue(true);
    const rpc = vi.fn().mockResolvedValue({
      data: "attempt-canonical-297",
      error: null,
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc,
    });
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      submit({
        questionId: "U-297",
        variantExternalId: "2020-4-Q71",
        choiceId: "U-297-c2",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.gradeQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ id: "U-297" }),
      "U-297-c2",
      "known",
      expect.objectContaining({ id: "lesson-297" }),
    );
    expect(mocks.gradeReviewedOriginalVariant).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith(
      "record_attempt",
      expect.objectContaining({
        p_question_external_id: "U-297",
        p_selected_choice_external_id: "U-297-c2",
      }),
    );
    expect(rpc).not.toHaveBeenCalledWith(
      "record_variant_attempt",
      expect.anything(),
    );
  });

  it("still rejects an unreviewed variant that is not a safe legacy presentation", async () => {
    mocks.isReviewedExactOriginalVariant.mockReturnValue(false);
    mocks.isSafeOriginalPracticeVariant.mockReturnValue(false);
    mocks.createServerClient.mockResolvedValue(null);
    const { POST } = await import("@/app/api/practice/submit/route");

    const response = await POST(
      submit({ variantExternalId: "variant-1" }),
    );

    expect(response.status).toBe(404);
    expect(mocks.gradeQuestion).not.toHaveBeenCalled();
    expect(mocks.gradeReviewedOriginalVariant).not.toHaveBeenCalled();
  });
});
