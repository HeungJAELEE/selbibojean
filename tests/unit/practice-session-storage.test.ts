import { describe, expect, it } from "vitest";
import {
  hasCompletePracticeQuestionMapping,
  loadPracticeSession,
  PRACTICE_SESSION_PREFIX,
  PRACTICE_SESSION_STORAGE_ERROR,
  preparePracticeSessionStorage,
  savePracticeSession,
} from "@/lib/learning/practice-session-storage";
import {
  appendGuestLearningAttempt,
  GUEST_ATTEMPTS_KEY,
  MAX_GUEST_LEARNING_ATTEMPTS,
  parseGuestLearningAttempts,
} from "@/lib/learning/guest-attempt-storage";

class TestStorage implements Storage {
  private readonly values = new Map<string, string>();
  quotaFailures = 0;

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    if (key.startsWith(PRACTICE_SESSION_PREFIX) && this.quotaFailures > 0) {
      this.quotaFailures -= 1;
      const error = new DOMException("quota", "QuotaExceededError");
      throw error;
    }
    this.values.set(key, value);
  }
}

function attempt(index: number) {
  return {
    questionId: `question-${index}`,
    selectedChoiceId: `choice-${index}`,
    isCorrect: index % 2 === 0,
    selfRating: "unsure" as const,
    attemptKind: "initial" as const,
    attemptedAt: new Date(index * 1000).toISOString(),
    dueAt: new Date(index * 2000).toISOString(),
  };
}

describe("practice session storage mapping", () => {
  it("accepts a complete account-storage mapping regardless of row order", () => {
    expect(
      hasCompletePracticeQuestionMapping(
        ["Q-1", "Q-2"],
        [
          { external_id: "Q-2" },
          { external_id: "Q-1" },
        ],
      ),
    ).toBe(true);
  });

  it("rejects a partial mapping so the session can stay on the device", () => {
    expect(
      hasCompletePracticeQuestionMapping(
        ["Q-1", "Q-2"],
        [{ external_id: "Q-1" }],
      ),
    ).toBe(false);
  });

  it("keeps the current practice session and at most two recent sessions", () => {
    const storage = new TestStorage();
    storage.setItem("unrelated:key", "must-stay");

    for (let index = 0; index < 5; index += 1) {
      savePracticeSession(
        storage,
        `session-${index}`,
        { sessionId: `session-${index}` },
        new Date(index * 1000),
      );
    }

    const practiceKeys = Array.from(
      { length: storage.length },
      (_, index) => storage.key(index),
    ).filter((key): key is string =>
      Boolean(key?.startsWith(PRACTICE_SESSION_PREFIX)),
    );
    expect(practiceKeys).toHaveLength(3);
    expect(practiceKeys).toEqual(
      expect.arrayContaining([
        `${PRACTICE_SESSION_PREFIX}session-2`,
        `${PRACTICE_SESSION_PREFIX}session-3`,
        `${PRACTICE_SESSION_PREFIX}session-4`,
      ]),
    );
    expect(storage.getItem("unrelated:key")).toBe("must-stay");
    expect(loadPracticeSession(storage, "session-4")).toEqual({
      sessionId: "session-4",
    });
  });

  it("pre-compacts to two owned sessions before creating a server session", () => {
    const storage = new TestStorage();
    storage.setItem("another-app", "preserved");
    for (let index = 0; index < 4; index += 1) {
      savePracticeSession(
        storage,
        `session-${index}`,
        { sessionId: `session-${index}` },
        new Date(index * 1000),
      );
    }

    preparePracticeSessionStorage(storage);

    const practiceKeys = Array.from(
      { length: storage.length },
      (_, index) => storage.key(index),
    ).filter((key) => key?.startsWith(PRACTICE_SESSION_PREFIX));
    expect(practiceKeys).toHaveLength(2);
    expect(storage.getItem("another-app")).toBe("preserved");
  });

  it("compacts 501 guest attempts and retries a quota failure once", () => {
    const storage = new TestStorage();
    storage.setItem(
      GUEST_ATTEMPTS_KEY,
      JSON.stringify(
        Array.from(
          { length: MAX_GUEST_LEARNING_ATTEMPTS + 1 },
          (_, index) => attempt(index),
        ),
      ),
    );
    storage.setItem("unrelated:key", "preserved");
    storage.quotaFailures = 1;

    savePracticeSession(storage, "recovered", { sessionId: "recovered" });

    expect(
      parseGuestLearningAttempts(storage.getItem(GUEST_ATTEMPTS_KEY)),
    ).toHaveLength(MAX_GUEST_LEARNING_ATTEMPTS);
    expect(loadPracticeSession(storage, "recovered")).toEqual({
      sessionId: "recovered",
    });
    expect(storage.getItem("unrelated:key")).toBe("preserved");
  });

  it("returns a stable Korean error when the one quota retry also fails", () => {
    const storage = new TestStorage();
    storage.setItem("unrelated:key", "preserved");
    storage.quotaFailures = 2;

    expect(() =>
      savePracticeSession(storage, "failed", { sessionId: "failed" }),
    ).toThrow(PRACTICE_SESSION_STORAGE_ERROR);
    expect(storage.getItem("unrelated:key")).toBe("preserved");
  });

  it("bounds guest appends to the most recent 500 attempts", () => {
    const storage = new TestStorage();
    storage.setItem(
      GUEST_ATTEMPTS_KEY,
      JSON.stringify(
        Array.from(
          { length: MAX_GUEST_LEARNING_ATTEMPTS },
          (_, index) => attempt(index),
        ),
      ),
    );

    appendGuestLearningAttempt(
      storage,
      attempt(MAX_GUEST_LEARNING_ATTEMPTS),
    );

    const stored = parseGuestLearningAttempts(
      storage.getItem(GUEST_ATTEMPTS_KEY),
    );
    expect(stored).toHaveLength(MAX_GUEST_LEARNING_ATTEMPTS);
    expect(stored[0]?.questionId).toBe("question-1");
    expect(stored.at(-1)?.questionId).toBe("question-500");
  });

  it("resumes the saved shuffle setting and stable choice order unchanged", () => {
    const storage = new TestStorage();
    const session = {
      sessionId: "stable-order",
      shuffleChoices: true,
      questions: [
        {
          id: "question-1",
          choices: [
            { id: "choice-c", order: 1 },
            { id: "choice-a", order: 2 },
            { id: "choice-b", order: 3 },
          ],
        },
      ],
    };

    savePracticeSession(storage, session.sessionId, session);

    expect(loadPracticeSession(storage, session.sessionId)).toEqual(session);
  });
});
