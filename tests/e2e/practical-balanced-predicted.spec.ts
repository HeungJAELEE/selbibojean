import { expect, test } from "@playwright/test";

test("predicted bank shows the reviewed per-type counts without visual padding", async ({
  page,
}) => {
  await page.goto("/practical/written/predicted");

  for (const count of [31, 46, 64, 69]) {
    await expect(
      page.getByText(`NCS 학습유형 · ${count}문제`, { exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByText("같은 시각자료나 같은 공식의 숫자만 바꾼")).toBeVisible();
  await expect(page.getByText("시각자료 판독 016", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.locator(
      'a[href="/practical/written/question/EXP-BAL-DEF-ABBE"]',
    ),
  ).toContainText("아베의 원리");
  await expect(
    page.locator(
      'a[href="/practical/written/question/EXP-BAL-DEF-TBM"]',
    ),
  ).toContainText("시간기준보전(TBM)");
});

test("Abe principle reveals its definition and written evidence only after submit", async ({
  page,
}) => {
  await page.goto("/practical/written/question/EXP-BAL-DEF-ABBE");

  await expect(
    page.getByText("아베의 원리란 무엇인가?", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "필기 문제은행 연결 · U-073" }),
  ).toHaveAttribute("href", "/written/practice/U-073");
  await expect(page.getByText("핵심 정의", { exact: true })).toHaveCount(0);
  await expect(page.getByText("암기팁", { exact: true })).toHaveCount(0);

  await page
    .locator("#practical-answer")
    .fill("측정축과 기준 눈금축을 같은 직선에 두어 아베 오차를 줄이는 원리");
  await page.getByRole("button", { name: "답안 제출" }).click();

  const feedback = page.getByTestId("practical-answer-feedback");
  await expect(feedback).toBeVisible();
  await expect(feedback.getByText("핵심 정의", { exact: true })).toBeVisible();
  await expect(feedback.getByText("암기팁", { exact: true })).toBeVisible();
  await expect(feedback).toContainText("재는 축과 읽는 축을 한 줄로 맞춘다.");
  await expect(page.getByTestId("practical-answer-sources")).toContainText(
    "필기 기출·해설 근거",
  );
});

test("brake lining stays a mobile-safe textual option ordering problem", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/practical/written/question/EXP-BAL-PROC-BRAKE-LINING",
  );

  await expect(
    page.getByRole("heading", { name: "브레이크 라이닝·패드 점검 순서" }),
  ).toBeVisible();
  await expect(page.getByText("보기", { exact: true })).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(
    page.getByText(
      "설비를 정지·고정하고 유압·회전 위험을 제거한다.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "제조사 기준에 따라 교환·조정한 뒤 제동시험과 기록을 수행한다.",
      { exact: true },
    ),
  ).toBeVisible();
});
