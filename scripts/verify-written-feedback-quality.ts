import generatedContent from "@/data/generated/content.json";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import {
  gradeQuestion,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const TARGET_SUBJECT_IDS = ["subject-1", "subject-3", "subject-4"] as const;
const GENERIC_FEEDBACK_PATTERNS = [
  "관련 용어이지만 질문이 요구하는 조건에 직접 답하는 보기는 정답입니다.",
  "같은 분야의 용어나 조건을 사용해 정답처럼 보일 수 있습니다.",
  "대상·기능·적용 조건이 다릅니다.",
  "정답 보기의 적용 조건이 문제의 요구와 직접 대응합니다.",
] as const;
const PENDING_REVIEW_NOTICE =
  "이 문항은 선택지별 풀이와 개념 연결을 검수 중입니다. 검수되지 않은 공통 문구는 표시하지 않습니다.";

function containsGenericFeedback(value: string | null | undefined) {
  return Boolean(
    value &&
      GENERIC_FEEDBACK_PATTERNS.some((pattern) => value.includes(pattern)),
  );
}

function main() {
  const content = buildRuntimeContent(generatedContent as GeneratedContent);
  const lessonById = new Map(
    content.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const errors: string[] = [];
  const summary: Record<
    string,
    {
      publicQuestions: number;
      approvedDirect: number;
      pendingReview: number;
      genericSourceQuestions: number;
    }
  > = {};

  for (const subjectId of TARGET_SUBJECT_IDS) {
    const questions = content.questions.filter(
      (question) =>
        question.subjectId === subjectId && isPublishableQuestion(question),
    );
    const genericSourceQuestions = questions.filter((question) =>
      question.choices.some((choice) =>
        [
          choice.feedback.rationale,
          choice.feedback.plausibleReason,
          choice.feedback.incorrectPoint,
          choice.feedback.keyRule,
          choice.feedback.differenceFromCorrect,
        ].some(containsGenericFeedback),
      ),
    );

    summary[subjectId] = {
      publicQuestions: questions.length,
      approvedDirect: 0,
      pendingReview: 0,
      genericSourceQuestions: genericSourceQuestions.length,
    };

    for (const question of questions) {
      const lesson = lessonById.get(question.lessonId);
      if (!lesson) {
        errors.push(`${question.id}: 연결 레슨 ${question.lessonId}이 없습니다.`);
        continue;
      }

      const feedback = gradeQuestion(
        question,
        question.choices[0].id,
        "known",
        lesson,
      );

      if (question.approvedReview) {
        summary[subjectId].approvedDirect += 1;
        if (feedback.feedbackQuality !== "approved_direct") {
          errors.push(`${question.id}: 승인 문항이 approved_direct가 아닙니다.`);
        }
        const anchor =
          question.approvedReview.conceptBinding.href.split("#")[1] ?? "";
        const block = lesson.blocks.find((candidate) => candidate.id === anchor);
        if (!block) {
          errors.push(`${question.id}: 승인 개념 앵커 ${anchor}가 없습니다.`);
        }
        if (
          containsGenericFeedback(question.approvedReview.directSolution) ||
          question.choices.some((choice) =>
            containsGenericFeedback(choice.feedback.rationale),
          )
        ) {
          errors.push(`${question.id}: 승인 직접 풀이·선택지 근거에 공통 문구가 남았습니다.`);
        }
        continue;
      }

      summary[subjectId].pendingReview += 1;
      if (feedback.feedbackQuality !== "pending_review") {
        errors.push(`${question.id}: 미검수 문항이 pending_review가 아닙니다.`);
      }
      if (feedback.feedbackNotice !== PENDING_REVIEW_NOTICE) {
        errors.push(`${question.id}: 미검수 안내 문구가 계약과 다릅니다.`);
      }
      if (feedback.explanation !== PENDING_REVIEW_NOTICE) {
        errors.push(`${question.id}: 미검수 전체 해설이 차단되지 않았습니다.`);
      }
      if (feedback.conceptSupport !== null) {
        errors.push(`${question.id}: 미검수 개념 본문이 응답에 포함됐습니다.`);
      }
      if (
        [
          feedback.selectedChoice.rationale,
          feedback.selectedChoice.plausibleReason,
          feedback.selectedChoice.incorrectPoint,
          feedback.selectedChoice.keyRule,
          feedback.selectedChoice.differenceFromCorrect,
          ...feedback.otherChoices.flatMap((choice) => [
            choice.rationale,
            choice.plausibleReason,
            choice.incorrectPoint,
            choice.keyRule,
            choice.differenceFromCorrect,
          ]),
        ].some(containsGenericFeedback)
      ) {
        errors.push(`${question.id}: 미검수 공통 풀이가 제출 후 응답에 남았습니다.`);
      }
    }
  }

  console.log(JSON.stringify(summary, null, 2));
  if (errors.length > 0) {
    console.error(`WRITTEN_FEEDBACK_QUALITY_FAILED ${errors.length}`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log("WRITTEN_FEEDBACK_QUALITY_OK");
}

main();
