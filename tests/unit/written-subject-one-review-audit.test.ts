import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import { getSubjectOneFactCbtBindings } from "@/data/source/written-subject-one-cbt-links";
import { WRITTEN_SUBJECT_ONE_MEMORY_GUIDE } from "@/data/source/written-subject-one-memory-guide";
import subjectOneSource from "@/data/source/written-subject-one-notion-body.json";
import {
  getSubjectOneFactClaimAudit,
  getSubjectOneQuestionAudit,
  getSubjectOneSourceOccurrenceAudit,
} from "@/data/source/written-subject-one-review-audit";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
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

describe("subject 1 source and reverse-link audit", () => {
  it("classifies every non-empty private-source occurrence without gaps", () => {
    const occurrences = getSubjectOneSourceOccurrenceAudit();
    const nonEmptyLineCount = subjectOneSource.body
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0).length;
    const factIds = new Set(
      WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.flatMap((bundle) =>
        bundle.facts.map((fact) => getWrittenSubjectFactId(1, bundle, fact)),
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
    expect(new Set(occurrences.map((item) => item.occurrenceId)).size).toBe(
      occurrences.length,
    );
    expect(errors).toEqual([]);
    expect(
      occurrences.filter((occurrence) => occurrence.disposition === "held")
        .length,
    ).toBeGreaterThanOrEqual(15);
    expect(
      occurrences.find((occurrence) => occurrence.lineNumber === 60),
    ).toMatchObject({ disposition: "held" });
  });

  it("records provenance and public evidence for every displayed fact", () => {
    const audits = getSubjectOneFactClaimAudit();
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
    }

    expect(audits).toHaveLength(128);
    expect(new Set(audits.map((audit) => audit.factId)).size).toBe(
      audits.length,
    );
    expect(errors).toEqual([]);
  });

  it("keeps held-conflict claims out of direct CBT links", () => {
    const directFactIds = new Set(
      getSubjectOneFactCbtBindings()
        .filter((binding) => binding.status === "direct_original")
        .map((binding) => binding.factId),
    );
    const leakedFactIds = getSubjectOneFactClaimAudit()
      .filter(
        (audit) =>
          audit.provenance === "held_conflict" &&
          directFactIds.has(audit.factId),
      )
      .map((audit) => audit.factId);

    expect(leakedFactIds).toEqual([]);
  });

  it("reviews every public original in the reverse direction exactly once", () => {
    const audits = getSubjectOneQuestionAudit(originalQuestions);
    const auditIds = audits.map((audit) => audit.questionId);
    const errors: string[] = [];

    expect(new Set(auditIds)).toEqual(
      new Set(originalQuestions.map((question) => question.id)),
    );
    expect(new Set(auditIds).size).toBe(audits.length);

    for (const binding of getSubjectOneFactCbtBindings().filter(
      (candidate) => candidate.status === "direct_original",
    )) {
      for (const questionId of binding.questionIds) {
        const reverse = audits.find((audit) => audit.questionId === questionId);
        if (
          reverse?.disposition !== "direct_to_fact" ||
          !reverse.factIds.includes(binding.factId)
        ) {
          errors.push(`${binding.factId}:${questionId}:reverse-mismatch`);
        }
      }
    }

    expect(errors).toEqual([]);
  });
});
