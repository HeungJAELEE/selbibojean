import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("practical hub exposes the practical theory entry point", async ({
  page,
}) => {
  await page.goto("/practical");
  const theoryEntry = page.locator('a[href="/practical/written/theory"]');
  await expect(theoryEntry).toHaveCount(1);
  await expect(theoryEntry).toContainText("46");
});

test("practical work exposes all eleven NCS modules and real task records", async ({
  page,
}) => {
  await page.goto("/practical/work");

  await expect(page.getByTestId("practical-work-summary")).toContainText("11");
  await expect(
    page.locator('[data-testid^="practical-work-module-"]'),
  ).toHaveCount(11);

  await page
    .getByRole("link", {
      name: /2실린더 순차동작 회로 구성·시험·고장진단/,
    })
    .click();
  await expect(page).toHaveURL(/two-cylinder-sequence-circuit/);
  await expect(page.getByTestId("practical-task-runner")).toBeVisible();
  await expect(
    page.getByText(/새 작업기록입니다|저장된 기록을 복구했습니다/),
  ).toBeVisible();

  const startButton = page.getByTestId("practical-task-start");
  await expect(startButton).toBeDisabled();
  const safetyGate = page.getByTestId("practical-task-safety-gate");
  const passRadios = safetyGate.locator('input[type="radio"][value="pass"]');
  await expect(passRadios).toHaveCount(4);
  for (const radio of await passRadios.all()) {
    await radio.check();
  }
  await expect(startButton).toBeEnabled();
  await startButton.click();
  await expect(page.getByText("상태: 수행 중")).toBeVisible();
  await expect(page.getByTestId("practical-task-complete")).toBeDisabled();
});

test("practical work loads only the selected repair welding video in its toggle guide", async ({
  page,
}) => {
  await page.goto("/practical/work");

  const guide = page.getByTestId("practical-work-welding-videos");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("data-hydrated", "true");
  await expect(guide.locator('[data-testid^="practical-work-video-"]')).toHaveCount(6);
  await expect(guide.locator("iframe")).toHaveCount(0);
  await expect(guide.getByText("외부 보조 학습자료", { exact: false })).toBeVisible();

  await guide.getByTestId("practical-work-video-circumference-tack").getByRole("button").click();
  await expect(
    guide
      .getByTestId("practical-work-video-circumference-tack")
      .getByTestId("practical-work-video-panel"),
  ).toBeVisible();
  await expect(guide.locator("iframe")).toHaveCount(1);
  await expect(
    guide.getByTestId("practical-work-video-frame-circumference-tack"),
  ).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/5ae44u6P9sE?rel=0");
  await expect(guide.getByRole("link", { name: "YouTube에서 원문 열기" })).toHaveAttribute(
    "href",
    "https://youtu.be/5ae44u6P9sE?si=Fhtqkv_TRnUbDJgy",
  );

  await guide
    .getByTestId("practical-work-video-industrial-engineer-task-3-drawing-1")
    .getByRole("button")
    .click();
  await expect(guide.locator("iframe")).toHaveCount(1);
  await expect(
    guide.getByTestId(
      "practical-work-video-frame-industrial-engineer-task-3-drawing-1",
    ),
  ).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/9xxk6SPZ0yI?rel=0",
  );
});

