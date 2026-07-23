import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  isHighRiskPublicQuestion,
  writtenQuestionAuditManifestSchema,
  type WrittenQuestionAuditEntry,
} from "../src/lib/content/written-question-audit";
import { mergeApprovedWeldingProcessContent } from "../src/lib/content/welding-process-approved";
import { mergeApprovedWeldingSafetyContent } from "../src/lib/content/welding-safety-approved";
import { normalizeCanonicalTaxonomy } from "../src/lib/content/taxonomy-normalization";
import type {
  GeneratedContent,
  Question,
} from "../src/lib/domain/types";

const sourceUrl = new URL(
  "../src/data/generated/content.json",
  import.meta.url,
);
const outputUrl = new URL(
  "../src/data/generated/written-question-audit.json",
  import.meta.url,
);
const decisionsUrl = new URL(
  "../src/data/generated/written-question-audit-decisions.json",
  import.meta.url,
);
const sourceBytes = readFileSync(sourceUrl);
const sourceContent = JSON.parse(sourceBytes.toString("utf8")) as GeneratedContent;
const auditReviewedAt = new Date().toISOString();

// Deliberately excludes the audit overlay itself so regeneration is not
// self-referential after the runtime builder starts applying this manifest.
const content = mergeApprovedWeldingProcessContent(
  mergeApprovedWeldingSafetyContent(
    normalizeCanonicalTaxonomy(sourceContent),
  ),
);

const OFFICIAL_SOURCE_PATTERN =
  /(^|\.)((q-net\.or\.kr)|(law\.go\.kr)|(kosha\.or\.kr)|(kosha\.net)|(iso\.org)|(kats\.go\.kr)|(standard\.go\.kr))$/i;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function officialEvidenceUrls(question: Question) {
  return unique(question.verification?.sourceUrls ?? []).filter((value) => {
    try {
      return OFFICIAL_SOURCE_PATTERN.test(new URL(value).hostname);
    } catch {
      return false;
    }
  });
}

function allRecordedUrls(question: Question) {
  return unique([
    ...(question.verification?.sourceUrls ?? []),
    ...(question.sourceLabel.startsWith("http")
      ? question.sourceLabel.split(/\s+/).filter((value) => value.startsWith("http"))
      : []),
  ]);
}

function hasRisk(
  question: Question,
  risk: "asset_required" | "answer_conflict",
) {
  return (
    question.publication?.blockers.includes(risk) ||
    question.verification?.riskTags.includes(risk)
  );
}

function reviewQueueEntry(question: Question): WrittenQuestionAuditEntry {
  if (hasRisk(question, "asset_required")) {
    return {
      questionId: question.id,
      scope: "review_queue",
      sourceContentStatus: question.contentStatus,
      auditDisposition: "held_asset_missing",
      evidenceLevel: null,
      cbtAnswer: question.answerText || null,
      verifiedAnswer: null,
      evidenceUrls: allRecordedUrls(question),
      reviewNote:
        "원문 그림·도면이 없어 보기와 CBT 공개답을 독립적으로 확정할 수 없습니다.",
      nextAction:
        "원문 시각자료를 확보한 뒤 보기·답안을 재대조하고, 정확히 복원 가능한 경우에만 자체 SVG 제작을 검토합니다.",
      assetStatus: "missing",
      reviewedAt: auditReviewedAt,
    };
  }

  if (hasRisk(question, "answer_conflict")) {
    return {
      questionId: question.id,
      scope: "review_queue",
      sourceContentStatus: question.contentStatus,
      auditDisposition: "held_answer_conflict",
      evidenceLevel: null,
      cbtAnswer: question.answerText || null,
      verifiedAnswer: null,
      evidenceUrls: allRecordedUrls(question),
      reviewNote:
        "CBT 공개답과 기존 해설 또는 기술근거 사이의 충돌이 해소되지 않았습니다.",
      nextAction:
        "공식 출제기관·적용 표준·제조사 자료를 우선 대조해 verifiedAnswer를 확정하고 네 보기 해설을 다시 검수합니다.",
      assetStatus: "not_required",
      reviewedAt: auditReviewedAt,
    };
  }

  const needsAuthority =
    question.publication?.blockers.includes("authoritative_source_required") ||
    question.publication?.blockers.includes("high_risk_source") ||
    question.verification?.riskTags.includes("authoritative_source_required");

  return {
    questionId: question.id,
    scope: "review_queue",
    sourceContentStatus: question.contentStatus,
    auditDisposition: "held_source_missing",
    evidenceLevel: null,
    cbtAnswer: question.answerText || null,
    verifiedAnswer: null,
    evidenceUrls: allRecordedUrls(question),
    reviewNote: needsAuthority
      ? "법령·안전·표준·제조사 조건을 확정할 상위 근거가 부족합니다."
      : "정답·풀이·네 보기별 설명을 승인할 독립적인 근거가 부족합니다.",
    nextAction: needsAuthority
      ? "공식 출제기관·법령·KS/ISO 또는 제조사 기술자료를 확보해 답안과 적용조건을 재검수합니다."
      : "권위 있는 1차 자료 또는 서로 독립적인 전문자료 2개를 확보해 정답·풀이·보기별 설명을 검수합니다.",
    assetStatus: "not_required",
    reviewedAt: auditReviewedAt,
  };
}

