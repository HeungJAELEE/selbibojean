export type PracticalFaqCategory =
  | "supplies"
  | "training"
  | "test_center"
  | "study"
  | "source_verification";

export type PracticalFaqPlacement =
  | "prep_supplies"
  | "prep_training"
  | "centers_equipment"
  | "centers_reports"
  | "prep_source_check";

export type PracticalFaqEvidenceLevel =
  | "official_guidance"
  | "editorial_safety"
  | "user_report_boundary";

export type PracticalFaq = {
  id: string;
  question: string;
  shortAnswer: string;
  details: string[];
  category: PracticalFaqCategory;
  placement: PracticalFaqPlacement;
  relatedTab: "prep" | "centers";
  evidenceLevel: PracticalFaqEvidenceLevel;
  sourceResourceIds: string[];
};

/**
 * 카카오톡 Q&A에서 반복된 질문의 주제만 추려 작성한 공개용 FAQ다.
 *
 * 대화 참여자의 신원·원문·답안 주장은 싣지 않는다. 공식 자료로 확인할 수
 * 없는 시험장 제보와 복원 문제는 확인 방법과 공개 경계만 안내한다.
 */
export const PRACTICAL_FAQS: PracticalFaq[] = [
  {
    id: "faq-practical-supplies-source",
    question: "실기 준비물은 무엇을 기준으로 챙겨야 하나요?",
    shortAnswer:
      "Q-Net의 최신 공개문제와 수험자 지참준비물 안내를 가장 먼저 확인하세요.",
    details: [
      "사이트의 공식 준비물 목록과 실제 수험표·시험 공고가 다르면 최신 공식 안내를 우선합니다.",
      "용접해머·용접 브러쉬·플라이어 같은 추가 공구는 시험장 제공 여부를 확인한 뒤, 미제공일 때만 준비하거나 구매하세요.",
    ],
    category: "supplies",
    placement: "prep_supplies",
    relatedTab: "prep",
    evidenceLevel: "official_guidance",
    sourceResourceIds: ["qnet-public-practical-problems"],
  },
  {
    id: "faq-test-center-supplies",
    question: "시험장마다 제공하는 공구와 보호구가 모두 같나요?",
    shortAnswer:
      "같다고 단정할 수 없습니다. 회차와 시험장에 따라 달라질 수 있으니 개별 확인이 필요합니다.",
    details: [
      "사이트의 시험장별 준비물 메모는 공식 공고가 아닌 사용자 제보로 분리해 표시합니다.",
      "최종 준비 전 수험표·최신 공고를 확인하고, 필요한 경우 시험장에 직접 문의하세요.",
    ],
    category: "test_center",
    placement: "centers_reports",
    relatedTab: "centers",
    evidenceLevel: "user_report_boundary",
    sourceResourceIds: ["qnet-public-practical-problems"],
  },
  {
    id: "faq-test-center-equipment",
    question: "연습하던 장비와 실제 시험장 장비가 같은가요?",
    shortAnswer:
      "동일 모델이라고 보장할 수 없습니다. 시험장 시설표와 현장 명판을 기준으로 확인하세요.",
    details: [
      "V-AMT를 포함한 연습 환경의 조작 방식이 실제 배정 장비와 다를 수 있습니다.",
      "공압·유압·용접 장비 정보는 공식 시설표와 사용자 제보를 구분해 읽고, 확인되지 않은 모델명은 추정하지 마세요.",
    ],
    category: "test_center",
    placement: "centers_equipment",
    relatedTab: "centers",
    evidenceLevel: "user_report_boundary",
    sourceResourceIds: [],
  },
  {
    id: "faq-regional-training-search",
    question: "실기 교육은 어디서 찾을 수 있나요?",
    shortAnswer:
      "이 지역에 이런 교육 경로가 있으니 참고해보세요. 실제 모집 여부·대상·일정은 기관 공식 페이지에서 확인하세요.",
    details: [
      "한국폴리텍대학 꿈드림공작소에서는 캠퍼스와 주제로 지역별 프로그램을 검색할 수 있습니다.",
      "재직자 과정은 기업 협약, 고용보험, 선발 대상 같은 별도 조건이 있을 수 있습니다.",
    ],
    category: "training",
    placement: "prep_training",
    relatedTab: "prep",
    evidenceLevel: "official_guidance",
    sourceResourceIds: [
      "kopo-dream-workshop",
      "kopo-jungsu-incumbent-training",
      "jeonbuk-korcham-welding-practice-2026",
    ],
  },
  {
    id: "faq-ended-training-link",
    question: "지역 교육 링크가 마감되거나 종료되면 어떻게 하나요?",
    shortAnswer:
      "종료된 회차는 현재 경로와 분리해 과거 교육장소·종료 과정 기록으로 보존합니다. 새 일정은 기관 공식 목록에서 확인하세요.",
    details: [
      "운영 날짜·장소와 공식 페이지가 확인된 과정만 과거 기록으로 남기며, 현재 모집 중이라는 뜻은 아닙니다.",
      "기간 한정 과정은 종료 후 현재 교육 참고 경로에서 빠지고 과거 기록으로 이동합니다.",
    ],
    category: "training",
    placement: "prep_training",
    relatedTab: "prep",
    evidenceLevel: "official_guidance",
    sourceResourceIds: [
      "kopo-dream-workshop",
      "asan-kopo-seolbi-welding-2026-history",
    ],
  },
  {
    id: "faq-welding-practice-duration",
    question: "용접을 처음 배우면 며칠 연습해야 충분한가요?",
    shortAnswer:
      "개인차가 커서 특정 기간으로 합격을 보장할 수 없습니다. 안전교육과 실제 장비 연습 시간을 먼저 확보하세요.",
    details: [
      "단체 대화방의 연습 기간과 합격 경험은 개인 사례이므로 일반 기준으로 사용하지 않습니다.",
      "보호구 착용, 아크 발생, 자세 유지, 비드 상태 확인을 지도 가능한 환경에서 반복하세요.",
    ],
    category: "study",
    placement: "prep_training",
    relatedTab: "prep",
    evidenceLevel: "editorial_safety",
    sourceResourceIds: ["kopo-dream-workshop"],
  },
  {
    id: "faq-chat-ai-answer-trust",
    question: "단체 대화방 복원 문제나 AI 답변을 그대로 외워도 되나요?",
    shortAnswer:
      "아니요. 공식·NCS·제조사 자료로 답과 조건을 검증하기 전에는 HOLD 자료로 취급해야 합니다.",
    details: [
      "같은 질문에도 답이 엇갈리거나 사진·도면이 빠져 전혀 다른 문제가 되는 사례가 있습니다.",
      "공개 문제, 공식 출제기준, NCS 학습모듈처럼 추적 가능한 근거와 대조한 뒤 학습 자료로 사용하세요.",
    ],
    category: "source_verification",
    placement: "prep_source_check",
    relatedTab: "prep",
    evidenceLevel: "editorial_safety",
    sourceResourceIds: ["qnet-public-practical-problems"],
  },
  {
    id: "faq-missing-chat-attachments",
    question: "대화에 ‘사진’이나 ‘파일’ 표시만 남은 문제도 복원할 수 있나요?",
    shortAnswer:
      "표시만으로는 복원할 수 없습니다. 실제 첨부 원본과 사용 권한, 문제·답 연결 근거가 필요합니다.",
    details: [
      "그림의 치수·기호·장비 상태가 없으면 문항 조건과 정답을 확정할 수 없습니다.",
      "원본이 확보되기 전에는 문제 수에 포함하거나 유사 이미지를 임의로 붙여 공개하지 않습니다.",
    ],
    category: "source_verification",
    placement: "prep_source_check",
    relatedTab: "prep",
    evidenceLevel: "editorial_safety",
    sourceResourceIds: [],
  },
  {
    id: "faq-test-center-reports",
    question: "시험장 후기는 어떻게 읽어야 하나요?",
    shortAnswer:
      "후기는 해당 날짜·회차의 사용자 경험입니다. 다른 회차나 시험장 전체의 공식 운영 기준으로 일반화하지 마세요.",
    details: [
      "사이트에서는 공식 시설표, 과거 시험 이력, 사용자 제보를 서로 다른 근거 등급으로 표시합니다.",
      "장비·주차·제공품 정보는 변경될 수 있으므로 최신 공고와 현장 안내를 우선하세요.",
    ],
    category: "test_center",
    placement: "centers_reports",
    relatedTab: "centers",
    evidenceLevel: "user_report_boundary",
    sourceResourceIds: [],
  },
];

export function getPracticalFaqsForTab(tab: PracticalFaq["relatedTab"]) {
  return PRACTICAL_FAQS.filter((faq) => faq.relatedTab === tab);
}
