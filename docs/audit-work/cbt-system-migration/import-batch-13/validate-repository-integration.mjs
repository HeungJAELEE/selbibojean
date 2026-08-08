import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const audit = resolve(root, "docs/audit-work/cbt-system-migration/import-batch-13");
const manifestPath = resolve(root, "src/data/generated/cbt-reviewed-variants.json");
const contentPath = resolve(root, "src/data/generated/content.json");
const manifestRaw = readFileSync(manifestPath, "utf8");
const contentRaw = readFileSync(contentPath, "utf8");
const manifest = JSON.parse(manifestRaw);
const content = JSON.parse(contentRaw);
const failures = [];
const checks = {};
const check = (name, value, detail = "") => {
  checks[name] = Boolean(value);
  if (!value) failures.push(detail ? `${name}: ${detail}` : name);
};
const sha = (value) => createHash("sha256").update(value).digest("hex");
const objectSha = (value) => sha(JSON.stringify(value));
const counts = manifest.records.reduce((acc, record) => {
  const state = record.review.runtimeStatus;
  acc[state] = (acc[state] ?? 0) + 1;
  return acc;
}, {});
check("node_major_24", Number(process.versions.node.split(".")[0]) === 24, process.versions.node);
check("content_sha", sha(contentRaw) === "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4");
check("manifest_sha", sha(manifestRaw) === "e52c9f24acea019713bd451a9ed3792204d5f4390b1f61726310719bb670d838");
check("record_count", manifest.records.length === 2384);
check("records_digest", objectSha(manifest.records) === manifest.recordsSha256);
check("canonical_digest", objectSha(manifest.canonicalQuestionChanges) === manifest.canonicalQuestionChangesSha256);
check("state_counts", counts.candidate === 2267 && counts.hold === 98 && counts.choice_conflict === 19 && !counts.published);
check("unique_external_ids", new Set(manifest.records.map((record) => record.externalId)).size === 2384);
check("source_exact_set", new Set(content.variants.map((variant) => variant.externalId)).size === 2384 && content.variants.every((variant) => manifest.records.some((record) => record.externalId === variant.externalId)));
check("conflicts_fail_closed", manifest.records.filter((r) => r.review.runtimeStatus === "choice_conflict").every((r) => r.reviewedAnswerIndex === null && r.choiceIdMapping.length === 0 && r.choiceConflict?.scoringPolicy === "non_scoring"));
check("holds_fail_closed", manifest.records.filter((r) => r.review.runtimeStatus === "hold").every((r) => r.reviewedAnswerIndex === null && r.choiceIdMapping.length === 0));
check("canonical_audits_blocked", manifest.canonicalQuestionChanges.every((change) => change.question.publication?.readiness === "blocked" && change.question.audit?.auditDisposition?.startsWith("held_")));
const output = {
  status: failures.length ? "FAIL" : "PASS",
  scope: "dependency-free Node.js 24 repository integration validation",
  nodeVersion: process.version,
  counts,
  checks,
  failures,
};
writeFileSync(resolve(audit, "runtime-validation.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
process.exit(failures.length ? 1 : 0);
