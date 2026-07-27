export type PracticalEquipmentModel = {
  id: string;
  label: string;
  manufacturer: string | null;
  model: string | null;
  category: "arc_welder" | "pneumatic_hydraulic_trainer" | "mixed";
  currentSourceStatus: "facility_sheet" | "manufacturer_verified" | "needs_manual_check";
  sourceUrl: string | null;
  learnerNote: string;
};

export const PRACTICAL_EQUIPMENT_MODELS: PracticalEquipmentModel[] = [
  {
    id: "national-nsa-250pa",
    label: "NSA-250PA",
    manufacturer: "내쇼날시스템(주)",
    model: "NSA-250PA",
    category: "arc_welder",
    currentSourceStatus: "manufacturer_verified",
    sourceUrl: "https://m.nswelding.com/product/%EC%9D%B8%EB%B2%84%ED%84%B0-dc-arc%EC%9A%A9%EC%A0%91%EA%B8%B0-nsa-250pa-set/1556/",
    learnerNote: "장비 명판에서 전원·극성·정격을 다시 확인합니다.",
  },
  {
    id: "protech-aca-300ap",
    label: "ACA-300AP",
    manufacturer: "(주)프로테크산업",
    model: "ACA-300AP",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시험장 시설표의 모델명입니다. 최신 사양은 현장 명판이 우선입니다.",
  },
  {
    id: "hanheung-haw-300",
    label: "HAW-300",
    manufacturer: "한흥전기",
    model: "HAW-300",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시험장 시설표의 모델명입니다. 조작부 위치를 현장에서 확인합니다.",
  },
  {
    id: "hanheung-haw-350",
    label: "HAW-350",
    manufacturer: "한흥전기",
    model: "HAW-350",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시험장 시설표의 모델명입니다. 조작부 위치를 현장에서 확인합니다.",
  },
  {
    id: "cnw-cw-wa300e",
    label: "CW-WA300E",
    manufacturer: "씨앤더블",
    model: "CW-WA300E",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시험장 시설표의 모델명입니다. 전류조절과 접지 위치를 현장에서 확인합니다.",
  },
  {
    id: "cnw-cw-3m",
    label: "CW-3M",
    manufacturer: "씨앤더블",
    model: "CW-3M",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시험장 시설표의 모델명입니다.",
  },
  {
    id: "cnw-cw-cat3m",
    label: "CW-CAT3M",
    manufacturer: "씨앤더블",
    model: "CW-CAT3M",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시험장 시설표의 모델명입니다.",
  },
  {
    id: "postech-weltop-300",
    label: "WELTOP 300A",
    manufacturer: "포스테크",
    model: "WELTOP 300A",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시설표에 웰탑·Weltop 표기가 혼재합니다. 현장 명판을 확인합니다.",
  },
  {
    id: "snet-fluid-power",
    label: "S-Net 공압·유압 실습장비",
    manufacturer: "S-Net",
    model: null,
    category: "pneumatic_hydraulic_trainer",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "포트번호·센서·PLC 단자표시는 장비별로 직접 대조합니다.",
  },
];

export const practicalEquipmentModelsById = new Map(
  PRACTICAL_EQUIPMENT_MODELS.map((item) => [item.id, item]),
);
