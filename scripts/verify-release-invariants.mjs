import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const CONTENT_SHA256 =
  "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4";
const EXPECTED = Object.freeze({
  records: 2384,
  candidate: 0,
  hold: 98,
  choiceConflict: 19,
  published: 2267,
  theoryLessonAdditions: 20,
  canonicalQuestionChanges: 19,
  batches: 13,
});
const CANONICAL_ANSWER_CONFLICT_IDS = new Set([
  "U-1215",
  "U-1161",
  "U-1166",
  "U-1072",
  "U-1089",
]);
const CANONICAL_MAPPING_GATED_IDS = new Set(["U-649", "U-478"]);
const CANONICAL_BLOCKERS = new Set([
  "incomplete",
  "answer_unverified",
  "mapping_unverified",
  "asset_required",
  "answer_conflict",
  "authoritative_source_required",
  "high_risk_source",
  "content_quality",
  "lesson_source_needed",
]);
const AUDIT_DISPOSITIONS = new Set([
  "verified",
  "cbt_corrected",
  "held_answer_conflict",
  "held_asset_missing",
  "held_source_missing",
  "held_runtime_validation",
]);
const VERIFICATION_METHODS = new Set([
  "workbook_confirmed",
  "source_backed_reconstruction",
  "authoritative_source_verified",
  "manual_source_required",
]);
const VERIFICATION_RISK_TAGS = new Set([
  "asset_required",
  "answer_conflict",
  "authoritative_source_required",
  "historical_context",
  "editorial_reconstruction",
]);
const EXPECTED_CANONICAL_AUDITS = new Map([
  ["U-1161", "held_answer_conflict"],
  ["U-1166", "held_answer_conflict"],
  ["U-1089", "held_answer_conflict"],
  ["U-649", "held_source_missing"],
  ["U-478", "held_runtime_validation"],
]);

