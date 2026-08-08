import type { CbtExamTrackKey } from "@/data/source/cbt-exam-tracks";

export type SourceAuthority =
  | "official"
  | "mirror_capture"
  | "user_reconstruction";

export type ContentFidelity =
  | "exact"
  | "normalized_exact"
  | "mismatch"
  | "unreachable";

export type AnswerEvidence =
  | "official"
  | "multi_capture_agreement"
  | "single_capture_uncontested"
  | "conflict"
  | "unknown";

export type TrackIdentityStatus = "matched" | "ambiguous" | "mismatch";
export type AssetStatus =
  | "complete"
  | "missing"
  | "mismatch"
  | "not_required"
  | "rights_hold";
export type AuditResolution = "pending" | "approved" | "hold" | "rejected";

export const CBT_AUDIT_BASELINE_AT = "2026-08-01T23:59:59+09:00";
export const CBT_PUBLICATION_POLICY = "historical_exam_reproduction" as const;

export type CbtSourceAuditRecord = {
  observationId: string;
  canonicalQuestionId: string;
  questionVariantId: string;
  occurrenceId: string;
  examTrackKey: CbtExamTrackKey | null;
  trackIdentityStatus: TrackIdentityStatus;
  examDate: string | null;
  datePrecision: "day" | "month" | "year" | "unknown";
  sessionLabel: string;
  questionNumber: number | null;
  sourceAuthority: SourceAuthority;
  sourceUrl: string;
  pageTitle: string | null;
  observedAt: string | null;
  questionHash: string;
  choicesHash: string;
  contentFidelity: ContentFidelity;
  sourceAnswer: string | null;
  answerEvidence: AnswerEvidence;
  answerChoiceId: string | null;
  answerChoiceQuestionId: string | null;
  answerConflictNote: string | null;
  assetStatus: AssetStatus;
  auditResolution: AuditResolution;
  expectedQuestionCount: number | null;
  expectedQuestionNumbersBasis: string | null;
  reviewedBy: string | null;
  reviewNote: string;
};

export type CbtPublicationDecisionInput = Pick<
  CbtSourceAuditRecord,
  | "trackIdentityStatus"
  | "sourceAuthority"
  | "contentFidelity"
  | "assetStatus"
  | "auditResolution"
  | "answerEvidence"
  | "answerChoiceId"
  | "answerChoiceQuestionId"
  | "canonicalQuestionId"
>;

export function normalizeCbtExactText(value: string) {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .trim();
}

export function classifyContentFidelity(
  captured: string,
  candidate: string,
): Extract<ContentFidelity, "exact" | "normalized_exact" | "mismatch"> {
  if (captured === candidate) return "exact";
  return normalizeCbtExactText(captured) === normalizeCbtExactText(candidate)
    ? "normalized_exact"
    : "mismatch";
}

export function canPublishCbtQuestion(input: CbtPublicationDecisionInput) {
  return (
    input.trackIdentityStatus === "matched" &&
    (input.sourceAuthority === "official" ||
      input.sourceAuthority === "mirror_capture") &&
    (input.contentFidelity === "exact" ||
      input.contentFidelity === "normalized_exact") &&
    input.auditResolution === "approved" &&
    (input.assetStatus === "complete" ||
      input.assetStatus === "not_required")
  );
}

export function canPublishCbtAnswer(input: CbtPublicationDecisionInput) {
  return (
    canPublishCbtQuestion(input) &&
    (input.answerEvidence === "official" ||
      input.answerEvidence === "multi_capture_agreement" ||
      input.answerEvidence === "single_capture_uncontested") &&
    Boolean(input.answerChoiceId) &&
    input.answerChoiceQuestionId === input.canonicalQuestionId
  );
}

export type SingleCaptureAnswerCheck = {
  hasExplicitAnswer: boolean;
  opposingEvidenceFound: boolean;
  internalContradictionFound: boolean;
  calculationOrUnitConflictFound: boolean;
  matchingStableChoiceIds: string[];
};

export function isSingleCaptureAnswerUncontested(
  check: SingleCaptureAnswerCheck,
) {
  return (
    check.hasExplicitAnswer &&
    !check.opposingEvidenceFound &&
    !check.internalContradictionFound &&
    !check.calculationOrUnitConflictFound &&
    check.matchingStableChoiceIds.length === 1
  );
}
