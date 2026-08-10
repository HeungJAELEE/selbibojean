import { expect, test } from "@playwright/test";

test("GPT 보강 기출 카드는 정의·원리·출제 방식 연결을 보여 준다", async ({
  page,
}) => {
  await page.goto(
    "/practical/written/card/%ED%94%8C%EB%9E%9C%EC%A7%80-%EC%BB%A4%ED%94%8C%EB%A7%81-%EC%A0%84%EB%8B%AC%ED%86%A0%ED%81%AC",
  );

  await expect(
    page.getByTestId(
      "practical-written-exam-card-PWEC-P-2025-1-Q01",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "개념과 기출을 이렇게 연결하세요" }),
  ).toBeVisible();
  await expect(page.getByText("정의에서 확인", { exact: true })).toBeVisible();
  await expect(page.getByText("원리와 배경", { exact: true })).toBeVisible();
  await expect(
    page.getByText("시험에서 묻는 방식", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("문제 조건에서", { exact: false })).toHaveCount(
    0,
  );
});
