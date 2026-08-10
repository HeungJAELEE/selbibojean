import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedContent } from "../src/lib/domain/types";
import {
  isPublishableLesson,
  isPublishableQuestion,
  toPublicQuestion,
} from "../src/lib/domain/practice";
import { weldingSafetyReviewDatasetSchema } from "../src/lib/content/welding-safety-supplement";
import { getApprovedWeldingSafetyContent } from "../src/lib/content/welding-safety-approved";
import { buildRuntimeContent } from "../src/lib/content/runtime-content";
import { notionGapWrittenLessons } from "../src/lib/content/notion-gap-written-lessons";
import { supplementalWrittenLessons } from "../src/lib/content/supplemental-written-lessons";
import { parseWrittenQuestionAuditManifest } from "../src/lib/content/written-question-audit";
import rawWrittenQuestionAudit from "../src/data/generated/written-question-audit.json";

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "generated", "content.json");
  const data = JSON.parse(await readFile(filePath, "utf8")) as GeneratedContent;
  const runtimeData = buildRuntimeContent(data);
  const weldingSafetyPath = path.join(
    process.cwd(),
    "src",
    "data",
    "generated",
    "welding-safety-review.json",
  );
  const weldingSafety = weldingSafetyReviewDatasetSchema.parse(
    JSON.parse(await readFile(weldingSafetyPath, "utf8")),
  );
  const approvedWeldingSafety = getApprovedWeldingSafetyContent();
  const writtenQuestionAudit = parseWrittenQuestionAuditManifest(
    rawWrittenQuestionAudit,
  );
  const errors: string[] = [];
  if (data.formatVersion !== 2) errors.push(`콘텐츠 포맷 버전이 2가 아닙니다: ${data.formatVersion}`);
  if (!data.report.exactMatch) errors.push("엑셀 기준 수량 대사가 일치하지 않습니다.");
  if (data.conceptGroups.length !== 44) errors.push(`세부항목군이 44개가 아닙니다: ${data.conceptGroups.length}`);
  if (data.questions.length !== 1396 || data.report.rows.canonicalQuestions !== 1396) {
    errors.push(`27차 원장 대표문제 1,396 ID가 보존되지 않았습니다: ${data.questions.length}/${data.report.rows.canonicalQuestions}`);
  }
  if (new Set(data.questions.map((question) => question.id)).size !== data.questions.length) errors.push("문제 ID가 중복됩니다.");
  if (new Set(data.lessons.map((lesson) => lesson.id)).size !== data.lessons.length) errors.push("레슨 ID가 중복됩니다.");
  if (data.variants.length !== data.report.rows.originals) errors.push(`원문 변형문제 수가 다릅니다: ${data.variants.length}`);
  if (data.variants.some((variant) => !variant.canonicalId)) errors.push("대표문제 연결이 없는 원문 변형문제가 있습니다.");
  const publishedLessons = data.lessons.filter((lesson) => lesson.contentStatus === "published");
  const failedPublishedLessons = publishedLessons.filter((lesson) => !lesson.quality.passed);
  if (failedPublishedLessons.length) errors.push(`공개 레슨 품질 게이트 실패: ${failedPublishedLessons.length}개`);
  const failedLessons = data.lessons.filter((lesson) => !lesson.quality.passed);
  if (failedLessons.length) errors.push(`전체 레슨 품질 게이트 실패: ${failedLessons.length}개`);
  const sourceBlockedPublishedLessons = publishedLessons.filter((lesson) => lesson.sourceNeeded);
  if (sourceBlockedPublishedLessons.length) errors.push(`출처 검토가 필요한 공개 레슨: ${sourceBlockedPublishedLessons.length}개`);
  const choiceCount = data.questions.reduce((total, question) => total + question.choices.length, 0);
  if (data.report.quality.choiceFeedbackPassed !== choiceCount || data.report.quality.choiceFeedbackFailed !== 0) {
    errors.push(`선택지별 해설 품질 게이트 실패: ${data.report.quality.choiceFeedbackFailed}개`);
  }
  if (data.report.quality.genericPhraseMatches !== 0) {
    errors.push(`금지된 일반론 문구가 ${data.report.quality.genericPhraseMatches}건 남아 있습니다.`);
  }
  if (data.report.quality.languageIssueMatches !== 0) {
    errors.push(`기계적으로 탐지된 한국어 문장 오류가 ${data.report.quality.languageIssueMatches}건 남아 있습니다.`);
  }
  if (data.report.groupQuality.length !== 44) errors.push(`세부항목군 품질 대사가 44개가 아닙니다: ${data.report.groupQuality.length}`);
  if (data.report.warnings.length !== 0) errors.push(`해결되지 않은 이관·분류 경고: ${data.report.warnings.length}개`);
  const emptyGroups = data.report.groupQuality.filter((group) => group.lessonCount === 0 || group.questionCount === 0);
  if (emptyGroups.length) errors.push(`문제·레슨이 비어 있는 세부항목군: ${emptyGroups.map((group) => group.groupId).join(", ")}`);
  const failedGroups = data.report.groupQuality.filter(
    (group) => group.publishedLessonPassed !== group.publishedLessonCount || group.choiceFeedbackPassed !== group.choiceFeedbackCount,
  );
  if (failedGroups.length) errors.push(`세부항목군 품질 대사 실패: ${failedGroups.map((group) => group.groupId).join(", ")}`);

  const runtimePublicQuestions = runtimeData.questions.filter(
    isPublishableQuestion,
  );
  const expectedRuntimePublicQuestions = 2_063;
  if (runtimePublicQuestions.length !== expectedRuntimePublicQuestions) {
    errors.push(
      `런타임 공개 문제 수량 불일치: ${runtimePublicQuestions.length}/${expectedRuntimePublicQuestions}`,
    );
  }
  const expectedRuntimePublicBySubject = new Map([
    ["subject-1", 315],
    ["subject-2", 714],
    ["subject-3", 255],
    ["subject-4", 779],
  ]);
  for (const [subjectId, expected] of expectedRuntimePublicBySubject) {
    const actual = runtimePublicQuestions.filter(
      (question) => question.subjectId === subjectId,
    ).length;
    if (actual !== expected) {
      errors.push(`런타임 과목별 공개 문제 수량 불일치 ${subjectId}: ${actual}/${expected}`);
    }
  }
  const runtimePublishedWithoutReview = runtimePublicQuestions.filter(
    (question) => !question.approvedReview,
  );
  if (runtimePublishedWithoutReview.length) {
    errors.push(`직접풀이·독립검토 없이 공개되는 런타임 문제: ${runtimePublishedWithoutReview.length}개`);
  }
  const publicProjection = JSON.stringify(
    runtimePublicQuestions.map(toPublicQuestion),
  );
  for (const answerField of [
    "correctChoiceId",
    "answerText",
    "\"explanation\":",
    "approvedReview",
  ]) {
    if (publicProjection.includes(answerField)) {
      errors.push(`답안 제출 전 공개 투영에 금지 필드가 남아 있습니다: ${answerField}`);
    }
  }
  const publicationMismatch = data.questions.filter((question) =>
    question.contentStatus === "published"
      ? question.publication?.readiness !== "ready"
      : question.publication?.readiness === "ready",
  );
  if (publicationMismatch.length) errors.push(`공개 상태와 발행 준비도가 다른 문제: ${publicationMismatch.length}개`);
  const publicationTotal = data.report.publication.ready + data.report.publication.review + data.report.publication.blocked;
  if (publicationTotal !== data.questions.length) errors.push(`발행 준비도 대사 불일치: ${publicationTotal}/${data.questions.length}`);
  if (data.report.publication.ready !== data.report.publishedQuestionCount) {
    errors.push(`공개 완료 수와 발행 준비 수가 다릅니다: ${data.report.publishedQuestionCount}/${data.report.publication.ready}`);
  }
  const missingVerification = data.questions.filter((question) =>
    !question.verification || question.verification.sourceUrls.length === 0,
  );
  if (missingVerification.length) errors.push(`출처 검증 메타데이터가 없는 문제: ${missingVerification.length}개`);
  const unsafePublished = data.questions.filter((question) =>
    question.contentStatus === "published" && question.verification?.status !== "verified",
  );
  if (unsafePublished.length) errors.push(`검증 상태가 완료되지 않은 공개 문제: ${unsafePublished.length}개`);
  const blockedWithoutReason = data.questions.filter((question) =>
    question.publication?.readiness === "blocked" &&
    !question.verification?.riskTags.some((risk) =>
      ["asset_required", "answer_conflict", "authoritative_source_required"].includes(risk),
    ),
  );
  if (blockedWithoutReason.length) errors.push(`구조화된 차단 사유가 없는 문제: ${blockedWithoutReason.length}개`);
  if (data.report.verification.verified + data.report.verification.blocked !== data.questions.length) {
    errors.push(`검증 상태 대사 불일치: ${data.report.verification.verified + data.report.verification.blocked}/${data.questions.length}`);
  }

  const lessonIds = new Set(data.lessons.map((lesson) => lesson.id));
  const brokenLinks = data.questions.filter((question) => !lessonIds.has(question.lessonId));
  if (brokenLinks.length) errors.push(`이론 연결이 끊긴 문제가 ${brokenLinks.length}개 있습니다.`);
  const lessonById = new Map(data.lessons.map((lesson) => [lesson.id, lesson]));
  const brokenAnchors = data.questions.filter((question) =>
    !lessonById.get(question.lessonId)?.blocks.some((block) => block.id === question.lessonAnchor),
  );
  if (brokenAnchors.length) errors.push(`이론 블록 앵커가 끊긴 문제가 ${brokenAnchors.length}개 있습니다.`);
  const invalidLessons = data.lessons.filter((lesson) => {
    const ids = lesson.blocks.map((block) => block.id);
    return lesson.summary.length !== 3 || new Set(ids).size !== ids.length || !lesson.blocks.some((block) => block.kind === "source");
  });
  if (invalidLessons.length) errors.push(`구조 검증에 실패한 레슨이 ${invalidLessons.length}개 있습니다.`);
  const normalizedLessonKeys = data.lessons.map((lesson) =>
    `${lesson.subjectId}:${lesson.title.normalize("NFKC").toLocaleLowerCase("ko").replace(/[\s·ㆍ,.()\[\]{}'"/\\_-]+/g, "")}`,
  );
  if (new Set(normalizedLessonKeys).size !== normalizedLessonKeys.length) {
    errors.push("같은 과목 안에 띄어쓰기·구두점만 다른 중복 레슨이 있습니다.");
  }

  if (weldingSafety.status !== "imported") {
    errors.push("33차 용접 안전 원본이 이관되지 않았습니다.");
  }
  if (
    weldingSafety.counts.importedQuestions !== weldingSafety.expected.questions ||
    weldingSafety.counts.importedLessons !== weldingSafety.expected.lessons ||
    weldingSafety.counts.importedReviewQueueEntries !== weldingSafety.expected.reviewQueueEntries ||
    weldingSafety.counts.importedRounds !== weldingSafety.expected.rounds ||
    weldingSafety.counts.completedRounds !== weldingSafety.expected.completedRounds
  ) {
    errors.push("33차 용접 안전 문제·레슨·검수대기·회차 수량 대사가 일치하지 않습니다.");
  }
  if (
    weldingSafety.counts.excludedRows ||
    weldingSafety.counts.duplicateRows ||
    weldingSafety.counts.invalidRows
  ) {
    errors.push(
      `33차 용접 안전 이관 오류: 제외 ${weldingSafety.counts.excludedRows}, ` +
      `중복 ${weldingSafety.counts.duplicateRows}, 불완전 ${weldingSafety.counts.invalidRows}`,
    );
  }
  const unsafeWeldingSafety = weldingSafety.questions.filter(
    (question) =>
      question.publicationStatus !== "blocked" ||
      !question.blockers.includes("authoritative_source_required") ||
      !question.blockers.includes("choice_feedback_required") ||
      !question.blockers.includes("theory_link_required"),
  );
  if (unsafeWeldingSafety.length) {
    errors.push(`공개 차단 게이트가 누락된 용접 안전 문제: ${unsafeWeldingSafety.length}개`);
  }
  if (weldingSafety.questions.filter((question) => question.reviewPriority !== null).length !== 150) {
    errors.push("33차 용접 안전 우선 검수대기 150개 연결이 일치하지 않습니다.");
  }
  if (
    approvedWeldingSafety.audit.reviewedQuestions !== 150 ||
    approvedWeldingSafety.audit.publishedQuestions !== 0 ||
    approvedWeldingSafety.audit.heldQuestions !== 150
  ) {
    errors.push(
      `33차 용접 안전 문제 검수 결과가 일치하지 않습니다: ` +
      `${approvedWeldingSafety.audit.publishedQuestions}/150 공개, ` +
      `${approvedWeldingSafety.audit.heldQuestions} 보류`,
    );
  }
  if (
    approvedWeldingSafety.audit.publishedLessons !== 0 ||
    approvedWeldingSafety.audit.heldLessons !== 30 ||
    approvedWeldingSafety.audit.invalidAnswerLinks !== 0 ||
    approvedWeldingSafety.audit.invalidTheoryLinks !== 0 ||
    approvedWeldingSafety.audit.invalidChoiceFeedback !== 0
  ) {
    errors.push(
      `33차 용접 안전 공개 게이트 실패: ` +
      `레슨 ${approvedWeldingSafety.audit.publishedLessons}/30, ` +
      `정답 ${approvedWeldingSafety.audit.invalidAnswerLinks}, ` +
      `이론 ${approvedWeldingSafety.audit.invalidTheoryLinks}, ` +
      `선택지 해설 ${approvedWeldingSafety.audit.invalidChoiceFeedback}`,
    );
  }
  const mainQuestionIds = new Set(data.questions.map((question) => question.id));
  if (weldingSafety.questions.some((question) => mainQuestionIds.has(question.id))) {
    errors.push("용접 안전 검수 문제 ID가 공개 문제은행 ID와 충돌합니다.");
  }
  const runtimeLessonById = new Map(
    runtimeData.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const runtimeBrokenPublicGraph = runtimeData.questions
    .filter(isPublishableQuestion)
    .filter((question) => {
      const lesson = runtimeLessonById.get(question.lessonId);
      return (
        !lesson ||
        !isPublishableLesson(lesson) ||
        lesson.subjectId !== question.subjectId ||
        question.approvedReview?.conceptBinding.href
          !== `/written/theory/${question.lessonId}#${question.lessonAnchor}`
      );
    });
  if (runtimeBrokenPublicGraph.length) {
    errors.push(
      `런타임 병합 후 공개 문제-이론 관계 오류: ${runtimeBrokenPublicGraph.length}개`,
    );
  }
  const runtimeWeldingSafety = runtimeData.questions.filter((question) =>
    question.id.startsWith("welding-safety-b33-"),
  );
  const publishedWeldingSafety = runtimeWeldingSafety.filter(
    isPublishableQuestion,
  );
  const invalidPublishedWeldingSafety = publishedWeldingSafety.filter(
    (question) =>
      question.audit?.auditDisposition !== "verified" &&
      question.audit?.auditDisposition !== "cbt_corrected",
  );
  if (invalidPublishedWeldingSafety.length) {
    errors.push(
      `감사 승인되지 않은 33차 용접 안전 문제가 공개됩니다: ${invalidPublishedWeldingSafety
        .map((question) => question.id)
        .join(", ")}`,
    );
  }
  const sourceApprovedWeldingSafety = writtenQuestionAudit.entries.filter(
    (entry) =>
      entry.questionId.startsWith("welding-safety-b33-") &&
      (entry.auditDisposition === "verified" ||
        entry.auditDisposition === "cbt_corrected"),
  ).length;
  if (sourceApprovedWeldingSafety !== 150) {
    errors.push(
      `33차 용접 안전 원장 감사 승인 수량 불일치: ${sourceApprovedWeldingSafety}/150`,
    );
  }
  if (publishedWeldingSafety.length !== sourceApprovedWeldingSafety) {
    errors.push(
      `33차 용접 안전 런타임 공개 수량 불일치: ${publishedWeldingSafety.length}/${sourceApprovedWeldingSafety}`,
    );
  }
  const weldingSafetyWithoutDirectApproval = runtimeWeldingSafety.filter(
    (question) =>
      !question.approvedReview ||
      question.contentStatus !== "published" ||
      question.publication?.readiness !== "ready",
  );
  if (weldingSafetyWithoutDirectApproval.length) {
    errors.push(
      `33차 용접 안전 직접풀이 승인 경계 오류: ${weldingSafetyWithoutDirectApproval.length}개`,
    );
  }

  if (
    writtenQuestionAudit.counts.reviewQueueAudited !== 257 ||
    writtenQuestionAudit.counts.highRiskPublicAudited !== 24 ||
    writtenQuestionAudit.entries.length !== 281
  ) {
    errors.push(
      `필기 감사목록 수량 불일치: 검수대기 ${writtenQuestionAudit.counts.reviewQueueAudited}, ` +
        `고위험 공개 ${writtenQuestionAudit.counts.highRiskPublicAudited}, 전체 ${writtenQuestionAudit.entries.length}`,
    );
  }
  const auditedRuntimeQuestions = runtimeData.questions.filter(
    (question) => question.audit,
  );
  const auditedRuntimeById = new Map(
    auditedRuntimeQuestions.map((question) => [question.id, question]),
  );
  const missingManifestAudits = writtenQuestionAudit.entries.filter(
    (entry) => !auditedRuntimeById.has(entry.questionId),
  );
  if (missingManifestAudits.length) {
    errors.push(
      `필기 감사 매니페스트 런타임 연결 누락: ${missingManifestAudits
        .map((entry) => entry.questionId)
        .slice(0, 20)
        .join(", ")}`,
    );
  }
  const heldAuditQuestions = auditedRuntimeQuestions.filter((question) =>
    question.audit?.auditDisposition.startsWith("held_"),
  );
  const leakedHeldQuestions = heldAuditQuestions.filter(isPublishableQuestion);
  if (leakedHeldQuestions.length) {
    errors.push(
      `보류 필기문제가 공개 게이트를 통과했습니다: ${leakedHeldQuestions
        .map((question) => question.id)
        .join(", ")}`,
    );
  }
  const heldWithoutAction = heldAuditQuestions.filter(
    (question) =>
      !question.audit?.reviewNote.trim() || !question.audit.nextAction.trim(),
  );
  if (heldWithoutAction.length) {
    errors.push(
      `보류 사유 또는 후속조치가 없는 필기 감사문제: ${heldWithoutAction.length}`,
    );
  }

  const supplementalRuntimeLessons = runtimeData.lessons.filter(
    (lesson) => lesson.contentRole === "supplemental",
  );
  const expectedSupplementalLessons = [
    ...supplementalWrittenLessons,
    ...notionGapWrittenLessons,
  ];
  if (
    supplementalRuntimeLessons.length !== expectedSupplementalLessons.length
  ) {
    errors.push(
      `보강용 레슨 수량 불일치: 정의 ${expectedSupplementalLessons.length}, 런타임 ${supplementalRuntimeLessons.length}`,
    );
  }
  const invalidSupplementalLessons = supplementalRuntimeLessons.filter(
    (lesson) =>
      !isPublishableLesson(lesson) ||
      lesson.relatedQuestionIds.length !== 0 ||
      !lesson.blocks.some((block) => block.kind === "source"),
  );
  if (invalidSupplementalLessons.length) {
    errors.push(
      `보강용 레슨 공개·문제통계 분리·출처 검증 실패: ${invalidSupplementalLessons
        .map((lesson) => lesson.id)
        .join(", ")}`,
    );
  }
  const supplementalRuntimeIds = new Set(
    supplementalRuntimeLessons.map((lesson) => lesson.id),
  );
  const reviewedSupplementalTheoryLinks = runtimePublicQuestions.filter(
    (question) => supplementalRuntimeIds.has(question.lessonId),
  );
  if (reviewedSupplementalTheoryLinks.length === 0) {
    errors.push("보강용 레슨을 참조하는 승인된 직접풀이 연결을 확인할 수 없습니다.");
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL: ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(
    `PASS: 원문 ${data.report.rows.originals}, 원장 대표 ID ${data.report.rows.canonicalQuestions}, 매핑 ${data.report.rows.mappings}, 잔여 ${data.report.rows.backlog}, 44개 세부항목군, 공개 레슨 ${publishedLessons.length}, 선택지 해설 ${data.report.quality.choiceFeedbackPassed}, 원장 발행준비 ${data.report.publishedQuestionCount}, 근거 확인 대기 ${data.report.verification.blocked}, 용접 안전 원본 ${weldingSafety.counts.importedQuestions}문제·${weldingSafety.counts.importedLessons}레슨·${weldingSafety.counts.completedRounds}회차, 원본 단계 명시승인 ${approvedWeldingSafety.audit.publishedQuestions}문제·${approvedWeldingSafety.audit.publishedLessons}레슨, 원본 단계 검수대기 ${approvedWeldingSafety.audit.heldQuestions}문제·${approvedWeldingSafety.audit.heldLessons}레슨, 런타임 직접풀이 승인 ${publishedWeldingSafety.length}문제, 런타임 공개 ${runtimePublicQuestions.length}문제(subject-1 315·subject-2 714·subject-3 255·subject-4 779)·${runtimeData.lessons.filter(isPublishableLesson).length}레슨`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
