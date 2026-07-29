import { expect, test } from "@playwright/test";

test("Notion source topics keep semantic small-topic routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/written/theory");

  await expect(
    page.locator("summary").filter({
      hasText: "산업용 네트워크·핸들링·로봇",
    }),
  ).toHaveCount(1);
  await expect(
    page.locator("summary").filter({
      hasText: "보전조직·예산·자재·QC 도구",
    }),
  ).toHaveCount(1);

  for (const href of [
    "/written/theory/notion-gap-viscosity-kinematic-viscosity",
    "/written/theory/notion-gap-pneumatic-element-numbering-actuator-piping",
    "/written/theory/notion-gap-industrial-network-topology",
    "/written/theory/notion-gap-welding-distortion-control",
    "/written/theory/notion-gap-drawing-lines-sections-symbols",
    "/written/theory/notion-gap-measurement-errors-methods",
    "/written/theory/notion-gap-gear-meshing-backlash-damage",
  ]) {
    expect(await page.locator(`a[href="${href}"]`).count(), href).toBeGreaterThan(
      0,
    );
  }

  const densityRow = page.locator("tr").filter({
    hasText: "밀도·비중량·비중",
  }).first();
  await expect(
    densityRow.getByRole("link", { name: "비중", exact: true }),
  ).toHaveCount(1);
  await expect(
    densityRow.getByRole("link", { name: "비체적", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", {
      name: "점도·동점도와 유동 저항",
      exact: true,
    }).first(),
  ).toBeVisible();
  expect(
    await page.locator("tbody td:last-child a").evaluateAll((links) =>
      links.filter((link) => link.textContent?.trim() === "소주제").length
    ),
  ).toBe(0);

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("concept backgrounds explain use, characteristics, and wrong-answer links", async ({
  page,
}) => {
  await page.goto("/written/theory/lesson-1o82821");
  await expect(
    page.getByRole("heading", { name: "의미·용도와 계산 배경" }),
  ).toBeVisible();
  await expect(page.getByText("비중이 무엇인가", { exact: true })).toBeVisible();
  await expect(page.getByText("언제 사용하는가", { exact: true })).toBeVisible();
  await expect(
    page.getByText("특징과 대표 오답 연결", { exact: true }),
  ).toBeVisible();

  await page.goto("/written/theory/lesson-ql41oa");
  await expect(
    page.getByRole("heading", {
      name: "공기의 성질이 장단점으로 이어지는 배경",
    }),
  ).toBeVisible();
  await expect(page.getByText("왜 정밀 제어에는 불리한가")).toBeVisible();
  await expect(page.getByText("선정과 대표 오답 연결")).toBeVisible();
  await expect(page.getByText("리미트 신호")).toHaveCount(0);
});
