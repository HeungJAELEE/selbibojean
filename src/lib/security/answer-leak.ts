export const FORBIDDEN_PRE_SUBMIT_FIELDS = [
  "modelAnswer",
  "answerDefinition",
  "memoryTip",
  "correctAnswer",
  "correctChoiceId",
  "answerText",
  "requiredKeywords",
  "gradingRequiredKeywords",
  "acceptedAnswers",
  "rubric",
  "calculation",
  "calculationSteps",
  "traps",
  "choiceFeedback",
  "reviewNote",
  "learningAltText",
  "captionAfterAnswer",
  "promptFrameIds",
  "imagePaths",
  "outputAssetHash",
  "correctFrameIds",
] as const;

const forbiddenFields = new Set<string>(FORBIDDEN_PRE_SUBMIT_FIELDS);

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
    if (forbiddenFields.has(key)) {
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
