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
      past: 51,
      predicted: 185,
      workbookPredicted: 41,
      authoredPredicted: 77,
      balancedPredicted: 67,
      concepts: 46,
      supplementalConcepts: 43,
      ncsDocuments: 11,
      visualAids: 88,
    });
    expect(content.report.exactMatch).toBe(true);
    expect(content.report.publication.past).toBe(51);
    expect(content.report.publication.predicted).toBe(183);
    expect(content.report.publication.concepts).toBe(46);
    expect(content.report.publication.supplementalConcepts).toBe(43);
    expect(content.report.publication.held).toBe(0);
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

  it("publishes the safety-sign prediction only after replacing the full answer contract", () => {
    const question = content.questions.find(
      (item) => item.id === "EXP-S02",
    );

    expect(question).toMatchObject({
      title: "안전보건표지 4분류 판독",
      auditDisposition: "verified",
      contentStatus: "published",
      modelAnswer:
        "(가) 금지표지-출입금지, (나) 경고표지-고압전기 경고, (다) 지시표지-보안경 착용, (라) 안내표지-비상구",
      requiredKeywords: [
        "금지표지-출입금지",
        "경고표지-고압전기 경고",
        "지시표지-보안경 착용",
        "안내표지-비상구",
      ],
      conceptIds: ["PCON-009"],
    });
    expect(question?.rubric).toHaveLength(4);
    expect(question?.ncsSources).toEqual([
      expect.objectContaining({
        sourceKind: "official_reference",
        ncsCode: "OSH-RULE-ANNEX-6",
        sourceFileHash:
          "63DAFE819B2C2BD78B93751F9CE3B3705CFCC0BC26F1477760FFDBF41ADC3CB1",
      }),
    ]);
    expect(JSON.stringify(question)).not.toContain("held_source_missing");
    expect(question?.requiredKeywords).not.toEqual(
      expect.arrayContaining(["눈", "얼굴", "호흡", "청력 보호"]),
    );
  });

  it("links the grinding-wheel reconstruction to power-tool safety, not V-belt inspection", () => {
    const question = content.questions.find(
      (item) => item.id === "P-2026-2-Q06",
    );

    expect(question).toMatchObject({
      title: "연삭숫돌 시운전과 덮개",
      conceptIds: ["PCON-SUP-043"],
      auditDisposition: "verified",
      contentStatus: "published",
    });
    expect(question?.conceptIds).not.toContain("PCON-SUP-031");
  });

  it("uses the sine relation for sine-bar height and distinguishes full taper angle", () => {
    const concept = content.concepts.find(
      (item) => item.id === "PCON-SUP-025",
    );

    expect(concept?.formula).toEqual(
      expect.arrayContaining([
        "직접 경사각 φ: H = L × sin φ",
        "테이퍼 전체 끼인각 α: H = L × sin(α / 2)",
      ]),
    );
    expect(concept?.formula.join(" ")).not.toContain("tan");
    expect(concept?.sourceReviewNote).toContain("기본 기하관계와 충돌");
  });

  it("publishes verified reconstructions and holds answer-critical missing visuals", () => {
    const byId = (id: string) =>
      content.questions.find((question) => question.id === id);

    expect(byId("P-2025-2-Q08")).toMatchObject({
      auditDisposition: "verified",
      contentStatus: "published",
    });
    expect(byId("P-2025-2-Q08")?.requiredKeywords).toEqual(
      expect.arrayContaining([
        "(가)-b",
        "(나)-a",
        "(다)-d",
        "(라)-c",
      ]),
    );

    expect(byId("P-2025-3-Q09")).toMatchObject({
      auditDisposition: "verified",
      contentStatus: "published",
    });
    expect(byId("P-2025-3-Q09")?.requiredKeywords).toEqual(
      expect.arrayContaining([
        "b",
        "c",
        "f",
        "g",
        "h",
      ]),
    );

    for (const id of ["P-2025-2-Q01-2", "P-2026-1-Q08"]) {
      expect(byId(id)).toMatchObject({
        auditDisposition: "cbt_corrected",
        contentStatus: "published",
      });
    }

    for (const id of ["P-2025-2-Q10", "P-2025-3-Q02", "P-2026-1-Q02"]) {
      expect(byId(id)).toMatchObject({
        auditDisposition: "verified",
        contentStatus: "published",
      });
    }

    expect(
      content.questions.filter((question) =>
        question.auditDisposition.startsWith("held_"),
      ),
    ).toEqual([]);
    expect(byId("P-2025-1-Q06")?.auditDisposition).toBe("verified");
    expect(byId("EXP-C03")).toMatchObject({
      auditDisposition: "verified",
      contentStatus: "published",
      visualAidId: null,
      writtenSourceQuestionIds: ["U-1203"],
    });
    expect(byId("EXP-C03")?.ncsSources[0]).toMatchObject({
      sourceKind: "written_question_bank",
      ncsCode: "WRITTEN-U-1203",
    });
    for (const id of [
      "P-2025-2-Q01-1",
      "P-2025-2-Q04",
      "P-2026-2-Q02",
      "P-2026-2-Q03",
      "P-2026-2-Q04",
      "P-2026-2-Q10",
    ]) {
      expect(byId(id)).toMatchObject({
        auditDisposition: "verified",
        contentStatus: "published",
      });
    }

    const publishedPast = content.questions.filter(
      (question) =>
        question.kind === "past" && question.contentStatus === "published",
    );
    expect(publishedPast).toHaveLength(51);
    expect(
      Object.fromEntries(
        ["2025-1", "2025-2", "2025-3", "2026-1", "2026-2"].map(
          (occurrence) => [
            occurrence,
            publishedPast.filter(
              (question) =>
                `${question.occurrence?.year}-${question.occurrence?.round}` ===
                occurrence,
            ).length,
          ],
        ),
      ),
    ).toEqual({
      "2025-1": 10,
      "2025-2": 11,
      "2025-3": 10,
      "2026-1": 10,
      "2026-2": 10,
    });
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
      heldItems: 8,
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
    ).toHaveLength(8);
  });

  it("strips every answer field before submit", () => {
    for (const question of content.questions.filter(
      isPublishablePracticalQuestion,
    )) {
      const publicQuestion = toPublicPracticalQuestion(question);
      expect(publicQuestion).not.toHaveProperty("modelAnswer");
      expect(publicQuestion).not.toHaveProperty("answerDefinition");
      expect(publicQuestion).not.toHaveProperty("memoryTip");
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
      visual_identification: 38,
      formula_calculation: 56,
      theory_concept: 77,
      work_procedure: 65,
    });
    const primaryIds = content.studyCategories.flatMap(
      (category) => category.questionIds,
    );
    expect(primaryIds).toHaveLength(236);
    expect(new Set(primaryIds).size).toBe(236);
    expect(
      content.questions.every(
        (question) =>
          question.studyCategoryIds.includes(question.primaryStudyCategoryId) &&
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
        published
          .filter((question) => question.kind === "predicted")
          .every((question) => question.occurrence === null),
      ).toBe(true);
      expect(
        published
          .filter((question) => question.kind === "past")
          .every((question) => question.occurrence !== null),
      ).toBe(true);
    }
  });

  it("keeps predicted questions out of actual occurrences", () => {
    const predicted = content.questions.filter(
      (question) => question.kind === "predicted",
    );
    expect(predicted).toHaveLength(185);
    expect(content.report.rows.workbookPredicted).toBe(41);
    expect(content.report.rows.authoredPredicted).toBe(77);
    expect(content.report.rows.balancedPredicted).toBe(67);
    expect(predicted.every((question) => question.occurrence === null)).toBe(
      true,
    );
    expect(
      predicted.every((question) => Boolean(question.predictedBasis)),
    ).toBe(true);
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
      expect(concept.relatedPredictedQuestionIds).toContain(linked[0].id);
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

    const authoredPredicted = ["EXP-C06", "EXP-C07", "EXP-C08"].map((id) =>
      content.questions.find((question) => question.id === id),
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
    expect(
      content.questions.find((question) => question.id === "EXP-H04"),
    ).toBeUndefined();

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
    expect(accumulatorConcept?.relatedPredictedQuestionIds).not.toContain(
      "EXP-H04",
    );
  });

  it("publishes only attributed NCS visual aids without third-party holds", () => {
    const publicAids = content.visualAids.filter(
      (visualAid) => visualAid.publicUseStatus === "public",
    );
    expect(publicAids).toHaveLength(88);
    expect(
      publicAids.every(
        (visualAid) =>
          Boolean(visualAid.altText) &&
          Boolean(visualAid.figureNumber) &&
          ["education_use_with_attribution", "self_authored"].includes(
            visualAid.rightsStatus,
          ) &&
          visualAid.technicalReviewStatus === "verified" &&
          visualAid.frames.length > 0 &&
          visualAid.usageTypes.length > 0,
      ),
    ).toBe(true);
  });

  it("keeps exact past prompts distinct from reconstructed NCS sequence visuals", () => {
    const pastPromptVisualAidIds = new Set(
      content.questions
        .filter(
          (question) =>
            question.kind === "past" &&
            isPublishablePracticalQuestion(question),
        )
        .map((question) => question.visualAidId)
        .filter((visualAidId): visualAidId is string => Boolean(visualAidId)),
    );
    const pastPromptAids = content.visualAids.filter((visualAid) =>
      pastPromptVisualAidIds.has(visualAid.id),
    );
    expect(pastPromptAids.map((visualAid) => visualAid.id).sort()).toEqual([
      "diagram-abbe-principle-exam",
      "diagram-drip-lubrication",
      "diagram-grinding-wheel-safety",
      "licensed-sems-bolt",
      "ncs-bearing-four-types",
      "ncs-tire-coupling-assembly-sequence",
    ]);
    expect(
      pastPromptAids.find(
        (visualAid) => visualAid.id === "ncs-bearing-four-types",
      ),
    ).toMatchObject({
      examMatchStatus: "exact_source",
      publicUseStatus: "public",
    });
    expect(
      content.visualAids.find(
        (visualAid) =>
          visualAid.id === "licensed-measurement-instruments-three",
      ),
    ).toMatchObject({
      examMatchStatus: "licensed_equivalent",
      originType: "official_external",
      publicUseStatus: "public",
    });
    for (const visualAidId of [
      "licensed-maintenance-tools-four",
      "licensed-respirators-four",
      "licensed-sems-bolt",
      "official-safety-signs-four",
      "official-safety-signs-six",
    ]) {
      expect(
        content.visualAids.find((visualAid) => visualAid.id === visualAidId),
      ).toMatchObject({
        examMatchStatus: "licensed_equivalent",
        originType: "official_external",
        publicUseStatus: "public",
        answerCritical: true,
      });
    }
    expect(
      content.visualAids.find(
        (visualAid) =>
          visualAid.id === "ncs-spherical-roller-bearing-four-choice",
      ),
    ).toMatchObject({
      examMatchStatus: "licensed_equivalent",
      originType: "ncs_crop",
      publicUseStatus: "public",
      answerCritical: true,
    });

    expect(
      content.questions.find((question) => question.id === "P-2026-2-Q10"),
    ).toMatchObject({
      kind: "past",
      label: "practical_exam",
      occurrence: {
        year: 2026,
        round: 2,
        questionNumber: "Q10",
        sourceType: "사용자 제공 응시 복원",
        reconstructionConfidence: "B",
      },
      predictedBasis: null,
      examEvidenceStatus: "past_reconstructed",
      auditDisposition: "verified",
      contentStatus: "published",
    });
    expect(
      content.visualAids.find(
        (visualAid) =>
          visualAid.id === "ncs-tire-coupling-assembly-sequence",
      ),
    ).toMatchObject({
      examMatchStatus: "licensed_equivalent",
      originType: "ncs_crop",
      publicUseStatus: "public",
      answerCritical: true,
      usageTypes: expect.arrayContaining([
        "sequence_step",
        "past_exam_prompt",
      ]),
    });

    const predictedSequenceAids = content.visualAids.filter((visualAid) =>
      [
        "ncs-gear-coupling-sequence",
        "ncs-tapered-bearing-assembly-sequence",
      ].includes(visualAid.id),
    );
    expect(predictedSequenceAids).toHaveLength(2);
    expect(
      predictedSequenceAids.every(
        (visualAid) =>
          visualAid.examMatchStatus === "concept_source" &&
          visualAid.originType === "ncs_crop" &&
          visualAid.usageTypes.includes("sequence_step") &&
          visualAid.usageTypes.includes("concept_explanation") &&
          visualAid.publicUseStatus === "public",
      ),
    ).toBe(true);
  });
});
