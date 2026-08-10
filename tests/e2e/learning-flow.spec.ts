import { expect, test, type APIRequestContext } from "@playwright/test";
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

const WELDING_HOLD_QUESTION_ID =
  "wcbt-50ea9e7d-008c-45e1-a35c-21ad26b026cc";
const WELDING_CALCULATION_QUESTION_IDS = [
  "wcbt-4533db22-25e9-48ab-8060-a0559a855a21",
  "wcbt-b37a80db-aab9-4a62-bcd3-c06e960f18b8",
  "wcbt-c67f0293-11ab-4da5-9b2f-06accefc995e",
  "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe",
  "wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb",
] as const;

async function selectPublishableWeldingCalculationQuestion(
  request: APIRequestContext,
) {
  for (const questionId of WELDING_CALCULATION_QUESTION_IDS) {
    const response = await request.get(`/written/practice/${questionId}`);
    if (response.ok()) return questionId;
    if (response.status() !== 404) {
      throw new Error(
        `Unexpected status ${response.status()} for welding calculation ${questionId}`,
      );
    }
  }
  throw new Error("No approved welding calculation question is publicly available.");
}

test("home exposes the main learning paths", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("설비보전기사 마스터북");
  await expect(page.getByRole("link", { name: "설비보전기사 마스터북 홈" })).toContainText("설비보전기사");
  await expect(page.getByRole("heading", { name: /이론에서 문제까지/ })).toBeVisible();
  const primaryPaths = page.getByTestId("primary-learning-paths");
  await expect(primaryPaths.getByRole("link", { name: "이론 학습", exact: true })).toHaveAttribute("href", "/theory");
  await expect(primaryPaths.getByRole("link", { name: "필기 모의고사", exact: true })).toHaveAttribute("href", "/written/mock");
  await expect(primaryPaths.getByRole("link", { name: "필답 모의고사", exact: true })).toHaveAttribute("href", "/practical/mock");
  await expect(primaryPaths.getByRole("link", { name: "실기 정보", exact: true })).toHaveAttribute("href", "/practical/info");
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
  await expect(page.getByText(/새 세션마다 선택 범위의 공개 문제를 무작위 순서로 출제/)).toBeVisible();
  await page.getByLabel("범위", { exact: true }).selectOption("weak");
  await expect(page.getByLabel("과목", { exact: true })).toBeVisible();
  await page.getByLabel("과목", { exact: true }).selectOption("subject-3");
  await page.getByLabel("실제 기출 비율", { exact: true }).selectOption("75");
  await expect(page.getByLabel("실제 기출 비율", { exact: true })).toHaveValue("75");
  await expect(page.getByText(/많이 틀린 최대 3개 영역/)).toBeVisible();
});

test("login explains the seven-day inactivity deletion policy", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByText(
      /마지막 로그인 또는 인증된 학습 활동 후 7일이 지나면 계정이 자동 삭제/,
    ),
  ).toBeVisible();
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

