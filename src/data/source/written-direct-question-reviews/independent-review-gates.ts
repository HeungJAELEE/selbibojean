import type { WrittenDirectQuestionReview } from "./schema";

/**
 * Schema-valid author approvals remain candidates for the downstream
 * fail-closed content gate. This routing step must not downgrade an approval
 * solely because its question ID is absent from a manually maintained list.
 *
 * applyWrittenDirectFeedback owns answer/choice consistency, calculation
 * completeness, lesson-category binding, and audit HOLD enforcement.
 */
export function applyIndependentReviewGates(
  reviews: WrittenDirectQuestionReview[],
): WrittenDirectQuestionReview[] {
  return reviews;
}
