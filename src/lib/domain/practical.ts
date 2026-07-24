import type {
  PracticalQuestion,
  PublicPracticalQuestion,
} from "./practical-types";

export function isPublishablePracticalQuestion(question: PracticalQuestion) {
  return (
    question.contentStatus === "published" &&
    (question.auditDisposition === "verified" ||
      question.auditDisposition === "cbt_corrected") &&
    question.modelAnswer.length > 0 &&
    question.requiredKeywords.length > 0 &&
    question.conceptIds.length > 0 &&
    (question.ncsSources.length > 0 ||
      (question.kind === "past" && Boolean(question.occurrence?.sourceUrl)))
  );
}

export function toPublicPracticalQuestion(
  question: PracticalQuestion,
): PublicPracticalQuestion {
  const {
    modelAnswer,
    requiredKeywords,
    acceptedAnswers,
    calculation,
    rubric,
    traps,
    reviewNote,
    ...safe
  } = question;
  void modelAnswer;
  void requiredKeywords;
  void acceptedAnswers;
  void calculation;
  void rubric;
  void traps;
  void reviewNote;
  return safe;
}
