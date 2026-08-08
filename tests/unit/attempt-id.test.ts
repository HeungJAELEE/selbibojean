import { describe, expect, it } from "vitest";
import { deriveLegacyAttemptId } from "@/lib/learning/attempt-id";

const attempt = {
  questionId: "U-001",
  selectedChoiceId: "U-001-c2",
  selfRating: "unsure",
  attemptKind: "initial",
  attemptedAt: "2026-08-01T00:00:00.000Z",
  dueAt: "2026-08-04T00:00:00.000Z",
};

describe("legacy guest attempt id", () => {
  it("is stable for the same retry payload and uses UUID version 5", () => {
    const first = deriveLegacyAttemptId(attempt);
    expect(deriveLegacyAttemptId(attempt)).toBe(first);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("is independent of merge-array ordering and separates distinct attempts", () => {
    expect(
      deriveLegacyAttemptId({ ...attempt, selectedChoiceId: "U-001-c3" }),
    ).not.toBe(deriveLegacyAttemptId(attempt));
    expect(
      deriveLegacyAttemptId({
        ...attempt,
        attemptedAt: "2026-08-01T00:01:00.000Z",
      }),
    ).not.toBe(deriveLegacyAttemptId(attempt));
  });
});
