import type { Lesson, PracticeFeedback, PublicQuestion, Question, SelfRating } from "./types";

export type PracticeFilter = {
  subjectId?: string;
  conceptGroupId?: string;
  questionIds?: string[];
};

export type WeakFocus = {
  questionIds: string[];
  groups: Array<{ id: string; mistakes: number }>;
  fallback: boolean;
};

export type SubjectAllocation = {
  subjectId: string;
  count: number;
};

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleQuestionIds(ids: string[], seed: number) {
  const random = mulberry32(seed);
  const result = [...ids];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function isPublishableQuestion(question: Question) {
  return (
    question.contentStatus === "published" &&
    question.validation.answer &&
    question.validation.explanation &&
    question.validation.choiceFeedback &&
    question.validation.theoryLink &&
    question.validation.contentQuality &&
    question.choices.length >= 2
  );
}

export function selectPracticeQuestions(
  questions: Question[],
  filter: PracticeFilter,
  requestedCount: number | "all",
  seed = Date.now(),
) {
  const eligible = [
    ...new Map(
      questions
        .filter(
          (question) =>
            isPublishableQuestion(question) &&
            (!filter.subjectId || question.subjectId === filter.subjectId) &&
            (!filter.conceptGroupId || question.conceptGroupId === filter.conceptGroupId) &&
            (!filter.questionIds || filter.questionIds.includes(question.id)),
        )
        .map((question) => [question.id, question]),
    ).values(),
  ];
  const shuffledIds = shuffleQuestionIds(
    eligible.map((question) => question.id),
    seed,
  );
  const count = requestedCount === "all" ? shuffledIds.length : Math.min(requestedCount, shuffledIds.length);
  const selectedIds = shuffledIds.slice(0, count);
  const questionById = new Map(eligible.map((question) => [question.id, question]));

  return {
    availableCount: eligible.length,
    requestedCount,
    limited: requestedCount !== "all" && eligible.length < requestedCount,
    questions: selectedIds.map((id) => questionById.get(id)).filter((question): question is Question => Boolean(question)),
  };
}

export function buildWeakFocus(
  questions: Question[],
  wrongQuestionIds: string[],
  subjectId?: string,
  maxGroups = 3,
): WeakFocus {
  const eligible = questions.filter(
    (question) => isPublishableQuestion(question) && (!subjectId || question.subjectId === subjectId),
  );
  const eligibleById = new Map(eligible.map((question) => [question.id, question]));
  const mistakeCounts = new Map<string, number>();

  for (const questionId of wrongQuestionIds) {
    const question = eligibleById.get(questionId);
    if (!question) continue;
    mistakeCounts.set(question.conceptGroupId, (mistakeCounts.get(question.conceptGroupId) ?? 0) + 1);
  }

  const groups = [...mistakeCounts.entries()]
    .map(([id, mistakes]) => ({ id, mistakes }))
    .sort((left, right) => right.mistakes - left.mistakes || left.id.localeCompare(right.id))
    .slice(0, maxGroups);
  const focusedGroupIds = new Set(groups.map((group) => group.id));

  return {
    questionIds: groups.length > 0
      ? eligible.filter((question) => focusedGroupIds.has(question.conceptGroupId)).map((question) => question.id)
      : eligible.map((question) => question.id),
    groups,
    fallback: groups.length === 0,
  };
}

export function selectAllocatedPracticeQuestions(
  questions: Question[],
  allocations: SubjectAllocation[],
  seed: number,
) {
  const selected: Question[] = [];
  const usedQuestionIds = new Set<string>();
  const breakdown = allocations.map((allocation, index) => {
    const result = selectPracticeQuestions(
      questions.filter((question) => !usedQuestionIds.has(question.id)),
      { subjectId: allocation.subjectId },
      allocation.count,
      seed ^ ((index + 1) * 0x45d9f3b),
    );
    selected.push(...result.questions);
    result.questions.forEach((question) => usedQuestionIds.add(question.id));
    return {
      subjectId: allocation.subjectId,
      requestedCount: allocation.count,
      actualCount: result.questions.length,
      availableCount: result.availableCount,
      limited: result.limited,
    };
  });
  const selectedById = new Map(selected.map((question) => [question.id, question]));
  const shuffled = shuffleQuestionIds([...selectedById.keys()], seed ^ 0x6a09e667)
    .map((id) => selectedById.get(id))
    .filter((question): question is Question => Boolean(question));

  return {
    availableCount: breakdown.reduce((total, item) => total + item.availableCount, 0),
    requestedCount: allocations.reduce((total, item) => total + item.count, 0),
    limited: breakdown.some((item) => item.limited),
    questions: shuffled,
    breakdown,
  };
}

export function toPublicQuestion(question: Question): PublicQuestion {
  const { correctChoiceId, answerText, explanation, errorReason, validation, reviewStatus, publication, verification, choices, ...safeQuestion } = question;
  void correctChoiceId;
  void answerText;
  void explanation;
  void errorReason;
  void validation;
  void reviewStatus;
  void publication;
  return {
    ...safeQuestion,
    choices: choices.map(({ id, order, text }) => ({ id, order, text })),
    provenance: {
      reconstructed: verification?.riskTags.includes("editorial_reconstruction") ?? false,
      historical: verification?.riskTags.includes("historical_context") ?? false,
      original: false,
    },
  };
}

export function gradeQuestion(
  question: Question,
  choiceId: string,
  selfRating: SelfRating,
  lesson?: Lesson,
): PracticeFeedback {
  const selectedChoice = question.choices.find((choice) => choice.id === choiceId);
  const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);
  if (!selectedChoice || !correctChoice) {
    throw new Error("선택지를 확인할 수 없습니다.");
  }

  const isCorrect = selectedChoice.id === correctChoice.id;
  const supportBlocks = lesson
    ? [
        lesson.blocks.find((block) => block.id === question.lessonAnchor),
        lesson.blocks.find((block) => block.kind === "definition"),
        lesson.blocks.find((block) => block.kind === "formula" || block.kind === "diagnosis"),
        lesson.blocks.find((block) => block.kind === "exam_point"),
        lesson.blocks.find((block) => block.kind === "trap"),
      ]
        .filter((block): block is Lesson["blocks"][number] => Boolean(block))
        .filter((block, index, blocks) => blocks.findIndex((candidate) => candidate.id === block.id) === index)
        .slice(0, 4)
    : [];

  return {
    isCorrect,
    selectedChoice: {
      id: selectedChoice.id,
      text: selectedChoice.text,
      ...selectedChoice.feedback,
    },
    correctChoice: { id: correctChoice.id, text: correctChoice.text },
    explanation: question.explanation,
    errorReason: isCorrect ? null : question.errorReason,
    selfRating,
    lesson: {
      id: question.lessonId,
      anchor: question.lessonAnchor,
      href: `/written/theory/${question.lessonId}#${question.lessonAnchor}`,
    },
    conceptSupport: lesson
      ? {
          title: lesson.title,
          summary: lesson.summary,
          blocks: supportBlocks.map(({ id, kind, title, body }) => ({ id, kind, title, body })),
        }
      : null,
    otherChoices: question.choices
      .filter((choice) => choice.id !== selectedChoice.id)
      .map((choice) => ({ id: choice.id, text: choice.text, isCorrect: choice.id === correctChoice.id, ...choice.feedback })),
  };
}
