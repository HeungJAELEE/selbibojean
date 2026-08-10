import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
} from "@/data/source/welding-cbt-answer-review";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";
import {
  getOriginalVariantChoiceId,
  isReviewedExactOriginalVariant,
  parseOriginalVariantAnswerIndex,
} from "@/lib/content/original-variant-practice";
import type { GeneratedContent } from "@/lib/domain/types";
import { isPublishableQuestion } from "@/lib/domain/practice";

const VISUAL_ASSET_CUE = /그림|도면|회로도|사진|이미지|도시(?:한|된)|다음\s*회로|아래\s*회로/i;
const CALCULATION_CUE = /계산|구하|얼마|몇\s*(?:배|개|%|kW|W|MPa|kPa|bar|rpm|Hz|dB|mm|cm|m)|값은|비율|효율|동력|토크|유량|속도/i;
const DIAGNOSIS_CUE = /고장|원인|대책|진단|이상|누설|점검|조치|설치|선정|조건|현상|방지/i;
const NEGATIVE_CUE =
  /아닌|아니|옳지\s*않|않는|않은|되지\s*않|부적절|잘못|거리가\s*먼|제외|없는/i;

export type PastExamFormat = "calculation" | "diagnosis" | "negative" | "concept";

export type PastExamExample = {
  externalId: string;
  canonicalId: string;
  submissionMode?: "canonical" | "variant";
  year: number;
  sessionLabel: string;
  questionNumber: number | null;
  stem: string;
  choices: string[];
  choiceIds: string[];
  sourceUrl: string;
  format: PastExamFormat;
};

export type PastExamPatternSummary = {
  total: number;
  patterns: Array<{
    format: PastExamFormat;
    count: number;
    percentage: number;
  }>;
};

type RankedExample = PastExamExample & {
  score: number;
  essentialRank: number | null;
  reviewedWelding: boolean;
};

const weldingAnswerReviewByCanonicalId = new Map(
  WELDING_CBT_ANSWER_REVIEWS.entries.map((entry) => [
    entry.canonicalId,
    entry,
  ]),
);
const reviewedWeldingLessonIds = new Set<string>(
  WELDING_CBT_LESSON_PROJECTION.entries.flatMap((entry) =>
    entry.primaryLeafLessonId ? [entry.primaryLeafLessonId] : [],
  ),
);

export function getPastExamExamples(content: GeneratedContent, lessonId: string, limit = Number.POSITIVE_INFINITY): PastExamExample[] {
  return getPastExamExamplesForLessons(content, [lessonId], limit);
}

export function getPastExamExamplesForLessons(
  content: GeneratedContent,
  lessonIds: string[],
  limit = Number.POSITIVE_INFINITY,
): PastExamExample[] {
  const unique = new Map<string, RankedExample>();
  for (const example of collectVerifiedPastExamExamples(content, lessonIds)) {
    const key = example.reviewedWelding
      ? example.canonicalId
      : normalizeStem(example.stem);
    const previous = unique.get(key);
    if (!previous || compareExamples(example, previous) < 0) unique.set(key, example);
  }

  const ranked = [...unique.values()].sort(compareExamples);
  const reviewedEssentials = ranked.filter(
    (example) =>
      example.reviewedWelding && example.essentialRank !== null,
  );
  if (reviewedEssentials.length > 0) {
    const selectedEssentials = reviewedEssentials.slice(0, limit);
    const supplemental = selectDiverseExamples(
      ranked.filter((example) => !example.reviewedWelding),
      Math.max(0, limit - selectedEssentials.length),
    );
    return [...selectedEssentials, ...supplemental].map(toPastExamExample);
  }

  return selectDiverseExamples(ranked, limit).map(toPastExamExample);
}

