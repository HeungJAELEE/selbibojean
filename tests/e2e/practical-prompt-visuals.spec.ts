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
  test(`${visualCase.route} shows its verified NCS prompt images`, async ({
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

test("a verified NCS sequence renders every prompt frame through opaque URLs", async ({
  page,
}) => {
  await page.goto(
    "/practical/written/question/EXP-VIS-TAPERED-BEARING-01",
  );

  const items = page.getByTestId("sequence-order-item");
  await expect(items).toHaveCount(5);
  await expect(items.locator("img")).toHaveCount(5);
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
});