function highRiskPublicEntry(question: Question): WrittenQuestionAuditEntry {
  const officialUrls = officialEvidenceUrls(question);
  const authoritativeVerified =
    question.verification?.status === "verified" &&
    question.verification.method === "authoritative_source_verified" &&
    officialUrls.length > 0;

  if (authoritativeVerified) {
    return {
      questionId: question.id,
      scope: "high_risk_public",
      sourceContentStatus: question.contentStatus,
      auditDisposition: "verified",
      evidenceLevel: "primary",
      cbtAnswer: question.answerText || null,
      verifiedAnswer: question.answerText || null,
      evidenceUrls: officialUrls,
      reviewNote:
        "공식 표준 원문과 CBT 출제맥락을 대조한 기존 권위출처 검증 기록을 확인했습니다.",
      nextAction:
        "표준 개정 또는 출제기준 변경 시 reviewedAt과 근거 URL을 다시 확인합니다.",
      assetStatus: "not_required",
      reviewedAt: auditReviewedAt,
    };
  }

  return {
    questionId: question.id,
    scope: "high_risk_public",
    sourceContentStatus: question.contentStatus,
    auditDisposition: "held_source_missing",
    evidenceLevel: null,
    cbtAnswer: question.answerText || null,
    verifiedAnswer: null,
    evidenceUrls: allRecordedUrls(question),
    reviewNote:
      "법령·안전·표준·제조사 조건이 포함됐지만 현재 기록은 CBT 또는 편집 근거 중심이라 상위 근거 검증이 충분하지 않습니다.",
    nextAction:
      "공식 출제기관·법령·KS/ISO 또는 제조사 기술자료로 정답·적용조건·네 보기 설명을 재검수합니다.",
    assetStatus: hasRisk(question, "asset_required")
      ? "missing"
      : "not_required",
    reviewedAt: auditReviewedAt,
  };
}

const reviewQueue = content.questions.filter(
  (question) => question.contentStatus !== "published",
);
const highRiskPublic = content.questions.filter(isHighRiskPublicQuestion);
const generatedEntries = [
  ...reviewQueue.map(reviewQueueEntry),
  ...highRiskPublic.map(highRiskPublicEntry),
].sort((left, right) =>
  left.questionId.localeCompare(right.questionId, "en", { numeric: true }),
);
const decisionEntries = existsSync(decisionsUrl)
  ? (JSON.parse(readFileSync(decisionsUrl, "utf8")) as {
      entries?: Array<
        Partial<WrittenQuestionAuditEntry> & Pick<WrittenQuestionAuditEntry, "questionId">
      >;
    }).entries ?? []
  : [];
const generatedIds = new Set(
  generatedEntries.map((entry) => entry.questionId),
);
const unknownDecisionIds = decisionEntries
  .map((entry) => entry.questionId)
  .filter((questionId) => !generatedIds.has(questionId));
if (unknownDecisionIds.length > 0) {
  throw new Error(
    `고정 감사목록에 없는 결정 ID가 있습니다: ${unknownDecisionIds.join(", ")}`,
  );
}
const decisionsByQuestionId = new Map(
  decisionEntries.map((entry) => [entry.questionId, entry]),
);
const entries = generatedEntries.map((entry) => ({
  ...entry,
  ...decisionsByQuestionId.get(entry.questionId),
  questionId: entry.questionId,
  scope: entry.scope,
  sourceContentStatus: entry.sourceContentStatus,
}));

const verified = entries.filter(
  (entry) => entry.auditDisposition === "verified",
).length;
const cbtCorrected = entries.filter(
  (entry) => entry.auditDisposition === "cbt_corrected",
).length;

const manifest = writtenQuestionAuditManifestSchema.parse({
  schemaVersion: 1,
  generatedAt: auditReviewedAt,
  sourceGeneratedAt: content.report.generatedAt,
  sourceSha256: createHash("sha256").update(sourceBytes).digest("hex"),
  counts: {
    reviewQueueExpected: reviewQueue.length,
    reviewQueueAudited: reviewQueue.length,
    highRiskPublicAudited: highRiskPublic.length,
    verified,
    cbtCorrected,
    held: entries.length - verified - cbtCorrected,
  },
  entries,
});

writeFileSync(
  fileURLToPath(outputUrl),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
process.stdout.write(
  `Written-question audit: ${manifest.counts.reviewQueueAudited} review queue + ${manifest.counts.highRiskPublicAudited} high-risk public; ${manifest.counts.held} held.\n`,
);
