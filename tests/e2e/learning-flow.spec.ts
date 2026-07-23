import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import path from "node:path";

const auditManifest = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "src/data/generated/written-question-audit.json",
    ),
    "utf8",
  ),
) as { counts: { held: number } };

test("home exposes the main learning paths", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("설비보전기사 마스터북");
  await expect(page.getByRole("link", { name: "설비보전기사 마스터북 홈" })).toContainText("설비보전기사");
  await expect(page.getByRole("heading", { name: /문제를 맞히는 데서/ })).toBeVisible();
  const primaryPaths = page.getByTestId("primary-learning-paths");
  await expect(primaryPaths.getByRole("link", { name: "이론 보기", exact: true })).toHaveAttribute("href", "/written/theory");
  await expect(primaryPaths.getByRole("link", { name: "필기 모의고사", exact: true })).toHaveAttribute("href", "/written/mock");
  await expect(primaryPaths.getByRole("link", { name: "실기 모의고사", exact: true })).toHaveAttribute("href", "/practical/mock");
});

test("practice session is answer-safe and contains no duplicate question", async ({ request }) => {
  const response = await request.post("/api/practice/session", { data: { mode: "all", count: 20, seed: 12345 } });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.questions).toHaveLength(20);
  expect(new Set(body.questions.map((question: { id: string }) => question.id)).size).toBe(20);
  expect(body.questions.filter((question: { provenance: { original: boolean } }) => question.provenance.original)).toHaveLength(10);
  const serialized = JSON.stringify(body);
  expect(serialized).not.toContain("correctChoiceId");
  expect(serialized).not.toContain("answerText");
  expect(serialized).not.toContain("plausibleReason");
  expect(serialized).not.toContain("sourceUrls");
  expect(serialized).not.toContain("source_backed_reconstruction");
  expect(serialized).not.toContain("auditDisposition");
  expect(serialized).not.toContain("cbtAnswer");
  expect(serialized).not.toContain("verifiedAnswer");
  expect(serialized).not.toContain("evidenceUrls");
  expect(serialized).not.toContain("reviewNote");
  expect(body.questions.every((question: { provenance?: { reconstructed: boolean; historical: boolean } }) =>
    typeof question.provenance?.reconstructed === "boolean" && typeof question.provenance?.historical === "boolean",
  )).toBe(true);
});

test("draft routes return 404 without leaking draft titles or stems", async ({
  request,
}) => {
  const questionResponse = await request.get("/written/practice/U-1023");
  expect(questionResponse.status()).toBe(404);
  expect(await questionResponse.text()).not.toContain(
    "공기압축기 배관에 관한 설명으로 옳지 않은 것은?",
  );

  const lessonResponse = await request.get("/written/theory/lesson-u4nf6g");
  expect(lessonResponse.status()).toBe(404);
  expect(await lessonResponse.text()).not.toContain("진동 변위·속도 관계");
});

