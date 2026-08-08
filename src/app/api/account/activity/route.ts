import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

const activitySchema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("practice_session"), referenceId: z.uuid() }).strict(),
  z.object({ event: z.literal("practice_attempt"), referenceId: z.uuid() }).strict(),
  z.object({ event: z.literal("note"), referenceId: z.uuid() }).strict(),
  z.object({ event: z.literal("bookmark"), referenceId: z.uuid() }).strict(),
]);

const ACTIVITY_EVIDENCE_MAX_AGE_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const parsed = activitySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const evidenceCutoff = new Date(
    Date.now() - ACTIVITY_EVIDENCE_MAX_AGE_MS,
  ).toISOString();
  const evidence = getEvidenceLookup(parsed.data.event);
  const query = supabase
    .from(evidence.table)
    .select("id")
    .eq("id", parsed.data.referenceId)
    .eq("user_id", auth.user.id)
    .gte(evidence.timestampColumn, evidenceCutoff);
  const { data: evidenceRow, error: evidenceError } = await query.maybeSingle();
  if (evidenceError) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  if (!evidenceRow) {
    return NextResponse.json({ ok: false }, { status: 409 });
  }

  const { data: touched, error: touchError } = await admin.rpc(
    "touch_account_activity",
    {
      p_user_id: auth.user.id,
      p_event: parsed.data.event,
      p_reference_id: parsed.data.referenceId,
    },
  );
  if (touchError || !Array.isArray(touched) || touched.length !== 1) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

function getEvidenceLookup(
  event: z.infer<typeof activitySchema>["event"],
) {
  switch (event) {
    case "practice_session":
      return { table: "practice_sessions", timestampColumn: "created_at" } as const;
    case "practice_attempt":
      return { table: "attempts", timestampColumn: "attempted_at" } as const;
    case "note":
      return { table: "notes", timestampColumn: "updated_at" } as const;
    case "bookmark":
      return { table: "bookmarks", timestampColumn: "created_at" } as const;
  }
}
