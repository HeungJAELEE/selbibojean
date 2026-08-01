export type AccountLearningAttempt = {
  questionId: string;
  sessionId: string | null;
  isCorrect: boolean;
  attemptedAt: string;
};

export type AccountQuestionMeta = {
  questionId: string;
  subjectId: string;
  subjectTitle: string;
  groupId: string;
  groupTitle: string;
  conceptId: string;
  conceptTitle: string;
  keywords: string[];
  groupHref?: string;
  conceptHref?: string;
};

export type LearningBreakdown = {
  id: string;
  title: string;
  subjectTitle: string;
  attempts: number;
  correct: number;
  accuracy: number;
  keywords: string[];
  href?: string;
};

export type AccountLearningSummary = {
  mockSessions: number;
  attempts: number;
  correct: number;
  wrong: number;
  accuracy: number | null;
  subjects: LearningBreakdown[];
  weakGroups: LearningBreakdown[];
  strongGroups: LearningBreakdown[];
  weakConcepts: LearningBreakdown[];
  focusKeywords: string[];
};

type MutableBreakdown = Omit<LearningBreakdown, "accuracy">;

export const WEAK_ACCURACY_THRESHOLD = 70;

export function buildAccountLearningSummary(
  attempts: AccountLearningAttempt[],
  questionMeta: AccountQuestionMeta[],
): AccountLearningSummary {
  const metadata = new Map(
    questionMeta.map((question) => [question.questionId, question]),
  );
  const subjects = new Map<string, MutableBreakdown>();
  const groups = new Map<string, MutableBreakdown>();
  const concepts = new Map<string, MutableBreakdown>();
  let correct = 0;
  let countedAttempts = 0;

  for (const attempt of attempts) {
    const meta = metadata.get(attempt.questionId);
    if (!meta) continue;
    countedAttempts += 1;
    correct += attempt.isCorrect ? 1 : 0;

    updateBreakdown(subjects, meta.subjectId, {
      title: meta.subjectTitle,
      subjectTitle: meta.subjectTitle,
      keywords: [],
      isCorrect: attempt.isCorrect,
    });
    updateBreakdown(groups, meta.groupId, {
      title: meta.groupTitle,
      subjectTitle: meta.subjectTitle,
      keywords: meta.keywords,
      href: meta.groupHref,
      isCorrect: attempt.isCorrect,
    });
    updateBreakdown(concepts, meta.conceptId, {
      title: meta.conceptTitle,
      subjectTitle: `${meta.subjectTitle} · ${meta.groupTitle}`,
      keywords: meta.keywords,
      href: meta.conceptHref,
      isCorrect: attempt.isCorrect,
    });
  }

  const subjectRows = toBreakdowns(subjects).sort(
    (left, right) =>
      right.attempts - left.attempts ||
      left.subjectTitle.localeCompare(right.subjectTitle, "ko"),
  );
  const groupRows = toBreakdowns(groups).filter((item) => item.attempts >= 2);
  const conceptRows = toBreakdowns(concepts).filter(
    (item) => item.attempts >= 2,
  );
  const weakGroups = [...groupRows]
    .filter((item) => item.accuracy < WEAK_ACCURACY_THRESHOLD)
    .sort(compareWeakness)
    .slice(0, 5);
  const strongGroups = [...groupRows]
    .filter((item) => item.accuracy >= WEAK_ACCURACY_THRESHOLD)
    .sort(
      (left, right) =>
        right.accuracy - left.accuracy ||
        right.attempts - left.attempts ||
        left.title.localeCompare(right.title, "ko"),
    )
    .slice(0, 3);
  const weakConcepts = [...conceptRows]
    .filter((item) => item.accuracy < WEAK_ACCURACY_THRESHOLD)
    .sort(compareWeakness)
    .slice(0, 6);

  return {
    mockSessions: new Set(
      attempts.flatMap((attempt) =>
        attempt.sessionId ? [attempt.sessionId] : [],
      ),
    ).size,
    attempts: countedAttempts,
    correct,
    wrong: countedAttempts - correct,
    accuracy:
      countedAttempts > 0 ? Math.round((correct / countedAttempts) * 100) : null,
    subjects: subjectRows,
    weakGroups,
    strongGroups,
    weakConcepts,
    focusKeywords: [
      ...new Set(weakGroups.flatMap((group) => group.keywords)),
    ].slice(0, 10),
  };
}

function updateBreakdown(
  target: Map<string, MutableBreakdown>,
  id: string,
  input: {
    title: string;
    subjectTitle: string;
    keywords: string[];
    href?: string;
    isCorrect: boolean;
  },
) {
  const row = target.get(id) ?? {
    id,
    title: input.title,
    subjectTitle: input.subjectTitle,
    attempts: 0,
    correct: 0,
    keywords: input.keywords.slice(0, 6),
    href: input.href,
  };
  row.attempts += 1;
  row.correct += input.isCorrect ? 1 : 0;
  target.set(id, row);
}

function toBreakdowns(rows: Map<string, MutableBreakdown>) {
  return [...rows.values()].map((row) => ({
    ...row,
    accuracy: Math.round((row.correct / row.attempts) * 100),
  }));
}

function compareWeakness(left: LearningBreakdown, right: LearningBreakdown) {
  return (
    left.accuracy - right.accuracy ||
    right.attempts - left.attempts ||
    left.title.localeCompare(right.title, "ko")
  );
}
