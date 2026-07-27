import type {
  PracticalVisualAid,
  PracticalVisualUsage,
} from "@/lib/domain/practical-types";

const PAST_PROMPT_ORIGINS = new Set(["ncs_original", "ncs_crop"]);
const VARIANT_PROMPT_ORIGINS = new Set(["ncs_redraw", "self_authored"]);

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
      visualAid.examMatchStatus === "exact_source" &&
      PAST_PROMPT_ORIGINS.has(visualAid.originType)
    );
  }

  if (usage === "variant_exam_prompt") {
    return VARIANT_PROMPT_ORIGINS.has(visualAid.originType);
  }

  return visualAid.originType !== "ai_generated";
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
