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
