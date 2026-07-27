import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("practical written theory opens with the subject summary", async ({
  page,
}) => {
  await page.goto("/practical/written/theory");

  await expect(
    page.getByTestId("practical-exam-subject-summary-subject-1"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /과목별 핵심요약/ }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("릴리프밸브", { exact: true })).toBeVisible();
  await expect(page.getByText("히스테리시스", { exact: true })).toBeVisible();
});

test("unified theory reuses the same practical subject summary", async ({
  page,
}) => {
  await page.goto("/theory?mode=practical");

  await expect(
    page.getByTestId("practical-exam-subject-summary-subject-1"),
  ).toBeVisible();
  await page.goto(
    "/theory?mode=practical&view=subject-summary&subject=subject-2",
  );
  await expect(
    page.getByTestId("practical-exam-subject-summary-subject-2"),
  ).toBeVisible();
});

test("subject 2 focuses on theory and hides welding calculations", async ({
  page,
}) => {
  await page.goto(
    "/practical/written/theory?view=subject-summary&subject=subject-2",
  );

  const summary = page.getByTestId(
    "practical-exam-subject-summary-subject-2",
  );
  await expect(summary).toBeVisible();
  await expect(summary.getByText("언더컷", { exact: true })).toBeVisible();
  await expect(summary.getByText("비파괴검사", { exact: false }).first()).toBeVisible();
  await expect(summary.getByText("용접 입열", { exact: true })).toHaveCount(0);
  await expect(summary.getByText("탄소당량(Ceq)", { exact: true })).toHaveCount(
    0,
  );

  await page.goto("/practical/written/theory?view=concept");
  await expect(page.getByText("용접 입열", { exact: true })).toHaveCount(0);
  await expect(page.getByText("탄소당량(Ceq)", { exact: true })).toHaveCount(0);
});

test("welding calculations have no learner-facing direct route or search result", async ({
  page,
}) => {
  const conceptResponse = await page.goto(
    "/practical/written/theory/PCON-SUP-018",
  );
  expect(conceptResponse?.status()).toBe(404);

  const questionResponse = await page.goto(
    "/practical/written/question/EXP-SUP-018",
  );
  expect(questionResponse?.status()).toBe(404);

  await page.goto(`/search?q=${encodeURIComponent("용접 입열")}`);
  await expect(
    page.getByRole("link", { name: "용접 입열", exact: true }),
  ).toHaveCount(0);
});

test("subject 3 shows the curated mechanical summary and at most three published questions", async ({
  page,
}) => {
  await page.goto(
    "/practical/written/theory?view=subject-summary&subject=subject-3",
  );

  const summary = page.getByTestId(
    "practical-exam-subject-summary-subject-3",
  );
  await expect(summary).toBeVisible();
  await expect(summary.getByText("피팅(피칭)", { exact: false }).first()).toBeVisible();
  await expect(
    summary.getByText("기어 록(물림 고착)", { exact: false }).first(),
  ).toBeVisible();
  await expect(summary.getByText("끼워맞춤 판정", { exact: true })).toBeVisible();
  await expect(summary.getByRole("img")).toHaveCount(4);

  const questions = page.getByTestId(
    "practical-exam-representative-questions",
  );
  await expect(questions.getByRole("link")).toHaveCount(3);
  await expect(questions.getByText("필답 기출").first()).toBeVisible();
  await expect(questions.getByText("필답 예상").first()).toBeVisible();
  await expect(page.getByTestId("practical-ncs-source-audit")).toHaveCount(0);
});

test("subject 4 keeps maintenance, TPM, OEE, and NCS-backed prediction distinct", async ({
  page,
}) => {
  await page.goto(
    "/practical/written/theory?view=subject-summary&subject=subject-4",
  );

  const summary = page.getByTestId(
    "practical-exam-subject-summary-subject-4",
  );
  await expect(summary).toBeVisible();
  await expect(summary.getByText("보전방식 비교", { exact: true })).toBeVisible();
  await expect(summary.getByText("TPM 6대 로스", { exact: true }).first()).toBeVisible();
  await expect(
    summary.getByText("OEE=시간가동률×성능가동률×양품률").first(),
  ).toBeVisible();

  const questions = page.getByTestId(
    "practical-exam-representative-questions",
  );
  await expect(questions.getByRole("link")).toHaveCount(3);
  await expect(questions.getByText("NCS 보강", { exact: true })).toBeVisible();
  await expect(questions.getByText("필답 예상", { exact: true })).toBeVisible();
});

test("subject tabs and representative questions are keyboard reachable", async ({
  page,
}) => {
  await page.goto("/practical/written/theory");

  const subject3Tab = page.getByRole("link", {
    name: /제3과목.*기계설비/,
  });
  await subject3Tab.focus();
  await expect(subject3Tab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/subject=subject-3/);

  const firstQuestion = page
    .getByTestId("practical-exam-representative-questions")
    .getByRole("link")
    .first();
  await firstQuestion.focus();
  await expect(firstQuestion).toBeFocused();
});

test("subject 3 and 4 summaries introduce no serious accessibility violations", async ({
  page,
}) => {
  for (const subjectId of ["subject-3", "subject-4"]) {
    await page.goto(
      `/practical/written/theory?view=subject-summary&subject=${subjectId}`,
    );
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      result.violations.filter(
        (violation) =>
          violation.impact === "critical" || violation.impact === "serious",
      ),
    ).toEqual([]);
  }
});
