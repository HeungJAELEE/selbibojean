import { WELDING_CBT_INDEPENDENT_PUBLICATION_IDS } from "@/data/source/welding-cbt-independent-review-decisions";

const INDEPENDENTLY_ACCEPTED_WELDING_CBT_IDS = new Set(
  WELDING_CBT_INDEPENDENT_PUBLICATION_IDS,
);

/**
 * 원문·답안 검수의 approve와 공개 승인을 분리한다.
 *
 * 계산 또는 공식 안전 근거, 직접 풀이, 네 보기별 근거, 비자기참조 이론
 * 연결을 두 번째 검토자가 모두 확인한 문항만 런타임에 병합한다.
 */
export function isIndependentlyAcceptedWeldingCbtQuestion(
  canonicalId: string,
) {
  return INDEPENDENTLY_ACCEPTED_WELDING_CBT_IDS.has(canonicalId);
}

export const INDEPENDENTLY_ACCEPTED_WELDING_CBT_QUESTION_COUNT =
  INDEPENDENTLY_ACCEPTED_WELDING_CBT_IDS.size;
