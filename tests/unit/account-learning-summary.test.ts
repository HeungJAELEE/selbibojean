import { describe, expect, it } from "vitest";
import {
  buildAccountLearningSummary,
  type AccountLearningAttempt,
  type AccountQuestionMeta,
} from "@/lib/learning/account-learning-summary";

const metadata: AccountQuestionMeta[] = [
  {
    questionId: "q-1",
    subjectId: "subject-1",
    subjectTitle: "1과목",
    groupId: "group-weak",
    groupTitle: "취약 중주제",
    conceptId: "concept-weak",
    conceptTitle: "취약 소주제",
    keywords: ["압력", "유량"],
    groupHref: "/written/theory/family/group-weak/foundation",
    conceptHref: "/written/theory/lesson-weak",
  },
  {
    questionId: "q-2",
    subjectId: "subject-1",
    subjectTitle: "1과목",
    groupId: "group-weak",
    groupTitle: "취약 중주제",
    conceptId: "concept-weak",
    conceptTitle: "취약 소주제",
    keywords: ["압력", "유량"],
    groupHref: "/written/theory/family/group-weak/foundation",
    conceptHref: "/written/theory/lesson-weak",
  },
  {
    questionId: "q-3",
    subjectId: "subject-2",
    subjectTitle: "2과목",
    groupId: "group-strong",
    groupTitle: "강점 중주제",
    conceptId: "concept-strong",
    conceptTitle: "강점 소주제",
    keywords: ["용접", "아크"],
    groupHref: "/written/theory/family/group-strong/process",
    conceptHref: "/written/theory/lesson-strong",
  },
];

function attempt(
  questionId: string,
  isCorrect: boolean,
  sessionId: string,
): AccountLearningAttempt {
  return {
    questionId,
    isCorrect,
    sessionId,
    attemptedAt: "2026-08-01T00:00:00.000Z",
  };
}

describe("account learning summary", () => {
  it("ranks weak middle and small topics while preserving mock session counts", () => {
    const summary = buildAccountLearningSummary(
      [
        attempt("q-1", false, "session-a"),
        attempt("q-2", false, "session-a"),
        attempt("q-1", true, "session-b"),
        attempt("q-3", true, "session-b"),
        attempt("q-3", true, "session-b"),
        attempt("q-3", true, "session-b"),
      ],
      metadata,
    );

    expect(summary).toMatchObject({
      mockSessions: 2,
      attempts: 6,
      correct: 4,
      wrong: 2,
      accuracy: 67,
    });
    expect(summary.weakGroups[0]).toMatchObject({
      id: "group-weak",
      attempts: 3,
      accuracy: 33,
    });
    expect(summary.strongGroups[0]).toMatchObject({
      id: "group-strong",
      attempts: 3,
      accuracy: 100,
    });
    expect(summary.weakConcepts[0].id).toBe("concept-weak");
    expect(summary.weakConcepts[0].href).toBe(
      "/written/theory/lesson-weak",
    );
    expect(summary.focusKeywords).toEqual(["압력", "유량"]);
  });

  it("does not label a middle or small topic weak at 70 percent or above", () => {
    const attempts = [
      ...Array.from({ length: 7 }, () =>
        attempt("q-3", true, "session-strong"),
      ),
      ...Array.from({ length: 3 }, () =>
        attempt("q-3", false, "session-strong"),
      ),
    ];

    const summary = buildAccountLearningSummary(attempts, metadata);

    expect(summary.weakGroups).toEqual([]);
    expect(summary.weakConcepts).toEqual([]);
    expect(summary.strongGroups[0]).toMatchObject({
      id: "group-strong",
      accuracy: 70,
    });
  });

  it("ignores attempts that cannot be matched to published question metadata", () => {
    const summary = buildAccountLearningSummary(
      [attempt("missing", false, "session-a")],
      metadata,
    );

    expect(summary.attempts).toBe(0);
    expect(summary.accuracy).toBeNull();
    expect(summary.subjects).toEqual([]);
  });

  it("includes merged device attempts without counting them as mock sessions", () => {
    const summary = buildAccountLearningSummary(
      [
        {
          ...attempt("q-1", false, "placeholder"),
          sessionId: null,
        },
        {
          ...attempt("q-2", false, "placeholder"),
          sessionId: null,
        },
      ],
      metadata,
    );

    expect(summary.mockSessions).toBe(0);
    expect(summary.attempts).toBe(2);
    expect(summary.weakGroups[0]?.id).toBe("group-weak");
  });
});
