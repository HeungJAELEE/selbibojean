import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/content/repository";
import { gradeQuestion, isPublishableQuestion } from "@/lib/domain/practice";
import { submitAnswerSchema } from "@/lib/validation/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = submitAnswerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "답안 정보를 확인해 주세요." }, { status: 400 });
  const question = await getQuestion(parsed.data.questionId);
  if (!question || !isPublishableQuestion(question)) {
    return NextResponse.json({ error: "현재 공개된 문제가 아닙니다." }, { status: 404 });
  }

  const feedback = gradeQuestion(question, parsed.data.choiceId, parsed.data.selfRating);
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  let attemptId: string | null = null;

  if (auth.user && supabase) {
    const { data, error } = await supabase.rpc("record_attempt", {
      p_question_external_id: question.id,
      p_selected_choice_external_id: parsed.data.choiceId,
      p_is_correct: feedback.isCorrect,
      p_self_rating: parsed.data.selfRating,
      p_error_reason: feedback.errorReason,
      p_session_id: parsed.data.sessionId ?? null,
      p_attempt_kind: parsed.data.attemptKind,
      p_error_narrative: feedback.isCorrect ? null : `${feedback.selectedChoice.incorrectPoint ?? ""} ${feedback.selectedChoice.differenceFromCorrect ?? ""}`.trim(),
    });
    if (!error) attemptId = String(data);
  }

  return NextResponse.json({ ...feedback, attemptId });
}
