import { expect, test } from "@playwright/test";

test("header exposes the four requested learning areas", async ({ page }) => {
  await page.goto("/");
  const mobile = (page.viewportSize()?.width ?? 1280) < 768;
  if (mobile) {
    await page.getByRole("button", { name: "메뉴 열기" }).click();
  }
  const navigation = page.getByRole("navigation", {
    name: mobile ? "모바일 주 메뉴" : "주 메뉴",
  });

  await expect(navigation.getByRole("link", { name: "이론" })).toHaveAttribute(
    "href",
    "/theory",
  );
  await expect(
    navigation.getByRole("link", { name: "필기 모의고사" }),
  ).toHaveAttribute("href", "/written/mock");
  await expect(
    navigation.getByRole("link", { name: "필답 모의고사" }),
  ).toHaveAttribute("href", "/practical/mock");
  await expect(
    navigation.getByRole("link", { name: "실기 관련 정보" }),
  ).toHaveAttribute("href", "/practical/info");
});

test("theory switches between written and practical learning flows", async ({
  page,
}) => {
  await page.goto("/theory");
  await expect(
    page.getByRole("link", { name: /필기 중심/ }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("heading", {
      name: "개념을 이해한 다음 선택지 함정을 제거합니다",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: /실기·필답 중심/ }).click();
  await expect(page).toHaveURL(/\/theory\?mode=practical$/);
  await expect(
    page.getByRole("heading", {
      name: "기출에서 요구하는 답안과 실제 작업까지 연결합니다",
    }),
  ).toBeVisible();
  await expect(page.getByText(/필답 기출/).first()).toBeVisible();
});

test("written mock offers full exam and random practice", async ({ page }) => {
  await page.goto("/written/mock");
  await expect(
    page.getByRole("heading", { name: "전체 실전 모의고사" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /랜덤 문제풀기/ }),
  ).toHaveAttribute("href", "/written/practice/random");
});

test("practical information has pneumatic hydraulic welding and prep tabs", async ({
  page,
}) => {
  await page.goto("/practical/info");
  for (const name of ["공압", "유압", "용접", "수험자 준비물·팁"]) {
    await expect(page.getByRole("tab", { name })).toBeVisible();
  }

  await page.getByRole("tab", { name: "유압" }).click();
  await expect(
    page.getByRole("heading", {
      name: "유압 동력·압력·방향·유량 제어",
    }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "수험자 준비물·팁" }).click();
  await expect(
    page.getByRole("heading", {
      name: /Q-Net 공개과제·수험자 안내가 최종 기준/,
    }),
  ).toBeVisible();
});

test("practical mock stores a local session and opens the first question", async ({
  page,
}) => {
  await page.goto("/practical/mock");
  await page.getByRole("button", { name: /문제 모의고사 시작/ }).click();
  await expect(page).toHaveURL(
    /\/practical\/written\/question\/.+\?mock=.+&index=0$/,
  );
  await expect(
    page
      .getByRole("navigation", { name: "필답 모의고사 문제 이동" })
      .getByText("필답 모의고사", { exact: true }),
  ).toBeVisible();

  const leakedAnswer = await page.locator("body").textContent();
  expect(leakedAnswer).not.toContain("modelAnswer");
});
