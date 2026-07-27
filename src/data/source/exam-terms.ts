export type ExamTerm = {
  id: string;
  canonicalLabel: string;
  acceptedAliases: string[];
  displayLabel: string;
  conceptIds: string[];
};

/**
 * 교재·복원자료에서 표기가 달라도 같은 답으로 학습할 수 있도록 관리하는
 * 시험용어 기준표다. 화면과 요약은 displayLabel을 사용하고, 채점·검색은
 * canonicalLabel과 acceptedAliases를 함께 사용할 수 있다.
 */
export const EXAM_TERMS: ExamTerm[] = [
  {
    id: "gear-pitting",
    canonicalLabel: "피팅",
    acceptedAliases: ["피칭", "pitting"],
    displayLabel: "피팅(피칭)",
    conceptIds: ["PCON-018"],
  },
  {
    id: "gear-scoring",
    canonicalLabel: "스코어링",
    acceptedAliases: ["스코링", "scoring"],
    displayLabel: "스코어링(스코링)",
    conceptIds: ["PCON-018"],
  },
  {
    id: "vernier-main-scale",
    canonicalLabel: "주척",
    acceptedAliases: ["본척", "main scale"],
    displayLabel: "주척(본척)",
    conceptIds: ["PCON-014"],
  },
  {
    id: "autonomous-maintenance-final-step",
    canonicalLabel: "자주관리 철저",
    acceptedAliases: ["자율관리"],
    displayLabel: "자주관리 철저(자율관리)",
    conceptIds: ["PCON-020"],
  },
  {
    id: "tpm-loss-breakdown",
    canonicalLabel: "고장 로스",
    acceptedAliases: ["고장 손실"],
    displayLabel: "고장 로스",
    conceptIds: ["PCON-030"],
  },
  {
    id: "tpm-loss-setup-adjustment",
    canonicalLabel: "작업준비·조정 로스",
    acceptedAliases: ["준비·조정 로스", "작업준비 로스"],
    displayLabel: "작업준비·조정 로스",
    conceptIds: ["PCON-030"],
  },
  {
    id: "tpm-loss-idling-minor-stoppage",
    canonicalLabel: "일시정지·공운전 로스",
    acceptedAliases: ["공전·일시정지 로스", "일시정체 로스"],
    displayLabel: "일시정지·공운전 로스",
    conceptIds: ["PCON-030"],
  },
  {
    id: "tpm-loss-reduced-speed",
    canonicalLabel: "속도저하 로스",
    acceptedAliases: ["속도 저하 손실"],
    displayLabel: "속도저하 로스",
    conceptIds: ["PCON-030"],
  },
  {
    id: "tpm-loss-defect-rework",
    canonicalLabel: "공정불량·수정 로스",
    acceptedAliases: ["불량·수정 로스", "공정불량 로스"],
    displayLabel: "공정불량·수정 로스",
    conceptIds: ["PCON-030"],
  },
  {
    id: "tpm-loss-startup-yield",
    canonicalLabel: "초기수율 로스",
    acceptedAliases: ["초기 수율 손실"],
    displayLabel: "초기수율 로스",
    conceptIds: ["PCON-030"],
  },
];

export function getExamTerm(termId: string) {
  return EXAM_TERMS.find((term) => term.id === termId);
}

export function getExamTermDisplayLabel(termId: string, fallback: string) {
  return getExamTerm(termId)?.displayLabel ?? fallback;
}
