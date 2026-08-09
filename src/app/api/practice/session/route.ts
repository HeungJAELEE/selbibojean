import { NextResponse } from "next/server";
import { z } from "zod";
import { getContent } from "@/lib/content/repository";
import {
  createPracticePresentations,
  filterPracticeContentByYearRange,
  getSafeOriginalsByQuestion,
} from "@/lib/content/practice-presentations";
import { buildWeakFocus, selectAllocatedPracticeQuestions, selectPracticeQuestions } from "@/lib/domain/practice";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { isReleaseFeatureEnabled } from "@/lib/release-features";
import { isAuthSessionMissingError } from "@/lib/supabase/auth-errors";

const requestSchema = z.object({
  mode: z.enum(["all", "subject", "group", "wrong", "due", "weak", "mock"]).default("all"),
  subjectId: z.string().optional(),
  conceptGroupId: z.string().optional(),
  count: z.union([z.number().int().min(1).max(80), z.literal("all")]).default(20),
  subjectAllocations: z.array(z.object({ subjectId: z.string().min(1), count: z.number().int().min(1).max(20) })).max(4).optional(),
  guestQuestionIds: z.array(z.string()).optional(),
  seed: z.number().int().optional(),
  originalRatio: z.union([z.literal(0), z.literal(25), z.literal(50), z.literal(75), z.literal(100)]).default(50),
  shuffleChoices: z.boolean().default(true),
  yearFrom: z.number().int().min(1900).max(2200).optional(),
  yearTo: z.number().int().min(1900).max(2200).optional(),
}).superRefine((value, context) => {
  if (
    (value.yearFrom === undefined) !== (value.yearTo === undefined) ||
    (value.yearFrom !== undefined &&
      value.yearTo !== undefined &&
      value.yearFrom > value.yearTo)
  ) {
    context.addIssue({
      code: "custom",
      path: ["yearFrom"],
      message: "기출 시작·종료 연도를 확인하세요.",
    });
  }
  if (value.mode !== "mock") return;
  if (!value.subjectAllocations?.length) {
    context.addIssue({ code: "custom", path: ["subjectAllocations"], message: "모의고사 과목을 선택하세요." });
    return;
  }
  if (new Set(value.subjectAllocations.map((item) => item.subjectId)).size !== value.subjectAllocations.length) {
    context.addIssue({ code: "custom", path: ["subjectAllocations"], message: "과목은 한 번씩만 선택할 수 있습니다." });
  }
  if (value.subjectAllocations.reduce((total, item) => total + item.count, 0) > 80) {
    context.addIssue({ code: "custom", path: ["subjectAllocations"], message: "필기 모의고사는 최대 80문제입니다." });
  }
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "출제 조건을 확인해 주세요." }, { status: 400 });

  const content = await getContent();
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const authResult = supabase ? await supabase.auth.getUser() : null;
  if (authResult?.error && !isAuthSessionMissingError(authResult.error)) {
    return NextResponse.json(
      { error: "로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요." },
      { status: 503 },
    );
  }
  const auth = authResult?.data ?? { user: null };
  let scopedIds = parsed.data.guestQuestionIds;

  if (auth.user && (parsed.data.mode === "wrong" || parsed.data.mode === "weak") && supabase) {
    const { data } = await supabase.from("attempts").select("question_id").eq("user_id", auth.user.id).eq("is_correct", false);
    const ids = (data ?? []).map((item) => item.question_id as string);
    const uniqueIds = [...new Set(ids)];
    const { data: rows } = uniqueIds.length ? await supabase.from("questions").select("id,external_id").in("id", uniqueIds) : { data: [] };
    const externalById = new Map((rows ?? []).map((item) => [item.id as string, item.external_id as string]));
    scopedIds = ids.map((id) => externalById.get(id)).filter((id): id is string => Boolean(id));
  }
  if (auth.user && parsed.data.mode === "due" && supabase) {
    const { data } = await supabase
      .from("review_queue")
      .select("question_id")
      .eq("user_id", auth.user.id)
      .lte("due_at", new Date().toISOString());
    const ids = (data ?? []).map((item) => item.question_id as string);
    const { data: rows } = ids.length ? await supabase.from("questions").select("external_id").in("id", ids) : { data: [] };
    scopedIds = (rows ?? []).map((item) => item.external_id as string);
  }

  const weakFocus = parsed.data.mode === "weak"
    ? buildWeakFocus(content.questions, scopedIds ?? [], parsed.data.subjectId)
    : null;
  const seed = parsed.data.seed ?? Date.now();
  const shuffleChoices =
    isReleaseFeatureEnabled("mock_choice_shuffle") &&
    parsed.data.shuffleChoices;
  const yearFiltered = filterPracticeContentByYearRange(
    content.questions,
    content.variants,
    parsed.data.yearFrom,
    parsed.data.yearTo,
  );
  const yearFilteredVariants = yearFiltered.variants;
  const questionPool = yearFiltered.questions;
  const reviewedPublishedQuestionIds = new Set(
    getSafeOriginalsByQuestion(questionPool, yearFilteredVariants).keys(),
  );
  const selectionQuestionPool = parsed.data.originalRatio === 100
    ? questionPool.filter((question) =>
        reviewedPublishedQuestionIds.has(question.id),
      )
    : questionPool;
  const selected = parsed.data.mode === "mock"
    ? selectAllocatedPracticeQuestions(
        selectionQuestionPool,
        parsed.data.subjectAllocations ?? [],
        seed,
        { additionalEligibleQuestionIds: reviewedPublishedQuestionIds },
      )
    : selectPracticeQuestions(
        selectionQuestionPool,
        {
          subjectId: parsed.data.mode === "subject" || parsed.data.mode === "group" || parsed.data.mode === "weak" ? parsed.data.subjectId : undefined,
          conceptGroupId: parsed.data.mode === "group" ? parsed.data.conceptGroupId : undefined,
          questionIds: parsed.data.mode === "weak" ? weakFocus?.questionIds : parsed.data.mode === "wrong" || parsed.data.mode === "due" ? scopedIds ?? [] : undefined,
        },
        parsed.data.count,
        seed,
        { additionalEligibleQuestionIds: reviewedPublishedQuestionIds },
      );
  const publicQuestions = createPracticePresentations(
    selected.questions,
    yearFilteredVariants,
    parsed.data.originalRatio,
    seed,
    shuffleChoices,
  );

  const sessionId = crypto.randomUUID();
  if (auth.user && supabase) {
    const { error } = await supabase.from("practice_sessions").insert({
      id: sessionId,
      user_id: auth.user.id,
      filter: { ...parsed.data, shuffleChoices },
      requested_count: selected.requestedCount === "all" ? null : selected.requestedCount,
      actual_count: selected.questions.length,
      status: "active",
      shuffle_choices: shuffleChoices,
      session_seed: seed,
    });
    if (error) {
      return NextResponse.json(
        { error: "학습 세션을 저장하지 못했습니다." },
        { status: 503 },
      );
    }

    if (selected.questions.length) {
      const { data: storedQuestions } = await supabase
        .from("questions")
        .select("id,external_id")
        .in("external_id", selected.questions.map((question) => question.id));
      const storedByExternalId = new Map((storedQuestions ?? []).map((item) => [item.external_id as string, item.id as string]));
      const variantExternalIds = publicQuestions
        .map((question) => question.provenance.exam?.externalId)
        .filter((externalId): externalId is string => Boolean(externalId));
      const { data: storedVariants } = variantExternalIds.length
        ? await supabase
            .from("question_variants")
            .select("id,external_id")
            .in("external_id", variantExternalIds)
        : { data: [] };
      const variantByExternalId = new Map(
        (storedVariants ?? []).map((item) => [
          item.external_id as string,
          item.id as string,
        ]),
      );
      const items = selected.questions
        .map((question, index) => {
          const questionId = storedByExternalId.get(question.id);
          if (!questionId) return null;
          const presentation = publicQuestions[index];
          return {
            session_id: sessionId,
            question_id: questionId,
            question_variant_id: presentation.provenance.exam?.externalId
              ? variantByExternalId.get(presentation.provenance.exam.externalId) ?? null
              : null,
            choice_order: presentation.choices.map((choice) => choice.id),
            position: index + 1,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      const { error: itemError } = items.length
        ? await supabase.from("practice_session_items").insert(items)
        : { error: null };
      if (itemError || items.length !== selected.questions.length) {
        await supabase.from("practice_sessions").delete().eq("id", sessionId);
        return NextResponse.json(
          { error: "문항 순서를 저장하지 못했습니다." },
          { status: 503 },
        );
      }
    }

    if (!admin) {
      await supabase.from("practice_sessions").delete().eq("id", sessionId);
      return NextResponse.json(
        { error: "계정 활동을 저장하지 못했습니다." },
        { status: 503 },
      );
    }
    const { data: touched, error: touchError } = await admin.rpc(
      "touch_account_activity",
      {
        p_user_id: auth.user.id,
        p_event: "practice_session",
        p_reference_id: sessionId,
      },
    );
    if (touchError || !Array.isArray(touched) || touched.length !== 1) {
      await supabase.from("practice_sessions").delete().eq("id", sessionId);
      return NextResponse.json(
        { error: "계정 활동을 저장하지 못했습니다." },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({
    sessionId,
    storage: auth.user ? "account" : "guest",
    availableCount: selected.availableCount,
    limited: selected.limited,
    originalRatio: parsed.data.originalRatio,
    shuffleChoices,
    actualOriginalCount: publicQuestions.filter((question) => question.provenance.original).length,
    yearRange:
      parsed.data.yearFrom !== undefined && parsed.data.yearTo !== undefined
        ? { from: parsed.data.yearFrom, to: parsed.data.yearTo }
        : null,
    focus: weakFocus ? {
      fallback: weakFocus.fallback,
      groups: weakFocus.groups.map((group) => ({
        ...group,
        title: content.conceptGroups.find((candidate) => candidate.id === group.id)?.title ?? group.id,
      })),
    } : null,
    subjectBreakdown: "breakdown" in selected ? selected.breakdown : null,
    questions: publicQuestions,
  });
}
