import { writeFile } from "node:fs/promises";
import path from "node:path";

import {
  WELDING_CBT_TAXONOMY_VERSION,
  classifyWeldingCbtProjectionCandidate,
  type WeldingCbtLeafLessonId,
} from "@/data/source/welding-cbt-lesson-taxonomy";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import { getWeldingCbtProjectionCandidates } from "@/lib/content/welding-cbt-approved";

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "src/data/source/welding-cbt-lesson-projection.json",
);
const REVIEWED_AT = "2026-08-02T15:50:00.000Z";

const REVIEWED_LESSON_CORRECTIONS: Readonly<
  Partial<Record<string, WeldingCbtLeafLessonId>>
> = {
  "wcbt-54d3be8c-ff5f-4757-82e6-d78cec05728c":
    "lesson-welding-foundation-power-heat",
  "wcbt-77c96178-7761-4243-9762-d85f730d8676":
    "lesson-welding-safety-gas",
  "wcbt-77d74eb7-43d2-421e-91a6-66405189f1f2":
    "lesson-welding-safety-gas",
  "wcbt-7adf06d7-5cc9-4ee1-b138-1bbd4cb63f5e":
    "lesson-welding-safety-ventilation",
  "wcbt-9df7e166-d00d-418a-ad97-dd441f70627c":
    "lesson-welding-safety-gas",
  "wcbt-a1822b61-0f3a-4161-b413-8d6a78f6e4bd":
    "lesson-welding-special-processes",
};

const candidates = getWeldingCbtProjectionCandidates();
const publishableReviewById = new Map(
  WELDING_CBT_ANSWER_REVIEWS.entries
    .filter(isWeldingCbtAnswerReviewPublishable)
    .map((entry) => [entry.canonicalId, entry] as const),
);
const entries = candidates.map((candidate) => {
  const classification = classifyWeldingCbtProjectionCandidate(candidate);
  const publishableReview = publishableReviewById.get(candidate.canonicalId);
  return {
    canonicalId: candidate.canonicalId,
    contentDigest: candidate.contentDigest,
    aggregateTopicKey: candidate.aggregateTopicKey,
    reviewStatus: "approved" as const,
    primaryLeafLessonId:
      publishableReview?.primaryLeafLessonId
      ?? REVIEWED_LESSON_CORRECTIONS[candidate.canonicalId]
      ?? classification.targetLessonId,
    reasonCodes: [
      publishableReview ? "answer-review" : classification.matchedBy,
    ],
  };
});

const payload = {
  version: 1,
  taxonomyVersion: WELDING_CBT_TAXONOMY_VERSION,
  reviewedAt: REVIEWED_AT,
  reviewer: "codex-sol-high",
  entries,
};

const countsByTarget = Object.entries(
  entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.primaryLeafLessonId] =
      (counts[entry.primaryLeafLessonId] ?? 0) + 1;
    return counts;
  }, {}),
).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));

const fallbackEntries = entries.filter((entry) =>
  entry.reasonCodes.includes("review-fallback"),
);

console.log(
  JSON.stringify(
    {
      total: entries.length,
      safetyTotal: entries.filter(
        (entry) => entry.aggregateTopicKey === "safety",
      ).length,
      fallbackCount: fallbackEntries.length,
      fallbackSamples: fallbackEntries.map((entry) => {
        const candidate = candidates.find(
          (item) => item.canonicalId === entry.canonicalId,
        );
        return {
          aggregateTopicKey: entry.aggregateTopicKey,
          canonicalId: entry.canonicalId,
          stem: candidate?.stem ?? "",
        };
      }),
      countsByTarget,
    },
    null,
    2,
  ),
);

if (process.argv.includes("--write")) {
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`wrote ${OUTPUT_PATH}`);
}
