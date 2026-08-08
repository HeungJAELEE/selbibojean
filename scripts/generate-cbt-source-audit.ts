import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import generatedContent from "../src/data/generated/content.json";
import {
  CBT_AUDIT_BASELINE_AT,
  CBT_PUBLICATION_POLICY,
  normalizeCbtExactText,
  type CbtSourceAuditRecord,
  type SourceAuthority,
} from "../src/lib/content/cbt-source-audit";
import type { GeneratedContent } from "../src/lib/domain/types";

type AuditDataset = {
  formatVersion: 1;
  generatedAt: string;
  auditBaselineAt: string;
  publicationPolicy: typeof CBT_PUBLICATION_POLICY;
  sourceContentSha256: string;
  sourceCounts: {
    canonicalQuestions: number;
    variants: number;
  };
  lunaAuditStatus: "pending_unavailable";
  records: CbtSourceAuditRecord[];
};

const outputPath = path.join(
  process.cwd(),
  "src/data/generated/cbt-source-audit.json",
);

const content = generatedContent as GeneratedContent;
const previous = await readPreviousDataset(outputPath);
const previousObservationIds = new Map(
  previous?.records.map((record) => [
    `${record.questionVariantId}\u0000${record.sourceUrl}`,
    record.observationId,
  ]) ?? [],
);
const previousOccurrenceIds = new Map(
  previous?.records.map((record) => [
    occurrenceKey(record.sessionLabel, record.examDate),
    record.occurrenceId,
  ]) ?? [],
);
const questionsById = new Map(
  content.questions.map((question) => [question.id, question]),
);
const occurrenceIds = new Map(previousOccurrenceIds);

const records = content.variants.map((variant): CbtSourceAuditRecord => {
  const question = questionsById.get(variant.canonicalId);
  const sourceKey = `${variant.externalId}\u0000${variant.sourceUrl}`;
  const examDate = variant.year ? `${variant.year}-01-01` : null;
  const occurrence = occurrenceKey(variant.sessionLabel, examDate);
  const occurrenceId = occurrenceIds.get(occurrence) ?? randomUUID();
  occurrenceIds.set(occurrence, occurrenceId);
  const assetRequired =
    question?.publication?.blockers.includes("asset_required") ?? false;

  return {
    observationId: previousObservationIds.get(sourceKey) ?? randomUUID(),
    canonicalQuestionId: variant.canonicalId,
    questionVariantId: variant.externalId,
    occurrenceId,
    examTrackKey: null,
    trackIdentityStatus: "ambiguous",
    examDate,
    datePrecision: variant.year ? "year" : "unknown",
    sessionLabel: variant.sessionLabel,
    questionNumber: variant.questionNumber,
    sourceAuthority: classifySourceAuthority(variant.sourceUrl),
    sourceUrl: variant.sourceUrl,
    pageTitle: null,
    observedAt: null,
    questionHash: sha256(normalizeCbtExactText(variant.stem)),
    choicesHash: sha256(
      JSON.stringify(variant.choices.map(normalizeCbtExactText)),
    ),
    contentFidelity: "unreachable",
    sourceAnswer: variant.answer || null,
    answerEvidence: "unknown",
    answerChoiceId: null,
    answerChoiceQuestionId: null,
    answerConflictNote: null,
    assetStatus: assetRequired ? "missing" : "not_required",
    auditResolution: "pending",
    expectedQuestionCount: null,
    expectedQuestionNumbersBasis: null,
    reviewedBy: null,
    reviewNote:
      "기존 27차 워크북 행을 삭제하지 않고 shadow audit 원장에 등록했습니다. URL·페이지 제목·회차·문제·보기·정답을 허용 출처에서 대조하기 전에는 공개 승격하지 않습니다.",
  };
});

const sourceContent = await readFile(
  path.join(process.cwd(), "src/data/generated/content.json"),
);
const dataset: AuditDataset = {
  formatVersion: 1,
  generatedAt: content.report.generatedAt,
  auditBaselineAt: CBT_AUDIT_BASELINE_AT,
  publicationPolicy: CBT_PUBLICATION_POLICY,
  sourceContentSha256: createHash("sha256").update(sourceContent).digest("hex"),
  sourceCounts: {
    canonicalQuestions: content.questions.length,
    variants: content.variants.length,
  },
  lunaAuditStatus: "pending_unavailable",
  records,
};

await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(
  `CBT shadow audit: ${records.length} records, ${occurrenceIds.size} occurrences -> ${outputPath}`,
);

function occurrenceKey(sessionLabel: string, examDate: string | null) {
  return `${examDate ?? "unknown"}\u0000${sessionLabel}`;
}

function classifySourceAuthority(url: string): SourceAuthority {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (
      host === "comcbt.com" ||
      host === "www.comcbt.com" ||
      host === "cbtbank.kr" ||
      host === "www.cbtbank.kr" ||
      host === "cbtbank.co.kr" ||
      host === "www.cbtbank.co.kr"
    ) {
      return "mirror_capture";
    }
  } catch {
    // Invalid legacy URLs stay review-only rather than gaining authority.
  }
  return "user_reconstruction";
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function readPreviousDataset(filePath: string) {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as AuditDataset;
  } catch {
    return null;
  }
}
