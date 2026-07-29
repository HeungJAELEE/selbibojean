import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("BDA 홈에서 이론과 문제로 이동할 수 있다", async ({ page }) => {
  await page.goto("/bda");

  await expect(
    page.getByRole("heading", { name: /개념을 이해하고/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "필기 총정리" }).first(),
  ).toHaveAttribute("href", "/bda/written");
  await expect(page.getByText("587", { exact: true })).toBeVisible();
});

test("BDA 문제 페이지와 API는 제출 전 정답을 노출하지 않는다", async ({
  page,
  request,
}) => {
  const pageResponse = await request.get("/bda/written/practice/bda-q001");
  expect(pageResponse.ok()).toBeTruthy();
  const html = await pageResponse.text();
  expect(html).not.toContain("correctChoiceId");
  expect(html).not.toContain("DIKW는 Data, Information");

  await page.goto("/bda/written/practice/bda-q001");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /DIKW 계층/,
    }),
  ).toBeVisible();
  await expect(page.getByText("정답 해설", { exact: true })).toHaveCount(0);
  const choice = page
    .getByRole("group", { name: "문제 보기" })
    .getByRole("button")
    .first();
  await expect(choice).toBeEnabled();
  await choice.click();
  const submit = page.getByRole("button", { name: "답안 제출" });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText("정답입니다.", { exact: true })).toBeVisible();
  await expect(page.getByText("정답 해설", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /연결 이론 복습/ }),
  ).toHaveAttribute(
    "href",
    "/bda/written/theory/bda-s1-data-dikw#exam-traps",
  );
});

test("유효하지 않은 BDA 선택지는 거부한다", async ({ request }) => {
  const response = await request.post("/api/bda/practice/submit", {
    data: { questionId: "bda-q001", choiceId: "invalid" },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: "유효한 선택지가 아닙니다.",
  });
});

test("개념 연결 문제는 같은 화면에서 펼치고 제출 후 선택지별 근거를 보여 준다", async ({
  page,
}) => {
  await page.goto("/bda/concepts/C001");
  await expect(
    page.getByRole("heading", { name: "자체 제작 모의문제 5개" }),
  ).toBeVisible();

  const firstProblem = page.locator("#concept-practice details").filter({
    has: page.getByText(/공개 복원·교재 기반 1 ·/),
  }).first();
  await firstProblem.locator("summary").click();

  const choices = firstProblem.getByRole("radio");
  await expect(choices).toHaveCount(4);
  const firstChoice = choices.first();
  await expect(firstChoice).toBeEnabled();
  await firstChoice.click();
  await expect(firstChoice).toHaveAttribute("aria-checked", "true");
  const submit = firstProblem.getByRole("button", {
    name: "선택한 보기 제출",
  });
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(firstProblem.getByText("선택지별 근거")).toBeVisible();
  await expect(firstProblem.getByText(/1번 · (정답|오답) 근거/)).toBeVisible();
  await expect(
    firstProblem.getByRole("button", { name: "다시 풀기" }),
  ).toBeVisible();
});

test("BDA 핵심 화면은 5개 기준 폭에서 가로 넘침과 Mermaid 오류가 없다", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "기준 폭 행렬은 데스크톱 Chromium 프로젝트에서 한 번만 실행합니다.",
  );

  const widths = [1440, 1024, 768, 390, 320];
  const routes = [
    "/bda/concepts/C001",
    "/bda/practical/classification-pipeline",
    "/bda/textbook/bda-s1",
  ];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }));
      expect(
        dimensions.documentWidth,
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
      await expect(page.getByText("Syntax error in text")).toHaveCount(0);
      await expect(page.getByText(/mermaid version/i)).toHaveCount(0);
      await expect(page.getByText("Notion 원천", { exact: false })).toHaveCount(
        0,
      );
    }
  }
});

test("BDA 공개 경로는 설비보전 콘텐츠와 분리되고 접근성 차단 이슈가 없다", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  test.skip(
    testInfo.project.name !== "chromium",
    "접근성 전체 검사는 Chromium에서 한 번만 수행합니다.",
  );

  for (const legacyRoute of ["/written/theory", "/practical"]) {
    await page.goto(legacyRoute);
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: /개념을 이해하고/ }),
    ).toBeVisible();
  }

  for (const route of [
    "/bda",
    "/bda/concepts/C001",
    "/bda/practical",
    "/bda/textbook/bda-s1",
  ]) {
    await page.goto(route);
    await expect(page.getByText(/설비보전|용접|유압|공압/)).toHaveCount(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((violation) =>
        ["critical", "serious"].includes(violation.impact ?? ""),
      ),
      `${route} critical/serious accessibility violations`,
    ).toEqual([]);
  }
});
