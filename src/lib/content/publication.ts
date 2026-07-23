export const PUBLICATION_BLOCKERS = [
  "incomplete",
  "answer_unverified",
  "mapping_unverified",
  "asset_required",
  "answer_conflict",
  "authoritative_source_required",
  "high_risk_source",
  "content_quality",
  "lesson_source_needed",
] as const;

export type PublicationBlocker = (typeof PUBLICATION_BLOCKERS)[number];
export type PublicationReadiness = "ready" | "review" | "blocked";

export const VERIFICATION_RISK_TAGS = [
  "asset_required",
  "answer_conflict",
  "authoritative_source_required",
  "historical_context",
  "editorial_reconstruction",
] as const;

export type VerificationRiskTag = (typeof VERIFICATION_RISK_TAGS)[number];

export type PublicationAssessment = {
  readiness: PublicationReadiness;
  blockers: PublicationBlocker[];
};

const CONFIRMED_ANSWER_PATTERN =
  /^(?:확정(?:\s|$))|(?:A형|B형)\s*(?:원문·)?(?:최종)?확정답안|최종답안 확인|원문·정답 확인/;

const ASSET_PLACEHOLDER_PATTERN =
  /\[?원문[^\]\n]*(?:이미지|그림|도식|회로|기호|수식|표)|이미지 보기 [①②③④]|부분복원|원문 확인 필요|원문 .*이미지/;

const ANSWER_CONFLICT_PATTERN =
  /복수정답|답안충돌|정답 충돌|모두 옳|모두 점검|불명확|원문 선택지.*충돌|원문 오류신고|확인필요|확인 필요/;

const AUTHORITATIVE_STATUS_PATTERN =
  /법령|현행 (?:법령|위험물)|현행.*(?:KS|ISO|IEC|JIS|ASTM|NAS|규격)|KS\b|ISO\b|IEC\b|JIS\b|ASTM\b|NAS\b|제조사|제품별|정격속도|운전범위|사용온도|교환기준|과거 .*?(?:수치|경계값|온도기준|법령|규정|규격)|현행 설계확인/i;

const AUTHORITATIVE_CANONICAL_PATTERN =
  /법령|산업안전보건|위험물(?:안전관리법)?|KS\b|ISO\b|IEC\b|JIS\b|ASTM\b|NAS\b|NLGI\b|SAE\b|API\s*(?:등급|서비스)|제조사(?:의|가| 승인| 지침)|제품지침|법정검사/i;

const HISTORICAL_CONTEXT_PATTERN = /과거|구기준|개정 전|폐지/;

const EDITORIAL_RECONSTRUCTION_PATTERN =
  /학습용 재구성|이미지형 재구성|도식형 재구성|수식 .*재구성|문맥주의|문맥 주의|분류주의|용어주의|표현 보정|기술원리로 재구성/;

export function isConfirmedAnswerStatus(status: string) {
  return CONFIRMED_ANSWER_PATTERN.test(status.trim());
}

export function classifyVerificationRisks(input: {
  status: string;
  stem: string;
  choices?: string[];
  answer?: string;
  explanation: string;
}) {
  const canonicalText = [input.stem, ...(input.choices ?? []), input.answer ?? "", input.explanation]
    .filter(Boolean)
    .join(" ");
  const allText = `${canonicalText} ${input.status}`;
  const riskTags: VerificationRiskTag[] = [];

  if (ASSET_PLACEHOLDER_PATTERN.test(canonicalText)) riskTags.push("asset_required");
  if (ANSWER_CONFLICT_PATTERN.test(allText)) riskTags.push("answer_conflict");
  if (
    AUTHORITATIVE_STATUS_PATTERN.test(input.status) ||
    AUTHORITATIVE_CANONICAL_PATTERN.test(canonicalText)
  ) riskTags.push("authoritative_source_required");
  if (HISTORICAL_CONTEXT_PATTERN.test(allText)) riskTags.push("historical_context");
  if (EDITORIAL_RECONSTRUCTION_PATTERN.test(input.status)) riskTags.push("editorial_reconstruction");

  return [...new Set(riskTags)];
}

export function requiresAuthoritativeSource(input: {
  status: string;
  stem: string;
  choices?: string[];
  answer?: string;
  explanation: string;
}) {
  return classifyVerificationRisks(input).includes("authoritative_source_required");
}

export function canVerifyFromWorkbookSource(input: {
  complete: boolean;
  sourceUrls: string[];
  riskTags: VerificationRiskTag[];
}) {
  return input.complete &&
    input.sourceUrls.length > 0 &&
    !input.riskTags.includes("asset_required") &&
    !input.riskTags.includes("answer_conflict") &&
    !input.riskTags.includes("authoritative_source_required");
}

export function assessQuestionPublication(input: {
  complete: boolean;
  answerConfirmed: boolean;
  mappingReliable: boolean;
  highRisk?: boolean;
  assetRequired?: boolean;
  answerConflict?: boolean;
  authoritativeSourceRequired?: boolean;
  contentQuality?: boolean;
  lessonSourceNeeded?: boolean;
}): PublicationAssessment {
  const blockers: PublicationBlocker[] = [];
  if (!input.complete) blockers.push("incomplete");
  if (!input.answerConfirmed) blockers.push("answer_unverified");
  if (!input.mappingReliable) blockers.push("mapping_unverified");
  if (input.assetRequired) blockers.push("asset_required");
  if (input.answerConflict) blockers.push("answer_conflict");
  if (input.authoritativeSourceRequired) blockers.push("authoritative_source_required");
  if (input.highRisk) blockers.push("high_risk_source");
  if (input.contentQuality === false) blockers.push("content_quality");
  if (input.lessonSourceNeeded) blockers.push("lesson_source_needed");

  const hardBlockers: PublicationBlocker[] = [
    "incomplete",
    "mapping_unverified",
    "asset_required",
    "answer_conflict",
    "authoritative_source_required",
    "high_risk_source",
    "content_quality",
  ];
  const readiness: PublicationReadiness = blockers.length === 0
    ? "ready"
    : blockers.some((blocker) => hardBlockers.includes(blocker))
      ? "blocked"
      : "review";

  return { readiness, blockers };
}
