import type { SelfRating } from "./types";

export const DEFAULT_REVIEW_POLICY = {
  incorrectMinutes: 10,
  correctUnknownDays: 1,
  correctUnsureDays: 3,
  correctKnownDays: 7,
  knownStreakTwoDays: 14,
  knownStreakThreeDays: 30,
} as const;

export function calculateNextReview(
  attemptedAt: Date,
  isCorrect: boolean,
  selfRating: SelfRating,
  correctKnownStreak: number,
  policy = DEFAULT_REVIEW_POLICY,
) {
  const dueAt = new Date(attemptedAt);
  if (!isCorrect) {
    dueAt.setMinutes(dueAt.getMinutes() + policy.incorrectMinutes);
    return dueAt;
  }

  const days =
    selfRating === "unknown"
      ? policy.correctUnknownDays
      : selfRating === "unsure"
        ? policy.correctUnsureDays
        : correctKnownStreak >= 3
          ? policy.knownStreakThreeDays
          : correctKnownStreak === 2
            ? policy.knownStreakTwoDays
            : policy.correctKnownDays;
  dueAt.setDate(dueAt.getDate() + days);
  return dueAt;
}

export const INACTIVITY_HOURS = 168;

export function isPurgeEligible(lastActivityAt: Date, now: Date) {
  return now.getTime() - lastActivityAt.getTime() >= INACTIVITY_HOURS * 60 * 60 * 1000;
}

export function inactivityRemaining(lastActivityAt: Date, now: Date) {
  return Math.max(0, INACTIVITY_HOURS * 60 * 60 * 1000 - (now.getTime() - lastActivityAt.getTime()));
}

