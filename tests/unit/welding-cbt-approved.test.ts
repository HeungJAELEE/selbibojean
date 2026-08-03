import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import weldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  getWeldingCbtAnswerReview,
  isWeldingCbtAnswerReviewPublishable,
  validateWeldingCbtAnswerReviewQuality,
} from "@/data/source/welding-cbt-answer-review";
import { isIndependentlyAcceptedWeldingCbtQuestion } from "@/data/source/welding-cbt-independent-review-gates";
import {
  WELDING_CBT_AGGREGATE_LESSON_IDS,
  WELDING_CBT_LESSON_PROJECTION,
} from "@/data/source/welding-cbt-lesson-projection";
import { getSafeOriginalsByQuestion } from "@/lib/content/practice-presentations";
import {
  getWeldingCbtProjectionCandidates,
  getWeldingCbtCurationSummary,
} from "@/lib/content/welding-cbt-approved";
import { buildRuntimeContentBeforeDirectFeedback } from "@/lib/content/runtime-content";
import { isPublishableLesson, isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContentBeforeDirectFeedback(
  generatedContent as GeneratedContent,
);
const weldingQuestions = content.questions.filter((question) =>
  question.id.startsWith("wcbt-"),
);
const weldingLessons = content.lessons.filter((lesson) =>
  lesson.id.startsWith("lesson-welding-cbt-"),
);
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
const publishableReviewIds = new Set(
  WELDING_CBT_ANSWER_REVIEWS.entries
    .filter(
      (entry) =>
        isWeldingCbtAnswerReviewPublishable(entry)
        && isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId)
        && hasMatchingReviewedProjection(entry),
    )
    .map((entry) => entry.canonicalId),
);

