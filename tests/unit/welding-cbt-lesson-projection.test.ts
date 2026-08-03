import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  getWeldingCbtAnswerReview,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import {
  INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT,
  isIndependentlyAcceptedWeldingCbtQuestion,
} from "@/data/source/welding-cbt-independent-review-gates";
import {
  WELDING_CBT_AGGREGATE_LESSON_IDS,
  WELDING_CBT_LESSON_PROJECTION,
} from "@/data/source/welding-cbt-lesson-projection";
import {
  getWeldingCbtProjectionCandidates,
  getWeldingCbtProjectionClosure,
} from "@/lib/content/welding-cbt-approved";
import { getPastExamExamples } from "@/lib/content/past-exam-examples";
import { buildRuntimeContentBeforeDirectFeedback } from "@/lib/content/runtime-content";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContentBeforeDirectFeedback(
  generatedContent as GeneratedContent,
);
const importedQuestions = content.questions.filter((question) =>
  question.id.startsWith("wcbt-"),
);
const importedQuestionById = new Map(
  importedQuestions.map((question) => [question.id, question]),
);
const lessonById = new Map(
  content.lessons.map((lesson) => [lesson.id, lesson]),
);
const projectionCandidateById = new Map(
  getWeldingCbtProjectionCandidates().map((entry) => [
    entry.canonicalId,
    entry,
  ]),
);
function hasMatchingReviewedProjection(
  entry: (typeof WELDING_CBT_ANSWER_REVIEWS.entries)[number],
) {
  const projection = WELDING_CBT_LESSON_PROJECTION.entries.find(
    (candidate) => candidate.canonicalId === entry.canonicalId,
  );
  const candidate = projectionCandidateById.get(entry.canonicalId);
  return Boolean(
    projection?.reviewStatus === "approved"
    && projection.primaryLeafLessonId === entry.primaryLeafLessonId
    && entry.conceptBinding?.lessonId === entry.primaryLeafLessonId
    && projection.aggregateTopicKey === candidate?.aggregateTopicKey,
  );
}

