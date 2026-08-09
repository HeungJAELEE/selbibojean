import { loadEnvFile } from "node:process";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import generatedContent from "../src/data/generated/content.json";
import { buildRuntimeContent } from "../src/lib/content/runtime-content";
import {
  buildSupabaseMaterialization,
  stableContentUuid,
  type SupabaseMaterializationPlan,
} from "../src/lib/content/supabase-materialization";
import type { GeneratedContent } from "../src/lib/domain/types";

const TRACK_CODE = "facility-maintenance-engineer-current";
const BATCH_SIZE = 50;
const NETWORK_RETRY_DELAYS_MS = [250, 1_000, 2_000] as const;

function loadLocalEnvironment() {
  try {
    loadEnvFile(path.join(process.cwd(), ".env.local"));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}

function chunks<T>(items: T[]) {
  return Array.from(
    { length: Math.ceil(items.length / BATCH_SIZE) },
    (_, index) => items.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE),
  );
}

async function upsertRows(
  client: SupabaseClient,
  table: string,
  rows: Array<Record<string, unknown>>,
  onConflict: string,
) {
  for (const [batchIndex, batch] of chunks(rows).entries()) {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const { error } = await client
          .from(table)
          .upsert(batch, { onConflict });
        if (error) {
          throw new Error(`${table} upsert failed: ${error.message}`);
        }
        break;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        const retryable =
          error instanceof TypeError &&
          /fetch failed|ECONNRESET|UND_ERR|ETIMEDOUT/i.test(message);
        const delay = NETWORK_RETRY_DELAYS_MS[attempt];
        if (!retryable || delay === undefined) {
          throw new Error(
            `${table} batch ${batchIndex + 1} upsert failed: ${message}`,
            { cause: error },
          );
        }
        console.warn(
          `${table} batch ${batchIndex + 1} network retry ${attempt + 1}/${NETWORK_RETRY_DELAYS_MS.length}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

async function countRows(
  client: SupabaseClient,
  table: string,
  publishedOnly = false,
) {
  let query = client.from(table).select("*", { count: "exact", head: true });
  if (publishedOnly) query = query.eq("status", "published");
  const { count, error } = await query;
  if (error) throw new Error(`${table} readback failed: ${error.message}`);
  return count ?? 0;
}

async function countRowsByIds(
  client: SupabaseClient,
  table: string,
  column: string,
  ids: string[],
) {
  let total = 0;
  for (const batch of chunks(ids)) {
    const { count, error } = await client
      .from(table)
      .select("*", { count: "exact", head: true })
      .in(column, batch);
    if (error) throw new Error(`${table} scoped readback failed: ${error.message}`);
    total += count ?? 0;
  }
  return total;
}

async function replacePrimaryQuestionConcepts(
  client: SupabaseClient,
  rows: Array<Record<string, unknown>>,
) {
  for (const batch of chunks(rows)) {
    const questionIds = batch.map((row) => String(row.question_id));
    const { error: deleteError } = await client
      .from("question_concepts")
      .delete()
      .in("question_id", questionIds)
      .eq("role", "primary");
    if (deleteError) {
      throw new Error(
        `question_concepts primary reconciliation failed: ${deleteError.message}`,
      );
    }
    const { error: insertError } = await client
      .from("question_concepts")
      .insert(batch);
    if (insertError) {
      throw new Error(
        `question_concepts primary insert failed: ${insertError.message}`,
      );
    }
  }
}

async function pruneOrphanedConcepts(
  client: SupabaseClient,
  plannedConcepts: Array<Record<string, unknown>>,
) {
  const desiredIds = new Set(plannedConcepts.map((row) => String(row.id)));
  const ownedGroupIds = new Set(
    plannedConcepts.map((row) => String(row.concept_group_id)),
  );
  const staleIds: string[] = [];

  for (let from = 0; ; from += 1_000) {
    const { data, error } = await client
      .from("concepts")
      .select("id,concept_group_id,question_concepts(count)")
      .range(from, from + 999);
    if (error) {
      throw new Error(`concept orphan readback failed: ${error.message}`);
    }
    for (const row of data ?? []) {
      if (
        !ownedGroupIds.has(String(row.concept_group_id)) ||
        desiredIds.has(String(row.id))
      ) {
        continue;
      }
      const relationCount = Number(
        (row.question_concepts as Array<{ count?: number }> | null)?.[0]
          ?.count ?? 0,
      );
      if (relationCount > 0) {
        throw new Error(
          `stale concept ${String(row.id)} is still referenced by questions`,
        );
      }
      staleIds.push(String(row.id));
    }
    if ((data ?? []).length < 1_000) break;
  }

  for (const batch of chunks(staleIds)) {
    const { error } = await client.from("concepts").delete().in("id", batch);
    if (error) {
      throw new Error(`concept orphan cleanup failed: ${error.message}`);
    }
  }
}

async function archiveStaleQuestions(
  client: SupabaseClient,
  examTrackId: string,
  plannedQuestions: Array<Record<string, unknown>>,
) {
  const desiredIds = new Set(plannedQuestions.map((row) => String(row.id)));
  const staleIds: string[] = [];
  for (let from = 0; ; from += 1_000) {
    const { data, error } = await client
      .from("questions")
      .select("id")
      .eq("exam_track_id", examTrackId)
      .range(from, from + 999);
    if (error) throw new Error(`stale question readback failed: ${error.message}`);
    staleIds.push(
      ...(data ?? [])
        .map((row) => String(row.id))
        .filter((id) => !desiredIds.has(id)),
    );
    if ((data ?? []).length < 1_000) break;
  }
  for (const batch of chunks(staleIds)) {
    const { error: variantError } = await client
      .from("question_variants")
      .update({ status: "draft" })
      .in("canonical_question_id", batch);
    if (variantError) {
      throw new Error(`stale variant archive failed: ${variantError.message}`);
    }
    const { error: questionError } = await client
      .from("questions")
      .update({ status: "draft" })
      .in("id", batch);
    if (questionError) {
      throw new Error(`stale question archive failed: ${questionError.message}`);
    }
  }
}

async function resolveExamTrackId(client: SupabaseClient, apply: boolean) {
  const { data, error } = await client
    .from("exam_tracks")
    .select("id,code")
    .eq("code", TRACK_CODE)
    .maybeSingle();
  if (error) throw new Error(`exam track lookup failed: ${error.message}`);
  if (data?.id) return String(data.id);

  const id = stableContentUuid("exam-track", TRACK_CODE);
  if (!apply) return id;
  const { error: insertError } = await client.from("exam_tracks").insert({
    id,
    code: TRACK_CODE,
    title: "설비보전기사(신)",
    status: "published",
  });
  if (insertError) {
    throw new Error(`exam track insert failed: ${insertError.message}`);
  }
  return id;
}

function createPlan(examTrackId: string) {
  const runtimeContent = buildRuntimeContent(
    generatedContent as GeneratedContent,
  );
  return buildSupabaseMaterialization(runtimeContent, examTrackId);
}

async function verifyPublicProjection(
  client: SupabaseClient,
  plan: SupabaseMaterializationPlan,
) {
  const actual = {
    questions: await countRows(client, "questions"),
    choices: await countRows(client, "choices"),
    questionVariants: await countRows(client, "question_variants"),
  };
  const expected = {
    questions: plan.counts.publishedQuestions,
    choices: plan.counts.publishedChoices,
    questionVariants: plan.counts.publishedQuestionVariants,
  };
  if (
    actual.questions !== expected.questions ||
    actual.choices !== expected.choices ||
    actual.questionVariants !== expected.questionVariants
  ) {
    throw new Error(
      `public Supabase content mismatch: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
    );
  }
  return actual;
}

