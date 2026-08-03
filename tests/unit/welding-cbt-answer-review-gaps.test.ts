import { describe, expect, it } from "vitest";

import { WELDING_CBT_ANSWER_REVIEWS } from "@/data/source/welding-cbt-answer-review";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";
import { buildWeldingCbtAnswerReviewGapReport } from "../../scripts/report-welding-cbt-answer-review-gaps";

function sumCounts(rows: readonly { count: number }[]) {
  return rows.reduce((total, row) => total + row.count, 0);
}

function expectSorted(values: readonly string[]) {
  expect(values).toEqual([...values].sort());
}

describe("welding CBT answer-review gap report", () => {
  it("reports the complete 525-row registry without assuming current progress counts", () => {
    const report = buildWeldingCbtAnswerReviewGapReport();

    expect(report.entryCount).toBe(525);
    expect(
      report.progress.pristinePending
      + report.progress.authoredPending
      + report.progress.approved
      + report.progress.hold,
    ).toBe(525);
    expect(sumCounts(report.counts.reviewStatus)).toBe(525);
    expect(sumCounts(report.counts.authoringDisposition)).toBe(525);
    expect(sumCounts(report.counts.assessmentKind)).toBe(525);
    expect(sumCounts(report.counts.primaryLesson)).toBe(525);
    expect(sumCounts(report.counts.proposedLesson)).toBe(525);
  });

  it("is deterministic and keeps every aggregate key and sample ID sorted", () => {
    const first = buildWeldingCbtAnswerReviewGapReport();
    const second = buildWeldingCbtAnswerReviewGapReport();

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    for (const rows of Object.values(first.counts)) {
      expectSorted(rows.map((row) => row.key));
      for (const row of rows) {
        expectSorted(row.topCanonicalIds);
        expect(row.topCanonicalIds.length).toBeLessThanOrEqual(10);
      }
    }
    for (const canonicalIds of Object.values(
      first.topAffectedCanonicalIds,
    )) {
      expectSorted(canonicalIds);
      expect(canonicalIds.length).toBeLessThanOrEqual(10);
    }
  });

  it("normalizes the first hold-reason prefix and resolves proposed lessons", () => {
    const [first, second] = WELDING_CBT_ANSWER_REVIEWS.entries;
    const firstProjection = WELDING_CBT_LESSON_PROJECTION.entries.find(
      (entry) => entry.canonicalId === first.canonicalId,
    );
    if (!firstProjection) {
      throw new Error("gap report fixture projection is missing");
    }
    const fixtures = [
      {
        ...first,
        holdReasons: [" rights_hold : detail:ignored"],
      },
      {
        ...second,
        holdReasons: ["rights_hold:other detail"],
      },
    ];
    const report = buildWeldingCbtAnswerReviewGapReport(
      fixtures,
      [firstProjection],
    );

    expect(report.counts.firstHoldReasonCode).toEqual([
      {
        key: "rights_hold",
        count: 2,
        topCanonicalIds: [first.canonicalId, second.canonicalId].sort(),
      },
    ]);
    expect(report.counts.proposedLesson).toEqual([
      {
        key: "(missing-projection)",
        count: 1,
        topCanonicalIds: [second.canonicalId],
      },
      {
        key: firstProjection.primaryLeafLessonId ?? "(unassigned)",
        count: 1,
        topCanonicalIds: [first.canonicalId],
      },
    ].sort((left, right) => left.key.localeCompare(right.key)));
  });
});
