import { NextResponse } from "next/server";
import { z } from "zod";
import { getContent } from "@/lib/content/repository";
import { createPracticePresentations } from "@/lib/content/practice-presentations";
import { buildWeakFocus, selectAllocatedPracticeQuestions, selectPracticeQuestions } from "@/lib/domain/practice";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  mode: z.enum(["all", "subject", "group", "wrong", "due", "weak", "mock"]).default("all"),
  subjectId: z.string().optional(),
  conceptGroupId: z.string().optional(),
  count: z.union([z.number().int().min(1).max(80), z.literal("all")]).default(20),
  subjectAllocations: z.array(z.object({ subjectId: z.string().min(1), count: z.number().int().min(1).max(20) })).max(4).optional(),
  guestQuestionIds: z.array(z.string()).optional(),
  seed: z.number().int().optional(),
  originalRatio: z.union([z.literal(0), z.literal(25), z.literal(50), z.literal(75), z.literal(100)]).default(50),
}).superRefine((value, context) => {
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
  const selected = parsed.data.mode === "mock"
    ? selectAllocatedPracticeQuestions(content.questions, parsed.data.subjectAllocations ?? [], seed)
    : selectPracticeQuestions(
        content.questions,
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
    content.variants,
    parsed.data.originalRatio,
    seed,
  );

  const sessionId = crypto.randomUUID();
  if (auth.user && supabase) {
    const { error } = await supabase.from("practice_sessions").insert({
      id: sessionId,
      user_id: auth.user.id,
      filter: parsed.data,
      requested_count: selected.requestedCount === "all" ? null : selected.requestedCount,
      actual_count: selected.questions.length,
      status: "active",
    });
    if (!error && selected.questions.length) {
      const { data: storedQuestions } = await supabase
        .from("questions")
        .select("id,external_id")
        .in("external_id", selected.questions.map((question) => question.id));
      const storedByExternalId = new Map((storedQuestions ?? []).map((item) => [item.external_id as string, item.id as string]));
      await supabase.from("practice_session_items").insert(
        selected.questions
          .map((question, index) => ({ session_id: sessionId, question_id: storedByExternalId.get(question.id), position: index + 1 }))
          .filter((item): item is { session_id: string; question_id: string; position: number } => Boolean(item.question_id)),
      );
    }
  }

  return NextResponse.json({
    sessionId,
    storage: auth.user ? "account" : "guest",
    availableCount: selected.availableCount,
    limited: selected.limited,
    originalRatio: parsed.data.originalRatio,
    actualOriginalCount: publicQuestions.filter((question) => question.provenance.original).length,
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
