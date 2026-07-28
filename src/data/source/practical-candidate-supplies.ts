export type PracticalCandidateSupply = {
  id: string;
  number: number;
  label: string;
  specification: string;
  unit: string;
  quantity: number;
  purpose: string;
};

export type PracticalSupplyRecommendation = {
  id: string;
  supplyId: PracticalCandidateSupply["id"];
  label: string;
  linkLabel: string;
  status: "safety_required" | "conditional" | "optional" | "personal_pick";
  statusLabel: string;
  note: string;
  commerceUrl: string;
};

export type PracticalWeldingToolRecommendation = Omit<
  PracticalSupplyRecommendation,
  "supplyId" | "status"
> & {
  status: "conditional";
};

/**
 * Q-Net 설비보전기사 수험자 지참준비물 표의 공식 등록 항목만 수록한다.
 * 회차별 변경 가능성이 있으므로 화면에서 공식 원문 링크와 기준 회차를 함께 표시한다.
 */
export const PRACTICAL_CANDIDATE_SUPPLIES: PracticalCandidateSupply[] = [
  {
    id: "steel-ruler",
    number: 1,
    label: "강철자",
    specification: "300 mm",
    unit: "EA",
    quantity: 1,
    purpose: "치수 확인",
  },
  {
    id: "scriber",
    number: 2,
    label: "금긋기바늘",
    specification: "150 mm",
    unit: "EA",
    quantity: 1,
    purpose: "마킹용",
  },
  {
    id: "magnetic-base",
    number: 3,
    label: "마그네틱 베이스",
    specification: "제품 고정용",
    unit: "EA",
    quantity: 1,
    purpose: "모재 고정용",
  },
  {
    id: "safety-glasses",
    number: 4,
    label: "보안경",
    specification: "기계가공용",
    unit: "EA",
    quantity: 1,
    purpose: "비산물로부터 눈 보호",
  },
  {
    id: "soapstone",
    number: 5,
    label: "석필",
    specification: "보통",
    unit: "EA",
    quantity: 1,
    purpose: "마킹용",
  },
  {
    id: "center-punch",
    number: 6,
    label: "센터펀치",
    specification: "100 mm",
    unit: "EA",
    quantity: 1,
    purpose: "구멍 위치 표시",
  },
  {
    id: "welding-ppe",
    number: 7,
    label: "용접용 보호기구 일체",
    specification: "산업용 용접면·용접앞치마·용접장갑",
    unit: "조",
    quantity: 1,
    purpose: "용접 작업 보호",
  },
  {
    id: "files",
    number: 8,
    label: "줄",
    specification: "세목·중목·황목 각 1개",
    unit: "조",
    quantity: 1,
    purpose: "모서리·표면 다듬기",
  },
  {
    id: "square",
    number: 9,
    label: "직각자",
    specification: "200 × 300 mm",
    unit: "EA",
    quantity: 1,
    purpose: "직각·치수 확인",
  },
];

/**
 * 사용자가 제공한 구매 참고 링크다.
 * 공식 지참물 여부와 구매 권고를 혼동하지 않도록 공식 항목에 참고 링크로 연결한다.
 */
