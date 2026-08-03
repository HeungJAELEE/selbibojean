import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import { WELDING_CBT_ANSWER_REVIEWS } from "@/data/source/welding-cbt-answer-review";
import { getWeldingCbtProjectionCandidates } from "@/lib/content/welding-cbt-approved";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent } from "@/lib/domain/types";

const SOURCE_COUNTS = {
  "subject-1": 323,
  "subject-2": 544,
  "subject-3": 273,
  "subject-4": 781,
} as const;

const generated = generatedContent as GeneratedContent;
const runtime = buildRuntimeContent(generated);
const weldingCandidates = getWeldingCbtProjectionCandidates();

describe("complete written question-bank source registry", () => {
  it("accounts for the complete 1,921-question canonical source set", () => {
    const originalIdsBySubject = new Map(
      Object.keys(SOURCE_COUNTS).map((subjectId) => [
        subjectId,
        generated.questions
          .filter(
            (question) =>
              question.subjectId === subjectId &&
              question.id.startsWith("U-"),
          )
          .map((question) => question.id),
      ]),
    );
    const counts = {
      "subject-1": originalIdsBySubject.get("subject-1")?.length ?? 0,
      "subject-2":
        (originalIdsBySubject.get("subject-2")?.length ?? 0) +
        weldingCandidates.length,
      "subject-3": originalIdsBySubject.get("subject-3")?.length ?? 0,
      "subject-4": originalIdsBySubject.get("subject-4")?.length ?? 0,
    };

    expect(counts).toEqual(SOURCE_COUNTS);
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(
      1_921,
    );
  });

  it("keeps every source ID in either the original runtime ledger or the welding review ledger", () => {
    const originalIds = generated.questions
      .filter((question) => question.id.startsWith("U-"))
      .map((question) => question.id);
    const runtimeIds = new Set(runtime.questions.map((question) => question.id));
    const weldingCandidateIds = weldingCandidates.map(
      (candidate) => candidate.canonicalId,
    );
    const weldingReviewIds = WELDING_CBT_ANSWER_REVIEWS.entries.map(
      (review) => review.canonicalId,
    );

    expect(new Set(originalIds).size).toBe(1_396);
    expect(originalIds.every((id) => runtimeIds.has(id))).toBe(true);
    expect(new Set(weldingCandidateIds).size).toBe(525);
    expect(new Set(weldingReviewIds).size).toBe(525);
    expect([...weldingCandidateIds].sort()).toEqual(
      [...weldingReviewIds].sort(),
    );
  });
});
