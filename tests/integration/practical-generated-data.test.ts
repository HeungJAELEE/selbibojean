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
      predicted: 87,
      workbookPredicted: 41,
      authoredPredicted: 46,
      concepts: 46,
      supplementalConcepts: 43,
      ncsDocuments: 11,
      visualAids: 28,
    });
    expect(content.report.exactMatch).toBe(true);
    expect(content.report.publication.past).toBe(21);
    expect(content.report.publication.predicted).toBe(86);
    expect(content.report.publication.concepts).toBe(46);
    expect(content.report.publication.supplementalConcepts).toBe(43);
    expect(content.report.publication.held).toBe(21);
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

  it("publishes source-verified corrections and keeps image-dependent prompts held", () => {
    const byId = (id: string) =>
      content.questions.find((question) => question.id === id);

    expect(byId("P-2025-2-Q08")).toMatchObject({
      auditDisposition: "verified",
      contentStatus: "published",
    });
    expect(byId("P-2025-2-Q08")?.requiredKeywords).toEqual(
      expect.arrayContaining([
        "방진마스크-입자상 물질",
        "방독마스크-가스·증기",
        "송기마스크-외부 공기 공급",
        "전동식 호흡보호구-송풍기와 필터·정화통",
      ]),
    );

    expect(byId("P-2025-3-Q09")).toMatchObject({
      auditDisposition: "verified",
      contentStatus: "published",
    });
    expect(byId("P-2025-3-Q09")?.requiredKeywords).toEqual(
      expect.arrayContaining([
        "적정 점도",
        "온도 변화에 따른 점도 변화가 작음",
        "윤활성",
        "높은 비점",
        "낮은 빙점",
        "높은 인화점",
      ]),
    );

    for (const id of ["P-2025-2-Q01-2", "P-2026-1-Q08"]) {
      expect(byId(id)).toMatchObject({
        auditDisposition: "cbt_corrected",
        contentStatus: "published",
      });
    }

    for (const id of [
      "P-2025-2-Q10",
      "P-2025-3-Q02",
      "P-2026-1-Q02",
    ]) {
      expect(byId(id)).toMatchObject({
        auditDisposition: "held_asset_missing",
        contentStatus: "in_review",
      });
    }

    expect(
      content.questions.filter(
        (question) => question.auditDisposition === "held_answer_conflict",
      ),
    ).toEqual([]);
    expect(byId("P-2025-1-Q06")?.auditDisposition).toBe(
      "held_source_missing",
    );
    expect(byId("EXP-C03")?.auditDisposition).toBe("held_source_missing");
  });

  it("keeps component roles separate from ordered practical procedures", () => {
    const publishedConcepts = content.concepts.filter(
      (concept) => concept.contentStatus === "published",
    );
    expect(publishedConcepts).toHaveLength(89);
    expect(
      publishedConcepts.every(
        (concept) =>
          concept.components.length > 0 && concept.procedure.length >= 3,
      ),
    ).toBe(true);

    const pneumaticSequence = publishedConcepts.find(
      (concept) => concept.id === "PCON-SUP-005",
    );
    expect(pneumaticSequence?.principle).toContain(
      "타이머와 카운터는 모든 회로에 직렬로 들어가는 구성품이 아니라",
    );
    expect(pneumaticSequence?.procedure).toContain(
      "요구되는 액추에이터의 초기위치와 동작순서를 먼저 정한다. 예: A 전진 → B 전진 → B 후진 → A 후진.",
    );
  });

  it("accounts for every NCS source document without publishing held source details", () => {
    expect(content.ncsCoverage.summary).toMatchObject({
      totalDocuments: 11,
      accountedDocuments: 11,
      uniqueLessonCount: 84,
      sourceReferenceCount: 105,
      heldItems: 13,
    });
    expect(content.report.ncsCoverage).toEqual(content.ncsCoverage.summary);
    expect(content.ncsCoverage.documents).toHaveLength(11);
    expect(
      content.ncsCoverage.documents.every(
        (document) =>
          Boolean(document.sourceUrl) &&
          Boolean(document.sourceFileHash) &&
          (document.conceptIds.length > 0 || document.heldItems.length > 0),
      ),
    ).toBe(true);
    expect(
      content.ncsCoverage.documents.flatMap((document) => document.heldItems),
    ).toHaveLength(13);
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
        visual_identification: 34,
        formula_calculation: 22,
        theory_concept: 39,
        work_procedure: 33,
      });
    const primaryIds = content.studyCategories.flatMap(
      (category) => category.questionIds,
    );
    expect(primaryIds).toHaveLength(128);
    expect(new Set(primaryIds).size).toBe(128);
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
    expect(predicted).toHaveLength(87);
    expect(content.report.rows.workbookPredicted).toBe(41);
    expect(content.report.rows.authoredPredicted).toBe(46);
    expect(predicted.every((question) => question.occurrence === null)).toBe(true);
    expect(predicted.every((question) => Boolean(question.predictedBasis))).toBe(
      true,
    );
  });

  it("links one NCS-grounded predicted question to every supplemental concept", () => {
    const supplementalConcepts = content.concepts.filter(
      (concept) => concept.contentRole === "supplemental",
    );
    const supplementalPredicted = content.questions.filter((question) =>
      question.id.startsWith("EXP-SUP-"),
    );

    expect(supplementalConcepts).toHaveLength(43);
    expect(supplementalPredicted).toHaveLength(43);
    expect(
      supplementalPredicted.every(
        (question) =>
          question.kind === "predicted" &&
          question.label === "predicted_exam" &&
          question.auditDisposition === "verified" &&
          question.contentStatus === "published" &&
          question.occurrence === null &&
          question.visualAidId === null &&
          question.ncsSources.length > 0 &&
          Boolean(question.predictedBasis),
      ),
    ).toBe(true);

    for (const concept of supplementalConcepts) {
      const linked = supplementalPredicted.filter((question) =>
        question.conceptIds.includes(concept.id),
      );
      expect(linked, concept.id).toHaveLength(1);
      expect(concept.relatedPredictedQuestionIds).toEqual([linked[0].id]);
    }
  });

  it("separates the confirmed Pascal reconstruction from NCS-grounded predictions", () => {
    const actual = content.questions.find(
      (question) => question.id === "P-2026-1-Q07",
    );
    expect(actual).toMatchObject({
      kind: "past",
      formatLabel: "두 피스톤의 힘·면적 관계식 완성",
      auditDisposition: "verified",
      occurrence: {
        year: 2026,
        round: 1,
        questionNumber: "Q7",
        sourceType: "응시자 복원 블로그",
        reconstructionConfidence: "B",
      },
    });

    const authoredPredicted = ["EXP-C06", "EXP-C07", "EXP-C08"].map(
      (id) => content.questions.find((question) => question.id === id),
    );
    expect(authoredPredicted).toHaveLength(3);
    expect(authoredPredicted.every(Boolean)).toBe(true);
    expect(
      authoredPredicted.every(
        (question) =>
          question?.kind === "predicted" &&
          question.occurrence === null &&
          question.ncsSources.some(
            (source) => source.ncsCode === "1505010108",
          ) &&
          Boolean(question.predictedBasis),
      ),
    ).toBe(true);
  });

  it("splits the accumulator function and disassembly safety prompts", () => {
    expect(content.questions.find((question) => question.id === "EXP-H04")).toBeUndefined();

    const functionPrompt = content.questions.find(
      (question) => question.id === "EXP-H04A",
    );
    expect(functionPrompt).toMatchObject({
      kind: "predicted",
      title: "축압기의 기능 3가지",
      formatLabel: "축압기의 기능 3가지",
      primaryStudyCategoryId: "theory_concept",
      occurrence: null,
    });
    expect(functionPrompt?.rubric).toHaveLength(3);
    expect(functionPrompt?.conceptIds).toContain("PCON-040");

    const safetyPrompt = content.questions.find(
      (question) => question.id === "EXP-H04B",
    );
    expect(safetyPrompt).toMatchObject({
      kind: "predicted",
      title: "축압기 분해 전 조치 2가지",
      formatLabel: "축압기 분해 전 조치 2가지",
      primaryStudyCategoryId: "work_procedure",
      occurrence: null,
    });
    expect(safetyPrompt?.requiredKeywords).toEqual(
      expect.arrayContaining(["유압측 잔압 제거", "가스측 잔압 확인"]),
    );
    expect(safetyPrompt?.conceptIds).toContain("PCON-040");

    const accumulatorConcept = content.concepts.find(
      (concept) => concept.id === "PCON-040",
    );
    expect(accumulatorConcept?.relatedPredictedQuestionIds).toEqual(
      expect.arrayContaining(["EXP-H04A", "EXP-H04B"]),
    );
    expect(accumulatorConcept?.relatedPredictedQuestionIds).not.toContain("EXP-H04");
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
