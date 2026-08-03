import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  WELDING_CBT_ANSWER_REVIEWS,
  type WeldingCbtAnswerReviewEntry,
} from "../src/data/source/welding-cbt-answer-review";
import { WELDING_CBT_LESSON_PROJECTION } from "../src/data/source/welding-cbt-lesson-projection";

const TOP_CANONICAL_ID_LIMIT = 10;
const UNASSIGNED_LESSON = "(unassigned)";
const MISSING_PROJECTION = "(missing-projection)";

type LessonProjection = {
  canonicalId: string;
  primaryLeafLessonId: string | null;
};

type CountBucket = {
  key: string;
  count: number;
  topCanonicalIds: string[];
};

type GapEntries = {
  pristinePending: WeldingCbtAnswerReviewEntry[];
  authoredPending: WeldingCbtAnswerReviewEntry[];
  approved: WeldingCbtAnswerReviewEntry[];
  hold: WeldingCbtAnswerReviewEntry[];
};

function compareText(left: string, right: string) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function sortedCanonicalIds(entries: readonly WeldingCbtAnswerReviewEntry[]) {
  return entries
    .map((entry) => entry.canonicalId)
    .sort(compareText)
    .slice(0, TOP_CANONICAL_ID_LIMIT);
}

function countBy(
  entries: readonly WeldingCbtAnswerReviewEntry[],
  selectKey: (entry: WeldingCbtAnswerReviewEntry) => string | null,
) {
  const buckets = new Map<string, WeldingCbtAnswerReviewEntry[]>();
  for (const entry of entries) {
    const key = selectKey(entry);
    if (key === null) continue;
    const current = buckets.get(key) ?? [];
    current.push(entry);
    buckets.set(key, current);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => compareText(left, right))
    .map(([key, bucketEntries]): CountBucket => ({
      key,
      count: bucketEntries.length,
      topCanonicalIds: sortedCanonicalIds(bucketEntries),
    }));
}

function normalizeFirstHoldReasonCode(entry: WeldingCbtAnswerReviewEntry) {
  const firstReason = entry.holdReasons[0];
  if (!firstReason) return null;
  const separatorIndex = firstReason.indexOf(":");
  const code = (separatorIndex === -1
    ? firstReason
    : firstReason.slice(0, separatorIndex))
    .normalize("NFC")
    .trim();
  return code || "(empty)";
}

function classifyGaps(
  entries: readonly WeldingCbtAnswerReviewEntry[],
): GapEntries {
  return {
    pristinePending: entries.filter(
      (entry) =>
        entry.reviewStatus === "pending"
        && entry.authoringDisposition === "pending",
    ),
    authoredPending: entries.filter(
      (entry) =>
        entry.reviewStatus === "pending"
        && entry.authoringDisposition !== "pending",
    ),
    approved: entries.filter((entry) => entry.reviewStatus === "approved"),
    hold: entries.filter((entry) => entry.reviewStatus === "hold"),
  };
}

export function buildWeldingCbtAnswerReviewGapReport(
  entries: readonly WeldingCbtAnswerReviewEntry[] =
    WELDING_CBT_ANSWER_REVIEWS.entries,
  projections: readonly LessonProjection[] =
    WELDING_CBT_LESSON_PROJECTION.entries,
) {
  const projectionByCanonicalId = new Map(
    projections.map((projection) => [
      projection.canonicalId,
      projection.primaryLeafLessonId,
    ]),
  );
  const gaps = classifyGaps(entries);

  return {
    schemaVersion: 1,
    source: "WELDING_CBT_ANSWER_REVIEWS",
    entryCount: entries.length,
    registryValidation: {
      ok: WELDING_CBT_ANSWER_REVIEWS.validation.ok,
      errorCount: WELDING_CBT_ANSWER_REVIEWS.validation.errors.length,
    },
    progress: {
      pristinePending: gaps.pristinePending.length,
      authoredPending: gaps.authoredPending.length,
      approved: gaps.approved.length,
      hold: gaps.hold.length,
    },
    counts: {
      reviewStatus: countBy(entries, (entry) => entry.reviewStatus),
      authoringDisposition: countBy(
        entries,
        (entry) => entry.authoringDisposition,
      ),
      assessmentKind: countBy(entries, (entry) => entry.assessmentKind),
      primaryLesson: countBy(
        entries,
        (entry) => entry.primaryLeafLessonId ?? UNASSIGNED_LESSON,
      ),
      proposedLesson: countBy(entries, (entry) => {
        if (!projectionByCanonicalId.has(entry.canonicalId)) {
          return MISSING_PROJECTION;
        }
        return projectionByCanonicalId.get(entry.canonicalId)
          ?? UNASSIGNED_LESSON;
      }),
      firstHoldReasonCode: countBy(entries, normalizeFirstHoldReasonCode),
    },
    topAffectedCanonicalIds: {
      pristinePending: sortedCanonicalIds(gaps.pristinePending),
      authoredPending: sortedCanonicalIds(gaps.authoredPending),
      hold: sortedCanonicalIds(gaps.hold),
    },
  };
}

function isMainModule() {
  const entryPoint = process.argv[1];
  return Boolean(
    entryPoint
    && path.resolve(entryPoint) === path.resolve(fileURLToPath(import.meta.url)),
  );
}

if (isMainModule()) {
  console.log(
    JSON.stringify(buildWeldingCbtAnswerReviewGapReport(), null, 2),
  );
}
