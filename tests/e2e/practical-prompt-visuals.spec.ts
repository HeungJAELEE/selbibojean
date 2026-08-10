import { expect, test } from "@playwright/test";

const visualPromptCases = [
  {
    route:
      "/practical/written/question/EXP-VIS-BRAKE-PAD-LINING-01",
    expectedImages: 4,
    visualTestId:
      "practical-visual-aid-ncs-brake-pad-lining-inspection",
  },
  {
    route:
      "/practical/written/question/EXP-VIS-BEARING-DAMAGE-01",
    expectedImages: 8,
    visualTestId:
      "practical-visual-aid-ncs-bearing-damage-identification",
  },
] as const;

for (const visualCase of visualPromptCases) {
  test(`${visualCase.route} shows its approved prompt images`, async ({
    page,
  }) => {
    await page.goto(visualCase.route);

    const visual = page.getByTestId(visualCase.visualTestId);
    await expect(visual).toBeVisible();
    await expect(visual.locator("img")).toHaveCount(
      visualCase.expectedImages,
    );
    await expect
      .poll(() =>
        visual.locator("img").evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
      )
      .toBe(true);
  });
}

const reconstructedPromptCases = [
  ["P-2025-1-Q05", "diagram-third-angle-projection-problem"],
  ["P-2025-1-Q09", "diagram-ghs-pictograms-problem"],
  ["P-2025-2-Q03", "diagram-bracket-drawing-annotations"],
  ["P-2025-2-Q05", "diagram-vernier-48-2"],
  ["P-2025-3-Q04", "diagram-thread-profiles"],
  ["P-2025-3-Q05", "diagram-shaft-misalignment"],
  ["P-2025-3-Q07", "diagram-dial-vblock"],
  ["P-2026-1-Q03", "diagram-drive-unit-section-labels"],
  ["P-2026-1-Q09", "diagram-external-gear-pump-drawing"],
] as const;

for (const [questionId, visualAidId] of reconstructedPromptCases) {
  test(`${questionId} renders its explicitly approved non-original reconstruction`, async ({
    page,
  }) => {
    await page.goto(`/practical/written/question/${questionId}`);

    const visual = page.getByTestId(`practical-visual-aid-${visualAidId}`);
    await expect(visual).toBeVisible();
    await expect(
      visual.getByTestId("practical-visual-prompt-source-notice"),
    ).toContainText("원시험 원본 이미지가 아닙니다");
    await expect(visual.locator("img")).toHaveCount(1);
    await expect
      .poll(() =>
        visual.locator("img").evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
      )
      .toBe(true);
  });
}

const sequencePromptCases = [
  {
    route:
      "/practical/written/question/EXP-VIS-TAPERED-BEARING-01",
    expectedImages: 5,
  },
  {
    route: "/practical/written/question/EXP-VIS-CRACK-REPAIR-01",
    expectedImages: 3,
  },
  {
    route:
      "/practical/written/question/EXP-VIS-VERNIER-MEASUREMENT-01",
    expectedImages: 3,
  },
] as const;

for (const sequenceCase of sequencePromptCases) {
  test(`${sequenceCase.route} renders every sequence frame through opaque URLs`, async ({
    page,
  }) => {
    await page.goto(sequenceCase.route);

    const items = page.getByTestId("sequence-order-item");
    await expect(items).toHaveCount(sequenceCase.expectedImages);
    await expect(items.locator("img")).toHaveCount(
      sequenceCase.expectedImages,
    );
    await expect
      .poll(() =>
        items.locator("img").evaluateAll((images) =>
          images.every((image) => {
            const element = image as HTMLImageElement;
            return (
              element.complete &&
              element.naturalWidth > 0 &&
              element.currentSrc.includes("/api/practical/sequence-frame/")
            );
          }),
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole("button", { name: "이 순서로 정답 확인" }),
    ).toBeEnabled();
  });
}
