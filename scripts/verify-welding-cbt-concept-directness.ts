import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import generatedContent from "@/data/generated/content.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import { isIndependentlyAcceptedWeldingCbtQuestion } from "@/data/source/welding-cbt-independent-review-gates";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent } from "@/lib/domain/types";

const MIN_ASSERTION_CHARACTERS = 24;
const MIN_ASSERTION_TOKENS = 4;
const GENERIC_ASSERTION_TOKENS = new Set([
  "용접",
  "문제",
  "선택지",
  "정답",
  "개념",
  "중요",
  "확인",
  "관련",
  "조건",
]);
const GENERIC_ASSERTION_PATTERNS = [
  "용접은 안전을 확인하는 중요한 작업",
  "정답과 관련된 개념",
  "문제의 조건을 확인",
];

type EvidenceRef = { kind: string; ref: string };

export type WeldingCbtConceptDirectnessInput = {
  canonicalId: string;
  assessmentKind: string;
  lessonId: string;
  lessonAnchor: string;
  correctChoiceText: string;
  conceptBinding: {
    lessonId: string;
    lessonBlockId: string;
    assertionText: string;
    evidenceRefs: readonly EvidenceRef[];
  };
};

export type WeldingCbtConceptDirectnessLesson = {
  id: string;
  blocks: ReadonlyArray<{ id: string; body: string }>;
};

type DirectnessIssue = {
  canonicalId: string;
  code: string;
  detail: string;
};

function normalize(value: string) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

function assertionTokens(value: string) {
  return normalize(value).match(/[\p{L}\p{N}]+/gu) ?? [];
}

function meaningfulTokens(value: string) {
  return assertionTokens(value).filter(
    (token) => token.length >= 2 && !GENERIC_ASSERTION_TOKENS.has(token),
  );
}

function hasQuantitativeSignal(value: string) {
  return /\d|[=×÷^²]|\b[A-Za-z]\b|[ηΩ]/u.test(value);
}

function hasSufficientClaimDetail(assertionText: string) {
  // This intentionally does not use a matching answer word as proof of meaning.
  // Korean inflection makes that both unreliable and too easy to game. Instead,
  // a structurally anchored assertion must carry several non-generic claim terms; a
  // reviewer remains responsible for the semantic entailment itself.
  const assertion = normalize(assertionText);
  return !GENERIC_ASSERTION_PATTERNS.some((pattern) => assertion.includes(pattern))
    && new Set(meaningfulTokens(assertion)).size >= 4;
}

/**
 * Checks mechanically demonstrable evidence and retains non-blocking signals
 * for independently reviewed numeric-choice questions. A generic assertion
 * remains blocking even when its lesson and block references are structurally
 * valid.
 */
export function evaluateWeldingCbtConceptDirectness(
  inputs: readonly WeldingCbtConceptDirectnessInput[],
  lessons: readonly WeldingCbtConceptDirectnessLesson[],
) {
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const errors: DirectnessIssue[] = [];
  const manualReview: DirectnessIssue[] = [];

  for (const input of inputs) {
    const binding = input.conceptBinding;
    const lesson = lessonById.get(binding.lessonId);
    const block = lesson?.blocks.find((candidate) =>
      candidate.id === binding.lessonBlockId
    );
    const addError = (code: string, detail: string) =>
      errors.push({ canonicalId: input.canonicalId, code, detail });
    const addManualReview = (code: string, detail: string) =>
      manualReview.push({ canonicalId: input.canonicalId, code, detail });

    if (!lesson) {
      addError("LESSON_NOT_FOUND", binding.lessonId);
      continue;
    }
    if (!block) {
      addError("LESSON_BLOCK_NOT_FOUND", `${binding.lessonId}#${binding.lessonBlockId}`);
      continue;
    }
    if (
      input.lessonId !== binding.lessonId
      || input.lessonAnchor !== binding.lessonBlockId
    ) {
      addError(
        "RUNTIME_ANCHOR_MISMATCH",
        `runtime=${input.lessonId}#${input.lessonAnchor} binding=${binding.lessonId}#${binding.lessonBlockId}`,
      );
    }
    if (!binding.evidenceRefs.some((reference) =>
      reference.kind === "lesson_block"
      && reference.ref === `${binding.lessonId}#${binding.lessonBlockId}`
    )) {
      addError("LESSON_BLOCK_EVIDENCE_MISSING", `${binding.lessonId}#${binding.lessonBlockId}`);
    }
    const assertion = normalize(binding.assertionText);
    if (
      assertion.length < MIN_ASSERTION_CHARACTERS
      || assertionTokens(assertion).length < MIN_ASSERTION_TOKENS
    ) {
      addError(
        "ASSERTION_TOO_THIN",
        `characters=${assertion.length} tokens=${assertionTokens(assertion).length}`,
      );
    }
    if (input.assessmentKind === "calculation") {
      if (!hasQuantitativeSignal(assertion)) {
        addError("CALCULATION_ASSERTION_MISSING_FORMULA_OR_QUANTITY", assertion);
      }
      if (!binding.evidenceRefs.some((reference) =>
        reference.kind === "calculation_derivation" && reference.ref.trim().length > 0
      )) {
        addError("CALCULATION_DERIVATION_MISSING", input.canonicalId);
      }
    } else if (
      hasQuantitativeSignal(input.correctChoiceText)
      && !hasQuantitativeSignal(assertion)
    ) {
      addManualReview(
        "NUMERIC_CONDITION_NOT_PROVABLE",
        "correct choice is quantitative but the anchored assertion is not",
      );
    }
    if (!hasSufficientClaimDetail(assertion)) {
      addManualReview(
        "DIRECT_JUDGMENT_NOT_MACHINE_PROVABLE",
        "the anchor is real, but its assertion lacks enough non-generic claim detail for a direct judgment basis",
      );
    }
  }

  const hasBlockingManualReview = manualReview.some(
    (issue) => issue.code === "DIRECT_JUDGMENT_NOT_MACHINE_PROVABLE",
  );
  return {
    ok: errors.length === 0 && !hasBlockingManualReview,
    checkedCount: inputs.length,
    errors,
    manualReview,
  };
}

