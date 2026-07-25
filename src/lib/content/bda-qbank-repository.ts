import "server-only";
import rawQbank from "@/data/source/bda-qbank-v04.json";
import { getBdaConceptEnrichment } from "@/data/source/bda-concept-enrichment";
import { getBdaIntegratedConceptTheory } from "@/data/source/bda-integrated-concept-theory";
import { bdaLessonConceptMap } from "@/data/source/bda-lesson-concept-map";
import type {
  BdaQbank,
  BdaQbankConcept,
  BdaQbankInventoryItem,
  BdaQbankLearningItem,
  BdaQbankPracticalTask,
  PublicBdaQbankLearningItem,
} from "@/lib/domain/bda-qbank";

const qbank = rawQbank as BdaQbank;

export function getBdaQbank() {
  return qbank;
}

export function getBdaQbankConcept(conceptId: string) {
  return qbank.concepts.find((concept) => concept.id === conceptId);
}

export function getBdaQbankLearningItem(itemId: string) {
  return qbank.learningItems.find((item) => item.id === itemId);
}

export function getBdaQbankPracticalTask(taskId: string) {
  return qbank.practicalTasks.find((task) => task.id === taskId);
}

export function getBdaQbankConceptItems(conceptId: string) {
  return qbank.learningItems.filter((item) => item.conceptIds.includes(conceptId));
}

export function getBdaLessonConceptIds(lessonId: string) {
  return bdaLessonConceptMap[lessonId] ?? [];
}

export function getBdaLessonLearningItems(lessonId: string) {
  const conceptIds = new Set(getBdaLessonConceptIds(lessonId));
  return qbank.learningItems
    .filter((item) => item.conceptIds.some((conceptId) => conceptIds.has(conceptId)))
    .sort((left, right) => left.id.localeCompare(right.id, "ko"));
}

export function toPublicBdaQbankLearningItem(
  item: BdaQbankLearningItem,
): PublicBdaQbankLearningItem {
  return {
    id: item.id,
    platform: item.platform,
    sourceSetType: item.sourceSetType,
    examRound: item.examRound,
    sourceItemNo: item.sourceItemNo,
    topicSummary: item.topicSummary,
    paraphrasedLearningPrompt: item.paraphrasedLearningPrompt,
    questionMode: item.questionMode,
    technicalValidationStatus: item.technicalValidationStatus,
    reviewStatus: item.reviewStatus,
    evidenceGrade: item.evidenceGrade,
    conceptIds: item.conceptIds,
  };
}

export function getBdaQbankConceptDetail(conceptId: string) {
  const concept = getBdaQbankConcept(conceptId);
  if (!concept) return undefined;

  const relatedItems = getBdaQbankConceptItems(conceptId);
  const relatedTopics = [...new Set(relatedItems.map((item) => item.topicSummary).filter(Boolean))];
  const relatedPracticalTasks = qbank.practicalTasks.filter((task) =>
    task.conceptIds.includes(conceptId),
  );

  return {
    concept,
    enrichment: getBdaConceptEnrichment(conceptId),
    integratedTheory: getBdaIntegratedConceptTheory(conceptId),
    relatedItems,
    relatedTopics,
    relatedPracticalTasks,
  };
}

export function getBdaQbankInventoryForRound(round: string) {
  return qbank.inventory.filter((item) => item.examRoundLabel === round);
}

export function getBdaQbankSubjects() {
  return [...new Set(qbank.concepts.map((concept) => concept.subjectNo))]
    .filter((subjectNo): subjectNo is number => typeof subjectNo === "number")
    .sort((a, b) => a - b)
    .map((subjectNo) => ({
      subjectNo,
      subjectName: qbank.concepts.find((concept) => concept.subjectNo === subjectNo)
        ?.subjectName,
      concepts: qbank.concepts.filter((concept) => concept.subjectNo === subjectNo),
    }));
}

export type BdaQbankSearchDocument =
  | BdaQbankConcept
  | BdaQbankLearningItem
  | BdaQbankPracticalTask
  | BdaQbankInventoryItem;
