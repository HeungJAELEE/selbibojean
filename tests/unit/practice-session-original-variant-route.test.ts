import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_REASONS, type Question } from "@/lib/domain/types";
import { findForbiddenPreSubmitFields } from "@/lib/security/answer-leak";

const mocks = vi.hoisted(() => ({
  getContent: vi.fn(),
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/content/repository", () => ({
  getContent: mocks.getContent,
}));

vi.mock("@/lib/release-features", () => ({
  isReleaseFeatureEnabled: () => true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createServerClient,
  createSupabaseAdminClient: mocks.createAdminClient,
}));

function makeQuestion(index: number): Question {
  const id = `U-${index}`;
  return {
    id,
    canonicalNumber: index,
    subjectId: "subject-1",
    conceptGroupId: "s1-g01",
    conceptId: `concept-${index}`,
    lessonId: `lesson-${index}`,
    lessonAnchor: "principle",
    stem: `대표 문제 ${index}`,
    choices: [1, 2, 3, 4].map((order) => ({
      id: `${id}-c${order}`,
      order,
      text: `대표 보기 ${index}-${order}`,
      feedback: {
        rationale: `대표 근거 ${index}-${order}`,
        plausibleReason: "같은 분야의 용어입니다.",
        incorrectPoint: order === 1 ? null : "조건이 다릅니다.",
        keyRule: `대표 규칙 ${index}`,
        differenceFromCorrect: order === 1 ? null : "정답 조건과 다릅니다.",
      },
    })),
    correctChoiceId: `${id}-c1`,
    answerText: `대표 보기 ${index}-1`,
    explanation: `대표 해설 ${index}`,
    errorReason: ERROR_REASONS[0],
    sourceLabel: "canonical source",
    reviewStatus: "확정",
    contentStatus: "published",
    publication: { readiness: "ready", blockers: [] },
    verification: {
      status: "verified",
      method: "source_backed_reconstruction",
      variantCount: 1,
      sourceUrls: [`https://example.com/canonical/${index}`],
      riskTags: ["historical_context"],
      note: "원문 대조 완료",
      reviewedAt: "2026-08-05T00:00:00.000Z",
    },
    approvedReview: {
      directSolution: `대표 직접 풀이 ${index}`,
      conceptBinding: {
        assertionText: `대표 이론 근거 ${index}`,
        href: `/written/theory/lesson-${index}#principle`,
      },
    },
    validation: {
      answer: true,
      explanation: true,
      choiceFeedback: true,
      theoryLink: true,
      contentQuality: true,
    },
  };
}

function makeVariant(index: number) {
  return {
    externalId: `2006-4-Q${String(index).padStart(2, "0")}`,
    canonicalId: `U-${index}`,
    relationship: "original",
    year: 2006,
    sessionLabel: "4회",
    questionNumber: index,
    conceptAlias: `원문 개념 ${index}`,
    subjectCode: 1,
    stem: `원문 문제 ${index}`,
    choices: [1, 2, 3, 4].map((order) => `원문 보기 ${index}-${order}`),
    answer: `1. 원문 보기 ${index}-1`,
    explanation: `원문 해설 ${index}`,
    sourceUrl: `https://example.com/exam/2006-4#q${index}`,
    reviewStatus: "GPT Pro 원문대조 완료",
    verificationNote: "회차 원문과 대조함",
    sourceFidelity: "exact" as const,
    sourceReview: {
      answerConfidence: "confirmed" as const,
      directSolution: `서버 전용 직접 풀이 ${index}`,
      calculation: null,
      choiceByChoiceReasons: [1, 2, 3, 4].map(
        (order) => `서버 전용 선택지 근거 ${index}-${order}`,
      ),
      conceptKeywords: [`원문 키워드 ${index}`],
      theorySupplement: `서버 전용 이론 보충 ${index}`,
      imageRequirement: "none" as const,
      answerConflictOrMultipleAnswerRisk: null,
    },
  };
}

function lookup(rows: Array<{ id: string; external_id: string }>) {
  const builder = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue({ data: rows, error: null }),
  };
  builder.select.mockReturnValue(builder);
  return builder;
}

describe("POST /api/practice/session original variant persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("falls back the whole account session when one source variant DB mapping is missing", async () => {
    const questions = [makeQuestion(1), makeQuestion(2)];
    const variants = [makeVariant(1), makeVariant(2)];
    const questionLookup = lookup([
      { id: "question-db-1", external_id: "U-1" },
      { id: "question-db-2", external_id: "U-2" },
    ]);
    const variantLookup = lookup([
      { id: "variant-db-1", external_id: "2006-4-Q01" },
    ]);
    const sessionInsert = vi.fn();
    const from = vi.fn((table: string) => {
      if (table === "questions") return questionLookup;
      if (table === "question_variants") return variantLookup;
      if (table === "practice_sessions") {
        return { insert: sessionInsert };
      }
      throw new Error(`Unexpected table access: ${table}`);
    });
    const activityRpc = vi.fn();

    mocks.getContent.mockResolvedValue({
      questions,
      variants,
      conceptGroups: [],
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      from,
    });
    mocks.createAdminClient.mockReturnValue({ rpc: activityRpc });

    const { POST } = await import("@/app/api/practice/session/route");
    const response = await POST(
      new Request("http://localhost/api/practice/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "all",
          count: 2,
          seed: 20260805,
          originalRatio: 100,
          shuffleChoices: false,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      storage: "guest",
      actualOriginalCount: 2,
    });
    expect(payload.storageNotice).toContain("계정 저장소");
    expect(sessionInsert).not.toHaveBeenCalled();
    expect(activityRpc).not.toHaveBeenCalled();

    expect(payload.questions).toHaveLength(2);
    expect(payload.questions[0]).toMatchObject({
      stem: expect.stringMatching(/^원문 문제 [12]$/),
      provenance: {
        original: true,
        exam: {
          externalId: expect.stringMatching(/^2006-4-Q0[12]$/),
        },
      },
    });
    expect(findForbiddenPreSubmitFields(payload.questions)).toEqual([]);
    for (const question of payload.questions) {
      expect(question).not.toHaveProperty("answer");
      expect(question).not.toHaveProperty("answerText");
      expect(question).not.toHaveProperty("correctChoiceId");
      expect(question).not.toHaveProperty("explanation");
      expect(question).not.toHaveProperty("approvedReview");
      expect(question).not.toHaveProperty("sourceReview");
    }
    const serialized = JSON.stringify(payload.questions);
    expect(serialized).not.toContain("서버 전용 직접 풀이");
    expect(serialized).not.toContain("서버 전용 선택지 근거");
    expect(serialized).not.toContain("서버 전용 이론 보충");
  });
});
