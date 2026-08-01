import { readFile } from "node:fs/promises";
import path from "node:path";
import generatedContent from "../src/data/generated/content.json";
import {
  canPublishCbtAnswer,
  canPublishCbtQuestion,
  type CbtSourceAuditRecord,
} from "../src/lib/content/cbt-source-audit";
import type { GeneratedContent } from "../src/lib/domain/types";

type AuditDataset = {
  formatVersion: number;
  sourceCounts: { canonicalQuestions: number; variants: number };
  lunaAuditStatus: string;
  records: CbtSourceAuditRecord[];
};

const source = generatedContent as GeneratedContent;
const audit = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src/data/generated/cbt-source-audit.json"),
    "utf8",
  ),
) as AuditDataset;

const failures: string[] = [];
if (audit.formatVersion !== 1) failures.push("formatVersion must be 1");
if (audit.records.length !== source.variants.length) {
  failures.push(
    `variant reconciliation failed: ${audit.records.length} != ${source.variants.length}`,
  );
}
if (audit.sourceCounts.canonicalQuestions !== source.questions.length) {
  failures.push("canonical question count does not match generated content");
}

assertUnique(
  audit.records.map((record) => record.observationId),
  "observationId",
  failures,
);
assertUnique(
  audit.records.map((record) => record.questionVariantId),
  "questionVariantId",
  failures,
);

const sourceVariantIds = new Set(
  source.variants.map((variant) => variant.externalId),
);
for (const record of audit.records) {
  if (!sourceVariantIds.has(record.questionVariantId)) {
    failures.push(`unknown variant: ${record.questionVariantId}`);
  }
  if (record.questionHash.length !== 64 || record.choicesHash.length !== 64) {
    failures.push(`invalid SHA-256: ${record.questionVariantId}`);
  }
  if (canPublishCbtAnswer(record) && !canPublishCbtQuestion(record)) {
    failures.push(`answer published without question: ${record.questionVariantId}`);
  }
  if (
    (record.answerEvidence === "conflict" ||
      record.answerEvidence === "unknown") &&
    canPublishCbtAnswer(record)
  ) {
    failures.push(`conflict/unknown answer became publishable: ${record.questionVariantId}`);
  }
}

if (
  audit.lunaAuditStatus === "pending_unavailable" &&
  audit.records.some((record) => record.auditResolution === "approved")
) {
  failures.push("Luna-unavailable baseline must not auto-approve records");
}

if (failures.length) {
  console.error(failures.slice(0, 30).join("\n"));
  process.exit(1);
}

console.log(
  `CBT audit verified: ${audit.records.length} shadow records; learner approvals=${audit.records.filter((record) => record.auditResolution === "approved").length}`,
);

function assertUnique(
  values: string[],
  label: string,
  failures: string[],
) {
  const unique = new Set(values);
  if (unique.size !== values.length) {
    failures.push(`${label} contains ${values.length - unique.size} duplicates`);
  }
}
