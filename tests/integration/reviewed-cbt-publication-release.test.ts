import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  createPracticePresentations,
  filterPracticeContentByYearRange,
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