test("standard mock keeps direct-review subjects answer-safe and returns complete feedback only after submission", async ({
  request,
}) => {
  const response = await request.post("/api/practice/session", {
    data: {
      mode: "mock",
      count: 80,
      originalRatio: 50,
      seed: 20260804,
      subjectAllocations: [1, 2, 3, 4].map((code) => ({
        subjectId: `subject-${code}`,
        count: 20,
      })),
    },
  });
  expect(response.ok()).toBeTruthy();

  const session = (await response.json()) as {
    questions: Array<{
      id: string;
      subjectId: string;
      choices: Array<{ id: string; text: string }>;
    }>;
  };
  expect(session.questions).toHaveLength(80);

  const serialized = JSON.stringify(session);
  for (const forbiddenField of [
    "correctChoiceId",
    "answerText",
    "explanation",
    "approvedReview",
    "conceptBinding",
  ]) {
    expect(
      serialized,
      `standard mock pre-submit payload leaks ${forbiddenField}`,
    ).not.toContain(`\"${forbiddenField}\"`);
  }

  for (const subjectId of ["subject-1", "subject-3", "subject-4"]) {
    const subjectQuestions = session.questions.filter(
      (question) => question.subjectId === subjectId,
    );
    expect(subjectQuestions, `${subjectId} standard allocation`).toHaveLength(20);

    const question = subjectQuestions[0];
    if (!question) {
      throw new Error(`${subjectId} standard allocation did not return a question.`);
    }
    expect(question.choices).toHaveLength(4);
    let feedback: {
      isCorrect: boolean;
      feedbackQuality: string;
      feedbackNotice: string | null;
      selectedChoice: { id: string; rationale: string; keyRule: string };
      otherChoices: Array<{
        id: string;
        rationale: string;
        keyRule: string;
      }>;
      lesson: { href: string };
      approvedReview?: {
        directSolution: string;
        conceptBinding: { assertionText: string; href: string };
      };
    } | undefined;

    // The session response deliberately omits the answer. Try visible choices
    // until the server identifies an incorrect response after submission.
    for (const choice of question.choices) {
      const submit = await request.post("/api/practice/submit", {
        data: {
          questionId: question.id,
          choiceId: choice.id,
          selfRating: "unsure",
          attemptKind: "initial",
        },
      });
      expect(submit.ok()).toBeTruthy();
      const candidate = (await submit.json()) as typeof feedback;
      if (candidate && !candidate.isCorrect) {
        feedback = candidate;
        break;
      }
    }

    expect(feedback, `${subjectId} exposes an incorrect-answer result`).toBeTruthy();
    expect(feedback).toMatchObject({
      isCorrect: false,
      feedbackQuality: "approved_direct",
      feedbackNotice: null,
    });
    expect(feedback?.approvedReview?.directSolution).toMatch(/\S/u);
    expect(feedback?.approvedReview?.conceptBinding.assertionText).toMatch(/\S/u);
    expect(feedback?.approvedReview?.conceptBinding.href).toMatch(
      /^\/written\/theory\/.+#[-a-z0-9]+$/u,
    );
    expect(feedback?.lesson.href).toBe(
      feedback?.approvedReview?.conceptBinding.href,
    );
    const [conceptPath, conceptAnchor] = (
      feedback?.approvedReview?.conceptBinding.href ?? ""
    ).split("#", 2);
    const conceptResponse = await request.get(conceptPath);
    expect(conceptResponse.ok()).toBeTruthy();
    expect(await conceptResponse.text()).toContain(`id=\"${conceptAnchor}\"`);

    const choiceFeedback = [
      feedback?.selectedChoice,
      ...(feedback?.otherChoices ?? []),
    ];
    expect(choiceFeedback).toHaveLength(4);
    expect(new Set(choiceFeedback.map((choice) => choice?.id)).size).toBe(4);
    expect(
      new Set(choiceFeedback.map((choice) => choice?.rationale)).size,
    ).toBe(4);
    for (const choice of choiceFeedback) {
      expect(choice?.rationale).toMatch(/\S/u);
      expect(choice?.keyRule).toMatch(/\S/u);
    }
  }
});

