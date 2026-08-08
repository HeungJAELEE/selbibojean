import { describe, expect, it } from "vitest";
import { parseGuestLearningAttempts } from "@/lib/learning/guest-attempt-storage";

const base = {
  questionId: "U-001",
  selectedChoiceId: "U-001-c1",
  isCorrect: false,
  selfRating: "unknown",
  attemptKind: "initial",
};

describe("guest attempt storage", () => {
  it("preserves a valid client attempt id", () => {
    const clientAttemptId = "40000000-0000-4000-8000-000000000001";
    expect(
      parseGuestLearningAttempts(
        JSON.stringify([{ ...base, clientAttemptId }]),
      )[0]?.clientAttemptId,
    ).toBe(clientAttemptId);
  });

  it("keeps legacy attempts mergeable and discards malformed ids", () => {
    expect(parseGuestLearningAttempts(JSON.stringify([base]))[0])
      .not.toHaveProperty("clientAttemptId", expect.any(String));
    expect(
      parseGuestLearningAttempts(
        JSON.stringify([{ ...base, clientAttemptId: "not-a-uuid" }]),
      )[0]?.clientAttemptId,
    ).toBeUndefined();
  });
});
