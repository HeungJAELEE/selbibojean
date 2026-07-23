import type { GeneratedContent, PublicQuestion, Question } from "@/lib/domain/types";
import { isUsablePastExamVariant } from "@/lib/content/past-exam-examples";
import { shuffleQuestionIds, toPublicQuestion } from "@/lib/domain/practice";

export type OriginalPracticeRatio = 0 | 25 | 50 | 75 | 100;

type Variant = GeneratedContent["variants"][number];

export function createPracticePresentations(
  questions: Question[],
  variants: Variant[],
  originalRatio: OriginalPracticeRatio,
  seed: number,
): PublicQuestion[] {
  const originalsByQuestion = getSafeOriginalsByQuestion(questions, variants);
  const eligibleIds = questions.filter((question) => originalsByQuestion.has(question.id)).map((question) => question.id);
  const targetCount = Math.min(Math.round(questions.length * (originalRatio / 100)), eligibleIds.length);
  const originalIds = new Set(shuffleQuestionIds(eligibleIds, seed ^ 0x51f15e).slice(0, targetCount));

  return questions.map((question) => {
    if (!originalIds.has(question.id)) return toPublicQuestion(question);
    const candidates = originalsByQuestion.get(question.id) ?? [];
    const variant = candidates[stableIndex(`${seed}:${question.id}`, candidates.length)];
    return variant ? toOriginalPublicQuestion(question, variant) : toPublicQuestion(question);
  });
}

export function getSafeOriginalsByQuestion(questions: Question[], variants: Variant[]) {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const result = new Map<string, Variant[]>();
  const seenStems = new Map<string, Set<string>>();

  for (const variant of variants) {
    const question = questionsById.get(variant.canonicalId);
    if (!question || !isSafeOriginalPracticeVariant(question, variant)) continue;

    const stemKey = normalizeText(variant.stem);
    const seen = seenStems.get(question.id) ?? new Set<string>();
    if (seen.has(stemKey)) continue;
    seen.add(stemKey);
    seenStems.set(question.id, seen);

    const current = result.get(question.id) ?? [];
    current.push(variant);
    current.sort((left, right) => (right.year ?? 0) - (left.year ?? 0) || left.externalId.localeCompare(right.externalId));
    result.set(question.id, current);
  }

  return result;
}

export function isSafeOriginalPracticeVariant(question: Question, variant: Variant) {
  if (!isUsablePastExamVariant(variant)) return false;
  const mappedChoices = mapVariantChoices(question, variant);
  const answerIndex = parseVariantAnswerIndex(variant);

  return Boolean(
    mappedChoices
    && answerIndex >= 0
    && mappedChoices[answerIndex]?.id === question.correctChoiceId,
  );
}

function toOriginalPublicQuestion(question: Question, variant: Variant): PublicQuestion {
  const publicQuestion = toPublicQuestion(question);
  const mappedChoices = mapVariantChoices(question, variant);
  if (!mappedChoices || variant.year === null) return publicQuestion;

  return {
    ...publicQuestion,
    stem: variant.stem.trim(),
    choices: mappedChoices.map((choice, index) => ({ id: choice.id, order: index + 1, text: variant.choices[index].trim() })),
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
  const mapped = variant.choices.map((choice) => question.choices.find((candidate) => normalizeText(candidate.text) === normalizeText(choice)));
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
