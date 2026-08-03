import { expect, test } from "@playwright/test";

const SESSION_PREFIX = "seolbi:practice:";

type SessionResponse = {
  sessionId: string;
  shuffleChoices: boolean;
  questions: Array<{
    id: string;
    choices: Array<{ id: string; order: number; text: string }>;
  }>;
};

test("custom mock compacts only owned storage, sends both shuffle values, and resumes its stable choice IDs", async ({
  page,
  request,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("qa:practice-storage-seeded") === "true") {
      return;
    }
    localStorage.setItem("qa:practice-storage-seeded", "true");
    localStorage.setItem(
      "seolbi:practice:oldest",
      JSON.stringify({
        version: 1,
        savedAt: "2026-01-01T00:00:00.000Z",
        session: { sessionId: "oldest", questions: [] },
      }),
    );
    localStorage.setItem(
      "seolbi:practice:middle",
      JSON.stringify({
        version: 1,
        savedAt: "2026-01-02T00:00:00.000Z",
        session: { sessionId: "middle", questions: [] },
      }),
    );
    localStorage.setItem(
      "seolbi:practice:newest",
      JSON.stringify({
        version: 1,
        savedAt: "2026-01-03T00:00:00.000Z",
        session: { sessionId: "newest", questions: [] },
      }),
    );
    localStorage.setItem("unrelated:preference", "preserve-me");
  });

  await page.goto("/written/mock");
  await expect(
    page.getByText("기출 원장 1,921문제는 전부 보존합니다.", {
      exact: false,
    }),
  ).toBeVisible();
  const customMock = page.locator('section[aria-labelledby="custom-mock-title"]');
  const shuffle = customMock.getByRole("checkbox", { name: /보기 순서 섞기/ });
  await expect(shuffle).toBeChecked();
  await expect(
    customMock.getByRole("button", { name: /커스텀 모의고사 시작/ }),
  ).toBeEnabled();

  const enabledRequest = page.waitForRequest(
    (candidate) =>
      candidate.url().includes("/api/practice/session") &&
      candidate.method() === "POST",
  );
  const enabledResponse = page.waitForResponse(
    (candidate) =>
      candidate.url().includes("/api/practice/session") &&
      candidate.request().method() === "POST",
  );
  await customMock.getByRole("button", { name: /커스텀 모의고사 시작/ }).click();
  expect((await enabledRequest).postDataJSON()).toMatchObject({
    mode: "mock",
    shuffleChoices: true,
  });
  const session = (await (await enabledResponse).json()) as SessionResponse;
  expect(session.shuffleChoices).toBe(true);
  expect(session.questions.length).toBeGreaterThan(0);
  await expect(page).toHaveURL(
    new RegExp(`/written/practice/random\\?resume=${session.sessionId}&index=0`),
  );

  const persistedChoices = await page.evaluate(
    ({ key }) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw).session.questions[0].choices : null;
    },
    { key: `${SESSION_PREFIX}${session.sessionId}` },
  );
  expect(persistedChoices).toEqual(session.questions[0]?.choices);
  await expect(page.getByRole("button", { name: "답안 제출" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "답안 제출" })).toBeVisible();
  const resumedChoices = await page.evaluate(
    ({ key }) => JSON.parse(localStorage.getItem(key) ?? "null")?.session.questions[0].choices,
    { key: `${SESSION_PREFIX}${session.sessionId}` },
  );
  expect(resumedChoices).toEqual(persistedChoices);
  expect(
    await page.evaluate(() => localStorage.getItem("unrelated:preference")),
  ).toBe("preserve-me");
  expect(
    await page.evaluate(() =>
      Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
        (key) => key?.startsWith("seolbi:practice:"),
      ),
    ),
  ).toHaveLength(3);

  const grades = await Promise.all(
    (session.questions[0]?.choices ?? []).map(async (choice) => {
      const response = await request.post("/api/practice/submit", {
        data: {
          questionId: session.questions[0]?.id,
          choiceId: choice.id,
          selfRating: "unsure",
          attemptKind: "initial",
        },
      });
      expect(response.ok()).toBeTruthy();
      return response.json() as Promise<{ isCorrect: boolean }>;
    }),
  );
  expect(grades.filter((grade) => grade.isCorrect)).toHaveLength(1);

  await page.goto("/written/mock");
  const disabledCustomMock = page.locator('section[aria-labelledby="custom-mock-title"]');
  await disabledCustomMock.getByRole("checkbox", { name: /보기 순서 섞기/ }).uncheck();
  const disabledRequest = page.waitForRequest(
    (candidate) =>
      candidate.url().includes("/api/practice/session") &&
      candidate.method() === "POST",
  );
  await disabledCustomMock.getByRole("button", { name: /커스텀 모의고사 시작/ }).click();
  expect((await disabledRequest).postDataJSON()).toMatchObject({
    mode: "mock",
    shuffleChoices: false,
  });
});

test("random practice exposes the choice-shuffle control when the feature is enabled", async ({
  page,
}) => {
  await page.goto("/written/practice/random");
  await expect(
    page.getByRole("checkbox", { name: /보기 순서 섞기/ }),
  ).toBeVisible();
});
