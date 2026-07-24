import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("practical hub exposes the practical theory entry point", async ({
  page,
}) => {
  await page.goto("/practical");
  const theoryEntry = page.locator('a[href="/practical/written/theory"]');
  await expect(theoryEntry).toHaveCount(1);
  await expect(theoryEntry).toContainText("46");
});

test("practical theory uses the same dense subject-and-type index pattern as the written textbook", async ({
  page,
}) => {
  await page.goto("/practical/written/theory");
  await expect(
    page.locator('[data-testid^="practical-textbook-subject-subject-"]'),
  ).toHaveCount(4);
  await expect(
    page.locator('[data-testid^="practical-textbook-type-subject-"]'),
  ).toHaveCount(24);
  await expect(
    page.getByText("계산 공식", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);

  await page.goto("/practical/written/theory/subject/subject-1");
  await expect(
    page.locator('[data-testid^="practical-textbook-type-subject-1-"]'),
  ).toHaveCount(6);
  await expect(page.locator("main img")).toHaveCount(0);
});

test("formula pages contain only source-supported calculations with NCS positions", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/subject/subject-3/formula");
  await expect(page.getByText("버니어캘리퍼스", { exact: true })).toBeVisible();
  await expect(page.getByText("끼워맞춤", { exact: true })).toBeVisible();
  await expect(page.getByText("마이크로미터", { exact: true })).toBeVisible();
  await expect(page.getByText("플랜지 커플링", { exact: true })).toHaveCount(0);
  await expect(page.getByText("PDF p.84", { exact: false })).toBeVisible();
  await expect(page.getByText("PDF p.87", { exact: false })).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);

  await page.goto("/practical/written/theory/subject/subject-4/formula");
  await expect(
    page.getByText("원문으로 확인된 항목을 준비 중입니다"),
  ).toBeVisible();
  await expect(page.getByText("OEE", { exact: true })).toHaveCount(0);
});