async function verifyAdminReadback(
  client: SupabaseClient,
  plan: SupabaseMaterializationPlan,
) {
  const expected = {
    subjects: plan.counts.subjects,
    concept_groups: plan.counts.conceptGroups,
    concepts: plan.counts.concepts,
    questions: plan.counts.questions,
    choices: plan.counts.choices,
    choice_feedback: plan.counts.choiceFeedback,
    answer_keys: plan.counts.answerKeys,
    question_concepts: plan.counts.questionConcepts,
    question_variants: plan.counts.questionVariants,
  };
  const actual = {
    subjects: await countRowsByIds(
      client,
      "subjects",
      "id",
      plan.subjects.map((row) => row.id),
    ),
    concept_groups: await countRowsByIds(
      client,
      "concept_groups",
      "id",
      plan.conceptGroups.map((row) => row.id),
    ),
    concepts: await countRowsByIds(
      client,
      "concepts",
      "id",
      plan.concepts.map((row) => row.id),
    ),
    questions: await countRowsByIds(
      client,
      "questions",
      "id",
      plan.questions.map((row) => row.id),
    ),
    choices: await countRowsByIds(
      client,
      "choices",
      "id",
      plan.choices.map((row) => row.id),
    ),
    choice_feedback: await countRowsByIds(
      client,
      "choice_feedback",
      "choice_id",
      plan.choiceFeedback.map((row) => row.choice_id),
    ),
    answer_keys: await countRowsByIds(
      client,
      "answer_keys",
      "question_id",
      plan.answerKeys.map((row) => row.question_id),
    ),
    question_concepts: await countRowsByIds(
      client,
      "question_concepts",
      "question_id",
      plan.questionConcepts.map((row) => row.question_id),
    ),
    question_variants: await countRowsByIds(
      client,
      "question_variants",
      "id",
      plan.questionVariants.map((row) => row.id),
    ),
  };
  for (const table of Object.keys(expected) as Array<keyof typeof expected>) {
    const count = expected[table];
    if (actual[table] !== count) {
      throw new Error(
        `${table} reconciliation failed: expected ${count}, received ${actual[table]}`,
      );
    }
  }
  return actual;
}

