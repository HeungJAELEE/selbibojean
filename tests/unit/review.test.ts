import { describe, expect, it } from "vitest";
import { calculateNextReview, inactivityRemaining, isPurgeEligible } from "@/lib/domain/review";

describe("review policy", () => {
  const start = new Date("2026-07-22T00:00:00.000Z");
  it("schedules every wrong answer in ten minutes", () => {
    expect(calculateNextReview(start, false, "known", 10).toISOString()).toBe("2026-07-22T00:10:00.000Z");
  });
  it("expands known streaks to 14 and 30 days", () => {
    expect(calculateNextReview(start, true, "known", 2).toISOString()).toBe("2026-08-05T00:00:00.000Z");
    expect(calculateNextReview(start, true, "known", 3).toISOString()).toBe("2026-08-21T00:00:00.000Z");
  });
});

describe("168-hour inactivity boundary", () => {
  const last = new Date("2026-07-01T00:00:00.000Z");
  it("keeps an account at 167 hours 59 minutes", () => {
    const now = new Date(last.getTime() + (167 * 60 + 59) * 60_000);
    expect(isPurgeEligible(last, now)).toBe(false);
    expect(inactivityRemaining(last, now)).toBe(60_000);
  });
  it("purges an account at exactly 168 hours", () => {
    const now = new Date(last.getTime() + 168 * 60 * 60_000);
    expect(isPurgeEligible(last, now)).toBe(true);
    expect(inactivityRemaining(last, now)).toBe(0);
  });
});

