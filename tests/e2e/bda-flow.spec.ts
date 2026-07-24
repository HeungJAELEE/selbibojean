import { expect, test } from "@playwright/test";

test("BDA 홈에서 이론과 문제로 이동할 수 있다", async ({ page }) => {
  await page.goto("/bda");

  await expect(
    page.getByRole("heading", { name: /개념을 읽고/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "필기 이론 시작" }),
  ).toHaveAttribute("href", "/bda/written/theory");
  await expect(page.getByText("20", { exact: true })).toBeVisible();
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
  await expect(page.getByText("정답 해설", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /1 데이터/ }).click();
  await page.getByRole("button", { name: "답안 제출" }).click();
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
