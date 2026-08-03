import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import generatedContent from "@/data/generated/content.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import {
  WELDING_CBT_AGGREGATE_LESSON_IDS,
  WELDING_CBT_LESSON_PROJECTION,
} from "@/data/source/welding-cbt-lesson-projection";
import { isIndependentlyAcceptedWeldingCbtQuestion } from "@/data/source/welding-cbt-independent-review-gates";
import { getWeldingCbtProjectionClosure } from "@/lib/content/welding-cbt-approved";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableLesson } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const EXPECTED_SOURCE_CLOSURE = {
  bankTotal: 525,
  safetyBankTotal: 341,
  proposedCount: 0,
  staleCount: 0,
  unreviewedAmbiguousCount: 0,
  unreviewedUnclassifiedCount: 0,
  missingAnswerReviewCount: 0,
  staleAnswerReviewCount: 0,
} as const;

export function verifyWeldingCbtLessonProjection() {
  const closure = getWeldingCbtProjectionClosure();
  const sourceErrors: string[] = [];
  const runtimeErrors: string[] = [];

  for (const [key, expected] of Object.entries(EXPECTED_SOURCE_CLOSURE)) {
    if (closure[key as keyof typeof closure] !== expected) {
      sourceErrors.push(
        `${key}:expected=${expected}:actual=${closure[key as keyof typeof closure]}`,
      );
    }
  }
  if (
    closure.approvedExactOneCount + closure.reviewedProjectionHoldCount
      !== closure.bankTotal
  ) {
    sourceErrors.push(
      `projection-disposition:approved=${closure.approvedExactOneCount}:hold=${closure.reviewedProjectionHoldCount}:bank=${closure.bankTotal}`,
    );
  }
  if (
    closure.safetyApprovedExactOneCount
      + closure.safetyReviewedProjectionHoldCount
      !== closure.safetyBankTotal
  ) {
    sourceErrors.push(
      `safety-projection-disposition:approved=${closure.safetyApprovedExactOneCount}:hold=${closure.safetyReviewedProjectionHoldCount}:bank=${closure.safetyBankTotal}`,
    );
  }
  if (
    closure.answerReviewApprovedCount
      + closure.answerReviewHoldCount
      + closure.answerReviewPendingCount
      !== closure.bankTotal
  ) {
    sourceErrors.push(
      `answer-review-disposition:approved=${closure.answerReviewApprovedCount}:hold=${closure.answerReviewHoldCount}:pending=${closure.answerReviewPendingCount}:bank=${closure.bankTotal}`,
    );
  }

  const runtimeContent = buildRuntimeContent(
    generatedContent as GeneratedContent,
  );
  const runtimeQuestions = runtimeContent.questions.filter((question) =>
    question.id.startsWith("wcbt-"),
  );
  const runtimeQuestionById = new Map(
    runtimeQuestions.map((question) => [question.id, question]),
  );
  const lessonById = new Map(
    runtimeContent.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const projectionById = new Map(
    WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [
      entry.canonicalId,
      entry,
    ]),
  );
  const answerReviewApproved = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
    isWeldingCbtAnswerReviewPublishable,
  );
  const publishableReviews = answerReviewApproved.filter((review) =>
    isIndependentlyAcceptedWeldingCbtQuestion(review.canonicalId)
  );
  const publishableReviewIds = new Set(
    publishableReviews.map((review) => review.canonicalId),
  );
  const aggregateIds = new Set<string>(WELDING_CBT_AGGREGATE_LESSON_IDS);

  for (const review of publishableReviews) {
    const projection = projectionById.get(review.canonicalId);
    const question = runtimeQuestionById.get(review.canonicalId);
    if (
      !projection
      || projection.reviewStatus !== "approved"
      || projection.contentDigest !== review.contentDigest
      || projection.primaryLeafLessonId !== review.primaryLeafLessonId
    ) {
      runtimeErrors.push(`${review.canonicalId}:approved-projection-mismatch`);
      continue;
    }
    const lesson = lessonById.get(projection.primaryLeafLessonId);
    if (!lesson || !isPublishableLesson(lesson)) {
      runtimeErrors.push(`${review.canonicalId}:unpublished-lesson`);
    }
    if (!question) {
      runtimeErrors.push(`${review.canonicalId}:missing-approved-question`);
      continue;
    }
    if (question.lessonId !== projection.primaryLeafLessonId) {
      runtimeErrors.push(`${review.canonicalId}:runtime-lesson-mismatch`);
    }
    if (question.lessonAnchor !== review.conceptBinding.lessonBlockId) {
      runtimeErrors.push(`${review.canonicalId}:runtime-anchor-mismatch`);
    }
  }

  for (const review of WELDING_CBT_ANSWER_REVIEWS.entries) {
    if (
      !isWeldingCbtAnswerReviewPublishable(review)
      && runtimeQuestionById.has(review.canonicalId)
    ) {
      runtimeErrors.push(
        `${review.canonicalId}:${review.reviewStatus}-review-published`,
      );
    }
  }
  for (const question of runtimeQuestions) {
    if (!publishableReviewIds.has(question.id)) {
      runtimeErrors.push(`${question.id}:unexpected-runtime-question`);
    }
    if (aggregateIds.has(question.lessonId)) {
      runtimeErrors.push(`${question.id}:aggregate-binding`);
    }
  }
  for (const lessonId of aggregateIds) {
    const lesson = lessonById.get(lessonId);
    if (!lesson || lesson.relatedQuestionIds.length > 0) {
      runtimeErrors.push(`${lessonId}:aggregate-related-questions`);
    }
  }

  return {
    ok: sourceErrors.length === 0 && runtimeErrors.length === 0,
    source: {
      projectionCount: WELDING_CBT_LESSON_PROJECTION.entries.length,
      answerReviewCount: WELDING_CBT_ANSWER_REVIEWS.entries.length,
      closure,
      errors: sourceErrors,
    },
    runtime: {
      answerReviewApprovedCount: answerReviewApproved.length,
      expectedQuestionCount: publishableReviews.length,
      actualQuestionCount: runtimeQuestions.length,
      heldOrPendingReviewCount:
        WELDING_CBT_ANSWER_REVIEWS.entries.length - publishableReviews.length,
      errors: runtimeErrors,
    },
  };
}

function main() {
  const report = verifyWeldingCbtLessonProjection();
  if (!report.ok) {
    throw new Error(
      `WELDING_CBT_LESSON_PROJECTION_FAILED\n${[
        ...report.source.errors.map((error) => `source:${error}`),
        ...report.runtime.errors.map((error) => `runtime:${error}`),
      ].slice(0, 30).join("\n")}`,
    );
  }
  console.log(
    `WELDING_CBT_LESSON_PROJECTION_OK total=${report.source.closure.bankTotal} safety=${report.source.closure.safetyBankTotal} runtime=${report.runtime.actualQuestionCount} heldOrPending=${report.runtime.heldOrPendingReviewCount}`,
  );
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (entryPath && entryPath === resolve(fileURLToPath(import.meta.url))) {
  main();
}