test("an actual past exam presentation remains gradeable through the canonical answer", async ({ request }) => {
  const session = await (await request.post("/api/practice/session", {
    data: { mode: "all", count: 20, seed: 20260723, originalRatio: 100 },
  })).json();
  const question = session.questions.find((candidate: { provenance: { original: boolean } }) => candidate.provenance.original);
  expect(question).toBeTruthy();
  expect(question.provenance.exam.sourceUrl).toMatch(/^https?:\/\//);

  const results = [];
  for (const choice of question.choices) {
    const response = await request.post("/api/practice/submit", {
      data: { questionId: question.id, choiceId: choice.id, selfRating: "unsure", attemptKind: "initial" },
    });
    expect(response.ok()).toBeTruthy();
    results.push(await response.json());
  }
  expect(results.filter((result) => result.isCorrect)).toHaveLength(1);
});

test("weak-area practice expands repeated mistakes within the selected subject", async ({ request }) => {
  const response = await request.post("/api/practice/session", {
    data: {
      mode: "weak",
      subjectId: "subject-1",
      count: 20,
      seed: 73,
      originalRatio: 75,
      guestQuestionIds: ["U-002", "U-002", "U-002", "U-003"],
    },
  });
  expect(response.ok()).toBeTruthy();
  const session = await response.json();
  expect(session.focus.fallback).toBe(false);
  expect(session.focus.groups[0]).toMatchObject({ id: "s1-g10", mistakes: 3 });
  expect(session.questions.every((question: { subjectId: string }) => question.subjectId === "subject-1")).toBe(true);
  expect(session.questions.every((question: { conceptGroupId: string }) =>
    session.focus.groups.some((group: { id: string }) => group.id === question.conceptGroupId),
  )).toBe(true);
  expect(session.actualOriginalCount).toBe(Math.round(session.questions.length * 0.75));
});

test("random practice lets users choose a past-exam ratio and weak subject", async ({ page }) => {
  await page.goto("/written/practice/random");
  await page.getByLabel("범위", { exact: true }).selectOption("weak");
  await expect(page.getByLabel("과목", { exact: true })).toBeVisible();
  await page.getByLabel("과목", { exact: true }).selectOption("subject-3");
  await page.getByLabel("실제 기출 비율", { exact: true }).selectOption("75");
  await expect(page.getByLabel("실제 기출 비율", { exact: true })).toHaveValue("75");
  await expect(page.getByText(/많이 틀린 최대 3개 영역/)).toBeVisible();
});

test("written mock preserves subject quotas without repeating or exposing unverified questions", async ({ request }) => {
  const response = await request.post("/api/practice/session", {
    data: {
      mode: "mock",
      count: 80,
      originalRatio: 50,
      seed: 80,
      subjectAllocations: [1, 2, 3, 4].map((code) => ({ subjectId: `subject-${code}`, count: 20 })),
    },
  });
  expect(response.ok()).toBeTruthy();
  const session = await response.json();
  expect(session.questions).toHaveLength(80);
  expect(new Set(session.questions.map((question: { id: string }) => question.id)).size).toBe(80);
  expect(session.subjectBreakdown.map((item: { actualCount: number }) => item.actualCount)).toEqual([20, 20, 20, 20]);
  expect(session.subjectBreakdown[1]).toMatchObject({ requestedCount: 20, limited: false });
  expect(session.actualOriginalCount).toBe(40);
  expect(session.questions.filter((question: { subjectId: string }) => question.subjectId === "subject-2")).toHaveLength(20);
});

test("written mock UI supports subject checkboxes and per-subject counts", async ({ page }) => {
  await page.goto("/written/mock");
  await expect(page.getByRole("heading", { name: "필기 모의고사", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByText("총 80문제", { exact: true })).toBeVisible();
  await expect(page.getByText("80문제 시작", { exact: true })).toBeVisible();
  await page.getByRole("checkbox").last().uncheck();
  await page.getByLabel("제1과목 문제 수").selectOption("10");
  await expect(page.getByText("총 50문제", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "75%" }).check();
  await expect(page.getByText(/실제 기출 목표 38문제/)).toBeVisible();
});

test("practical mock reserves a verified ten-question structure", async ({ page }) => {
  await page.goto("/practical/mock");
  await expect(page.getByRole("heading", { name: "실기 모의고사", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "10문제형 실기 모의고사", exact: true })).toBeVisible();
  await expect(page.getByText(/검증되지 않은 실기 문제는 임의로 출제하지 않습니다/)).toBeVisible();
});

test("admin review queue exposes every intentionally blocked item with evidence links", async ({ page }) => {
  await page.goto("/admin/review");
  await expect(page.getByRole("heading", { name: "필기 문제 감사·보류 목록" })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(auditManifest.counts.held);
  await expect(page.getByRole("link", { name: /근거 후보 1/ }).first()).toBeVisible();
});

test("held questions are unavailable from their direct public routes", async ({
  request,
}) => {
  const sourceMissing = await request.get("/written/practice/U-267");
  expect(sourceMissing.status()).toBe(404);
  const assetMissing = await request.get("/written/practice/U-035");
  expect(assetMissing.status()).toBe(404);
  const verified = await request.get("/written/practice/U-004");
  expect(verified.status()).toBe(200);
});

test("supplemental theory is searchable, badged, and visually responsive", async ({
  page,
}) => {
  await page.goto("/search?q=로드셀");
  await expect(page.getByTestId("supplemental-lesson-badge").first()).toBeVisible();

  await page.goto("/written/theory/supplemental-written-load-cell");
  await expect(page.getByRole("heading", { name: "로드셀의 구조와 힘 측정" })).toBeVisible();
  await expect(page.getByTestId("supplemental-lesson-badge")).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: /하중이 탄성체를 변형하고 네 개의 스트레인게이지 브리지 출력/,
    }),
  ).toBeVisible();
  await expect(page.getByText("출처: 자체 제작 · 라이선스: 프로젝트 자체 제작물")).toBeVisible();

  const viewportWidth = page.viewportSize()?.width ?? 1280;
  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
  const accessibility = await new AxeBuilder({ page })
    .include("main")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("theory index groups lessons into semantic category disclosures", async ({ page }) => {
  await page.goto("/written/theory");
  await page.waitForLoadState("networkidle");

  const lubricantCategories = page.getByTestId("lesson-categories-s4-g14");
  await expect(lubricantCategories).toBeVisible();
  await expect(page.getByTestId("lesson-category-s4-g14-degradation").locator(":scope > summary")).toContainText("열화·산화·유화·오염");
  await expect(page.getByTestId("lesson-category-s4-g14-grease").locator(":scope > summary")).toContainText("그리스 종류·특성·급유");
  await expect(page.getByTestId("lesson-category-s4-g14-additive").locator(":scope > summary")).toContainText("윤활유 첨가제");
  await expect(page.getByTestId("lesson-category-s4-g14-test").locator(":scope > summary")).toContainText("시험·판정·시료채취");

  const degradation = page.getByTestId("lesson-category-s4-g14-degradation");
  await expect(degradation).not.toHaveAttribute("open", "");
  await degradation.locator(":scope > summary").click();
  const familyLink = page.getByTestId("lesson-family-link-s4-g14-degradation");
  await expect(familyLink).toBeVisible();
  await expect(familyLink).toHaveAttribute("href", "/written/theory/family/s4-g14/degradation");
  await degradation.getByText(/세부 개념 \d+개 바로가기/).click();
  await expect(degradation.locator("ul")).toBeVisible();
  await expect(degradation.getByRole("link", { name: "윤활유 열화판정", exact: true })).toBeVisible();
});

test("PID is taught as one family with issue-based application and question-specific traps", async ({ page }) => {
  await page.goto("/written/theory/family/s1-g11/action");

  await expect(page.getByRole("heading", { name: "P·I·D 제어동작", level: 1 })).toBeVisible();
  await expect(page.getByText("P·비례동작", { exact: true })).toBeVisible();
  await expect(page.getByText("I·적분동작", { exact: true })).toBeVisible();
  await expect(page.getByText("D·미분동작", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "개념", exact: true })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "P 제어", exact: true })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "I 제어", exact: true })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "D 제어", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "같은 설정값 변화에 대한 P·PI·PID 응답 비교" })).toBeVisible();
  await expect(page.getByRole("img", { name: /P, PI, PID 제어의 정성적 시간응답 비교 그래프/ })).toBeVisible();
  const fieldApplication = page.getByTestId("field-application-toggle");
  const fieldApplicationSummary = fieldApplication.locator(":scope > summary");
  await expect(fieldApplication).not.toHaveAttribute("open", "");
  await expect(fieldApplicationSummary).toContainText("펼쳐보기");
  await expect(page.getByText("설정값을 바꿨는데 현재값이 너무 느리게 따라온다.")).not.toBeVisible();
  await fieldApplicationSummary.focus();
  await fieldApplicationSummary.press("Enter");
  await expect(fieldApplication).toHaveAttribute("open", "");
  await expect(fieldApplicationSummary).toContainText("접기");
  await expect(page.getByText("설정값을 바꿨는데 현재값이 너무 느리게 따라온다.")).toBeVisible();
  await expect(page.getByText("응답은 안정됐지만 목표값과 실제값 사이에 작은 편차가 계속 남는다.")).toBeVisible();
  const pidLab = page.getByTestId("textbook-activity-pid-effects");
  await expect(pidLab.getByRole("heading", { name: "직접 바꾸며 원리 확인하기" })).toBeVisible();
  await pidLab.getByLabel("I · 누적 편차 보정").fill("85");
  await expect(pidLab.getByText("정상편차 제거").locator("..")).toContainText("높음");
  await pidLab.getByRole("button", { name: "힌트 1 보기" }).click({ force: true });
  await expect(pidLab).toContainText("현재값·누적값·변화 속도");
  await expect(page.getByTestId("trap-question-U-683")).toBeVisible();
  await expect(page.getByTestId("trap-question-U-556")).toBeVisible();
  await expect(page.getByTestId("trap-question-U-329")).toBeVisible();
  await expect(page.getByTestId("trap-question-U-030")).toBeVisible();
  await expect(page.locator("#question-traps")).not.toContainText("정답 판단 기준");
  await expect(page.locator("#question-traps")).not.toContainText("왜 오답인가");
});

