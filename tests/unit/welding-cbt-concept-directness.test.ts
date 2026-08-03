import { describe, expect, it } from "vitest";

import {
  evaluateWeldingCbtConceptDirectness,
  type WeldingCbtConceptDirectnessInput,
} from "../../scripts/verify-welding-cbt-concept-directness";
import generatedContent from "@/data/generated/content.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import {
  INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT,
  isIndependentlyAcceptedWeldingCbtQuestion,
} from "@/data/source/welding-cbt-independent-review-gates";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";
import { getWeldingCbtProjectionCandidates } from "@/lib/content/welding-cbt-approved";
import { buildRuntimeContentBeforeDirectFeedback } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const lesson = {
  id: "lesson-welding-fixture",
  blocks: [{
    id: "principle",
    body: "입열 계산에서는 전류·전압·속도의 관계와 단위를 함께 확인합니다.",
  }],
};

const input: WeldingCbtConceptDirectnessInput = {
  canonicalId: "wcbt-fixture",
  assessmentKind: "calculation",
  lessonId: lesson.id,
  lessonAnchor: "principle",
  correctChoiceText: "H=VI×60/v",
  conceptBinding: {
    lessonId: lesson.id,
    lessonBlockId: "principle",
    assertionText: "입열 H=VI×60/v는 전류와 전압을 곱하고 용접속도로 나누어 계산합니다.",
    evidenceRefs: [
      { kind: "lesson_block", ref: "lesson-welding-fixture#principle" },
      { kind: "calculation_derivation", ref: "H=VI×60/v" },
    ],
  },
};
const projectionByCanonicalId = new Map(
  WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [
    entry.canonicalId,
    entry,
  ]),
);
const projectionCandidateByCanonicalId = new Map(
  getWeldingCbtProjectionCandidates().map((entry) => [
    entry.canonicalId,
    entry,
  ]),
);
function hasMatchingReviewedProjection(
  entry: (typeof WELDING_CBT_ANSWER_REVIEWS.entries)[number],
) {
  const projection = projectionByCanonicalId.get(entry.canonicalId);
  const candidate = projectionCandidateByCanonicalId.get(entry.canonicalId);
  return Boolean(
    projection?.reviewStatus === "approved"
    && projection.primaryLeafLessonId === entry.primaryLeafLessonId
    && entry.conceptBinding?.lessonId === entry.primaryLeafLessonId
    && projection.aggregateTopicKey === candidate?.aggregateTopicKey,
  );
}