function fail(message) {
  throw new Error(`CBT release invariant failure: ${message}`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

async function fileExists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function assertContains(relativePath, tokens) {
  const content = await readFile(path.join(root, relativePath), "utf8");
  for (const token of tokens) {
    if (!content.includes(token)) {
      fail(`${relativePath} is missing release contract token: ${token}`);
    }
  }
  return content;
}

function countBy(values, selector) {
  const result = new Map();
  for (const value of values) {
    const key = selector(value);
    result.set(key, (result.get(key) ?? 0) + 1);
  }
  return result;
}

const manifestPath = path.join(
  root,
  "src",
  "data",
  "generated",
  "cbt-reviewed-variants.json",
);
const contentPath = path.join(root, "src", "data", "generated", "content.json");
const manifestBytes = await readFile(manifestPath);
const contentBytes = await readFile(contentPath);
const manifest = JSON.parse(manifestBytes.toString("utf8"));

if (sha256(contentBytes) !== CONTENT_SHA256) {
  fail("content.json does not match the reviewed-import baseline");
}
if (manifest.records.length !== EXPECTED.records) {
  fail(`record count ${manifest.records.length} != ${EXPECTED.records}`);
}
if (new Set(manifest.records.map((record) => record.externalId)).size !== EXPECTED.records) {
  fail("external IDs are not an exact unique set");
}
if (sha256(JSON.stringify(manifest.records)) !== manifest.recordsSha256) {
  fail("recordsSha256 does not match the records payload");
}
if (
  sha256(JSON.stringify(manifest.theoryLessonAdditions)) !==
  manifest.theoryLessonAdditionsSha256
) {
  fail("theoryLessonAdditionsSha256 does not match");
}
if (
  sha256(JSON.stringify(manifest.canonicalQuestionChanges)) !==
  manifest.canonicalQuestionChangesSha256
) {
  fail("canonicalQuestionChangesSha256 does not match");
}

const states = countBy(
  manifest.records,
  (record) => record.review.runtimeStatus,
);
for (const [state, expected] of [
  ["candidate", EXPECTED.candidate],
  ["hold", EXPECTED.hold],
  ["choice_conflict", EXPECTED.choiceConflict],
  ["published", EXPECTED.published],
]) {
  if ((states.get(state) ?? 0) !== expected) {
    fail(`${state} count ${(states.get(state) ?? 0)} != ${expected}`);
  }
}

if (manifest.theoryLessonAdditions.length !== EXPECTED.theoryLessonAdditions) {
  fail("unexpected theory lesson addition count");
}
if (manifest.canonicalQuestionChanges.length !== EXPECTED.canonicalQuestionChanges) {
  fail("unexpected canonical question change count");
}
if (manifest.batches.length !== EXPECTED.batches) {
  fail("unexpected reviewed-import batch count");
}
if (manifest.batches.at(-1)?.batchId !== "import-13") {
  fail("import-13 is not the final integration batch");
}

const release = manifest.publicationRelease;
if (
  release?.releaseId !== "reviewed-cbt-publication-2026-08-09" ||
  release.decisionAuthority !== "user_explicit_approval" ||
  release.reviewedRecordCount !== EXPECTED.records ||
  release.publishedCount !== EXPECTED.published ||
  release.holdCount !== EXPECTED.hold ||
  release.choiceConflictCount !== EXPECTED.choiceConflict
) {
  fail("reviewed CBT publication release receipt is missing or inconsistent");
}
const promotedExternalIdsSha256 = sha256(
  JSON.stringify(
    manifest.records
      .filter((record) => record.review.runtimeStatus === "published")
      .map((record) => record.externalId)
      .sort(),
  ),
);
if (release.promotedExternalIdsSha256 !== promotedExternalIdsSha256) {
  fail("published external-ID digest does not match the release receipt");
}
const sourceTextContractsSha256 = sha256(
  JSON.stringify(
    manifest.records
      .map((record) => ({
        externalId: record.externalId,
        stem: record.stem,
        choices: record.choices,
        stemSha256: record.source.stemSha256,
        orderedChoicesSha256: record.source.orderedChoicesSha256,
        registeredSourceUrl: record.source.registeredSourceUrl,
        resolvedSourceUrl: record.source.resolvedSourceUrl,
        questionNumber: record.questionNumber,
      }))
      .sort((left, right) => left.externalId.localeCompare(right.externalId)),
  ),
);
if (release.sourceTextContractsSha256 !== sourceTextContractsSha256) {
  fail("source text contract digest does not match the release receipt");
}

for (const record of manifest.records) {
  const blockers = record.review.publicationBlockers ?? [];
  if (sha256(record.stem) !== record.source.stemSha256) {
    fail(`${record.externalId} stem changed from the source-reviewed text`);
  }
  if (
    sha256(JSON.stringify(record.choices)) !==
    record.source.orderedChoicesSha256
  ) {
    fail(`${record.externalId} ordered choices changed from the source-reviewed text`);
  }
  if (record.review.runtimeStatus === "candidate") {
    fail(`${record.externalId} remained candidate after the approved release`);
  } else if (record.review.runtimeStatus === "hold") {
    if (record.reviewedAnswerIndex !== null || record.choiceIdMapping.length !== 0) {
      fail(`${record.externalId} HOLD carries an active answer contract`);
    }
  } else if (record.review.runtimeStatus === "choice_conflict") {
    if (
      record.review.scoringDisposition !== "non_scoring_choice_conflict" ||
      !blockers.includes("choice_conflict_non_scoring") ||
      record.reviewedAnswerIndex !== null ||
      record.choiceIdMapping.length !== 0
    ) {
      fail(`${record.externalId} choice-conflict contract is not non-scoring`);
    }
  } else if (record.review.runtimeStatus === "published") {
    if (
      record.reviewedAnswerIndex === null ||
      !record.review.scoringDisposition.startsWith("scored")
    ) {
      fail(`${record.externalId} published without an active reviewed answer`);
    }
  } else {
    fail(`${record.externalId} has unknown runtime status`);
  }
}

for (const addition of manifest.theoryLessonAdditions) {
  const lesson = addition.lesson;
  if (
    lesson.contentStatus === "published" ||
    lesson.publication?.readiness !== "blocked" ||
    !lesson.publication?.blockers?.length
  ) {
    fail(`${lesson.id} theory addition is not release-blocked`);
  }
}

for (const change of manifest.canonicalQuestionChanges) {
  const question = change.question;
  if (
    question.contentStatus === "published" ||
    question.publication?.readiness !== "blocked" ||
    !question.publication?.blockers?.length
  ) {
    fail(`${question.id} canonical change is not release-blocked`);
  }
  for (const blocker of question.publication.blockers) {
    if (!CANONICAL_BLOCKERS.has(blocker)) {
      fail(`${question.id} uses a non-canonical publication blocker: ${blocker}`);
    }
  }
  if (!VERIFICATION_METHODS.has(question.verification?.method)) {
    fail(`${question.id} uses an unknown verification method`);
  }
  for (const riskTag of question.verification?.riskTags ?? []) {
    if (!VERIFICATION_RISK_TAGS.has(riskTag)) {
      fail(`${question.id} uses an unknown verification risk tag: ${riskTag}`);
    }
  }
  if (!AUDIT_DISPOSITIONS.has(question.audit?.auditDisposition)) {
    fail(`${question.id} uses an unknown audit disposition`);
  }
  if (question.audit?.questionId && question.audit.questionId !== question.id) {
    fail(`${question.id} carries audit metadata for another question`);
  }
  const expectedAudit = EXPECTED_CANONICAL_AUDITS.get(question.id);
  if (expectedAudit && question.audit?.auditDisposition !== expectedAudit) {
    fail(`${question.id} audit ${question.audit?.auditDisposition} != ${expectedAudit}`);
  }
  if (CANONICAL_ANSWER_CONFLICT_IDS.has(question.id)) {
    if (!question.publication.blockers.includes("answer_conflict")) {
      fail(`${question.id} lacks canonical answer_conflict blocker`);
    }
  }
  if (CANONICAL_MAPPING_GATED_IDS.has(question.id)) {
    if (!question.publication.blockers.includes("mapping_unverified")) {
      fail(`${question.id} lacks canonical mapping_unverified blocker`);
    }
  }
}

const runtimeSource = await readFile(
  path.join(root, "src", "lib", "content", "reviewed-cbt-variants.ts"),
  "utf8",
);
for (const token of [
  'variant.reviewState !== "published"',
  'record.review.runtimeStatus === "choice_conflict"',
  "validateHoldRecord(record)",
]) {
  if (!runtimeSource.includes(token)) {
    fail(`runtime gate token missing: ${token}`);
  }
}

const pastExamSource = await readFile(
  path.join(root, "src", "lib", "content", "past-exam-examples.ts"),
  "utf8",
);
if (!pastExamSource.includes('variant.reviewState !== "published"')) {
  fail("past-exam runtime does not explicitly reject non-published variants");
}

const supabaseSource = await readFile(
  path.join(root, "src", "lib", "content", "supabase-materialization.ts"),
  "utf8",
);
if (!supabaseSource.includes('variant.reviewState === "published"')) {
  fail("Supabase materialization does not explicitly require published variants");
}

const content = await readJson("src/data/generated/content.json");
if (content.variants.length !== EXPECTED.records) {
  fail(`content variant count ${content.variants.length} != ${EXPECTED.records}`);
}

const packageJson = await readJson("package.json");
if (packageJson.packageManager !== "npm@10.9.2") {
  fail("packageManager must be pinned to npm@10.9.2");
}
for (const [script, requiredTokens] of Object.entries({
  "verify:data": ["verify:reviewed-cbt", "verify-no-answer-leak.ts --scope=source"],
  check: ["verify:release-invariants", "typecheck", "lint", "test", "build"],
  "verify:database": ["supabase db lint", "supabase test db"],
  "preflight:release": [
    "verify:database",
    "test:e2e:release",
    "verify:supabase-content",
  ],
})) {
  const command = packageJson.scripts?.[script] ?? "";
  for (const token of requiredTokens) {
    if (!command.includes(token)) {
      fail(`package script ${script} is missing ${token}`);
    }
  }
}
if (await fileExists("pnpm-lock.yaml") || await fileExists("pnpm-workspace.yaml")) {
  fail("npm is the release package manager; pnpm lock/workspace files must be absent");
}

await assertContains("supabase/migrations/0005_attempt_idempotency_and_release_gates.sql", [
  "client_attempt_id uuid",
  "attempts_user_client_attempt_unique",
  "answer_key.correct_choice_id = choice.id",
  "answer result mismatch",
  "owned practice session item required",
  "client attempt id payload conflict",
  "p_client_attempt_id uuid",
]);
await assertContains("src/app/api/practice/submit/route.ts", [
  "p_client_attempt_id: parsed.data.clientAttemptId",
  "같은 답안을 다시 제출해 주세요",
  "status: 503",
]);
await assertContains("src/app/api/account/merge-guest-learning/route.ts", [
  "deriveLegacyAttemptId(attempt)",
  "merged !== sanitized.length",
  "status: 503",
]);
await assertContains("supabase/tests/rls_behavior.sql", [
  "idempotent retry does not duplicate attempts",
  "clients cannot forge correctness",
  "another user session cannot be attached",
  "one learner cannot read another learner attempts",
]);
await assertContains("tests/e2e/cbt-release-gates.spec.ts", [
  "actualOriginalCount",
  "/data/content-manifest.json",
  "correctChoiceId",
  "blocked canonical questions stay unavailable",
  "mobile pages do not introduce horizontal overflow",
]);
await assertContains(".github/workflows/quality-gate.yml", [
  "node-version: 24",
  "npm ci",
  "npm run check",
]);
await assertContains(".github/workflows/release-e2e.yml", [
  "node-version: 24",
  "npm ci",
  "npm run test:e2e:release",
]);
await assertContains(".github/workflows/database-gate.yml", [
  "supabase/setup-cli@v2",
  "version: 2.112.0",
  "supabase db reset",
  "supabase test db",
]);

console.log(
  [
    "PASS: CBT release invariants",
    `${EXPECTED.records} reviewed variants`,
    `${EXPECTED.published} published`,
    `${EXPECTED.hold} HOLD non-scoring`,
    `${EXPECTED.choiceConflict} choice conflicts non-scoring`,
    "source stems and ordered choices hash-locked",
    `${EXPECTED.theoryLessonAdditions} theory additions blocked`,
    `${EXPECTED.canonicalQuestionChanges} canonical changes blocked`,
  ].join(" · "),
);
