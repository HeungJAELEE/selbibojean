import { describe, expect, it } from "vitest";

import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import { buildWeldingCbtEssentialCandidateReport } from "../../scripts/report-welding-cbt-essential-candidates";

describe("welding CBT essential-candidate report", () => {
  it("is deterministic, reconciled, capped, directly bound, and read-only", () => {
    const reviewsBefore = JSON.stringify(
      WELDING_CBT_ANSWER_REVIEWS.entries,
    );
    const reviewByCanonicalId = new Map(
      WELDING_CBT_ANSWER_REVIEWS.entries.map((entry) => [
        entry.canonicalId,
        entry,
      ]),
    );

    const first = buildWeldingCbtEssentialCandidateReport();
    const second = buildWeldingCbtEssentialCandidateReport();

    expect(first.ok).toBe(true);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(first.policy.mutation).toBe("none");
    expect(
      Object.values(first.reconciliation.checks).every((check) => check.ok),
    ).toBe(true);
    expect(
      first.lessons.reduce(
        (total, lesson) => total + lesson.suggestions.length,
        0,
      ),
    ).toBe(first.reconciliation.suggestionCount);

    const selectedCanonicalIds = new Set<string>();
    for (const lesson of first.lessons) {
      expect(lesson.suggestions.length).toBeLessThanOrEqual(5);
      expect(lesson.suggestions.map((suggestion) => suggestion.rank)).toEqual(
        Array.from(
          { length: lesson.suggestions.length },
          (_, index) => index + 1,
        ),
      );
      for (const suggestion of lesson.suggestions) {
        expect(selectedCanonicalIds.has(suggestion.canonicalId)).toBe(false);
        selectedCanonicalIds.add(suggestion.canonicalId);
        const groupedCanonicalIds = [
          suggestion.canonicalId,
          ...suggestion.duplicateCanonicalIds,
        ];
        for (const canonicalId of groupedCanonicalIds) {
          const review = reviewByCanonicalId.get(canonicalId);
          expect(review).toBeDefined();
          expect(
            review && isWeldingCbtAnswerReviewPublishable(review),
          ).toBe(true);
          if (!review || !isWeldingCbtAnswerReviewPublishable(review)) continue;
          expect(review.primaryLeafLessonId).toBe(
            lesson.primaryLeafLessonId,
          );
          expect(review.conceptBinding.lessonId).toBe(
            lesson.primaryLeafLessonId,
          );
          expect(review.conceptBinding.evidenceRefs).toContainEqual({
            kind: "lesson_block",
            ref:
              `${review.primaryLeafLessonId}#`
              + review.conceptBinding.lessonBlockId,
          });
        }
        expect(suggestion.reasons).toEqual([
          `occurrences=${suggestion.occurrenceCount}`,
          `latest=${suggestion.latestExamDate}`,
          `diversity=${
            suggestion.addedAssessmentKinds.join(",") || "repeat"
          }`,
          `evidence=${suggestion.evidenceCompleteness.score}`,
        ]);
      }
    }

    expect(
      JSON.stringify(WELDING_CBT_ANSWER_REVIEWS.entries),
    ).toBe(reviewsBefore);
  });

  it("preserves the source-reviewed essential order without auto-filling unrelated families", () => {
    const report = buildWeldingCbtEssentialCandidateReport();
    const reviewByCanonicalId = new Map(
      WELDING_CBT_ANSWER_REVIEWS.entries.map((entry) => [
        entry.canonicalId,
        entry,
      ]),
    );

    for (const lesson of report.lessons) {
      const seenKinds = new Set<string>();
      for (const suggestion of lesson.suggestions) {
        const review = reviewByCanonicalId.get(suggestion.canonicalId);
        expect(review?.essentialRank).toBe(suggestion.rank);
        expect(review?.essentialRationale).not.toBeNull();
        const addedKinds = suggestion.assessmentKinds.filter(
          (kind) => !seenKinds.has(kind),
        );
        expect(suggestion.addedAssessmentKinds).toEqual(addedKinds);
        suggestion.assessmentKinds.forEach((kind) => seenKinds.add(kind));
      }
    }
  });

  it("collapses conservative near duplicates but preserves different questions", () => {
    const report = buildWeldingCbtEssentialCandidateReport();
    const suggestions = report.lessons.flatMap((lesson) =>
      lesson.suggestions.map((suggestion) => ({
        lessonId: lesson.primaryLeafLessonId,
        ...suggestion,
      })));
    const groupFor = (canonicalId: string) =>
      suggestions.find((suggestion) =>
        suggestion.canonicalId === canonicalId
        || suggestion.duplicateCanonicalIds.includes(canonicalId)
      );

    expect(
      groupFor("wcbt-1e33d37e-fada-4314-b5a8-696176e14297"),
    ).toBeDefined();
    expect(
      groupFor("wcbt-360f4bdc-a4ab-4be1-89af-2d0c71eab08c"),
    ).toBeDefined();
    expect(
      groupFor("wcbt-0f682295-1b00-4762-b2a3-e65cfab323a4"),
    ).toBeDefined();
    expect(groupFor("wcbt-1e33d37e-fada-4314-b5a8-696176e14297")).toEqual(
      groupFor("wcbt-9aef99ef-f65c-4b48-aedb-4221b508eda6"),
    );
    expect(groupFor("wcbt-360f4bdc-a4ab-4be1-89af-2d0c71eab08c")).toEqual(
      groupFor("wcbt-49ddc1c2-05f9-454e-a01a-21440d2f4a92"),
    );
    expect(groupFor("wcbt-0f682295-1b00-4762-b2a3-e65cfab323a4")).toEqual(
      groupFor("wcbt-2e3af0f9-d9ee-4606-887b-a305525d6e79"),
    );
    expect(groupFor("wcbt-0f682295-1b00-4762-b2a3-e65cfab323a4")).toEqual(
      groupFor("wcbt-7d98f9f8-8c72-49cc-b81a-6c1b13d5ae2b"),
    );

    expect(groupFor("wcbt-3722e991-f852-44bf-bcc5-efaa75c7fa9c")).not.toEqual(
      groupFor("wcbt-6c1607b3-09d3-429f-b911-7a6d2f5f7418"),
    );
    expect(groupFor("wcbt-4533db22-25e9-48ab-8060-a0559a855a21")).not.toEqual(
      groupFor("wcbt-d73939fa-7fef-4141-a9ff-ce886310e8bb"),
    );
  });

  it("keeps the broader NDT mapping and does not auto-fill its RT-only subset", () => {
    const report = buildWeldingCbtEssentialCandidateReport();
    const ndtLesson = report.lessons.find(
      (lesson) =>
        lesson.primaryLeafLessonId === "lesson-welding-inspection-ndt",
    );
    expect(ndtLesson).toBeDefined();
    expect(ndtLesson?.suggestions.map((suggestion) => ({
      rank: suggestion.rank,
      canonicalId: suggestion.canonicalId,
    }))).toEqual([
      {
        rank: 1,
        canonicalId: "wcbt-fffecb03-9c1c-4f9c-9caf-0821b5f0d224",
      },
      {
        rank: 2,
        canonicalId: "wcbt-3722e991-f852-44bf-bcc5-efaa75c7fa9c",
      },
      {
        rank: 3,
        canonicalId: "wcbt-6c1607b3-09d3-429f-b911-7a6d2f5f7418",
      },
      {
        rank: 4,
        canonicalId: "wcbt-1ebc004e-8a18-4c02-b920-096418dd28cd",
      },
    ]);
    expect(ndtLesson?.subsumedCandidateGroups).toEqual([
      {
        canonicalId: "wcbt-493b2168-1ef8-40e4-b986-92db667cd95d",
        comprehensiveCanonicalIds: [
          "wcbt-1ebc004e-8a18-4c02-b920-096418dd28cd",
        ],
        rule:
          "single_symbol_identification_covered_by_multi_symbol_mapping",
      },
    ]);
    expect(
      report.reconciliation.subsumedCandidateGroupCount,
    ).toBeGreaterThanOrEqual(1);
    expect(report.reconciliation.sourceEssentialRankMismatchCount).toBe(0);

    const reviewByCanonicalId = new Map(
      WELDING_CBT_ANSWER_REVIEWS.entries.map((entry) => [
        entry.canonicalId,
        entry,
      ]),
    );
    expect(
      reviewByCanonicalId.get(
        "wcbt-493b2168-1ef8-40e4-b986-92db667cd95d",
      ),
    ).toMatchObject({
      reviewStatus: "approved",
      essentialRank: null,
      essentialRationale: null,
    });
    expect(
      reviewByCanonicalId.get(
        "wcbt-1ebc004e-8a18-4c02-b920-096418dd28cd",
      ),
    ).toMatchObject({
      essentialRank: 4,
    });
  });

  it("states the resistance-welding joint classification accurately", () => {
    const review = WELDING_CBT_ANSWER_REVIEWS.entries.find(
      (entry) =>
        entry.canonicalId
        === "wcbt-7d98f9f8-8c72-49cc-b81a-6c1b13d5ae2b",
    );
    expect(review).toMatchObject({
      essentialRank: 2,
      essentialRationale:
        "프로젝션용접은 겹치기 이음, 플래시용접은 맞대기 이음이라는 저항용접 분류를 구분하는 대표 문항입니다.",
    });
  });
});