test("written mock UI supports subject checkboxes and per-subject counts", async ({ page }) => {
  await page.goto("/written/mock");
  await expect(page.getByRole("heading", { name: "필기 모의고사", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByText("총 80문제", { exact: true })).toBeVisible();
  await expect(page.getByText("80문제 시작", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: /제4과목/ }).uncheck();
  await page.getByLabel("제1과목 문제 수").selectOption("10");
  await expect(page.getByText("총 50문제", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "75%" }).check();
  await expect(page.getByText(/실제 기출 목표 38문제/)).toBeVisible();
});

test("practical mock route configures reconstructed and predicted questions", async ({ page }) => {
  await page.goto("/practical/mock");
  await expect(page.getByRole("heading", { name: "필답 모의고사", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "기출 + 예상 혼합" })).toBeVisible();
  await expect(page.getByRole("button", { name: /문제 모의고사 시작/ })).toBeVisible();
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
  for (const questionId of [
    "U-035",
    "U-040",
    "U-129",
    "U-319",
    "U-332",
    "U-477",
    "U-1345",
  ]) {
    const assetMissing = await request.get(`/written/practice/${questionId}`);
    expect(assetMissing.status(), questionId).toBe(404);
  }
  const verified = await request.get("/written/practice/U-004");
  expect(verified.status()).toBe(200);
});

test("restored written symbol renders before submit and grades normally", async ({
  page,
}) => {
  await page.goto("/written/practice/U-722");

  const visual = page.getByTestId("written-question-visual-U-722");
  await expect(visual).toBeVisible();
  await expect(visual.locator("svg")).toHaveCount(1);
  await expect(visual).toContainText("자체 재작성한 학습용 도해");
  await expect(page.getByTestId("inline-cbt-feedback-U-722")).toHaveCount(0);

  await page.getByRole("button", { name: /2\.\s*공압모터/ }).click();
  await page.getByTestId("inline-cbt-submit-U-722").click();
  await expect(page.getByTestId("inline-cbt-feedback-U-722")).toBeVisible();
});

test("welding review fields stay out of the pre-submit practice session payload", async ({
  request,
}) => {
  const questionId =
    await selectPublishableWeldingCalculationQuestion(request);
  const response = await request.post("/api/practice/session", {
    data: {
      mode: "wrong",
      count: 1,
      guestQuestionIds: [questionId],
      originalRatio: 0,
      seed: 20260803,
      shuffleChoices: false,
    },
  });
  expect(response.ok()).toBeTruthy();

  const session = await response.json();
  expect(session.questions).toHaveLength(1);
  expect(session.questions[0]?.id).toBe(questionId);
  const serialized = JSON.stringify(session);
  for (const forbiddenField of [
    "approvedReview",
    "answerExplanation",
    "solutionSteps",
    "choiceFeedback",
    "keyRule",
    "conceptBinding",
    "assertionText",
    "essentialRank",
  ]) {
    expect(
      serialized,
      `pre-submit payload leaks ${forbiddenField}`,
    ).not.toContain(`"${forbiddenField}"`);
  }
});

test("HOLD welding question stays unavailable from its direct public route", async ({
  request,
}) => {
  const response = await request.get(
    `/written/practice/${WELDING_HOLD_QUESTION_ID}`,
  );
  expect(response.status()).toBe(404);
  expect(await response.text()).not.toContain(
    "용해 아세틸렌을 충전했을 때",
  );
});

test("approved welding calculation shows one structured solution and reaches its concept anchor", async ({
  page,
  request,
}) => {
  const questionId =
    await selectPublishableWeldingCalculationQuestion(request);
  await page.goto(`/written/practice/${questionId}`);
  await page.waitForLoadState("networkidle");

  const choiceButtons = page.locator('main [role="group"] button');
  await expect(choiceButtons).toHaveCount(4);
  await choiceButtons.first().click();
  const submitButton = page.getByTestId(`inline-cbt-submit-${questionId}`);
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  const feedback = page.getByTestId("approved-review-feedback");
  await expect(feedback).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "공식 적용으로 분류했어요" }),
  ).toBeVisible();
  await expect(feedback.getByText("정답 풀이", { exact: true })).toBeVisible();
  await expect(
    feedback
      .getByText("정답 풀이", { exact: true })
      .locator("..")
      .locator(".markdown-content"),
  ).toContainText(/\S/u);

  for (const title of ["공식", "대입", "결과", "단위"]) {
    const term = feedback.locator("dt", { hasText: title }).locator("..");
    await expect(term.locator("dd")).toContainText(/\S/u);
  }
  await expect(page.getByText("전체 해설", { exact: true })).toHaveCount(0);

  const conceptLink = feedback.getByRole("link", {
    name: "개념에서 확인하기",
  });
  const actualHref = await conceptLink.getAttribute("href");
  expect(actualHref).toBeTruthy();
  const destination = new URL(actualHref ?? "", page.url());
  expect(destination.hash).toMatch(/^#[a-z0-9-]+$/u);

  await conceptLink.click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === destination.pathname && url.hash === destination.hash,
  );
  await expect(page.locator(destination.hash)).toBeVisible();
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
  await page.goto("/written/theory/subject/subject-4");
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

test("subject one starts with an integrated memory guide and keeps every detail route", async ({ page }) => {
  await page.goto("/written/theory/subject/subject-1");
  await page.waitForLoadState("networkidle");

  const guide = page.getByTestId("written-subject-one-memory-guide");
  await expect(guide.getByRole("heading", { name: "공유압 및 자동제어를 23개 흐름으로 묶어보기" })).toBeVisible();
  await expect(guide.getByTestId("subject-one-bundle-fluid-foundation")).toContainText("단위·유체 물성·압력");
  await expect(guide.getByTestId("subject-one-bundle-automatic-control")).toContainText("개회로·피드백·PID·응답");
  await expect(
    guide.getByTestId("subject-one-bundle-measurement-sampling-errors"),
  ).toContainText("센서 원리·4–20 mA·샘플링·오차");
  const lawsBundle = guide.getByTestId("subject-one-bundle-fluid-laws");
  await lawsBundle.locator(":scope > summary").click();
  await expect(guide.getByRole("link", { name: "보일 법칙", exact: true })).toHaveAttribute(
    "href",
    "/written/theory/lesson-m8noqg",
  );

  await guide.locator("#subject-one-fluid-equipment > summary").click();
  const pneumaticBundle = guide.getByTestId(
    "subject-one-bundle-pneumatic-foundation",
  );
  await expect(pneumaticBundle).toHaveAttribute("open", "");
  const traps = guide.getByTestId("subject-one-traps-pneumatic-foundation");
  await expect(traps).not.toHaveAttribute("open", "");
  await traps.locator(":scope > summary").click();
  await expect(traps).toHaveAttribute("open", "");
  await expect(traps).toContainText("원심식과 축류식 압축기는 용적형이다.");
  await expect(traps).toContainText("둘 다 동력형(터보형)입니다.");
  const pneumaticCbt = guide.getByTestId(
    "subject-one-cbt-pneumatic-foundation",
  );
  await expect(pneumaticCbt).toContainText("관련 실제 CBT 원문");
  await expect(pneumaticCbt).toContainText("원문 확인");
  await pneumaticCbt.locator(":scope > summary").click();
  const pneumaticQuestion = pneumaticCbt
    .locator('[data-testid^="inline-cbt-question-"]')
    .first();
  await pneumaticQuestion.locator(":scope > summary").click();
  await expect(pneumaticQuestion.getByRole("button").first()).toBeVisible();
  await expect(pneumaticQuestion).toContainText("원문 기출");
  await expect(pneumaticQuestion).not.toContainText("원문 근거 학습용 재구성");
  await expect(pneumaticQuestion.getByRole("link", { name: "기출 근거 확인" })).toBeVisible();
  await expect(page).toHaveURL(/\/written\/theory/);
  await expect(
    guide.locator('a[href*="notion.site"]'),
  ).toHaveCount(0);
  await expect(guide.getByText("과목 전체 종합정리 원문 펼쳐보기")).toHaveCount(0);

  const fullIndex = page.getByTestId("written-subject-one-full-index");
  await expect(fullIndex).not.toHaveAttribute("open", "");
  await fullIndex.locator(":scope > summary").click();
  await expect(fullIndex).toHaveAttribute("open", "");
  await expect(page.getByTestId("lesson-categories-s1-g01")).toBeVisible();
});

test("integrated CBT cards use only direct original exam text", async ({ page }) => {
  await page.goto("/written/theory/subject/subject-1");
  await page.waitForLoadState("networkidle");

  const cbt = page.getByTestId("subject-one-cbt-fluid-foundation");
  await expect(cbt).toContainText("관련 실제 CBT 원문", {
    timeout: 30_000,
  });
  await expect(cbt).toContainText("원문 확인 5문제");
  await cbt.locator(":scope > summary").click();

  const questions = cbt.locator('[data-testid^="inline-cbt-question-"]');
  await expect(questions).toHaveCount(5);
  const firstQuestion = questions.first();
  await firstQuestion.locator(":scope > summary").click();

  await expect(firstQuestion).toContainText("원문 기출");
  await expect(firstQuestion).not.toContainText("원문 근거 학습용 재구성");
  await expect(
    firstQuestion.getByRole("link", { name: "기출 근거 확인" }),
  ).toHaveAttribute("href", /comcbt|cbtbank/i);

  const mock = page.getByTestId("subject-one-mock-fluid-foundation");
  await expect(mock).toContainText("관련 모의고사");
  await expect(mock).toContainText(/모의 확인 [1-5]문제/);
  await mock.locator(":scope > summary").click();
  await expect(
    mock.locator('[data-testid^="inline-cbt-question-"]'),
  ).toHaveCount(5);
  await expect(mock).not.toContainText("원문 기출");
});

test("subject two follows the integrated source and preserves its detail routes", async ({ page }) => {
  await page.goto("/written/theory/subject/subject-2");
  await page.waitForLoadState("networkidle");

  const guide = page.getByTestId("written-subject-two-memory-guide");
  await expect(
    guide.getByRole("heading", {
      name: "용접 및 안전관리를 18개 흐름으로 묶어보기",
    }),
  ).toBeVisible();
  await expect(
    guide.getByTestId("subject-two-bundle-classification-joints"),
  ).toContainText("융접·압접·납땜과 이음의 기본");
  await expect(
    guide.getByTestId("subject-two-bundle-inspection"),
  ).toContainText("VT·PT·MT·ET·UT·RT와 파괴검사");
  await expect(
    guide.getByTestId("subject-two-bundle-ppe-classification-details"),
  ).toContainText("안전모·안전화·호흡·눈·청력 보호구");
  await expect(
    guide.getByRole("link", { name: "용접 분류", exact: true }).first(),
  ).toHaveAttribute("href", "/written/theory/lesson-1ec09vl");
  const arcProcesses = guide.getByTestId(
    "subject-two-bundle-shielded-high-efficiency",
  );
  const arcPart = guide.locator("#subject-two-arc-special-welding");
  await arcPart.locator(":scope > summary").click();
  await expect(arcPart).toHaveAttribute("open", "");
  if ((await arcProcesses.getAttribute("open")) === null) {
    await arcProcesses.locator(":scope > summary").click();
  }
  await expect(arcProcesses).toHaveAttribute("open", "");
  const arcProcessLinks = arcProcesses
    .getByTestId("subject-two-subtopics-shielded-high-efficiency")
    .locator("a");
  await expect(arcProcessLinks).toHaveCount(6);
  await expect(arcProcessLinks.nth(0)).toContainText("TIG용접");
  await expect(arcProcessLinks.nth(1)).toContainText("MIG·MAG·CO₂용접");
  await expect(arcProcessLinks.nth(2)).toContainText("CO₂ 아크용접");
  await expect(arcProcessLinks.nth(3)).toContainText("플럭스코어드아크용접");
  await expect(arcProcessLinks.nth(4)).toContainText("서브머지드아크용접");
  await expect(arcProcessLinks.nth(5)).toContainText("아크용접 차폐 조건");
  await expect(guide).toContainText(
    "법령·안전·표준의 세부 수치와 작업 절차는 통합본의 암기 흐름만 참고합니다.",
  );

  const traps = guide.getByTestId("subject-two-traps-weld-defects");
  const defectPart = guide.locator("#subject-two-defect-inspection-joint");
  await defectPart.locator(":scope > summary").click();
  await expect(defectPart).toHaveAttribute("open", "");
  await expect(traps).not.toHaveAttribute("open", "");
  await traps.locator(":scope > summary").click();
  await expect(traps).toHaveAttribute("open", "");
  await expect(traps).toContainText(
    "언더컷은 전류가 너무 낮고 용접속도가 너무 느릴 때만 생긴다.",
  );
  await expect(traps).toContainText(
    "언더컷은 과대 전류·긴 아크·빠른 진행과 연결해 판단합니다.",
  );
  const weldDefectCbt = guide.getByTestId(
    "subject-two-cbt-weld-defects",
  );
  await expect(weldDefectCbt).toContainText("관련 실제 CBT 원문");
  await weldDefectCbt.locator(":scope > summary").click();
  await expect(weldDefectCbt).toHaveAttribute("open", "");
  const weldDefectQuestion = weldDefectCbt
    .locator('[data-testid^="inline-cbt-question-"]')
    .first();
  await weldDefectQuestion.locator(":scope > summary").click();
  await expect(weldDefectQuestion.getByRole("button").first()).toBeVisible();
  await expect(page).toHaveURL(/\/written\/theory/);
  const grooveCbt = guide.getByTestId(
    "subject-two-cbt-grooves-symbols",
  );
  await expect(grooveCbt).toContainText("원문 확인 4문제");

  const fullIndex = page.getByTestId("written-subject-two-full-index");
  await expect(fullIndex).not.toHaveAttribute("open", "");
  await fullIndex.locator(":scope > summary").click();
  await expect(fullIndex).toHaveAttribute("open", "");
  await expect(page.getByTestId("lesson-categories-s2-g01")).toBeVisible();
});

test("arc-welding shielding subtopic keeps the focused lesson structure", async ({ page }) => {
  await page.goto("/written/theory/lesson-welding-process-shielding");

  await expect(
    page.getByRole("heading", { name: "아크용접 차폐 조건", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "정의", exact: true })).toBeVisible();
  await expect(page.getByText("산소·질소·수분", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "작동원리" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "전극·차폐·적용조건" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "선정할 때 보는 조건" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "품질·고장 진단" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "시험에 자주 출제되는 유형" })).toBeVisible();
  await expect(page.getByTestId("lesson-practice-set")).toContainText("모의고사 1문제 풀기");
  await expect(page.locator("main")).not.toContainText("정답입니다");
});