test("accumulator lesson explores pressure relations before linked actual exams", async ({ page }) => {
  await page.goto("/written/theory/family/s1-g02/accumulator");

  await expect(page.getByRole("heading", { name: "개념", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "이 묶음이 다루는 범위" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "작동 원리" })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "기출 유형" })).toBeVisible();
  await expect(page.getByText("기능 혼동형: ‘회로압 증대’를 어큐뮬레이터의 기능처럼 제시해 증압기와 혼동하게 한다.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "압력이 바뀔 때 가스와 작동유의 움직임" })).toBeVisible();
  await expect(page.getByRole("img", { name: "어큐뮬레이터 충전·저장 상태 구조도" })).toBeVisible();
  await expect(page.getByRole("img", { name: "어큐뮬레이터 방출·보상 상태 구조도" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/U-\d{3}/);

  const lab = page.getByTestId("textbook-activity-accumulator-pressure");
  await expect(lab.getByText("봉입압력비 p₀ ÷ pₛ")).toBeVisible();
  const slider = lab.getByLabel("봉입압력비 p₀ ÷ pₛ");
  await slider.focus();
  await slider.press("End");
  await expect(lab.getByTestId("accumulator-relation")).toHaveAttribute("data-relation", "higher");
  await expect(lab).toContainText("작동유가 들어가기 어렵습니다");
  await slider.press("Home");
  await expect(lab.getByTestId("accumulator-relation")).toHaveAttribute("data-relation", "lower");
  await expect(lab.getByRole("link", { name: /연결 문제 5개 풀기/ })).toHaveAttribute("href", "#practice-set");
});

test("welding classification compares the actual joining mechanism without a client answer key", async ({ page }) => {
  await page.goto("/written/theory/family/s2-g01/classification");

  await expect(page.getByRole("heading", { name: "모재·압력·용가재로 구분하는 용접 분류" })).toBeVisible();
  await expect(page.getByRole("img", { name: "융접의 결합 원리" })).toBeVisible();
  await expect(page.getByRole("img", { name: "압접의 결합 원리" })).toBeVisible();
  await expect(page.getByRole("img", { name: "납땜의 결합 원리" })).toBeVisible();
  const lab = page.getByTestId("textbook-activity-welding-classification");
  await lab.getByRole("button", { name: "압접" }).click({ force: true });
  const panel = lab.getByTestId("welding-classification-panel");
  await expect(panel).toContainText("열과 함께 가압력이 핵심");
  await expect(panel).toContainText("저항점용접");
  await expect(panel).toContainText("저항열로 접합부가 가열되므로 융접이라고 판단");
  await lab.getByRole("button", { name: "납땜" }).click({ force: true });
  await expect(panel).toContainText("모재는 녹이지 않는다");
  await expect(panel).toContainText("용가재만 녹인다");
});

test("five arc-welding processes are compared before answer-safe practice", async ({ page }) => {
  await page.goto("/written/theory/family/s2-g02/process");

  await expect(page.getByRole("heading", { name: "피복아크·TIG·MIG/MAG·FCAW·SAW", level: 1 })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    const processTable = page.getByRole("region", { name: "아크용접 공정별 전극과 차폐방식 비교표" });
    await expect(processTable.getByRole("rowheader", { name: "SMAW", exact: true })).toBeVisible();
    await expect(processTable.getByRole("rowheader", { name: "GTAW", exact: true })).toBeVisible();
    await expect(processTable.getByRole("rowheader", { name: "GMAW", exact: true })).toBeVisible();
    await expect(processTable.getByRole("rowheader", { name: "FCAW", exact: true })).toBeVisible();
    await expect(processTable.getByRole("rowheader", { name: "SAW", exact: true })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "SMAW", level: 3, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GTAW", level: 3, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GMAW", level: 3, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "FCAW", level: 3, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "SAW", level: 3, exact: true })).toBeVisible();
  }
  await expect(
    page.getByTestId("textbook-activity-welding-classification")
      .getByRole("group", { name: "용접 분류 선택" })
      .getByRole("button"),
  ).toHaveCount(5);

  const preview = page.getByTestId("trap-question-WELD-PROC-002");
  await expect(preview).toContainText("비소모성 텅스텐 전극");
  await expect(preview).not.toContainText("정답 판단 기준");
  await expect(preview).not.toContainText("왜 오답인가");

  await preview.getByRole("link", { name: "직접 풀기" }).click();
  await expect(page).toHaveURL(/\/written\/practice\/WELD-PROC-002$/);
  await expect(page.getByText("원문 근거 학습용 재구성")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("정답입니다");
  await expect(page.locator("main")).not.toContainText("전체 해설");
});

test("an individual PID lesson starts with its related family and replaces the generic trap copy", async ({ page }) => {
  await page.goto("/written/theory/lesson-bx3sdi");

  const family = page.getByTestId("lesson-family-overview");
  await expect(family).toContainText("먼저 함께 구분할 용어");
  await expect(family.getByRole("link", { name: /P·I·D 제어동작 전체를 묶어서 비교/ })).toHaveAttribute(
    "href",
    "/written/theory/family/s1-g11/action",
  );
  await expect(page.getByTestId("trap-question-U-556")).toContainText("제어편차의 변화율");
  await expect(page.getByTestId("trap-question-U-556")).not.toContainText("정답 판단 기준");
  await expect(page.getByText("같은 세부항목군에서 함께 학습하는 용어이므로", { exact: false })).toHaveCount(0);
});

test("lesson formulas render as readable math instead of raw LaTeX", async ({ page }) => {
  await page.goto("/written/theory/lesson-tcxwqa");

  const formula = page.locator(".katex").filter({ hasText: "Q" }).first();
  await expect(formula).toBeVisible();
  await expect(page.getByText(String.raw`$Q\propto\sqrt{\Delta p}$`, { exact: true })).toHaveCount(0);
  await expect(page.locator(".katex-mathml math").first()).toHaveCount(1);
});

test("lesson explains the concept before actual past exams and similar practice", async ({ page }) => {
  await page.goto("/written/theory/lesson-tcxwqa");

  await expect(page.getByRole("heading", { name: "개념부터 이해하기" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "기출 문제 풀기" })).toBeVisible();
  await expect(page.getByTestId("past-exam-2018-2-Q88")).toBeVisible();
  await expect(page.getByText("2018년 2회 · 88번", { exact: true })).toBeVisible();

  const pastExamsBox = await page.locator("#past-exams").boundingBox();
  const conceptBox = await page.locator("#concept").boundingBox();
  expect(conceptBox?.y ?? Number.MAX_SAFE_INTEGER).toBeLessThan(pastExamsBox?.y ?? 0);

  const practiceSet = page.getByTestId("lesson-practice-set");
  await expect(practiceSet.getByRole("heading", { name: "실전 유사 문제 풀기" })).toBeVisible();
  await expect(practiceSet.getByRole("link").first()).toHaveAttribute("href", "/written/practice/U-748");
  await expect(practiceSet).toContainText("답을 제출하기 전에는 정답과 해설을 전송하지 않습니다.");
});

test("family study explains concepts before more actual exams and concrete adhesive choices", async ({ page }) => {
  await page.goto("/written/theory/family/s3-g08/surface");

  const pastExams = page.locator("#past-exams");
  const traps = page.locator("#question-traps");
  const relatedTerms = page.locator("#related-terms");
  await expect(pastExams.locator("details")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "기출 문제 풀기" })).toBeVisible();

  const pastExamsBox = await pastExams.boundingBox();
  const trapsBox = await traps.boundingBox();
  const relatedTermsBox = await relatedTerms.boundingBox();
  expect(relatedTermsBox?.y ?? Number.MAX_SAFE_INTEGER).toBeLessThan(pastExamsBox?.y ?? 0);
  expect(pastExamsBox?.y ?? Number.MAX_SAFE_INTEGER).toBeLessThan(trapsBox?.y ?? 0);

  const adhesiveQuestion = page.getByTestId("trap-question-U-727");
  await expect(adhesiveQuestion).toContainText("구조용 접착제가 갖추어야 할 성질");
  await expect(adhesiveQuestion).toContainText("접착강도");
  await expect(adhesiveQuestion).toContainText("경화안정성");
  await expect(adhesiveQuestion.getByText("이 보기의 뜻", { exact: true })).toHaveCount(0);
  await expect(adhesiveQuestion.getByText("왜 오답인가", { exact: true })).toHaveCount(0);
});

