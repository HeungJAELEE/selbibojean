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
  const actual = Object.fromEntries(
    await Promise.all(
      Object.keys(expected).map(async (table) => [
        table,
        await countRows(client, table),
      ]),
    ),
  );
  for (const [table, count] of Object.entries(expected)) {
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
  await upsertRows(
    client,
    "question_concepts",
    plan.questionConcepts,
    "question_id,concept_id",
  );
  await upsertRows(
    client,
    "question_variants",
    plan.questionVariants,
    "external_id",
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
