export const FORBIDDEN_PRE_SUBMIT_FIELDS = [
  "answer",
  "modelAnswer",
  "answerDefinition",
  "answerExplanation",
  "answerKey",
  "memoryTip",
  "correctAnswer",
  "correctChoice",
  "correctChoiceId",
  "isCorrect",
  "answerText",
  "explanation",
  "requiredKeywords",
  "gradingRequiredKeywords",
  "acceptedAnswers",
  "rubric",
  "gradingRubric",
  "gradingCriteria",
  "scoringRubric",
  "scoringCriteria",
  "markingScheme",
  "calculation",
  "calculationSteps",
  "directSolution",
  "solution",
  "solutionSteps",
  "solutionGuide",
  "traps",
  "feedback",
  "choiceFeedback",
  "choiceExplanations",
  "choiceRationales",
  "rationale",
  "plausibleReason",
  "incorrectPoint",
  "differenceFromCorrect",
  "selectedChoiceReason",
  "otherChoices",
  "approvedReview",
  "keyRule",
  "conceptBinding",
  "assertionText",
  "essentialRank",
  "conceptSupport",
  "reviewNote",
  "learningAltText",
  "captionAfterAnswer",
  "promptFrameIds",
  "imagePaths",
  "outputAssetHash",
  "correctFrameIds",
] as const;

function normalizeFieldName(field: string) {
  return field.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();
}

function fieldNameTokens(field: string) {
  return field
    .normalize("NFKC")
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

const forbiddenFields = new Set<string>(
  FORBIDDEN_PRE_SUBMIT_FIELDS.map(normalizeFieldName),
);

const allowedAnswerMetadataFields = new Set([
  normalizeFieldName("answerCritical"),
  normalizeFieldName("captionBeforeAnswer"),
]);

const forbiddenFieldTokens = new Set([
  "answer",
  "answers",
  "correct",
  "grading",
  "marking",
  "rubric",
  "rubrics",
  "scoring",
  "solution",
  "solutions",
]);

function isForbiddenPreSubmitField(field: string) {
  const normalizedField = normalizeFieldName(field);
  if (forbiddenFields.has(normalizedField)) return true;
  if (allowedAnswerMetadataFields.has(normalizedField)) return false;

  const tokens = new Set(fieldNameTokens(field));
  if ([...tokens].some((token) => forbiddenFieldTokens.has(token))) {
    return true;
  }
  return (
    tokens.has("choice") &&
    (tokens.has("feedback") ||
      tokens.has("explanation") ||
      tokens.has("explanations") ||
      tokens.has("rationale") ||
      tokens.has("rationales"))
  );
}

export type AnswerLeakFinding = {
  path: string;
  field: string;
};

export function findForbiddenPreSubmitFields(
  value: unknown,
  path = "$",
): AnswerLeakFinding[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findForbiddenPreSubmitFields(item, `${path}[${index}]`),
    );
  }
  if (!value || typeof value !== "object") return [];

  const findings: AnswerLeakFinding[] = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (isForbiddenPreSubmitField(key)) {
      findings.push({ path: childPath, field: key });
    }
    findings.push(...findForbiddenPreSubmitFields(child, childPath));
  }
  return findings;
}

export function normalizeAnswerSentinel(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}

export function uniqueAnswerSentinels(
  values: string[],
  minimumLength = 48,
): string[] {
  return [
    ...new Set(
      values
        .map(normalizeAnswerSentinel)
        .filter((value) => value.length >= minimumLength),
    ),
  ];
}
