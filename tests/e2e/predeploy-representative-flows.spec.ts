import { expect, test } from "@playwright/test";

test("current primary learning routes render their representative surfaces", async ({
  page,
}) => {
  const routes = [
    ["/written/theory", "필기 이론"],
    ["/written/mock", "필기 모의고사"],
    ["/practical/written", "필답 학습"],
    ["/practical/mock", "필답 모의고사"],
    ["/practical/info?tab=centers", "실기 관련 정보"],
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: heading, level: 1 }),
    ).toBeVisible();
  }
});

test("header exposes the current five-area information architecture", async ({
  page,
}) => {
  await page.goto("/");
  let navigation = page.getByRole("navigation", { name: "주 메뉴" });
  if ((await navigation.count()) === 0) {
    await page.getByRole("button", { name: "메뉴 열기" }).click();
    navigation = page.getByRole("navigation", { name: "모바일 주 메뉴" });
  }

  for (const [name, href] of [
    ["이론", "/theory"],
    ["필기 모의고사", "/written/mock"],
    ["필답 학습", "/practical/written"],
    ["필답 모의고사", "/practical/mock"],
    ["실기 정보", "/practical/info"],
  ] as const) {
    await expect(
      navigation.getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
  }
});

test("guest mock creates 80 unique prompt-only questions", async ({
  request,
}) => {
  const response = await request.post("/api/practice/session", {
    data: {
      mode: "mock",
      count: 80,
      originalRatio: 50,
      seed: 20260801,
      subjectAllocations: [1, 2, 3, 4].map((code) => ({
        subjectId: `subject-${code}`,
        count: 20,
      })),
    },
  });

  expect(response.ok()).toBeTruthy();
  const session = await response.json();
  expect(session.questions).toHaveLength(80);
  expect(
    new Set(
      session.questions.map((question: { id: string }) => question.id),
    ).size,
  ).toBe(80);
  expect(
    session.subjectBreakdown.map(
      (subject: { actualCount: number }) => subject.actualCount,
    ),
  ).toEqual([20, 20, 20, 20]);

  const serialized = JSON.stringify(session.questions);
  expect(serialized).not.toContain("correctChoiceId");
  expect(serialized).not.toContain("acceptedAnswers");
  expect(serialized).not.toContain("choiceFeedback");
  expect(serialized).not.toContain("explanation");
});

test("account analytics keeps private analysis gated for a guest", async ({
  page,
}) => {
  await page.goto("/settings/account");
  await expect(
    page.getByRole("heading", { name: "내 학습 계정", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("로그인이 필요합니다")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "로그인하고 기록 합치기" }),
  ).toHaveAttribute("href", "/login");
});
