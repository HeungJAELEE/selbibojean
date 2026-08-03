import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import { isIndependentlyAcceptedWeldingCbtQuestion } from "@/data/source/welding-cbt-independent-review-gates";
import { notionGapWrittenLessons } from "@/lib/content/notion-gap-written-lessons";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { supplementalWrittenLessons } from "@/lib/content/supplemental-written-lessons";
import { getWeldingCbtCurationSummary } from "@/lib/content/welding-cbt-approved";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const base = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src", "data", "generated", "content.json"),
    "utf8",
  ),
) as GeneratedContent;
const content = buildRuntimeContent(base);

describe("runtime merged content gates", () => {
  it("keeps IDs and reviewed question-to-lesson relationships consistent", () => {
    expect(new Set(content.questions.map((item) => item.id)).size).toBe(
      content.questions.length,
    );
    expect(new Set(content.lessons.map((item) => item.id)).size).toBe(
      content.lessons.length,
    );
    const lessonById = new Map(
      content.lessons.map((lesson) => [lesson.id, lesson]),
    );
    expect(
      content.questions.filter((question) => {
        const lesson = lessonById.get(question.lessonId);
        if (!lesson || lesson.subjectId !== question.subjectId) return true;
        if (question.approvedReview) {
          return question.approvedReview.conceptBinding.href
            !== `/written/theory/${question.lessonId}#${question.lessonAnchor}`;
        }
        return lesson.conceptGroupId !== question.conceptGroupId;
      }),
    ).toEqual([]);
  });

  it("publishes a question only when its linked lesson is also publishable", () => {
    const lessonById = new Map(
      content.lessons.map((lesson) => [lesson.id, lesson]),
    );
    expect(
      content.questions
        .filter(isPublishableQuestion)
        .filter(
          (question) =>
            !isPublishableLesson(lessonById.get(question.lessonId)!),
        ),
    ).toEqual([]);
  });

  it("publishes the fully direct-reviewed 33rd-batch welding safety rows", () => {
    const weldingQuestions = content.questions.filter((question) =>
      question.id.startsWith("welding-safety-b33-"),
    );
    const heldWelding = weldingQuestions.filter((question) =>
      question.audit?.auditDisposition.startsWith("held_"),
    );

    expect(weldingQuestions).toHaveLength(150);
    expect(weldingQuestions.filter(isPublishableQuestion)).toHaveLength(150);
    expect(
      weldingQuestions.filter((question) => question.approvedReview),
    ).toHaveLength(150);
    expect(
      weldingQuestions.every((question) => question.contentStatus === "published"),
    ).toBe(true);
    expect(heldWelding).toEqual([]);
  });

  it("applies the complete written-question audit and blocks every held item", () => {
    const audited = content.questions.filter((question) => question.audit);
    const runtimeWeldingQuestions = content.questions.filter((question) =>
      question.id.startsWith("wcbt-"),
    );
    const runtimeWeldingVariants = content.variants.filter((variant) =>
      variant.canonicalId.startsWith("wcbt-"),
    );
    const publishableWeldingReviewIds = new Set(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter(
          (entry) =>
            isWeldingCbtAnswerReviewPublishable(entry)
            && isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId),
        )
        .map((entry) => entry.canonicalId),
    );
    const blockedWeldingReviewIds = new Set(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter(
          (entry) =>
            !isWeldingCbtAnswerReviewPublishable(entry)
            || !isIndependentlyAcceptedWeldingCbtQuestion(entry.canonicalId),
        )
        .map((entry) => entry.canonicalId),
    );
    const weldingCuration = getWeldingCbtCurationSummary();
    const held = audited.filter((question) =>
      question.audit?.auditDisposition.startsWith("held_"),
    );

    expect(
      new Set(runtimeWeldingQuestions.map((question) => question.id)),
    ).toEqual(publishableWeldingReviewIds);
    expect(
      new Set(runtimeWeldingVariants.map((variant) => variant.canonicalId)),
    ).toEqual(publishableWeldingReviewIds);
    expect(
      runtimeWeldingQuestions.filter((question) =>
        blockedWeldingReviewIds.has(question.id),
      ),
    ).toEqual([]);
    expect(
      runtimeWeldingVariants.filter((variant) =>
        blockedWeldingReviewIds.has(variant.canonicalId),
      ),
    ).toEqual([]);
    expect(blockedWeldingReviewIds.size).toBe(
      WELDING_CBT_ANSWER_REVIEWS.entries.length
        - publishableWeldingReviewIds.size,
    );
    expect(weldingCuration.sourceApprovedCanonicalCount).toBe(3009);
    expect(audited).toHaveLength(281 + runtimeWeldingQuestions.length);
    expect(
      audited.filter((question) => question.audit?.scope === "review_queue"),
    ).toHaveLength(257);
    expect(
      audited.filter(
        (question) => question.audit?.scope === "high_risk_public",
      ),
    ).toHaveLength(24 + runtimeWeldingQuestions.length);
    expect(held).toHaveLength(15);
    expect(held.some(isPublishableQuestion)).toBe(false);
    expect(
      held.every(
        (question) =>
          Boolean(question.audit?.reviewNote.trim()) &&
          Boolean(question.audit?.nextAction.trim()),
      ),
    ).toBe(true);
  });

  it("publishes supplemental theory while keeping it outside question statistics", () => {
    const supplemental = content.lessons.filter(
      (lesson) => lesson.contentRole === "supplemental",
    );

    expect(supplemental).toHaveLength(
      supplementalWrittenLessons.length + notionGapWrittenLessons.length,
    );
    expect(supplemental.every(isPublishableLesson)).toBe(true);
    expect(
      supplemental.every((lesson) => lesson.relatedQuestionIds.length === 0),
    ).toBe(true);
    const supplementalIds = new Set(supplemental.map((lesson) => lesson.id));
    const reviewedTheoryLinks = content.questions.filter(
      (question) =>
        isPublishableQuestion(question)
        && supplementalIds.has(question.lessonId),
    );
    expect(reviewedTheoryLinks.length).toBeGreaterThan(0);
    expect(
      supplemental.flatMap((lesson) => lesson.relatedQuestionIds),
    ).toEqual([]);
  });
});
