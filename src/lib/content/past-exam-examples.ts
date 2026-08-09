import type { GeneratedContent } from "@/lib/domain/types";
import { isPublishableQuestion } from "@/lib/domain/practice";
import {
  getReviewedCbtVariantAnswerIndex,
  mapReviewedCbtVariantChoices,
} from "@/lib/content/reviewed-cbt-variants";

const VISUAL_ASSET_CUE =
  /\[이미지\]|<img|(?:다음|아래|위의)\s*(?:그림|도면|회로도|사진|이미지|투상도)|(?:그림|도면|회로도|사진|이미지)\s*(?:을|를|에서|으로)\s*(?:보고|판독|도시|표시|나타)|도시(?:한|된)\s*(?:그림|도면|회로도|사진|이미지|투상도)/i;
const CALCULATION_CUE = /계산|구하|얼마|몇\s*(?:배|개|%|kW|W|MPa|kPa|bar|rpm|Hz|dB|mm|cm|m)|값은|비율|효율|동력|토크|유량|속도/i;
const DIAGNOSIS_CUE = /고장|원인|대책|진단|이상|누설|점검|조치|설치|선정|조건|현상|방지/i;
const NEGATIVE_CUE =
  /아닌|아니|옳지\s*않|않는|않은|되지\s*않|부적절|잘못|거리가\s*먼|제외|없는/i;

export type PastExamFormat = "calculation" | "diagnosis" | "negative" | "concept";

export type PastExamExample = {
  externalId: string;
  canonicalId: string;
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
    representative: PastExamExample;
    representativeAnswer: string;
    representativeExplanation: string;
  }>;
};

type RankedExample = PastExamExample & {
  score: number;
};

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
    const key = normalizeStem(example.stem);
    const previous = unique.get(key);
    if (!previous || compareExamples(example, previous) < 0) unique.set(key, example);
  }

  const ranked = [...unique.values()].sort(compareExamples);
  const selected: RankedExample[] = [];

  for (const candidate of ranked) {
    if (selected.length >= limit) break;
    if (selected.every((item) => item.format !== candidate.format)) selected.push(candidate);
  }
  for (const candidate of ranked) {
    if (selected.length >= limit) break;
    if (!selected.some((item) => item.externalId === candidate.externalId)) selected.push(candidate);
  }

  return selected.map(toPastExamExample);
}

export function getPastExamPatternSummary(
  content: GeneratedContent,
  lessonId: string,
): PastExamPatternSummary {
  const verified = collectVerifiedPastExamExamples(content, [lessonId]);
  const total = verified.length;
  const byFormat = new Map<PastExamFormat, RankedExample[]>();
  for (const example of verified) {
    const current = byFormat.get(example.format) ?? [];
    current.push(example);
    byFormat.set(example.format, current);
  }

  const patterns = [...byFormat.entries()]
    .map(([format, examples]) => {
      const representative = [...examples].sort(compareExamples)[0];
      const representativeQuestion = content.questions.find(
        (question) => question.id === representative.canonicalId,
      );
      return {
        format,
        count: examples.length,
        percentage: total > 0 ? Math.round((examples.length / total) * 100) : 0,
        representative: toPastExamExample(representative),
        representativeAnswer: representativeQuestion?.answerText ?? "",
        representativeExplanation: representativeQuestion?.explanation ?? "",
      };
    })
    .sort(
      (left, right) =>
        right.count - left.count
        || right.representative.year - left.representative.year
        || left.format.localeCompare(right.format),
    );

  return { total, patterns };
}

export function isUsablePastExamVariant(
  variant: GeneratedContent["variants"][number],
): variant is GeneratedContent["variants"][number] & { year: number } {
  if (
    variant.reviewState !== undefined &&
    variant.reviewState !== "published"
  ) {
    return false;
  }
  const choices = variant.choices.map((choice) => choice.trim()).filter(Boolean);
  return Boolean(
    variant.year
    && variant.sessionLabel.trim()
    && variant.stem.trim()
    && choices.length >= 4
    && /^https?:\/\//.test(variant.sourceUrl)
    && (variant.reviewed || !VISUAL_ASSET_CUE.test(variant.stem)),
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
    const reviewedChoices = mapReviewedCbtVariantChoices(question, variant);
    const mappedChoices = variant.reviewed
      ? reviewedChoices
      : mapVariantChoices(question, variant.choices);
    const reviewedAnswerIndex = getReviewedCbtVariantAnswerIndex(variant);
    const answerIndex = variant.reviewed
      ? (reviewedAnswerIndex ?? -1)
      : parseVariantAnswerIndex(variant.answer, variant.choices);
    if (
      !mappedChoices
      || answerIndex < 0
      || mappedChoices[answerIndex]?.id !== question.correctChoiceId
    ) {
      continue;
    }

    const format = classifyPastExamFormat(variant.stem, variant.choices);
    examples.push({
      externalId: variant.externalId,
      canonicalId: variant.canonicalId,
      year: variant.year,
      sessionLabel: variant.sessionLabel,
      questionNumber: variant.questionNumber,
      stem: variant.stem.trim(),
      choices: variant.choices.map((choice) => choice.trim()).filter(Boolean),
      choiceIds: mappedChoices.map((choice) => choice.id),
      sourceUrl: variant.sourceUrl,
      format,
      score: challengeScore(variant.stem, variant.choices, format),
    });
  }
  return examples;
}

function toPastExamExample(example: RankedExample): PastExamExample {
  return {
    externalId: example.externalId,
    canonicalId: example.canonicalId,
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
  return right.score - left.score
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
