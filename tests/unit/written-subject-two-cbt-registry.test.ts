import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectTwoBundleCbtSelection,
  getSubjectTwoFactCbtBinding,
} from "@/data/source/written-subject-two-cbt-links";
import {
  getSubjectTwoBundleProjectedLessonIds,
  getSubjectTwoBundleProjectedLessonTitles,
} from "@/data/source/written-subject-two-lesson-projection";
import { WRITTEN_SUBJECT_TWO_MEMORY_GUIDE } from "@/data/source/written-subject-two-memory-guide";
import {
  INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT,
  isIndependentlyAcceptedWeldingCbtQuestion,
} from "@/data/source/welding-cbt-independent-review-gates";
import { WELDING_CBT_LEAF_TARGETS } from "@/data/source/welding-cbt-lesson-taxonomy";
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
const publicOriginalQuestionIds = new Set(
  originalQuestions.map((question) => question.id),
);
const publicSubjectTwoQuestionIds = new Set(
  content.questions
    .filter(
      (question) =>
        question.subjectId === "subject-2" && isPublishableQuestion(question),
    )
    .map((question) => question.id),
);
const publicWeldingCbtQuestionIds = new Set(
  content.questions
    .filter(
      (question) =>
        question.subjectId === "subject-2" &&
        question.id.startsWith("wcbt-") &&
        isPublishableQuestion(question),
    )
    .map((question) => question.id),
);

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

    expect(factIds.size).toBe(107);
    expect(errors).toEqual([]);
  });

  it("returns only current public-selector originals from reviewed bundles", () => {
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_TWO_MEMORY_GUIDE) {
      const selection = getSubjectTwoBundleCbtSelection(
        bundle,
        originalQuestions,
      );

      for (const question of selection.questions) {
        if (!publicOriginalQuestionIds.has(question.id)) {
          errors.push(`${bundle.id}:${question.id}:not-current-public-original`);
        }
        if (
          question.id.startsWith("wcbt-") &&
          !publicWeldingCbtQuestionIds.has(question.id)
        ) {
          errors.push(`${bundle.id}:${question.id}:held-or-unapproved-wcbt`);
        }
        if (
          question.id.startsWith("wcbt-") &&
          !isIndependentlyAcceptedWeldingCbtQuestion(question.id)
        ) {
          errors.push(`${bundle.id}:${question.id}:missing-independent-review`);
        }
        if (
          !question.provenance.exam?.year ||
          !question.provenance.exam.sessionLabel ||
          !question.provenance.exam.questionNumber ||
          !question.provenance.exam.sourceUrl
        ) {
          errors.push(`${bundle.id}:${question.id}:incomplete-exam`);
        }
      }
    }

    expect(
      publicSubjectTwoQuestionIds.size - publicWeldingCbtQuestionIds.size,
    ).toBe(222);
    expect(publicWeldingCbtQuestionIds.size).toBe(
      INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT,
    );
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
      "wcbt-b21592e6-d7fb-4390-85f3-6ff9855b9209",
      "wcbt-c4744e84-4f79-496f-ab6f-0d8eac062463",
      "U-931",
      "WELD-ACTUAL-2009-Q51",
      "WELD-ACTUAL-2009-Q54",
    ]);
    expect(selection.questions.map((question) => question.id)).not.toContain(
      "U-364",
    );
  });

  it("connects reviewed industrial-safety originals without title fallback", () => {
    const bundle = WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.find(
      (candidate) => candidate.id === "safety-sign-fire-details",
    )!;
    const selection = getSubjectTwoBundleCbtSelection(
      bundle,
      originalQuestions,
    );

    expect(selection.questions.map((question) => question.id)).toEqual([
      "wcbt-3cdeac36-72b5-4967-9ed9-8cc0756c94ae",
      "wcbt-555a0255-d277-49d8-a6ca-f256252958be",
      "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128",
      "wcbt-32fa0fc6-1a9f-471c-b844-71262d223288",
      "wcbt-c5b6edeb-085e-4fa2-b735-7f07f6dc3477",
    ]);
    expect(selection.statusNote).toBeUndefined();
  });

  it("maps every memory bundle to reviewed fine lessons and at most five public originals", () => {
    const knownLeafLessonIds = new Set(Object.keys(WELDING_CBT_LEAF_TARGETS));
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_TWO_MEMORY_GUIDE) {
      const projectedLessonIds = getSubjectTwoBundleProjectedLessonIds(bundle.id);
      const projectedTitles = getSubjectTwoBundleProjectedLessonTitles(bundle.id);
      const selection = getSubjectTwoBundleCbtSelection(
        bundle,
        originalQuestions,
      );

      if (projectedLessonIds.length === 0) {
        errors.push(`${bundle.id}:missing-projection`);
      }
      for (const lessonId of projectedLessonIds) {
        if (!knownLeafLessonIds.has(lessonId)) {
          errors.push(`${bundle.id}:${lessonId}:unknown-leaf`);
        }
      }
      if (projectedTitles.length !== projectedLessonIds.length) {
        errors.push(`${bundle.id}:missing-projected-title`);
      }
      if (selection.questions.length > 5) {
        errors.push(`${bundle.id}:over-limit:${selection.questions.length}`);
      }
      if (selection.questions.some((question) => !question.provenance.original)) {
        errors.push(`${bundle.id}:non-original`);
      }
    }

    expect(errors).toEqual([]);
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
