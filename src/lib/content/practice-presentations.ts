import type { GeneratedContent, PublicQuestion, Question } from "@/lib/domain/types";
import { isUsablePastExamVariant } from "@/lib/content/past-exam-examples";
import {
  getReviewedCbtVariantAnswerIndex,
  mapReviewedCbtVariantChoices,
} from "@/lib/content/reviewed-cbt-variants";
import { orderPracticeChoices } from "@/lib/content/practice-choice-order";
import {
  isPublishableQuestion,
  shuffleQuestionIds,
  toPublicQuestion,
} from "@/lib/domain/practice";

export type OriginalPracticeRatio = 0 | 25 | 50 | 75 | 100;

type Variant = GeneratedContent["variants"][number];

export function createPracticePresentations(
  questions: Question[],
  variants: Variant[],
  originalRatio: OriginalPracticeRatio,
  seed: number,
  shuffleChoices = true,
  includeRepeatedOccurrences = false,
): PublicQuestion[] {
  const originalsByQuestion = getSafeOriginalsByQuestion(questions, variants);
  const allOriginalsByQuestion = includeRepeatedOccurrences
    ? getAllSafeOriginalsByQuestion(questions, variants)
    : originalsByQuestion;
  const eligibleIds = questions
    .filter((question) => originalsByQuestion.has(question.id))
    .map((question) => question.id);
  const requiredOriginalIds = questions
    .filter(
      (question) =>
        !isPublishableQuestion(question) && originalsByQuestion.has(question.id),
    )
    .map((question) => question.id);
  const targetCount = Math.min(
    Math.max(
      Math.round(questions.length * (originalRatio / 100)),
      requiredOriginalIds.length,
    ),
    eligibleIds.length,
  );
  const originalIds = new Set(requiredOriginalIds);
  for (const id of shuffleQuestionIds(eligibleIds, seed ^ 0x51f15e)) {
    if (originalIds.size >= targetCount) break;
    originalIds.add(id);
  }

  return questions.map((question) => {
    if (!originalIds.has(question.id)) return toPracticePresentation(question, question.id, seed, shuffleChoices);
    const candidates = originalsByQuestion.get(question.id) ?? [];
    const representative =
      candidates[stableIndex(`${seed}:${question.id}`, candidates.length)];
    const matchingOccurrences = representative && includeRepeatedOccurrences
      ? (allOriginalsByQuestion.get(question.id) ?? []).filter(
          (variant) =>
            normalizeText(variant.stem) === normalizeText(representative.stem),
        )
      : representative
        ? [representative]
        : [];
    const variant = includeRepeatedOccurrences
      ? matchingOccurrences[
          stableIndex(
            `${seed}:${question.id}:occurrence`,
            matchingOccurrences.length,
          )
        ]
      : representative;
    return variant
      ? toOriginalPublicQuestion(question, variant, seed, shuffleChoices)
      : toPracticePresentation(question, question.id, seed, shuffleChoices);
  });
}

export function getSafeOriginalsByQuestion(questions: Question[], variants: Variant[]) {
  const result = new Map<string, Variant[]>();

  for (const [questionId, candidates] of getAllSafeOriginalsByQuestion(
    questions,
    variants,
  )) {
    const seenStems = new Set<string>();
    const uniqueStems = candidates.filter((variant) => {
      const stemKey = normalizeText(variant.stem);
      if (seenStems.has(stemKey)) return false;
      seenStems.add(stemKey);
      return true;
    });
    result.set(questionId, uniqueStems);
  }

  return result;
}

export function getAllSafeOriginalsByQuestion(
  questions: Question[],
  variants: Variant[],
) {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const result = new Map<string, Variant[]>();

  for (const variant of variants) {
    const question = questionsById.get(variant.canonicalId);
    if (!question || !isSafeOriginalPracticeVariant(question, variant)) continue;

    const current = result.get(question.id) ?? [];
    current.push(variant);
    current.sort((left, right) => (right.year ?? 0) - (left.year ?? 0) || left.externalId.localeCompare(right.externalId));
    result.set(question.id, current);
  }

  return result;
}

export function countPublishedReviewedVariantsBySubject(
  questions: Question[],
  variants: Variant[],
  yearFrom?: number,
  yearTo?: number,
) {
  const questionsById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const counts: Record<string, number> = {};

  for (const variant of variants) {
    if (
      !variant.reviewed ||
      variant.reviewState !== "published" ||
      (yearFrom !== undefined &&
        yearTo !== undefined &&
        (variant.year === null ||
          variant.year < yearFrom ||
          variant.year > yearTo))
    ) {
      continue;
    }
    const question = questionsById.get(variant.canonicalId);
    if (!question || !isSafeOriginalPracticeVariant(question, variant)) {
      continue;
    }
    counts[question.subjectId] = (counts[question.subjectId] ?? 0) + 1;
  }

  return counts;
}

export function countPublicOriginalVariantsBySubject(
  questions: Question[],
  variants: Variant[],
  yearFrom?: number,
  yearTo?: number,
) {
  const questionsById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const counts: Record<string, number> = {};

  for (const variant of variants) {
    if (
      yearFrom !== undefined &&
      yearTo !== undefined &&
      (variant.year === null || variant.year < yearFrom || variant.year > yearTo)
    ) {
      continue;
    }
    const question = questionsById.get(variant.canonicalId);
    if (!question || !isPublicOriginalVariant(question, variant)) continue;
    counts[question.subjectId] = (counts[question.subjectId] ?? 0) + 1;
  }

  return counts;
}

