import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import type { PracticalContent } from "../src/lib/domain/practical-types";
import { isPublishablePracticalQuestion } from "../src/lib/domain/practical";
import { isLearnerVisiblePracticalQuestion } from "../src/lib/content/learner-visibility";
import {
  practicalTextbookPlacementByConceptId,
  practicalTextbookStudyTypes,
  practicalTextbookSubjects,
} from "../src/data/source/practical-textbook-taxonomy";
import { PRACTICAL_SUPPLEMENTAL_CONCEPTS } from "../src/data/source/practical-supplemental-concepts";
import { PRACTICAL_BASELINE_MANIFEST } from "../src/data/source/practical-baseline-manifest";

function sortedIdsSha256(items: Array<{ id: string }>) {
  const sortedIds = items.map((item) => item.id).sort();
  return createHash("sha256")
    .update(JSON.stringify(sortedIds))
    .digest("hex");
}

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

  for (const [setName, items] of [
    ["questions", content.questions],
    ["concepts", content.concepts],
    ["visualAids", content.visualAids],
  ] as const) {
    const baseline = PRACTICAL_BASELINE_MANIFEST.sets[setName];
    if (
      items.length !== baseline.count ||
      sortedIdsSha256(items) !== baseline.sortedIdsSha256
    ) {
      errors.push(
        `실기 ${setName} 기준선 ID 집합이 변경됐습니다. 승인된 변경이력과 함께 기준선을 갱신해야 합니다.`,
      );
    }
  }

  if (content.report.rows.past !== 51) errors.push("기출복원 원시 레코드 51개가 아닙니다.");
  if (content.report.publication.past !== 51)
    errors.push(
      "학습자 공개 기출복원은 검증 완료 51개여야 합니다.",
    );
  if (content.report.rows.predicted !== 185)
    errors.push("출제예상 전체 185개가 아닙니다.");
  if (content.report.rows.workbookPredicted !== 41)
    errors.push("원본 워크북 기반 출제예상 41개가 아닙니다.");
  if (content.report.rows.authoredPredicted !== 77)
    errors.push("NCS 원문 기반 자체 예상문항 77개가 아닙니다.");
  if (content.report.rows.balancedPredicted !== 67)
    errors.push("필기 발췌·선별 예상문항 67개가 아닙니다.");
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
  if (
    content.ncsCoverage.summary.totalDocuments !== 11 ||
    content.ncsCoverage.summary.accountedDocuments !== 11 ||
    content.report.ncsCoverage.accountedDocuments !== 11
  ) {
    errors.push("NCS 원문 11종 대조 상태가 완결되지 않았습니다.");
  }
  if (
    content.ncsCoverage.documents.some(
      (document) =>
        !document.sourceUrl ||
        !document.sourceFileHash ||
        (document.conceptIds.length === 0 && document.heldItems.length === 0),
    )
  ) {
    errors.push("NCS 원문 대조 문서의 근거·반영·보류 상태가 누락되었습니다.");
  }
  if (
    content.ncsCoverage.documents.flatMap((document) => document.heldItems).some(
      (item) =>
        !item.title ||
        !item.pdfPages ||
        !item.printedPages ||
        !item.rationale ||
        !item.nextAction,
    )
  ) {
    errors.push("NCS 원문 보류 항목의 근거와 다음 조치가 누락되었습니다.");
  }
  if (!content.report.exactMatch) errors.push("원본 행 수 대사가 실패했습니다.");

  const expectedCategoryCounts = new Map([
    ["visual_identification", 38],
    ["formula_calculation", 56],
    ["theory_concept", 77],
    ["work_procedure", 65],
  ]);
  const expectedPublicPredictedCounts = new Map([
    ["visual_identification", 19],
    ["formula_calculation", 46],
    ["theory_concept", 60],
    ["work_procedure", 58],
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
    (question) =>
      isPublishablePracticalQuestion(question) &&
      isLearnerVisiblePracticalQuestion(question),
  );
  for (const [
    categoryId,
    expectedPublicCount,
  ] of expectedPublicPredictedCounts) {
    const publicPredictedCount = publicQuestions.filter(
      (question) =>
        question.kind === "predicted" &&
        question.primaryStudyCategoryId === categoryId,
    ).length;
    if (publicPredictedCount !== expectedPublicCount) {
      errors.push(
        `실기 유형별 공개 예상문제 수량 불일치: ${categoryId} ${publicPredictedCount}/${expectedPublicCount}`,
      );
    }
  }
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
  const frameIds = new Set<string>();
  for (const visualAid of publicVisualAids) {
    if (
      !visualAid.altText ||
      !visualAid.caption ||
      !visualAid.sourceFileHash ||
      !/^[a-f0-9]{64}$/.test(visualAid.outputAssetHash) ||
      visualAid.technicalReviewStatus !== "verified" ||
      visualAid.usageTypes.length === 0 ||
      visualAid.frames.length === 0 ||
      visualAid.rightsStatus === "unknown" ||
      visualAid.rightsStatus === "third_party_permission_required"
    ) {
      errors.push(`시각자료 메타데이터 오류: ${visualAid.id}`);
    }
    for (const frame of visualAid.frames) {
      if (frameIds.has(frame.id)) {
        errors.push(`시각자료 프레임 ID 중복: ${frame.id}`);
      }
      frameIds.add(frame.id);
      const assetPath = path.join(
        process.cwd(),
        "public",
        frame.path.replace(/^\//, ""),
      );
      await access(assetPath).catch(() =>
        errors.push(`시각자료 파일 누락: ${frame.path}`),
      );
      const assetBuffer = await readFile(assetPath).catch(() => null);
      if (
        assetBuffer &&
        createHash("sha256").update(assetBuffer).digest("hex") !==
          frame.outputAssetHash
      ) {
        errors.push(`시각자료 출력 해시 불일치: ${frame.id}`);
      }
    }
  }
  if (
    content.visualAids.some(
      (visualAid) =>
        visualAid.originType === "ai_generated" &&
        visualAid.publicUseStatus === "public",
    )
  ) {
    errors.push("이번 공개 범위에는 ai_generated 시각자료를 사용할 수 없습니다.");
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
    `PASS: 실기 기출 ${content.report.publication.past}/${content.report.rows.past}, 예상 ${content.report.publication.predicted}/${content.report.rows.predicted} (워크북 ${content.report.rows.workbookPredicted} + 자체 ${content.report.rows.authoredPredicted} + 필기선별 ${content.report.rows.balancedPredicted}), ` +
      `출제연결 ${content.report.publication.concepts}/46 + NCS 보강 ${content.report.publication.supplementalConcepts}/${PRACTICAL_SUPPLEMENTAL_CONCEPTS.length}, 보류 ${content.report.publication.held}, ` +
      `NCS 시각자료 ${publicVisualAids.length}묶음, 학습유형 4개/236문제`,
  );
}

await main();
