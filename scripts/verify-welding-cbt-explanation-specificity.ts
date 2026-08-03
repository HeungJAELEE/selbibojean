import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import {
  WELDING_CBT_ANSWER_REVIEWS,
  isWeldingCbtAnswerReviewPublishable,
  validateWeldingCbtAnswerReviewQuality,
  type PublishableWeldingCbtAnswerReviewEntry,
  type WeldingCbtAnswerReviewError,
} from "@/data/source/welding-cbt-answer-review";

type BankRecord = (typeof rawWeldingCbtBank.records)[number];

export type ExplanationSpecificityReport = {
  ok: boolean;
  approvedCount: number;
  errors: WeldingCbtAnswerReviewError[];
};

const GENERIC_EXPLANATION_PATTERNS = [
  "문제의 조건을 확인합니다",
  "각 보기를 비교합니다",
  "정답을 선택합니다",
  "따라서 정답입니다",
  "일반적인 원리를 적용합니다",
] as const;

const STEM_STOP_WORDS = new Set([
  "다음",
  "중",
  "용접",
  "용접시",
  "용접할",
  "것",
  "것은",
  "경우",
  "얼마인가",
  "무엇인가",
  "설명",
  "방법",
  "사용",
  "관련",
  "인가",
]);

function normalize(value: string) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function explanationText(entry: PublishableWeldingCbtAnswerReviewEntry) {
  return [entry.answerExplanation, ...entry.solutionSteps, entry.keyRule].join(" ");
}

function stemAnchors(stem: string) {
  return [...new Set(
    stem
      .normalize("NFC")
      .split(/[^\p{L}\p{N}]+/gu)
      .map(normalize)
      .filter((token) => token.length >= 2 && !STEM_STOP_WORDS.has(token)),
  )];
}

function choiceTokens(choice: string) {
  return [...new Set(
    choice
      .normalize("NFC")
      .split(/[^\p{L}\p{N}]+/gu)
      .map((token) =>
        normalize(token).replace(
          /(?:으로|에서|에게|까지|부터|처럼|보다|로|을|를|이|가|은|는|에|의|도|와|과)$/u,
          "",
        ))
      .filter((token) => token.length >= 2 && !STEM_STOP_WORDS.has(token)),
  )];
}

function mentionsCorrectChoice(
  directText: string,
  correctChoice: string,
  correctIndex: number,
  allChoices: readonly string[],
) {
  const normalizedDirectText = normalize(directText);
  if (normalizedDirectText.includes(normalize(correctChoice))) return true;

  const choiceNumber = correctIndex + 1;
  const circledNumber = ["①", "②", "③", "④", "⑤"][correctIndex] ?? "";
  const koreanOrdinal = [
    /첫(?:\s*번째)?/u,
    /두(?:\s*번째)?/u,
    /세(?:\s*번째)?/u,
    /네(?:\s*번째)?/u,
    /다섯(?:\s*번째)?/u,
  ][correctIndex];
  if (
    new RegExp(
      `(?:^|\\D)${choiceNumber}\\s*(?:번|선지|보기)|(?:보기|선지)\\s*${choiceNumber}(?:\\D|$)|\\bc${choiceNumber}\\b`,
      "iu",
    )
      .test(directText)
    || (circledNumber !== "" && directText.includes(circledNumber))
    || (koreanOrdinal?.test(directText) ?? false)
  ) {
    return true;
  }

  const tokens = choiceTokens(correctChoice);
  const matched = tokens.filter((token) => normalizedDirectText.includes(token));
  if (tokens.length > 0 && matched.length >= Math.min(2, tokens.length)) {
    return true;
  }

  const wrongChoiceTokens = new Set(
    allChoices.flatMap((choice, index) =>
      index === correctIndex ? [] : choiceTokens(choice)),
  );
  return matched.some((token) => !wrongChoiceTokens.has(token));
}

function numericTokens(value: string) {
  return [...new Set(value.match(/\d+(?:\.\d+)?/gu) ?? [])];
}

function addError(
  errors: WeldingCbtAnswerReviewError[],
  entry: PublishableWeldingCbtAnswerReviewEntry,
  code: string,
  detail: string,
) {
  errors.push({ code, canonicalId: entry.canonicalId, detail });
}

