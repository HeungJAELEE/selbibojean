import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const forbiddenAnswerFields = [
  "correctChoiceId",
  "acceptedAnswers",
  "choiceFeedback",
  "explanation",
];

test("reviewed CBT release creates only prompt-safe public sessions", async ({
  request,
}) => {
  for (const mode of ["all", "mock"] as const) {
    const response = await request.post("/api/practice/session", {
      data:
        mode === "mock"
          ? {
              mode,
              count: 80,
              originalRatio: 100,
              seed: 20260808,
              subjectAllocations: [1, 2, 3, 4].map((code) => ({
                subjectId: `subject-${code}`,
                count: 20,
              })),
            }
          : {
              mode,
              count: 20,
              originalRatio: 100,
              seed: 20260808,
            },
    });

    expect(response.ok()).toBeTruthy();
    const session = await response.json();
    expect(session.questions.length).toBeGreaterThan(0);
    expect(new Set(session.questions.map((item: { id: string }) => item.id)).size)
      .toBe(session.questions.length);
    expect(session.actualOriginalCount).toBe(session.questions.length);

    const serialized = JSON.stringify(session.questions);
    for (const field of forbiddenAnswerFields) {
      expect(serialized).not.toContain(field);
    }
  }
});

test("direct data assets remain inaccessible through the production-like worker", async ({
  request,
}) => {
  for (const pathname of [
    "/data/content-manifest.json",
    "/data/content.json",
    "/data/content.bin",
  ]) {
    const response = await request.get(pathname);
    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"] ?? "").toContain("no-store");
  }
});

test("invalid and unavailable submissions do not disclose grading data", async ({
  request,
}) => {
  const invalid = await request.post("/api/practice/submit", { data: {} });
  expect(invalid.status()).toBe(400);
  expect(JSON.stringify(await invalid.json())).not.toMatch(
    /correctChoiceId|choiceFeedback|explanation/,
  );

  const unavailable = await request.post("/api/practice/submit", {
    data: {
      clientAttemptId: randomUUID(),
      questionId: "cbt-release-non-published-sentinel",
      choiceId: "cbt-release-non-published-sentinel-c1",
      selfRating: "unknown",
      attemptKind: "initial",
    },
  });
  expect([400, 404]).toContain(unavailable.status());
  expect(JSON.stringify(await unavailable.json())).not.toMatch(
    /correctChoiceId|choiceFeedback|explanation/,
  );
});


test("guest submission reveals feedback only after a prompt-safe session", async ({
  request,
}) => {
  const sessionResponse = await request.post("/api/practice/session", {
    data: { mode: "all", count: 1, originalRatio: 100, seed: 20260809 },
  });
  expect(sessionResponse.ok()).toBeTruthy();
  const session = await sessionResponse.json();
  const question = session.questions[0];
  expect(question).toBeTruthy();
  expect(JSON.stringify(question)).not.toMatch(
    /correctChoiceId|acceptedAnswers|choiceFeedback|explanation/,
  );

  const submitResponse = await request.post("/api/practice/submit", {
    data: {
      clientAttemptId: randomUUID(),
      questionId: question.id,
      questionVariantExternalId: question.provenance.exam?.externalId,
      choiceId: question.choices[0].id,
      selfRating: "unsure",
      sessionId: session.sessionId,
      attemptKind: "initial",
    },
  });
  expect(submitResponse.ok()).toBeTruthy();
  const feedback = await submitResponse.json();
  expect(typeof feedback.isCorrect).toBe("boolean");
  expect(feedback.correctChoice).toBeTruthy();
  expect(feedback.attemptId).toBeNull();
});

test("blocked canonical questions stay unavailable and unauthenticated merges are rejected", async ({
  request,
}) => {
  for (const questionId of ["U-1161", "U-1166", "U-1089", "U-649", "U-478"]) {
    const response = await request.post("/api/practice/submit", {
      data: {
        clientAttemptId: randomUUID(),
        questionId,
        choiceId: `${questionId}-c1`,
        selfRating: "unknown",
        attemptKind: "initial",
      },
    });
    expect(response.status()).toBe(404);
    expect(JSON.stringify(await response.json())).not.toMatch(
      /correctChoiceId|choiceFeedback|explanation/,
    );
  }

  const merge = await request.post("/api/account/merge-guest-learning", {
    data: {
      attempts: [
        {
          clientAttemptId: randomUUID(),
          questionId: "U-001",
          selectedChoiceId: "U-001-c1",
          isCorrect: false,
          selfRating: "unknown",
          attemptKind: "initial",
          attemptedAt: new Date().toISOString(),
        },
      ],
    },
  });
  expect(merge.status()).toBe(401);
});

test("mobile pages do not introduce horizontal overflow", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 768, "mobile-only check");
  for (const pathname of ["/", "/written/theory", "/written/practice/random", "/written/mock"]) {
    await page.goto(pathname);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${pathname} horizontal overflow`).toBeLessThanOrEqual(1);
  }
});