async function applyPlan(
  client: SupabaseClient,
  plan: SupabaseMaterializationPlan,
) {
  await upsertRows(
    client,
    "exam_tracks",
    [
      {
        id: plan.identity.examTrackId,
        code: TRACK_CODE,
        title: "설비보전기사(신)",
        status: "published",
      },
    ],
    "code",
  );
  await upsertRows(
    client,
    "exam_modes",
    plan.examModes,
    "exam_track_id,code",
  );
  await upsertRows(
    client,
    "syllabus_versions",
    plan.syllabusVersions,
    "exam_track_id,title",
  );
  await upsertRows(
    client,
    "subjects",
    plan.subjects,
    "syllabus_version_id,code",
  );
  await upsertRows(
    client,
    "concept_groups",
    plan.conceptGroups,
    "external_key",
  );
  await upsertRows(
    client,
    "concepts",
    plan.concepts,
    // Concept titles can be refined while their stable content identity stays
    // the same. Reconcile by the stable primary key so a title correction
    // updates the existing row instead of attempting a duplicate insert.
    "id",
  );
  await upsertRows(client, "questions", plan.questions, "external_id");
  await upsertRows(client, "choices", plan.choices, "external_id");
  await upsertRows(
    client,
    "choice_feedback",
    plan.choiceFeedback,
    "choice_id",
  );
  await upsertRows(
    client,
    "answer_keys",
    plan.answerKeys,
    "question_id",
  );
  // A question has exactly one primary concept. When taxonomy improves, the
  // concept_id changes while question_id stays stable, so replace only the
  // primary edge and preserve any non-primary learning links.
  await replacePrimaryQuestionConcepts(client, plan.questionConcepts);
  await pruneOrphanedConcepts(client, plan.concepts);
  await upsertRows(
    client,
    "question_variants",
    plan.questionVariants,
    "external_id",
  );
  await archiveStaleQuestions(
    client,
    plan.identity.examTrackId,
    plan.questions,
  );
}

async function main() {
  loadLocalEnvironment();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apply = process.argv.includes("--apply");
  const verifyPublic = process.argv.includes("--verify-public");

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required.");
  if (apply && !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for --apply.");
  }
  if (verifyPublic && !publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for --verify-public.",
    );
  }

  const key = apply ? serviceRoleKey! : verifyPublic ? publishableKey! : null;
  const client = key
    ? createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;
  const examTrackId = client
    ? await resolveExamTrackId(client, apply)
    : stableContentUuid("exam-track", TRACK_CODE);
  const plan = createPlan(examTrackId);

  if (!apply && !verifyPublic) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          trackCode: TRACK_CODE,
          digest: plan.digest,
          counts: plan.counts,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (verifyPublic) {
    const publicCounts = await verifyPublicProjection(client!, plan);
    console.log(
      JSON.stringify(
        {
          mode: "verify-public",
          digest: plan.digest,
          publicCounts,
        },
        null,
        2,
      ),
    );
    return;
  }

  await applyPlan(client!, plan);
  const adminCounts = await verifyAdminReadback(client!, plan);
  const publicClient = createClient(url, publishableKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const publicCounts = await verifyPublicProjection(publicClient, plan);
  console.log(
    JSON.stringify(
      {
        mode: "apply",
        digest: plan.digest,
        adminCounts,
        publicCounts,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
