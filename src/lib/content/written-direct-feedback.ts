import { WRITTEN_DIRECT_QUESTION_REVIEWS } from "@/data/source/written-direct-question-reviews";
import type { WrittenDirectQuestionReview } from "@/data/source/written-direct-question-reviews/schema";
import type {
  ChoiceFeedback,
  GeneratedContent,
  Lesson,
  PublicationBlocker,
  Question,
} from "@/lib/domain/types";

const TARGET_SUBJECT_IDS = new Set([
  "subject-1",
  "subject-2",
  "subject-3",
  "subject-4",
]);
const GENERIC_RATIONALE_PATTERNS = [
  /관련 용어이지만/u,
  /질문이 요구하는 조건에 직접 답/u,
  /같은 분야의 용어나 조건/u,
  /같은\s*분야(?:의)?\s*용어(?:라|여서|이므로)[^.!?]*(?:그럴듯|정답처럼)/u,
  /정답 보기와 다릅니다/u,
  /문제의 대상이 사람·장비·재료·공정/u,
  /같은 단어가 포함됐다는 이유만으로/u,
  /이 레슨에 연결된 CBT 원문/u,
];
const INSUFFICIENT_WRONG_REASON_PATTERN =
  /정답(?:\s*보기)?(?:과|와)\s*다르(?:다|습니다)[\s.!?。]*$/u;
const NEAR_DUPLICATE_MINIMUM_LENGTH = 32;
const NEAR_DUPLICATE_SIMILARITY = 0.86;
const EXPLICIT_CALCULATION_QUESTION_PATTERN = /계산|구하|산출/u;
const CONDITIONAL_CALCULATION_QUESTION_PATTERN = /일\s*때|주어졌을\s*때/u;
const SYMBOLIC_LOGIC_QUESTION_PATTERN =
  /진리표|논리(?:식|회로)?|(?:입력[^.!?]*출력|출력[^.!?]*입력)|\b(?:AND|OR|NOR|NAND|NOT)\b/iu;
const CALCULATION_SECTION_PATTERN = /(?:공식|단위|대입|결과)\s*:/u;
const FORMULA_PATTERN =
  /(?:공식|계산식|관계식)\s*:|\([^)]*[A-Za-z가-힣][^)]*[-+×*/÷][^)]*\)\s*[×*/÷]/u;
const UNIT_PATTERN =
  /(?:단위\s*:|%|퍼센트|mm|cm|km|kg|kW|MPa|kPa|rpm|Hz|Pa|bar|N|W|A|V|J|℃|°C)/iu;
const SUBSTITUTION_PATTERN =
  /(?:대입\s*:|\d+(?:[.,]\d+)?\s*(?:[A-Za-z가-힣°%³²]+)?\s*[-+×*xX/÷]\s*\d)/u;
const RESULT_PATTERN =
  /(?:결과\s*:|=\s*[-+]?\d+(?:[.,]\d+)?\s*(?:%|mm|cm|km|kg|kW|MPa|kPa|rpm|Hz|Pa|bar|N|W|A|V|J|℃|°C)?)/iu;

type ApprovedReview = Extract<
  WrittenDirectQuestionReview,
  { decision: "approve" }
>;

type ExplanationRecord = {
  questionId: string;
  kind: "solution" | "choice";
  value: string;
};