test("arc-welding subtopics fit a 390px study screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/written/theory/lesson-welding-process-shielding");

  await expect(
    page.getByRole("heading", { name: "아크용접 차폐 조건", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "그림·표로 공정 차이 먼저 이해하기" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "GTAW", level: 3, exact: true }),
  ).toBeVisible();
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.width);
});

test("subject two projected theory stays usable at 390, 1024, and 1440 pixels", async ({
  page,
}) => {
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/written/theory/subject/subject-2");

    const guide = page.getByTestId("written-subject-two-memory-guide");
    await expect(guide).toBeVisible();
    const viewport = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.width);

    if (width === 1024) {
      const safetyPart = guide.locator("#subject-two-industrial-safety");
      const summary = safetyPart.locator(":scope > summary");
      await summary.focus();
      await summary.press("Enter");
      await expect(safetyPart).toHaveAttribute("open", "");
      await expect(
        guide.getByTestId("subject-two-bundle-ppe-classification-details"),
      ).toBeVisible();
    }
  }
});

test("subject three follows the integrated source and preserves its detail routes", async ({ page }) => {
  await page.goto("/written/theory/subject/subject-3");
  await page.waitForLoadState("networkidle");

  const guide = page.getByTestId("written-subject-three-memory-guide");
  await expect(
    guide.getByRole("heading", {
      name: "기계설비 일반을 14개 흐름으로 묶어보기",
    }),
  ).toBeVisible();
  await expect(
    guide.getByTestId("subject-three-bundle-drawing-lines-tolerance"),
  ).toContainText("치수공차");
  await expect(
    guide.getByTestId("subject-three-bundle-heat-treatment-testing"),
  ).toContainText("열처리");
  await expect(
    guide.getByTestId("subject-three-bundle-fluid-machinery-troubles"),
  ).toContainText("캐비테이션");
  await expect(
    guide.getByTestId("subject-three-bundle-maintenance-tools-lubrication"),
  ).toContainText("윤활유 5대 기능");
  const measurementBundle = guide.getByTestId(
    "subject-three-bundle-measurement-principles",
  );
  await measurementBundle.locator(":scope > summary").focus();
  await measurementBundle.locator(":scope > summary").press("Enter");
  await expect(measurementBundle).toHaveAttribute("open", "");
  await expect(
    guide.getByRole("link", { name: "아베 원리", exact: true }),
  ).toHaveAttribute("href", "/written/theory/lesson-psovio");
  await expect(guide).toContainText("공식 규격");
  await expect(guide).toContainText("장비 매뉴얼");

  const materialsPart = guide.locator("#subject-three-machining-materials");
  await materialsPart.locator(":scope > summary").focus();
  await materialsPart.locator(":scope > summary").press("Enter");
  await expect(materialsPart).toHaveAttribute("open", "");
  const heatTreatmentBundle = guide.getByTestId(
    "subject-three-bundle-heat-treatment-testing",
  );
  await heatTreatmentBundle.locator(":scope > summary").focus();
  await heatTreatmentBundle.locator(":scope > summary").press("Enter");
  await expect(heatTreatmentBundle).toHaveAttribute("open", "");
  const traps = guide.getByTestId(
    "subject-three-traps-heat-treatment-testing",
  );
  await expect(traps).not.toHaveAttribute("open", "");
  await traps.locator(":scope > summary").focus();
  await traps.locator(":scope > summary").press("Enter");
  await expect(traps).toHaveAttribute("open", "");
  await expect(traps).toContainText("뜨임은 소려 또는 템퍼링");
  const heatTreatmentCbt = guide.getByTestId(
    "subject-three-cbt-heat-treatment-testing",
  );
  await expect(heatTreatmentCbt).toContainText("관련 실제 CBT 원문");
  await expect(
    heatTreatmentCbt.locator('[data-testid^="inline-cbt-question-"]'),
  ).toHaveCount(5);
  await heatTreatmentCbt.locator(":scope > summary").focus();
  await heatTreatmentCbt.locator(":scope > summary").press("Enter");
  await expect(heatTreatmentCbt).toHaveAttribute("open", "");
  const heatTreatmentQuestion = heatTreatmentCbt
    .locator('[data-testid^="inline-cbt-question-"]')
    .first();
  await heatTreatmentQuestion.locator(":scope > summary").click();
  await expect(heatTreatmentQuestion.getByRole("button").first()).toBeVisible();
  await expect(page).toHaveURL(/\/written\/theory/);

  const fullIndex = page.getByTestId("written-subject-three-full-index");
  await expect(fullIndex).not.toHaveAttribute("open", "");
  await fullIndex.locator(":scope > summary").click();
  await expect(fullIndex).toHaveAttribute("open", "");
  await expect(page.getByTestId("lesson-categories-s3-g01")).toBeVisible();
  await expect(
    page.locator(
      'a[href^="https://notion.site"], a[href^="https://app.notion.com"], a[href^="https://www.notion.so"]',
    ),
  ).toHaveCount(0);
});