test("actual past exam grades inline and reveals the explanation without navigation", async ({ page }) => {
  await page.goto("/written/theory/lesson-tcxwqa");
  const originalUrl = page.url();
  const question = page.getByTestId("past-exam-2018-2-Q88");

  await expect(question.getByText("전체 해설", { exact: true })).toHaveCount(0);
  await question.locator("fieldset button").first().click();
  await question.getByRole("button", { name: "정답 확인" }).click({ force: true });

  const feedback = question.getByTestId("past-exam-feedback-2018-2-Q88");
  await expect(feedback).toContainText(/정답입니다|오답입니다/);
  await expect(feedback.getByText("전체 해설", { exact: true })).toBeVisible();
  await expect(feedback.getByRole("button", { name: "정답 숨기고 다시 풀기" })).toBeVisible();
  expect(page.url()).toBe(originalUrl);
});

test("family comparison rows use distinct actual exam effects and cautions", async ({ page }) => {
  await page.goto("/written/theory/family/s4-g14/application");

  await expect(page.getByRole("heading", { name: "용도별 윤활유 기출 판단 지도" })).toBeVisible();
  await expect(page.getByTestId("family-decision-map").locator(":scope > article")).toHaveCount(3);
  await expect(page.getByText("명칭만으로 판단하지 말고 대상·조건·기능이 모두 맞는지 확인한다.", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "기출 유형" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "실제 함정" })).toBeVisible();
  await expect(page.locator("#comparison tbody tr").first()).toContainText(/실제 함정 보기|부정형 함정/);
});

