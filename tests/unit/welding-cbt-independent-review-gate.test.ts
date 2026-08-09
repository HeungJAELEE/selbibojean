import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import { WELDING_CBT_GPT_BATCH_01_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-01-independent-review";
import { WELDING_CBT_GPT_BATCH_02_A_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-02-independent-review-a";
import { WELDING_CBT_GPT_BATCH_02_B_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-02-independent-review-b";
import { WELDING_CBT_GPT_BATCH_02_C_APPROVED_IDS } from "@/data/source/welding-cbt-answer-reviews/gpt-batch-02-independent-review-c";
import { WELDING_CBT_ANSWER_REVIEWS } from "@/data/source/welding-cbt-answer-review";
import { WELDING_CBT_CONVENTIONAL_EXAM_APPROVED_IDS } from "@/data/source/welding-cbt-independent-review-decisions";
import {
  INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT,
  isIndependentlyAcceptedWeldingCbtQuestion,
} from "@/data/source/welding-cbt-independent-review-gates";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent } from "@/lib/domain/types";

const ACCEPTED_IDS = new Set([
  ...WELDING_CBT_GPT_BATCH_01_APPROVED_IDS,
  "wcbt-360f4bdc-a4ab-4be1-89af-2d0c71eab08c",
  "wcbt-49ddc1c2-05f9-454e-a01a-21440d2f4a92",
  "wcbt-4533db22-25e9-48ab-8060-a0559a855a21",
  "wcbt-b37a80db-aab9-4a62-bcd3-c06e960f18b8",
  "wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb",
  "wcbt-9cff516f-6a55-4733-b433-983aa311c95b",
  "wcbt-f010c9fd-72f1-46a1-9d54-3240600fb2e7",
  "wcbt-54d3be8c-ff5f-4757-82e6-d78cec05728c",
  "wcbt-1ebc004e-8a18-4c02-b920-096418dd28cd",
  "wcbt-493b2168-1ef8-40e4-b986-92db667cd95d",
  "wcbt-0f682295-1b00-4762-b2a3-e65cfab323a4",
  "wcbt-1b11cff7-3ebd-4fbe-96ab-f31e4a9d9355",
  "wcbt-25599af8-aa0e-47e3-9b8b-51dc27f60bc8",
  "wcbt-2e3af0f9-d9ee-4606-887b-a305525d6e79",
  "wcbt-353e2c66-db3e-41e5-935b-8dd443ef736a",
  "wcbt-3722e991-f852-44bf-bcc5-efaa75c7fa9c",
  "wcbt-3ff084f2-2dbd-4d0d-825a-eee98c7175ca",
  "wcbt-54b1baf9-7574-493b-b616-6caa2db72509",
  "wcbt-6c1607b3-09d3-429f-b911-7a6d2f5f7418",
  "wcbt-7d98f9f8-8c72-49cc-b81a-6c1b13d5ae2b",
  "wcbt-c67f0293-11ab-4da5-9b2f-06accefc995e",
  "wcbt-e630bc06-fe6f-4eb4-9f04-77e97ceb8d4a",
  "wcbt-edfc5be7-c962-4213-a46d-1d207583c478",
  "wcbt-fffecb03-9c1c-4f9c-9caf-0821b5f0d224",
  "wcbt-090f8987-d07c-4aae-8a13-bfbcba5bdc4b",
  "wcbt-12da4754-2357-4368-84ca-e21194d72c71",
  "wcbt-14586fff-063c-4789-9c62-b4168996fc32",
  "wcbt-164cdf70-275d-473f-a669-04c30cda93e8",
  "wcbt-1c57aad6-b6bb-46e8-9c2f-e70566d4e189",
  "wcbt-25867beb-2201-4b4f-9cc6-61568ba0c04d",
  "wcbt-3b1ab86a-05b8-4009-8c18-b790ecb386f0",
  "wcbt-4068b5c0-c9b8-43b2-a449-51777e52adc2",
  "wcbt-4346c5cd-a267-476e-8733-c5c0a5f88360",
  "wcbt-4925dffa-26cb-46db-9d75-e84bd59e1e1d",
  "wcbt-4b9b72f8-4957-4028-bd1c-bc8157976a8e",
  "wcbt-5328eb9a-d28d-4752-9ce3-35ec0c6e2675",
  "wcbt-50ea9e7d-008c-45e1-a35c-21ad26b026cc",
  "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe",
  ...WELDING_CBT_GPT_BATCH_02_A_APPROVED_IDS,
  ...WELDING_CBT_GPT_BATCH_02_B_APPROVED_IDS,
  ...WELDING_CBT_GPT_BATCH_02_C_APPROVED_IDS,
  "wcbt-fcc15073-28c6-48bb-b735-8ee30957ed8b",
  ...WELDING_CBT_CONVENTIONAL_EXAM_APPROVED_IDS,
]);

const HOLD_IDS = WELDING_CBT_ANSWER_REVIEWS.entries
  .filter((review) => review.reviewStatus === "hold")
  .map((review) => review.canonicalId);

const runtimeContent = buildRuntimeContent(
  generatedContent as GeneratedContent,
);
const runtimeWeldingQuestions = runtimeContent.questions.filter((question) =>
  question.id.startsWith("wcbt-"),
);
const runtimeWeldingVariants = runtimeContent.variants.filter((variant) =>
  variant.canonicalId.startsWith("wcbt-"),
);

describe("welding CBT independent review publication gate", () => {
  it("merges only the independently accepted exact-set with approved feedback", () => {
    expect(INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT).toBe(
      ACCEPTED_IDS.size,
    );
    expect(INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT).toBe(492);
    expect(
      WELDING_CBT_ANSWER_REVIEWS.entries.filter(
        (review) => review.reviewStatus === "approved",
      ),
    ).toHaveLength(492);
    expect(
      WELDING_CBT_ANSWER_REVIEWS.entries.filter(
        (review) => review.reviewStatus === "hold",
      ),
    ).toHaveLength(33);
    for (const canonicalId of ACCEPTED_IDS) {
      expect(
        isIndependentlyAcceptedWeldingCbtQuestion(canonicalId),
      ).toBe(true);
    }

    for (const question of runtimeWeldingQuestions) {
      expect(
        isIndependentlyAcceptedWeldingCbtQuestion(question.id),
      ).toBe(true);
      expect(question.approvedReview).toEqual(
        expect.objectContaining({
          directSolution: expect.any(String),
          conceptBinding: expect.objectContaining({
            href: expect.stringMatching(/^\/written\/theory\/.+#[^#]+$/u),
          }),
        }),
      );
      expect(question.approvedReview?.directSolution.trim().length).toBeGreaterThan(0);
      expect(question.choices).toHaveLength(4);
      expect(
        question.choices.every((choice) => choice.feedback?.rationale.trim()),
      ).toBe(true);
    }

    expect(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter((review) => review.reviewStatus === "approved")
        .every((review) =>
          isIndependentlyAcceptedWeldingCbtQuestion(review.canonicalId),
        ),
    ).toBe(true);
    expect(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter((review) => review.reviewStatus === "hold")
        .every(
          (review) =>
            !isIndependentlyAcceptedWeldingCbtQuestion(review.canonicalId),
        ),
    ).toBe(true);
  });

  it("keeps every authored HOLD record out of runtime approval", () => {
    expect(HOLD_IDS).toHaveLength(33);
    for (const canonicalId of HOLD_IDS) {
      expect(
        isIndependentlyAcceptedWeldingCbtQuestion(canonicalId),
      ).toBe(false);
      expect(
        runtimeWeldingQuestions.some(
          (question) => question.id.startsWith(canonicalId),
        ),
      ).toBe(false);
      expect(
        runtimeWeldingVariants.some(
          (variant) => variant.canonicalId === canonicalId,
        ),
      ).toBe(false);
    }

    expect(
      runtimeWeldingQuestions.every((question) =>
        isIndependentlyAcceptedWeldingCbtQuestion(question.id),
      ),
    ).toBe(true);
  });

  it("does not leak answer or reviewed explanation fields in pre-submit practice payloads", () => {
    const payload = JSON.stringify(
      createPracticePresentations(
        runtimeWeldingQuestions,
        runtimeWeldingVariants,
        100,
        20260803,
        true,
      ),
    );

    for (const forbiddenField of [
      "correctChoiceId",
      "answerText",
      "answerExplanation",
      "solutionSteps",
      "choiceFeedback",
      "feedback",
      "keyRule",
      "conceptBinding",
      "assertionText",
      "approvedReview",
    ]) {
      expect(payload).not.toContain(`\"${forbiddenField}\"`);
    }
  });
});
