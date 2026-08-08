import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import {
  createPracticePresentations,
  isSafeOriginalPracticeVariant,
} from "@/lib/content/practice-presentations";
import {
  reviewedCbtVariantManifest,
  mergeReviewedCbtVariants,
  validateReviewedCbtVariantManifest,
} from "@/lib/content/reviewed-cbt-variants";
import { isUsablePastExamVariant } from "@/lib/content/past-exam-examples";
import { buildSupabaseMaterialization } from "@/lib/content/supabase-materialization";
import type { GeneratedContent } from "@/lib/domain/types";

const source = generatedContent as GeneratedContent;

describe("reviewed CBT variant imports", () => {
  it("keeps the workbook-derived source untouched and validates all 2384 reviewed records", () => {
    expect(source.variants.some((variant) => variant.reviewState)).toBe(false);
    expect(() =>
      validateReviewedCbtVariantManifest(source, reviewedCbtVariantManifest),
    ).not.toThrow();
    expect(reviewedCbtVariantManifest.records).toHaveLength(2384);
    expect(
      new Set(
        reviewedCbtVariantManifest.records.map((record) => record.externalId),
      ).size,
    ).toBe(2384);
    expect(reviewedCbtVariantManifest.holdResolutionPolicy).toMatchObject({
      imageVerificationQueueCount: 97,
      normalizedAndRegisteredCount: 5,
      choiceConflictNonScoringCount: 19,
      lowContextRegisteredCount: 183,
      learnerPublicationStillRequiresStatus: "published",
    });
  });

  it("applies the reclassified batch and gates every other source variant", () => {
    const runtime = buildRuntimeContent(source);
    const states = runtime.variants.reduce<Record<string, number>>(
      (counts, variant) => {
        const state = variant.reviewState ?? "legacy";
        counts[state] = (counts[state] ?? 0) + 1;
        return counts;
      },
      {},
    );

    const sourceVariantIds = new Set(
      source.variants.map((variant) => variant.externalId),
    );
    const runtimeSourceVariants = runtime.variants.filter((variant) =>
      sourceVariantIds.has(variant.externalId),
    );
    expect(runtimeSourceVariants).toHaveLength(source.variants.length);
    expect(states).toMatchObject({
      candidate: 2267,
      choice_conflict: 19,
      hold: 98,
    });
    expect(states.unreviewed ?? 0).toBe(0);
    expect(states.published ?? 0).toBe(0);

    const reviewed = runtime.variants.find(
      (variant) => variant.externalId === "2006-4-Q01",
    );
    expect(reviewed?.stem).toBe(
      "설비진단 기법과 응용 예를 설명한 사항 중 잘못 연결된 것은?",
    );
    expect(reviewed?.choices).toEqual([
      "진동법 - 블로우, 팬 등의 밸런싱 진단",
      "오일 분석법 - 베어링의 오일 휩(oil whip) 진단",
      "응력법 - 설비 구조물의 응력 분포도 검사",
      "열화상법 - 전기, 전자 부품의 이상발견",
    ]);
    expect(reviewed?.reviewState).toBe("candidate");

    const finalReviewed = runtime.variants.find(
      (variant) => variant.externalId === "2022-2-Q80",
    );
    expect(finalReviewed?.reviewState).toBe("candidate");
  });

  it("preserves damaged raw source while displaying the approved normalization", () => {
    const runtime = buildRuntimeContent(source);
    const normalized = runtime.variants.find(
      (variant) => variant.externalId === "2006-4-Q09",
    );

    expect(normalized?.reviewState).toBe("candidate");
    expect(normalized?.choices[1]).toBe("소음계");
    expect(normalized?.reviewed?.choices[1]).toBe("소음기");
    expect(normalized?.reviewed?.presentationNormalization).toMatchObject({
      applied: true,
      rawChoices: ["녹음기", "소음기", "기록계", "주파수 분석기"],
      normalizedChoices: [
        "녹음기",
        "소음계",
        "기록계",
        "주파수 분석기",
      ],
      sourceTextPreserved: true,
    });
    expect(normalized?.answer).toBe("② 소음계");
  });

  it("keeps choice conflicts and image-dependent records non-scoring", () => {
    const runtime = buildRuntimeContent(source);
    const conflict = runtime.variants.find(
      (variant) => variant.externalId === "2006-4-Q34",
    );
    const imageHold = runtime.variants.find(
      (variant) => variant.externalId === "2006-4-Q17",
    );

    expect(conflict?.reviewState).toBe("choice_conflict");
    expect(conflict?.reviewStatus).toContain("선택지 충돌");
    expect(conflict?.reviewed?.choiceConflict?.scoringPolicy).toBe(
      "non_scoring",
    );
    expect(conflict?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);
    expect(conflict?.reviewed?.choiceIdMapping).toEqual([]);
    expect(conflict?.answer).toBe("");
    expect(conflict?.explanation).toBe("");

    expect(imageHold?.reviewState).toBe("hold");
    expect(imageHold?.reviewStatus).toContain("필수 이미지 확인");
    expect(imageHold?.reviewed?.choiceIdMapping).toEqual([]);
    expect(imageHold?.answer).toBe("");
    expect(imageHold?.explanation).toBe("");
  });

  it("rejects active answer data on image-dependent HOLD records", () => {
    const records = reviewedCbtVariantManifest.records.map((record) =>
      record.externalId === "2012-4-Q36"
        ? {
            ...record,
            reviewedAnswerIndex: record.sourceAnswerIndex,
            reviewedAnswerText: record.sourceAnswerText,
          }
        : record,
    );
    const manifest = {
      ...reviewedCbtVariantManifest,
      recordsSha256: createHash("sha256")
        .update(JSON.stringify(records), "utf8")
        .digest("hex"),
      records,
    };

    expect(() => validateReviewedCbtVariantManifest(source, manifest)).toThrow(
      /hold is invalid/i,
    );
  });

  it("rejects active answer data on an image HOLD record", () => {
    const records = reviewedCbtVariantManifest.records.map((record) =>
      record.externalId === "2012-4-Q36"
        ? {
            ...record,
            reviewedAnswerIndex: record.sourceAnswerIndex,
            reviewedAnswerText: record.sourceAnswerText,
          }
        : record,
    );
    const manifest = {
      ...reviewedCbtVariantManifest,
      recordsSha256: createHash("sha256")
        .update(JSON.stringify(records), "utf8")
        .digest("hex"),
      records,
    };

    expect(() => validateReviewedCbtVariantManifest(source, manifest)).toThrow(
      /image hold/i,
    );
  });

  it("excludes candidate, choice-conflict, hold, and unreviewed variants from learner DTOs", () => {
    const runtime = buildRuntimeContent(source);
    const sourceVariantIds = new Set(
      source.variants.map((variant) => variant.externalId),
    );
    expect(
      runtime.variants
        .filter((variant) => sourceVariantIds.has(variant.externalId))
        .every((variant) => !isUsablePastExamVariant(variant)),
    ).toBe(true);
  });

  it("can present a reviewed source variant only after explicit publication", () => {
    const runtime = buildRuntimeContent(source);
    const candidate = runtime.variants.find(
      (variant) => variant.externalId === "2006-4-Q01",
    );
    const question = runtime.questions.find(
      (item) => item.id === candidate?.canonicalId,
    );
    expect(candidate).toBeDefined();
    expect(question).toBeDefined();

    const published = {
      ...candidate!,
      reviewState: "published" as const,
    };
    expect(isSafeOriginalPracticeVariant(question!, published)).toBe(true);

    const presentation = createPracticePresentations(
      [question!],
      [published],
      100,
      20260807,
      false,
    )[0];
    expect(presentation.provenance.exam?.externalId).toBe("2006-4-Q01");
    expect(presentation.stem).toBe(candidate?.stem);
    expect(presentation.choices.map((choice) => choice.text)).toEqual(
      candidate?.choices,
    );
    expect(presentation.choices.map((choice) => choice.id)).toEqual(
      candidate?.reviewed?.choiceIdMapping,
    );
  });

  it("accepts an explicitly published record after manifest counts and digest are updated", () => {
    const records = reviewedCbtVariantManifest.records.map((record, index) =>
      index === 0
        ? {
            ...record,
            review: {
              ...record.review,
              runtimeStatus: "published" as const,
              publicationBlockers: [],
            },
          }
        : record,
    );
    const manifest = {
      ...reviewedCbtVariantManifest,
      batches: reviewedCbtVariantManifest.batches.map((batch, index) =>
        index === 0
          ? {
              ...batch,
              candidateCount: batch.candidateCount - 1,
            }
          : batch,
      ),
      recordsSha256: createHash("sha256")
        .update(JSON.stringify(records), "utf8")
        .digest("hex"),
      records,
    };

    expect(() =>
      validateReviewedCbtVariantManifest(source, manifest),
    ).not.toThrow();
    const runtime = mergeReviewedCbtVariants(source, manifest);
    expect(
      runtime.variants.find(
        (variant) => variant.externalId === "2006-4-Q01",
      )?.reviewState,
    ).toBe("published");
  });

  it("repairs the telescope-cylinder concept group without changing IDs", () => {
    const runtime = buildRuntimeContent(source);
    const lesson = runtime.lessons.find(
      (candidate) => candidate.id === "lesson-qnsesu",
    );
    const questions = runtime.questions.filter(
      (question) => question.lessonId === "lesson-qnsesu",
    );

    expect(lesson?.conceptGroupId).toBe("s1-g06");
    expect(questions.map((question) => question.id).sort()).toEqual([
      "U-300",
      "U-478",
    ]);
    expect(
      questions.every((question) => question.conceptGroupId === "s1-g06"),
    ).toBe(true);
  });

  it("keeps answer-bearing review data out of public question-variant rows", () => {
    const runtime = buildRuntimeContent(source);
    const plan = buildSupabaseMaterialization(
      runtime,
      "00000000-0000-0000-0000-000000000001",
    );
    const candidate = plan.questionVariants.find(
      (variant) => variant.external_id === "2006-4-Q09",
    );
    const conflict = plan.questionVariants.find(
      (variant) => variant.external_id === "2006-4-Q34",
    );
    const candidateSerialized = JSON.stringify(candidate?.payload);
    const conflictSerialized = JSON.stringify(conflict?.payload);

    const reviewedExternalIds = new Set(
      reviewedCbtVariantManifest.records.map((record) => record.externalId),
    );
    const publishedReviewedRows = plan.questionVariants.filter(
      (variant) =>
        reviewedExternalIds.has(variant.external_id) &&
        variant.status === "published",
    );

    expect(publishedReviewedRows).toHaveLength(0);
    expect(candidate?.status).toBe("draft");
    expect(candidate?.payload.reviewed).toMatchObject({
      reviewState: "candidate",
      normalizationApplied: true,
      choiceConflict: false,
      variantSpecificFeedbackRequired: false,
      choiceContractReady: true,
    });
    expect(conflict?.status).toBe("draft");
    expect(conflict?.payload.reviewed).toMatchObject({
      reviewState: "choice_conflict",
      issueLabel: "선택지 충돌",
      normalizationApplied: false,
      choiceConflict: true,
      variantSpecificFeedbackRequired: false,
      choiceContractReady: false,
    });

    for (const serialized of [candidateSerialized, conflictSerialized]) {
      expect(serialized).toContain("orderedChoicesSha256");
      expect(serialized).not.toContain("reviewedAnswerIndex");
      expect(serialized).not.toContain("sourceAnswerIndex");
      expect(serialized).not.toContain("directSolution");
      expect(serialized).not.toContain("choiceByChoiceReasons");
      expect(serialized).not.toContain("reviewedAnswerText");
      expect(serialized).not.toContain("sourceAnswerText");
      expect(serialized).not.toContain("choiceIdMapping");
    }
  });

  it("adds missing batch-02 theory and canonical overlays without mutating source IDs", () => {
    const runtime = buildRuntimeContent(source);

    expect(reviewedCbtVariantManifest.theoryLessonAdditions).toHaveLength(20);
    expect(reviewedCbtVariantManifest.canonicalQuestionChanges).toHaveLength(19);
    expect(
      source.lessons.some(
        (lesson) => lesson.id === "lesson-cbt-cbn-tool-material",
      ),
    ).toBe(false);
    expect(source.questions.some((question) => question.id === "U-1394")).toBe(
      false,
    );

    const cbnVariant = runtime.variants.find(
      (variant) => variant.externalId === "2009-4-Q41",
    );
    const cbnQuestion = runtime.questions.find(
      (question) => question.id === "U-1253",
    );
    const cbnLesson = runtime.lessons.find(
      (lesson) => lesson.id === "lesson-cbt-cbn-tool-material",
    );
    expect(cbnVariant).toMatchObject({
      canonicalId: "U-1253",
      reviewState: "candidate",
    });
    expect(cbnQuestion).toMatchObject({
      lessonId: "lesson-cbt-cbn-tool-material",
      conceptGroupId: "s3-g08",
      contentStatus: "in_review",
    });
    expect(cbnLesson).toMatchObject({
      conceptGroupId: "s3-g08",
      contentStatus: "in_review",
      publication: { readiness: "blocked" },
    });

    const imageHold = runtime.variants.find(
      (variant) => variant.externalId === "2009-4-Q46",
    );
    expect(imageHold).toMatchObject({
      canonicalId: "U-1256",
      reviewState: "hold",
    });
    expect(imageHold?.reviewed?.theoryLink?.lessonId).toBe(
      "lesson-cbt-shaper-cutting-speed",
    );

    expect(
      runtime.variants.find(
        (variant) => variant.externalId === "2009-4-Q54",
      ),
    ).toMatchObject({
      canonicalId: "U-1257",
      reviewState: "candidate",
    });
    expect(
      runtime.variants.find(
        (variant) => variant.externalId === "2009-4-Q56",
      ),
    ).toMatchObject({
      canonicalId: "U-1394",
      reviewState: "candidate",
    });

    const poppetVariant = runtime.variants.find(
      (variant) => variant.externalId === "2009-4-Q84",
    );
    const poppetQuestion = runtime.questions.find(
      (question) => question.id === "U-1400",
    );
    const poppetLesson = runtime.lessons.find(
      (lesson) => lesson.id === "lesson-cbt-poppet-valve-components",
    );
    expect(poppetVariant).toMatchObject({
      canonicalId: "U-1400",
      reviewState: "candidate",
    });
    expect(poppetVariant?.reviewed?.variantSpecificFeedbackRequired).toBeUndefined();
    expect(poppetVariant?.reviewed?.choiceIdMapping).toHaveLength(4);
    expect(poppetQuestion).toMatchObject({
      lessonId: "lesson-cbt-poppet-valve-components",
      conceptGroupId: "s1-g04",
      contentStatus: "in_review",
    });
    expect(poppetLesson).toMatchObject({
      conceptGroupId: "s1-g04",
      contentStatus: "in_review",
      publication: { readiness: "blocked" },
    });
  });

  it("requires direct theory links for all batch-02 records", () => {
    const runtime = buildRuntimeContent(source);
    const lessonsById = new Map(
      runtime.lessons.map((lesson) => [lesson.id, lesson]),
    );
    const batch02Records = reviewedCbtVariantManifest.records.slice(200, 400);

    expect(batch02Records).toHaveLength(200);
    for (const record of batch02Records) {
      expect(record.theoryLink).not.toBeNull();
      const lesson = lessonsById.get(record.theoryLink!.lessonId);
      expect(lesson).toBeDefined();
      expect(
        lesson?.blocks.some(
          (block) => block.id === record.theoryLink!.lessonAnchor,
        ),
      ).toBe(true);
    }
  });

  it("applies batch-03 answer correction and keeps choice conflicts non-scoring", () => {
    const runtime = buildRuntimeContent(source);
    const corrected = runtime.variants.find(
      (variant) => variant.externalId === "2010-4-Q59",
    );
    const correctedQuestion = runtime.questions.find(
      (question) => question.id === "U-1215",
    );
    const cavitationConflict = runtime.variants.find(
      (variant) => variant.externalId === "2011-4-Q42",
    );
    const gearConflict = runtime.variants.find(
      (variant) => variant.externalId === "2011-4-Q59",
    );

    expect(corrected).toMatchObject({
      reviewState: "candidate",
      answer: "③ 하부 조정 링의 상향 조정",
      reviewed: {
        sourceAnswerIndex: 0,
        reviewedAnswerIndex: 2,
        theoryLink: {
          lessonId: "lesson-cbt-safety-valve-simmering-correction",
        },
      },
    });
    expect(correctedQuestion).toMatchObject({
      lessonId: "lesson-cbt-safety-valve-simmering-correction",
      correctChoiceId: "U-1215-c3",
      contentStatus: "in_review",
      publication: { readiness: "blocked" },
    });
    for (const conflict of [cavitationConflict, gearConflict]) {
      expect(conflict?.reviewState).toBe("choice_conflict");
      expect(conflict?.answer).toBe("");
      expect(conflict?.explanation).toBe("");
      expect(conflict?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);
      expect(conflict?.reviewed?.choiceConflict?.scoringPolicy).toBe(
        "non_scoring",
      );
    }
  });


  it("applies batch-04 answer correction, choice conflict, and dry-run override", () => {
    const runtime = buildRuntimeContent(source);
    const corrected = runtime.variants.find(
      (variant) => variant.externalId === "2013-4-Q48",
    );
    const correctedQuestion = runtime.questions.find(
      (question) => question.id === "U-1072",
    );
    const correctedLesson = runtime.lessons.find(
      (lesson) =>
        lesson.id === "lesson-cbt-forward-curved-fan-power-curve",
    );
    const conflict = runtime.variants.find(
      (variant) => variant.externalId === "2013-4-Q84",
    );
    const conflictQuestion = runtime.questions.find(
      (question) => question.id === "U-1089",
    );
    const reliability = runtime.variants.find(
      (variant) => variant.externalId === "2012-4-Q08",
    );

    expect(corrected).toMatchObject({
      reviewState: "candidate",
      answer: "③ 다익 팬",
      reviewed: {
        sourceAnswerIndex: 0,
        reviewedAnswerIndex: 2,
        theoryLink: {
          lessonId: "lesson-cbt-forward-curved-fan-power-curve",
          conceptGroupId: "s3-g10",
        },
      },
    });
    expect(correctedQuestion).toMatchObject({
      lessonId: "lesson-cbt-forward-curved-fan-power-curve",
      correctChoiceId: "U-1072-c3",
      contentStatus: "in_review",
      publication: { readiness: "blocked" },
    });
    expect(correctedLesson).toMatchObject({
      conceptGroupId: "s3-g10",
      contentStatus: "in_review",
      publication: { readiness: "blocked" },
    });

    expect(conflict).toMatchObject({
      reviewState: "choice_conflict",
      answer: "",
      explanation: "",
      reviewed: {
        choiceConflict: { scoringPolicy: "non_scoring" },
        theoryLink: {
          lessonId:
            "lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict",
          conceptGroupId: "s1-g08",
        },
      },
    });
    expect(conflict?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);
    expect(conflictQuestion).toMatchObject({
      lessonId:
        "lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict",
      conceptGroupId: "s1-g08",
      contentStatus: "in_review",
      publication: { readiness: "blocked" },
    });

    expect(reliability).toMatchObject({
      canonicalId: "U-1099",
      reviewState: "candidate",
      reviewed: {
        migration: {
          mappingClass:
            "DRY_RUN_REASSIGNMENT_OVERRIDDEN_BY_DIRECT_CANONICAL_REVIEW",
        },
      },
    });
  });


  it("applies batch-05 answer correction, choice conflict, and semantic reassignment", () => {
    const runtime = buildRuntimeContent(source);
    const corrected = runtime.variants.find(
      (variant) => variant.externalId === "2014-4-Q87",
    );
    const conflict = runtime.variants.find(
      (variant) => variant.externalId === "2014-2-Q40",
    );
    const reassigned = runtime.variants.find(
      (variant) => variant.externalId === "2014-4-Q51",
    );

    expect(corrected).toMatchObject({
      canonicalId: "U-990",
      reviewState: "candidate",
      answer: "② 저주파 소음이 없어서 소음 대책이 필요 없다.",
      reviewed: {
        sourceAnswerIndex: 3,
        reviewedAnswerIndex: 1,
        choiceIdMapping: [
          "U-990-c2",
          "U-990-c3",
          "U-990-c1",
          "U-990-c4",
        ],
        theoryLink: {
          lessonId: "lesson-117o0xo",
          conceptGroupId: "s3-g10",
        },
      },
    });

    expect(conflict).toMatchObject({
      canonicalId: "U-1014",
      reviewState: "choice_conflict",
      answer: "",
      explanation: "",
      reviewed: {
        choiceConflict: {
          scoringPolicy: "non_scoring",
          choiceIndices: [1, 2],
        },
        theoryLink: { lessonId: "lesson-1qwoyl1" },
      },
    });
    expect(conflict?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);

    expect(reassigned).toMatchObject({
      canonicalId: "U-362",
      reviewState: "candidate",
      reviewed: {
        currentCanonicalId: "U-100",
        variantSpecificFeedbackRequired: true,
        choiceIdMapping: [],
        theoryLink: {
          canonicalId: "U-362",
          lessonId: "lesson-w8vtqs",
          conceptGroupId: "s3-g06",
        },
        migration: {
          mappingClass: "SEMANTIC_REPLACE",
          canonicalAction: "REASSIGN_CANONICAL",
        },
      },
    });
  });


  it("applies batch-06 choice conflicts, image holds, low-context policy, and canonical reassignment", () => {
    const runtime = buildRuntimeContent(source);
    const batch06Records = reviewedCbtVariantManifest.records.slice(1000, 1200);

    expect(batch06Records).toHaveLength(200);
    expect(
      batch06Records.filter(
        (record) => record.review.runtimeStatus === "candidate",
      ),
    ).toHaveLength(190);
    expect(
      batch06Records.filter(
        (record) => record.review.runtimeStatus === "choice_conflict",
      ),
    ).toHaveLength(4);
    expect(
      batch06Records.filter((record) => record.review.runtimeStatus === "hold"),
    ).toHaveLength(6);

    const conflictContracts = new Map([
      ["2015-2-Q42", [0, 1, 2, 3]],
      ["2015-4-Q20", [1, 3]],
      ["2015-4-Q46", [0, 1, 2, 3]],
      ["2015-4-Q55", [0, 2]],
    ]);
    for (const [externalId, indices] of conflictContracts) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "choice_conflict",
        answer: "",
        explanation: "",
        reviewed: {
          choiceConflict: {
            scoringPolicy: "non_scoring",
            choiceIndices: indices,
          },
        },
      });
      expect(variant?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);
    }

    const imageHold = runtime.variants.find(
      (variant) => variant.externalId === "2015-4-Q88",
    );
    expect(imageHold).toMatchObject({
      reviewState: "hold",
      answer: "",
      explanation: "",
      reviewed: {
        formulaUnitSubstitution: {
          formula: "V²/(2g) + p/γ + Z = 일정",
        },
      },
    });

    const reassigned = runtime.variants.find(
      (variant) => variant.externalId === "2015-4-Q69",
    );
    expect(reassigned).toMatchObject({
      canonicalId: "U-390",
      reviewState: "candidate",
      reviewed: {
        currentCanonicalId: "U-889",
        variantSpecificFeedbackRequired: true,
        choiceIdMapping: [],
        theoryLink: {
          canonicalId: "U-390",
          lessonId: "lesson-18pfbo5",
          conceptGroupId: "s4-g14",
        },
        migration: {
          mappingClass: "SEMANTIC_REPLACE",
          canonicalAction: "REASSIGN_CANONICAL",
        },
      },
    });

    for (const externalId of [
      "2015-2-Q49",
      "2015-2-Q70",
      "2015-4-Q47",
      "2015-4-Q91",
    ]) {
      const record = batch06Records.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(record?.review.runtimeStatus).toBe("candidate");
      expect(record?.review.theoryLinkStatus).toBe(
        "direct_existing_theory_low_context_exam_intent",
      );
      expect(record?.review.answerConflictOrMultipleAnswerRisk).toBeTruthy();
    }
  });


  it("applies batch-07 image gates, low-context boundaries, formula structure, and choice contracts", () => {
    const runtime = buildRuntimeContent(source);
    const batch07Records = reviewedCbtVariantManifest.records.slice(1200, 1370);

    expect(batch07Records).toHaveLength(170);
    expect(
      batch07Records.filter(
        (record) => record.review.runtimeStatus === "candidate",
      ),
    ).toHaveLength(165);
    expect(
      batch07Records.filter(
        (record) => record.review.runtimeStatus === "choice_conflict",
      ),
    ).toHaveLength(0);
    expect(
      batch07Records.filter((record) => record.review.runtimeStatus === "hold"),
    ).toHaveLength(5);
    expect(
      batch07Records.filter((record) => record.choiceIdMapping.length > 0),
    ).toHaveLength(29);
    expect(
      batch07Records.filter(
        (record) => record.variantSpecificFeedbackRequired,
      ),
    ).toHaveLength(136);

    for (const externalId of [
      "2016-4-Q10",
      "2016-4-Q26",
      "2016-4-Q58",
      "2017-2-Q32",
      "2017-2-Q33",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "hold",
        answer: "",
        explanation: "",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          review: {
            issueLabel: "필수 이미지 확인",
            publicationBlockers: ["required_source_image_review"],
          },
        },
      });
    }

    const formulaHold = runtime.variants.find(
      (variant) => variant.externalId === "2016-4-Q10",
    );
    expect(formulaHold?.reviewed?.formulaUnitSubstitution).toMatchObject({
      formula: "무감쇠 1자유도계의 각고유진동수는 ωn=√(k/m)이다",
    });

    for (const externalId of [
      "2016-4-Q70",
      "2016-4-Q83",
      "2016-4-Q90",
      "2017-2-Q43",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant?.reviewState).toBe("candidate");
      expect(variant?.reviewed?.review.answerConflictOrMultipleAnswerRisk).toBeTruthy();
    }

    const batch = reviewedCbtVariantManifest.batches.find(
      (candidate) => candidate.batchId === "import-07",
    );
    expect(batch?.holdResolution.lowContextRegistered).toHaveLength(32);
    for (const externalId of batch?.holdResolution.lowContextRegistered ?? []) {
      const record = batch07Records.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(record?.review.runtimeStatus).toBe("candidate");
      expect(record?.review.theoryLinkStatus).toBe(
        "direct_existing_theory_low_context_exam_intent",
      );
    }

    expect(
      batch07Records.every(
        (record) =>
          record.currentCanonicalId === record.canonicalId &&
          record.migration.canonicalAction === "KEEP_CURRENT_CANONICAL",
      ),
    ).toBe(true);
  });


  it("applies batch-08 image gates, choice conflict isolation, and canonical theory repairs", () => {
    const runtime = buildRuntimeContent(source);
    const batch08Records = reviewedCbtVariantManifest.records.slice(1370, 1570);

    expect(batch08Records).toHaveLength(200);
    expect(
      batch08Records.filter(
        (record) => record.review.runtimeStatus === "candidate",
      ),
    ).toHaveLength(191);
    expect(
      batch08Records.filter(
        (record) => record.review.runtimeStatus === "choice_conflict",
      ),
    ).toHaveLength(1);
    expect(
      batch08Records.filter((record) => record.review.runtimeStatus === "hold"),
    ).toHaveLength(8);
    expect(
      batch08Records.filter((record) => record.choiceIdMapping.length > 0),
    ).toHaveLength(38);
    expect(
      batch08Records.filter(
        (record) => record.variantSpecificFeedbackRequired,
      ),
    ).toHaveLength(153);

    for (const externalId of [
      "2017-2-Q60",
      "2018-2-Q05",
      "2018-2-Q21",
      "2018-2-Q45",
      "2018-2-Q83",
      "2018-4-Q15",
      "2018-4-Q18",
      "2018-4-Q37",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "hold",
        answer: "",
        explanation: "",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          review: {
            issueLabel: "필수 이미지 확인",
            publicationBlockers: ["required_source_image_review"],
          },
        },
      });
    }

    const conflict = runtime.variants.find(
      (variant) => variant.externalId === "2018-2-Q10",
    );
    expect(conflict).toMatchObject({
      reviewState: "choice_conflict",
      answer: "",
      explanation: "",
      reviewed: {
        choiceConflict: {
          scoringPolicy: "non_scoring",
          choiceIndices: [0, 1, 2, 3],
        },
      },
    });
    expect(conflict?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);

    const reassigned = runtime.variants.find(
      (variant) => variant.externalId === "2018-4-Q19",
    );
    expect(reassigned).toMatchObject({
      canonicalId: "U-997",
      reviewState: "candidate",
      reviewed: {
        currentCanonicalId: "U-026",
        choiceIdMapping: ["U-997-c2", "U-997-c1", "U-997-c4", "U-997-c3"],
        theoryLink: {
          lessonId: "lesson-lqjgxa",
          conceptGroupId: "s4-g05",
        },
        migration: {
          mappingClass: "SEMANTIC_REPLACE",
          canonicalAction: "REASSIGN_CANONICAL",
        },
      },
    });

    const repaired = runtime.variants.find(
      (variant) => variant.externalId === "2018-4-Q35",
    );
    expect(repaired).toMatchObject({
      canonicalId: "U-649",
      reviewState: "candidate",
      reviewed: {
        choiceIdMapping: ["U-649-c1", "U-649-c2", "U-649-c3", "U-649-c4"],
        theoryLink: {
          lessonId: "lesson-cbt-gang-system-process-layout",
          conceptGroupId: "s4-g10",
        },
        review: {
          publicationBlockers: [
            "pending_runtime_integration",
            "lesson_source_needed",
          ],
        },
        migration: {
          canonicalAction: "APPLY_CANONICAL_OVERLAY",
          theoryAction: "ADD_DIRECT_THEORY_LESSON",
        },
      },
    });

    const batch = reviewedCbtVariantManifest.batches.find(
      (candidate) => candidate.batchId === "import-08",
    );
    expect(batch?.holdResolution.lowContextRegistered).toHaveLength(30);
    expect(batch?.theoryLessonAdditionIds).toEqual([
      "lesson-cbt-gang-system-process-layout",
    ]);
    expect(batch?.canonicalQuestionChangeIds).toEqual(["U-649"]);

    const lesson = (
      reviewedCbtVariantManifest.theoryLessonAdditions ?? []
    ).find(
      (addition) =>
        addition.lesson.id === "lesson-cbt-gang-system-process-layout",
    );
    expect(lesson?.lesson).toMatchObject({
      sourceNeeded: true,
      publication: {
        readiness: "blocked",
      },
    });
  });


  it("applies batch-09 image gates and isolates the two-invalid-choice conflict without canonical changes", () => {
    const runtime = buildRuntimeContent(source);
    const batch09Records = reviewedCbtVariantManifest.records.slice(1570, 1770);

    expect(batch09Records).toHaveLength(200);
    expect(
      batch09Records.filter(
        (record) => record.review.runtimeStatus === "candidate",
      ),
    ).toHaveLength(192);
    expect(
      batch09Records.filter(
        (record) => record.review.runtimeStatus === "choice_conflict",
      ),
    ).toHaveLength(1);
    expect(
      batch09Records.filter((record) => record.review.runtimeStatus === "hold"),
    ).toHaveLength(7);
    expect(
      batch09Records.filter((record) => record.choiceIdMapping.length > 0),
    ).toHaveLength(28);
    expect(
      batch09Records.filter(
        (record) => record.variantSpecificFeedbackRequired,
      ),
    ).toHaveLength(164);

    for (const externalId of [
      "2018-4-Q89",
      "2019-1-Q01",
      "2019-1-Q91",
      "2019-1-Q92",
      "2019-1-Q98",
      "2019-2-Q21",
      "2019-2-Q35",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "hold",
        answer: "",
        explanation: "",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          review: {
            issueLabel: "필수 이미지 확인",
            publicationBlockers: ["required_source_image_review"],
          },
        },
      });
    }

    const conflict = runtime.variants.find(
      (variant) => variant.externalId === "2019-2-Q32",
    );
    expect(conflict).toMatchObject({
      reviewState: "choice_conflict",
      answer: "",
      explanation: "",
      reviewed: {
        choiceConflict: {
          scoringPolicy: "non_scoring",
          choiceIndices: [1, 2],
        },
      },
    });
    expect(conflict?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);

    const batch = reviewedCbtVariantManifest.batches.find(
      (candidate) => candidate.batchId === "import-09",
    );
    expect(batch?.holdResolution.lowContextRegistered).toHaveLength(26);
    expect(batch?.theoryLessonAdditionIds).toEqual([]);
    expect(batch?.canonicalQuestionChangeIds).toEqual([]);
    expect(
      batch09Records.every(
        (record) =>
          record.currentCanonicalId === record.canonicalId &&
          [
            "KEEP_CURRENT_CANONICAL",
            "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW",
          ].includes(record.migration.canonicalAction),
      ),
    ).toBe(true);
  });


  it("applies batch-10 image, choice-conflict, answer-key, reassignment, and U-478 taxonomy gates", () => {
    const runtime = buildRuntimeContent(source);
    const batch10Records = reviewedCbtVariantManifest.records.slice(1770, 1970);

    expect(batch10Records).toHaveLength(200);
    expect(
      batch10Records.filter(
        (record) => record.review.runtimeStatus === "candidate",
      ),
    ).toHaveLength(187);
    expect(
      batch10Records.filter(
        (record) => record.review.runtimeStatus === "choice_conflict",
      ),
    ).toHaveLength(2);
    expect(
      batch10Records.filter((record) => record.review.runtimeStatus === "hold"),
    ).toHaveLength(11);
    expect(
      batch10Records.filter((record) => record.choiceIdMapping.length > 0),
    ).toHaveLength(39);
    expect(
      batch10Records.filter(
        (record) => record.variantSpecificFeedbackRequired,
      ),
    ).toHaveLength(148);

    for (const externalId of [
      "2019-2-Q94",
      "2019-2-Q99",
      "2020-12B-Q05",
      "2020-12B-Q08",
      "2020-12B-Q10",
      "2020-12B-Q85",
      "2020-12B-Q87",
      "2020-3B-Q04",
      "2020-3B-Q14",
      "2020-3B-Q39",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "hold",
        answer: "",
        explanation: "",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          review: {
            issueLabel: "필수 이미지 확인",
            publicationBlockers: ["required_source_image_review"],
          },
        },
      });
    }

    for (const [externalId, choiceIndices] of [
      ["2019-2-Q86", [0, 3]],
      ["2020-12B-Q92", [2, 3]],
    ] as const) {
      const conflict = runtime.variants.find(
        (variant) => variant.externalId === externalId,
      );
      expect(conflict).toMatchObject({
        reviewState: "choice_conflict",
        answer: "",
        explanation: "",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          choiceConflict: {
            scoringPolicy: "non_scoring",
            choiceIndices,
          },
        },
      });
      expect(conflict?.reviewed?.directSolution).toMatch(/^선택지 충돌:/);
    }

    const answerKeyConflict = runtime.variants.find(
      (variant) => variant.externalId === "2020-3B-Q28",
    );
    expect(answerKeyConflict).toMatchObject({
      reviewState: "hold",
      answer: "",
      explanation: "",
      reviewed: {
        reviewedAnswerIndex: null,
        choiceIdMapping: [],
        review: {
          issueLabel: "정답키 충돌",
          scoringDisposition: "excluded_answer_key_conflict",
          publicationBlockers: [
            "answer_key_correction_pending_runtime_validation",
            "reconstructed_answer_key_conflicts_with_centralized_maintenance_characteristics",
          ],
        },
        migration: {
          mappingClass: "ANSWER_KEY_CONFLICT_HOLD",
        },
      },
    });

    const reassignedAccidentalFailure = runtime.variants.find(
      (variant) => variant.externalId === "2020-12B-Q75",
    );
    expect(reassignedAccidentalFailure).toMatchObject({
      canonicalId: "U-787",
      reviewState: "candidate",
      reviewed: {
        currentCanonicalId: "U-325",
        theoryLink: {
          lessonId: "lesson-1kx5x2w",
          lessonAnchor: "trap",
          conceptGroupId: "s4-g08",
          conceptId: "concept-1kx5x2w",
        },
        migration: {
          mappingClass: "SEMANTIC_REPLACE",
          canonicalAction: "REASSIGN_CANONICAL",
        },
      },
    });

    const reassignedSpeedLoss = runtime.variants.find(
      (variant) => variant.externalId === "2020-3B-Q26",
    );
    expect(reassignedSpeedLoss).toMatchObject({
      canonicalId: "U-1109",
      reviewState: "candidate",
      reviewed: {
        currentCanonicalId: "U-060",
        choiceIdMapping: [
          "U-1109-c1",
          "U-1109-c2",
          "U-1109-c3",
          "U-1109-c4",
        ],
        theoryLink: {
          lessonId: "lesson-c16ieq",
          lessonAnchor: "principle",
          conceptGroupId: "s4-g09",
          conceptId: "concept-c16ieq",
        },
        migration: {
          mappingClass: "SEMANTIC_REPLACE",
          canonicalAction: "REASSIGN_CANONICAL",
        },
      },
    });

    const repaired = runtime.variants.find(
      (variant) => variant.externalId === "2020-12B-Q86",
    );
    expect(repaired).toMatchObject({
      canonicalId: "U-478",
      reviewState: "candidate",
      reviewed: {
        currentCanonicalId: "U-478",
        theoryLink: {
          lessonId: "lesson-qnsesu",
          lessonAnchor: "trap",
          conceptGroupId: "s1-g06",
          conceptId: "concept-qnsesu",
        },
        migration: {
          canonicalAction: "APPLY_CANONICAL_OVERLAY",
          theoryAction: "RELINK_CANONICAL_TO_EXISTING_THEORY_GROUP",
        },
      },
    });
    expect(
      runtime.questions.find((question) => question.id === "U-478"),
    ).toMatchObject({
      conceptGroupId: "s1-g06",
      lessonId: "lesson-qnsesu",
      correctChoiceId: "U-478-c2",
      publication: {
        readiness: "blocked",
        blockers: ["mapping_unverified"],
      },
      audit: {
        auditDisposition: "held_runtime_validation",
      },
    });

    const batch = reviewedCbtVariantManifest.batches.find(
      (candidate) => candidate.batchId === "import-10",
    );
    expect(batch?.holdResolution.imageVerificationQueue).toHaveLength(10);
    expect(batch?.holdResolution.choiceConflictNonScoring).toEqual([
      "2019-2-Q86",
      "2020-12B-Q92",
    ]);
    expect(batch?.holdResolution.lowContextRegistered).toHaveLength(31);
    expect(batch?.theoryLessonAdditionIds).toEqual([]);
    expect(batch?.canonicalQuestionChangeIds).toEqual(["U-478"]);

    const canonicalChange = (
      reviewedCbtVariantManifest.canonicalQuestionChanges ?? []
    ).find(
      (change) => change.question.id === "U-478",
    );
    expect(canonicalChange).toMatchObject({
      action: "replace",
      question: {
        conceptGroupId: "s1-g06",
        lessonId: "lesson-qnsesu",
        correctChoiceId: "U-478-c2",
      },
      affectedExternalIds: ["2007-4-Q84", "2020-12B-Q86"],
    });
  });


  it("applies batch-11 image gates and reassigns the valve-chattering variant", () => {
    const runtime = buildRuntimeContent(source);
    const batch11Records = reviewedCbtVariantManifest.records.slice(1970, 2162);

    expect(batch11Records).toHaveLength(192);
    expect(
      batch11Records.filter(
        (record) => record.review.runtimeStatus === "candidate",
      ),
    ).toHaveLength(182);
    expect(
      batch11Records.filter((record) => record.review.runtimeStatus === "hold"),
    ).toHaveLength(10);
    expect(
      batch11Records.filter(
        (record) => record.review.runtimeStatus === "choice_conflict",
      ),
    ).toHaveLength(0);
    expect(
      batch11Records.filter((record) => record.choiceIdMapping.length > 0),
    ).toHaveLength(48);
    expect(
      batch11Records.filter(
        (record) => record.variantSpecificFeedbackRequired,
      ),
    ).toHaveLength(134);

    for (const externalId of [
      "2020-3B-Q62",
      "2020-3B-Q81",
      "2020-3B-Q97",
      "2020-4-Q02",
      "2020-4-Q37",
      "2020-4-Q53",
      "2020-4-Q89",
      "2020-4-Q91",
      "2021-1-Q27",
      "2021-1-Q30",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "hold",
        answer: "",
        explanation: "",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          review: {
            issueLabel: "필수 이미지 확인",
            publicationBlockers: ["required_source_image_review"],
          },
          migration: {
            mappingClass: "IMAGE_VERIFICATION_HOLD",
          },
        },
      });
    }

    const reassigned = runtime.variants.find(
      (variant) => variant.externalId === "2021-1-Q100",
    );
    expect(reassigned).toMatchObject({
      canonicalId: "U-1236",
      reviewState: "candidate",
      reviewed: {
        currentCanonicalId: "U-170",
        choiceIdMapping: [],
        variantSpecificFeedbackRequired: true,
        theoryLink: {
          lessonId: "lesson-10hvc85",
          lessonAnchor: "principle",
          conceptGroupId: "s1-g04",
          conceptId: "concept-10hvc85",
        },
        review: {
          publicationBlockers: [
            "pending_runtime_integration",
            "variant_specific_choice_contract_pending",
          ],
        },
        migration: {
          mappingClass: "SEMANTIC_REPLACE",
          canonicalAction: "REASSIGN_CANONICAL",
          theoryAction: "USE_TARGET_CANONICAL_DIRECT_THEORY",
        },
      },
    });

    const formulaHold = batch11Records.find(
      (record) => record.externalId === "2021-1-Q27",
    );
    expect(formulaHold?.formulaUnitSubstitution).toMatchObject({
      formula: "A=MTBF/(MTBF+MTTR)",
    });

    const batch = reviewedCbtVariantManifest.batches.find(
      (candidate) => candidate.batchId === "import-11",
    );
    expect(batch?.holdResolution.imageVerificationQueue).toHaveLength(10);
    expect(batch?.holdResolution.choiceConflictNonScoring).toEqual([]);
    expect(batch?.holdResolution.lowContextRegistered).toHaveLength(25);
    expect(batch?.theoryLessonAdditionIds).toEqual([]);
    expect(batch?.canonicalQuestionChangeIds).toEqual([]);
  });

  it("completes batch-12 and gates all final image, conflict, reassignment, and taxonomy cases", () => {
    const runtime = buildRuntimeContent(source);
    const batch12Records = reviewedCbtVariantManifest.records.slice(2162, 2384);

    expect(batch12Records).toHaveLength(222);
    expect(
      batch12Records.filter(
        (record) => record.review.runtimeStatus === "candidate",
      ),
    ).toHaveLength(210);
    expect(
      batch12Records.filter((record) => record.review.runtimeStatus === "hold"),
    ).toHaveLength(11);
    expect(
      batch12Records.filter(
        (record) => record.review.runtimeStatus === "choice_conflict",
      ),
    ).toHaveLength(1);
    expect(
      batch12Records.filter((record) => record.choiceIdMapping.length > 0),
    ).toHaveLength(45);
    expect(
      batch12Records.filter(
        (record) => record.variantSpecificFeedbackRequired,
      ),
    ).toHaveLength(165);

    for (const externalId of [
      "2021-2-Q01",
      "2021-2-Q06",
      "2021-2-Q27",
      "2021-2-Q97",
      "2021-4-Q05",
      "2022-1-Q75",
      "2022-1-Q80",
      "2022-2-Q13",
      "2022-2-Q14",
      "2022-2-Q22",
      "2022-2-Q27",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "hold",
        answer: "",
        explanation: "",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          review: {
            issueLabel: "필수 이미지 확인",
            publicationBlockers: ["required_source_image_review"],
          },
          migration: {
            mappingClass: "IMAGE_VERIFICATION_HOLD",
          },
        },
      });
    }

    const conflict = runtime.variants.find(
      (variant) => variant.externalId === "2021-2-Q13",
    );
    expect(conflict).toMatchObject({
      reviewState: "choice_conflict",
      answer: "",
      explanation: "",
      reviewed: {
        reviewedAnswerIndex: null,
        choiceIdMapping: [],
        review: {
          issueLabel: "선택지 충돌",
          publicationBlockers: ["choice_conflict_non_scoring"],
        },
        migration: {
          mappingClass: "CHOICE_CONFLICT_NON_SCORING",
        },
      },
    });

    const reassignmentExpectations = [
      ["2022-1-Q02", "U-812", "lesson-68po9a", "principle", "s4-g02"],
      ["2022-1-Q31", "U-829", "lesson-qih1ef", "principle", "s4-g08"],
      ["2022-1-Q43", "U-136", "lesson-o98wx8", "diagnosis", "s3-g06"],
      ["2022-1-Q70", "U-1180", "lesson-1mpu74e", "principle", "s1-g12"],
      ["2022-2-Q40", "U-640", "lesson-17ocpdn", "trap", "s4-g12"],
      ["2022-2-Q44", "U-661", "lesson-z6u1mg", "principle", "s3-g03"],
    ] as const;
    for (const [externalId, canonicalId, lessonId, lessonAnchor, conceptGroupId] of reassignmentExpectations) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        canonicalId,
        reviewState: "candidate",
        reviewed: {
          theoryLink: { lessonId, lessonAnchor, conceptGroupId },
          migration: {
            mappingClass: "SEMANTIC_REPLACE",
            canonicalAction: "REASSIGN_CANONICAL",
            theoryAction: "USE_TARGET_CANONICAL_DIRECT_THEORY",
          },
        },
      });
    }

    for (const [externalId, canonicalId, currentConceptGroupId, targetFamily, sourceBlocker] of [
      [
        "2022-1-Q61",
        "U-208",
        "s1-g08",
        "유압 유량·속도제어 계열",
        "direct_concept_group_taxonomy_mismatch_hydraulic_regeneration_in_pneumatic_group",
      ],
      [
        "2022-2-Q65",
        "U-250",
        "s1-g02",
        "공압 액추에이터·방향제어 계열",
        "direct_concept_group_taxonomy_mismatch_pneumatic_stopper_cylinder_in_hydraulic_group",
      ],
    ] as const) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        canonicalId,
        reviewState: "candidate",
        reviewed: {
          theoryLink: { conceptGroupId: currentConceptGroupId },
          review: {
            publicationBlockers: expect.arrayContaining([
              sourceBlocker,
              "canonical_theory_repair_exact_target_pending",
              "pending_runtime_integration",
            ]),
          },
          migration: {
            mappingClass: "THEORY_TAXONOMY_REPAIR_PENDING",
            canonicalAction:
              "PRESERVE_CURRENT_CANONICAL_PENDING_TAXONOMY_REPAIR",
            theoryAction:
              "PRESERVE_AUDIT_THEORY_PENDING_EXACT_TAXONOMY_TARGET",
            taxonomyRepair: {
              applied: false,
              currentConceptGroupId,
              targetConceptGroupId: null,
              sourceStatedTargetFamily: targetFamily,
            },
          },
        },
      });
    }

    const batch = reviewedCbtVariantManifest.batches.find(
      (candidate) => candidate.batchId === "import-12",
    );
    expect(batch?.holdResolution.imageVerificationQueue).toHaveLength(11);
    expect(batch?.holdResolution.choiceConflictNonScoring).toEqual([
      "2021-2-Q13",
    ]);
    expect(batch?.holdResolution.lowContextRegistered).toHaveLength(30);
    expect(batch?.theoryLessonAdditionIds).toEqual([]);
    expect(batch?.canonicalQuestionChangeIds).toEqual([]);

    expect(reviewedCbtVariantManifest.records).toHaveLength(2384);
    expect(
      runtime.variants.filter((variant) => variant.reviewState === "unreviewed"),
    ).toHaveLength(0);
  });

  it("applies batch 13 integration corrections without changing the 2384-record exact set", () => {
    const runtime = buildRuntimeContent(source);
    const batch = reviewedCbtVariantManifest.batches.find(
      (candidate) => candidate.batchId === "import-13",
    );

    expect(batch).toMatchObject({
      recordCount: 0,
      candidateCount: 0,
      choiceConflictCount: 0,
      holdCount: 0,
      canonicalTheoryRepairs: ["lesson-qnsesu:s1-g06"],
    });
    expect(reviewedCbtVariantManifest.records).toHaveLength(2384);

    for (const [externalId, lessonId, conceptGroupId] of [
      [
        "2015-2-Q23",
        "lesson-cbt-gang-system-process-layout",
        "s4-g10",
      ],
      ["2007-4-Q84", "lesson-qnsesu", "s1-g06"],
    ] as const) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "candidate",
        reviewed: {
          theoryLink: { lessonId, conceptGroupId },
          migration: { canonicalAction: "APPLY_CANONICAL_OVERLAY" },
        },
      });
    }

    for (const externalId of [
      "2018-2-Q10",
      "2019-2-Q32",
      "2019-2-Q86",
      "2020-12B-Q92",
      "2021-2-Q13",
    ]) {
      const variant = runtime.variants.find(
        (candidate) => candidate.externalId === externalId,
      );
      expect(variant).toMatchObject({
        reviewState: "choice_conflict",
        reviewed: {
          reviewedAnswerIndex: null,
          choiceIdMapping: [],
          review: {
            scoringDisposition: "non_scoring_choice_conflict",
            issueLabel: "선택지 충돌",
          },
          choiceConflict: {
            label: "선택지 충돌",
            scoringPolicy: "non_scoring",
          },
        },
      });
      expect(variant?.reviewed?.directSolution.startsWith("선택지 충돌:")).toBe(
        true,
      );
    }

    const answerKeyHold = runtime.variants.find(
      (variant) => variant.externalId === "2020-3B-Q28",
    );
    expect(answerKeyHold).toMatchObject({
      reviewState: "hold",
      reviewed: {
        reviewedAnswerIndex: null,
        choiceIdMapping: [],
        review: {
          issueLabel: "정답키 충돌",
          scoringDisposition: "excluded_answer_key_conflict",
        },
        migration: { mappingClass: "ANSWER_KEY_CONFLICT_HOLD" },
      },
    });

    const taxonomyRepairedQuestion = runtime.questions.find(
      (candidate) => candidate.id === "U-478",
    );
    const taxonomyRepairedLesson = runtime.lessons.find(
      (candidate) => candidate.id === "lesson-qnsesu",
    );
    expect(taxonomyRepairedQuestion?.conceptGroupId).toBe("s1-g06");
    expect(taxonomyRepairedLesson?.conceptGroupId).toBe("s1-g06");

    for (const canonicalId of ["U-1161", "U-1166", "U-1089"]) {
      const question = runtime.questions.find(
        (candidate) => candidate.id === canonicalId,
      );
      const lesson = runtime.lessons.find(
        (candidate) => candidate.id === question?.lessonId,
      );
      expect(question?.audit?.auditDisposition).toBe(
        "held_answer_conflict",
      );
      expect(question?.contentStatus).toBe("in_review");
      expect(question?.publication).toMatchObject({
        readiness: "blocked",
        blockers: expect.arrayContaining(["answer_conflict"]),
      });
      expect(lesson?.contentStatus).toBe("in_review");
      expect(lesson?.publication?.readiness).toBe("blocked");
    }
  });

  it("does not let variant-specific choice contracts fall back to canonical text matching", () => {
    const runtime = buildRuntimeContent(source);
    const batch02CandidateRecord = reviewedCbtVariantManifest.records
      .slice(200, 400)
      .find(
        (record) =>
          record.review.runtimeStatus === "candidate" &&
          record.variantSpecificFeedbackRequired,
      );
    const candidate = runtime.variants.find(
      (variant) => variant.externalId === batch02CandidateRecord?.externalId,
    );
    const question = runtime.questions.find(
      (item) => item.id === candidate?.canonicalId,
    );

    expect(candidate).toBeDefined();
    expect(question).toBeDefined();
    expect(candidate?.reviewed?.choiceIdMapping).toEqual([]);
    expect(candidate?.reviewed?.review.publicationBlockers).toContain(
      "variant_specific_choice_contract_pending",
    );
    expect(
      isSafeOriginalPracticeVariant(question!, {
        ...candidate!,
        reviewState: "published",
      }),
    ).toBe(false);

    const targetExternalId = candidate!.externalId;
    const records = reviewedCbtVariantManifest.records.map((record) =>
      record.externalId === targetExternalId
        ? {
            ...record,
            review: {
              ...record.review,
              runtimeStatus: "published" as const,
              publicationBlockers: [],
            },
          }
        : record,
    );
    const manifest = {
      ...reviewedCbtVariantManifest,
      batches: reviewedCbtVariantManifest.batches.map((batch) =>
        batch.batchId === "import-02"
          ? { ...batch, candidateCount: batch.candidateCount - 1 }
          : batch,
      ),
      recordsSha256: createHash("sha256")
        .update(JSON.stringify(records), "utf8")
        .digest("hex"),
      records,
    };
    expect(() => validateReviewedCbtVariantManifest(source, manifest)).toThrow(
      /variant-specific choice contract/,
    );
  });

});
