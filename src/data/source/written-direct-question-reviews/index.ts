import subjectOneBatch01 from "./subject-1-batch-01.json";
import subjectOneBatch02 from "./subject-1-batch-02.json";
import subjectOneBatch03 from "./subject-1-batch-03.json";
import subjectOneBatch04 from "./subject-1-batch-04.json";
import subjectOneBatch05 from "./subject-1-batch-05.json";
import subjectOneBatch06 from "./subject-1-batch-06.json";
import subjectOneBacklogBatch01 from "./subject-1-backlog-batch-01.json";
import subjectOneGptBatch01 from "./subject-1-gpt-batch-01.json";
import subjectOneGptHoldBatch01 from "./subject-1-gpt-hold-batch-01-review.json";
import subjectOneGptHoldBatch02 from "./subject-1-gpt-hold-batch-02.json";
import subjectOneGptHoldBatch03 from "./subject-1-gpt-hold-batch-03.json";
import subjectOneGptHoldBatch04 from "./subject-1-gpt-hold-batch-04.json";
import subjectOneGptHoldBatch05 from "./subject-1-gpt-hold-batch-05.json";
import subjectTwoBatch01 from "./subject-2-batch-01.json";
import subjectTwoBatch02 from "./subject-2-batch-02.json";
import subjectTwoGptBacklogBatch01 from "./subject-2-gpt-backlog-batch-01.json";
import subjectTwoGptBacklogBatch02 from "./subject-2-gpt-backlog-batch-02.json";
import subjectTwoGptBacklogBatch03 from "./subject-2-gpt-backlog-batch-03.json";
import { applyIndependentReviewGates } from "./independent-review-gates";
import { parseWrittenDirectQuestionReviews } from "./schema";
import { SUBJECT_THREE_DIRECT_REVIEW_BATCH_01 } from "./subject-3-batch-01";
import subjectThreeBatch02 from "./subject-3-batch-02.json";
import subjectThreeBatch03 from "./subject-3-batch-03.json";
import subjectThreeBatch04 from "./subject-3-batch-04.json";
import subjectThreeBatch05 from "./subject-3-batch-05.json";
import subjectThreeBatch06 from "./subject-3-batch-06.json";
import subjectThreeBacklogBatch01 from "./subject-3-backlog-batch-01.json";
import subjectThreeGptBatch01 from "./subject-3-gpt-batch-01.json";
import subjectThreeGptHoldBatch01 from "./subject-3-gpt-hold-batch-01.json";
import subjectThreeGptHoldBatch02 from "./subject-3-gpt-hold-batch-02.json";
import subjectThreeGptHoldBatch03 from "./subject-3-gpt-hold-batch-03.json";
import subjectThreeGptHoldBatch04 from "./subject-3-gpt-hold-batch-04.json";
import subjectThreeGptHoldBatch05 from "./subject-3-gpt-hold-batch-05.json";
import subjectFourBatch01 from "./subject-4-batch-01.json";
import subjectFourBatch02 from "./subject-4-batch-02.json";
import subjectFourBatch03 from "./subject-4-batch-03.json";
import subjectFourBacklogBatch01 from "./subject-4-backlog-batch-01.json";
import subjectFourGptBatch01 from "./subject-4-gpt-batch-01.json";
import subjectFourGptBatch02 from "./subject-4-gpt-batch-02.json";
import subjectFourGptBatch03 from "./subject-4-gpt-batch-03.json";
import subjectFourGptBatch04 from "./subject-4-gpt-batch-04.json";
import subjectFourGptBatch05 from "./subject-4-gpt-batch-05.json";
import subjectFourGptBatch06 from "./subject-4-gpt-batch-06.json";
import subjectFourGptBatch07 from "./subject-4-gpt-batch-07.json";
import subjectFourGptBatch08 from "./subject-4-gpt-batch-08.json";
import subjectFourGptBatch09 from "./subject-4-gpt-batch-09.json";
import subjectFourGptBatch10 from "./subject-4-gpt-batch-10.json";
import subjectFourGptBatch11 from "./subject-4-gpt-batch-11.json";
import subjectFourGptBatch12 from "./subject-4-gpt-batch-12.json";
import subjectFourGptBatch13 from "./subject-4-gpt-batch-13.json";
import subjectFourGptBatch14 from "./subject-4-gpt-batch-14.json";
import subjectFourGptBatch15 from "./subject-4-gpt-batch-15.json";
import subjectFourGptBatch16 from "./subject-4-gpt-batch-16.json";
import subjectFourGptHoldBatch01 from "./subject-4-gpt-hold-batch-01.json";

