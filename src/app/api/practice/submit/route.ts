import { NextResponse } from "next/server";
import {
  getLesson,
  getQuestion,
  getQuestionVariant,
} from "@/lib/content/repository";
import {
  gradeReviewedOriginalVariant,
  isReviewedExactOriginalVariant,
  OriginalVariantPracticeError,
} from "@/lib/content/original-variant-practice";
import { isSafeOriginalPracticeVariant } from "@/lib/content/practice-presentations";
import {
  gradeQuestion,
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import { submitAnswerSchema } from "@/lib/validation/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = submitAnswerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "답안 정보를 확인해 주세요." }, { status: 400 });
  const question = await getQuestion(parsed.data.questionId);
  if (!question || !isPublishableQuestion(question)) {
    return NextResponse.json({ error: "현재 공개된 문제가 아닙니다." }, { status: 404 });
  }

  const lesson = await getLesson(question.lessonId);
  if (!lesson || !isPublishableLesson(lesson)) {
    return NextResponse.json(
      { error: "연결 이론 검수가 완료되지 않은 문제입니다." },
      { status: 404 },
    );
  }
  const variant = parsed.data.variantExternalId
    ? await getQuestionVariant(parsed.data.variantExternalId)
    : undefined;
  let reviewedVariant: typeof variant;
  if (parsed.data.variantExternalId) {
    if (!variant || variant.canonicalId !== question.id) {
      return NextResponse.json(
        { error: "검토가 완료된 원문 문항을 확인할 수 없습니다." },
        { status: 404 },
      );
    }
    if (isReviewedExactOriginalVariant(variant)) {
      reviewedVariant = variant;
    } else if (!isSafeOriginalPracticeVariant(question, variant)) {
      return NextResponse.json(
        { error: "검토가 완료된 원문 문항을 확인할 수 없습니다." },
        { status: 404 },
      );
    }
  }
  let feedback;
  try {
    feedback = reviewedVariant
      ? gradeReviewedOriginalVariant(
          question,
          reviewedVariant,
          parsed.data.choiceId,
          parsed.data.selfRating,
          lesson,
        )
      : gradeQuestion(
          question,
          parsed.data.choiceId,
          parsed.data.selfRating,
          lesson,
        );
  } catch (error) {
    if (
      error instanceof OriginalVariantPracticeError
      && error.code === "ORIGINAL_VARIANT_CHOICE_INVALID"
    ) {
      return NextResponse.json(
        { error: "원문 문항의 선택지 정보를 다시 확인해 주세요." },
        { status: 400 },
      );
    }
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  let attemptId: string | null = null;

  if (auth.user && supabase) {
    const errorNarrative = feedback.isCorrect
      ? null
      : `${feedback.selectedChoice.incorrectPoint ?? ""} ${feedback.selectedChoice.differenceFromCorrect ?? ""}`.trim();
    const rpcCall = reviewedVariant
      ? supabase.rpc("record_variant_attempt", {
          p_question_external_id: question.id,
          p_variant_external_id: reviewedVariant.externalId,
          p_selected_variant_choice_id: parsed.data.choiceId,
          p_is_correct: feedback.isCorrect,
          p_self_rating: parsed.data.selfRating,
          p_error_reason: feedback.errorReason,
          p_session_id: parsed.data.sessionId ?? null,
          p_attempt_kind: parsed.data.attemptKind,
          p_error_narrative: errorNarrative,
        })
      : supabase.rpc("record_attempt", {
          p_question_external_id: question.id,
          p_selected_choice_external_id: parsed.data.choiceId,
          p_is_correct: feedback.isCorrect,
          p_self_rating: parsed.data.selfRating,
          p_error_reason: feedback.errorReason,
          p_session_id: parsed.data.sessionId ?? null,
          p_attempt_kind: parsed.data.attemptKind,
          p_error_narrative: errorNarrative,
        });
    const { data, error } = await rpcCall;
    if (!error) attemptId = String(data);
  }

  return NextResponse.json({ ...feedback, attemptId });
}
