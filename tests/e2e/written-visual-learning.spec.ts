import { expect, test } from "@playwright/test";

const representativeLessons = [
  {
    id: "lesson-tjd0lb",
    diagramId: "magneto-bearing-comparison",
    title: "마그네토 볼베어링과 깊은 홈 볼베어링 비교",
  },
  {
    id: "lesson-11hnldw",
    diagramId: "pintle-chain-construction",
    title: "핀틀체인 링크 구조와 롤러체인 비교",
  },
  {
    id: "lesson-kpat9s",
    diagramId: "screw-load-brake",
    title: "나사식 하중브레이크의 조임·유지 원리",
  },
  {
    id: "lesson-psovio",
    diagramId: "abbe-principle",
    title: "아베의 원리: 측정축과 눈금축을 일치",
  },
] as const;

for (const lesson of representativeLessons) {
  test(`${lesson.title} 시각자료를 학습 본문에 표시한다`, async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.goto(`/written/theory/${lesson.id}`);

    const visualSection = page.getByTestId("written-lesson-visuals");
    await expect(visualSection).toBeVisible();
    await expect(
      page.getByTestId(`written-special-diagram-${lesson.diagramId}`),
    ).toContainText(lesson.title);

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowingElements: Array.from(document.querySelectorAll<HTMLElement>("*"))
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            testId: element.dataset.testid ?? "",
            className: element.className,
            left: bounds.left,
            right: bounds.right,
            insideSvg: element.closest("svg") !== null,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          };
        })
        .filter(
          (element) =>
            !element.insideSvg &&
            (element.left < -0.5 ||
              element.right > document.documentElement.clientWidth + 0.5 ||
              element.scrollWidth > element.clientWidth + 1),
        )
        .slice(0, 12),
    }));
    expect(
      layout.scrollWidth,
      JSON.stringify(layout.overflowingElements),
    ).toBeLessThanOrEqual(layout.clientWidth);
    expect(browserErrors).toEqual([]);
  });
}

test("a lesson without a dedicated asset does not receive another topic's visual", async ({
  page,
}) => {
  await page.goto("/written/theory/lesson-1qi34a4");

  const visualSection = page.getByTestId("written-lesson-visuals");
  await expect(visualSection).toHaveCount(0);
});

test("compressor lesson shows its classification, subtypes, and operating sequence", async ({
  page,
}) => {
  if (test.info().project.name === "mobile") {
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.goto("/written/theory/lesson-1jbssv6");

  const diagram = page.getByTestId(
    "written-special-diagram-compressor-classification",
  );
  await expect(diagram).toBeVisible();
  await expect(diagram).toContainText("용적형");
  await expect(diagram).toContainText("스크루 · 베인 · 루츠/로브 · 스크롤 · 액봉식");
  await expect(diagram).toContainText("동력형");
  await expect(diagram).toContainText("흡입");
  await expect(diagram).toContainText("체적 감소");
  await expect(diagram).toContainText("압력 변환");
  await expect(
    page.getByRole("heading", { name: "1. 용적형 압축기" }),
  ).toBeVisible();
  await expect(
    page.locator("blockquote").filter({
      hasText: "기어형은 이 압축기 분류의 대표 형식이 아니라",
    }),
  ).toBeVisible();

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
});

test("water hammer uses sourced external visuals and preserves the diagnosis anchor", async ({
  page,
}) => {
  if (test.info().project.name === "mobile") {
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.goto("/written/theory/lesson-10oupjp#diagnosis");

  const visualSection = page.getByTestId("written-lesson-visuals");
  await expect(visualSection).toBeVisible();
  await expect(
    page.getByTestId("written-external-visual-wikimedia-water-hammer-pressure"),
  ).toContainText("밸브 폐쇄 뒤 나타나는 수격 압력파");
  await expect(
    page.getByTestId("written-external-visual-wikimedia-water-hammer-damage"),
  ).toContainText("수격 압력 충격으로 파손된 플로트 게이지");
  await expect(page.locator("#diagnosis")).toBeVisible();
  await expect(visualSection).toContainText("Public domain");
  await expect(visualSection).toContainText("CC BY-SA 3.0");
  await expect(
    visualSection.getByTestId(
      "practical-visual-aid-diagram-maintenance-tools",
    ),
  ).toHaveCount(0);

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    brokenImages: Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.brokenImages).toEqual([]);
});

test("component lessons add source-governed real photos without mobile overflow", async ({
  page,
}) => {
  if (test.info().project.name === "mobile") {
    await page.setViewportSize({ width: 390, height: 844 });
  }

  const cases = [
    {
      route: "/written/theory/lesson-sttpqh",
      testId:
        "written-external-visual-wikimedia-hydraulic-gas-accumulator",
      title: "유압 장치에 설치된 블래더형 어큐뮬레이터",
      credit: "Ingvald Straume · CC0 1.0",
    },
    {
      route: "/written/theory/lesson-1y9qr6c",
      testId:
        "written-external-visual-wikimedia-inductive-proximity-sensor",
      title: "원통형 유도형 근접센서 실물",
      credit: "Ekbsensor · CC BY-SA 4.0",
    },
  ] as const;

  for (const visualCase of cases) {
    await page.goto(visualCase.route);

    const figure = page.getByTestId(visualCase.testId);
    await expect(figure).toContainText(visualCase.title);
    await expect(figure).toContainText(visualCase.credit);
    await expect
      .poll(
        () =>
          figure.locator("img").evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
        { timeout: 10_000 },
      )
      .toBe(true);

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  }
});
