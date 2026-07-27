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
      name: "실제 기출 유형에서 시작해 답안을 완성합니다",
    }),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid^="practical-written-exam-card-link-"]'),
  ).toHaveCount(10);
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
  for (const name of [
    "공압",
    "유압",
    "용접",
    "수험자 준비물·팁",
    "시험장·장비",
  ]) {
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
  await expect(
    page.locator('table a[href^="https://link.coupang.com/a/"]'),
  ).toHaveCount(13);
  const weldingSupplyRow = page.getByRole("row", {
    name: /용접용 보호기구 일체/,
  });
  await expect(weldingSupplyRow).toContainText("보호구(용접장갑)");
  await expect(weldingSupplyRow).toContainText("보호구(자동용접면)");
  await expect(
    page.getByRole("heading", {
      name: "안전 보호구 우선 · 선택 공구는 시험장 확인 후",
    }),
  ).toHaveCount(0);
  await expect(page.locator("main")).toContainText("얇은 긴팔 작업복");
  await expect(page.locator("main")).toContainText("안전화는 필수");

  await page.getByRole("tab", { name: "시험장·장비" }).click();
  await expect(
    page.getByRole("heading", {
      name: "V-AMT 학습환경과 시험장 장비를 구분해 확인",
    }),
  ).toBeVisible();
});

test("practical information exposes every numbered and detailed task video", async ({
  page,
}) => {
  await page.goto("/practical/info?tab=pneumatic");
  await expect(
    page.getByRole("heading", { name: "번호별·세부 학습 영상 10개" }),
  ).toBeVisible();
  for (let number = 1; number <= 8; number += 1) {
    await expect(
      page.getByRole("button", { name: new RegExp(`공압 ${number}번`) }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: /공유압 회로도 단순암기법/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /공압 회로도 한 장 정리/ }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "유압" }).click();
  await expect(
    page.getByRole("heading", { name: "번호별·세부 학습 영상 10개" }),
  ).toBeVisible();
  for (let number = 1; number <= 8; number += 1) {
    await expect(
      page.getByRole("button", { name: new RegExp(`유압 ${number}번`) }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: /유압 회로도 한 장 정리/ }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "용접" }).click();
  await expect(
    page.getByRole("heading", { name: "번호별·세부 학습 영상 6개" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /전체 실습/ }),
  ).toBeVisible();
});

test("representative written concept starts with an exam-first answer card", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-004");

  const card = page.getByTestId(
    "practical-written-exam-card-PWEC-BEARING-IDENTIFICATION",
  );
  await expect(card).toBeVisible();
  await expect(card.getByText("시험장에서 바로 쓰는 답")).toBeVisible();
  await expect(card.getByRole("heading", { name: "핵심 키워드" })).toBeVisible();
  await expect(
    card.getByRole("heading", { name: "실제 기출에서 이렇게 나왔습니다" }),
  ).toBeVisible();
  await expect(
    card.getByRole("heading", { name: "답안은 이 순서로 씁니다" }),
  ).toBeVisible();
  await expect(
    card.getByRole("heading", { name: "이렇게 바뀌어 나올 수 있습니다" }),
  ).toBeVisible();

  const supplement = page.getByTestId("practical-written-supplement");
  await expect(supplement).not.toHaveAttribute("open", "");
  await supplement.locator("summary").click();
  await expect(
    page.getByRole("heading", { name: "무엇이며, 어떻게 작동하는가" }),
  ).toBeVisible();
});

test("unverified overlap remains an NCS-based prediction", async ({ page }) => {
  await page.goto("/practical/written/theory/PCON-044");

  const card = page.getByTestId(
    "practical-written-exam-card-PWEC-WELDING-OVERLAP",
  );
  await expect(card.getByText("NCS 기반 필답 예상")).toBeVisible();
  await expect(
    card.getByText(/현재 확보한 복원자료에서 이 항목의 실제 회차는 확인되지/),
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
