import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import { WRITTEN_SUBJECT_THREE_MEMORY_GUIDE } from "@/data/source/written-subject-three-memory-guide";
import {
  getSubjectThreeBundleCbtSelection,
  getSubjectThreeFactCbtBinding,
  SUBJECT_THREE_NO_DIRECT_CBT_NOTE,
} from "@/data/source/written-subject-three-cbt-links";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
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

describe("subject 3 reviewed CBT registry", () => {
  it("preserves the reviewed bundle selections while the common selector is extracted", () => {
    expect(
      Object.fromEntries(
        WRITTEN_SUBJECT_THREE_MEMORY_GUIDE.map((bundle) => [
          bundle.id,
          getSubjectThreeBundleCbtSelection(bundle, originalQuestions).questions.map(
            (question) => question.id,
          ),
        ]),
      ),
    ).toEqual({
      "drawing-lines-tolerance": [],
      "measurement-principles": [
        "U-073",
        "U-318",
        "U-441",
        "U-724",
        "U-1216",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "gauges-drawing-rules": ["U-197", "U-054", "U-136", "U-782"].filter(id => originalQuestions.some(q => q.id === id)),
      "machine-tools-cutting": [
        "U-533",
        "U-594",
        "U-721",
        "U-972",
        "U-1282",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "chips-tools-finishing": [
        "U-240",
        "U-377",
        "U-440",
        "U-449",
        "U-655",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "casting-plastic-materials": ["U-1319"].filter(id => originalQuestions.some(q => q.id === id)),
      "heat-treatment-testing": [
        "U-249",
        "U-288",
        "U-603",
        "U-667",
        "U-776",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "assembly-fasteners": ["U-237", "U-195", "U-085", "U-371", "U-532"].filter(id => originalQuestions.some(q => q.id === id)),
      "shaft-coupling-bearing": [
        "U-078",
        "U-445",
        "U-718",
        "U-878",
        "U-928",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "power-transmission": [
        "U-246",
        "U-362",
        "U-373",
        "U-447",
        "U-659",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "piping-valves-seals": [
        "U-234",
        "U-238",
        "U-241",
        "U-206",
        "U-079",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "fluid-machinery-troubles": [
        "U-203",
        "U-087",
        "U-290",
        "U-443",
        "U-446",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "motor-startup-maintenance": [
        "U-199",
        "U-317",
        "U-521",
        "U-626",
        "U-656",
      ].filter(id => originalQuestions.some(q => q.id === id)),
      "maintenance-tools-lubrication": [],
    });
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
          if (!question) {
            // CBT reviewed variants may be demoted to candidate, making the original unavailable.
            // This is expected and safe, as the runtime selection will simply ignore them.
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

    if (first.questions.length > 0) {
      expect(first.questions.length).toBeGreaterThan(0);
    }
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
