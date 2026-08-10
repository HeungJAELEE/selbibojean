import { NextResponse } from "next/server";
import {
  getLesson,
  getQuestion,
  getQuestionVariant,
} from "@/lib/content/repository";
import {
  gradeReviewedOriginalVariant,
  isReviewedExactOriginalVariant,
} from "@/lib/content/original-variant-practice";
import { isSafeOriginalPracticeVariant } from "@/lib/content/practice-presentations";
import {
  gradeQuestion,
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { guestLearningMergeSchema } from "@/lib/validation/auth";

const MERGE_ERROR =
  "기기 기록 전체를 병합하지 못했습니다. 기록은 이 기기에 유지했습니다.";

export async function POST(request: Request) {
  const parsed = guestLearningMergeSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "병합할 기기 학습기록을 확인해 주세요." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  if (!supabase || !auth.user) {
    return NextResponse.json(
      { error: "로그인 후 기기 기록을 병합할 수 있습니다." },
      { status: 401 },
    );
  }

  const sanitized = [];
  for (const attempt of parsed.data.attempts) {
    const question = await getQuestion(attempt.questionId);
    if (!question || !isPublishableQuestion(question)) {
      return NextResponse.json({ error: MERGE_ERROR }, { status: 409 });
    }
    const lesson = await getLesson(question.lessonId);
    if (!lesson || !isPublishableLesson(lesson)) {
      return NextResponse.json({ error: MERGE_ERROR }, { status: 409 });
    }

    try {
      const variant = attempt.variantExternalId
        ? await getQuestionVariant(attempt.variantExternalId)
        : undefined;
      let reviewedVariant: typeof variant;
      if (attempt.variantExternalId) {
        if (!variant || variant.canonicalId !== question.id) {
          return NextResponse.json({ error: MERGE_ERROR }, { status: 409 });
        }
        if (isReviewedExactOriginalVariant(variant)) {
          reviewedVariant = variant;
        } else if (!isSafeOriginalPracticeVariant(question, variant)) {
          return NextResponse.json({ error: MERGE_ERROR }, { status: 409 });
        }
      }
      const feedback = reviewedVariant
        ? gradeReviewedOriginalVariant(
            question,
            reviewedVariant,
            attempt.selectedChoiceId,
            attempt.selfRating,
            lesson,
          )
        : gradeQuestion(
            question,
            attempt.selectedChoiceId,
            attempt.selfRating,
            lesson,
          );
      const { variantExternalId: legacyVariantExternalId, ...canonicalAttempt } =
        attempt;
      void legacyVariantExternalId;
      sanitized.push(
        reviewedVariant
          ? { ...attempt, isCorrect: feedback.isCorrect }
          : { ...canonicalAttempt, isCorrect: feedback.isCorrect },
      );
    } catch {
      return NextResponse.json({ error: MERGE_ERROR }, { status: 409 });
    }
  }

  const { data, error } = await supabase.rpc("merge_guest_learning", {
    p_payload: sanitized,
  });
  const merged = typeof data === "number" ? data : Number(data);
  if (error || !Number.isFinite(merged) || merged !== sanitized.length) {
    return NextResponse.json(
      { error: MERGE_ERROR, merged: Number.isFinite(merged) ? merged : 0 },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, merged });
}
