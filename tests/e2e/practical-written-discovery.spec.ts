import { expect, test } from "@playwright/test";

test("global navigation opens the official constructed-response learning hub", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const globalNavigation = page.getByRole("navigation", { name: "주 메뉴" });
  await expect(
    globalNavigation.getByRole("link", { name: "필답 학습", exact: true }),
  ).toHaveAttribute("href", "/practical/written");
  await expect(
    globalNavigation.getByRole("link", {
      name: "필답 모의고사",
      exact: true,
    }),
  ).toHaveAttribute("href", "/practical/mock");
  await expect(
    globalNavigation.getByRole("link", { name: "실기 정보", exact: true }),
  ).toHaveAttribute("href", "/practical/info");

  await globalNavigation
    .getByRole("link", { name: "필답 학습", exact: true })
    .click();
  await expect(page).toHaveURL(/\/practical\/written$/);
  await expect(
    page.getByRole("heading", { name: "필답 학습", level: 1 }),
  ).toBeVisible();

  const hub = page.getByTestId("practical-written-hub");
  await expect(
    hub.getByRole("link", { name: /NCS·과목별 학습/ }).first(),
  ).toHaveAttribute("href", "/practical/written/theory");
  await expect(
    hub.getByRole("link", { name: /기출복원 풀기/ }).first(),
  ).toHaveAttribute("href", "/practical/written/past");
  await expect(
    hub.getByRole("link", { name: /필답 모의고사/ }).last(),
  ).toHaveAttribute("href", "/practical/mock");

  const featuredStandards = hub.getByTestId(
    "practical-written-featured-standards",
  );
  await expect(
    featuredStandards.getByRole("heading", {
      name: "숫자와 기준을 정확히 쓰는 문제부터 연습합니다",
    }),
  ).toBeVisible();
  for (const [questionTitle, questionId] of [
    ["송풍기 동력 상사법칙", "P-2026-2-Q03"],
    ["연삭숫돌 시운전과 덮개", "P-2026-2-Q06"],
    ["GHS 유해성 그림문자", "P-2025-1-Q09"],
    ["호흡보호구 종류와 용도", "P-2025-2-Q08"],
    ["LOTO 기본순서", "P-2025-2-Q09"],
    ["안전표지 식별", "P-2025-3-Q02"],
    ["금지·경고·지시 안전표지", "P-2026-1-Q02"],
  ] as const) {
    await expect(
      featuredStandards.getByRole("link", {
        name: new RegExp(questionTitle),
      }),
    ).toHaveAttribute("href", `/practical/written/question/${questionId}`);
  }
});

test("constructed-response section navigation stays consistent across top-level routes", async ({
  page,
}) => {
  const routes = [
    ["/practical/written", "필답 홈"],
    ["/practical/written/theory?view=concept", "과목별·NCS"],
    ["/practical/written/theory?view=exam-type", "기출 유형별"],
    ["/practical/written/past", "기출복원"],
    ["/practical/written/predicted", "예상문제"],
    ["/practical/mock", "모의고사"],
  ] as const;

  for (const [route, activeLabel] of routes) {
    await page.goto(route);
    const navigation = page.getByTestId("practical-written-section-nav");
    await expect(navigation).toBeVisible();
    await expect(
      navigation.getByRole("link", { name: activeLabel, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(navigation.getByRole("link")).toHaveCount(6);
  }

  await page.goto("/practical/written");
  await page
    .getByTestId("practical-written-section-nav")
    .getByRole("link", { name: "기출복원", exact: true })
    .click();
  await expect(page).toHaveURL(/\/practical\/written\/past$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/practical\/written$/);
});

test("constructed-response discovery remains usable without page overflow", async ({
  page,
}) => {
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/practical/written");

    await expect(page.getByTestId("practical-written-hub")).toBeVisible();
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(documentWidth).toBeLessThanOrEqual(width);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "메뉴 열기" }).click();

  const mobileNavigation = page.getByRole("navigation", {
    name: "모바일 주 메뉴",
  });
  await expect(
    mobileNavigation.getByRole("link", {
      name: "필답 학습",
      exact: true,
    }),
  ).toHaveAttribute("href", "/practical/written");
  await expect(
    mobileNavigation.getByRole("link", {
      name: "필답 모의고사",
      exact: true,
    }),
  ).toHaveAttribute("href", "/practical/mock");

  const hubLink = mobileNavigation.getByRole("link", {
    name: "필답 학습",
    exact: true,
  });
  await hubLink.focus();
  await expect(hubLink).toBeFocused();
});
