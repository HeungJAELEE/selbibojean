import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import weldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import { WELDING_CBT_ANSWER_REVIEWS } from "@/data/source/welding-cbt-answer-review";
import {
  countPublicOriginalVariantsBySubject,
  countPublishedReviewedVariantsBySubject,
  createPracticePresentations,
  filterPracticeContentByYearRange,
  getAllSafeOriginalsByQuestion,
  getPublicOriginalOccurrenceWeights,
  getSafeOriginalsByQuestion,
  isSafeOriginalPracticeVariant,
} from "@/lib/content/practice-presentations";
import { reviewedCbtVariantManifest } from "@/lib/content/reviewed-cbt-variants";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { selectAllocatedPracticeQuestions } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const source = generatedContent as GeneratedContent;
const runtime = buildRuntimeContent(source);
const questionById = new Map(
  runtime.questions.map((question) => [question.id, question]),
);
const sha256 = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");
const allocations = [1, 2, 3, 4].map((code) => ({
  subjectId: `subject-${code}`,
  count: 20,
}));

describe("reviewed CBT publication release", () => {
  it("publishes exactly 2267 and preserves the 98 HOLD plus 19 choice conflicts", () => {
    const states = reviewedCbtVariantManifest.records.reduce<
      Record<string, number>
    >((counts, record) => {
      counts[record.review.runtimeStatus] =
        (counts[record.review.runtimeStatus] ?? 0) + 1;
      return counts;
    }, {});

    expect(reviewedCbtVariantManifest.records).toHaveLength(2384);
    expect(states).toEqual({ published: 2267, hold: 98, choice_conflict: 19 });
    expect(states.published + states.hold + states.choice_conflict).toBe(2384);
  });

  it("keeps every source-reviewed stem and ordered choice hash unchanged", () => {
    for (const record of reviewedCbtVariantManifest.records) {
      expect(sha256(record.stem), record.externalId).toBe(
        record.source.stemSha256,
      );
      expect(sha256(JSON.stringify(record.choices)), record.externalId).toBe(
        record.source.orderedChoicesSha256,
      );
    }
  });

  it("makes every published record presentable and keeps every excluded record unavailable", () => {
    const runtimeByExternalId = new Map(
      runtime.variants.map((variant) => [variant.externalId, variant]),
    );
    let publishedUsable = 0;

    for (const record of reviewedCbtVariantManifest.records) {
      const variant = runtimeByExternalId.get(record.externalId);
      const question = variant
        ? questionById.get(variant.canonicalId)
        : undefined;
      expect(variant, record.externalId).toBeDefined();
      expect(question, record.externalId).toBeDefined();
      const usable = isSafeOriginalPracticeVariant(question!, variant!);
      if (record.review.runtimeStatus === "published") {
        expect(usable, record.externalId).toBe(true);
        publishedUsable += 1;
      } else {
        expect(usable, record.externalId).toBe(false);
      }
    }

    expect(publishedUsable).toBe(2267);
  });

  it("counts all 2267 published review occurrences without collapsing repeated canonical questions", () => {
    const counts = countPublishedReviewedVariantsBySubject(
      runtime.questions,
      runtime.variants,
    );
    const originals = getAllSafeOriginalsByQuestion(
      runtime.questions,
      runtime.variants,
    );
    const publishedOccurrences = [...originals.values()]
      .flat()
      .filter(
        (variant) =>
          variant.reviewed && variant.reviewState === "published",
      );

    expect(counts).toEqual({
      "subject-1": 450,
      "subject-2": 29,
      "subject-3": 416,
      "subject-4": 1372,
    });
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(
      2267,
    );
    expect(publishedOccurrences).toHaveLength(2267);
  });

  it("makes all 492 approved welding questions eligible and excludes all 33 authored HOLD questions", () => {
    const weldingQuestions = runtime.questions.filter((question) =>
      question.id.startsWith("wcbt-"),
    );
    const safeOriginals = getSafeOriginalsByQuestion(
      runtime.questions,
      runtime.variants,
    );
    const approvedReviewIds = new Set(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter((entry) => entry.reviewStatus === "approved")
        .map((entry) => entry.canonicalId),
    );
    const heldReviewIds = new Set(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .filter((entry) => entry.reviewStatus === "hold")
        .map((entry) => entry.canonicalId),
    );

    expect(WELDING_CBT_ANSWER_REVIEWS.entries).toHaveLength(525);
    expect(approvedReviewIds.size).toBe(492);
    expect(heldReviewIds.size).toBe(33);
    expect(weldingQuestions).toHaveLength(492);
    expect(
      weldingQuestions.every(
        (question) =>
          approvedReviewIds.has(question.id) && safeOriginals.has(question.id),
      ),
    ).toBe(true);
    const presentations = createPracticePresentations(
      weldingQuestions,
      runtime.variants,
      100,
      20260809,
      true,
    );
    expect(presentations).toHaveLength(492);
    expect(
      presentations.every((question) => question.provenance.original),
    ).toBe(true);
    expect(
      presentations.every(
        (question) =>
          !("correctChoiceId" in question) &&
          !("explanation" in question) &&
          !("approvedReview" in question),
      ),
    ).toBe(true);
    expect(
      runtime.questions.some((question) => heldReviewIds.has(question.id)),
    ).toBe(false);

    const counts = countPublicOriginalVariantsBySubject(
      runtime.questions,
      runtime.variants,
    );
    expect(counts["subject-2"]).toBe(530);
  });

  it("preserves every published welding occurrence stem, ordered choices, and source answer", () => {
    const sourceByExternalId = new Map(
      weldingCbtBank.records.map((record) => [record.externalId, record]),
    );
    const weldingVariants = runtime.variants.filter((variant) =>
      variant.canonicalId.startsWith("wcbt-"),
    );

    expect(weldingVariants).toHaveLength(499);
    for (const variant of weldingVariants) {
      const sourceRecord = sourceByExternalId.get(variant.externalId);
      expect(sourceRecord, variant.externalId).toBeDefined();
      if (!sourceRecord || sourceRecord.correctIndex === null) continue;

      expect(variant.stem, variant.externalId).toBe(sourceRecord.stem);
      expect(variant.choices, variant.externalId).toEqual(sourceRecord.choices);
      expect(variant.answer, variant.externalId).toBe(
        `${sourceRecord.correctIndex + 1}. ${sourceRecord.choices[sourceRecord.correctIndex]}`,
      );
    }
  });

  it("builds the default mock as 4 subjects by 20 without duplicate canonical questions", () => {
    const originals = getSafeOriginalsByQuestion(
      runtime.questions,
      runtime.variants,
    );
    const selected = selectAllocatedPracticeQuestions(
      runtime.questions.filter((question) => originals.has(question.id)),
      allocations,
      20260809,
      { additionalEligibleQuestionIds: new Set(originals.keys()) },
    );
    const presentations = createPracticePresentations(
      selected.questions,
      runtime.variants,
      100,
      20260809,
      true,
    );

    expect(selected.questions).toHaveLength(80);
    expect(selected.breakdown.map((item) => item.actualCount)).toEqual([
      20, 20, 20, 20,
    ]);
    expect(new Set(selected.questions.map((question) => question.id)).size).toBe(
      80,
    );
    expect(presentations).toHaveLength(80);
    expect(
      presentations.every((question) => question.provenance.original),
    ).toBe(true);
  });

  it("weights only public original occurrences and keeps every held welding item excluded", () => {
    const weights = getPublicOriginalOccurrenceWeights(
      runtime.questions,
      runtime.variants,
    );
    const approved = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
      (review) => review.reviewStatus === "approved",
    );
    const held = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
      (review) => review.reviewStatus === "hold",
    );
    for (const review of approved) {
      expect(weights.get(review.canonicalId), review.canonicalId).toBeGreaterThanOrEqual(1);
    }
    for (const review of held) {
      expect(weights.has(review.canonicalId), review.canonicalId).toBe(false);
    }
    expect(approved).toHaveLength(492);
    expect(held).toHaveLength(33);
  });

  it("does not supplement a selected year with records from another year", () => {
    const filtered = filterPracticeContentByYearRange(
      runtime.questions,
      runtime.variants,
      2006,
      2006,
    );
    const originals = getSafeOriginalsByQuestion(
      filtered.questions,
      filtered.variants,
    );
    const selected = selectAllocatedPracticeQuestions(
      filtered.questions,
      allocations,
      20260809,
      { additionalEligibleQuestionIds: new Set(originals.keys()) },
    );
    const presentations = createPracticePresentations(
      selected.questions,
      filtered.variants,
      100,
      20260809,
      true,
    );

    expect(filtered.variants.length).toBeGreaterThan(0);
    expect(filtered.variants.every((variant) => variant.year === 2006)).toBe(
      true,
    );
    expect(
      presentations.every(
        (question) => question.provenance.exam?.year === 2006,
      ),
    ).toBe(true);
    expect(selected.limited).toBe(true);
  });
});