test("subject four keeps a fast memory guide without exposing the private source body", async ({ page }) => {
  await page.goto("/written/theory/subject/subject-4#subject-4");
  await page.waitForLoadState("networkidle");

  const guide = page.getByTestId("written-subject-four-memory-guide");
  await expect(
    guide.getByRole("heading", {
      name: "설비진단 및 관리를 24개 흐름으로 묶어보기",
    }),
  ).toBeVisible();
  await expect(
    guide.getByTestId("subject-four-bundle-vibration-foundation"),
  ).toContainText("진동 3요소");
  await expect(
    guide.getByTestId("subject-four-bundle-maintenance-methods"),
  ).toContainText("사후·예방·예지·개량·보전예방");
  await expect(
    guide.getByTestId("subject-four-bundle-oil-supply-management"),
  ).toContainText("전손식·유욕·비말·강제순환·집중급유");
  await expect(
    guide.getByTestId("subject-four-bundle-diagnosis-methods-sensors"),
  ).toContainText("진단기법·회전수·진동센서");
  await expect(
    guide.getByTestId("subject-four-bundle-noise-calculation-control"),
  ).toContainText("소음레벨 합성");
  await expect(
    guide.getByTestId("subject-four-bundle-reliability-oee-calculation"),
  ).toContainText("OEE");
  await expect(
    guide.getByTestId("subject-four-bundle-gear-damage-types"),
  ).toContainText("기어 손상");
  await expect(
    guide
      .locator('a[href*="/written/theory/lesson-"]')
      .filter({ hasText: "MTBF" })
      .first(),
  ).toHaveAttribute("href", /\/written\/theory\/lesson-/);
  const vibrationCbt = guide.getByTestId(
    "subject-four-cbt-vibration-foundation",
  );
  await expect(vibrationCbt).toContainText("관련 실제 CBT 원문");
  const vibrationPart = guide.locator("#subject-four-vibration-noise");
  if ((await vibrationPart.getAttribute("open")) === null) {
    await vibrationPart.locator(":scope > summary").click();
  }
  const vibrationBundle = guide.getByTestId(
    "subject-four-bundle-vibration-foundation",
  );
  if ((await vibrationBundle.getAttribute("open")) === null) {
    await vibrationBundle.locator(":scope > summary").click();
  }
  await vibrationCbt.locator(":scope > summary").click();
  const vibrationQuestion = vibrationCbt
    .locator('[data-testid^="inline-cbt-question-"]')
    .first();
  await vibrationQuestion.locator(":scope > summary").click();
  const firstChoice = vibrationQuestion.getByRole("button").first();
  await expect(firstChoice).toBeVisible();
  await firstChoice.click();
  await vibrationQuestion.getByRole("button", { name: "답안 제출" }).click();
  await expect(
    vibrationQuestion.locator('[data-testid^="inline-cbt-feedback-"]'),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/written\/theory/);
  await expect(vibrationCbt).toContainText(
    "정답과 해설은 선택지를 제출한 뒤에만 표시됩니다.",
  );
  await expect(guide).toContainText("Fast·Slow");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(guide.locator('a[href*="notion.site"]')).toHaveCount(0);
  await expect(guide.getByText("과목 전체 종합정리 원문 펼쳐보기")).toHaveCount(0);

  const fullIndex = page.getByTestId("written-subject-four-full-index");
  await expect(fullIndex).not.toHaveAttribute("open", "");
  await fullIndex.locator(":scope > summary").click();
  await expect(fullIndex).toHaveAttribute("open", "");
  await expect(page.getByTestId("lesson-categories-s4-g01")).toBeVisible();
});

