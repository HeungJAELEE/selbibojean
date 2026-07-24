import "server-only";
import rawQbank from "@/data/source/bda-qbank-v04.json";
import type {
  BdaQbank,
  BdaQbankConcept,
  BdaQbankInventoryItem,
  BdaQbankLearningItem,
  BdaQbankPracticalTask,
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
