import { describe, expect, it } from "vitest";

import weldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
  type PublishableWeldingCbtAnswerReviewEntry,
} from "@/data/source/welding-cbt-answer-review";
import {
  validateWeldingCbtExplanationSpecificityEntry,
  verifyWeldingCbtExplanationSpecificity,
} from "../../scripts/verify-welding-cbt-explanation-specificity";

const CALCULATION_ID = "wcbt-4533db22-25e9-48ab-8060-a0559a855a21";

function approvedCalculationFixture(): PublishableWeldingCbtAnswerReviewEntry {
  const entry = WELDING_CBT_ANSWER_REVIEWS.entries.find(
    (candidate) => candidate.canonicalId === CALCULATION_ID,
  );
  if (!entry || !isWeldingCbtAnswerReviewPublishable(entry)) {
    throw new Error("reference calculation review must be approved");
  }
  return structuredClone(entry);
}

function calculationSource() {
  const source = weldingCbtBank.records.find(
    (candidate) => candidate.canonicalId === CALCULATION_ID,
  );
  if (!source || source.correctIndex === null) {
    throw new Error("reference calculation source must be available");
  }
  return source;
}

describe("welding CBT explanation specificity gate", () => {
  it("checks only approved publications and reports every current gap with its canonical ID", () => {
    const report = verifyWeldingCbtExplanationSpecificity();
    const approvedIds = new Set(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter(isWeldingCbtAnswerReviewPublishable)
        .map((entry) => entry.canonicalId),
    );

    expect(report.approvedCount).toBe(approvedIds.size);
    expect(report.errors.every((error) =>
      error.canonicalId !== null && approvedIds.has(error.canonicalId)
    )).toBe(true);
  });

  it("uses current reviews, source choices, and source numerical values in its fixture", () => {
    const source = calculationSource();
    const review = approvedCalculationFixture();
    expect(source.choices[source.correctIndex]).toBe("48000");
    expect(review.answerExplanation).toContain("48000");
    expect(review.solutionSteps.join(" ")).toMatch(/24V.*200A.*6cm\/min/u);
  });

  it("rejects a copied generic explanation even when its publication fields remain populated", () => {
    const review = approvedCalculationFixture();
    review.answerExplanation = "문제의 조건을 확인합니다. 각 보기를 비교합니다. 따라서 정답입니다.";
    review.solutionSteps = [
      "문제의 조건을 확인합니다.",
      "각 보기를 비교합니다.",
    ];
    review.keyRule = "일반적인 원리를 적용합니다.";

    expect(
      validateWeldingCbtExplanationSpecificityEntry(review, calculationSource())
        .map((error) => error.code),
    ).toEqual(expect.arrayContaining([
      "EXPLANATION_CORRECT_CHOICE_NOT_MENTIONED",
      "EXPLANATION_QUESTION_ANCHOR_MISSING",
      "EXPLANATION_GENERIC_TEMPLATE",
      "CALCULATION_FORMULA_MISSING",
      "CALCULATION_SUBSTITUTION_MISSING",
      "CALCULATION_RESULT_MISSING",
      "CALCULATION_UNIT_MISSING",
    ]));
  });

  it("requires formula, source-value substitution, selected result, and a unit separately", () => {
    const review = approvedCalculationFixture();
    review.answerExplanation = "용접 입열량은 용접속도와 관련된 값이므로 48000을 선택합니다.";
    review.solutionSteps = ["용접 입열량의 관계를 적용합니다."];
    review.keyRule = "용접 입열량은 조건을 비교해 판단합니다.";

    expect(
      validateWeldingCbtExplanationSpecificityEntry(review, calculationSource())
        .map((error) => error.code),
    ).toEqual(expect.arrayContaining([
      "CALCULATION_FORMULA_MISSING",
      "CALCULATION_SUBSTITUTION_MISSING",
      "CALCULATION_UNIT_MISSING",
    ]));
  });
});
