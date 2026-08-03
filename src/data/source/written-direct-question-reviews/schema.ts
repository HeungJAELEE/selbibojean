import { z } from "zod";

const choiceRationaleSchema = z.object({
  choiceId: z.string().min(1),
  verdict: z.enum(["correct", "incorrect"]),
  rationale: z.string().min(24),
});

const approvedReviewSchema = z.object({
  questionId: z.string().min(1),
  subjectId: z.enum(["subject-1", "subject-2", "subject-3", "subject-4"]).optional(),
  decision: z.literal("approve"),
  correctChoiceId: z.string().min(1),
  directSolution: z.string().min(24),
  choiceRationales: z.array(choiceRationaleSchema).length(4),
  misconception: z.string().min(12),
  existingLessonId: z.string().min(1),
  existingBlockId: z.string().min(1),
  assertionText: z.string().min(12),
  evidenceUrls: z.array(z.url()).min(1),
  reviewedAt: z.iso.datetime({ offset: true }),
});

const heldReviewSchema = z.object({
  questionId: z.string().min(1),
  subjectId: z.enum(["subject-1", "subject-2", "subject-3", "subject-4"]).optional(),
  decision: z.literal("hold"),
  holdReason: z.string().min(12),
  evidenceUrls: z.array(z.url()),
  reviewedAt: z.iso.datetime({ offset: true }),
});

export const writtenDirectQuestionReviewSchema = z.discriminatedUnion(
  "decision",
  [approvedReviewSchema, heldReviewSchema],
);

export type WrittenDirectQuestionReview = z.infer<
  typeof writtenDirectQuestionReviewSchema
>;

export function parseWrittenDirectQuestionReviews(input: unknown) {
  const reviews = z.array(writtenDirectQuestionReviewSchema).parse(input);
  const ids = reviews.map((review) => review.questionId);
  if (new Set(ids).size !== ids.length) {
    throw new Error("WRITTEN_DIRECT_REVIEW_DUPLICATE_QUESTION_ID");
  }
  return reviews;
}
