import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectFourBundleCbtSelection,
  getSubjectFourFactCbtBinding,
  SUBJECT_FOUR_NO_DIRECT_CBT_NOTE,
} from "@/data/source/written-subject-four-cbt-links";
import { WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE } from "@/data/source/written-subject-four-memory-guide";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);
const subjectFourQuestions = content.questions.filter(
  (question) =>
    question.subjectId === "subject-4" && isPublishableQuestion(question),
);
const originalQuestions = createPracticePresentations(
  subjectFourQuestions,
  content.variants,
  100,
  20260730,
).filter((question) => question.provenance.original);
const approvedOriginalQuestionIds = new Set(
  originalQuestions.map((question) => question.id),
);

describe("subject 4 reviewed CBT registry", () => {
  it("uses the runtime public gate's directly reviewed exact set", () => {
    const runtimeApprovedIds = new Set(
      content.questions
      .filter(
        (question) =>
          question.subjectId === "subject-4" &&
          isPublishableQuestion(question) &&
          Boolean(question.approvedReview),
      )
        .map((question) => question.id),
    );

    expect(
      originalQuestions.every((question) =>
        runtimeApprovedIds.has(question.id),
      ),
    ).toBe(true);
  });

  it("gives every displayed fact a stable fail-closed CBT binding", () => {
    const factIds = new Set<string>();
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        const factId = getWrittenSubjectFactId(4, bundle, fact);
        if (factIds.has(factId)) errors.push(`${factId}:duplicate-id`);
        factIds.add(factId);

        const binding = getSubjectFourFactCbtBinding(factId);
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

    expect(factIds.size).toBe(120);
    expect(errors).toEqual([]);
  });

  it("only references publishable subject-4 original questions", () => {
    const originalsById = new Map(
      originalQuestions.map((question) => [question.id, question]),
    );
    const errors: string[] = [];

    for (const bundle of WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE) {
      for (const fact of bundle.facts) {
        const factId = getWrittenSubjectFactId(4, bundle, fact);
        const binding = getSubjectFourFactCbtBinding(factId);
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

  it("keeps semantic near-matches out and exact originals in", () => {
    const vibrationBundle = WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.find(
      (bundle) => bundle.id === "vibration-foundation",
    )!;
    const threeElements = vibrationBundle.facts.find(
      (fact) => fact.cue === "진동 3요소",
    )!;
    const threeElementsBinding = getSubjectFourFactCbtBinding(
      getWrittenSubjectFactId(4, vibrationBundle, threeElements),
    )!;

    expect(threeElementsBinding.status).toBe("direct_original");
    expect(threeElementsBinding.questionIds).toContain("U-005");
    expect(threeElementsBinding.questionIds).not.toContain("U-1098");

    const variables = vibrationBundle.facts.find(
      (fact) => fact.cue === "변위·속도·가속도",
    )!;
    expect(
      getSubjectFourFactCbtBinding(
        getWrittenSubjectFactId(4, vibrationBundle, variables),
      )?.questionIds,
    ).toContain("U-021");

    const maintenanceBundle = WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.find(
      (bundle) => bundle.id === "maintenance-methods",
    )!;
    const corrective = maintenanceBundle.facts.find(
      (fact) => fact.cue === "개량보전 CM",
    )!;
    expect(
      getSubjectFourFactCbtBinding(
        getWrittenSubjectFactId(4, maintenanceBundle, corrective),
      )?.questionIds,
    ).toContain("U-770");
  });

  it("selects at most five direct originals deterministically", () => {
    const bundle = WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.find(
      (candidate) =>
        candidate.id === "maintenance-organization-resources-qc",
    )!;
    const first = getSubjectFourBundleCbtSelection(bundle, originalQuestions);
    const second = getSubjectFourBundleCbtSelection(
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

  it("does not fall back to lesson or title matches when direct IDs are absent", () => {
    const bundle = WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.find(
      (candidate) => candidate.id === "diagnosis-methods-sensors",
    )!;
    const directIds = new Set(
      bundle.facts.flatMap((fact) => {
        const binding = getSubjectFourFactCbtBinding(
          getWrittenSubjectFactId(4, bundle, fact),
        );
        return binding?.status === "direct_original"
          ? binding.questionIds
          : [];
      }),
    );
    const selection = getSubjectFourBundleCbtSelection(
      bundle,
      originalQuestions.filter((question) => !directIds.has(question.id)),
    );

    expect(selection.questions).toEqual([]);
    expect(selection.statusNote).toBe(SUBJECT_FOUR_NO_DIRECT_CBT_NOTE);
  });

  it("keeps the reviewed private source snapshot immutable", () => {
    const sourceBytes = readFileSync(
      join(
        process.cwd(),
        "src/data/source/written-subject-four-notion-body.json",
      ),
    );
    expect(createHash("sha256").update(sourceBytes).digest("hex")).toBe(
      "b216715ce2fff6dfff9b8f678ea8ed4c0d167bb9a17fef73199c98a5a3726ef0",
    );
  });
});
