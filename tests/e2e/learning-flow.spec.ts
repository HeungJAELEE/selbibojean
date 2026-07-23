import { expect, test } from "@playwright/test";

test("home exposes the main learning paths", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("설비보전기사 마스터북");
  await expect(page.getByRole("link", { name: "설비보전기사 마스터북 홈" })).toContainText("설비보전기사");
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
  expect(body.questions.filter((question: { provenance: { original: boolean } }) => question.provenance.original)).toHaveLength(10);
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

test("an actual past exam presentation remains gradeable through the canonical answer", async ({ request }) => {
  const session = await (await request.post("/api/practice/session", {
    data: { mode: "all", count: 20, seed: 20260723, composition: "original" },
  })).json();
  const question = session.questions.find((candidate: { provenance: { original: boolean } }) => candidate.provenance.original);
  expect(question).toBeTruthy();
  expect(question.provenance.exam.sourceUrl).toMatch(/^https?:\/\//);

  const results = [];
  for (const choice of question.choices) {
    const response = await request.post("/api/practice/submit", {
      data: { questionId: question.id, choiceId: choice.id, selfRating: "unsure", attemptKind: "initial" },
    });
    expect(response.ok()).toBeTruthy();
    results.push(await response.json());
  }
  expect(results.filter((result) => result.isCorrect)).toHaveLength(1);
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

test("lesson formulas render as readable math instead of raw LaTeX", async ({ page }) => {
  await page.goto("/written/theory/lesson-tcxwqa");

  const formula = page.locator(".katex").filter({ hasText: "Q" }).first();
  await expect(formula).toBeVisible();
  await expect(page.getByText(String.raw`$Q\propto\sqrt{\Delta p}$`, { exact: true })).toHaveCount(0);
  await expect(page.locator(".katex-mathml math").first()).toHaveCount(1);
});

test("lesson flows from concept to actual past exams and similar practice", async ({ page }) => {
  await page.goto("/written/theory/lesson-tcxwqa");

  await expect(page.getByRole("heading", { name: "개념부터 이해하기" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "실제 기출 원문으로 확인하기" })).toBeVisible();
  await expect(page.getByTestId("past-exam-2018-2-Q88")).toBeVisible();
  await expect(page.getByText("2018년 2회 · 88번", { exact: true })).toBeVisible();

  const practiceSet = page.getByTestId("lesson-practice-set");
  await expect(practiceSet.getByRole("heading", { name: "실전 유사 문제 풀기" })).toBeVisible();
  await expect(practiceSet.getByRole("link").first()).toHaveAttribute("href", "/written/practice/U-748");
  await expect(practiceSet).toContainText("답을 제출하기 전에는 정답과 해설을 전송하지 않습니다.");
});

test("lesson past exams show three previews and reveal the rest in batches", async ({ page }) => {
  await page.goto("/written/theory/lesson-ds62tl");
  const section = page.locator("#past-exams");
  await expect(section.locator("details")).toHaveCount(3);

  for (let index = 0; index < 4; index += 1) {
    await section.getByTestId("past-exam-more").click();
  }

  await expect(section.locator("details")).toHaveCount(14);
  await expect(section.getByRole("button", { name: "처음 3개만 보기" })).toBeVisible();
});

test("mobile header exposes the complete navigation", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 768, "mobile-only navigation check");
  await page.goto("/");
  const menu = page.getByRole("button", { name: "메뉴 열기" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole("navigation", { name: "모바일 주 메뉴" })).toBeVisible();
  await expect(page.getByRole("link", { name: "통합 검색" })).toBeVisible();
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
