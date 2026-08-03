import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectOneBundleCbtSelection,
  getSubjectOneFactCbtBinding,
  SUBJECT_ONE_NO_DIRECT_CBT_NOTE,
} from "@/data/source/written-subject-one-cbt-links";
import { WRITTEN_SUBJECT_ONE_MEMORY_GUIDE } from "@/data/source/written-subject-one-memory-guide";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";
import {
  createPracticePresentations,
  getSafeOriginalsByQuestion,
} from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);
const originalQuestions = createPracticePresentations(
  content.questions.filter(
    (question) =>
      question.subjectId === "subject-1" && isPublishableQuestion(question),
  ),
  content.variants,
  100,
  20260730,
).filter((question) => question.provenance.original);
const approvedOriginalQuestionIds = new Set(
  originalQuestions.map((question) => question.id),
);

describe("subject 1 reviewed CBT registry", () => {
  it("uses the runtime public gate's directly reviewed exact set", () => {
    const runtimeApprovedQuestions = content.questions.filter(
      (question) =>
        question.subjectId === "subject-1" &&
        isPublishableQuestion(question) &&
        Boolean(question.approvedReview),
    );
    const runtimeApprovedOriginalIds = new Set(
      getSafeOriginalsByQuestion(
        runtimeApprovedQuestions,
        content.variants,
      ).keys(),
    );

    expect(new Set(originalQuestions.map((question) => question.id))).toEqual(
      runtimeApprovedOriginalIds,
    );
  });

  it("gives every displayed fact one stable fail-closed binding", () => {
    const factIds = new Set<string>();
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_ONE_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        const factId = getWrittenSubjectFactId(1, bundle, fact);
        if (factIds.has(factId)) errors.push(`${factId}:duplicate-id`);
        factIds.add(factId);

        const binding = getSubjectOneFactCbtBinding(factId);
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

    expect(factIds.size).toBe(128);
    expect(errors).toEqual([]);
  });

  it("only references publishable subject-1 original questions", () => {
    const originalsById = new Map(
      originalQuestions.map((question) => [question.id, question]),
    );
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_ONE_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        const factId = getWrittenSubjectFactId(1, bundle, fact);
        const binding = getSubjectOneFactCbtBinding(factId);
        if (!binding) continue;

        for (const questionId of binding.questionIds) {
          const question = originalsById.get(questionId);
          if (!approvedOriginalQuestionIds.has(questionId)) {
            if (question) {
              errors.push(`${factId}:${questionId}:held-question-leaked`);
            }
            continue;
          }
          if (!question) {
            errors.push(`${factId}:${questionId}:approved-original-missing`);
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

  it("selects no more than five reviewed originals deterministically", () => {
    const bundle = WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.find(
      (candidate) => candidate.id === "fluid-laws",
    )!;
    const first = getSubjectOneBundleCbtSelection(bundle, originalQuestions);
    const second = getSubjectOneBundleCbtSelection(
      bundle,
      [...originalQuestions].reverse(),
    );

    expect(first.questions.length).toBeGreaterThan(0);
    expect(first.questions.length).toBeLessThanOrEqual(5);
    expect(first.questions.map((question) => question.id)).toEqual(
      second.questions.map((question) => question.id),
    );
    expect(new Set(first.questions.map((question) => question.id)).size).toBe(
      first.questions.length,
    );
    expect(
      first.questions.every((question) =>
        approvedOriginalQuestionIds.has(question.id),
      ),
    ).toBe(true);
  });

  it("does not fall back to title matching without registered direct IDs", () => {
    const bundle = WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.find(
      (candidate) => candidate.id === "measurement-sampling-errors",
    )!;
    const directIds = new Set(
      bundle.facts.flatMap((fact) => {
        const binding = getSubjectOneFactCbtBinding(
          getWrittenSubjectFactId(1, bundle, fact),
        );
        return binding?.status === "direct_original"
          ? binding.questionIds
          : [];
      }),
    );
    const selection = getSubjectOneBundleCbtSelection(
      bundle,
      originalQuestions.filter((question) => !directIds.has(question.id)),
    );

    expect(selection.questions).toEqual([]);
    expect(selection.statusNote).toBe(SUBJECT_ONE_NO_DIRECT_CBT_NOTE);
  });

  it("keeps the reviewed private source snapshot immutable", () => {
    const sourceBytes = readFileSync(
      join(
        process.cwd(),
        "src/data/source/written-subject-one-notion-body.json",
      ),
    );
    expect(createHash("sha256").update(sourceBytes).digest("hex")).toBe(
      "f10fcf9a5b49542343d4c5955e2cbabe5a6fb31dbeacded43f6c29b95efe76f4",
    );
  });
});