export const PRACTICAL_SUPPLY_RECOMMENDATIONS: PracticalSupplyRecommendation[] =
  [
    {
      id: "welding-gloves",
      supplyId: "welding-ppe",
      label: "용접 장갑",
      linkLabel: "보호구(용접장갑)",
      status: "safety_required",
      statusLabel: "안전 필수",
      note: "용접용 보호기구의 기본 구성입니다.",
      commerceUrl: "https://link.coupang.com/a/fIuXBYAQzA",
    },
    {
      id: "welding-apron",
      supplyId: "welding-ppe",
      label: "용접 앞치마",
      linkLabel: "보호구(용접앞치마)",
      status: "safety_required",
      statusLabel: "안전 필수",
      note: "불티와 고온 비산물로부터 몸통을 보호합니다.",
      commerceUrl: "https://link.coupang.com/a/fIuUvNZ2I0",
    },
    {
      id: "welding-leggings",
      supplyId: "welding-ppe",
      label: "용접 각반",
      linkLabel: "보호구(용접각반)",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비 여부와 작업복·안전화의 보호 범위를 먼저 확인합니다.",
      commerceUrl: "https://link.coupang.com/a/fIu1cOGBzg",
    },
    {
      id: "welding-sleeves",
      supplyId: "welding-ppe",
      label: "용접 토시",
      linkLabel: "보호구(용접토시)",
      status: "conditional",
      statusLabel: "조건부 필수",
      note: "반팔을 피하고 얇은 긴팔을 권장합니다. 반팔로 응시한다면 반드시 준비합니다.",
      commerceUrl: "https://link.coupang.com/a/fIu3oG52GW",
    },
    {
      id: "auto-darkening-helmet",
      supplyId: "welding-ppe",
      label: "자동 용접면",
      linkLabel: "보호구(자동용접면)",
      status: "personal_pick",
      statusLabel: "개인 추천",
      note: "최저가 기준이 아니라 사용 편의성과 시야를 고려한 개인 추천 제품입니다.",
      commerceUrl: "https://link.coupang.com/a/fIvk3ZN6uO",
    },
    {
      id: "safety-shoes",
      supplyId: "welding-ppe",
      label: "안전화",
      linkLabel: "보호구(안전화)",
      status: "safety_required",
      statusLabel: "안전 필수",
      note: "용접·기계 작업 중 발을 보호하기 위한 안전화 구매 참고 제품입니다.",
      commerceUrl: "https://link.coupang.com/a/fKgVdg1sxo",
    },
    {
      id: "safety-glasses",
      supplyId: "safety-glasses",
      label: "보안경",
      linkLabel: "보안경",
      status: "safety_required",
      statusLabel: "안전 필수",
      note: "시험 통과에 필요한 기본 수준의 기계가공용 보안경 예시입니다.",
      commerceUrl: "https://link.coupang.com/a/fIvrTWbaO4",
    },
    {
      id: "steel-ruler",
      supplyId: "steel-ruler",
      label: "강철자",
      linkLabel: "강철자",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비 여부를 확인한 뒤 필요할 때 준비합니다.",
      commerceUrl: "https://link.coupang.com/a/fIvx9Oe1zE",
    },
    {
      id: "scriber",
      supplyId: "scriber",
      label: "금긋기 바늘",
      linkLabel: "금긋기 바늘",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비 여부를 확인한 뒤 필요할 때 준비합니다.",
      commerceUrl: "https://link.coupang.com/a/fIvAgY8vro",
    },
    {
      id: "welding-angle-magnet",
      supplyId: "magnetic-base",
      label: "용접 각도 마그네트",
      linkLabel: "용접 각도 마그네트",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비와 반입 허용 여부를 확인합니다. 자가 제작·용접 지그는 사용할 수 없습니다.",
      commerceUrl: "https://link.coupang.com/a/fIvFs2R3HE",
    },
    {
      id: "soapstone",
      supplyId: "soapstone",
      label: "석필",
      linkLabel: "석필",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비 여부를 확인한 뒤 필요할 때 준비합니다.",
      commerceUrl: "https://link.coupang.com/a/fIvJAnNsPY",
    },
    {
      id: "center-punch",
      supplyId: "center-punch",
      label: "센터 펀치",
      linkLabel: "센터 펀치",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비 여부를 확인한 뒤 필요할 때 준비합니다.",
      commerceUrl: "https://link.coupang.com/a/fIvK8KI01Q",
    },
    {
      id: "files",
      supplyId: "files",
      label: "줄",
      linkLabel: "줄",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비 규격을 확인한 뒤 필요할 때 준비합니다.",
      commerceUrl: "https://link.coupang.com/a/fIvNCgOUj6",
    },
    {
      id: "square",
      supplyId: "square",
      label: "직각자",
      linkLabel: "직각자",
      status: "optional",
      statusLabel: "선택사항",
      note: "시험장 구비 여부를 확인한 뒤 필요할 때 준비합니다.",
      commerceUrl: "https://link.coupang.com/a/fIvR3WnqKq",
    },
  ];

/**
 * Q-Net 공식 지참준비물 9종과 분리해 표시하는 사용자 제공 구매 참고 링크다.
 * 시험장 제공 여부를 먼저 확인하고, 미제공일 때만 준비·구매하도록 안내한다.
 */
export const PRACTICAL_WELDING_TOOL_RECOMMENDATIONS: PracticalWeldingToolRecommendation[] =
  [
    {
      id: "welding-chipping-hammer",
      label: "용접해머",
      linkLabel: "용접해머",
      status: "conditional",
      statusLabel: "미제공 시 준비",
      note: "시험장 제공 여부 확인 후 미제공 시 준비/구매",
      commerceUrl: "https://link.coupang.com/a/fJo7m3EVRA",
    },
    {
      id: "welding-wire-brush",
      label: "용접 브러쉬",
      linkLabel: "용접 브러쉬",
      status: "conditional",
      statusLabel: "미제공 시 준비",
      note: "시험장 제공 여부 확인 후 미제공 시 준비/구매",
      commerceUrl: "https://link.coupang.com/a/fJphjpvNLg",
    },
    {
      id: "pliers",
      label: "플라이어",
      linkLabel: "플라이어",
      status: "conditional",
      statusLabel: "미제공 시 준비",
      note: "시험장 제공 여부 확인 후 미제공 시 준비/구매",
      commerceUrl: "https://link.coupang.com/a/fJppaQcwGy",
    },
  ];