export function verifyWeldingCbtConceptDirectness() {
  const runtimeContent = buildRuntimeContent(generatedContent as GeneratedContent);
  const runtimeQuestionById = new Map(
    runtimeContent.questions
      .filter((question) => question.id.startsWith("wcbt-") && question.publication?.readiness === "ready")
      .map((question) => [question.id, question]),
  );
  const answerReviewApproved = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
    isWeldingCbtAnswerReviewPublishable,
  );
  const approvedReviews = answerReviewApproved.filter((review) =>
    isIndependentlyAcceptedWeldingCbtQuestion(review.canonicalId)
  );
  const missingRuntime: DirectnessIssue[] = [];
  const inputs = approvedReviews.flatMap((review) => {
    const question = runtimeQuestionById.get(review.canonicalId);
    if (!question) {
      missingRuntime.push({
        canonicalId: review.canonicalId,
        code: "APPROVED_RUNTIME_QUESTION_MISSING",
        detail: "no publication-ready runtime question",
      });
      return [];
    }
    const correctChoice = question.choices.find(
      (choice) => choice.id === question.correctChoiceId,
    );
    if (!correctChoice) {
      missingRuntime.push({
        canonicalId: review.canonicalId,
        code: "RUNTIME_CORRECT_CHOICE_MISSING",
        detail: question.correctChoiceId,
      });
      return [];
    }
    return [{
      canonicalId: review.canonicalId,
      assessmentKind: review.assessmentKind,
      lessonId: question.lessonId,
      lessonAnchor: question.lessonAnchor,
      correctChoiceText: correctChoice.text,
      conceptBinding: review.conceptBinding,
    }];
  });
  const evaluation = evaluateWeldingCbtConceptDirectness(inputs, runtimeContent.lessons);
  return {
    ...evaluation,
    answerReviewApprovedCount: answerReviewApproved.length,
    approvedReviewCount: approvedReviews.length,
    publicationReadyQuestionCount: runtimeQuestionById.size,
    errors: [...missingRuntime, ...evaluation.errors],
    ok: missingRuntime.length === 0 && evaluation.ok,
  };
}

function main() {
  const report = verifyWeldingCbtConceptDirectness();
  if (!report.ok) {
    throw new Error(
      `WELDING_CBT_CONCEPT_DIRECTNESS_FAILED\n${[
        ...report.errors.map((issue) => `error:${issue.canonicalId}:${issue.code}:${issue.detail}`),
        ...report.manualReview.map((issue) => `manual-review:${issue.canonicalId}:${issue.code}:${issue.detail}`),
      ].join("\n")}`,
    );
  }
  console.log(
    `WELDING_CBT_CONCEPT_DIRECTNESS_OK answerReviewApproved=${report.answerReviewApprovedCount} independentlyAccepted=${report.approvedReviewCount} publicationReady=${report.publicationReadyQuestionCount} nonBlockingManualReview=${report.manualReview.length}`,
  );
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (entryPath && entryPath === resolve(fileURLToPath(import.meta.url))) {
  main();
}
