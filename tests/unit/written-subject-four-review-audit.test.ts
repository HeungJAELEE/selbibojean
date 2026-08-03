import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import {
  getSubjectFourFactCbtBindings,
} from "@/data/source/written-subject-four-cbt-links";
import { WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE } from "@/data/source/written-subject-four-memory-guide";
import subjectFourSource from "@/data/source/written-subject-four-notion-body.json";
import {
  getSubjectFourFactClaimAudit,
  getSubjectFourQuestionAudit,
  getSubjectFourSourceOccurrenceAudit,
} from "@/data/source/written-subject-four-review-audit";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);
const originalQuestions = createPracticePresentations(
  content.questions.filter(
    (question) =>
      question.subjectId === "subject-4" && isPublishableQuestion(question),
  ),
  content.variants,
  100,
  20260730,
).filter((question) => question.provenance.original);
const approvedOriginalQuestionIds = new Set(
  originalQuestions.map((question) => question.id),
);

describe("subject 4 source and reverse-link audit", () => {
  it("classifies every non-empty private-source occurrence without gaps", () => {
    const occurrences = getSubjectFourSourceOccurrenceAudit();
    const nonEmptyLineCount = subjectFourSource.body
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0).length;
    const occurrenceIds = new Set(
      occurrences.map((occurrence) => occurrence.occurrenceId),
    );
    const factIds = new Set(
      WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.flatMap((bundle) =>
        bundle.facts.map((fact) =>
          getWrittenSubjectFactId(4, bundle, fact),
        ),
      ),
    );
    const errors: string[] = [];

    for (const occurrence of occurrences) {
      if (occurrence.disposition === "mapped_to_fact") {
        if (occurrence.factIds.length === 0) {
          errors.push(`${occurrence.occurrenceId}:mapped-without-fact`);
        }
        for (const factId of occurrence.factIds) {
          if (!factIds.has(factId)) {
            errors.push(`${occurrence.occurrenceId}:unknown-fact:${factId}`);
          }
        }
      } else if (occurrence.factIds.length > 0) {
        errors.push(
          `${occurrence.occurrenceId}:${occurrence.disposition}:has-fact`,
        );
      }
      if (!occurrence.reason.trim()) {
        errors.push(`${occurrence.occurrenceId}:missing-reason`);
      }
    }

    expect(occurrences).toHaveLength(nonEmptyLineCount);
    expect(occurrenceIds.size).toBe(occurrences.length);
    expect(errors).toEqual([]);
    expect(
      occurrences.filter((occurrence) => occurrence.disposition === "held")
        .length,
    ).toBeGreaterThanOrEqual(10);
    expect(
      occurrences.find((occurrence) => occurrence.lineNumber === 692),
    ).toMatchObject({
      disposition: "held",
    });
  });

  it("records provenance and public evidence targets for every displayed fact", () => {
    const audits = getSubjectFourFactClaimAudit();
    const errors: string[] = [];

    for (const audit of audits) {
      if (
        audit.provenance !== "supplemented" &&
        audit.basisOccurrenceIds.length === 0
      ) {
        errors.push(`${audit.factId}:missing-source-basis`);
      }
      if (audit.evidenceLessonTitles.length === 0) {
        errors.push(`${audit.factId}:missing-public-evidence`);
      }
      if (audit.provenance === "corrected" && !audit.correctionReason) {
        errors.push(`${audit.factId}:corrected-without-reason`);
      }
      if (audit.provenance !== "corrected" && audit.correctionReason) {
        errors.push(`${audit.factId}:unexpected-correction-reason`);
      }
    }

    expect(audits).toHaveLength(120);
    expect(new Set(audits.map((audit) => audit.factId)).size).toBe(
      audits.length,
    );
    expect(errors).toEqual([]);
  });

  it("keeps held-conflict claims out of direct CBT links", () => {
    const directFactIds = new Set(
      getSubjectFourFactCbtBindings()
        .filter((binding) => binding.status === "direct_original")
        .map((binding) => binding.factId),
    );
    const leakedFactIds = getSubjectFourFactClaimAudit()
      .filter(
        (audit) =>
          audit.provenance === "held_conflict" &&
          directFactIds.has(audit.factId),
      )
      .map((audit) => audit.factId);

    expect(leakedFactIds).toEqual([]);
  });

  it("reviews every gate-approved original in the reverse direction exactly once", () => {
    const audits = getSubjectFourQuestionAudit(originalQuestions);
    const auditIds = audits.map((audit) => audit.questionId);
    const directBindings = getSubjectFourFactCbtBindings().filter(
      (binding) => binding.status === "direct_original",
    );
    const errors: string[] = [];

    expect(new Set(auditIds)).toEqual(
      new Set(originalQuestions.map((question) => question.id)),
    );
    expect(new Set(auditIds).size).toBe(audits.length);

    for (const binding of directBindings) {
      for (const questionId of binding.questionIds) {
        if (!approvedOriginalQuestionIds.has(questionId)) continue;
        const reverse = audits.find(
          (audit) => audit.questionId === questionId,
        );
        if (
          reverse?.disposition !== "direct_to_fact" ||
          !reverse.factIds.includes(binding.factId)
        ) {
          errors.push(`${binding.factId}:${questionId}:reverse-mismatch`);
        }
      }
    }

    expect(errors).toEqual([]);
    expect(
      audits.every((audit) =>
        approvedOriginalQuestionIds.has(audit.questionId),
      ),
    ).toBe(true);
    expect(
      audits.find((audit) => audit.questionId === "U-1098"),
    ).not.toMatchObject({
      disposition: "direct_to_fact",
      factIds: expect.arrayContaining([
        "legacy:4:vibration-foundation:진동 3요소",
      ]),
    });
  });
});