export function getPastExamPatternSummary(
  content: GeneratedContent,
  lessonId: string,
  limit = Number.POSITIVE_INFINITY,
): PastExamPatternSummary {
  const verified = Number.isFinite(limit)
    ? collectVerifiedPastExamExamples(content, [lessonId])
      .sort(compareExamples)
      .slice(0, limit)
    : collectVerifiedPastExamExamples(content, [lessonId]);
  const total = verified.length;
  const byFormat = new Map<PastExamFormat, RankedExample[]>();
  for (const example of verified) {
    const current = byFormat.get(example.format) ?? [];
    current.push(example);
    byFormat.set(example.format, current);
  }

  const rankedPatterns = [...byFormat.entries()]
    .map(([format, examples]) => {
      const representative = [...examples].sort(compareExamples)[0];
      return {
        pattern: {
          format,
          count: examples.length,
          percentage: total > 0
            ? Math.round((examples.length / total) * 100)
            : 0,
        },
        representative,
      };
    })
    .sort(
      (left, right) =>
        right.pattern.count - left.pattern.count
        || right.representative.year - left.representative.year
        || left.pattern.format.localeCompare(right.pattern.format),
    );

  return {
    total,
    patterns: rankedPatterns.map(({ pattern }) => pattern),
  };
}

export function isUsablePastExamVariant(
  variant: GeneratedContent["variants"][number],
): variant is GeneratedContent["variants"][number] & { year: number } {
  const choices = variant.choices.map((choice) => choice.trim()).filter(Boolean);
  return Boolean(
    variant.year
    && variant.sessionLabel.trim()
    && variant.stem.trim()
    && choices.length >= 4
    && /^https?:\/\//.test(variant.sourceUrl)
    && !VISUAL_ASSET_CUE.test(variant.stem),
  );
}

export function classifyPastExamFormat(
  stem: string,
  choices: string[] = [],
): PastExamFormat {
  if (
    CALCULATION_CUE.test(stem)
    || choices.some((choice) => choice.includes("="))
  ) {
    return "calculation";
  }
  if (DIAGNOSIS_CUE.test(stem)) return "diagnosis";
  if (NEGATIVE_CUE.test(stem)) return "negative";
  return "concept";
}

function challengeScore(stem: string, choices: string[], format: PastExamFormat) {
  const formatScore = { calculation: 10, diagnosis: 8, negative: 6, concept: 2 }[format];
  const stemScore = stem.length >= 90 ? 3 : stem.length >= 55 ? 1 : 0;
  const choiceScore = choices.join("").length >= 140 ? 2 : 0;
  return formatScore + stemScore + choiceScore;
}

function collectVerifiedPastExamExamples(
  content: GeneratedContent,
  lessonIds: string[],
): RankedExample[] {
  const lessonIdSet = new Set(lessonIds);
  const publicQuestions = new Map(
    content.questions
      .filter(
        (question) =>
          lessonIdSet.has(question.lessonId) && isPublishableQuestion(question),
      )
      .map((question) => [question.id, question]),
  );
  const examples: RankedExample[] = [];

  for (const variant of content.variants) {
    const question = publicQuestions.get(variant.canonicalId);
    if (!question || !isUsablePastExamVariant(variant)) continue;
    const weldingReview = weldingAnswerReviewByCanonicalId.get(
      variant.canonicalId,
    );
    if (
      reviewedWeldingLessonIds.has(question.lessonId)
      && (
        !weldingReview
        || !isWeldingCbtAnswerReviewPublishable(weldingReview)
        || weldingReview.essentialRank === null
      )
    ) {
      continue;
    }
    if (
      weldingReview
      && (
        !isWeldingCbtAnswerReviewPublishable(weldingReview)
        || weldingReview.essentialRank === null
      )
    ) {
      continue;
    }
    const reviewedExact = isReviewedExactOriginalVariant(variant);
    const mappedChoices = reviewedExact
      ? variant.choices.map((_, index) =>
          getOriginalVariantChoiceId(variant.externalId, index))
      : mapVariantChoices(question, variant.choices)?.map((choice) => choice.id);
    const answerIndex = reviewedExact
      ? parseOriginalVariantAnswerIndex(variant)
      : parseVariantAnswerIndex(variant.answer, variant.choices);
    if (
      !mappedChoices
      || answerIndex < 0
      || (
        !reviewedExact
        && mappedChoices[answerIndex] !== question.correctChoiceId
      )
    ) {
      continue;
    }

    const format = classifyPastExamFormat(variant.stem, variant.choices);
    examples.push({
      externalId: variant.externalId,
      canonicalId: variant.canonicalId,
      submissionMode: reviewedExact ? "variant" : "canonical",
      year: variant.year,
      sessionLabel: variant.sessionLabel,
      questionNumber: variant.questionNumber,
      stem: variant.stem.trim(),
      choices: variant.choices.map((choice) => choice.trim()).filter(Boolean),
      choiceIds: mappedChoices,
      sourceUrl: variant.sourceUrl,
      format,
      score: challengeScore(variant.stem, variant.choices, format),
      essentialRank: weldingReview?.essentialRank ?? null,
      reviewedWelding: Boolean(weldingReview),
    });
  }
  return examples;
}

