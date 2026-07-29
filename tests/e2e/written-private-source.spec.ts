import { expect, test } from "@playwright/test";

test("theory pages do not expose private Notion source links or archives", async ({
  page,
}) => {
  const response = await page.goto("/written/theory", {
    waitUntil: "domcontentloaded",
  });

  expect(response?.status()).toBe(200);
  await expect(
    page.locator(
      'a[href*="notion.site"], a[href*="app.notion.com"], a[href*="notion.so"]',
    ),
  ).toHaveCount(0);
  await expect(
    page.getByText("과목 전체 종합정리 원문 펼쳐보기", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("정리 기준 통합본 보기", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator(
      '[data-testid$="-source-archive"], [data-testid$="-embedded-source"]',
    ),
  ).toHaveCount(0);
  const subjectSelector = page.getByTestId("written-subject-selector");
  await expect(subjectSelector.getByRole("link")).toHaveCount(4);
  await expect(subjectSelector.locator('[aria-current="page"]')).toHaveCount(1);

  const viewportWidth = page.viewportSize()?.width ?? 0;
  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);

  await subjectSelector.getByRole("link").nth(3).click();
  await expect(page).toHaveURL(/\/written\/theory\/subject\/subject-4\/?(?:#|$)/);
  await expect(
    page.getByTestId("written-subject-four-memory-guide"),
  ).toBeVisible();
  await expect(
    page.getByTestId("written-subject-one-memory-guide"),
  ).toHaveCount(0);

  const privateRoute = await page.goto("/written/theory/source/4", {
    waitUntil: "domcontentloaded",
  });
  expect(privateRoute?.status()).toBe(404);
});