describe("approved welding CBT bank", () => {
  it("reconciles every discovered occurrence as approved or held", () => {
    expect(weldingCbtBank.trackSummary).toEqual([
      expect.objectContaining({
        trackKey: "welding-craftsman",
        pageCount: 29,
        selectedQuestionCount: 1740,
        approvedQuestionCount: 1533,
        heldQuestionCount: 207,
      }),
      expect.objectContaining({
        trackKey: "welding-industrial-engineer",
        pageCount: 43,
        selectedQuestionCount: 860,
        approvedQuestionCount: 841,
        heldQuestionCount: 19,
      }),
      expect.objectContaining({
        trackKey: "welding-engineer",
        pageCount: 34,
        selectedQuestionCount: 680,
        approvedQuestionCount: 668,
        heldQuestionCount: 12,
      }),
    ]);
    expect(
      weldingCbtBank.trackSummary.reduce(
        (total, track) => total + track.selectedQuestionCount,
        0,
      ),
    ).toBe(3280);
    expect(
      weldingCbtBank.trackSummary.reduce(
        (total, track) =>
          total + track.approvedQuestionCount + track.heldQuestionCount,
        0,
      ),
    ).toBe(3280);
  });

  it("keeps the complete source audit while publishing only answer-reviewed rows", () => {
    const approvedRecords = weldingCbtBank.records.filter(
      (record) => record.auditResolution === "approved",
    );
    const heldIds = new Set(
      weldingCbtBank.records
        .filter((record) => record.auditResolution === "hold")
        .map((record) => record.externalId),
    );

    expect(approvedRecords).toHaveLength(3042);
    expect(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter((review) => review.reviewStatus === "approved")
        .flatMap(validateWeldingCbtAnswerReviewQuality),
    ).toEqual([]);
    expect(new Set(weldingQuestions.map((question) => question.id))).toEqual(
      publishableReviewIds,
    );
    expect(weldingQuestions.every(isPublishableQuestion)).toBe(true);
    expect(content.variants.filter((variant) => heldIds.has(variant.externalId))).toEqual([]);
    expect(
      content.variants
        .filter((variant) => variant.canonicalId.startsWith("wcbt-"))
        .every((variant) => publishableReviewIds.has(variant.canonicalId)),
    ).toBe(true);
    expect(
      approvedRecords.every(
        (record) =>
          record.contentFidelity === "exact" &&
          record.answerEvidence === "single_capture_uncontested" &&
          record.assetStatus === "not_required" &&
          record.correctIndex !== null,
      ),
    ).toBe(true);
  });

  it("preserves source fidelity and materializes authored solution and choice feedback", () => {
    for (const question of weldingQuestions) {
      const source = weldingCbtBank.records.find(
        (record) => record.canonicalId === question.id,
      );
      const review = getWeldingCbtAnswerReview(question.id);

      expect(source, `${question.id}: source record`).toBeDefined();
      expect(
        review !== null
          && isWeldingCbtAnswerReviewPublishable(review),
        `${question.id}: answer review`,
      ).toBe(true);
      if (!source || !review || !isWeldingCbtAnswerReviewPublishable(review)) {
        continue;
      }

      expect(question.stem).toBe(source.stem);
      expect(question.choices.map((choice) => choice.text)).toEqual(source.choices);
      expect(question.correctChoiceId).toBe(
        question.choices[source.correctIndex ?? -1]?.id,
      );
      expect(question.explanation).toBe(
        [
          review.answerExplanation,
          ...review.solutionSteps,
          review.keyRule,
        ].join("\n\n"),
      );
      expect(question.lessonId).toBe(review.conceptBinding.lessonId);
      expect(question.lessonAnchor).toBe(review.conceptBinding.lessonBlockId);
      const targetLesson = content.lessons.find(
        (lesson) => lesson.id === review.conceptBinding.lessonId,
      );
      expect(
        targetLesson?.blocks.some(
          (block) => block.id === review.conceptBinding.lessonBlockId,
        ),
        `${question.id}: target lesson block`,
      ).toBe(true);
      expect(
        review.conceptBinding.evidenceRefs,
        `${question.id}: target lesson block evidence`,
      ).toContainEqual({
        kind: "lesson_block",
        ref: `${review.conceptBinding.lessonId}#${review.conceptBinding.lessonBlockId}`,
      });
      expect(question.approvedReview).toEqual(
        expect.objectContaining({
          directSolution: review.answerExplanation,
          conceptBinding: {
            assertionText: review.conceptBinding.assertionText,
            href: `/written/theory/${review.conceptBinding.lessonId}#${review.conceptBinding.lessonBlockId}`,
          },
        }),
      );

      for (const authored of review.choiceFeedback) {
        const { choiceIndex, relation: _relation, ...expectedFeedback } = authored;
        void _relation;
        expect(question.choices[choiceIndex]?.feedback).toEqual(expectedFeedback);
      }
    }
  });

  it("structures authored calculation feedback when formula evidence is available", () => {
    const question = weldingQuestions.find(
      (candidate) =>
        candidate.id === "wcbt-4533db22-25e9-48ab-8060-a0559a855a21",
    );

    expect(question?.approvedReview?.calculation).toEqual({
      formula:
        "식을 H=ηVI×60/v [J/cm]로 세우고, 효율이 별도로 없으므로 η=1로 둡니다.",
      substitution:
        "H=1×24V×200A×60s/min÷6cm/min으로 주어진 값을 단위와 함께 대입합니다.",
      result: "48000J/cm",
      unit: "J/cm",
    });
  });

  it("keeps every approved lesson binding backed by an existing block and evidence ref", () => {
    const approvedReviews = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
      isWeldingCbtAnswerReviewPublishable,
    );

    expect(approvedReviews.length).toBeGreaterThan(0);
    for (const review of approvedReviews) {
      const lesson = content.lessons.find(
        (candidate) => candidate.id === review.conceptBinding.lessonId,
      );
      const block = lesson?.blocks.find(
        (candidate) =>
          candidate.id === review.conceptBinding.lessonBlockId,
      );

      expect(lesson, review.canonicalId).toBeDefined();
      expect(block, review.canonicalId).toBeDefined();
      expect(
        review.conceptBinding.evidenceRefs,
        review.canonicalId,
      ).toContainEqual({
        kind: "lesson_block",
        ref: `${review.conceptBinding.lessonId}#${review.conceptBinding.lessonBlockId}`,
      });
    }
  });

  it("keeps five overview lessons while binding originals to fine lessons", () => {
    expect(weldingLessons.map((lesson) => lesson.title)).toEqual([
      "용접 기초",
      "아크용접",
      "가스절단·특수용접",
      "용접결함·검사",
      "산업안전",
    ]);
    expect(weldingLessons.every(isPublishableLesson)).toBe(true);
    expect(
      weldingLessons.every((lesson) => lesson.relatedQuestionIds.length === 0),
    ).toBe(true);
    expect(
      weldingQuestions.every(
        (question) =>
          !WELDING_CBT_AGGREGATE_LESSON_IDS.some(
            (lessonId) => lessonId === question.lessonId,
          ),
      ),
    ).toBe(true);
    expect(
      weldingQuestions.every((question) => {
        const review = getWeldingCbtAnswerReview(question.id);
        const lesson = content.lessons.find(
          (candidate) => candidate.id === question.lessonId,
        );
        return review?.essentialRank === null
          ? !lesson?.relatedQuestionIds.includes(question.id)
          : lesson?.relatedQuestionIds.includes(question.id);
      }),
    ).toBe(true);
  });

  it("publishes every curated safety question and caps non-safety repetition", () => {
    const summary = getWeldingCbtCurationSummary();

    expect(summary.sourceApprovedOccurrenceCount).toBe(3042);
    expect(summary.safety.eligibleCanonicalCount).toBe(
      summary.safety.publishedCanonicalCount,
    );
    expect(summary.safety.publishedCanonicalCount).toBeGreaterThan(200);
    expect(
      summary.rules
        .filter((rule) => rule.part !== "산업안전")
        .every((rule) => rule.publishedCanonicalCount <= rule.limit),
    ).toBe(true);
  });

  it("exposes text-complete originals and keeps visual-cue variants fail-closed", () => {
    const originals = getSafeOriginalsByQuestion(
      weldingQuestions,
      content.variants,
    );
    const originalCount = [...originals.values()].reduce(
      (total, variants) => total + variants.length,
      0,
    );

    expect(originalCount).toBeGreaterThanOrEqual(originals.size);
    expect([...originals.keys()].every((questionId) =>
      publishableReviewIds.has(questionId))).toBe(true);
    expect(
      [...originals.values()]
        .flat()
        .every((variant) => variant.sourceUrl.startsWith("https://cbtbank.kr/exam/")),
    ).toBe(true);
  });
});
