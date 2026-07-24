import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { PracticalContent } from "@/lib/domain/practical-types";
import {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "@/lib/domain/practical";

const content = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src/data/generated/practical-content.json"),
    "utf8",
  ),
) as PracticalContent;

describe("NCS practical content import", () => {
  it("reconciles all source rows", () => {
    expect(content.report.rows).toEqual({
      past: 41,
      predicted: 40,
      concepts: 46,
      supplementalConcepts: 43,
      ncsDocuments: 11,
      visualAids: 28,
    });
    expect(content.report.exactMatch).toBe(true);
    expect(content.report.publication.past).toBe(17);
    expect(content.report.publication.predicted).toBe(39);
    expect(content.report.publication.concepts).toBe(46);
    expect(content.report.publication.supplementalConcepts).toBe(43);
    expect(content.report.publication.held).toBe(25);
  });

  it("never publishes held questions", () => {
    expect(
      content.questions.filter(
        (question) =>
          question.auditDisposition.startsWith("held_") &&
          isPublishablePracticalQuestion(question),
      ),
    ).toEqual([]);
  });

  it("strips every answer field before submit", () => {
    for (const question of content.questions.filter(
      isPublishablePracticalQuestion,
    )) {
      const publicQuestion = toPublicPracticalQuestion(question);
      expect(publicQuestion).not.toHaveProperty("modelAnswer");
      expect(publicQuestion).not.toHaveProperty("requiredKeywords");
      expect(publicQuestion).not.toHaveProperty("acceptedAnswers");
      expect(publicQuestion).not.toHaveProperty("calculation");
      expect(publicQuestion).not.toHaveProperty("rubric");
      expect(publicQuestion).not.toHaveProperty("traps");
      expect(publicQuestion).not.toHaveProperty("reviewNote");
    }
  });

  it("classifies every practical question into one audited primary type", () => {
    expect(content.studyCategories.map((category) => category.id)).toEqual([
      "visual_identification",
      "formula_calculation",
      "theory_concept",
      "work_procedure",
    ]);
    expect(
      Object.fromEntries(
        content.studyCategories.map((category) => [
          category.id,
          category.questionIds.length,
        ]),
      ),
    ).toEqual({
      visual_identification: 20,
      formula_calculation: 16,
      theory_concept: 29,
      work_procedure: 16,
    });
    const primaryIds = content.studyCategories.flatMap(
      (category) => category.questionIds,
    );
    expect(primaryIds).toHaveLength(81);
    expect(new Set(primaryIds).size).toBe(81);
    expect(
      content.questions.every(
        (question) =>
          question.studyCategoryIds.includes(
            question.primaryStudyCategoryId,
          ) &&
          content.studyCategories.some(
            (category) =>
              category.id === question.primaryStudyCategoryId &&
              category.questionIds.includes(question.id),
          ),
      ),
    ).toBe(true);
  });

  it("keeps public past and predicted counts separate inside each type", () => {
    for (const category of content.studyCategories) {
      const published = content.questions.filter(
        (question) =>
          question.primaryStudyCategoryId === category.id &&
          isPublishablePracticalQuestion(question),
      );
      expect(
        published.filter((question) => question.kind === "predicted").every(
          (question) => question.occurrence === null,
        ),
      ).toBe(true);
      expect(
        published.filter((question) => question.kind === "past").every(
          (question) => question.occurrence !== null,
        ),
      ).toBe(true);
    }
  });

  it("keeps predicted questions out of actual occurrences", () => {
    const predicted = content.questions.filter(
      (question) => question.kind === "predicted",
    );
    expect(predicted).toHaveLength(40);
    expect(predicted.every((question) => question.occurrence === null)).toBe(true);
    expect(predicted.every((question) => Boolean(question.predictedBasis))).toBe(
      true,
    );
  });

  it("publishes only attributed NCS visual aids without third-party holds", () => {
    const publicAids = content.visualAids.filter(
      (visualAid) => visualAid.publicUseStatus === "public",
    );
    expect(publicAids).toHaveLength(6);
    expect(
      publicAids.every(
        (visualAid) =>
          Boolean(visualAid.altText) &&
          Boolean(visualAid.figureNumber) &&
          visualAid.rightsStatus === "education_use_with_attribution",
      ),
    ).toBe(true);
  });

  it("uses exact NCS sources only for question prompt images", () => {
    const promptVisualAidIds = new Set(
      content.questions
        .filter(isPublishablePracticalQuestion)
        .map((question) => question.visualAidId)
        .filter((visualAidId): visualAidId is string => Boolean(visualAidId)),
    );
    const promptAids = content.visualAids.filter((visualAid) =>
      promptVisualAidIds.has(visualAid.id),
    );
    expect(promptAids.map((visualAid) => visualAid.id).sort()).toEqual([
      "ncs-accumulator-safety-circuit",
      "ncs-bearing-four-types",
    ]);
    expect(
      promptAids.every(
        (visualAid) =>
          visualAid.examMatchStatus === "exact_source" &&
          visualAid.publicUseStatus === "public",
      ),
    ).toBe(true);
  });
});
