import { NextResponse } from "next/server";
import { z } from "zod";
import { getContent } from "@/lib/content/repository";
import { selectPracticeQuestions, toPublicQuestion } from "@/lib/domain/practice";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  mode: z.enum(["all", "subject", "group", "wrong", "due"]).default("all"),
  subjectId: z.string().optional(),
  conceptGroupId: z.string().optional(),
  count: z.union([z.literal(10), z.literal(20), z.literal(50), z.literal("all")]).default(20),
  guestQuestionIds: z.array(z.string()).optional(),
  seed: z.number().int().optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "출제 조건을 확인해 주세요." }, { status: 400 });

  const content = await getContent();
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  let scopedIds = parsed.data.guestQuestionIds;

  if (auth.user && parsed.data.mode === "wrong" && supabase) {
    const { data } = await supabase.from("attempts").select("question_id").eq("user_id", auth.user.id).eq("is_correct", false);
    const ids = [...new Set((data ?? []).map((item) => item.question_id as string))];
    const { data: rows } = ids.length ? await supabase.from("questions").select("external_id").in("id", ids) : { data: [] };
    scopedIds = (rows ?? []).map((item) => item.external_id as string);
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

  const selected = selectPracticeQuestions(
    content.questions,
    {
      subjectId: parsed.data.mode === "subject" || parsed.data.mode === "group" ? parsed.data.subjectId : undefined,
      conceptGroupId: parsed.data.mode === "group" ? parsed.data.conceptGroupId : undefined,
      questionIds: parsed.data.mode === "wrong" || parsed.data.mode === "due" ? scopedIds ?? [] : undefined,
    },
    parsed.data.count,
    parsed.data.seed,
  );

  const sessionId = crypto.randomUUID();
  if (auth.user && supabase) {
    const { error } = await supabase.from("practice_sessions").insert({
      id: sessionId,
      user_id: auth.user.id,
      filter: parsed.data,
      requested_count: parsed.data.count === "all" ? null : parsed.data.count,
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
    questions: selected.questions.map(toPublicQuestion),
  });
}