export function validateWeldingCbtExplanationSpecificityEntry(
  entry: PublishableWeldingCbtAnswerReviewEntry,
  source: BankRecord,
): WeldingCbtAnswerReviewError[] {
  const errors: WeldingCbtAnswerReviewError[] = [];
  const directText = explanationText(entry);
  const normalizedDirectText = normalize(directText);
  const correctChoice = source.choices[source.correctIndex ?? -1];
  const correctChoiceMentioned =
    correctChoice !== undefined
    && source.correctIndex !== null
    && mentionsCorrectChoice(
      directText,
      correctChoice,
      source.correctIndex,
      source.choices,
    );

  if (!correctChoice || !correctChoiceMentioned) {
    addError(errors, entry, "EXPLANATION_CORRECT_CHOICE_NOT_MENTIONED", "direct solution must name the correct source choice");
  }

  const anchors = stemAnchors(source.stem);
  if (
    !anchors.some((anchor) => normalizedDirectText.includes(anchor))
    && !correctChoiceMentioned
  ) {
    addError(errors, entry, "EXPLANATION_QUESTION_ANCHOR_MISSING", "direct solution must mention a non-generic stem term");
  }

  const normalizedFields = [entry.answerExplanation, ...entry.solutionSteps, entry.keyRule]
    .map(normalize)
    .filter(Boolean);
  const repeated = normalizedFields.find(
    (field, index) => normalizedFields.indexOf(field) !== index,
  );
  if (repeated) {
    addError(errors, entry, "EXPLANATION_REPEATED_GENERALITY", "answer explanation, steps, and key rule must not repeat the same text");
  }
  const genericPattern = GENERIC_EXPLANATION_PATTERNS.find((pattern) =>
    directText.includes(pattern),
  );
  if (genericPattern) {
    addError(errors, entry, "EXPLANATION_GENERIC_TEMPLATE", genericPattern);
  }

  if (entry.assessmentKind !== "calculation") return errors;

  if (!/[=＝]/u.test(directText)) {
    addError(errors, entry, "CALCULATION_FORMULA_MISSING", "formula must contain an equality expression");
  }
  const stemNumbers = numericTokens(source.stem);
  const substitutedNumbers = stemNumbers.filter((number) =>
    directText.includes(number),
  );
  if (
    stemNumbers.length === 0
    || substitutedNumbers.length < Math.min(2, stemNumbers.length)
  ) {
    addError(errors, entry, "CALCULATION_SUBSTITUTION_MISSING", "substitution must use at least two numeric values from the source stem");
  }
  if (!correctChoice || !correctChoiceMentioned) {
    addError(errors, entry, "CALCULATION_RESULT_MISSING", "calculation must state the selected source result");
  }
  if (
    !/(?:%|℃|°C|\b(?:j|cal|kg|g|l|a|v|w|pa|kpa|mpa|mm|cm|m|s|min|h|rpm|hz|bar|n)\b|kgf\/cm[²2]|l\/h|j\/cm)/iu
      .test(directText)
  ) {
    addError(errors, entry, "CALCULATION_UNIT_MISSING", "calculation must state a parseable unit");
  }
  return errors;
}

export function verifyWeldingCbtExplanationSpecificity(): ExplanationSpecificityReport {
  const errors: WeldingCbtAnswerReviewError[] = [];
  const sourceById = new Map<string, BankRecord>();
  for (const record of rawWeldingCbtBank.records) {
    if (!sourceById.has(record.canonicalId)) sourceById.set(record.canonicalId, record);
  }
  const approved = WELDING_CBT_ANSWER_REVIEWS.entries.filter(
    isWeldingCbtAnswerReviewPublishable,
  );

  for (const entry of approved) {
    errors.push(...validateWeldingCbtAnswerReviewQuality(entry));
    const source = sourceById.get(entry.canonicalId);
    if (!source || source.correctIndex === null) {
      errors.push({
        code: "EXPLANATION_SOURCE_RECORD_MISSING",
        canonicalId: entry.canonicalId,
        detail: "approved review has no source record with an answer",
      });
      continue;
    }
    errors.push(...validateWeldingCbtExplanationSpecificityEntry(entry, source));
  }
  return { ok: errors.length === 0, approvedCount: approved.length, errors };
}

if (process.argv[1]?.endsWith("verify-welding-cbt-explanation-specificity.ts")) {
  const report = verifyWeldingCbtExplanationSpecificity();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
}
