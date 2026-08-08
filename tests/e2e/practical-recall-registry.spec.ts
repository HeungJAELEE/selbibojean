import { expect, test } from "@playwright/test";

test("publishes reconstructed-question occurrences with explicit evidence boundaries", async ({
  page,
}) => {
  await page.goto("/practical/written/past");
  await page.waitForLoadState("networkidle");

  const registry = page.getByTestId("practical-recall-registry");
  await expect(registry).toBeVisible();
  await expect(
    registry.getByRole("heading", { name: "복원 기출 등록부" }),
  ).toBeVisible();
  await expect(
    registry.getByTestId("practical-recall-registry-item"),
  ).toHaveCount(34);
  await expect(registry).toContainText("공식 근거 학습 승격");
  await expect(registry).toContainText("정답 교정 완료");
  await expect(registry).not.toContainText("기존문항 연결");
  await expect(registry).not.toContainText("원그림 필요");
  await expect(registry).not.toContainText("근거 검토 완료");
  await expect(registry.getByText("정답 충돌", { exact: true })).toHaveCount(
    0,
  );
  await expect(registry).not.toContainText("KQA-");
  await expect(registry).not.toContainText("12.53");

  const grindingWheel = registry
    .getByTestId("practical-recall-registry-item")
    .filter({ hasText: "연삭숫돌 시험운전·덮개" });
  await grindingWheel.getByText("등록 근거·학습팁 보기").click();
  await expect(grindingWheel).toContainText("시작 1·교체 3·지름 5");
  await expect(grindingWheel).toContainText("현행 법령");
  await expect(
    grindingWheel.getByRole("link", {
      name: "산업안전보건기준에 관한 규칙 제122조",
    }),
  ).toHaveAttribute("href", /law\.go\.kr/);

  const semsBolt = registry
    .getByTestId("practical-recall-registry-item")
    .filter({ hasText: "SEMS 볼트 실물 판별" });
  await semsBolt.getByText("등록 근거·학습팁 보기").click();
  await expect(semsBolt).toContainText("실제 시험 제품 사진은 아니다");
  await expect(
    semsBolt.getByRole("img", {
      name: "나사와 빠지지 않는 와셔의 조립 구조를 보인 미국 특허 도면",
    }),
  ).toBeVisible();
  await expect(
    semsBolt.getByRole("link", { name: "Nord-Lock SEMS Overview" }),
  ).toHaveAttribute("href", /nord-lock\.com/);

  const dripLubrication = registry
    .getByTestId("practical-recall-registry-item")
    .filter({ hasText: "적하급유법 복수 선택" });
  await dripLubrication.getByText("등록 근거·학습팁 보기").click();
  await expect(
    dripLubrication.getByRole("img", {
      name: "적하 급유기의 저장부와 조절부를 나타낸 단면 도해",
    }),
  ).toBeVisible();
  await expect(dripLubrication).toContainText("CC BY 4.0");
  await expect(dripLubrication).toContainText("공식 근거 학습 승격");
  await expect(
    dripLubrication.getByRole("link", {
      name: "SKF Power Transmission Products — Lubrication methods",
    }),
  ).toHaveAttribute("href", /skfmediahub\.skf\.com/);

  const safetyFactor = registry
    .getByTestId("practical-recall-registry-item")
    .filter({ hasText: "안전율 계산" });
  await safetyFactor.getByText("등록 근거·학습팁 보기").click();
  await expect(safetyFactor).toContainText("공식 기술기준");
  await expect(safetyFactor).toContainText(
    "견딜 수 있는 기준 ÷ 실제 최대 사용",
  );

  const brakeLining = registry
    .getByTestId("practical-recall-registry-item")
    .filter({ hasText: "브레이크 라이닝 교체 순서" });
  await brakeLining.getByText("등록 근거·학습팁 보기").click();
  await expect(brakeLining).toContainText("공식 NCS 학습모듈");
  await expect(brakeLining).toContainText(
    "실제 배열 답은 제시된 문장 전체를 보고 확정",
  );
  await expect(brakeLining.getByRole("img")).toHaveCount(0);
  await expect(
    brakeLining.getByRole("link", {
      name: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    }),
  ).toHaveAttribute("href", /drive\.google\.com/);

  const electricCharge = registry
    .getByTestId("practical-recall-registry-item")
    .filter({ hasText: "전하의 SI 단위" });
  await electricCharge.getByText("등록 근거·학습팁 보기").click();
  await expect(electricCharge).toContainText("C=A·s");
  await expect(
    electricCharge.getByRole("link", {
      name: "BIPM SI Brochure 9th edition",
    }),
  ).toHaveAttribute("href", /bipm\.org/);
});

test("keeps the reconstructed-question registry readable at 390px", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practical/written/past");

  const registry = page.getByTestId("practical-recall-registry");
  await expect(registry).toBeVisible();
  await expect(registry.getByText("2026년 제2회 복원")).toBeVisible();
  await expect(registry.getByText("2026년 5월 10일 복원")).toBeVisible();

  const box = await registry.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);

  const semsBolt = registry
    .getByTestId("practical-recall-registry-item")
    .filter({ hasText: "SEMS 볼트 실물 판별" });
  await semsBolt.getByText("등록 근거·학습팁 보기").click();
  const referenceImage = semsBolt.getByRole("img", {
    name: "나사와 빠지지 않는 와셔의 조립 구조를 보인 미국 특허 도면",
  });
  await expect(referenceImage).toBeVisible();
  const imageBox = await referenceImage.boundingBox();
  expect(imageBox).not.toBeNull();
  expect(imageBox!.x).toBeGreaterThanOrEqual(0);
  expect(imageBox!.x + imageBox!.width).toBeLessThanOrEqual(390);

  await page.screenshot({
    path: testInfo.outputPath("recall-registry-390.png"),
    fullPage: true,
  });
  await registry.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath("recall-registry-top-390.png"),
  });
});
