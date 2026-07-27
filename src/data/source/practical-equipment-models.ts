export type WeldingOutputCurrentType = "ac" | "dc" | "ac_dc" | "unknown";

export type EquipmentVerificationStatus =
  | "confirmed"
  | "probable"
  | "unknown";

export type EquipmentModelNormalizationStatus =
  | "exact"
  | "probable_alias"
  | "probable_transcription_error"
  | "unresolved";

export type PracticalWeldingEquipmentInfo = {
  rawModelName: string;
  normalizedModelName: string | null;
  normalizationStatus: EquipmentModelNormalizationStatus;
  outputCurrentType: WeldingOutputCurrentType;
  outputVerification: EquipmentVerificationStatus;
  verificationBasis: string;
  remainingCheck: string | null;
};

export type PracticalEquipmentModel = {
  id: string;
  label: string;
  manufacturer: string | null;
  model: string | null;
  category: "arc_welder" | "pneumatic_hydraulic_trainer" | "mixed";
  currentSourceStatus:
    | "facility_sheet"
    | "manufacturer_verified"
    | "technical_reference_verified"
    | "needs_manual_check";
  sourceUrl: string | null;
  learnerNote: string;
  welding: PracticalWeldingEquipmentInfo | null;
};

export const PRACTICAL_EQUIPMENT_MODELS: PracticalEquipmentModel[] = [
  {
    id: "national-nsa-250pa",
    label: "NSA-250PA",
    manufacturer: "내쇼날시스템(주)",
    model: "NSA-250PA",
    category: "arc_welder",
    currentSourceStatus: "manufacturer_verified",
    sourceUrl:
      "https://m.nswelding.com/product/%EC%9D%B8%EB%B2%84%ED%84%B0-dc-arc-%EC%95%84%ED%81%AC-%EC%A7%81%EB%A5%98-%EC%A0%84%EA%B8%B0-%EA%B3%A0%EA%B8%89-%EC%9A%A9%EC%A0%91%EA%B8%B0-nsa-250pa-set/1556/category/220/display/1/",
    learnerNote: "직류(DC) 아크용접기입니다. 현장 명판의 정격과 조작부를 다시 확인합니다.",
    welding: {
      rawModelName: "NSA-250PA",
      normalizedModelName: "NSA-250PA",
      normalizationStatus: "exact",
      outputCurrentType: "dc",
      outputVerification: "confirmed",
      verificationBasis: "제조사 제품명에서 인버터 DC ARC 직류 용접기로 확인",
      remainingCheck: null,
    },
  },
  {
    id: "koreana-mig-200pro",
    label: "Koreana MIG-200PRO",
    manufacturer: "Koreana",
    model: "MIG-200PRO",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시설표에 DC 용접기로 직접 기재되어 있습니다. 실제 시험 공정과 배정 장비는 입실 후 확인합니다.",
    welding: {
      rawModelName: "Koreana MIG-200PRO",
      normalizedModelName: "MIG-200PRO",
      normalizationStatus: "exact",
      outputCurrentType: "dc",
      outputVerification: "confirmed",
      verificationBasis: "공식 시설표에 DC용접기로 직접 표기",
      remainingCheck: "실제 보수용접 과제에서 사용하는 SMAW 장비인지 현장 확인",
    },
  },
  {
    id: "protech-aca-300ap",
    label: "ACA-300AP",
    manufacturer: "(주)프로테크산업",
    model: "ACA-300AP",
    category: "arc_welder",
    currentSourceStatus: "technical_reference_verified",
    sourceUrl: null,
    learnerNote: "교류(AC) 아크용접기로 확인됐습니다. 시설표 제조사명과 장비 명판을 함께 확인합니다.",
    welding: {
      rawModelName: "ACA-300AP",
      normalizedModelName: "ACA-300AP",
      normalizationStatus: "exact",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "제조사 제품군·제품정보와 시설표의 교류 장비 표기를 대조",
      remainingCheck: "시설표의 제조사명 재확인",
    },
  },
  {
    id: "hanheung-haw-300",
    label: "HAW-300",
    manufacturer: "한흥전기",
    model: "HAW-300",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시설표에서 교류(AC) 아크용접기로 확인됩니다. 조작부 위치는 현장에서 확인합니다.",
    welding: {
      rawModelName: "HAW-300",
      normalizedModelName: "HAW-300",
      normalizationStatus: "exact",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "공식 시설표의 교류아크용접기 표기와 동일 모델을 대조",
      remainingCheck: null,
    },
  },
  {
    id: "hanheung-haw-350",
    label: "HAW-350",
    manufacturer: "한흥전기",
    model: "HAW-350",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시설표에서 교류(AC) 아크용접기로 확인됩니다. 조작부 위치는 현장에서 확인합니다.",
    welding: {
      rawModelName: "HAW-350",
      normalizedModelName: "HAW-350",
      normalizationStatus: "exact",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "공식 시설표에 교류아크용접기로 직접 표기",
      remainingCheck: null,
    },
  },
  {
    id: "cnw-cw-wa300e",
    label: "CW-WA300E",
    manufacturer: "씨앤더블",
    model: "CW-WA300E",
    category: "arc_welder",
    currentSourceStatus: "technical_reference_verified",
    sourceUrl: null,
    learnerNote: "교류(AC) 220V·24kVA·12kW 장비로 확인됐습니다. 전류조절과 접지 위치는 현장에서 확인합니다.",
    welding: {
      rawModelName: "CW-WA300E",
      normalizedModelName: "CW-WA300E",
      normalizationStatus: "exact",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "기술자료에서 교류 용접기, AC 220V, 24kVA, 12kW로 확인",
      remainingCheck: null,
    },
  },
  {
    id: "cnw-cw-3m",
    label: "CW-3M",
    manufacturer: "씨앤더블",
    model: "CW-3M",
    category: "mixed",
    currentSourceStatus: "needs_manual_check",
    sourceUrl: null,
    learnerNote: "CW-CTA3M의 축약 표기일 가능성이 높으며, 아크 기능은 교류(AC) 유력입니다.",
    welding: {
      rawModelName: "CW-3M",
      normalizedModelName: "CW-CTA3M",
      normalizationStatus: "probable_alias",
      outputCurrentType: "ac",
      outputVerification: "probable",
      verificationBasis: "하이브리드 3M 용접기 CW-CTA3M의 AC ARC 300A 사양과 대조",
      remainingCheck: "시험장 명판에서 CW-CTA3M 전체 모델명 확인",
    },
  },
  {
    id: "cnw-cw-cat3m",
    label: "CW-CAT3M",
    manufacturer: "씨앤더블",
    model: "CW-CAT3M",
    category: "mixed",
    currentSourceStatus: "technical_reference_verified",
    sourceUrl: null,
    learnerNote: "시설표의 A·T 위치가 바뀐 오기로 보고 CW-CTA3M으로 정규화했습니다. 아크 기능은 교류(AC)입니다.",
    welding: {
      rawModelName: "CW-CAT3M",
      normalizedModelName: "CW-CTA3M",
      normalizationStatus: "probable_transcription_error",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "공식 모델 CW-CTA3M의 아크 기능 AC ARC 300A 사양과 대조",
      remainingCheck: "원본 표기는 보존하고 시험장 명판에서 전체 모델명 확인",
    },
  },
  {
    id: "postech-weltop-acdc300a",
    label: "Postech 웰탑300A",
    manufacturer: "포스테크",
    model: "WELTOP 300A",
    category: "arc_welder",
    currentSourceStatus: "manufacturer_verified",
    sourceUrl:
      "https://pos-tech.com/product/%EA%B5%90%EB%A5%98-%EC%A7%81%EB%A5%98-%EC%95%84%ED%81%AC-%EC%9A%A9%EC%A0%91%EA%B8%B0-weltop-acdc300a/98/",
    learnerNote: "WELTOP-ACDC300A와 일치할 가능성이 높아 교류·직류 겸용으로 분류했지만 명판 suffix 확인이 필요합니다.",
    welding: {
      rawModelName: "Postech 웰탑300A",
      normalizedModelName: "WELTOP-ACDC300A",
      normalizationStatus: "probable_alias",
      outputCurrentType: "ac_dc",
      outputVerification: "probable",
      verificationBasis: "포스테크 WELTOP-ACDC300A 공식 사양에서 AC 300A·DC 300A 확인",
      remainingCheck: "시험장 명판에서 ACDC suffix 확인",
    },
  },
  {
    id: "postech-ac300a",
    label: "WELTOP AC ARC 300A",
    manufacturer: "포스테크",
    model: "AC300A",
    category: "arc_welder",
    currentSourceStatus: "manufacturer_verified",
    sourceUrl:
      "https://pos-tech.com/product/%EA%B5%90%EB%A5%98-%EC%95%84%ED%81%AC-%EC%9A%A9%EC%A0%91%EA%B8%B0%ED%9A%8C%EC%A0%84%EA%B3%84%EA%B8%B0%EB%94%94%EC%A7%80%ED%84%B8%EC%A0%84%EB%A5%98%ED%91%9C%EC%8B%9C-ac300a/102/",
    learnerNote: "교류(AC) 전용 300A 장비로 확인됐습니다.",
    welding: {
      rawModelName: "WELTOP AC ARC 300A",
      normalizedModelName: "AC300A",
      normalizationStatus: "exact",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "시설표 AC ARC 표기와 포스테크 AC300A 공식 제품군을 대조",
      remainingCheck: null,
    },
  },
  {
    id: "postech-ac-arc-unspecified",
    label: "포스테크 교류용접기",
    manufacturer: "포스테크",
    model: null,
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시설표 사용범위가 교류(AC)로 명시됐으며 정확한 모델명은 기재되지 않았습니다.",
    welding: {
      rawModelName: "포스테크 교류용접기",
      normalizedModelName: null,
      normalizationStatus: "unresolved",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "공식 시설표 사용범위에 교류(AC) 직접 표기",
      remainingCheck: "시험장 명판에서 정확한 모델명 확인",
    },
  },
  {
    id: "generic-ac-arc-300a",
    label: "AC ARC 300A",
    manufacturer: null,
    model: "AC ARC 300A",
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시설표에 교류(AC) 아크 300A 장비로 직접 기재돼 있습니다.",
    welding: {
      rawModelName: "AC ARC 300A",
      normalizedModelName: "AC ARC 300A",
      normalizationStatus: "exact",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "공식 시설표에 AC ARC 300A 직접 표기",
      remainingCheck: "제조사와 정확한 모델명 확인",
    },
  },
  {
    id: "cnw-ac-arc-unspecified",
    label: "C&W 교류아크",
    manufacturer: "씨앤더블",
    model: null,
    category: "arc_welder",
    currentSourceStatus: "facility_sheet",
    sourceUrl: null,
    learnerNote: "시설표에 C&W 교류아크 장비로 직접 기재돼 있습니다.",
    welding: {
      rawModelName: "C&W 교류아크",
      normalizedModelName: null,
      normalizationStatus: "unresolved",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "공식 시설표에 교류아크 직접 표기",
      remainingCheck: "시험장 명판에서 정확한 모델명 확인",
    },
  },
  {
    id: "lk-30kva-15kw",
    label: "LK 30kVA·15kW",
    manufacturer: "LK",
    model: null,
    category: "arc_welder",
    currentSourceStatus: "needs_manual_check",
    sourceUrl: null,
    learnerNote: "AC 변압기형 규격과 일치하지만 LK에는 직류 인버터 제품도 있어 교류 유력으로만 표시합니다.",
    welding: {
      rawModelName: "LK 30kVA 15kW",
      normalizedModelName: null,
      normalizationStatus: "unresolved",
      outputCurrentType: "ac",
      outputVerification: "probable",
      verificationBasis: "30kVA·15kW 규격이 AC 변압기형 교류아크용접기와 일치",
      remainingCheck: "정확한 모델명과 전면 명판 확인",
    },
  },
  {
    id: "daedae-20kva-12kw",
    label: "대대 20kVA·12kW",
    manufacturer: "대대",
    model: null,
    category: "arc_welder",
    currentSourceStatus: "technical_reference_verified",
    sourceUrl: null,
    learnerNote: "대대 교류아크 제품군과 대조해 교류(AC)로 분류했습니다. 세부 용량 표기는 재확인이 필요합니다.",
    welding: {
      rawModelName: "Daedae 20kVA 12kW",
      normalizedModelName: null,
      normalizationStatus: "unresolved",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
      verificationBasis: "대대 제품군의 교류 전기용접기·AC 아크용접기 유통자료와 대조",
      remainingCheck: "시설표의 20kVA·12kW 조합 재확인",
    },
  },
  {
    id: "kumho-20kva-10kw",
    label: "금호전기 20kVA·10kW",
    manufacturer: "금호전기",
    model: null,
    category: "arc_welder",
    currentSourceStatus: "needs_manual_check",
    sourceUrl: null,
    learnerNote: "AC 변압기형 규격과 일치하지만 브랜드에 다른 공정 장비도 있어 교류 유력으로만 표시합니다.",
    welding: {
      rawModelName: "Kumho 20kVA 10kW",
      normalizedModelName: null,
      normalizationStatus: "unresolved",
      outputCurrentType: "ac",
      outputVerification: "probable",
      verificationBasis: "20kVA·10kW 규격이 AC 변압기형 교류아크용접기와 일치",
      remainingCheck: "정확한 모델명 또는 전면 명판 확인",
    },
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
    welding: null,
  },
];

export const practicalEquipmentModelsById = new Map(
  PRACTICAL_EQUIPMENT_MODELS.map((item) => [item.id, item]),
);