test("practical work groups circuit, article, industrial-engineer, and paid videos without eager embeds", async ({
  page,
}) => {
  await page.goto("/practical/work");

  const guide = page.getByTestId("practical-work-fluid-power-videos");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("data-hydrated", "true");
  await expect(
    guide.locator('[data-testid^="practical-fluid-video-group-"]'),
  ).toHaveCount(5);
  await expect(
    guide.locator('[data-testid^="practical-fluid-video-"]:not([data-testid^="practical-fluid-video-group-"]):not([data-testid^="practical-fluid-video-frame-"])'),
  ).toHaveCount(28);
  await expect(guide.locator("iframe")).toHaveCount(0);

  await guide
    .getByTestId("practical-fluid-video-pneumatic-1")
    .getByRole("button")
    .click();
  await expect(
    guide
      .getByTestId("practical-fluid-video-pneumatic-1")
      .getByTestId("practical-fluid-video-panel"),
  ).toBeVisible();
  await expect(guide.locator("iframe")).toHaveCount(1);
  await expect(
    guide.getByTestId("practical-fluid-video-frame-pneumatic-1"),
  ).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/5dAqJzIHIGk?rel=0",
  );

  await expect(
    guide.getByText(
      "설비보전산업기사 작업형 · [부산공고 설비와 동일]",
      {
      exact: true,
      },
    ),
  ).toBeVisible();
  await guide
    .getByTestId("practical-fluid-video-industrial-engineer-hydraulic-5")
    .getByRole("button")
    .click();
  await expect(
    guide.getByTestId(
      "practical-fluid-video-frame-industrial-engineer-hydraulic-5",
    ),
  ).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/SvBD-bm_gXM?rel=0",
  );

  await expect(
    page.getByTestId("practical-work-dream-workshop"),
  ).toContainText("꿈드림공작소");
  await expect(
    page.getByRole("link", { name: "꿈드림공작소 프로그램 확인" }),
  ).toHaveAttribute("href", "https://dream.kopo.ac.kr/");
});

test("practical theory keeps the six study-type slots together below each concept", async ({
  page,
}) => {
  await page.goto("/practical/written/theory");
  await expect(
    page.getByTestId("practical-textbook-learning-types"),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid^="practical-textbook-subject-subject-"]'),
  ).toHaveCount(4);
  const conceptCards = page.locator(
    '[data-testid^="practical-textbook-concept-card-"]',
  );
  expect(await conceptCards.count()).toBeGreaterThan(0);
  const studyTypeSlotCounts = await conceptCards.evaluateAll((cards) =>
    cards.map(
      (card) =>
        card.querySelectorAll(
          '[data-testid^="practical-textbook-concept-type-"]',
        ).length,
    ),
  );
  expect(studyTypeSlotCounts.every((count) => count === 6)).toBe(true);
  expect(
    await page
      .locator(
        '[data-testid^="practical-textbook-concept-type-"][aria-disabled="true"]',
      )
      .count(),
  ).toBeGreaterThan(0);
  await expect(
    page.getByText("계산 공식", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByTestId("practical-ncs-source-audit"),
  ).not.toHaveAttribute("open", "");
  await expect(page.locator("main img")).toHaveCount(0);

  await page.goto("/practical/written/theory/subject/subject-1");
  await expect(
    page.locator('[data-testid^="practical-textbook-family-subject-1-"]'),
  ).not.toHaveCount(0);
  const firstSubjectConcept = page
    .locator('[data-testid^="practical-textbook-concept-card-subject-1-"]')
    .first();
  await expect(firstSubjectConcept).toBeVisible();
  await expect(
    firstSubjectConcept.locator(
      '[data-testid^="practical-textbook-concept-type-subject-1-"]',
    ),
  ).toHaveCount(6);
  await expect(page.locator("main img")).toHaveCount(0);
});

test("each practical concept offers an integrated study sheet before the fixed study slots", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/subject/subject-1");

  const integratedLink = page.getByTestId(
    "practical-textbook-concept-link-subject-1-s1-g01-PCON-032",
  );
  await expect(integratedLink).toBeVisible();
  await expect(integratedLink).toContainText("통합 학습");
  await integratedLink.click();

  await expect(page).toHaveURL(
    /\/practical\/written\/theory\/PCON-032$/,
  );
  await expect(
    page.getByTestId("practical-textbook-concept-integrated-sheet"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "파스칼" }),
  ).toBeVisible();
  await expect(page.getByText("개념 이해", { exact: true })).toBeVisible();
  await expect(page.getByText("NCS 원문 근거", { exact: true })).toBeVisible();
});

