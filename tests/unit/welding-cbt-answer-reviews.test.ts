import { describe, expect, it } from "vitest";

import generatedContent from "@/data/generated/content.json";
import weldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import {
  WELDING_CBT_ANSWER_REVIEW_PART_COUNT,
  WELDING_CBT_ANSWER_REVIEWS,
  getWeldingCbtAnswerReview,
  isWeldingCbtAnswerReviewPublishable,
  validateWeldingCbtAnswerReviewQuality,
  validateWeldingCbtAnswerReviews,
  type WeldingCbtAnswerReviewEntry,
} from "@/data/source/welding-cbt-answer-review";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";
import { getWeldingCbtProjectionCandidates } from "@/lib/content/welding-cbt-approved";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { gradeQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const UNSUPPORTED_ACETYLENE_CALCULATION_ID =
  "wcbt-50ea9e7d-008c-45e1-a35c-21ad26b026cc";
const content = buildRuntimeContent(generatedContent as GeneratedContent);
const weldingQuestions = content.questions.filter((question) =>
  question.id.startsWith("wcbt-"),
);
const weldingVariants = content.variants.filter((variant) =>
  variant.canonicalId.startsWith("wcbt-"),
);

function makeSpecificApprovedFixture(): WeldingCbtAnswerReviewEntry {
  const pending = WELDING_CBT_ANSWER_REVIEWS.entries[0];
  const projection = WELDING_CBT_LESSON_PROJECTION.entries.find(
    (entry) => entry.canonicalId === pending.canonicalId,
  );
  const candidate = getWeldingCbtProjectionCandidates().find(
    (entry) => entry.canonicalId === pending.canonicalId,
  );
  const source = weldingCbtBank.records.find(
    (entry) =>
      entry.canonicalId === pending.canonicalId
      && entry.canonicalFingerprint === pending.contentDigest
      && entry.correctIndex !== null,
  );
  const lesson = content.lessons.find(
    (entry) => entry.id === projection?.primaryLeafLessonId,
  );
  const block = lesson?.blocks.find((entry) => entry.kind === "principle");
  if (
    !projection?.primaryLeafLessonId
    || !candidate
    || !source
    || source.correctIndex === null
    || !lesson
    || !block
  ) {
    throw new Error("구조 fixture의 실제 문항·레슨 블록을 찾을 수 없습니다.");
  }
  const correctChoice = candidate.choices[source.correctIndex];

  return {
    ...pending,
    authoringDisposition: "publish_candidate",
    reviewStatus: "approved",
    primaryLeafLessonId: projection.primaryLeafLessonId,
    conceptBinding: {
      lessonId: lesson.id,
      lessonBlockId: block.id,
      assertionText: block.body,
      evidenceRefs: [
        { kind: "lesson_block", ref: `${lesson.id}#${block.id}` },
        { kind: "source_question", ref: candidate.canonicalId },
      ],
    },
    answerExplanation:
      `${candidate.stem}에서 요구한 조건을 레슨 근거와 대조하면 `
      + `${correctChoice} 선택지가 직접 판단 기준을 충족합니다. ${block.body}`,
    solutionSteps: [
      `${candidate.stem}의 대상과 긍정형·부정형 여부를 먼저 확인합니다.`,
      `${block.title} 블록의 직접 판단 기준을 네 선택지에 각각 적용합니다.`,
      `${correctChoice} 선택지만 그 기준을 충족하는지 다른 보기와 비교합니다.`,
    ],
    keyRule:
      `${block.title}의 핵심 판단 기준은 선택지의 용어가 아니라 `
      + `실제 적용 조건입니다. ${block.body}`,
    choiceFeedback: candidate.choices.map((choice, choiceIndex) => ({
      choiceIndex,
      relation: choiceIndex === source.correctIndex ? "supports" : "refuted_by",
      rationale:
        choiceIndex === source.correctIndex
          ? `${choice} 선택지는 ${block.title}의 직접 판단 기준을 충족합니다. ${block.body}`
          : `${choice} 선택지는 ${block.title}의 적용 조건과 일치하지 않습니다. ${block.body}`,
      plausibleReason:
        `${choice}라는 용어가 지문과 같은 분야에 있어 먼저 떠올리기 쉽습니다.`,
      incorrectPoint:
        choiceIndex === source.correctIndex
          ? null
          : `${choice} 보기의 조건은 ${block.title} 블록이 제시한 구분 기준을 충족하지 못합니다.`,
      keyRule:
        `${choice} 보기는 고유한 적용 조건을 확인해야 하며, `
        + `${block.title}의 기준인 ${block.body}를 적용합니다.`,
      differenceFromCorrect:
        choiceIndex === source.correctIndex
          ? null
          : `${correctChoice} 보기는 직접 기준을 충족하지만 ${choice} 보기는 다른 조건을 가리킵니다.`,
    })),
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: "contract-fixture-author",
    authoredAt: "2026-08-02T00:00:00.000Z",
    reviewer: "contract-fixture-reviewer",
    reviewedAt: "2026-08-02T00:00:00.000Z",
  };
}

describe("welding CBT answer-review structure contract", () => {
  it("covers the 525-question candidate exact-set with matching content digests", () => {
    const candidates = getWeldingCbtProjectionCandidates();
    const candidateDigestById = new Map(
      candidates.map((candidate) => [
        candidate.canonicalId,
        candidate.contentDigest,
      ]),
    );

    expect(WELDING_CBT_ANSWER_REVIEWS.entries).toHaveLength(525);
    expect(
      WELDING_CBT_ANSWER_REVIEWS.entries
        .map((entry) => entry.canonicalId)
        .sort(),
    ).toEqual(candidates.map((candidate) => candidate.canonicalId).sort());
    expect(
      WELDING_CBT_ANSWER_REVIEWS.entries.flatMap((entry) =>
        candidateDigestById.get(entry.canonicalId) === entry.contentDigest
          ? []
          : [entry.canonicalId],
      ),
    ).toEqual([]);
  });

  it("has all 19 non-overlapping partitions and no structural validation errors", () => {
    const validation = validateWeldingCbtAnswerReviews();

    expect(WELDING_CBT_ANSWER_REVIEW_PART_COUNT).toBe(19);
    expect(validation.errors).toEqual([]);
  });

  it("fails closed for structural lesson mismatches while allowing a reviewed paraphrase", () => {
    const fixture = makeSpecificApprovedFixture();
    const otherLesson = content.lessons.find(
      (lesson) =>
        lesson.id.startsWith("lesson-welding-")
        && lesson.id !== fixture.conceptBinding?.lessonId,
    );
    const otherAssertion = otherLesson?.blocks.find(
      (block) => block.kind === "principle",
    )?.body;
    if (!fixture.conceptBinding || !otherLesson || !otherAssertion) {
      throw new Error("오염 fixture에 사용할 다른 레슨 근거를 찾을 수 없습니다.");
    }

    const results = {
      lesson: isWeldingCbtAnswerReviewPublishable({
        ...fixture,
        conceptBinding: {
          ...fixture.conceptBinding,
          lessonId: otherLesson.id,
        },
      }),
      block: isWeldingCbtAnswerReviewPublishable({
        ...fixture,
        conceptBinding: {
          ...fixture.conceptBinding,
          lessonBlockId: "missing-reviewed-block",
        },
      }),
      assertion: isWeldingCbtAnswerReviewPublishable({
        ...fixture,
        conceptBinding: {
          ...fixture.conceptBinding,
          assertionText: otherAssertion,
        },
      }),
    };

    expect(results).toEqual({
      lesson: false,
      block: false,
      assertion: true,
    });
    expect(
      validateWeldingCbtAnswerReviewQuality({
        ...fixture,
        conceptBinding: {
          ...fixture.conceptBinding,
          assertionText: otherAssertion,
        },
      }).map((error) => error.code),
    ).not.toContain("ANSWER_REVIEW_CONCEPT_ASSERTION_MISMATCH");
  });

  it("rejects normalized duplicate rationale, incorrect point, and key rule across wrong choices", () => {
    const fixture = makeSpecificApprovedFixture();
    if (!fixture.choiceFeedback) {
      throw new Error("선택지 피드백 fixture를 만들 수 없습니다.");
    }
    const wrongIndices = fixture.choiceFeedback
      .filter((feedback) => feedback.relation !== "supports")
      .slice(0, 2)
      .map((feedback) => feedback.choiceIndex);

    for (const field of ["rationale", "incorrectPoint", "keyRule"] as const) {
      const duplicateSentence =
        "이 선택지는 해당 보기만의 조건을 설명하지 않는 재사용 문장입니다.";
      const duplicated = fixture.choiceFeedback.map((feedback) => {
        if (!wrongIndices.includes(feedback.choiceIndex)) return feedback;
        return {
          ...feedback,
          [field]:
            feedback.choiceIndex === wrongIndices[0]
              ? duplicateSentence
              : ` ${duplicateSentence.replace(/\.$/u, "")}! `,
        };
      });
      const errors = validateWeldingCbtAnswerReviewQuality({
        ...fixture,
        choiceFeedback: duplicated,
      });

      expect(
        errors.some(
          (error) =>
            error.code === "ANSWER_REVIEW_CHOICE_FEEDBACK_REUSED"
            && error.detail.startsWith(field),
        ),
        field,
      ).toBe(true);
      expect(
        isWeldingCbtAnswerReviewPublishable({
          ...fixture,
          choiceFeedback: duplicated,
        }),
        field,
      ).toBe(false);
    }
  });

  it("rejects an incomplete choice exact-set and feedback copied from its choice text", () => {
    const fixture = makeSpecificApprovedFixture();
    const source = weldingCbtBank.records.find(
      (entry) =>
        entry.canonicalId === fixture.canonicalId
        && entry.canonicalFingerprint === fixture.contentDigest
        && entry.correctIndex !== null,
    );
    const wrongFeedback = fixture.choiceFeedback?.find(
      (feedback) => feedback.relation !== "supports",
    );
    if (
      !source
      || !fixture.choiceFeedback
      || !wrongFeedback
    ) {
      throw new Error("선택지 구체성 fixture를 만들 수 없습니다.");
    }
    const incompleteErrors = validateWeldingCbtAnswerReviewQuality({
      ...fixture,
      choiceFeedback: fixture.choiceFeedback.slice(0, 3),
    });
    const copiedChoiceErrors = validateWeldingCbtAnswerReviewQuality({
      ...fixture,
      choiceFeedback: fixture.choiceFeedback.map((feedback) =>
        feedback.choiceIndex === wrongFeedback.choiceIndex
          ? {
              ...feedback,
              rationale: source.choices[feedback.choiceIndex],
            }
          : feedback
      ),
    });

    expect(incompleteErrors.map((error) => error.code)).toContain(
      "ANSWER_REVIEW_CHOICE_FEEDBACK_EXACT_SET",
    );
    expect(copiedChoiceErrors.map((error) => error.code)).toContain(
      "ANSWER_REVIEW_CHOICE_FEEDBACK_NOT_SPECIFIC",
    );
  });

  it("rejects answer columns that only restate the correct choice or reuse boilerplate", () => {
    const fixture = makeSpecificApprovedFixture();
    const source = weldingCbtBank.records.find(
      (entry) =>
        entry.canonicalId === fixture.canonicalId
        && entry.canonicalFingerprint === fixture.contentDigest
        && entry.correctIndex !== null,
    );
    if (!source || source.correctIndex === null) {
      throw new Error("정답 반복 fixture의 원문 정답을 찾을 수 없습니다.");
    }
    const correctChoice = source.choices[source.correctIndex];
    const restatement = {
      ...fixture,
      answerExplanation: `정답은 ${correctChoice}입니다.`,
      keyRule: `바로 ${correctChoice}입니다.`,
      solutionSteps: [`따라서 ${correctChoice}입니다.`],
    };
    const boilerplate = {
      ...fixture,
      answerExplanation:
        "정답의 판단 기준과 일치합니다. 보기의 용어를 다시 확인합니다.",
    };
    const reusedAnswerContent = {
      ...fixture,
      keyRule: fixture.answerExplanation,
    };

    expect(
      validateWeldingCbtAnswerReviewQuality(restatement).map(
        (error) => error.code,
      ),
    ).toContain("ANSWER_REVIEW_ANSWER_RESTATEMENT");
    expect(
      validateWeldingCbtAnswerReviewQuality(boilerplate).map(
        (error) => error.code,
      ),
    ).toContain("ANSWER_REVIEW_GENERIC_FILLER");
    expect(
      validateWeldingCbtAnswerReviewQuality(reusedAnswerContent).map(
        (error) => error.code,
      ),
    ).toContain("ANSWER_REVIEW_ANSWER_CONTENT_REUSED");
    expect(isWeldingCbtAnswerReviewPublishable(restatement)).toBe(false);
    expect(isWeldingCbtAnswerReviewPublishable(boilerplate)).toBe(false);
    expect(isWeldingCbtAnswerReviewPublishable(reusedAnswerContent)).toBe(false);
  });

  it("requires official evidence for safety and derivation evidence for calculations", () => {
    const fixture = makeSpecificApprovedFixture();
    if (!fixture.conceptBinding) {
      throw new Error("근거 fixture를 만들 수 없습니다.");
    }
    const withoutSpecializedEvidence = {
      ...fixture,
      conceptBinding: {
        ...fixture.conceptBinding,
        evidenceRefs: fixture.conceptBinding.evidenceRefs.filter(
          (evidence) =>
            evidence.kind !== "official_source"
            && evidence.kind !== "calculation_derivation",
        ),
      },
    };

    expect(
      validateWeldingCbtAnswerReviewQuality({
        ...withoutSpecializedEvidence,
        assessmentKind: "safety",
      }).map((error) => error.code),
    ).toContain("ANSWER_REVIEW_OFFICIAL_SOURCE_REQUIRED");
    expect(
      validateWeldingCbtAnswerReviewQuality({
        ...withoutSpecializedEvidence,
        assessmentKind: "calculation",
      }).map((error) => error.code),
    ).toContain("ANSWER_REVIEW_CALCULATION_EVIDENCE_REQUIRED");
  });

  it("rejects a publish candidate whose authored Korean was corrupted", () => {
    const fixture = makeSpecificApprovedFixture();

    expect(
      isWeldingCbtAnswerReviewPublishable({
        ...fixture,
        answerExplanation: `${fixture.answerExplanation} ?⑹젒`,
      }),
    ).toBe(false);
  });
});

describe("welding CBT answer-review data completion gate", () => {
  it("accounts for all 525 rows as approved or held with no pending review", () => {
    const validation = validateWeldingCbtAnswerReviews();

    expect(validation.pendingCount).toBe(0);
    expect(validation.entryCount).toBe(525);
    expect(validation.approvedCount + validation.holdCount).toBe(525);
    expect(validation.approvedCount).toBeGreaterThan(0);
    expect(validation.errors).toEqual([]);
  });

  it("keeps authored explanations and every choice's feedback unique", () => {
    const approved = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
      isWeldingCbtAnswerReviewPublishable,
    );

    expect(approved.length).toBeGreaterThan(0);
    for (const entry of approved) {
      expect(entry.answerExplanation.trim().length, entry.canonicalId).toBeGreaterThan(0);
      expect(entry.solutionSteps.length, entry.canonicalId).toBeGreaterThan(0);
      expect(entry.keyRule.trim().length, entry.canonicalId).toBeGreaterThan(0);
      expect(entry.choiceFeedback.length, entry.canonicalId).toBe(4);
      expect(
        new Set(
          entry.choiceFeedback.map(
            ({ choiceIndex: _choiceIndex, relation: _relation, ...feedback }) => {
              void _choiceIndex;
              void _relation;
              return JSON.stringify(feedback);
            },
          ),
        ).size,
        entry.canonicalId,
      ).toBe(entry.choiceFeedback.length);
    }
  });

  it("publishes the independently reviewed 905 L/kg exam calculation", () => {
    const review = getWeldingCbtAnswerReview(
      UNSUPPORTED_ACETYLENE_CALCULATION_ID,
    );

    expect(review).toBeDefined();
    expect(review?.reviewStatus).toBe("approved");
    expect(review?.assessmentKind).toBe("calculation");
    expect(review?.answerExplanation).toContain("2715");
    expect(review?.solutionSteps).toEqual(
      expect.arrayContaining([
        expect.stringContaining("27-24"),
        expect.stringContaining("905L/kg"),
        expect.stringContaining("2715"),
      ]),
    );
    expect(JSON.stringify(review)).toContain("905");
    expect(
      weldingQuestions.some(
        (question) => question.id === UNSUPPORTED_ACETYLENE_CALCULATION_ID,
      ),
    ).toBe(true);
    expect(
      weldingVariants.some(
        (variant) =>
          variant.canonicalId === UNSUPPORTED_ACETYLENE_CALCULATION_ID,
      ),
    ).toBe(true);
  });
});

