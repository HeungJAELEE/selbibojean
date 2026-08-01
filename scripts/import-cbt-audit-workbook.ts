import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
import generatedContent from "../src/data/generated/content.json";
import {
  CBT_AUDIT_BASELINE_AT,
  CBT_PUBLICATION_POLICY,
  type CbtSourceAuditRecord,
} from "../src/lib/content/cbt-source-audit";
import { cbtExamTracksByKey, type CbtExamTrackKey } from "../src/data/source/cbt-exam-tracks";
import type { GeneratedContent } from "../src/lib/domain/types";

type Cell = string | number | boolean | Date | null;
type Row = Record<string, Cell>;

const workbookPath =
  process.argv[2] ??
  path.join(
    process.cwd(),
    "outputs/cbt-source-audit-20260801/CBT_출처감사_초기원장_2026-08-01.xlsx",
  );
const outputPath = path.join(
  process.cwd(),
  "src/data/generated/cbt-source-audit.json",
);
const content = generatedContent as GeneratedContent;
const rows = toRecords(
  (await readSheet(workbookPath, "출처관찰")) as unknown as Cell[][],
);
const sourceContent = await readFile(
  path.join(process.cwd(), "src/data/generated/content.json"),
);
const knownVariantIds = new Set(
  content.variants.map((variant) => variant.externalId),
);
const variantsById = new Map(
  content.variants.map((variant) => [variant.externalId, variant]),
);
const errors: string[] = [];

const records = rows.map((row, index): CbtSourceAuditRecord => {
  const line = index + 2;
  const variantId = requiredText(row, "question_variant_id", line, errors);
  const trackKey = optionalText(row, "exam_track_key");
  if (variantId && !knownVariantIds.has(variantId)) {
    errors.push(`출처관찰 ${line}: unknown question_variant_id ${variantId}`);
  }
  if (trackKey && !cbtExamTracksByKey.has(trackKey as CbtExamTrackKey)) {
    errors.push(`출처관찰 ${line}: unknown exam_track_key ${trackKey}`);
  }

  return {
    observationId: requiredText(row, "observation_id", line, errors),
    canonicalQuestionId: variantsById.get(variantId)?.canonicalId ?? "",
    questionVariantId: variantId,
    occurrenceId: requiredText(row, "occurrence_id", line, errors),
    examTrackKey: (trackKey || null) as CbtExamTrackKey | null,
    trackIdentityStatus: enumValue(
      row,
      "track_identity_status",
      ["matched", "ambiguous", "mismatch"] as const,
      line,
      errors,
    ),
    examDate: optionalDate(row, "시험일"),
    datePrecision: enumValue(
      row,
      "날짜정밀도",
      ["day", "month", "year", "unknown"] as const,
      line,
      errors,
    ),
    sessionLabel: requiredText(row, "회차", line, errors),
    questionNumber: optionalNumber(row, "문항번호"),
    sourceAuthority: enumValue(
      row,
      "source_authority",
      ["official", "mirror_capture", "user_reconstruction"] as const,
      line,
      errors,
    ),
    sourceUrl: requiredText(row, "source_url", line, errors),
    pageTitle: optionalText(row, "page_title") || null,
    observedAt: optionalDate(row, "observed_at"),
    questionHash: requiredText(row, "question_sha256", line, errors),
    choicesHash: requiredText(row, "choices_sha256", line, errors),
    contentFidelity: enumValue(
      row,
      "content_fidelity",
      ["exact", "normalized_exact", "mismatch", "unreachable"] as const,
      line,
      errors,
    ),
    sourceAnswer: optionalText(row, "source_answer") || null,
    answerEvidence: enumValue(
      row,
      "answer_evidence",
      [
        "official",
        "multi_capture_agreement",
        "single_capture_uncontested",
        "conflict",
        "unknown",
      ] as const,
      line,
      errors,
    ),
    answerChoiceId: optionalText(row, "answer_choice_id") || null,
    answerChoiceQuestionId:
      optionalText(row, "answer_choice_question_id") || null,
    answerConflictNote: null,
    assetStatus: enumValue(
      row,
      "asset_status",
      ["complete", "missing", "mismatch", "not_required", "rights_hold"] as const,
      line,
      errors,
    ),
    auditResolution: enumValue(
      row,
      "audit_resolution",
      ["pending", "approved", "hold", "rejected"] as const,
      line,
      errors,
    ),
    expectedQuestionCount: optionalNumber(row, "expected_question_count"),
    expectedQuestionNumbersBasis:
      optionalText(row, "expected_numbers_basis") || null,
    reviewedBy: optionalText(row, "reviewed_by") || null,
    reviewNote: requiredText(row, "review_note", line, errors),
  };
});

assertUnique(records.map((record) => record.observationId), "observation_id");
assertUnique(records.map((record) => record.questionVariantId), "question_variant_id");
if (records.length !== content.variants.length) {
  errors.push(
    `row reconciliation failed: ${records.length} != ${content.variants.length}`,
  );
}

if (errors.length) {
  console.error(errors.slice(0, 50).join("\n"));
  process.exit(1);
}

await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      formatVersion: 1,
      generatedAt: content.report.generatedAt,
      auditBaselineAt: CBT_AUDIT_BASELINE_AT,
      publicationPolicy: CBT_PUBLICATION_POLICY,
      sourceContentSha256: createHash("sha256")
        .update(sourceContent)
        .digest("hex"),
      sourceCounts: {
        canonicalQuestions: content.questions.length,
        variants: content.variants.length,
      },
      lunaAuditStatus: "pending_unavailable",
      records,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Imported ${records.length} CBT audit rows from ${workbookPath}`);

function toRecords(rows: Cell[][]) {
  const headers = (rows[0] ?? []).map((cell) => String(cell ?? "").trim());
  return rows.slice(1).flatMap((cells) => {
    const row: Row = {};
    let hasValue = false;
    headers.forEach((header, index) => {
      if (!header) return;
      const value = cells[index] ?? null;
      row[header] = value;
      if (value !== null && value !== "") hasValue = true;
    });
    return hasValue ? [row] : [];
  });
}

function cellText(value: Cell | undefined) {
  if (value instanceof Date) return value.toISOString();
  return value === null || value === undefined ? "" : String(value).trim();
}

function requiredText(
  row: Row,
  column: string,
  line: number,
  errors: string[],
) {
  const value = cellText(row[column]);
  if (!value) errors.push(`출처관찰 ${line}: ${column} is required`);
  return value;
}

function optionalText(row: Row, column: string) {
  return cellText(row[column]);
}

function optionalDate(row: Row, column: string) {
  const value = row[column];
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = cellText(value);
  return text || null;
}

function optionalNumber(row: Row, column: string) {
  const value = row[column];
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function enumValue<const T extends readonly string[]>(
  row: Row,
  column: string,
  values: T,
  line: number,
  errors: string[],
) {
  const value = cellText(row[column]);
  if (!values.includes(value)) {
    errors.push(`출처관찰 ${line}: invalid ${column}=${value}`);
    return values[0] as T[number];
  }
  return value as T[number];
}

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    errors.push(`${label} contains duplicate values`);
  }
}
