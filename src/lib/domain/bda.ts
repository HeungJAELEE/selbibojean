import { z } from "zod";

export const bdaSourceRefSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  sourceType: z.enum(["official_scope", "user_provided", "self_authored"]),
  evidenceGrade: z.enum(["A", "B", "C"]),
  reviewedAt: z.string().min(1),
});

export const bdaSubjectSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  accent: z.string().min(1),
  sourceRefs: z.array(bdaSourceRefSchema).min(1),
});

export const bdaLessonSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string().min(1),
  learningGoals: z.array(z.string().min(1)).min(2),
  keyPoints: z.array(z.string().min(1)).min(3),
  examTraps: z.array(z.string().min(1)).min(2),
  relatedTerms: z.array(z.string().min(1)).min(2),
  conceptDefinition: z.array(z.string().min(1)).min(2),
  decisionSteps: z
    .array(
      z.object({
        label: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(3),
  comparisonRows: z
    .array(
      z.object({
        label: z.string().min(1),
        core: z.string().min(1),
        use: z.string().min(1),
        trap: z.string().min(1),
      }),
    )
    .min(2),
  examChecklist: z.array(z.string().min(1)).min(3),
  memoryLine: z.string().min(1),
  sourceRefs: z.array(bdaSourceRefSchema).min(1),
  questionIds: z.array(z.string().min(1)),
  contentStatus: z.enum(["draft", "in_review", "published"]),
});

export const bdaChoiceSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  text: z.string().min(1),
  feedback: z.string().min(1),
});

export const bdaQuestionSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  lessonId: z.string().min(1),
  stem: z.string().min(1),
  choices: z.array(bdaChoiceSchema).length(4),
  correctChoiceId: z.string().min(1),
  explanation: z.string().min(1),
  sourceLabel: z.string().min(1),
  sourceType: z.enum(["self_authored", "user_provided", "public_reconstruction"]),
  evidenceGrade: z.enum(["A", "B", "C"]),
  reviewStatus: z.enum(["verified", "review_required", "content_pending"]),
  contentStatus: z.enum(["draft", "in_review", "published"]),
});

export const bdaContentSchema = z.object({
  formatVersion: z.literal(1),
  generatedAt: z.string().min(1),
  sourceHubUrl: z.string().url(),
  subjects: z.array(bdaSubjectSchema).length(4),
  lessons: z.array(bdaLessonSchema).min(1),
  questions: z.array(bdaQuestionSchema),
  notes: z.array(z.string()),
});

export const bdaSubmitSchema = z.object({
  questionId: z.string().min(1).max(80),
  choiceId: z.string().min(1).max(80),
});

export type BdaSourceRef = z.infer<typeof bdaSourceRefSchema>;
export type BdaSubject = z.infer<typeof bdaSubjectSchema>;
export type BdaLesson = z.infer<typeof bdaLessonSchema>;
export type BdaChoice = z.infer<typeof bdaChoiceSchema>;
export type BdaQuestion = z.infer<typeof bdaQuestionSchema>;
export type BdaContent = z.infer<typeof bdaContentSchema>;

export type PublicBdaQuestion = Omit<
  BdaQuestion,
  | "correctChoiceId"
  | "explanation"
  | "reviewStatus"
  | "contentStatus"
  | "evidenceGrade"
  | "choices"
> & {
  choices: Array<Pick<BdaChoice, "id" | "order" | "text">>;
};

export type BdaPracticeFeedback = {
  isCorrect: boolean;
  selectedChoice: Pick<BdaChoice, "id" | "text"> & { feedback: string };
  correctChoice: Pick<BdaChoice, "id" | "text">;
  explanation: string;
  otherChoices: Array<
    Pick<BdaChoice, "id" | "text"> & { feedback: string; isCorrect: boolean }
  >;
  lesson: {
    id: string;
    href: string;
  };
};

export function isPublishableBdaQuestion(question: BdaQuestion) {
  return (
    question.contentStatus === "published" &&
    question.reviewStatus === "verified" &&
    question.choices.length === 4 &&
    question.choices.some((choice) => choice.id === question.correctChoiceId)
  );
}

export function toPublicBdaQuestion(
  question: BdaQuestion,
): PublicBdaQuestion {
  const {
    correctChoiceId,
    explanation,
    reviewStatus,
    contentStatus,
    evidenceGrade,
    choices,
    ...safe
  } = question;
  void correctChoiceId;
  void explanation;
  void reviewStatus;
  void contentStatus;
  void evidenceGrade;

  return {
    ...safe,
    choices: choices.map(({ id, order, text }) => ({ id, order, text })),
  };
}

export function gradeBdaQuestion(
  question: BdaQuestion,
  choiceId: string,
): BdaPracticeFeedback {
  const selectedChoice = question.choices.find(
    (choice) => choice.id === choiceId,
  );
  const correctChoice = question.choices.find(
    (choice) => choice.id === question.correctChoiceId,
  );

  if (!selectedChoice || !correctChoice) {
    throw new Error("선택지를 확인할 수 없습니다.");
  }

  return {
    isCorrect: selectedChoice.id === correctChoice.id,
    selectedChoice: {
      id: selectedChoice.id,
      text: selectedChoice.text,
      feedback: selectedChoice.feedback,
    },
    correctChoice: {
      id: correctChoice.id,
      text: correctChoice.text,
    },
    explanation: question.explanation,
    otherChoices: question.choices
      .filter((choice) => choice.id !== selectedChoice.id)
      .map((choice) => ({
        id: choice.id,
        text: choice.text,
        feedback: choice.feedback,
        isCorrect: choice.id === correctChoice.id,
      })),
    lesson: {
      id: question.lessonId,
      href: `/bda/written/theory/${question.lessonId}#exam-traps`,
    },
  };
}
