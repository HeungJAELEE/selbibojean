import { expect, test } from "@playwright/test";

const ADSENSE_PUBLISHER_ID = "ca-pub-5167419072810145";

test("loads the approved AdSense account without inventing a manual slot", async ({
  page,
  request,
}) => {
  await page.goto("/practical/info?tab=prep");

  await expect(
    page.locator('meta[name="google-adsense-account"]'),
  ).toHaveAttribute("content", ADSENSE_PUBLISHER_ID);
  await expect(
    page.locator(
      'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    ),
  ).toHaveAttribute(
    "src",
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`,
  );
  await expect(page.locator("[data-ad-slot]")).toHaveCount(0);

  const adsTxt = await request.get("/ads.txt");
  expect(adsTxt.ok()).toBe(true);
  expect((await adsTxt.text()).trim()).toBe(
    "google.com, pub-5167419072810145, DIRECT, f08c47fec0942fa0",
  );
});

test("keeps conditional welding tools separate from the official supply table", async ({
  page,
}) => {
  await page.goto("/practical/info?tab=prep");

  await expect(
    page.getByRole("heading", { name: "Q-Net 공식 지참준비물 9종" }),
  ).toBeVisible();

  const tools = page.getByTestId("practical-welding-tool-recommendations");
  await expect(tools).toBeVisible();
  await expect(tools.locator("article")).toHaveCount(3);
  await expect(
    tools.getByText("시험장 제공 여부 확인 후 미제공 시 준비/구매", {
      exact: true,
    }),
  ).toHaveCount(3);

  for (const [name, href] of [
    ["용접해머", "https://link.coupang.com/a/fJo7m3EVRA"],
    ["용접 브러쉬", "https://link.coupang.com/a/fJphjpvNLg"],
    ["플라이어", "https://link.coupang.com/a/fJppaQcwGy"],
  ] as const) {
    const link = tools.getByRole("link", { name: new RegExp(`^${name}`) });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("rel", /sponsored/);
  }

  await expect(page.getByTestId("practical-affiliate-disclosure")).toContainText(
    "쿠팡 파트너스 제휴 링크",
  );
});

test("separates current official resources from historical course records on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practical/info?tab=prep");

  const resources = page.getByTestId("practical-training-resources");
  await expect(resources).toBeVisible();
  await expect(
    resources.getByRole("heading", { name: "공식 실습·교육 찾아보기" }),
  ).toBeVisible();
  await expect(resources.locator("article")).toHaveCount(4);
  await expect(
    resources.getByRole("heading", {
      name: "전국에서 찾아볼 수 있는 공식 경로",
    }),
  ).toBeVisible();
  await expect(
    resources.getByRole("heading", { name: "서울 지역 교육 경로" }),
  ).toBeVisible();
  await expect(
    resources.getByRole("heading", { name: "전북 지역 교육 경로" }),
  ).toBeVisible();
  await expect(resources).toContainText(
    "이 지역에 이런 교육 경로가 있으니 참고해보세요. 실제 모집 여부·대상·일정은 기관 공식 페이지에서 확인하세요.",
  );
  await expect(resources).not.toContainText(
    "아산 꿈드림공작소 설비보전기사 용접 실습",
  );

  const historicalResources = page.getByTestId(
    "historical-practical-training-resources",
  );
  await expect(historicalResources).toBeVisible();
  await expect(
    historicalResources.getByRole("heading", {
      name: "과거 교육장소·종료 과정 기록",
    }),
  ).toBeVisible();
  await expect(historicalResources.locator("article")).toHaveCount(1);
  await expect(historicalResources).toContainText("현재 모집 아님");
  await expect(historicalResources).toContainText("충남 과거 교육 기록");

  const asanHistory = historicalResources.locator(
    '[data-resource-id="asan-kopo-seolbi-welding-2026-history"]',
  );
  await expect(asanHistory).toHaveAttribute(
    "data-listing-status",
    "historical",
  );
  await expect(asanHistory).toContainText(
    "아산 꿈드림공작소 설비보전기사 용접 실습",
  );
  await expect(asanHistory).toContainText("2026-07-04~2026-07-05 운영 종료");
  await expect(
    asanHistory.getByRole("link", { name: "과거 과정 공식 기록" }),
  ).toHaveAttribute(
    "href",
    "https://dream.kopo.ac.kr/ko/intro/asan/view/22051/description",
  );

  for (const [resourceId, href] of [
    [
      "qnet-public-practical-problems",
      "https://www.q-net.or.kr/cst006.do?code=1204&gId=&gSite=Q&id=cst00601",
    ],
    ["kopo-dream-workshop", "https://dream.kopo.ac.kr/ko/"],
    [
      "kopo-jungsu-incumbent-training",
      "https://sanhak.kopo.ac.kr/jungsu/selectCrseWebList.do?key=1239",
    ],
    [
      "jeonbuk-korcham-welding-practice-2026",
      "https://jb.korchamhrd.net/education/improvementEduDetail.do?bunryu=1%2C3%2C8&callFlag=YEAR&gaebalwon_cd=08000&mcourse_no=M0591&menuId=3837&rootMenuId=3830",
    ],
  ] as const) {
    const card = resources.locator(`[data-resource-id="${resourceId}"]`);
    await expect(card).toHaveCount(1);
    await expect(card.getByText("대상·조건", { exact: true })).toBeVisible();
    await expect(
      card.getByText("변동 가능 안내", { exact: true }),
    ).toBeVisible();
    await expect(card.getByRole("link", { name: "기관 공식 페이지" })).toHaveAttribute(
      "href",
      href,
    );
  }

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("places source-bounded FAQs beside supplies, training, and center guidance", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practical/info?tab=prep");

  const suppliesFaq = page.getByTestId("practical-faq-prep_supplies");
  await expect(suppliesFaq).toBeVisible();
  await expect(
    suppliesFaq.getByText("실기 준비물은 무엇을 기준으로 챙겨야 하나요?"),
  ).toBeVisible();

  const trainingFaq = page.getByTestId("practical-faq-prep_training");
  await expect(trainingFaq).toBeVisible();
  await expect(trainingFaq.locator("details")).toHaveCount(3);

  const sourceFaq = page.getByTestId("practical-faq-prep_source_check");
  await expect(sourceFaq).toBeVisible();
  await expect(sourceFaq.locator("details")).toHaveCount(2);
  await sourceFaq
    .getByText("단체 대화방 복원 문제나 AI 답변을 그대로 외워도 되나요?")
    .click();
  await expect(sourceFaq).toContainText("HOLD 자료로 취급");
  await expect(
    sourceFaq.getByRole("link", { name: /Q-Net 공개문제 자료실/ }),
  ).toHaveAttribute(
    "href",
    "https://www.q-net.or.kr/cst006.do?code=1204&gId=&gSite=Q&id=cst00601",
  );

  await page.getByRole("tab", { name: "시험장·장비" }).click();
  await expect(
    page.getByTestId("practical-faq-centers_equipment"),
  ).toBeVisible();
  await expect(page.getByTestId("practical-faq-centers_reports")).toBeVisible();

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("shows every center photo without horizontal clipping on a 390px viewport", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });

  for (const [centerId, expectedCount] of [
    ["incheon-kopo-industry", 9],
    ["jeonnam-suncheon-kopo", 7],
    ["ulsan-kopo", 1],
    ["busan-technical-high", 3],
    ["gyeongnam-changwon-kopo", 2],
  ] as const) {
    await page.goto(`/practical/info/centers/${centerId}`);
    await expect(
      page.getByRole("heading", { name: "현장 사진" }),
    ).toBeVisible();

    const photos = page.locator("main img");
    await expect(photos).toHaveCount(expectedCount);
    for (let index = 0; index < expectedCount; index += 1) {
      const photo = photos.nth(index);
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(
        () =>
          photo.evaluate(
            (image) => (image as HTMLImageElement).naturalWidth,
          ),
        { timeout: 10_000 },
      ).toBeGreaterThan(0);
      expect(
        await photo.evaluate((image) => {
          const rect = image.getBoundingClientRect();
          return (
            getComputedStyle(image).objectFit === "contain" &&
            rect.left >= 0 &&
            rect.right <= window.innerWidth
          );
        }),
      ).toBe(true);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }

  await page.goto("/practical/info/centers/ulsan-kopo");
  await expect(page.getByText(/CW-WA300E.*KT-300AC/)).toBeVisible();
});

test("shows reported task scoring and keeps venue reports qualified", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practical/info");

  await expect(page.getByText("수험자 제공 세부 배점 · 2026-07-30")).toBeVisible();
  await expect(page.getByText("공압 20점", { exact: true })).toBeVisible();
  await expect(page.getByText("유지보수 1번").first()).toBeVisible();

  await page.goto(
    "/practical/info/centers/gyeongnam-changwon-kopo",
  );
  await expect(page.getByText("수험자 24학번군바리 · 2026-07-30")).toBeVisible();
  await expect(page.getByText(/배선을 모두 제거한 뒤/)).toBeVisible();
  await expect(page.getByText("현장 사진·수험자 제보 확인")).toBeVisible();
  await expect(page.getByText(/시험장 사용을 확인.*추가 확인/)).toBeVisible();

  await page.goto("/practical/info/centers/seongnam-kopo-nuri");
  await expect(page.getByText(/미지참 시 시험장에서 제공받을 수 있으나/)).toBeVisible();
});

test("highlights the Incheon welding PPE and finishing tools as required personal items", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practical/info/centers/incheon-kopo-industry");

  const guidance = page.getByTestId(
    "center-supply-guidance-incheon-kopo-industry",
  );
  await expect(guidance).toBeVisible();
  await expect(guidance).toContainText("필수 지참 · 시험장 미제공 제보");
  await expect(guidance).toContainText("슬래그망치");
  await expect(guidance).toContainText("와이어브러시");
  await expect(
    page.getByRole("heading", { name: "장비 상태와 당일 운영 참고" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "KT-300AC 구형 다이얼식 교류 아크용접기",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("shows the user-reported Busan parking restriction", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practical/info/centers/busan-technical-high");
  await expect(
    page.getByRole("heading", {
      name: "부산공고(남구 대연동) 기계·건축토목과 실습동",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("주차불가 · 사용자 제보(2026-07-28)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "CW-WC 350·CW-WT350A 용접기" }),
  ).toBeVisible();
  await expect(page.getByText(/공식 시설표의 CW-WA300E 표기와 다르므로/)).toBeVisible();
});
