import rawPracticalContent from "../src/data/generated/practical-content.json";
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

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Practical written theory verified: ${content.ncsCoverage.documents.length} NCS documents, ${publishedConcepts.size} published concepts, ${requiredTopicCount} required topics, 0 missing.`,
);
