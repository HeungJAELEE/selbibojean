import type { GeneratedContent } from "@/lib/domain/types";
import { isPublishableQuestion } from "@/lib/domain/practice";

const VISUAL_ASSET_CUE = /그림|도면|회로도|사진|이미지|도시(?:한|된)|다음\s*회로|아래\s*회로/i;
const CALCULATION_CUE = /계산|구하|얼마|몇\s*(?:배|개|%|kW|W|MPa|kPa|bar|rpm|Hz|dB|mm|cm|m)|값은|비율|효율|동력|토크|유량|속도/i;
const DIAGNOSIS_CUE = /고장|원인|대책|진단|이상|누설|점검|조치|설치|선정|조건|현상|방지/i;
const NEGATIVE_CUE = /아닌|옳지\s*않|부적절|잘못|거리가\s*먼/i;

export type PastExamFormat = "calculation" | "diagnosis" | "negative" | "concept";

export type PastExamExample = {
  externalId: string;
  canonicalId: string;
  year: number;
  sessionLabel: string;
  questionNumber: number | null;
  stem: string;
  choices: string[];
  sourceUrl: string;
  format: PastExamFormat;
};

type RankedExample = PastExamExample & {
  score: number;
};

export function getPastExamExamples(content: GeneratedContent, lessonId: string, limit = Number.POSITIVE_INFINITY): PastExamExample[] {
  const publicQuestions = new Map(
    content.questions
      .filter((question) => question.lessonId === lessonId && isPublishableQuestion(question))
      .map((question) => [question.id, question]),
  );

  const unique = new Map<string, RankedExample>();

  for (const variant of content.variants) {
    if (!publicQuestions.has(variant.canonicalId)) continue;
    if (!isUsablePastExamVariant(variant)) continue;

    const format = classifyPastExamFormat(variant.stem);
    const example: RankedExample = {
      externalId: variant.externalId,
      canonicalId: variant.canonicalId,
      year: variant.year,
      sessionLabel: variant.sessionLabel,
      questionNumber: variant.questionNumber,
      stem: variant.stem.trim(),
      choices: variant.choices.map((choice) => choice.trim()).filter(Boolean),
      sourceUrl: variant.sourceUrl,
      format,
      score: challengeScore(variant.stem, variant.choices, format),
    };

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

  return selected.map((example) => ({
    externalId: example.externalId,
    canonicalId: example.canonicalId,
    year: example.year,
    sessionLabel: example.sessionLabel,
    questionNumber: example.questionNumber,
    stem: example.stem,
    choices: example.choices,
    sourceUrl: example.sourceUrl,
    format: example.format,
  }));
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

export function classifyPastExamFormat(stem: string): PastExamFormat {
  if (CALCULATION_CUE.test(stem)) return "calculation";
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