function selectDiverseExamples(
  ranked: RankedExample[],
  limit: number,
) {
  const selected: RankedExample[] = [];
  for (const candidate of ranked) {
    if (selected.length >= limit) break;
    if (selected.every((item) => item.format !== candidate.format)) {
      selected.push(candidate);
    }
  }
  for (const candidate of ranked) {
    if (selected.length >= limit) break;
    if (!selected.some((item) => item.externalId === candidate.externalId)) {
      selected.push(candidate);
    }
  }
  return selected;
}

function toPastExamExample(example: RankedExample): PastExamExample {
  return {
    externalId: example.externalId,
    canonicalId: example.canonicalId,
    submissionMode: example.submissionMode,
    year: example.year,
    sessionLabel: example.sessionLabel,
    questionNumber: example.questionNumber,
    stem: example.stem,
    choices: example.choices,
    choiceIds: example.choiceIds,
    sourceUrl: example.sourceUrl,
    format: example.format,
  };
}

function compareExamples(left: RankedExample, right: RankedExample) {
  return (left.essentialRank ?? Number.POSITIVE_INFINITY)
    - (right.essentialRank ?? Number.POSITIVE_INFINITY)
    || right.score - left.score
    || right.year - left.year
    || (right.questionNumber ?? 0) - (left.questionNumber ?? 0)
    || left.externalId.localeCompare(right.externalId, "ko");
}

function normalizeStem(stem: string) {
  return stem
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[\s·ㆍ,.?()\[\]{}'"/\\_-]+/g, "");
}

function mapVariantChoices(
  question: GeneratedContent["questions"][number],
  variantChoices: string[],
) {
  const mapped = variantChoices.map((choice) =>
    question.choices.find((candidate) => normalizeChoice(candidate.text) === normalizeChoice(choice)));
  if (mapped.some((choice) => !choice)) return null;
  const complete = mapped.filter((choice): choice is GeneratedContent["questions"][number]["choices"][number] => Boolean(choice));
  return new Set(complete.map((choice) => choice.id)).size === complete.length ? complete : null;
}

function parseVariantAnswerIndex(answer: string, choices: string[]) {
  const circled = ["①", "②", "③", "④", "⑤"];
  const bySymbol = circled.findIndex((symbol) => answer.startsWith(symbol));
  if (bySymbol >= 0) return bySymbol;
  const number = answer.match(/^([1-5])/);
  if (number) return Number(number[1]) - 1;

  const normalizedAnswer = normalizeChoice(answer.replace(/^[①②③④⑤1-5][.)]?\s*/, ""));
  return choices.findIndex((choice) => {
    const normalizedChoice = normalizeChoice(choice);
    return normalizedChoice === normalizedAnswer
      || normalizedChoice.includes(normalizedAnswer)
      || normalizedAnswer.includes(normalizedChoice);
  });
}

function normalizeChoice(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ko").replace(/[\s·ㆍ,.?()\[\]{}'"/\\_-]+/g, "");
}
