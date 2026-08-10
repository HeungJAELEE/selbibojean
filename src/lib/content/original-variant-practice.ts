import type {
  GeneratedContent,
  Lesson,
  PracticeFeedback,
  PublicQuestion,
  Question,
  SelfRating,
} from "@/lib/domain/types";
import { orderPracticeChoices } from "@/lib/content/practice-choice-order";
import { toPublicQuestion } from "@/lib/domain/practice";

type Variant = GeneratedContent["variants"][number];

const CIRCLED_CHOICES = ["①", "②", "③", "④", "⑤"];

export type OriginalVariantPracticeErrorCode =
  | "ORIGINAL_VARIANT_NOT_PUBLISHABLE"
  | "ORIGINAL_VARIANT_CHOICE_INVALID";

export class OriginalVariantPracticeError extends Error {
  readonly code: OriginalVariantPracticeErrorCode;
  readonly externalId: string;

  constructor(
    code: OriginalVariantPracticeErrorCode,
    externalId: string,
    message: string,
  ) {
    super(`${code}:${externalId}:${message}`);
    this.name = "OriginalVariantPracticeError";
    this.code = code;
    this.externalId = externalId;
  }
}

export function isReviewedExactOriginalVariant(
  variant: Variant,
): variant is Variant & {
  year: number;
  sourceFidelity: "exact" | "normalized_exact";
  sourceReview: NonNullable<Variant["sourceReview"]>;
} {
  const review = variant.sourceReview;
  const normalizedChoices = variant.choices.map(normalizeText);
  const choicesAreComplete =
    variant.choices.length >= 2
    && variant.choices.every((choice) => choice.trim().length > 0)
    && normalizedChoices.every(Boolean)
    && new Set(normalizedChoices).size === normalizedChoices.length;
  const answerIndex = choicesAreComplete
    ? parseOriginalVariantAnswerIndex(variant)
    : -1;
  return Boolean(
    variant.year
      && (variant.sourceFidelity === "exact"
        || variant.sourceFidelity === "normalized_exact")
      && review
      && review.answerConfidence === "confirmed"
      && review.answerConflictOrMultipleAnswerRisk === null
      && review.directSolution.trim()
      && review.theorySupplement.trim()
      && choicesAreComplete
      && review.choiceByChoiceReasons.length === variant.choices.length
      && review.choiceByChoiceReasons.every((reason) => reason.trim())
      && review.imageRequirement === "none"
      && answerIndex >= 0
      && answerIndex < variant.choices.length,
  );
}

export function toReviewedOriginalPublicQuestion(
  question: Question,
  variant: Variant,
  seed: number,
  shuffleChoices: boolean,
): PublicQuestion {
  if (!isReviewedExactOriginalVariant(variant)) {
    throw new OriginalVariantPracticeError(
      "ORIGINAL_VARIANT_NOT_PUBLISHABLE",
      variant.externalId,
      "검토가 완료되지 않은 원문 문항입니다.",
    );
  }

  const publicQuestion = toPublicQuestion(question);
  const shouldShuffle =
    shuffleChoices
    && (variant.shufflePolicy ?? question.shufflePolicy ?? "all") === "all";
  const sourceChoices = variant.choices.map((text, index) => ({
    id: getOriginalVariantChoiceId(variant.externalId, index),
    order: index + 1,
    text: text.trim(),
  }));
  const choices = orderPracticeChoices(
    sourceChoices,
    seed,
    variant.externalId,
    shouldShuffle,
  ).map((choice, index) => ({ ...choice, order: index + 1 }));

  return {
    ...publicQuestion,
    stem: variant.stem.trim(),
    choices,
    sourceLabel: variant.sourceUrl,
    provenance: {
      submissionMode: "variant",
      reconstructed: false,
      historical: publicQuestion.provenance.historical,
      original: true,
      exam: {
        externalId: variant.externalId,
        year: variant.year,
        sessionLabel: variant.sessionLabel,
        questionNumber: variant.questionNumber,
        sourceUrl: variant.sourceUrl,
      },
    },
  };
}

