import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, usernameSchema } from "@/lib/validation/auth";

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

