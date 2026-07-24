import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { PracticalContent } from "../src/lib/domain/practical-types";
import { isPublishablePracticalQuestion } from "../src/lib/domain/practical";
import {
  practicalTextbookPlacementByConceptId,
  practicalTextbookStudyTypes,
  practicalTextbookSubjects,
} from "../src/data/source/practical-textbook-taxonomy";
import { PRACTICAL_SUPPLEMENTAL_CONCEPTS } from "../src/data/source/practical-supplemental-concepts";

async function main() {
  const source = path.join(
    process.cwd(),
    "src",
    "data",
    "generated",
    "practical-content.json",
  );
  const content = JSON.parse(await readFile(source, "utf8")) as PracticalContent;
  const errors: string[] = [];

  if (content.report.rows.past !== 41) errors.push("기출복원 41개가 아닙니다.");
  if (content.report.rows.predicted !== 40)
    errors.push("출제예상 40개가 아닙니다.");
  if (content.report.rows.concepts !== 46)
    errors.push("실기 개념 46개가 아닙니다.");
  if (
    content.report.rows.supplementalConcepts !==
    PRACTICAL_SUPPLEMENTAL_CONCEPTS.length
  )
    errors.push(
      `실기 보강용 개념 수가 소스와 다릅니다: ${content.report.rows.supplementalConcepts}/${PRACTICAL_SUPPLEMENTAL_CONCEPTS.length}`,
    );
  if (content.report.rows.ncsDocuments !== 11)
    errors.push("NCS 문서 11종이 아닙니다.");
  if (!content.report.exactMatch) errors.push("원본 행 수 대사가 실패했습니다.");

  const expectedCategoryCounts = new Map([
    ["visual_identification", 20],
    ["formula_calculation", 16],
    ["theory_concept", 29],
    ["work_procedure", 16],
  ]);
  if (content.studyCategories.length !== expectedCategoryCounts.size) {
    errors.push(`실기 학습유형은 ${expectedCategoryCounts.size}개여야 합니다.`);
  }
  for (const [categoryId, expectedCount] of expectedCategoryCounts) {
    const category = content.studyCategories.find((item) => item.id === categoryId);
    if (!category) {
      errors.push(`실기 학습유형 누락: ${categoryId}`);
      continue;
    }
    const actualCount = content.questions.filter(
      (question) => question.primaryStudyCategoryId === categoryId,
    ).length;
    if (actualCount !== expectedCount) {
      errors.push(
        `실기 학습유형 수량 불일치: ${categoryId} ${actualCount}/${expectedCount}`,
      );
    }
  }
  const invalidCategoryAssignments = content.questions.filter(
    (question) =>
      !expectedCategoryCounts.has(question.primaryStudyCategoryId) ||
      question.studyCategoryIds.filter(
        (categoryId) => categoryId === question.primaryStudyCategoryId,
      ).length !== 1,
  );
  if (invalidCategoryAssignments.length > 0) {
    errors.push(
      `실기 학습유형 분류 오류: ${invalidCategoryAssignments
        .map((item) => item.id)
        .join(", ")}`,
    );
  }

  const publicQuestions = content.questions.filter(
    isPublishablePracticalQuestion,
  );
  const leakedHeld = content.questions.filter(
    (question) =>
      question.auditDisposition.startsWith("held_") &&
      isPublishablePracticalQuestion(question),
  );
  if (leakedHeld.length > 0) {
    errors.push(
      `보류 문제 공개 유출: ${leakedHeld.map((item) => item.id).join(", ")}`,
    );
  }
  const invalidPredicted = content.questions.filter(
    (question) =>
      question.kind === "predicted" &&
      (question.occurrence !== null || question.predictedBasis === null),
  );
  if (invalidPredicted.length > 0) {
    errors.push(
      `예상문제 출제이력·근거 오류: ${invalidPredicted
        .map((item) => item.id)
        .join(", ")}`,
    );
  }
  const incompletePublic = publicQuestions.filter(
    (question) =>
      !question.modelAnswer ||
      question.requiredKeywords.length === 0 ||
      question.rubric.length === 0 ||
      question.conceptIds.length === 0 ||
      (question.ncsSources.length === 0 &&
        !(question.kind === "past" && question.occurrence?.sourceUrl)),
  );
  if (incompletePublic.length > 0) {
    errors.push(
      `공개 문제 답안·루브릭·이론·NCS 누락: ${incompletePublic
        .map((item) => item.id)
        .join(", ")}`,
    );
  }

  const publicVisualAids = content.visualAids.filter(
    (visualAid) => visualAid.publicUseStatus === "public",
  );
  for (const visualAid of publicVisualAids) {
    if (
      !visualAid.altText ||
      !visualAid.caption ||
      !visualAid.sourceFileHash ||
      visualAid.rightsStatus === "unknown" ||
      visualAid.rightsStatus === "third_party_permission_required"
    ) {
      errors.push(`시각자료 메타데이터 오류: ${visualAid.id}`);
    }
    for (const imagePath of visualAid.imagePaths) {
      await access(
        path.join(process.cwd(), "public", imagePath.replace(/^\//, "")),
      ).catch(() => errors.push(`시각자료 파일 누락: ${imagePath}`));
    }
  }

  const publishedConceptIds = content.concepts
    .filter((concept) => concept.contentStatus === "published")
    .map((concept) => concept.id)
    .sort();
  const placedConceptIds = Object.keys(
    practicalTextbookPlacementByConceptId,
  ).sort();
  if (JSON.stringify(publishedConceptIds) !== JSON.stringify(placedConceptIds)) {
    errors.push("NCS 실기 교재 목차의 개념 배치가 공개 개념과 일치하지 않습니다.");
  }
  const validSubjectIds = new Set(
    practicalTextbookSubjects.map((subject) => subject.id),
  );
  const validStudyTypeIds = new Set(
    practicalTextbookStudyTypes.map((type) => type.id),
  );
  for (const [conceptId, placement] of Object.entries(
    practicalTextbookPlacementByConceptId,
  )) {
    if (!validSubjectIds.has(placement.subjectId)) {
      errors.push(`NCS 실기 교재 과목 오류: ${conceptId}`);
    }
    if (
      placement.studyTypeIds.length === 0 ||
      placement.studyTypeIds.some((id) => !validStudyTypeIds.has(id))
    ) {
      errors.push(`NCS 실기 교재 학습유형 오류: ${conceptId}`);
    }
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(`FAIL: ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(
    `PASS: 실기 기출 ${content.report.publication.past}/41, 예상 ${content.report.publication.predicted}/40, ` +
      `출제연결 ${content.report.publication.concepts}/46 + NCS 보강 ${content.report.publication.supplementalConcepts}/${PRACTICAL_SUPPLEMENTAL_CONCEPTS.length}, 보류 ${content.report.publication.held}, ` +
      `NCS 시각자료 ${publicVisualAids.length}묶음, 학습유형 4개/81문제`,
  );
}

await main();
