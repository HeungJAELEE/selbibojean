export const PUBLICATION_BLOCKERS = [
  "incomplete",
  "answer_unverified",
  "mapping_unverified",
  "high_risk_source",
  "content_quality",
  "lesson_source_needed",
] as const;

export type PublicationBlocker = (typeof PUBLICATION_BLOCKERS)[number];
export type PublicationReadiness = "ready" | "review" | "blocked";

export type PublicationAssessment = {
  readiness: PublicationReadiness;
  blockers: PublicationBlocker[];
};

const CONFIRMED_ANSWER_PATTERN =
  /^(?:확정(?:\s|$))|(?:A형|B형)\s*(?:원문·)?(?:최종)?확정답안|최종답안 확인|원문·정답 확인/;

const HIGH_RISK_DOMAIN_PATTERN =
  /법령|산업안전|안전보건|안전밸브|보호구|방호|화재|폭발|감전|질식|KS\b|ISO\b|IEC\b|JIS\b|ASTM\b|NAS\b|규격|제조사|이미지|사진|도식형|과거|현행 확인/i;

const REVIEW_RISK_PATTERN =
  /미확인|충돌|오류|복원|복수정답|확인\s*필요|이견|문맥\s*주의|분류\s*주의|표현\s*보정|원문\s*확인|주의$/i;

export function isConfirmedAnswerStatus(status: string) {
  return CONFIRMED_ANSWER_PATTERN.test(status.trim());
}

export function requiresAuthoritativeSource(input: {
  status: string;
  stem: string;
  explanation: string;
}) {
  return HIGH_RISK_DOMAIN_PATTERN.test(`${input.stem} ${input.explanation} ${input.status}`) ||
    REVIEW_RISK_PATTERN.test(input.status);
}

export function assessQuestionPublication(input: {
  complete: boolean;
  answerConfirmed: boolean;
  mappingReliable: boolean;
  highRisk: boolean;
  contentQuality?: boolean;
  lessonSourceNeeded?: boolean;
}): PublicationAssessment {
  const blockers: PublicationBlocker[] = [];
  if (!input.complete) blockers.push("incomplete");
  if (!input.answerConfirmed) blockers.push("answer_unverified");
  if (!input.mappingReliable) blockers.push("mapping_unverified");
  if (input.highRisk) blockers.push("high_risk_source");
  if (input.contentQuality === false) blockers.push("content_quality");
  if (input.lessonSourceNeeded) blockers.push("lesson_source_needed");

  const readiness: PublicationReadiness = blockers.length === 0
    ? "ready"
    : blockers.some((blocker) =>
        ["incomplete", "mapping_unverified", "high_risk_source", "content_quality"].includes(blocker),
      )
      ? "blocked"
      : "review";

  return { readiness, blockers };
}
