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

async function replacePrimaryQuestionConcepts(
  client: SupabaseClient,
  rows: Array<Record<string, unknown>>,
) {
  for (const [batchIndex, batch] of chunks(rows).entries()) {
    const questionIds = batch.map((row) => String(row.question_id));
    for (let attempt = 0; ; attempt += 1) {
      try {
        const { error: deleteError } = await client
          .from("question_concepts")
          .delete()
          .eq("role", "primary")
          .in("question_id", questionIds);
        if (deleteError) {
          throw new Error(
            `question_concepts primary replacement delete failed: ${deleteError.message}`,
          );
        }
        const { error: upsertError } = await client
          .from("question_concepts")
          .upsert(batch, { onConflict: "question_id,concept_id" });
        if (upsertError) {
          throw new Error(
            `question_concepts primary replacement upsert failed: ${upsertError.message}`,
          );
        }
        break;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        const retryable =
          /fetch failed|ECONNRESET|UND_ERR|ETIMEDOUT/i.test(message);
        const delay = NETWORK_RETRY_DELAYS_MS[attempt];
        if (!retryable || delay === undefined) {
          throw new Error(
            `question_concepts batch ${batchIndex + 1} replacement failed: ${message}`,
            { cause: error },
          );
        }
        console.warn(
          `question_concepts batch ${batchIndex + 1} network retry ${attempt + 1}/${NETWORK_RETRY_DELAYS_MS.length}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

async function countRowsByValues(
  client: SupabaseClient,
  table: string,
  column: string,
  values: string[],
  equals: Record<string, string> = {},
) {
  let total = 0;
  for (const batch of chunks(values)) {
    let query = client
      .from(table)
      .select("*", { count: "exact", head: true })
      .in(column, batch);
    for (const [filterColumn, filterValue] of Object.entries(equals)) {
      query = query.eq(filterColumn, filterValue);
    }
    const { count, error } = await query;
    if (error) {
      throw new Error(`${table} scoped readback failed: ${error.message}`);
    }
    total += count ?? 0;
  }
  return total;
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
  const publishedQuestionIds = plan.questions
    .filter((row) => row.status === "published")
    .map((row) => row.id);
  const { count: questionCount, error: questionError } = await client
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("exam_track_id", plan.identity.examTrackId);
  if (questionError) {
    throw new Error(
      `questions public readback failed: ${questionError.message}`,
    );
  }
  const actual = {
    questions: questionCount ?? 0,
    choices: await countRowsByValues(
      client,
      "choices",
      "question_id",
      publishedQuestionIds,
    ),
    questionVariants: await countRowsByValues(
      client,
      "question_variants",
      "canonical_question_id",
      publishedQuestionIds,
    ),
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
  const expectations = [
    ["subjects", "id", plan.subjects.map((row) => row.id), {}],
    [
      "concept_groups",
      "id",
      plan.conceptGroups.map((row) => row.id),
      {},
    ],
    ["concepts", "id", plan.concepts.map((row) => row.id), {}],
    ["questions", "id", plan.questions.map((row) => row.id), {}],
    ["choices", "id", plan.choices.map((row) => row.id), {}],
    [
      "choice_feedback",
      "choice_id",
      plan.choiceFeedback.map((row) => row.choice_id),
      {},
    ],
    [
      "answer_keys",
      "question_id",
      plan.answerKeys.map((row) => row.question_id),
      {},
    ],
    [
      "question_concepts",
      "question_id",
      plan.questionConcepts.map((row) => row.question_id),
      { role: "primary" },
    ],
    [
      "question_variants",
      "id",
      plan.questionVariants.map((row) => row.id),
      {},
    ],
  ] as const;
  const actual = Object.fromEntries(
    await Promise.all(
      expectations.map(
        async ([table, column, values, equals]) => [
          table,
          await countRowsByValues(
            client,
            table,
            column,
            [...values],
            equals,
          ),
        ],
      ),
    ),
  );
  for (const [table, , values] of expectations) {
    if (actual[table] !== values.length) {
      throw new Error(
        `${table} reconciliation failed: expected ${values.length}, received ${actual[table]}`,
      );
    }
  }
  return actual;
}

async function retireStaleTrackQuestions(
  client: SupabaseClient,
  plan: SupabaseMaterializationPlan,
) {
  const existingIds: string[] = [];
  const pageSize = 1_000;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await client
      .from("questions")
      .select("id")
      .eq("exam_track_id", plan.identity.examTrackId)
      .order("id")
      .range(start, start + pageSize - 1);
    if (error) {
      throw new Error(`stale question lookup failed: ${error.message}`);
    }
    existingIds.push(...(data ?? []).map((row) => String(row.id)));
    if ((data?.length ?? 0) < pageSize) break;
  }
  const plannedIds = new Set(plan.questions.map((row) => row.id));
  const staleIds = existingIds.filter((id) => !plannedIds.has(id));
  for (const batch of chunks(staleIds)) {
    const { error: variantError } = await client
      .from("question_variants")
      .update({ status: "draft" })
      .in("canonical_question_id", batch);
    if (variantError) {
      throw new Error(
        `stale question variant retirement failed: ${variantError.message}`,
      );
    }
    const { error: questionError } = await client
      .from("questions")
      .update({ status: "draft" })
      .in("id", batch);
    if (questionError) {
      throw new Error(
        `stale question retirement failed: ${questionError.message}`,
      );
    }
  }
  return staleIds.length;
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
    "concept_group_id,canonical_name",
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
  await replacePrimaryQuestionConcepts(client, plan.questionConcepts);
  await upsertRows(
    client,
    "question_variants",
    plan.questionVariants,
    "external_id",
  );
  return retireStaleTrackQuestions(client, plan);
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

  const retiredQuestionCount = await applyPlan(client!, plan);
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
        retiredQuestionCount,
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