test("all subject memory guides fit 390, 1024, and 1440px and keep keyboard disclosures", async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(
    test.info().project.name !== "chromium",
    "The chromium project covers the three explicit viewport contracts.",
  );

  const subjects = [
    {
      path: "/written/theory/subject/subject-1",
      guideId: "written-subject-one-memory-guide",
      heading: "공유압 및 자동제어를 23개 흐름으로 묶어보기",
    },
    {
      path: "/written/theory/subject/subject-2",
      guideId: "written-subject-two-memory-guide",
      heading: "용접 및 안전관리를 18개 흐름으로 묶어보기",
    },
    {
      path: "/written/theory/subject/subject-3",
      guideId: "written-subject-three-memory-guide",
      heading: "기계설비 일반을 14개 흐름으로 묶어보기",
    },
    {
      path: "/written/theory/subject/subject-4",
      guideId: "written-subject-four-memory-guide",
      heading: "설비진단 및 관리를 24개 흐름으로 묶어보기",
    },
  ] as const;

  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    for (const subject of subjects) {
      await page.goto(subject.path);

      const guide = page.getByTestId(subject.guideId);
      await expect(
        guide.getByRole("heading", { name: subject.heading }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);

      if (width === 390) {
        const summaryTable = guide.locator(
          '[data-testid^="subject-"][data-testid*="-table-"]:visible',
        ).first();
        await expect(summaryTable).toBeVisible();
        const scrollState = await summaryTable.evaluate((element) => {
          const container = element as HTMLElement;
          const before = container.scrollLeft;
          container.scrollLeft = 160;
          return {
            before,
            after: container.scrollLeft,
            clientWidth: container.clientWidth,
            scrollWidth: container.scrollWidth,
            touchAction: getComputedStyle(container).touchAction,
          };
        });
        expect(scrollState.scrollWidth).toBeGreaterThan(scrollState.clientWidth);
        expect(scrollState.after).toBeGreaterThan(scrollState.before);
        expect(scrollState.touchAction).toBe("pan-x");
      }

      const disclosure = guide.locator("details:visible").first();
      const summary = disclosure.locator(":scope > summary");
      const wasOpen = (await disclosure.getAttribute("open")) !== null;
      await summary.focus();
      await summary.press("Enter");
      await expect(disclosure).toHaveJSProperty("open", !wasOpen);
    }
  }
});

