export type PracticalCandidateSupply = {
  id: string;
  label: string;
  category: "official_check_required" | "recommended_practice" | "ppe";
  status: "held_until_round_notice" | "recommended";
  note: string;
};

/**
 * 회차별 수험자 지참준비물은 Q-Net 수험자 안내가 최종 기준이다.
 * 현재 확보한 시설현황 XLSX는 시험장 장비 자료이며 지참물 공식표가 아니므로,
 * 공식 지참물로 단정하지 않고 연습·안전 준비 항목만 분리한다.
 */
export const PRACTICAL_CANDIDATE_SUPPLIES: PracticalCandidateSupply[] = [
  {
    id: "official-round-notice",
    label: "해당 회차 Q-Net 수험자 지참준비물 표",
    category: "official_check_required",
    status: "held_until_round_notice",
    note: "접수 회차의 품목·규격·수량·반입 제한을 직접 확인해야 합니다.",
  },
  {
    id: "identity-and-writing",
    label: "신분확인 수단·허용 필기구",
    category: "official_check_required",
    status: "held_until_round_notice",
    note: "세부 허용 범위는 해당 회차 수험자 안내가 우선입니다.",
  },
  {
    id: "safety-glasses",
    label: "보안경·안면보호구",
    category: "ppe",
    status: "recommended",
    note: "비산·연삭·용접 작업 연습에 맞는 보호구를 사용합니다.",
  },
  {
    id: "work-gloves",
    label: "작업에 맞는 보호장갑",
    category: "ppe",
    status: "recommended",
    note: "회전체 근접작업 등 장갑 사용이 오히려 위험한 경우는 작업기준을 따릅니다.",
  },
  {
    id: "circuit-check-sheet",
    label: "회로도·포트 연결표 연습지",
    category: "recommended_practice",
    status: "recommended",
    note: "시험장 반입 허용을 뜻하지 않으며 학습용 체크자료입니다.",
  },
  {
    id: "measurement-record",
    label: "측정·조정·재시험 기록 연습지",
    category: "recommended_practice",
    status: "recommended",
    note: "측정값과 조치 전후 상태를 기록하는 습관을 연습합니다.",
  },
];