export function gradeReviewedOriginalVariant(
  question: Question,
  variant: Variant,
  choiceId: string,
  selfRating: SelfRating,
  lesson?: Lesson,
): PracticeFeedback {
  if (!isReviewedExactOriginalVariant(variant)) {
    throw new OriginalVariantPracticeError(
      "ORIGINAL_VARIANT_NOT_PUBLISHABLE",
      variant.externalId,
      "검토가 완료되지 않은 원문 문항입니다.",
    );
  }

  const selectedIndex = parseOriginalVariantChoiceId(
    variant.externalId,
    choiceId,
  );
  const correctIndex = parseOriginalVariantAnswerIndex(variant);
  if (
    selectedIndex < 0
    || selectedIndex >= variant.choices.length
    || correctIndex < 0
    || correctIndex >= variant.choices.length
  ) {
    throw new OriginalVariantPracticeError(
      "ORIGINAL_VARIANT_CHOICE_INVALID",
      variant.externalId,
      `원문 선택지 ID를 확인할 수 없습니다: ${choiceId}`,
    );
  }

  const review = variant.sourceReview;
  const isCorrect = selectedIndex === correctIndex;
  const lessonHref =
    question.approvedReview?.conceptBinding.href
    ?? `/written/theory/${question.lessonId}#${question.lessonAnchor}`;
  const choiceFeedback = variant.choices.map((text, index) => {
    const rationale = review.choiceByChoiceReasons[index].trim();
    return {
      id: getOriginalVariantChoiceId(variant.externalId, index),
      text: text.trim(),
      rationale,
      plausibleReason: index === correctIndex ? "" : rationale,
      incorrectPoint: index === correctIndex ? null : rationale,
      keyRule: review.theorySupplement.trim(),
      differenceFromCorrect:
        index === correctIndex
          ? null
          : `정답은 ${variant.choices[correctIndex].trim()}입니다.`,
    };
  });
  const selectedChoice = choiceFeedback[selectedIndex];
  const correctChoice = choiceFeedback[correctIndex];

  return {
    isCorrect,
    feedbackQuality: "approved_direct",
    feedbackNotice: null,
    selectedChoice,
    correctChoice: {
      id: correctChoice.id,
      text: correctChoice.text,
    },
    explanation: review.directSolution.trim(),
    errorReason: isCorrect ? null : question.errorReason,
    selfRating,
    lesson: {
      id: question.lessonId,
      anchor: question.lessonAnchor,
      href: lessonHref,
    },
    conceptSupport: lesson
      ? {
          title: lesson.title,
          summary: lesson.summary,
          blocks: lesson.blocks.map(({ id, kind, title, body }) => ({
            id,
            kind,
            title,
            body,
          })),
        }
      : null,
    approvedReview: {
      directSolution: review.directSolution.trim(),
      conceptBinding: {
        assertionText: review.theorySupplement.trim(),
        href: lessonHref,
      },
      calculation: review.calculation ?? undefined,
      selectedChoiceReason: selectedChoice.rationale,
    },
    otherChoices: choiceFeedback
      .filter((_, index) => index !== selectedIndex)
      .map((choice) => ({
        ...choice,
        isCorrect:
          parseOriginalVariantChoiceId(variant.externalId, choice.id)
          === correctIndex,
      })),
  };
}

export function getOriginalVariantChoiceId(
  externalId: string,
  choiceIndex: number,
) {
  return `${externalId}:choice:${choiceIndex + 1}`;
}

export function parseOriginalVariantChoiceId(
  externalId: string,
  choiceId: string,
) {
  const prefix = `${externalId}:choice:`;
  if (!choiceId.startsWith(prefix)) return -1;
  const value = Number(choiceId.slice(prefix.length));
  return Number.isInteger(value) ? value - 1 : -1;
}

export function parseOriginalVariantAnswerIndex(variant: Variant) {
  const rawAnswer = variant.answer.trim();
  if (!rawAnswer) return -1;

  const symbolMatch = rawAnswer.match(/^([①②③④⑤])(?:[.)])?\s*(.*)$/);
  if (symbolMatch) {
    return validateIndexedAnswer(
      variant,
      CIRCLED_CHOICES.indexOf(symbolMatch[1]),
      symbolMatch[2],
    );
  }

  const numberMatch = rawAnswer.match(
    /^([1-5])(?:(?:[.)]|번)\s*|\s+|$)(.*)$/,
  );
  if (numberMatch) {
    return validateIndexedAnswer(
      variant,
      Number(numberMatch[1]) - 1,
      numberMatch[2],
    );
  }

  const normalizedAnswer = normalizeText(rawAnswer);
  if (!normalizedAnswer) return -1;
  const matchingIndexes = variant.choices.flatMap((choice, index) =>
    normalizeText(choice) === normalizedAnswer ? [index] : [],
  );
  return matchingIndexes.length === 1 ? matchingIndexes[0] : -1;
}

function validateIndexedAnswer(
  variant: Variant,
  answerIndex: number,
  answerText: string,
) {
  if (answerIndex < 0 || answerIndex >= variant.choices.length) return -1;
  const normalizedAnswerText = normalizeText(answerText);
  if (!normalizedAnswerText) return answerIndex;
  return normalizeText(variant.choices[answerIndex]) === normalizedAnswerText
    ? answerIndex
    : -1;
}

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[\s·,.:;!?()[\]{}'"/\\_-]+/g, "");
}
