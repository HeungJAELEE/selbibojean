import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";
import {
  getPastExamExamples,
  isUsablePastExamVariant,
} from "@/lib/content/past-exam-examples";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);

describe("reviewed essential welding past-exam examples", () => {
  it("uses unique contiguous ranks from 1 through at most 5 within each lesson", () => {
    const ranksByLesson = new Map<string, number[]>();

    for (const entry of WELDING_CBT_ANSWER_REVIEWS.entries) {
      if (
        !isWeldingCbtAnswerReviewPublishable(entry)
        || entry.essentialRank === null
      ) {
        continue;
      }
      const current = ranksByLesson.get(entry.conceptBinding.lessonId) ?? [];
      current.push(entry.essentialRank);
      ranksByLesson.set(entry.conceptBinding.lessonId, current);
    }

    for (const [lessonId, ranks] of ranksByLesson) {
      const sorted = [...ranks].sort((left, right) => left - right);
      expect(sorted, lessonId).toEqual(
        Array.from({ length: sorted.length }, (_, index) => index + 1),
      );
      expect(sorted.length, lessonId).toBeLessThanOrEqual(5);
    }
  }, 60_000);

  it("returns only reviewed essentials with usable variants in rank order without heuristic supplementation", () => {
    const fineLessonIds = new Set(
      WELDING_CBT_LESSON_PROJECTION.entries.flatMap((entry) =>
        entry.primaryLeafLessonId ? [entry.primaryLeafLessonId] : [],
      ),
    );
    const usableCanonicalIds = new Set(
      content.variants
        .filter(isUsablePastExamVariant)
        .map((variant) => variant.canonicalId),
    );

    for (const lessonId of fineLessonIds) {
      const expectedCanonicalIds = WELDING_CBT_ANSWER_REVIEWS.entries
        .filter(
          (entry) =>
            isWeldingCbtAnswerReviewPublishable(entry)
            && entry.conceptBinding.lessonId === lessonId
            && entry.essentialRank !== null
            && usableCanonicalIds.has(entry.canonicalId),
        )
        .sort((left, right) =>
          (left.essentialRank ?? 0) - (right.essentialRank ?? 0))
        .map((entry) => entry.canonicalId);
      const examples = getPastExamExamples(
        content,
        lessonId,
        Number.POSITIVE_INFINITY,
      );

      expect(
        examples.map((example) => example.canonicalId),
        lessonId,
      ).toEqual(expectedCanonicalIds);
      expect(examples.length, lessonId).toBeLessThanOrEqual(5);
    }
  }, 60_000);
});
