import { expect, test } from "@playwright/test";

test("integrated study pilot preserves the existing written and practical paths", async ({
  page,
}) => {
  await page.goto("/study");

  await expect(
    page.getByRole("heading", {
      name: "같은 개념을 필기와 실기로 이어서 학습",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /베어링/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /LOTO/ })).toBeVisible();
  await expect(page.locator('a[href^="/study/"]')).toHaveCount(5);

  await page.goto("/study/bearing");
  const switcher = page.getByTestId("study-mode-switch");
  await expect(switcher.getByRole("link", { name: "통합" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(switcher.getByRole("link", { name: "필기" })).toHaveAttribute(
    "href",
    "/written/theory/lesson-11c19ti",
  );
  await expect(switcher.getByRole("link", { name: "실기" })).toHaveAttribute(
    "href",
    "/practical/written/theory/PCON-004",
  );

  await switcher.getByRole("link", { name: "필기" }).click();
  await expect(page).toHaveURL(/\/written\/theory\/lesson-11c19ti$/);
  await expect(
    page.getByTestId("study-mode-switch").getByRole("link", { name: "필기" }),
  ).toHaveAttribute("aria-current", "page");
});

test("single-domain LOTO stays practical without fabricating a written lesson", async ({
  page,
}) => {
  await page.goto("/study/loto");

  await expect(
    page.getByText("직접 연결된 필기 레슨은 없습니다."),
  ).toBeVisible();
  await expect(
    page.getByTestId("study-mode-switch").getByText("필기", { exact: true }),
  ).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("body")).not.toContainText("modelAnswer");
});