export function getPublishedReviewedVariantYears(
  questions: Question[],
  variants: Variant[],
) {
  const questionsById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const years = new Set<number>();

  for (const variant of variants) {
    if (
      !variant.reviewed ||
      variant.reviewState !== "published" ||
      variant.year === null
    ) {
      continue;
    }
    const question = questionsById.get(variant.canonicalId);
    if (question && isSafeOriginalPracticeVariant(question, variant)) {
      years.add(variant.year);
    }
  }

  return [...years].sort((left, right) => left - right);
}

export function getPublicOriginalVariantYears(
  questions: Question[],
  variants: Variant[],
) {
  const questionsById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const years = new Set<number>();

  for (const variant of variants) {
    if (variant.year === null) continue;
    const question = questionsById.get(variant.canonicalId);
    if (question && isPublicOriginalVariant(question, variant)) {
      years.add(variant.year);
    }
  }

  return [...years].sort((left, right) => left - right);
}

export function filterPracticeContentByYearRange(
  questions: Question[],
  variants: Variant[],
  yearFrom?: number,
  yearTo?: number,
) {
  if (yearFrom === undefined || yearTo === undefined) {
    return { questions, variants };
  }
  const filteredVariants = variants.filter(
    (variant) =>
      variant.year !== null &&
      variant.year >= yearFrom &&
      variant.year <= yearTo,
  );
  const eligibleQuestionIds = new Set(
    getSafeOriginalsByQuestion(questions, filteredVariants).keys(),
  );
  return {
    questions: questions.filter((question) =>
      eligibleQuestionIds.has(question.id),
    ),
    variants: filteredVariants,
  };
}

export function isSafeOriginalPracticeVariant(question: Question, variant: Variant) {
  if (!isUsablePastExamVariant(variant)) return false;
  const mappedChoices = mapVariantChoices(question, variant);
  const reviewedAnswerIndex = getReviewedCbtVariantAnswerIndex(variant);
  const answerIndex = variant.reviewed
    ? (reviewedAnswerIndex ?? -1)
    : parseVariantAnswerIndex(variant);

  return Boolean(
    mappedChoices
    && answerIndex >= 0
    && mappedChoices[answerIndex]?.id === question.correctChoiceId,
  );
}

function isPublicOriginalVariant(question: Question, variant: Variant) {
  if (!isSafeOriginalPracticeVariant(question, variant)) return false;
  if (variant.reviewed) return variant.reviewState === "published";
  return isPublishableQuestion(question);
}

function toPracticePresentation(
  question: Question,
  questionVariantId: string,
  seed: number,
  shuffleChoices: boolean,
): PublicQuestion {
  const publicQuestion = toPublicQuestion(question);
  const shouldShuffle =
    shuffleChoices && (question.shufflePolicy ?? "all") === "all";
  if (!shouldShuffle) return publicQuestion;
  const choices = orderPracticeChoices(publicQuestion.choices, seed, questionVariantId, shouldShuffle)
    .map((choice, index) => ({ ...choice, order: index + 1 }));
  return { ...publicQuestion, choices };
}

function toOriginalPublicQuestion(
  question: Question,
  variant: Variant,
  seed: number,
  shuffleChoices: boolean,
): PublicQuestion {
  const publicQuestion = toPublicQuestion(question);
  const mappedChoices = mapVariantChoices(question, variant);
  if (!mappedChoices || variant.year === null) return toPracticePresentation(question, question.id, seed, shuffleChoices);

  const shouldShuffle =
    shuffleChoices &&
    (variant.shufflePolicy ?? question.shufflePolicy ?? "all") === "all";
  const choices = orderPracticeChoices(
    mappedChoices.map((choice, index) => ({ id: choice.id, text: variant.choices[index].trim() })),
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

function mapVariantChoices(question: Question, variant: Variant) {
  const reviewedMapping = mapReviewedCbtVariantChoices(question, variant);
  if (variant.reviewed) return reviewedMapping;

  const mapped = variant.choices.map((choice) =>
    question.choices.find(
      (candidate) => normalizeText(candidate.text) === normalizeText(choice),
    ),
  );
  if (mapped.some((choice) => !choice)) return null;
  const complete = mapped.filter((choice): choice is Question["choices"][number] => Boolean(choice));
  return new Set(complete.map((choice) => choice.id)).size === complete.length ? complete : null;
}

function parseVariantAnswerIndex(variant: Variant) {
  const circled = ["①", "②", "③", "④", "⑤"];
  const bySymbol = circled.findIndex((symbol) => variant.answer.startsWith(symbol));
  if (bySymbol >= 0) return bySymbol;
  const number = variant.answer.match(/^([1-5])/);
  if (number) return Number(number[1]) - 1;

  const normalizedAnswer = normalizeText(variant.answer.replace(/^[①②③④⑤1-5][.)]?\s*/, ""));
  return variant.choices.findIndex((choice) => {
    const normalizedChoice = normalizeText(choice);
    return normalizedChoice === normalizedAnswer
      || normalizedChoice.includes(normalizedAnswer)
      || normalizedAnswer.includes(normalizedChoice);
  });
}

function normalizeText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ko").replace(/[\s·ㆍ,.?()\[\]{}'"/\\_-]+/g, "");
}

function stableIndex(value: string, length: number) {
  if (length <= 1) return 0;
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}