test("hydraulic formula includes variables, units, and operating conditions", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/subject/subject-1/formula");
  await expect(page.getByText("유압실린더", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("전진추력 F₁=A₁·P·β");
  await expect(page.locator("main")).toContainText("β는 부하율(%)");
  await expect(page.locator("main")).toContainText("P[MPa]=N/mm²");
  await expect(page.getByText("PDF p.48", { exact: false })).toBeVisible();
});

test("formula pages separate NCS supplemental formulas from actual exam statistics", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/subject/subject-1/formula");
  await expect(page.getByText("공압실린더 출력", { exact: true })).toBeVisible();
  await expect(page.getByText("(+보강용)", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("F₊ = (πD²/4) × P");
  await expect(page.getByText("PDF p.24", { exact: false })).toBeVisible();

  await page.goto("/practical/written/theory/subject/subject-2/formula");
  await expect(page.getByText("탄소당량(Ceq)", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("WES Ceq = C + Mn/6");
  await expect(page.getByText("PDF p.16", { exact: false })).toBeVisible();
});

test("practical hub exposes only publishable source-backed content", async ({
  page,
}) => {
  await page.goto("/practical/written");
  await expect(page.getByText("17문제", { exact: true })).toBeVisible();
  await expect(page.getByText("39문제", { exact: true })).toBeVisible();
  await expect(
    page.locator('a[href^="/practical/written/theory/subject/subject-"]'),
  ).toHaveCount(4);
  for (const title of [
    "그림·사진 식별",
    "공식·계산",
    "이론·개념",
    "작업·절차형(필답)",
  ]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
});

test("practical category teaches NCS theory before past and predicted questions", async ({
  page,
}) => {
  await page.goto(
    "/practical/written/theory/category/formula_calculation",
  );
  const headings = page.getByRole("heading");
  await expect(headings.filter({ hasText: "연결 학습모듈과 수행내용" })).toBeVisible();
  await expect(headings.filter({ hasText: "관련 실기 이론" })).toBeVisible();
  await expect(headings.filter({ hasText: "기출복원" })).toBeVisible();
  await expect(headings.filter({ hasText: "출제예상" })).toBeVisible();
  const text = await page.locator("main").innerText();
  expect(text.indexOf("연결 학습모듈과 수행내용")).toBeLessThan(
    text.indexOf("기출복원"),
  );
  expect(text.indexOf("관련 실기 이론")).toBeLessThan(
    text.indexOf("기출복원"),
  );
});

test("NCS bearing question shows exactly the four source images used by the prompt", async ({
  page,
}) => {
  await page.goto("/practical/written/question/P-2025-1-Q04");
  const figure = page.getByTestId(
    "practical-visual-aid-ncs-bearing-four-types",
  );
  await expect(figure).toBeVisible();
  await expect(figure.getByRole("img")).toHaveCount(4);
  await expect(figure).toContainText("NCS");
  for (const [index, label] of ["가", "나", "다", "라"].entries()) {
    await expect(
      figure.getByTestId(`practical-visual-label-${index + 1}`),
    ).toHaveText(`(${label})`);
  }
  const imageSources = await figure
    .getByRole("img")
    .evaluateAll((images) =>
      images.map((image) => {
        const source = new URL((image as HTMLImageElement).src);
        return source.searchParams.get("url") ?? source.pathname;
      }),
    );
  expect(imageSources).toEqual([
    "/practical/ncs/bearing-cylindrical-roller.png",
    "/practical/ncs/bearing-tapered-roller.png",
    "/practical/ncs/bearing-thrust-ball.png",
    "/practical/ncs/bearing-thrust-needle.png",
  ]);
  const promptAlts = await figure
    .getByRole("img")
    .evaluateAll((images) => images.map((image) => image.getAttribute("alt")));
  expect(promptAlts.join(" ")).not.toMatch(
    /원통 롤러 베어링|테이퍼 롤러 베어링|스러스트 볼 베어링|스러스트 니들 베어링/,
  );

  const viewportWidth = page.viewportSize()?.width ?? 1280;
  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
});

test("practical answer and rubric remain hidden until the learner submits", async ({
  page,
}) => {
  await page.goto("/practical/written/question/P-2025-1-Q04");
  await expect(
    page.getByTestId("practical-answer-feedback"),
  ).toHaveCount(0);

  await page.locator("#practical-answer").fill("가, 나, 다, 라의 명칭과 특징");
  await page.locator("#practical-answer").locator("..").getByRole("button").click();
  await expect(page.getByTestId("practical-answer-feedback")).toBeVisible();
});

test("held practical questions stay unavailable and do not leak through the submit API", async ({
  request,
}) => {
  const route = await request.get(
    "/practical/written/question/P-2025-1-Q05",
  );
  expect(route.status()).toBe(404);

  const submit = await request.post("/api/practical/submit", {
    data: {
      questionId: "P-2025-1-Q05",
      answer: "사용자 답안",
      selfRating: "unknown",
    },
  });
  expect(submit.status()).toBe(404);
  expect(await submit.text()).not.toContain("modelAnswer");
});

test("practical submit API rejects an empty answer", async ({ request }) => {
  const submit = await request.post("/api/practical/submit", {
    data: { questionId: "P-2025-1-Q04", answer: "   " },
  });
  expect(submit.status()).toBe(400);
  expect(await submit.text()).not.toContain("modelAnswer");
});

test("image-dependent reconstructions without the exact NCS original stay held", async ({
  request,
}) => {
  for (const questionId of ["P-2025-1-Q10", "P-2025-2-Q01-1"]) {
    const route = await request.get(
      `/practical/written/question/${questionId}`,
    );
    expect(route.status()).toBe(404);
  }
});

test("predicted questions are labelled without a fabricated occurrence", async ({
  page,
}) => {
  await page.goto("/practical/written/question/EXP-B01");
  await expect(page.getByText("(출제 예상)", { exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/20\d{2}년\s*\d+회/);
});

test("a practical concept exposes responsive aids without linking held questions", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-004");

  await expect(page.locator('a[href*="P-2025-1-Q05"]')).toHaveCount(0);
  const accessibility = await new AxeBuilder({ page })
    .include("main")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("practical concept reads as a lesson and keeps source links at the end", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-040");
  const mainText = await page.locator("main").innerText();
  expect(mainText.indexOf("무엇이며, 어떻게 작동하는가")).toBeLessThan(
    mainText.indexOf("점검·작업은 어떤 순서로 하는가"),
  );
  expect(mainText.indexOf("점검·작업은 어떤 순서로 하는가")).toBeLessThan(
    mainText.indexOf("실기에서는 이렇게 묻습니다"),
  );
  expect(mainText.indexOf("실기에서는 이렇게 묻습니다")).toBeLessThan(
    mainText.indexOf("NCS 원문 근거"),
  );
  await expect(page.getByRole("link", { name: "NCS 원문 확인" })).toBeVisible();
});

test("unsupported NCS links are not fabricated and OEE is separated from autonomous maintenance", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-020");
  await expect(page.getByRole("heading", { name: "자주보전" })).toBeVisible();
  await expect(page.locator("main")).toContainText("운전자가 자기 설비");
  await expect(page.locator("main")).not.toContainText("OEE=시간가동률");
  await expect(page.getByRole("link", { name: "NCS 원문 확인" })).toHaveCount(0);

  await page.goto("/practical/written/theory/PCON-030");
  await expect(page.getByRole("heading", { name: "OEE", exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText(
    "OEE=시간가동률×성능가동률×양품률",
  );
  await expect(page.locator("main")).not.toContainText("초기청소");
});
