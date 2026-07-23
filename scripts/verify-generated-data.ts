import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedContent } from "../src/lib/domain/types";
import { isPublishableQuestion } from "../src/lib/domain/practice";

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "generated", "content.json");
  const data = JSON.parse(await readFile(filePath, "utf8")) as GeneratedContent;
  const errors: string[] = [];
  if (data.formatVersion !== 2) errors.push(`콘텐츠 포맷 버전이 2가 아닙니다: ${data.formatVersion}`);
  if (!data.report.exactMatch) errors.push("엑셀 기준 수량 대사가 일치하지 않습니다.");
  if (data.conceptGroups.length !== 44) errors.push(`세부항목군이 44개가 아닙니다: ${data.conceptGroups.length}`);
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

  const invalidPublished = data.questions.filter(
    (question) => question.contentStatus === "published" && !isPublishableQuestion(question),
  );
  if (invalidPublished.length) errors.push(`공개 조건 미충족 문제가 ${invalidPublished.length}개 있습니다.`);
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

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL: ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(
    `PASS: 원문 ${data.report.rows.originals}, 대표 ${data.report.rows.canonicalQuestions}, 매핑 ${data.report.rows.mappings}, 잔여 ${data.report.rows.backlog}, 44개 세부항목군, 공개 레슨 ${publishedLessons.length}, 선택지 해설 ${data.report.quality.choiceFeedbackPassed}, 공개 문제 ${data.report.publishedQuestionCount}, 근거 확인 대기 ${data.report.verification.blocked}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