describe("welding CBT practice payload and post-submit feedback", () => {
  it("omits answer-signaling review fields from every pre-submit session question", () => {
    const sessionQuestions = createPracticePresentations(
      weldingQuestions,
      weldingVariants,
      100,
      20260802,
      true,
    );
    const payload = JSON.stringify(sessionQuestions);

    for (const forbiddenField of [
      "correctChoiceId",
      "answerText",
      "answerExplanation",
      "solutionSteps",
      "choiceFeedback",
      "feedback",
      "keyRule",
      "conceptBinding",
      "assertionText",
      "essentialRank",
    ]) {
      expect(payload).not.toContain(`"${forbiddenField}"`);
    }
  });

  it("returns the authored choice feedback and exact bound lesson block after submission", () => {
    for (const question of weldingQuestions) {
      const review = getWeldingCbtAnswerReview(question.id);
      const lesson = content.lessons.find(
        (candidate) => candidate.id === question.lessonId,
      );

      expect(review).toBeDefined();
      expect(lesson).toBeDefined();
      if (
        !review
        || !isWeldingCbtAnswerReviewPublishable(review)
        || !lesson
      ) {
        continue;
      }

      const feedback = gradeQuestion(
        question,
        question.choices[0].id,
        "unsure",
        lesson,
      );
      const returnedFeedbackByChoiceId = new Map(
        [feedback.selectedChoice, ...feedback.otherChoices].map((choice) => [
          choice.id,
          choice,
        ]),
      );
      const selectedAuthoredFeedback = review.choiceFeedback.find(
        (choice) => choice.choiceIndex === 0,
      );

      expect(feedback.explanation).toBe(question.explanation);
      expect(feedback.lesson.anchor).toBe(
        review.conceptBinding.lessonBlockId,
      );
      expect(feedback.conceptSupport).toBeNull();
      expect(feedback.approvedReview?.conceptBinding).toEqual(
        question.approvedReview?.conceptBinding,
      );
      expect(feedback.approvedReview?.selectedChoiceReason).toBe(
        selectedAuthoredFeedback?.rationale,
      );
      for (const authored of review.choiceFeedback) {
        const choice = question.choices[authored.choiceIndex];
        const { choiceIndex: _choiceIndex, relation: _relation, ...expected } =
          authored;
        void _choiceIndex;
        void _relation;
        expect(returnedFeedbackByChoiceId.get(choice.id)).toEqual(
          expect.objectContaining(expected),
        );
      }
    }
  });
});
