import type { PublicQuestion, Question, SelfRating } from "./types";

export type PracticeFilter = {
  subjectId?: string;
  conceptGroupId?: string;
  questionIds?: string[];
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
    question.choices.length >= 2
  );
}

export function selectPracticeQuestions(
  questions: Question[],
  filter: PracticeFilter,
  requestedCount: number | "all",
  seed = Date.now(),
) {
  const eligible = questions.filter(
    (question) =>
      isPublishableQuestion(question) &&
      (!filter.subjectId || question.subjectId === filter.subjectId) &&
      (!filter.conceptGroupId || question.conceptGroupId === filter.conceptGroupId) &&
      (!filter.questionIds || filter.questionIds.includes(question.id)),
  );
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

export function toPublicQuestion(question: Question): PublicQuestion {
  const { correctChoiceId, answerText, explanation, errorReason, validation, reviewStatus, choices, ...safeQuestion } = question;
  void correctChoiceId;
  void answerText;
  void explanation;
  void errorReason;
  void validation;
  void reviewStatus;
  return { ...safeQuestion, choices: choices.map(({ id, order, text }) => ({ id, order, text })) };
}

export function gradeQuestion(question: Question, choiceId: string, selfRating: SelfRating) {
  const selectedChoice = question.choices.find((choice) => choice.id === choiceId);
  const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);
  if (!selectedChoice || !correctChoice) {
    throw new Error("선택지를 확인할 수 없습니다.");
  }

  const isCorrect = selectedChoice.id === correctChoice.id;
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
    otherChoices: question.choices
      .filter((choice) => choice.id !== selectedChoice.id)
      .map((choice) => ({ id: choice.id, text: choice.text, isCorrect: choice.id === correctChoice.id, ...choice.feedback })),
  };
}