test("lesson past exams show three previews and reveal the rest in batches", async ({ page }) => {
  await page.goto("/written/theory/lesson-5cda76");
  const section = page.locator("#past-exams");
  await expect(section.locator("details")).toHaveCount(3);

  await section.getByTestId("past-exam-more").click();

  await expect(section.locator("details")).toHaveCount(6);
  await expect(section.getByRole("button", { name: "처음 3개만 보기" })).toBeVisible();
});

test("mobile header exposes the complete navigation", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 768, "mobile-only navigation check");
  await page.goto("/");
  const menu = page.getByRole("button", { name: "메뉴 열기" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole("navigation", { name: "모바일 주 메뉴" })).toBeVisible();
  await expect(page.getByRole("link", { name: "통합 검색" })).toBeVisible();
});

test("wrong answer links to a theory anchor", async ({ request }) => {
  const session = await (await request.post("/api/practice/session", { data: { mode: "all", count: 10, seed: 7 } })).json();
  const question = session.questions[0];
  const response = await request.post("/api/practice/submit", {
    data: { questionId: question.id, choiceId: question.choices[1].id, selfRating: "unsure", attemptKind: "initial" },
  });
  expect(response.ok()).toBeTruthy();
  const feedback = await response.json();
  expect(feedback.lesson.href).toMatch(/^\/written\/theory\/.+#(principle|formula|diagnosis|trap|source)$/);
  expect(feedback.selectedChoice.keyRule).toBeTruthy();
  expect(feedback.conceptSupport?.summary).toHaveLength(3);
  expect(feedback.conceptSupport?.blocks.length).toBeGreaterThan(0);
});

test("theory remediation preserves a return-to-retry location", async ({ page, request }) => {
  const session = await (await request.post("/api/practice/session", { data: { mode: "all", count: 10, seed: 11 } })).json();
  const question = session.questions[0];
  let feedback;
  for (const choice of question.choices) {
    const result = await request.post("/api/practice/submit", {
      data: { questionId: question.id, choiceId: choice.id, selfRating: "unsure", attemptKind: "initial" },
    });
    const candidate = await result.json();
    if (!candidate.isCorrect) { feedback = candidate; break; }
  }
  expect(feedback).toBeTruthy();
  const returnTo = `/written/practice/random?resume=${session.sessionId}&index=0&retry=${question.id}`;
  await page.goto(`/written/theory/${feedback.lesson.id}?returnTo=${encodeURIComponent(returnTo)}#${feedback.lesson.anchor}`);
  const returnLink = page.getByRole("link", { name: /문제로 돌아가/ });
  await expect(returnLink).toBeVisible();
  await Promise.all([
    page.waitForURL(new RegExp(`resume=${session.sessionId}`), { timeout: 15_000 }),
    returnLink.click(),
  ]);
});
