import { describe, expect, it } from "vitest";
import {
  guestAttemptSchema,
  loginSchema,
  registerSchema,
  submitAnswerSchema,
  usernameSchema,
} from "@/lib/validation/auth";

describe("username account validation", () => {
  it("normalizes case and accepts only the allowed identifier alphabet", () => {
    expect(usernameSchema.parse("User_01")).toBe("user_01");
    expect(usernameSchema.safeParse("한글아이디").success).toBe(false);
    expect(usernameSchema.safeParse("abc").success).toBe(false);
  });
  it("requires matching passwords and policy acceptance", () => {
    expect(registerSchema.safeParse({ username: "user_01", password: "password1", passwordConfirm: "password2", policyAccepted: true }).success).toBe(false);
    expect(registerSchema.safeParse({ username: "user_01", password: "password1", passwordConfirm: "password1", policyAccepted: false }).success).toBe(false);
  });
  it("uses the same credential shape regardless of whether a user exists", () => {
    expect(loginSchema.parse({ username: "USER_01", password: "password1" })).toEqual({ username: "user_01", password: "password1" });
  });
});

describe("practice attempt validation", () => {
  const clientAttemptId = "40000000-0000-4000-8000-000000000001";

  it("requires a UUID idempotency key for direct submissions", () => {
    const base = {
      questionId: "U-001",
      choiceId: "U-001-c1",
      selfRating: "unknown" as const,
      attemptKind: "initial" as const,
    };
    expect(
      submitAnswerSchema.safeParse({ ...base, clientAttemptId }).success,
    ).toBe(true);
    expect(submitAnswerSchema.safeParse(base).success).toBe(false);
    expect(
      submitAnswerSchema.safeParse({ ...base, clientAttemptId: "bad" }).success,
    ).toBe(false);
  });

  it("accepts legacy guest records but validates current client ids", () => {
    const base = {
      questionId: "U-001",
      selectedChoiceId: "U-001-c1",
      isCorrect: false,
      selfRating: "unknown" as const,
      attemptKind: "initial" as const,
    };
    expect(guestAttemptSchema.safeParse(base).success).toBe(true);
    expect(
      guestAttemptSchema.safeParse({ ...base, clientAttemptId }).success,
    ).toBe(true);
    expect(
      guestAttemptSchema.safeParse({ ...base, clientAttemptId: "bad" }).success,
    ).toBe(false);
  });
});

