import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{4,20}$/, "아이디는 소문자 영문, 숫자, 밑줄 4~20자로 입력하세요.");

export const passwordSchema = z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").max(72);

export const guestAttemptSchema = z
  .object({
    clientAttemptId: z.uuid().optional(),
    questionId: z.string().min(1),
    questionVariantExternalId: z.string().min(1).optional(),
    selectedChoiceId: z.string().min(1),
    isCorrect: z.boolean(),
    selfRating: z.enum(["unknown", "unsure", "known"]),
    attemptKind: z.enum(["initial", "retry"]).default("initial"),
    attemptedAt: z.string().datetime().optional(),
    dueAt: z.string().datetime().optional(),
  })
  .strict();

export const guestLearningMergeSchema = z
  .object({
    attempts: z.array(guestAttemptSchema).min(1).max(500),
  })
  .strict();

export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    policyAccepted: z.literal(true, { error: "복구 불가 및 비활동 삭제 정책에 동의해야 합니다." }),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export const loginSchema = z.object({ username: usernameSchema, password: passwordSchema });

export const submitAnswerSchema = z
  .object({
    clientAttemptId: z.uuid(),
    questionId: z.string().min(1),
    questionVariantExternalId: z.string().min(1).optional(),
    choiceId: z.string().min(1),
    selfRating: z.enum(["unknown", "unsure", "known"]),
    sessionId: z.uuid().optional(),
    attemptKind: z.enum(["initial", "retry"]).default("initial"),
  })
  .strict();
