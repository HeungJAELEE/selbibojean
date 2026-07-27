import type { PracticalVisualCoverageItem } from "@/lib/domain/practical-types";

export const PRACTICAL_VISUAL_COVERAGE: PracticalVisualCoverageItem[] = [
  {
    id: "visual-coverage-bearing-identification",
    conceptIds: ["PCON-004"],
    examCardIds: ["PWEC-BEARING-IDENTIFICATION"],
    questionIds: ["P-2025-1-Q04", "P-2025-2-Q01-2", "EXP-B01"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["ncs-bearing-four-types"],
    status: "ready",
    rationale: "형상 식별이 정답을 결정하므로 실물 사진이 필수다.",
  },
  {
    id: "visual-coverage-bearing-heating",
    conceptIds: ["PCON-006"],
    examCardIds: ["PWEC-BEARING-INDUCTION-HEATING"],
    questionIds: ["P-2025-1-Q06", "EXP-B03", "EXP-D01"],
    sequenceStepIds: [
      "PWEC-BEARING-INDUCTION-HEATING-STEP-2",
      "PWEC-BEARING-INDUCTION-HEATING-STEP-3",
    ],
    visualRequirement: "V2",
    visualAidIds: ["ncs-bearing-heating"],
    status: "ready",
    rationale: "가열 상태와 조립 상태를 순서 단계에 직접 연결해야 한다.",
  },
  {
    id: "visual-coverage-gear-damage",
    conceptIds: ["PCON-018"],
    examCardIds: ["PWEC-GEAR-SURFACE-DAMAGE"],
    questionIds: ["P-2025-2-Q10", "EXP-G03", "EXP-D03"],
    sequenceStepIds: [],
    visualRequirement: "V2",
    visualAidIds: [],
    status: "held",
    rationale:
      "피팅·스폴링·스코링의 표면 차이를 확정할 외관 원본 또는 검증된 재도식이 없어 공개를 보류한다.",
  },
  {
    id: "visual-coverage-autonomous-maintenance",
    conceptIds: ["PCON-020"],
    examCardIds: ["PWEC-TPM-AUTONOMOUS-MAINTENANCE"],
    questionIds: ["P-2025-3-Q03"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["diagram-autonomous-maintenance-7-steps"],
    status: "ready",
    rationale: "7단계의 선후관계를 한 번에 복원하는 자체 흐름도가 유효하다.",
  },
  {
    id: "visual-coverage-oee-losses",
    conceptIds: ["PCON-030"],
    examCardIds: ["PWEC-OEE-CALCULATION"],
    questionIds: ["P-2026-1-Q05", "EXP-C03"],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["diagram-oee-six-losses"],
    status: "ready",
    rationale: "OEE 세 요소와 6대 로스의 대응관계를 시각적으로 구분한다.",
  },
  {
    id: "visual-coverage-vibration-hva",
    conceptIds: ["PCON-SUP-033"],
    examCardIds: [],
    questionIds: [],
    sequenceStepIds: [],
    visualRequirement: "V1",
    visualAidIds: ["diagram-vibration-hva-directions"],
    status: "ready",
    rationale: "축 기준 수평·수직·축방향은 방향도가 가장 짧은 설명이다.",
  },
];

export function visualAidIdsForSubjectSummary(subjectId: string) {
  if (subjectId === "subject-3") {
    return ["ncs-bearing-four-types", "ncs-bearing-heating"];
  }
  if (subjectId === "subject-4") {
    return [
      "diagram-autonomous-maintenance-7-steps",
      "diagram-oee-six-losses",
      "diagram-vibration-hva-directions",
    ];
  }
  return [];
}
