import { NextResponse } from "next/server";
import {
  getLesson,
  getQuestion,
  getQuestionVariant,
} from "@/lib/content/repository";
import { buildReviewedCbtVariantGradingQuestion } from "@/lib/content/reviewed-cbt-grading";
import {
  gradeQuestion,
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import { submitAnswerSchema } from "@/lib/validation/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAuthSessionMissingError } from "@/lib/supabase/auth-errors";

export async function POST(request: Request) {
  const parsed = submitAnswerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "답안 정보를 확인해 주세요." }, { status: 400 });
  const question = await getQuestion(parsed.data.questionId);
  if (!question) {
    return NextResponse.json({ error: "현재 공개된 문제가 아닙니다." }, { status: 404 });
  }

  const variant = parsed.data.questionVariantExternalId
    ? await getQuestionVariant(parsed.data.questionVariantExternalId)
    : undefined;
  const reviewedQuestion = buildReviewedCbtVariantGradingQuestion(
    question,
    variant,
  );
  if (!reviewedQuestion && !isPublishableQuestion(question)) {
    return NextResponse.json({ error: "현재 공개된 문제가 아닙니다." }, { status: 404 });
  }

  const lesson = await getLesson(question.lessonId);
  if (!lesson || (!reviewedQuestion && !isPublishableLesson(lesson))) {
    return NextResponse.json(
      { error: "연결 이론 검수가 완료되지 않은 문제입니다." },
      { status: 404 },
    );
  }
  const gradingQuestion = reviewedQuestion ?? question;
  const feedback = gradeQuestion(
    gradingQuestion,
    parsed.data.choiceId,
    parsed.data.selfRating,
    lesson,
  );
  const supabase = await createSupabaseServerClient();
  const authResult = supabase ? await supabase.auth.getUser() : null;
  if (authResult?.error && !isAuthSessionMissingError(authResult.error)) {
    return NextResponse.json(
      { error: "로그인 상태를 확인하지 못했습니다. 같은 답안을 다시 제출해 주세요." },
      { status: 503 },
    );
  }
  const auth = authResult?.data ?? { user: null };
  let attemptId: string | null = null;

  if (auth.user && supabase) {
    const { data, error } = await supabase.rpc("record_attempt", {
      p_client_attempt_id: parsed.data.clientAttemptId,
      p_question_external_id: question.id,
      p_selected_choice_external_id: parsed.data.choiceId,
      p_is_correct: feedback.isCorrect,
      p_self_rating: parsed.data.selfRating,
      p_error_reason: feedback.errorReason,
      p_session_id: parsed.data.sessionId ?? null,
      p_attempt_kind: parsed.data.attemptKind,
      p_error_narrative: feedback.isCorrect ? null : `${feedback.selectedChoice.incorrectPoint ?? ""} ${feedback.selectedChoice.differenceFromCorrect ?? ""}`.trim(),
    });
    if (error || typeof data !== "string" || data.length === 0) {
      return NextResponse.json(
        {
          error:
            "답안을 안전하게 저장하지 못했습니다. 같은 답안을 다시 제출해 주세요.",
        },
        { status: 503 },
      );
    }
    attemptId = data;
  }

  return NextResponse.json({ ...feedback, attemptId });
}
