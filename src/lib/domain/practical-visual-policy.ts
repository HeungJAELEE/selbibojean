import type {
  PracticalVisualAid,
  PracticalVisualUsage,
} from "@/lib/domain/practical-types";

const PAST_PROMPT_ORIGINS = new Set([
  "ncs_original",
  "ncs_crop",
  "official_external",
]);
const VARIANT_PROMPT_ORIGINS = new Set([
  "ncs_original",
  "ncs_crop",
  "ncs_redraw",
  "self_authored",
]);

export function canUsePracticalVisualAid(
  visualAid: PracticalVisualAid,
  usage: PracticalVisualUsage,
) {
  if (
    visualAid.publicUseStatus !== "public" ||
    visualAid.technicalReviewStatus !== "verified" ||
    !visualAid.usageTypes.includes(usage)
  ) {
    return false;
  }

  if (usage === "past_exam_prompt") {
    return (
      (visualAid.examMatchStatus === "exact_source" ||
        visualAid.examMatchStatus === "licensed_equivalent") &&
      PAST_PROMPT_ORIGINS.has(visualAid.originType)
    );
  }

  if (usage === "variant_exam_prompt") {
    return VARIANT_PROMPT_ORIGINS.has(visualAid.originType);
  }

  return visualAid.originType !== "ai_generated";
}

/**
 * 원시험 원본으로 오인시키지 않는 자체 복원 도식의 최소 자산 조건이다.
 * 실제 기출 프롬프트 허용 여부는 questionId-visualAidId coverage 매핑을
 * 별도로 통과해야 한다.
 */
export function isSafeReconstructedNonOriginalVisualAid(
  visualAid: PracticalVisualAid,
) {
  return (
    visualAid.publicUseStatus === "public" &&
    visualAid.technicalReviewStatus === "verified" &&
    visualAid.originType === "self_authored" &&
    visualAid.examMatchStatus === "self_authored" &&
    visualAid.rightsStatus === "self_authored"
  );
}

export function learnerVisiblePracticalVisualAid(
  visualAid: PracticalVisualAid,
) {
  return (
    visualAid.publicUseStatus === "public" &&
    visualAid.technicalReviewStatus === "verified" &&
    visualAid.originType !== "ai_generated"
  );
}
