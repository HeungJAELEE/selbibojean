export type PracticalCandidateSupply = {
  id: string;
  number: number;
  label: string;
  specification: string;
  unit: string;
  quantity: number;
  purpose: string;
  commerceUrl: string | null;
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
    commerceUrl: null,
  },
  {
    id: "scriber",
    number: 2,
    label: "금긋기바늘",
    specification: "150 mm",
    unit: "EA",
    quantity: 1,
    purpose: "마킹용",
    commerceUrl: null,
  },
  {
    id: "magnetic-base",
    number: 3,
    label: "마그네틱 베이스",
    specification: "제품 고정용",
    unit: "EA",
    quantity: 1,
    purpose: "모재 고정용",
    commerceUrl: null,
  },
  {
    id: "safety-glasses",
    number: 4,
    label: "보안경",
    specification: "기계가공용",
    unit: "EA",
    quantity: 1,
    purpose: "비산물로부터 눈 보호",
    commerceUrl: null,
  },
  {
    id: "soapstone",
    number: 5,
    label: "석필",
    specification: "보통",
    unit: "EA",
    quantity: 1,
    purpose: "마킹용",
    commerceUrl: null,
  },
  {
    id: "center-punch",
    number: 6,
    label: "센터펀치",
    specification: "100 mm",
    unit: "EA",
    quantity: 1,
    purpose: "구멍 위치 표시",
    commerceUrl: null,
  },
  {
    id: "welding-ppe",
    number: 7,
    label: "용접용 보호기구 일체",
    specification: "산업용 용접면·용접앞치마·용접장갑",
    unit: "조",
    quantity: 1,
    purpose: "용접 작업 보호",
    commerceUrl: null,
  },
  {
    id: "files",
    number: 8,
    label: "줄",
    specification: "세목·중목·황목 각 1개",
    unit: "조",
    quantity: 1,
    purpose: "모서리·표면 다듬기",
    commerceUrl: null,
  },
  {
    id: "square",
    number: 9,
    label: "직각자",
    specification: "200 × 300 mm",
    unit: "EA",
    quantity: 1,
    purpose: "직각·치수 확인",
    commerceUrl: null,
  },
];