const subjectThreeGptHoldQuestionIds = new Set(
  [
    ...subjectThreeGptHoldBatch01,
    ...subjectThreeGptHoldBatch02,
    ...subjectThreeGptHoldBatch03,
    ...subjectThreeGptHoldBatch04,
    ...subjectThreeGptHoldBatch05,
  ].map((review) => review.questionId),
);

const subjectTwoGptBacklogQuestionIds = new Set(
  [
    ...subjectTwoGptBacklogBatch01,
    ...subjectTwoGptBacklogBatch02,
    ...subjectTwoGptBacklogBatch03,
  ].map((review) => review.questionId),
);

export const WRITTEN_DIRECT_QUESTION_REVIEWS =
  applyIndependentReviewGates(
    parseWrittenDirectQuestionReviews([
      ...subjectOneBatch01,
      ...subjectOneBatch02,
      ...subjectOneBatch03,
      ...subjectOneBatch04,
      ...subjectOneBatch05,
      ...subjectOneBatch06,
      ...subjectOneGptBatch01,
      ...subjectOneBacklogBatch01.filter(
        (review) =>
          review.questionId !== "U-117" &&
          review.questionId !== "U-410" &&
          review.questionId !== "U-693" &&
          review.questionId !== "U-948" &&
          review.questionId !== "U-1046" &&
          review.questionId !== "U-1390",
      ),
      ...subjectOneGptHoldBatch01,
      ...subjectOneGptHoldBatch02,
      ...subjectOneGptHoldBatch03,
      ...subjectOneGptHoldBatch04,
      ...subjectOneGptHoldBatch05,
      ...subjectTwoBatch01.filter(
        (review) => !subjectTwoGptBacklogQuestionIds.has(review.questionId),
      ),
      ...subjectTwoBatch02.filter(
        (review) => !subjectTwoGptBacklogQuestionIds.has(review.questionId),
      ),
      ...subjectTwoGptBacklogBatch01,
      ...subjectTwoGptBacklogBatch02,
      ...subjectTwoGptBacklogBatch03,
      ...SUBJECT_THREE_DIRECT_REVIEW_BATCH_01,
      ...subjectThreeBatch02,
      ...subjectThreeBatch03,
      ...subjectThreeBatch04,
      ...subjectThreeBatch05.filter(
        (review) => !subjectThreeGptHoldQuestionIds.has(review.questionId),
      ),
      ...subjectThreeBatch06.filter(
        (review) => !subjectThreeGptHoldQuestionIds.has(review.questionId),
      ),
      ...subjectThreeBacklogBatch01.filter(
        (review) => !subjectThreeGptHoldQuestionIds.has(review.questionId),
      ),
      ...subjectThreeGptBatch01,
      ...subjectThreeGptHoldBatch01,
      ...subjectThreeGptHoldBatch02,
      ...subjectThreeGptHoldBatch03,
      ...subjectThreeGptHoldBatch04,
      ...subjectThreeGptHoldBatch05,
      ...subjectFourBatch01,
      ...subjectFourBatch02,
      ...subjectFourBatch03,
      ...subjectFourBacklogBatch01.filter(
        (review) =>
          review.questionId !== "U-032" &&
          review.questionId !== "U-352" &&
          review.questionId !== "U-425" &&
          review.questionId !== "U-566" &&
          review.questionId !== "U-812",
      ),
      ...subjectFourGptBatch01,
      ...subjectFourGptBatch02,
      ...subjectFourGptBatch03,
      ...subjectFourGptBatch04,
      ...subjectFourGptBatch05,
      ...subjectFourGptBatch06,
      ...subjectFourGptBatch07,
      ...subjectFourGptBatch08,
      ...subjectFourGptBatch09,
      ...subjectFourGptBatch10,
      ...subjectFourGptBatch11,
      ...subjectFourGptBatch12,
      ...subjectFourGptBatch13,
      ...subjectFourGptBatch14,
      ...subjectFourGptBatch15,
      ...subjectFourGptBatch16,
      ...subjectFourGptHoldBatch01,
    ]),
  );
