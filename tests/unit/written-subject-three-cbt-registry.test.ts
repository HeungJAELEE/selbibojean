import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import { WRITTEN_SUBJECT_THREE_MEMORY_GUIDE } from "@/data/source/written-subject-three-memory-guide";
import {
  getSubjectThreeBundleCbtSelection,
  getSubjectThreeFactCbtBinding,
  SUBJECT_THREE_NO_DIRECT_CBT_NOTE,
} from "@/data/source/written-subject-three-cbt-links";
import {
  createPracticePresentations,
  getSafeOriginalsByQuestion,
} from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);
const subjectThreeQuestions = content.questions.filter(
  (question) =>
    question.subjectId === "subject-3" && isPublishableQuestion(question),
);
const originalQuestions = createPracticePresentations(
  subjectThreeQuestions,
  content.variants,
  100,
  20260729,
).filter((question) => question.provenance.original);
const approvedOriginalQuestionIds = new Set(
  originalQuestions.map((question) => question.id),
);

describe("subject 3 reviewed CBT registry", () => {
  it("uses the runtime public gate's answer-safe original exact set", () => {
    const runtimeApprovedIds = [
      ...getSafeOriginalsByQuestion(
        subjectThreeQuestions,
        content.variants,
      ).keys(),
    ];

    expect(new Set(originalQuestions.map((question) => question.id))).toEqual(
      new Set(runtimeApprovedIds),
    );
  });

  it("selects only gate-approved direct originals for every bundle", () => {
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_THREE_MEMORY_GUIDE) {
      const first = getSubjectThreeBundleCbtSelection(
        bundle,
        originalQuestions,
      );
      const second = getSubjectThreeBundleCbtSelection(
        bundle,
        [...originalQuestions].reverse(),
      );
      const availableDirectIds = new Set(
        bundle.facts.flatMap((fact) => {
          if (!fact.id) return [];
          const binding = getSubjectThreeFactCbtBinding(fact.id);
          return binding?.status === "direct_original"
            ? binding.questionIds.filter((questionId) =>
                approvedOriginalQuestionIds.has(questionId),
              )
            : [];
        }),
      );
      const selectedIds = first.questions.map((question) => question.id);

      if (selectedIds.length > 5) errors.push(`${bundle.id}:over-limit`);
      if (
        selectedIds.some(
          (questionId) =>
            !approvedOriginalQuestionIds.has(questionId) ||
            !availableDirectIds.has(questionId),
        )
      ) {
        errors.push(`${bundle.id}:outside-approved-direct-set`);
      }
      if (
        availableDirectIds.size <= 5 &&
        (selectedIds.length !== availableDirectIds.size ||
          selectedIds.some((questionId) => !availableDirectIds.has(questionId)))
      ) {
        errors.push(`${bundle.id}:exact-set-mismatch`);
      }
      if (
        selectedIds.join("|") !==
        second.questions.map((question) => question.id).join("|")
      ) {
        errors.push(`${bundle.id}:non-deterministic`);
      }
      if (selectedIds.length === 0 && !first.statusNote) {
        errors.push(`${bundle.id}:missing-hold-note`);
      }
    }

    expect(errors).toEqual([]);
  });

  it("gives every atomic fact one stable ID and one fail-closed CBT binding", () => {
    const factIds = new Set<string>();
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_THREE_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        if (!fact.id) {
          errors.push(`${bundle.id}:${fact.cue}:missing-id`);
          continue;
        }
        if (factIds.has(fact.id)) errors.push(`${fact.id}:duplicate-id`);
        factIds.add(fact.id);

        const binding = getSubjectThreeFactCbtBinding(fact.id);
        if (!binding) {
          errors.push(`${fact.id}:missing-binding`);
          continue;
        }
        if (
          binding.status === "direct_original" &&
          binding.questionIds.length === 0
        ) {
          errors.push(`${fact.id}:direct-without-question`);
        }
        if (
          binding.status === "partial_context" &&
          binding.questionIds.length === 0
        ) {
          errors.push(`${fact.id}:partial-without-question`);
        }
        if (
          binding.status === "no_direct_original" &&
          binding.questionIds.length > 0
        ) {
          errors.push(`${fact.id}:no-direct-with-question`);
        }
      }
    }

    expect(factIds.size).toBeGreaterThan(80);
    expect(errors).toEqual([]);
  });

  it("only references public subject-3 original questions with complete exam metadata", () => {
    const originalsById = new Map(
      originalQuestions.map((question) => [question.id, question]),
    );
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_THREE_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        if (!fact.id) continue;
        const binding = getSubjectThreeFactCbtBinding(fact.id);
        if (!binding) continue;

        for (const questionId of binding.questionIds) {
          const question = originalsById.get(questionId);
          if (!approvedOriginalQuestionIds.has(questionId)) {
            if (question) {
              errors.push(`${fact.id}:${questionId}:held-question-leaked`);
            }
            continue;
          }
          if (!question) {
            errors.push(`${fact.id}:${questionId}:approved-original-missing`);
            continue;
          }
          if (
            !question.provenance.exam?.year ||
            !question.provenance.exam.sessionLabel ||
            !question.provenance.exam.questionNumber ||
            !question.provenance.exam.sourceUrl
          ) {
            errors.push(`${fact.id}:${questionId}:incomplete-exam`);
          }
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("keeps known semantic near-matches out of the direct-original set", () => {
    const expected = {
      "s3-drawing-lines-tolerance-dimensional-tolerance":
        "no_direct_original",
      "s3-machine-tools-cutting-up-milling": "partial_context",
      "s3-machine-tools-cutting-down-milling": "partial_context",
      "s3-chips-tools-finishing-continuous-chip": "no_direct_original",
      "s3-casting-plastic-materials-hot-working": "partial_context",
      "s3-shaft-coupling-bearing-oldham-coupling": "partial_context",
      "s3-power-transmission-brake-fade": "partial_context",
      "s3-power-transmission-brake-vapor-lock": "partial_context",
    } as const;

    for (const [factId, status] of Object.entries(expected)) {
      expect(getSubjectThreeFactCbtBinding(factId)?.status, factId).toBe(
        status,
      );
    }
  });

  it("selects at most five whitelisted direct originals deterministically", () => {
    const bundle = WRITTEN_SUBJECT_THREE_MEMORY_GUIDE.find(
      (candidate) => candidate.id === "piping-valves-seals",
    )!;
    const first = getSubjectThreeBundleCbtSelection(
      bundle,
      originalQuestions,
    );
    const second = getSubjectThreeBundleCbtSelection(
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

    const directIds = new Set(
      bundle.facts.flatMap((fact) => {
        if (!fact.id) return [];
        const binding = getSubjectThreeFactCbtBinding(fact.id);
        return binding?.status === "direct_original"
          ? binding.questionIds
          : [];
      }),
    );
    expect(
      first.questions.every((question) => directIds.has(question.id)),
    ).toBe(true);
    expect(
      first.questions.every((question) =>
        approvedOriginalQuestionIds.has(question.id),
      ),
    ).toBe(true);
  });

  it("does not fill a missing direct question from lesson, title, or partial matches", () => {
    const bundle = WRITTEN_SUBJECT_THREE_MEMORY_GUIDE.find(
      (candidate) => candidate.id === "machine-tools-cutting",
    )!;
    const directIds = new Set(
      bundle.facts.flatMap((fact) => {
        if (!fact.id) return [];
        const binding = getSubjectThreeFactCbtBinding(fact.id);
        return binding?.status === "direct_original"
          ? binding.questionIds
          : [];
      }),
    );
    const withoutDirectQuestions = originalQuestions.filter(
      (question) => !directIds.has(question.id),
    );
    const selection = getSubjectThreeBundleCbtSelection(
      bundle,
      withoutDirectQuestions,
    );

    expect(selection.questions).toEqual([]);
    expect(selection.statusNote).toBe(SUBJECT_THREE_NO_DIRECT_CBT_NOTE);
  });
});
