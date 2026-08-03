import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import { isIndependentlyAcceptedWeldingCbtQuestion } from "@/data/source/welding-cbt-independent-review-gates";
import { mergeApprovedWeldingCbtContent } from "@/lib/content/welding-cbt-approved";
import { toPublicQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const REFERENCE_CALCULATION_ID =
  "wcbt-4533db22-25e9-48ab-8060-a0559a855a21";
const RESISTANCE_HEAT_ID =
  "wcbt-b37a80db-aab9-4a62-bcd3-c06e960f18b8";
const ACETYLENE_VOLUME_ID =
  "wcbt-c67f0293-11ab-4da5-9b2f-06accefc995e";
const AMBIGUOUS_PRESSURE_ID =
  "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe";
const WELDING_HEAT_INPUT_ID =
  "wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb";

const EXPECTED_APPROVED_CALCULATION_IDS = [
  REFERENCE_CALCULATION_ID,
  RESISTANCE_HEAT_ID,
  ACETYLENE_VOLUME_ID,
  WELDING_HEAT_INPUT_ID,
].sort();

function buildWeldingQuestions() {
  return mergeApprovedWeldingCbtContent(
    generatedContent as GeneratedContent,
  ).questions.filter((question) => question.id.startsWith("wcbt-"));
}

function referenceCalculationReview() {
  const review = WELDING_CBT_ANSWER_REVIEWS.entries.find(
    (entry) => entry.canonicalId === REFERENCE_CALCULATION_ID,
  );
  if (!review || !isWeldingCbtAnswerReviewPublishable(review)) {
    throw new Error("The reference calculation review must remain approved.");
  }
  return review;
}

describe("approved welding CBT calculation publication gate", () => {
  it("keeps every currently approved calculation review structured and published", () => {
    const approvedCalculationIds = WELDING_CBT_ANSWER_REVIEWS.entries
      .filter(
        (entry) =>
          entry.assessmentKind === "calculation"
          && isWeldingCbtAnswerReviewPublishable(entry),
      )
      .map((entry) => entry.canonicalId)
      .sort();
    const questionsById = new Map(
      buildWeldingQuestions().map((question) => [question.id, question]),
    );

    expect(approvedCalculationIds).toEqual(
      expect.arrayContaining([
        ...EXPECTED_APPROVED_CALCULATION_IDS,
        AMBIGUOUS_PRESSURE_ID,
      ]),
    );
    for (const id of approvedCalculationIds) {
      const calculation = questionsById.get(id)?.approvedReview?.calculation;
      if (isIndependentlyAcceptedWeldingCbtQuestion(id)) {
        expect(calculation, id).toBeDefined();
        expect(
          calculation
            && Object.values(calculation).every(
              (value) => value.trim().length > 0,
            ),
          id,
        ).toBe(true);
      } else {
        expect(calculation, id).toBeUndefined();
      }
    }
  });

  it("keeps the reviewed calculation fields semantically separated", () => {
    const questionsById = new Map(
      buildWeldingQuestions().map((question) => [question.id, question]),
    );

    expect(
      questionsById.get(RESISTANCE_HEAT_ID)?.approvedReview?.calculation,
    ).toEqual({
      formula:
        "계산식은 Q=I²Rt [J]이고 Q[cal]=Q[J]÷4.186입니다.",
      substitution:
        "값을 대입하면 Q=(25A)²×20Ω×10s=125,000J이고, 이 값을 4.186으로 나눕니다.",
      result: "29,861cal",
      unit: "cal",
    });
    expect(
      questionsById.get(ACETYLENE_VOLUME_ID)?.approvedReview?.calculation,
    ).toEqual({
      formula: "계산식은 V사용[L]=Δm[kg]×s[L/kg]입니다.",
      substitution:
        "값을 대입하면 Δm=57kg-55kg=2kg이고, V사용=2kg×905L/kg입니다.",
      result: "1810L",
      unit: "L",
    });
    expect(
      questionsById.get(WELDING_HEAT_INPUT_ID)?.approvedReview?.calculation,
    ).toEqual({
      formula:
        "용접속도가 cm/min일 때 입열식은 H=ηVI×60/v [J/cm]이며, 전류식은 I=Hv/(60ηV)입니다.",
      substitution:
        "값을 대입하면 I=(18000J/cm×15cm/min)/(60s/min×1×30V)입니다.",
      result: "150A",
      unit: "A",
    });
  });

  it("publishes the pressure-volume question with the stated exam approximation", () => {
    const review = WELDING_CBT_ANSWER_REVIEWS.entries.find(
      (entry) => entry.canonicalId === AMBIGUOUS_PRESSURE_ID,
    );

    expect(review).toMatchObject({
      authoringDisposition: "publish_candidate",
      reviewStatus: "approved",
      primaryLeafLessonId: "lesson-welding-gas-equipment-flame",
      answerExplanation: expect.stringContaining("4044"),
      solutionSteps: expect.arrayContaining([
        expect.stringContaining("33.7L"),
        expect.stringContaining("4044L"),
      ]),
      essentialRank: null,
      essentialRationale: null,
    });
    expect(
      buildWeldingQuestions().some(
        (question) => question.id === AMBIGUOUS_PRESSURE_ID,
      ),
    ).toBe(true);
  });

  it.each([
    {
      missing: "formula",
      answerExplanation:
        "The reviewed values and units support the confirmed option after calculation.",
      solutionSteps: [
        "H=1×24V×200A×60s/min÷6cm/min으로 주어진 값을 단위와 함께 대입합니다.",
        "V×A=J/s이고 60s/min과 cm/min이 소거되므로 결과 단위는 J/cm입니다.",
        "최종 결과 48000J/cm를 얻습니다.",
      ],
    },
    {
      missing: "substitution",
      answerExplanation:
        "단위 길이 입열식 H=ηVI×60/v를 적용해 검증된 계산 결과를 확인합니다.",
      solutionSteps: [
        "식을 H=ηVI×60/v [J/cm]로 세우고, 효율이 별도로 없으므로 η=1로 둡니다.",
        "최종 결과 48000J/cm를 얻습니다.",
      ],
    },
    {
      missing: "result",
      answerExplanation:
        "단위 길이 입열식 H=ηVI×60/v를 적용해 검증된 계산 절차를 확인합니다.",
      solutionSteps: [
        "식을 H=ηVI×60/v [J/cm]로 세우고, 효율이 별도로 없으므로 η=1로 둡니다.",
        "H=1×24V×200A×60s/min÷6cm/min으로 주어진 값을 단위와 함께 대입합니다.",
        "V×A=J/s이고 60s/min과 cm/min이 소거되므로 결과 단위는 J/cm입니다.",
      ],
    },
    {
      missing: "unit",
      answerExplanation:
        "단위 길이 입열식 H=ηVI×60/v를 적용해 검증된 계산 절차를 확인합니다.",
      solutionSteps: [
        "식을 H=ηVI×60/v [J/cm]로 세우고, 효율이 별도로 없으므로 η=1로 둡니다.",
        "H=1×24V×200A×60s/min÷6cm/min으로 주어진 값을 단위와 함께 대입합니다.",
        "1×24×200×60÷6을 계산해 H=48000을 얻습니다.",
      ],
    },
  ])(
    "does not publish an approved calculation review with no parseable $missing",
    ({ answerExplanation, solutionSteps }) => {
      const review = referenceCalculationReview();
      const originalAnswerExplanation = review.answerExplanation;
      const originalSolutionSteps = review.solutionSteps;

      try {
        review.answerExplanation = answerExplanation;
        review.solutionSteps = solutionSteps;

        expect(review.reviewStatus).toBe("approved");
        expect(
          buildWeldingQuestions().find(
            (question) => question.id === REFERENCE_CALCULATION_ID,
          ),
        ).toBeUndefined();
      } finally {
        review.answerExplanation = originalAnswerExplanation;
        review.solutionSteps = originalSolutionSteps;
      }
    },
  );

  it("finds the verified calculation markers without relying on step positions", () => {
    const review = referenceCalculationReview();
    const originalSolutionSteps = review.solutionSteps;
    const expected = buildWeldingQuestions().find(
      (question) => question.id === REFERENCE_CALCULATION_ID,
    )?.approvedReview?.calculation;

    try {
      review.solutionSteps = [...review.solutionSteps].reverse();
      const reordered = buildWeldingQuestions().find(
        (question) => question.id === REFERENCE_CALCULATION_ID,
      )?.approvedReview?.calculation;

      expect(reordered).toEqual(expected);
    } finally {
      review.solutionSteps = originalSolutionSteps;
    }
  });

  it("keeps structured calculation feedback out of the pre-submit payload", () => {
    const question = buildWeldingQuestions().find(
      (candidate) => candidate.id === REFERENCE_CALCULATION_ID,
    );
    expect(question?.approvedReview?.calculation).toBeDefined();
    if (!question) throw new Error("The reference calculation must be published.");

    const payload = JSON.stringify(toPublicQuestion(question));
    expect(payload).not.toContain("approvedReview");
    expect(payload).not.toContain("directSolution");
    expect(payload).not.toContain("substitution");
  });
});
