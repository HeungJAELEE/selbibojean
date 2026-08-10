import rawPracticalContent from "../src/data/generated/practical-content.json";
import {
  PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS,
  PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_BY_QUESTION_ID,
  PRACTICAL_WRITTEN_GPT_EDITORIAL_META,
} from "../src/data/source/practical-written-gpt-editorial";
import { PRACTICAL_WRITTEN_EXAM_CARD_SEEDS } from "../src/data/source/practical-written-exam-cards";
import { PRACTICAL_REQUIRED_TOPICS_BY_NCS_CODE } from "../src/data/source/practical-required-topics";
import type { PracticalContent } from "../src/lib/domain/practical-types";

const content = rawPracticalContent as PracticalContent;
const errors: string[] = [];
const publishedConcepts = new Map(
  content.concepts
    .filter((concept) => concept.contentStatus === "published")
    .map((concept) => [concept.id, concept]),
);
let requiredTopicCount = 0;

for (const document of content.ncsCoverage.documents) {
  const concepts = document.conceptIds
    .map((conceptId) => publishedConcepts.get(conceptId))
    .filter((concept) => concept !== undefined);
  const theoryText = JSON.stringify(concepts);
  const missingTopics = (
    PRACTICAL_REQUIRED_TOPICS_BY_NCS_CODE[document.ncsCode] ?? []
  ).filter((topic) => {
    requiredTopicCount += 1;
    return !theoryText.includes(topic);
  });
  if (missingTopics.length > 0) {
    errors.push(
      `${document.ncsCode} ${document.documentTitle}: 필기 이론 본문 누락 ${missingTopics.join(", ")}`,
    );
  }
}

for (const concept of publishedConcepts.values()) {
  if (
    concept.definition.trim().length < 20 ||
    concept.principle.trim().length < 40 ||
    concept.learningGoals.length === 0 ||
    concept.examFormats.length === 0 ||
    concept.requiredKeywords.length === 0
  ) {
    errors.push(`${concept.id} ${concept.title}: 교과서형 이론 필수 필드가 부족합니다.`);
  }
}

const seededPastQuestionIds = new Set(
  PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.flatMap((card) => card.pastQuestionIds),
);
const uncoveredPublishedPastQuestionIds = content.questions
  .filter(
    (question) =>
      question.kind === "past" &&
      question.contentStatus === "published" &&
      !seededPastQuestionIds.has(question.id),
  )
  .map((question) => question.id);
const editorialQuestionIds = new Set(
  PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_BY_QUESTION_ID.keys(),
);

if (
  PRACTICAL_WRITTEN_GPT_EDITORIAL_META.terminalMarker !==
  "END_PRACTICAL_WRITTEN_FILL"
) {
  errors.push("필답 GPT 편집 원고의 완료 마커가 올바르지 않습니다.");
}
for (const questionId of uncoveredPublishedPastQuestionIds) {
  if (!editorialQuestionIds.has(questionId)) {
    errors.push(`${questionId}: 필답 기출 카드 편집 원고가 없습니다.`);
  }
}
for (const questionId of editorialQuestionIds) {
  if (!uncoveredPublishedPastQuestionIds.includes(questionId)) {
    errors.push(`${questionId}: 공개 기출 범위 밖의 필답 카드 편집 원고입니다.`);
  }
}

const conceptReviewIds = new Set(
  PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS.map((item) => item.conceptId),
);
if (
  conceptReviewIds.size !== PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS.length ||
  conceptReviewIds.size !== 17
) {
  errors.push("필답 개념 독립 검토 원고는 중복 없이 17개여야 합니다.");
}
for (const conceptId of conceptReviewIds) {
  if (!publishedConcepts.has(conceptId)) {
    errors.push(`${conceptId}: 공개 개념에 연결되지 않은 독립 검토 원고입니다.`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Practical written theory verified: ${content.ncsCoverage.documents.length} NCS documents, ${publishedConcepts.size} published concepts, ${requiredTopicCount} required topics, ${editorialQuestionIds.size} GPT-authored past cards, ${conceptReviewIds.size} concept reviews, 0 missing.`,
);