describe("welding CBT concept directness", () => {
  it("accepts a structurally anchored assertion with matching block evidence and calculation derivation", () => {
    expect(evaluateWeldingCbtConceptDirectness([input], [lesson])).toMatchObject({
      ok: true,
      errors: [],
      manualReview: [],
    });
  });

  it("fails closed for a missing block, evidence ref, runtime anchor, or thin assertion", () => {
    const missingBlock = evaluateWeldingCbtConceptDirectness([
      { ...input, conceptBinding: { ...input.conceptBinding, lessonBlockId: "missing" } },
    ], [lesson]);
    const missingEvidence = evaluateWeldingCbtConceptDirectness([
      {
        ...input,
        conceptBinding: {
          ...input.conceptBinding,
          evidenceRefs: input.conceptBinding.evidenceRefs.filter(
            (evidence) => evidence.kind !== "lesson_block",
          ),
        },
      },
    ], [lesson]);
    const mismatchedAnchor = evaluateWeldingCbtConceptDirectness([
      { ...input, lessonAnchor: "definition" },
    ], [lesson]);
    const thinAssertion = evaluateWeldingCbtConceptDirectness([
      {
        ...input,
        assessmentKind: "definition",
        correctChoiceText: "입열",
        conceptBinding: { ...input.conceptBinding, assertionText: "입열" },
      },
    ], [{ ...lesson, blocks: [{ ...lesson.blocks[0], body: "입열" }] }]);

    expect(missingBlock.errors.map((issue) => issue.code)).toContain("LESSON_BLOCK_NOT_FOUND");
    expect(missingEvidence.errors.map((issue) => issue.code)).toContain(
      "LESSON_BLOCK_EVIDENCE_MISSING",
    );
    expect(mismatchedAnchor.errors.map((issue) => issue.code)).toContain("RUNTIME_ANCHOR_MISMATCH");
    expect(thinAssertion.errors.map((issue) => issue.code)).toContain("ASSERTION_TOO_THIN");
    expect(
      missingBlock.ok
      && missingEvidence.ok
      && mismatchedAnchor.ok
      && thinAssertion.ok,
    ).toBe(false);
  });

  it("holds a generic assertion while retaining its numeric warning for review", () => {
    const report = evaluateWeldingCbtConceptDirectness([
      {
        ...input,
        assessmentKind: "definition",
        correctChoiceText: "25V 이하",
        conceptBinding: {
          ...input.conceptBinding,
          assertionText: "용접은 안전을 확인하는 중요한 작업입니다.",
        },
      },
    ], [{ ...lesson, blocks: [{ ...lesson.blocks[0], body: "용접은 안전을 확인하는 중요한 작업입니다." }] }]);

    expect(report.manualReview.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "DIRECT_JUDGMENT_NOT_MACHINE_PROVABLE",
      "NUMERIC_CONDITION_NOT_PROVABLE",
    ]));
    expect(report.ok).toBe(false);
  });

  it("keeps structural evidence valid while retaining manual directness signals", () => {
    const runtimeContent = buildRuntimeContentBeforeDirectFeedback(
      generatedContent as GeneratedContent,
    );
    const runtimeQuestions = runtimeContent.questions.filter(
      (question) =>
        question.id.startsWith("wcbt-") && isPublishableQuestion(question),
    );
    const runtimeQuestionById = new Map(
      runtimeQuestions.map((question) => [question.id, question]),
    );
    const sourceApprovedReviews = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
      isWeldingCbtAnswerReviewPublishable,
    );
    const independentlyAcceptedReviews = sourceApprovedReviews.filter(
      (review) =>
        isIndependentlyAcceptedWeldingCbtQuestion(review.canonicalId),
    );
    const structurallyAcceptedReviews = independentlyAcceptedReviews.filter(
      hasMatchingReviewedProjection,
    );
    const heldAfterAnswerReview = sourceApprovedReviews.filter(
      (review) =>
        !isIndependentlyAcceptedWeldingCbtQuestion(review.canonicalId)
        || !hasMatchingReviewedProjection(review),
    );
    const inputs = structurallyAcceptedReviews.map((review) => {
      const question = runtimeQuestionById.get(review.canonicalId);
      if (!question) {
        throw new Error(`${review.canonicalId}:accepted-runtime-question-missing`);
      }
      const correctChoice = question.choices.find(
        (choice) => choice.id === question.correctChoiceId,
      );
      if (!correctChoice) {
        throw new Error(`${review.canonicalId}:runtime-correct-choice-missing`);
      }
      return {
        canonicalId: review.canonicalId,
        assessmentKind: review.assessmentKind,
        lessonId: question.lessonId,
        lessonAnchor: question.lessonAnchor,
        correctChoiceText: correctChoice.text,
        conceptBinding: review.conceptBinding,
      };
    });
    const report = evaluateWeldingCbtConceptDirectness(
      inputs,
      runtimeContent.lessons,
    );

    expect(independentlyAcceptedReviews).toHaveLength(
      INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT,
    );
    expect(structurallyAcceptedReviews).toHaveLength(runtimeQuestions.length);
    expect(heldAfterAnswerReview).toHaveLength(
      sourceApprovedReviews.length - structurallyAcceptedReviews.length,
    );
    expect(runtimeQuestions.map((question) => question.id).sort()).toEqual(
      structurallyAcceptedReviews
        .map((review) => review.canonicalId)
        .sort(),
    );
    expect(
      runtimeQuestions.every((question) => Boolean(question.approvedReview)),
    ).toBe(true);
    expect(report.checkedCount).toBe(structurallyAcceptedReviews.length);
    expect(report.errors).toEqual([]);
    expect(
      report.manualReview.every(
        (issue) => issue.code === "NUMERIC_CONDITION_NOT_PROVABLE",
      ),
    ).toBe(true);
    expect(report.ok).toBe(true);
  });
});
