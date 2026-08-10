import { NextResponse } from "next/server";
import { z } from "zod";
import { getContent } from "@/lib/content/repository";
import {
  createPracticePresentations,
  filterPracticeContentByYearRange,
} from "@/lib/content/practice-presentations";
import { selectDeduplicatedPracticeQuestions } from "@/lib/content/practice-question-deduplication";
import {
  buildWeakFocus,
  selectPracticeQuestions,
  shuffleQuestionIds,
  type PracticeFilter,
  type SubjectAllocation,
} from "@/lib/domain/practice";
import type { Question } from "@/lib/domain/types";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { isReleaseFeatureEnabled } from "@/lib/release-features";
import { hasCompletePracticeQuestionMapping } from "@/lib/learning/practice-session-storage";

function deduplicationCandidate(question: Question, essentialRank?: number) {
  return {
    question,
    id: question.id,
    lessonId: question.lessonId,
    stem: question.stem,
    choices: question.choices.map((choice) => choice.text),
    essentialRank,
  };
}

function selectSessionQuestions(
  questions: Question[],
  filter: PracticeFilter,
  count: number | "all",
  seed: number,
) {
  // Keep the established publishability, scope, and year filters as the source
  // of eligible questions; only the final session projection is deduplicated.
  const eligible = selectPracticeQuestions(questions, filter, "all", seed);
  const candidates = eligible.questions.map((question) =>
    deduplicationCandidate(question),
  );
  const available = selectDeduplicatedPracticeQuestions(candidates, {
    count: "all",
    seed,
  });
  const selected = selectDeduplicatedPracticeQuestions(candidates, {
    count,
    seed,
  });

  return {
    availableCount: available.length,
    requestedCount: count,
    limited: count !== "all" && available.length < count,
    questions: selected.map((candidate) => candidate.question),
  };
}

function selectAllocatedSessionQuestions(
  questions: Question[],
  allocations: SubjectAllocation[],
  seed: number,
) {
  const selected: Question[] = [];
  const usedQuestionIds = new Set<string>();
  const breakdown = allocations.map((allocation, index) => {
    const allocationSeed = seed ^ ((index + 1) * 0x45d9f3b);
    const eligible = selectPracticeQuestions(
      questions.filter((question) => !usedQuestionIds.has(question.id)),
      { subjectId: allocation.subjectId },
      "all",
      allocationSeed,
    );
    // Previously allocated questions get first claim on their exact duplicate
    // group, so a later subject cannot repeat an earlier session item.
    const candidates = [
      ...selected.map((question) => deduplicationCandidate(question, 0)),
      ...eligible.questions.map((question) => deduplicationCandidate(question, 1)),
    ];
    const available = selectDeduplicatedPracticeQuestions(candidates, {
      count: "all",
      seed: allocationSeed,
    }).filter((candidate) => !usedQuestionIds.has(candidate.id));
    const selectedWithAllocation = selectDeduplicatedPracticeQuestions(candidates, {
      count: selected.length + allocation.count,
      seed: allocationSeed,
    });
    const allocationQuestions = selectedWithAllocation
      .filter((candidate) => !usedQuestionIds.has(candidate.id))
      .map((candidate) => candidate.question);
    selected.push(...allocationQuestions);
    allocationQuestions.forEach((question) => usedQuestionIds.add(question.id));

    return {
      subjectId: allocation.subjectId,
      requestedCount: allocation.count,
      actualCount: allocationQuestions.length,
      availableCount: available.length,
      limited: allocationQuestions.length < allocation.count,
    };
  });
  const shuffled = shuffleQuestionIds(
    selected.map((question) => question.id),
    seed ^ 0x6a09e667,
  )
    .map((id) => selected.find((question) => question.id === id))
    .filter((question): question is Question => Boolean(question));

  return {
    availableCount: breakdown.reduce((total, item) => total + item.availableCount, 0),
    requestedCount: allocations.reduce((total, item) => total + item.count, 0),
    limited: breakdown.some((item) => item.limited),
    questions: shuffled,
    breakdown,
  };
}

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
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
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
  const selected = parsed.data.mode === "mock"
    ? selectAllocatedSessionQuestions(questionPool, parsed.data.subjectAllocations ?? [], seed)
    : selectSessionQuestions(
        questionPool,
        {
          subjectId: parsed.data.mode === "subject" || parsed.data.mode === "group" || parsed.data.mode === "weak" ? parsed.data.subjectId : undefined,
          conceptGroupId: parsed.data.mode === "group" ? parsed.data.conceptGroupId : undefined,
          questionIds: parsed.data.mode === "weak" ? weakFocus?.questionIds : parsed.data.mode === "wrong" || parsed.data.mode === "due" ? scopedIds ?? [] : undefined,
        },
        parsed.data.count,
        seed,
      );
  const publicQuestions = createPracticePresentations(
    selected.questions,
    yearFilteredVariants,
    parsed.data.originalRatio,
    seed,
    shuffleChoices,
  );

  const sessionId = crypto.randomUUID();
  let storage: "account" | "guest" = "guest";
  let storageNotice: string | null = null;
  if (auth.user && supabase) {
    const selectedQuestionIds = selected.questions.map(
      (question) => question.id,
    );
    const { data: storedQuestions, error: storedQuestionError } =
      selectedQuestionIds.length
        ? await supabase
        .from("questions")
        .select("id,external_id")
            .in("external_id", selectedQuestionIds)
        : { data: [], error: null };
    const hasCompleteQuestionMapping =
      !storedQuestionError &&
      hasCompletePracticeQuestionMapping(
        selectedQuestionIds,
        storedQuestions ?? [],
      );

    if (!hasCompleteQuestionMapping) {
      storageNotice =
        "일부 신규 문항이 계정 저장소와 동기화되기 전이라 이번 기록은 이 기기에 저장됩니다.";
    } else {
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
      const hasCompleteVariantMapping = variantExternalIds.every((externalId) =>
        variantByExternalId.has(externalId),
      );

      if (!hasCompleteVariantMapping) {
        storageNotice =
          "원문 회차 문항이 계정 저장소와 아직 동기화되지 않아 이번 기록은 이 기기에 저장됩니다.";
      } else {

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
        if (itemError) {
          await supabase.from("practice_sessions").delete().eq("id", sessionId);
          return NextResponse.json(
            { error: "문항 순서를 저장하지 못했습니다." },
            { status: 503 },
          );
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
        storage = "account";
      }
    }
  }

  return NextResponse.json({
    sessionId,
    storage,
    storageNotice,
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