function normalizeExplanation(value: string) {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function normalizeExplanationTemplate(value: string) {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/\d+(?:[.,]\d+)?/gu, "#")
    .replace(/[^\p{L}#]+/gu, "");
}

function shingles(value: string, size = 4) {
  const result = new Set<string>();
  for (let index = 0; index <= value.length - size; index += 1) {
    result.add(value.slice(index, index + size));
  }
  return result;
}

function diceSimilarity(left: Set<string>, right: Set<string>) {
  let overlap = 0;
  for (const value of left) {
    if (right.has(value)) overlap += 1;
  }
  return left.size + right.size === 0
    ? 0
    : (2 * overlap) / (left.size + right.size);
}

function explanationRecords(reviews: readonly ApprovedReview[]) {
  return reviews.flatMap<ExplanationRecord>((review) => [
    {
      questionId: review.questionId,
      kind: "solution",
      value: review.directSolution,
    },
    ...review.choiceRationales.map((choice) => ({
      questionId: review.questionId,
      kind: "choice" as const,
      value: choice.rationale,
    })),
  ]);
}

function assertNoDuplicateExplanations(reviews: readonly ApprovedReview[]) {
  const records = explanationRecords(reviews);
  const exactByText = new Map<string, ExplanationRecord>();

  for (const record of records) {
    const normalized = normalizeExplanation(record.value);
    const previous = exactByText.get(normalized);
    if (previous && previous.questionId !== record.questionId) {
      throw new Error(
        `WRITTEN_DIRECT_REVIEW_DUPLICATE_EXPLANATION:${previous.questionId}:${record.questionId}`,
      );
    }
    exactByText.set(normalized, record);
  }

  const comparable = records
    .map((record) => {
      const template = normalizeExplanationTemplate(record.value);
      return { ...record, template, shingles: shingles(template) };
    })
    .filter(({ template }) => template.length >= NEAR_DUPLICATE_MINIMUM_LENGTH);
  for (let leftIndex = 0; leftIndex < comparable.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < comparable.length;
      rightIndex += 1
    ) {
      const left = comparable[leftIndex];
      const right = comparable[rightIndex];
      if (
        left.kind !== right.kind ||
        left.questionId === right.questionId
      ) {
        continue;
      }
      const lengthRatio =
        Math.min(left.template.length, right.template.length) /
        Math.max(left.template.length, right.template.length);
      if (lengthRatio < NEAR_DUPLICATE_SIMILARITY) {
        continue;
      }
      if (
        diceSimilarity(left.shingles, right.shingles) >= NEAR_DUPLICATE_SIMILARITY
      ) {
        throw new Error(
          `WRITTEN_DIRECT_REVIEW_DUPLICATE_EXPLANATION:${left.questionId}:${right.questionId}`,
        );
      }
    }
  }
}

function isCalculationQuestion(question: Question, directSolution: string) {
  const numericInputs = question.stem.match(/\d+(?:[.,]\d+)?/gu)?.length ?? 0;
  if (CALCULATION_SECTION_PATTERN.test(directSolution)) return true;
  if (numericInputs < 2) return false;
  if (EXPLICIT_CALCULATION_QUESTION_PATTERN.test(question.stem)) return true;

  return (
    CONDITIONAL_CALCULATION_QUESTION_PATTERN.test(question.stem) &&
    !SYMBOLIC_LOGIC_QUESTION_PATTERN.test(question.stem)
  );
}

function assertCalculationCompleteness(
  question: Question,
  review: ApprovedReview,
) {
  if (!isCalculationQuestion(question, review.directSolution)) return;

  const missing = [
    !FORMULA_PATTERN.test(review.directSolution) && "formula",
    !UNIT_PATTERN.test(review.directSolution) && "unit",
    !SUBSTITUTION_PATTERN.test(review.directSolution) && "substitution",
    !RESULT_PATTERN.test(review.directSolution) && "result",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(
      `WRITTEN_DIRECT_REVIEW_CALCULATION_INCOMPLETE:${question.id}:${missing.join(",")}`,
    );
  }
}

function assertTextQuality(question: Question, review: ApprovedReview) {
  const reviewedText = [
    review.directSolution,
    review.assertionText,
    ...review.choiceRationales.map((choice) => choice.rationale),
  ];
  if (
    GENERIC_RATIONALE_PATTERNS.some((pattern) =>
      reviewedText.some((value) => pattern.test(value)),
    )
  ) {
    throw new Error(`WRITTEN_DIRECT_REVIEW_GENERIC_TEXT:${question.id}`);
  }

  const insufficientWrongReason = review.choiceRationales.find(
    (choice) =>
      choice.verdict === "incorrect" &&
      INSUFFICIENT_WRONG_REASON_PATTERN.test(choice.rationale),
  );
  if (insufficientWrongReason) {
    throw new Error(
      `WRITTEN_DIRECT_REVIEW_INSUFFICIENT_WRONG_REASON:${question.id}:${insufficientWrongReason.choiceId}`,
    );
  }

  assertCalculationCompleteness(question, review);
}

function canApplyApprovedFeedback(question: Question) {
  return (
    !question.audit ||
    ["verified", "cbt_corrected"].includes(question.audit.auditDisposition)
  );
}

function validFeedbackTarget(
  question: Question,
  lessonId: string,
  blockId: string,
  lessonById: Map<string, Lesson>,
) {
  const lesson = lessonById.get(lessonId);
  if (
    !lesson ||
    lesson.subjectId !== question.subjectId ||
    lesson.conceptGroupId !== question.conceptGroupId ||
    !lesson.blocks.some((block) => block.id === blockId)
  ) {
    return null;
  }
  return { lessonId: lesson.id, blockId };
}

function resolveFeedbackTarget(
  question: Question,
  review: ApprovedReview,
  lessonById: Map<string, Lesson>,
) {
  const target =
    validFeedbackTarget(
      question,
      review.existingLessonId,
      review.existingBlockId,
      lessonById,
    ) ??
    validFeedbackTarget(
      question,
      question.lessonId,
      question.lessonAnchor,
      lessonById,
    );
  if (!target) {
    throw new Error(`WRITTEN_DIRECT_REVIEW_CONCEPT_MISMATCH:${question.id}`);
  }
  return target;
}

function heldQuestion(question: Question, blocker: PublicationBlocker) {
  return {
    ...question,
    approvedReview: undefined,
    contentStatus: "in_review" as const,
    publication: {
      readiness: "blocked" as const,
      blockers: [...new Set([...(question.publication?.blockers ?? []), blocker])],
    },
    validation: {
      ...question.validation,
      explanation: false,
      choiceFeedback: false,
      theoryLink: false,
      contentQuality: false,
    },
  };
}

function choiceFeedback(
  rationale: string,
  directSolution: string,
  misconception: string,
  isCorrect: boolean,
): ChoiceFeedback {
  return {
    rationale,
    plausibleReason: isCorrect ? directSolution : misconception,
    incorrectPoint: isCorrect ? null : rationale,
    keyRule: directSolution,
    differenceFromCorrect: isCorrect ? null : rationale,
  };
}

export function applyWrittenDirectFeedback(
  content: GeneratedContent,
): GeneratedContent {
  const reviews = new Map(
    WRITTEN_DIRECT_QUESTION_REVIEWS.map((review) => [
      review.questionId,
      review,
    ]),
  );
  const questionById = new Map(
    content.questions.map((question) => [question.id, question]),
  );
  const lessonById = new Map(
    content.lessons.map((lesson) => [lesson.id, lesson]),
  );

  for (const review of WRITTEN_DIRECT_QUESTION_REVIEWS) {
    const question = questionById.get(review.questionId);
    if (!question) {
      throw new Error(`WRITTEN_DIRECT_REVIEW_QUESTION_MISSING:${review.questionId}`);
    }
    if (review.subjectId && question.subjectId !== review.subjectId) {
      throw new Error(`WRITTEN_DIRECT_REVIEW_SUBJECT_MISMATCH:${review.questionId}`);
    }
  }
  assertNoDuplicateExplanations(
    WRITTEN_DIRECT_QUESTION_REVIEWS.filter(
      (review): review is ApprovedReview =>
        review.decision === "approve" &&
        canApplyApprovedFeedback(questionById.get(review.questionId)!),
    ),
  );

  return {
    ...content,
    questions: content.questions.map((question) => {
      if (!TARGET_SUBJECT_IDS.has(question.subjectId)) return question;

      const review = reviews.get(question.id);
      if (!review) {
        // 과목 2의 용접 CBT 검토 문항은 별도 source-governed 파이프라인에서
        // approvedReview를 만든다. 그 승인 결과만 보존하고, 나머지 기존
        // 과목 2 문항은 다른 과목과 동일하게 직접 검토 전까지 HOLD한다.
        if (question.subjectId === "subject-2" && question.approvedReview) {
          return question;
        }
        return heldQuestion(question, "content_quality");
      }
      if (review.decision === "hold") {
        return heldQuestion(question, "content_quality");
      }
      if (!canApplyApprovedFeedback(question)) {
        return heldQuestion(question, "content_quality");
      }
      if (review.correctChoiceId !== question.correctChoiceId) {
        throw new Error(
          `WRITTEN_DIRECT_REVIEW_ANSWER_MISMATCH:${question.id}`,
        );
      }

      const reviewedChoiceIds = new Set(
        review.choiceRationales.map((choice) => choice.choiceId),
      );
      const correctVerdicts = review.choiceRationales.filter(
        (choice) => choice.verdict === "correct",
      );
      if (
        reviewedChoiceIds.size !== question.choices.length ||
        question.choices.some((choice) => !reviewedChoiceIds.has(choice.id)) ||
        correctVerdicts.length !== 1 ||
        correctVerdicts[0].choiceId !== question.correctChoiceId
      ) {
        throw new Error(
          `WRITTEN_DIRECT_REVIEW_CHOICE_MISMATCH:${question.id}`,
        );
      }
      assertTextQuality(question, review);

      const target = resolveFeedbackTarget(question, review, lessonById);

      const rationaleByChoiceId = new Map(
        review.choiceRationales.map((choice) => [choice.choiceId, choice]),
      );
      return {
        ...question,
        lessonId: target.lessonId,
        lessonAnchor: target.blockId,
        choices: question.choices.map((choice) => {
          const reviewed = rationaleByChoiceId.get(choice.id)!;
          return {
            ...choice,
            feedback: choiceFeedback(
              reviewed.rationale,
              review.directSolution,
              review.misconception,
              reviewed.verdict === "correct",
            ),
          };
        }),
        explanation: review.directSolution,
        approvedReview: {
          directSolution: review.directSolution,
          conceptBinding: {
            assertionText: review.assertionText,
            href: `/written/theory/${target.lessonId}#${target.blockId}`,
          },
        },
        contentStatus: "published" as const,
        publication: { readiness: "ready" as const, blockers: [] },
        validation: {
          answer: true,
          explanation: true,
          choiceFeedback: true,
          theoryLink: true,
          contentQuality: true,
        },
      };
    }),
  };
}