describe("reviewed welding CBT lesson projection", () => {
  it("closes the complete learner projection without stale or proposed rows", () => {
    const closure = getWeldingCbtProjectionClosure();

    expect(closure.bankTotal).toBe(525);
    expect(closure.approvedExactOneCount + closure.reviewedProjectionHoldCount).toBe(
      closure.bankTotal,
    );
    expect(closure.proposedCount).toBe(0);
    expect(closure.staleCount).toBe(0);
    expect(closure.unreviewedAmbiguousCount).toBe(
      closure.answerReviewPendingCount,
    );
    expect(closure.unreviewedUnclassifiedCount).toBe(
      closure.missingAnswerReviewCount,
    );
    expect(
      closure.answerReviewApprovedCount
        + closure.answerReviewHoldCount
        + closure.answerReviewPendingCount,
    ).toBe(closure.bankTotal);
    expect(closure.missingAnswerReviewCount).toBe(0);
    expect(closure.staleAnswerReviewCount).toBe(0);
    expect(WELDING_CBT_LESSON_PROJECTION.entries).toHaveLength(525);
    expect(WELDING_CBT_ANSWER_REVIEWS.entries).toHaveLength(525);
  });

  it("closes all 341 former safety-bucket canonicals with one reviewed disposition", () => {
    const closure = getWeldingCbtProjectionClosure();

    expect(closure.safetyBankTotal).toBe(341);
    expect(
      closure.safetyApprovedExactOneCount
        + closure.safetyReviewedProjectionHoldCount,
    ).toBe(341);
  });

  it("materializes only rows with both projection and answer-review approval", () => {
    const errors: string[] = [];

    for (const entry of WELDING_CBT_LESSON_PROJECTION.entries) {
      const question = importedQuestionById.get(entry.canonicalId);
      const answerReview = getWeldingCbtAnswerReview(entry.canonicalId);
      if (entry.reviewStatus === "hold") {
        if (entry.primaryLeafLessonId !== null || entry.reasonCodes.length === 0) {
          errors.push(`${entry.canonicalId}:invalid-hold`);
        }
        if (question) {
          errors.push(`${entry.canonicalId}:projection-hold-published`);
        }
        continue;
      }
      if (
        !answerReview
        || !isWeldingCbtAnswerReviewPublishable(answerReview)
      ) {
        if (question) {
          errors.push(`${entry.canonicalId}:answer-review-gate-bypassed`);
        }
        continue;
      }
      if (!isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId)) {
        if (question) {
          errors.push(`${entry.canonicalId}:independent-review-gate-bypassed`);
        }
        continue;
      }
      if (!hasMatchingReviewedProjection(answerReview)) {
        if (question) {
          errors.push(`${entry.canonicalId}:projection-binding-gate-bypassed`);
        }
        continue;
      }
      if (!entry.primaryLeafLessonId) {
        errors.push(`${entry.canonicalId}:missing-primary`);
        continue;
      }
      const lesson = lessonById.get(entry.primaryLeafLessonId);
      if (!lesson || !isPublishableLesson(lesson)) {
        errors.push(`${entry.canonicalId}:unpublished-primary`);
      }
      if (
        projectionCandidateById.get(entry.canonicalId)?.aggregateTopicKey
        !== entry.aggregateTopicKey
      ) {
        errors.push(`${entry.canonicalId}:aggregate-category-mismatch`);
      }
      const targetBlock = lesson?.blocks.find(
        (block) => block.id === answerReview.conceptBinding.lessonBlockId,
      );
      const targetBlockEvidenceRef =
        `${answerReview.conceptBinding.lessonId}#${answerReview.conceptBinding.lessonBlockId}`;
      if (!targetBlock) {
        errors.push(`${entry.canonicalId}:lesson-block-missing`);
      }
      if (
        !answerReview.conceptBinding.evidenceRefs.some(
          (evidence) =>
            evidence.kind === "lesson_block"
            && evidence.ref === targetBlockEvidenceRef,
        )
      ) {
        errors.push(`${entry.canonicalId}:lesson-block-evidence-mismatch`);
      }
      if (question?.lessonId !== entry.primaryLeafLessonId) {
        errors.push(`${entry.canonicalId}:runtime-mismatch`);
      }
      if (question?.lessonAnchor !== answerReview.conceptBinding.lessonBlockId) {
        errors.push(`${entry.canonicalId}:runtime-block-mismatch`);
      }
    }

    expect(errors).toEqual([]);
  });

  it("keeps the runtime exact-set equal to publishable answer reviews", () => {
    const publishableReviewIds = WELDING_CBT_ANSWER_REVIEWS.entries
      .filter(
        (entry) =>
          isWeldingCbtAnswerReviewPublishable(entry)
          && isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId)
          && hasMatchingReviewedProjection(entry),
      )
      .map((entry) => entry.canonicalId)
      .sort();
    const runtimeQuestionIds = importedQuestions
      .filter(isPublishableQuestion)
      .map((question) => question.id)
      .sort();
    const heldOrPendingIds = new Set(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter(
          (entry) =>
            !isWeldingCbtAnswerReviewPublishable(entry)
            || !isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId),
        )
        .map((entry) => entry.canonicalId),
    );

    expect(runtimeQuestionIds).toEqual(publishableReviewIds);
    expect(
      runtimeQuestionIds.filter((questionId) => heldOrPendingIds.has(questionId)),
    ).toEqual([]);
  });

  it("keeps source closure and independently accepted runtime publication as separate gates", () => {
    const closure = getWeldingCbtProjectionClosure();
    const sourceApprovedCount = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
      isWeldingCbtAnswerReviewPublishable,
    ).length;
    const independentlyAcceptedCount =
      WELDING_CBT_ANSWER_REVIEWS.entries.filter(
        (entry) =>
          isWeldingCbtAnswerReviewPublishable(entry)
          && isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId),
      ).length;
    const projectionAlignedCount =
      WELDING_CBT_ANSWER_REVIEWS.entries.filter(
        (entry) =>
          isWeldingCbtAnswerReviewPublishable(entry)
          && isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId)
          && hasMatchingReviewedProjection(entry),
      ).length;

    expect(WELDING_CBT_LESSON_PROJECTION.entries).toHaveLength(525);
    expect(WELDING_CBT_ANSWER_REVIEWS.entries).toHaveLength(525);
    expect(closure.missingAnswerReviewCount).toBe(0);
    expect(closure.staleAnswerReviewCount).toBe(0);
    expect(sourceApprovedCount).toBeGreaterThanOrEqual(
      independentlyAcceptedCount,
    );
    expect(independentlyAcceptedCount).toBe(
      INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT,
    );
    expect(importedQuestions).toHaveLength(projectionAlignedCount);
    expect(importedQuestions.every(isPublishableQuestion)).toBe(true);
    expect(
      importedQuestions.every((question) => Boolean(question.approvedReview)),
    ).toBe(true);
  });

  it("keeps aggregate overview lessons free of direct question bindings", () => {
    expect(
      importedQuestions.filter((question) =>
        WELDING_CBT_AGGREGATE_LESSON_IDS.some(
          (lessonId) => lessonId === question.lessonId,
        ),
      ),
    ).toEqual([]);
    expect(
      WELDING_CBT_AGGREGATE_LESSON_IDS.map(
        (lessonId) => lessonById.get(lessonId)?.relatedQuestionIds ?? [],
      ),
    ).toEqual([[], [], [], [], []]);
  });

  it("shows no more than five directly related originals on each fine lesson", () => {
    const fineLessonIds = new Set(
      WELDING_CBT_LESSON_PROJECTION.entries.flatMap((entry) =>
        entry.primaryLeafLessonId ? [entry.primaryLeafLessonId] : [],
      ),
    );

    for (const lessonId of fineLessonIds) {
      const rankedIds = WELDING_CBT_ANSWER_REVIEWS.entries
        .filter(
          (entry) =>
            isWeldingCbtAnswerReviewPublishable(entry)
            && isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId)
            && entry.conceptBinding.lessonId === lessonId
            && entry.essentialRank !== null,
        )
        .sort((left, right) =>
          (left.essentialRank ?? 0) - (right.essentialRank ?? 0))
        .map((entry) => entry.canonicalId);
      const lesson = lessonById.get(lessonId);

      expect(lesson?.relatedQuestionIds).toEqual(rankedIds);
      expect(getPastExamExamples(content, lessonId, 5).length).toBeLessThanOrEqual(5);
    }
  }, 15_000);
});