test("Pascal keeps its confirmed reconstruction separate from NCS-grounded predictions", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-032");

  await expect(
    page.getByText("기출복원 · (실기 출제)", { exact: true }),
  ).toBeVisible();
  const pastLink = page.locator(
    'a[href="/practical/written/question/P-2026-1-Q07"]',
  );
  await expect(pastLink).toHaveCount(1);
  await expect(pastLink).toContainText("파스칼 원리");
  await expect(pastLink).toContainText("연결된 두 피스톤의 힘·면적 관계");

  await expect(
    page.getByText("출제예상 · (출제 예상)", {
      exact: true,
    }),
  ).toBeVisible();
  for (const label of [
    "파스칼 유압출력",
    "파스칼 면적비·이동거리 비교",
    "유압 브레이크의 파스칼 원리 적용",
    "파스칼 원리의 압력 전달",
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }

  await page.goto("/practical/written/question/P-2026-1-Q07");
  await expect(
    page.getByText("2026년 1회 · Q7 · 응시자 복원", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("(실기 출제)", { exact: true })).toBeVisible();

  await page.goto("/practical/written/question/EXP-C08");
  await expect(page.getByText("(출제 예상)", { exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("2026년 1회 Q7");
  await expect(page.getByTestId("practical-answer-feedback")).toHaveCount(0);
  const accessibility = await new AxeBuilder({ page }).include("main").analyze();
  expect(accessibility.violations).toEqual([]);
});

test("formula pages contain only source-supported calculations with NCS positions", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/subject/subject-3/formula");
  await expect(page.getByText("버니어캘리퍼스", { exact: true })).toBeVisible();
  await expect(page.getByText("끼워맞춤", { exact: true })).toBeVisible();
  await expect(page.getByText("마이크로미터", { exact: true })).toBeVisible();
  await expect(page.getByText("플랜지 커플링", { exact: true })).toHaveCount(0);
  await expect(page.getByText("PDF p.84", { exact: false })).toBeVisible();
  await expect(page.getByText("PDF p.87", { exact: false })).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);

  await page.goto("/practical/written/theory/subject/subject-4/formula");
  await expect(
    page.getByText("원문으로 확인된 항목을 준비 중입니다"),
  ).toBeVisible();
  await expect(page.getByText("OEE", { exact: true })).toHaveCount(0);
});

test("hydraulic formula includes variables, units, and operating conditions", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/subject/subject-1/formula");
  await expect(page.getByText("유압실린더", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("전진추력 F₁=A₁·P·β");
  await expect(page.locator("main")).toContainText("β는 부하율(%)");
  await expect(page.locator("main")).toContainText("P[MPa]=N/mm²");
  await expect(page.getByText("PDF p.48", { exact: false })).toBeVisible();
});

test("formula pages separate NCS supplemental formulas from actual exam statistics", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/subject/subject-1/formula");
  await expect(page.getByText("공압실린더 출력", { exact: true })).toBeVisible();
  await expect(page.getByText("(+보강용)", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("F₊ = (πD²/4) × P");
  await expect(page.getByText("PDF p.24", { exact: false })).toBeVisible();

  await page.goto("/practical/written/theory/subject/subject-2/formula");
  await expect(page.getByText("탄소당량(Ceq)", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("WES Ceq = C + Mn/6");
  await expect(page.getByText("PDF p.16", { exact: false })).toBeVisible();
});

test("practical hub exposes only publishable source-backed content", async ({
  page,
}) => {
  await page.goto("/practical/written");
  await expect(page.getByText("21문제", { exact: true })).toBeVisible();
  await expect(page.getByText("86문제", { exact: true })).toBeVisible();
  await expect(
    page.locator('a[href^="/practical/written/theory/subject/subject-"]'),
  ).toHaveCount(4);
  for (const title of [
    "그림·사진 식별",
    "공식·계산",
    "이론·개념",
    "작업·절차형(필답)",
  ]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
});

test("every supplemental lesson exposes its NCS-grounded predicted question", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-SUP-001");
  await expect(page.getByText("(+보강용)", { exact: true })).toBeVisible();
  await expect(page.getByText("(출제 예상)", { exact: true })).toHaveCount(2);
  const predictedLink = page.locator(
    'a[href="/practical/written/question/EXP-SUP-001"]',
  );
  await expect(predictedLink).toHaveCount(1);
  await expect(predictedLink).toContainText("공압실린더 출력 예상문제");

  await predictedLink.click();
  await expect(page).toHaveURL(
    /\/practical\/written\/question\/EXP-SUP-001$/,
  );
  await expect(page.getByTestId("practical-answer-feedback")).toHaveCount(0);
  await page
    .locator("#practical-answer")
    .fill("전진 F=PπD²/4, 후진 F=Pπ(D²-d²)/4, 단위 통일");
  await page
    .locator("#practical-answer")
    .locator("..")
    .getByRole("button")
    .click();
  await expect(page.getByTestId("practical-answer-feedback")).toBeVisible();
});

test("practical category teaches NCS theory before past and predicted questions", async ({
  page,
}) => {
  await page.goto(
    "/practical/written/theory/category/formula_calculation",
  );
  const headings = page.getByRole("heading");
  await expect(headings.filter({ hasText: "연결 학습모듈과 수행내용" })).toBeVisible();
  await expect(headings.filter({ hasText: "관련 실기 이론" })).toBeVisible();
  await expect(headings.filter({ hasText: "기출복원" })).toBeVisible();
  await expect(headings.filter({ hasText: "출제예상" })).toBeVisible();
  const text = await page.locator("main").innerText();
  expect(text.indexOf("연결 학습모듈과 수행내용")).toBeLessThan(
    text.indexOf("기출복원"),
  );
  expect(text.indexOf("관련 실기 이론")).toBeLessThan(
    text.indexOf("기출복원"),
  );
});

test("NCS bearing question shows exactly the four source images used by the prompt", async ({
  page,
}) => {
  await page.goto("/practical/written/question/P-2025-1-Q04");
  const figure = page.getByTestId(
    "practical-visual-aid-ncs-bearing-four-types",
  );
  await expect(figure).toBeVisible();
  await expect(figure.getByRole("img")).toHaveCount(4);
  await expect(figure).toContainText("NCS");
  for (const [index, label] of ["가", "나", "다", "라"].entries()) {
    await expect(
      figure.getByTestId(`practical-visual-label-${index + 1}`),
    ).toHaveText(`(${label})`);
  }
  const imageSources = await figure
    .getByRole("img")
    .evaluateAll((images) =>
      images.map((image) => {
        const source = new URL((image as HTMLImageElement).src);
        return source.searchParams.get("url") ?? source.pathname;
      }),
    );
  expect(imageSources).toEqual([
    "/practical/ncs/bearing-cylindrical-roller.png",
    "/practical/ncs/bearing-tapered-roller.png",
    "/practical/ncs/bearing-thrust-ball.png",
    "/practical/ncs/bearing-thrust-needle.png",
  ]);
  const promptAlts = await figure
    .getByRole("img")
    .evaluateAll((images) => images.map((image) => image.getAttribute("alt")));
  expect(promptAlts.join(" ")).not.toMatch(
    /원통 롤러 베어링|테이퍼 롤러 베어링|스러스트 볼 베어링|스러스트 니들 베어링/,
  );

  const viewportWidth = page.viewportSize()?.width ?? 1280;
  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
});

test("practical answer and rubric remain hidden until the learner submits", async ({
  page,
}) => {
  await page.goto("/practical/written/question/P-2025-1-Q04");
  await expect(
    page.getByTestId("practical-answer-feedback"),
  ).toHaveCount(0);

  await page.locator("#practical-answer").fill("가, 나, 다, 라의 명칭과 특징");
  await page.locator("#practical-answer").locator("..").getByRole("button").click();
  await expect(page.getByTestId("practical-answer-feedback")).toBeVisible();
});

test("held practical questions stay unavailable and do not leak through the submit API", async ({
  request,
}) => {
  const route = await request.get(
    "/practical/written/question/P-2025-1-Q05",
  );
  expect(route.status()).toBe(404);

  const submit = await request.post("/api/practical/submit", {
    data: {
      questionId: "P-2025-1-Q05",
      answer: "사용자 답안",
      selfRating: "unknown",
    },
  });
  expect(submit.status()).toBe(404);
  expect(await submit.text()).not.toContain("modelAnswer");
});

test("practical submit API rejects an empty answer", async ({ request }) => {
  const submit = await request.post("/api/practical/submit", {
    data: { questionId: "P-2025-1-Q04", answer: "   " },
  });
  expect(submit.status()).toBe(400);
  expect(await submit.text()).not.toContain("modelAnswer");
});

test("image-dependent reconstructions without the exact NCS original stay held", async ({
  request,
}) => {
  for (const questionId of ["P-2025-1-Q10", "P-2025-2-Q01-1"]) {
    const route = await request.get(
      `/practical/written/question/${questionId}`,
    );
    expect(route.status()).toBe(404);
  }
});

test("predicted questions are labelled without a fabricated occurrence", async ({
  page,
}) => {
  await page.goto("/practical/written/question/EXP-B01");
  await expect(page.getByText("(출제 예상)", { exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/20\d{2}년\s*\d+회/);
});

test("a practical concept exposes responsive aids without linking held questions", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-004");

  await expect(page.locator('a[href*="P-2025-1-Q05"]')).toHaveCount(0);
  await expect(
    page.getByTestId("practical-visual-aid-ncs-bearing-four-types"),
  ).toBeVisible();
  await expect(
    page.locator('a[href^="/practical/work/"]').first(),
  ).toBeVisible();
  const accessibility = await new AxeBuilder({ page })
    .include("main")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("practical concept reads as a lesson and keeps source links at the end", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-040");
  const mainText = await page.locator("main").innerText();
  expect(mainText.indexOf("무엇이며, 어떻게 작동하는가")).toBeLessThan(
    mainText.indexOf("작동·조립·점검은 어떤 순서로 하는가"),
  );
  expect(
    mainText.indexOf("작동·조립·점검은 어떤 순서로 하는가"),
  ).toBeLessThan(
    mainText.indexOf("실기에서는 이렇게 묻습니다"),
  );
  expect(mainText.indexOf("실기에서는 이렇게 묻습니다")).toBeLessThan(
    mainText.indexOf("NCS 원문 근거"),
  );
  await expect(page.getByRole("link", { name: "NCS 원문 확인" })).toBeVisible();
  await expect(page.getByTestId("practical-concept-navigation").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /실기 이론 목차/ }).first(),
  ).toHaveAttribute("href", "/practical/written/theory");
  await expect(
    page.locator('a[href="/practical/written/theory/subject/subject-1"]').first(),
  ).toHaveAttribute("href", "/practical/written/theory/subject/subject-1");
  await expect(
    page.getByRole("link", { name: "기출복원 전체" }),
  ).toHaveAttribute("href", "/practical/written/past");
  await expect(
    page.getByRole("link", { name: "출제예상 전체" }),
  ).toHaveAttribute("href", "/practical/written/predicted");
  await expect(
    page.getByRole("link", { name: /이 개념 예상 \d+개/ }),
  ).toHaveAttribute("href", "#practical-predicted-questions");
  await expect(
    page.locator("#practical-predicted-questions"),
  ).toContainText("출제예상 · (출제 예상)");
  await expect(page.locator("main")).toContainText("축압기의 기능 3가지");
  await expect(page.locator("main")).toContainText("축압기 분해 전 조치 2가지");
  await expect(page.locator("main")).not.toContainText(
    "축압기의 기능 3가지와 분해 전 조치 2가지를 쓰시오.",
  );
});

test("practical sequence lessons distinguish component roles from actual order", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-SUP-005");

  await expect(
    page.getByRole("heading", { name: "구성요소와 역할" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "작동·조립·점검은 어떤 순서로 하는가",
    }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText(
    "서로 병렬인 구성요소·종류에는 임의 순번을 붙이지 않습니다.",
  );
  await expect(page.locator("main")).toContainText(
    "입력 → 논리·기억 → 출력 → 액추에이터 동작 → 위치검출 완료신호 → 다음 단계",
  );
  await expect(page.locator("main")).toContainText(
    "A 전진 → B 전진 → B 후진 → A 후진",
  );
  await expect(page.locator("main")).toContainText(
    "타이머와 카운터는 모든 회로에 직렬로 들어가는 구성품이 아니라",
  );
});

test("unsupported NCS links are not fabricated and OEE is separated from autonomous maintenance", async ({
  page,
}) => {
  await page.goto("/practical/written/theory/PCON-020");
  await expect(page.getByRole("heading", { name: "자주보전" })).toBeVisible();
  await expect(page.locator("main")).toContainText("운전자가 자기 설비");
  await expect(page.locator("main")).not.toContainText("OEE=시간가동률");
  await expect(page.getByRole("link", { name: "NCS 원문 확인" })).toHaveCount(0);

  await page.goto("/practical/written/theory/PCON-030");
  await expect(page.getByRole("heading", { name: "OEE", exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText(
    "OEE=시간가동률×성능가동률×양품률",
  );
  await expect(page.locator("main")).not.toContainText("초기청소");
});