test("private source routes are not published", async ({ page }) => {
  const response = await page.goto("/written/theory/source/4");

  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).not.toContainText(
    "설비 관리 \"절대 수치\" 한계선 암기 노트",
  );
  await expect(page.locator('a[href*="notion.site"]')).toHaveCount(0);
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

test("an individual PID lesson uses the focused lesson structure and replaces the generic trap copy", async ({ page }) => {
  await page.goto("/written/theory/lesson-bx3sdi");

  await expect(page.getByTestId("lesson-family-overview")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "정의", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "원리", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "시험에 자주 출제되는 유형" })).toBeVisible();
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

  await expect(page.getByRole("heading", { name: "정의", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "원리", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "시험에 자주 출제되는 유형" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "실제 CBT 기출 1문제 풀기" })).toBeVisible();
  await expect(page.getByTestId("past-exam-2018-2-Q88")).toBeVisible();
  await expect(page.getByText("2018년 2회 · 88번", { exact: true })).toBeVisible();

  const pastExamsBox = await page.locator("#past-exams").boundingBox();
  const definitionBox = await page.locator("#definition").boundingBox();
  expect(definitionBox?.y ?? Number.MAX_SAFE_INTEGER).toBeLessThan(pastExamsBox?.y ?? 0);

  const practiceSet = page.getByTestId("lesson-practice-set");
  await expect(practiceSet.getByRole("heading", { name: "모의고사 1문제 풀기" })).toBeVisible();
  const firstMockQuestion = practiceSet
    .locator('[data-testid^="inline-cbt-question-"]')
    .first();
  await firstMockQuestion.locator(":scope > summary").click();
  await expect(firstMockQuestion.getByRole("button").first()).toBeVisible();
  await expect(page).toHaveURL(/\/written\/theory\/lesson-tcxwqa$/);
  await expect(practiceSet).toContainText("답을 제출하기 전에는 정답과 해설을 전송하지 않습니다.");
});

