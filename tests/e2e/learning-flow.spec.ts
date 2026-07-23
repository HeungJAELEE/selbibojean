import { expect, test } from "@playwright/test";

test("home exposes the main learning paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /문제를 맞히는 데서/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /랜덤 20문제 시작/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "이론 목차 보기", exact: true })).toBeVisible();
});

test("practice session is answer-safe and contains no duplicate question", async ({ request }) => {
  const response = await request.post("/api/practice/session", { data: { mode: "all", count: 20, seed: 12345 } });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.questions).toHaveLength(20);
  expect(new Set(body.questions.map((question: { id: string }) => question.id)).size).toBe(20);
  const serialized = JSON.stringify(body);
  expect(serialized).not.toContain("correctChoiceId");
  expect(serialized).not.toContain("answerText");
  expect(serialized).not.toContain("plausibleReason");
  expect(serialized).not.toContain("sourceUrls");
  expect(serialized).not.toContain("source_backed_reconstruction");
  expect(body.questions.every((question: { provenance?: { reconstructed: boolean; historical: boolean } }) =>
    typeof question.provenance?.reconstructed === "boolean" && typeof question.provenance?.historical === "boolean",
  )).toBe(true);
});

test("admin review queue exposes every intentionally blocked item with evidence links", async ({ page }) => {
  await page.goto("/admin/review");
  await expect(page.getByRole("heading", { name: "공식 출처·원문 자산 검수 대기" })).toBeVisible();
    await expect(page.locator("article")).toHaveCount(82);
  await expect(page.getByRole("link", { name: /Q-Net 설비보전기사 출제기준/ })).toBeVisible();
});

test("theory index groups lessons into semantic category disclosures", async ({ page }) => {
  await page.goto("/written/theory");

  const lubricantCategories = page.getByTestId("lesson-categories-s4-g14");
  await expect(lubricantCategories).toBeVisible();
  await expect(page.getByTestId("lesson-category-s4-g14-degradation").locator("summary")).toContainText("열화·산화·유화·오염");
  await expect(page.getByTestId("lesson-category-s4-g14-grease").locator("summary")).toContainText("그리스 종류·특성·급유");
  await expect(page.getByTestId("lesson-category-s4-g14-additive").locator("summary")).toContainText("윤활유 첨가제");
  await expect(page.getByTestId("lesson-category-s4-g14-test").locator("summary")).toContainText("시험·판정·시료채취");

  const degradation = page.getByTestId("lesson-category-s4-g14-degradation");
  await expect(degradation).not.toHaveAttribute("open", "");
  await degradation.locator("summary").click();
  await expect(degradation.locator("ul")).toBeVisible();
  await expect(degradation.getByRole("link", { name: "윤활유 열화판정", exact: true })).toBeVisible();
});

test("wrong answer links to a theory anchor", async ({ request }) => {
  const session = await (await request.post("/api/practice/session", { data: { mode: "all", count: 10, seed: 7 } })).json();
  const question = session.questions[0];
  const response = await request.post("/api/practice/submit", {
    data: { questionId: question.id, choiceId: question.choices[1].id, selfRating: "unsure", attemptKind: "initial" },
  });
  expect(response.ok()).toBeTruthy();
  const feedback = await response.json();
  expect(feedback.lesson.href).toMatch(/^\/written\/theory\/.+#(principle|formula|diagnosis|trap|source)$/);
  expect(feedback.selectedChoice.keyRule).toBeTruthy();
  expect(feedback.conceptSupport?.summary).toHaveLength(3);
  expect(feedback.conceptSupport?.blocks.length).toBeGreaterThan(0);
});

test("theory remediation preserves a return-to-retry location", async ({ page, request }) => {
  const session = await (await request.post("/api/practice/session", { data: { mode: "all", count: 10, seed: 11 } })).json();
  const question = session.questions[0];
  let feedback;
  for (const choice of question.choices) {
    const result = await request.post("/api/practice/submit", {
      data: { questionId: question.id, choiceId: choice.id, selfRating: "unsure", attemptKind: "initial" },
    });
    const candidate = await result.json();
    if (!candidate.isCorrect) { feedback = candidate; break; }
  }
  expect(feedback).toBeTruthy();
  const returnTo = `/written/practice/random?resume=${session.sessionId}&index=0&retry=${question.id}`;
  await page.goto(`/written/theory/${feedback.lesson.id}?returnTo=${encodeURIComponent(returnTo)}#${feedback.lesson.anchor}`);
  const returnLink = page.getByRole("link", { name: /문제로 돌아가/ });
  await expect(returnLink).toBeVisible();
  await Promise.all([
    page.waitForURL(new RegExp(`resume=${session.sessionId}`), { timeout: 15_000 }),
    returnLink.click(),
  ]);
});
