import "server-only";

import rawPracticalContent from "@/data/generated/practical-content.json";
import {
  getPracticalTextbookPlacement,
  getPracticalTextbookStudyType as getPracticalTextbookStudyTypeRecord,
  getPracticalTextbookSubject as getPracticalTextbookSubjectRecord,
  practicalTextbookPlacementByConceptId,
  practicalTextbookStudyTypes,
  practicalTextbookSubjects,
  type PracticalTextbookStudyTypeId,
  type PracticalTextbookSubjectId,
} from "@/data/source/practical-textbook-taxonomy";
import type {
  PracticalConcept,
  PracticalContent,
  PracticalStudyCategoryId,
  PracticalVisualAid,
} from "@/lib/domain/practical-types";
import {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "@/lib/domain/practical";

export {
  isPublishablePracticalQuestion,
  toPublicPracticalQuestion,
} from "@/lib/domain/practical";

const content = rawPracticalContent as PracticalContent;

export async function getPracticalContent() {
  return content;
}

export async function getPracticalQuestion(questionId: string) {
  return content.questions.find((question) => question.id === questionId);
}

export async function getPublicPracticalQuestion(questionId: string) {
  const question = await getPracticalQuestion(questionId);
  return question && isPublishablePracticalQuestion(question)
    ? toPublicPracticalQuestion(question)
    : undefined;
}

export async function getPracticalConcept(
  conceptId: string,
): Promise<PracticalConcept | undefined> {
  return content.concepts.find((concept) => concept.id === conceptId);
}

export async function getPracticalStudyCategory(
  categoryId: PracticalStudyCategoryId,
) {
  return content.studyCategories.find(
    (category) => category.id === categoryId,
  );
}

export async function getPracticalVisualAid(
  visualAidId: string | null,
): Promise<PracticalVisualAid | undefined> {
  return visualAidId
    ? content.visualAids.find((visualAid) => visualAid.id === visualAidId)
    : undefined;
}

export async function getPublicPracticalVisualAid(
  visualAidId: string | null,
  use: "prompt" | "theory" = "theory",
): Promise<PracticalVisualAid | undefined> {
  const visualAid = await getPracticalVisualAid(visualAidId);
  if (!visualAid || visualAid.publicUseStatus !== "public") return undefined;
  if (use === "prompt" && visualAid.examMatchStatus !== "exact_source") {
    return undefined;
  }
  return visualAid;
}

export function publicPracticalQuestions(kind?: "past" | "predicted") {
  return content.questions.filter(
    (question) =>
      isPublishablePracticalQuestion(question) &&
      (!kind || question.kind === kind),
  );
}

export function publicPracticalQuestionsByCategory(
  categoryId: PracticalStudyCategoryId,
  kind?: "past" | "predicted",
) {
  return publicPracticalQuestions(kind).filter(
    (question) => question.primaryStudyCategoryId === categoryId,
  );
}

export function practicalConceptsByCategory(
  categoryId: PracticalStudyCategoryId,
) {
  const category = content.studyCategories.find(
    (item) => item.id === categoryId,
  );
  const conceptIds = new Set(category?.conceptIds ?? []);
  return content.concepts.filter(
    (concept) =>
      concept.contentStatus === "published" && conceptIds.has(concept.id),
  );
}

/**
 * 실기 문제풀이 분류와 분리된, NCS 교재용 과목·학습유형 조회 함수다.
 * 원본 엑셀의 subjectLabel은 표기가 혼재되어 있으므로 이곳에서는 검토한
 * PCON 배치표를 단일 기준으로 사용한다.
 */
export function getPracticalTextbookSubjects() {
  return practicalTextbookSubjects;
}

export function getPracticalTextbookStudyTypes() {
  return practicalTextbookStudyTypes;
}

export function getPracticalTextbookSubject(subjectId: string) {
  return getPracticalTextbookSubjectRecord(subjectId);
}

export function getPracticalTextbookStudyType(studyTypeId: string) {
  return getPracticalTextbookStudyTypeRecord(studyTypeId);
}

export function getPracticalTextbookPlacementForConcept(conceptId: string) {
  return getPracticalTextbookPlacement(conceptId);
}

export function practicalConceptsByTextbookSubject(
  subjectId: PracticalTextbookSubjectId,
) {
  return content.concepts.filter((concept) => {
    const placement = practicalTextbookPlacementByConceptId[concept.id];
    return concept.contentStatus === "published" && placement?.subjectId === subjectId;
  });
}

export function practicalConceptsByTextbookSubjectAndType(
  subjectId: PracticalTextbookSubjectId,
  studyTypeId: PracticalTextbookStudyTypeId,
) {
  return practicalConceptsByTextbookSubject(subjectId).filter((concept) => {
    const placement = practicalTextbookPlacementByConceptId[concept.id];
    if (!placement?.studyTypeIds.includes(studyTypeId)) return false;

    // 계산 공식은 실제 식과 단위·적용조건을 가진 항목만 노출한다.
    return studyTypeId !== "formula" || concept.formula.some((item) => item.includes("="));
  });
}

export function practicalTextbookTypeCount(
  subjectId: PracticalTextbookSubjectId,
  studyTypeId: PracticalTextbookStudyTypeId,
) {
  return practicalConceptsByTextbookSubjectAndType(subjectId, studyTypeId).length;
}