test("lesson exam patterns combine authored notes with direct past-exam frequency", async ({ page }) => {
  await page.goto("/written/theory/lesson-1ec09vl");

  const patterns = page.getByTestId("lesson-exam-types");
  await expect(patterns).toContainText("미리 정리한 시험 포인트");
  await expect(patterns).toContainText("피복아크·TIG·MIG/MAG");
  await expect(patterns).toContainText("검증 기출 2건");
  await expect(patterns).toContainText("2건 · 100%");
  await expect(patterns).toContainText("저항용접");

  const practiceSet = page.getByTestId("lesson-practice-set");
  await expect(
    practiceSet.locator('[data-testid^="inline-cbt-question-"]'),
  ).toHaveCount(1);
  const urlBefore = page.url();
  await practiceSet
    .locator('[data-testid^="inline-cbt-question-"]')
    .first()
    .locator(":scope > summary")
    .click();
  await expect(
    practiceSet
      .locator('[data-testid^="inline-cbt-question-"]')
      .first()
      .getByRole("button")
      .first(),
  ).toBeVisible();
  expect(page.url()).toBe(urlBefore);
});

test("family study explains concepts before more actual exams and concrete adhesive choices", async ({ page }) => {
  await page.goto("/written/theory/family/s3-g08/surface");

  const pastExams = page.locator("#past-exams");
  const traps = page.locator("#question-traps");
  const relatedTerms = page.locator("#related-terms");
  await expect(pastExams.locator("details")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: /실제 CBT 기출 \d+문제 풀기/ })).toBeVisible();

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

test("tolerance family replaces the generic concept map with fit and symbol tables", async ({ page }) => {
  if (test.info().project.name === "mobile") {
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.goto("/written/theory/family/s3-g01/tolerance");

  const reference = page.getByTestId("tolerance-fit-reference");
  await expect(reference).toBeVisible();
  await expect(page.getByText("Concept map", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "끼워맞춤 판정 기준표" })).toContainText(
    "Smin = Dmin − dmax > 0",
  );
  await expect(page.getByRole("region", { name: "끼워맞춤 판정 기준표" })).toContainText(
    "Smin ≤ 0 ≤ Smax",
  );
  await expect(page.getByRole("region", { name: "끼워맞춤 판정 기준표" })).toContainText(
    "Smax = Dmax − dmin < 0",
  );
  await expect(page.getByRole("region", { name: "기하공차 기호와 데이텀 기준표" })).toContainText(
    "모양 공차",
  );
  await expect(page.getByRole("region", { name: "기하공차 기호와 데이텀 기준표" })).toContainText(
    "온 흔들림",
  );
  const viewportWidth = page.viewportSize()?.width ?? 1280;
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(viewportWidth);
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
