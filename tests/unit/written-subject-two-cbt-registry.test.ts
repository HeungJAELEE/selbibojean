import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectTwoBundleCbtSelection,
  getSubjectTwoFactCbtBinding,
} from "@/data/source/written-subject-two-cbt-links";
import { WRITTEN_SUBJECT_TWO_MEMORY_GUIDE } from "@/data/source/written-subject-two-memory-guide";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);
const originalQuestions = createPracticePresentations(
  content.questions.filter(
    (question) =>
      question.subjectId === "subject-2" && isPublishableQuestion(question),
  ),
  content.variants,
  100,
  20260730,
).filter((question) => question.provenance.original);

describe("subject 2 reviewed CBT registry", () => {
  it("gives every displayed fact one stable fail-closed binding", () => {
    const factIds = new Set<string>();
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_TWO_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        const factId = getWrittenSubjectFactId(2, bundle, fact);
        if (factIds.has(factId)) errors.push(`${factId}:duplicate-id`);
        factIds.add(factId);

        const binding = getSubjectTwoFactCbtBinding(factId);
        if (!binding) {
          errors.push(`${factId}:missing-binding`);
          continue;
        }
        if (
          binding.status === "direct_original" &&
          binding.questionIds.length === 0
        ) {
          errors.push(`${factId}:direct-without-question`);
        }
        if (
          binding.status === "partial_context" &&
          binding.questionIds.length === 0
        ) {
          errors.push(`${factId}:partial-without-question`);
        }
        if (
          binding.status === "no_direct_original" &&
          binding.questionIds.length > 0
        ) {
          errors.push(`${factId}:no-direct-with-question`);
        }
      }
    }

    expect(factIds.size).toBe(106);
    expect(errors).toEqual([]);
  });

  it("only references publishable subject-2 original questions", () => {
    const originalsById = new Map(
      originalQuestions.map((question) => [question.id, question]),
    );
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_TWO_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        const factId = getWrittenSubjectFactId(2, bundle, fact);
        const binding = getSubjectTwoFactCbtBinding(factId);
        if (!binding) continue;

        for (const questionId of binding.questionIds) {
          const question = originalsById.get(questionId);
          if (!question) {
            errors.push(`${factId}:${questionId}:not-public-original`);
            continue;
          }
          if (
            !question.provenance.exam?.year ||
            !question.provenance.exam.sessionLabel ||
            !question.provenance.exam.questionNumber ||
            !question.provenance.exam.sourceUrl
          ) {
            errors.push(`${factId}:${questionId}:incomplete-exam`);
          }
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("keeps direct defect questions exact and excludes unrelated welding items", () => {
    const defects = WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.find(
      (bundle) => bundle.id === "weld-defects",
    )!;
    const selection = getSubjectTwoBundleCbtSelection(
      defects,
      originalQuestions,
    );

    expect(selection.questions.map((question) => question.id)).toEqual([
      "U-931",
      "WELD-ACTUAL-2009-Q51",
      "WELD-ACTUAL-2009-Q54",
    ]);
    expect(selection.questions.map((question) => question.id)).not.toContain(
      "U-364",
    );
  });

  it("fails closed instead of falling back to title matching", () => {
    const bundle = WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.find(
      (candidate) => candidate.id === "safety-sign-fire-details",
    )!;
    const selection = getSubjectTwoBundleCbtSelection(
      bundle,
      originalQuestions,
    );

    expect(selection.questions).toEqual([]);
    expect(selection.statusNote).toBe(bundle.cbtStatusNote);
  });

  it("keeps the reviewed private source snapshot immutable", () => {
    const sourceBytes = readFileSync(
      join(
        process.cwd(),
        "src/data/source/written-subject-two-notion-body.json",
      ),
    );
    expect(createHash("sha256").update(sourceBytes).digest("hex")).toBe(
      "b533ac05dffcb9f0013d4c642f31328b342b1fdedd67a56c0271dca0d6085d3a",
    );
  });
});
