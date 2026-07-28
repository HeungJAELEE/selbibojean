import {
  practicalEquipmentModelsById,
  type PracticalWeldingEquipmentInfo,
} from "./practical-equipment-models";

export type PracticalTestCenter = {
  id: string;
  officialNumber?: number;
  region: string;
  name: string;
  buildingNote?: string | null;
  parkingNote: string | null;
  facilitySheetRow?: number;
  suppliedMaterialNote: string | null;
  rawFacilityNote: string;
  equipmentModelIds: string[];
  evidenceKind?: PracticalCenterEvidenceKind;
  evidenceSourceUrl?: string | null;
  evidenceNote?: string;
  candidateSupplyGuidance?: PracticalCenterCandidateSupplyGuidance;
};

export type PracticalCenterEvidenceKind =
  | "facility_sheet_2026"
  | "exam_history_2025"
  | "historical_candidate";

export type PracticalCenterCandidateSupplyGuidance = {
  weldingPpeProvision: "not_provided";
  otherSuppliesProvision: "provided";
  personalBringGuidance:
    | "welding_ppe_required"
    | "welding_ppe_required_other_items_recommended";
  sourceKind: "user_report";
  reportedAt: string;
  summary: string;
};

export type PracticalCenterComparisonStatus =
  | "same"
  | "partially_different"
  | "ac"
  | "dc"
  | "ac_or_dc"
  | "not_published"
  | "parking_unavailable"
  | "parking_limited"
  | "needs_check";

export type PracticalCenterComparison = {
  pneumatic: {
    status: PracticalCenterComparisonStatus;
    label: string;
    detail: string;
  };
  hydraulic: {
    status: PracticalCenterComparisonStatus;
    label: string;
    detail: string;
  };
  welding: {
    status: PracticalCenterComparisonStatus;
    label: string;
    detail: string;
  };
  parking: {
    status: PracticalCenterComparisonStatus;
    label: string;
    detail: string;
  };
};

export const PRACTICAL_TEST_CENTER_SOURCE = {
  title: "2026년도 정기 기사 제2회 실기시험 작업형 시험장별 시설 현황",
  publishedLabel: "6.19. 18시 기준",
  sourceFile:
    "2026년도 정기 기사 제2회 실기시험 작업형 시험장별 시설 현황(6.19, 18시 기준).xlsx",
  sourceFileSha256:
    "62837E78CEC47F37808E45A896B12A7DE26BED99466E3E44D969EB046BAA4112",
  qualification: "설비보전기사",
  sheetName: "시험장별 시설현황",
} as const;

export const PRACTICAL_TEST_CENTERS: PracticalTestCenter[] = [
  {
    id: "seoul-north-tech",
    officialNumber: 12,
    region: "서울",
    name: "서울특별시 기술교육원 북부캠퍼스",
    parkingNote: "주차불가",
    facilitySheetRow: 15,
    suppliedMaterialNote: "아크 용접기",
    rawFacilityNote: "내쇼날시스템(주) NSA-250PA",
    equipmentModelIds: ["national-nsa-250pa"],
  },
  {
    id: "daegu-nam-kopo",
    officialNumber: 56,
    region: "대구",
    name: "한국폴리텍대학 남대구캠퍼스",
    parkingNote: null,
    facilitySheetRow: 59,
    suppliedMaterialNote: "C-clamp",
    rawFacilityNote: "DC용접기 Koreana MIG-200PRO",
    equipmentModelIds: ["koreana-mig-200pro"],
  },
  {
    id: "daegu-kopo-techno",
    officialNumber: 59,
    region: "대구",
    name: "한국폴리텍대학 대구캠퍼스 테크노관",
    parkingNote: null,
    facilitySheetRow: 62,
    suppliedMaterialNote: "C-clamp",
    rawFacilityNote: "(주)프로테크산업 / ACA-300AP",
    equipmentModelIds: ["protech-aca-300ap"],
  },
  {
    id: "gwangju-kcci",
    officialNumber: 116,
    region: "광주",
    name: "대한상의 광주인력개발원",
    parkingNote: null,
    facilitySheetRow: 119,
    suppliedMaterialNote: null,
    rawFacilityNote: "HAW-300",
    equipmentModelIds: ["hanheung-haw-300"],
  },
  {
    id: "gwangju-kopo-main",
    officialNumber: 122,
    region: "광주",
    name: "한국폴리텍대학 광주캠퍼스 대학본부동(1공학관)",
    parkingNote: null,
    facilitySheetRow: 125,
    suppliedMaterialNote: null,
    rawFacilityNote: "HAW-350",
    equipmentModelIds: ["hanheung-haw-350"],
  },
  {
    id: "ulsan-meister",
    officialNumber: 161,
    region: "울산",
    name: "울산마이스터고등학교",
    parkingNote: "주차불가",
    facilitySheetRow: 164,
    suppliedMaterialNote: null,
    rawFacilityNote:
      "HAW300, 하이트게이지, 탭·다이스 및 탭핸들·다이스핸들, 바이스, 용접봉 건조기, 와이어브러시, 플라이어, 전기드릴 등 시설표 기재",
    equipmentModelIds: ["hanheung-haw-300"],
  },
  {
    id: "ulsan-kopo",
    officialNumber: 163,
    region: "울산",
    name: "한국폴리텍VII대학 울산캠퍼스",
    parkingNote: null,
    facilitySheetRow: 166,
    suppliedMaterialNote: null,
    rawFacilityNote: "씨앤더블 CW-WA300E",
    equipmentModelIds: ["cnw-cw-wa300e"],
  },
  {
    id: "gangwon-chuncheon-kopo",
    officialNumber: 216,
    region: "강원",
    name: "한국폴리텍대학 춘천1캠퍼스(동산면)",
    parkingNote: null,
    facilitySheetRow: 219,
    suppliedMaterialNote: null,
    rawFacilityNote: "포스테크 / 사용범위 교류(AC) 아크용접",
    equipmentModelIds: ["postech-ac-arc-unspecified"],
  },
  {
    id: "jeonbuk-newtech-kopo",
    officialNumber: 264,
    region: "전북",
    name: "한국폴리텍대학 신기술교육원",
    parkingNote: null,
    facilitySheetRow: 267,
    suppliedMaterialNote: null,
    rawFacilityNote: "AC ARC 300A",
    equipmentModelIds: ["generic-ac-arc-300a"],
  },
  {
    id: "jeonnam-suncheon-jeil",
    officialNumber: 265,
    region: "전남",
    name: "순천제일대학교(창의관)",
    parkingNote: "주차협소",
    facilitySheetRow: 268,
    suppliedMaterialNote: null,
    rawFacilityNote: "CW-WA300E",
    equipmentModelIds: ["cnw-cw-wa300e"],
  },
  {
    id: "jeonnam-suncheon-kopo",
    officialNumber: 267,
    region: "전남",
    name: "한국폴리텍대학 순천캠퍼스",
    parkingNote: null,
    facilitySheetRow: 270,
    suppliedMaterialNote: null,
    rawFacilityNote: "CW-3M",
    equipmentModelIds: ["cnw-cw-3m"],
  },
  {
    id: "gyeongbuk-yeongju-kopo",
    officialNumber: 275,
    region: "경북",
    name: "한국폴리텍대학 영주캠퍼스[융합관]",
    parkingNote: null,
    facilitySheetRow: 278,
    suppliedMaterialNote: null,
    rawFacilityNote: "Postech 웰탑300A",
    equipmentModelIds: ["postech-weltop-unknown-300a"],
  },
  {
    id: "jeju-seogwipo-industry",
    officialNumber: 301,
    region: "제주",
    name: "서귀포산업과학고등학교",
    parkingNote: null,
    facilitySheetRow: 304,
    suppliedMaterialNote: null,
    rawFacilityNote: "CW-WA300E, CW-CAT3M",
    equipmentModelIds: ["cnw-cw-wa300e", "cnw-cw-cat3m"],
  },
  {
    id: "busan-technical-high",
    officialNumber: 327,
    region: "부산",
    name: "부산공고(남구 대연동) 기계·건축토목과 실습동",
    parkingNote: null,
    facilitySheetRow: 330,
    suppliedMaterialNote: null,
    rawFacilityNote: "CW-WA300E",
    equipmentModelIds: ["cnw-cw-wa300e"],
    candidateSupplyGuidance: {
      weldingPpeProvision: "not_provided",
      otherSuppliesProvision: "provided",
      personalBringGuidance: "welding_ppe_required",
      sourceKind: "user_report",
      reportedAt: "2026-07-28",
      summary:
        "용접 보호구는 개인 지참하고, 그 외 준비물은 시험장에서 모두 제공합니다.",
    },
  },
  {
    id: "pohang-kopo-techno2",
    officialNumber: 345,
    region: "경북동부",
    name: "한국폴리텍대학 포항캠퍼스(테크노2관)",
    parkingNote: null,
    facilitySheetRow: 348,
    suppliedMaterialNote: null,
    rawFacilityNote: "SMAW(C&W 교류아크)",
    equipmentModelIds: ["cnw-ac-arc-unspecified"],
  },
  {
    id: "gyeonggi-kcci",
    officialNumber: 352,
    region: "경기북부",
    name: "대한상공회의소 경기인력개발원",
    parkingNote: null,
    facilitySheetRow: 355,
    suppliedMaterialNote: null,
    rawFacilityNote:
      "LK 30KVA 15KW, Daedae 20KVA 12KW, Kumho 20KVA 10KW",
    equipmentModelIds: [
      "lk-30kva-15kw",
      "daedae-20kva-12kw",
      "kumho-20kva-10kw",
    ],
    candidateSupplyGuidance: {
      weldingPpeProvision: "not_provided",
      otherSuppliesProvision: "provided",
      personalBringGuidance: "welding_ppe_required",
      sourceKind: "user_report",
      reportedAt: "2026-07-28",
      summary:
        "용접 보호구는 개인 지참하고, 그 외 준비물은 시험장에서 모두 제공합니다.",
    },
  },
  {
    id: "seongnam-kopo-nuri",
    officialNumber: 365,
    region: "경기동부",
    name: "한국폴리텍대학 성남캠퍼스(누리관)",
    parkingNote: null,
    facilitySheetRow: 368,
    suppliedMaterialNote: null,
    rawFacilityNote:
      "공압/유압실습장비(S-Net), 전기아크용접기(내쇼날 NSA-250PA)",
    equipmentModelIds: ["snet-fluid-power", "national-nsa-250pa"],
    candidateSupplyGuidance: {
      weldingPpeProvision: "not_provided",
      otherSuppliesProvision: "provided",
      personalBringGuidance:
        "welding_ppe_required_other_items_recommended",
      sourceKind: "user_report",
      reportedAt: "2026-07-28",
      summary:
        "용접 보호구는 개인 지참해야 합니다. 그 외 준비물은 시험장에서 제공하지만 개인 지참을 권장합니다.",
    },
  },
  {
    id: "gumi-kopo-nuri",
    officialNumber: 380,
    region: "경북서부",
    name: "한국폴리텍대학 구미캠퍼스[누리관]",
    parkingNote: null,
    facilitySheetRow: 383,
    suppliedMaterialNote: null,
    rawFacilityNote: "Postech Weltop-ac arc 300A",
    equipmentModelIds: ["postech-ac300a"],
  },
];

export const PRACTICAL_2026_FACILITY_CENTERS = PRACTICAL_TEST_CENTERS;

export const PRACTICAL_2025_HISTORY_SOURCE = {
  title: "2025년 설비보전기사 실기 작업형 시험장 목록",
  sourceUrl:
    "https://bjs2236.tistory.com/entry/2025%EB%85%84-%EC%84%A4%EB%B9%84%EB%B3%B4%EC%A0%84%EA%B8%B0%EC%82%AC-%EC%8B%A4%EA%B8%B0-%EC%9E%91%EC%97%85%ED%98%95-%EC%8B%9C%ED%97%98%EC%9E%A5-%EB%AA%A9%EB%A1%9D",
  note: "2025년 실제 원서접수 화면의 작업형 시험 이력 기준",
} as const;

export const PRACTICAL_2025_HISTORY_CENTERS: PracticalTestCenter[] = [
  {
    id: "gangwon-wonju-kopo",
    region: "강원",
    name: "한국폴리텍대학 원주캠퍼스",
    buildingNote: null,
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "gangwon-gangneung-kopo",
    region: "강원",
    name: "한국폴리텍대학 강릉캠퍼스",
    buildingNote: null,
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "gyeongnam-jinju-kopo",
    region: "경남",
    name: "한국폴리텍대학 진주캠퍼스",
    buildingNote: "교육1관",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 교육1관 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "gyeongbuk-geumo-tech-high",
    region: "경북",
    name: "금오공업고등학교",
    buildingNote: null,
    parkingNote: "주차협소",
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "daejeon-woosong-west",
    region: "대전",
    name: "우송대학교 서캠퍼스",
    buildingNote: "철도물류관 201호",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 철도물류관 201호 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "daejeon-kopo-narae",
    region: "대전",
    name: "한국폴리텍대학 대전캠퍼스",
    buildingNote: "나래관 6층 반도체공유압실",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 공유압 실습실 확인 · 세부 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
    evidenceNote: "공유압 실습실 위치는 확인됐지만 제조사·모델·실습대 수량은 미확인",
  },
  {
    id: "seoul-asea-yongsan",
    region: "서울",
    name: "아세아직업전문학교 용산캠퍼스",
    buildingNote: null,
    parkingNote: "주차불가",
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "incheon-kopo-industry",
    region: "인천",
    name: "한국폴리텍대학 인천캠퍼스",
    buildingNote: "산학협력관",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 산학협력관 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "incheon-kcci-engineering",
    region: "인천",
    name: "대한상공회의소 인천인력개발원",
    buildingNote: "공학관",
    parkingNote: "유료주차",
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 공학관 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "jeonnam-kopo-muan",
    region: "전남",
    name: "한국폴리텍대학 전남캠퍼스",
    buildingNote: "무안 제1공학관 3층",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 무안 제1공학관 3층 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "jeonbuk-kcci",
    region: "전북",
    name: "대한상공회의소 전북인력개발원",
    buildingNote: null,
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "chungnam-kopo-dream",
    region: "충남",
    name: "한국폴리텍Ⅳ대학 충남캠퍼스",
    buildingNote: "꿈드림공작소",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 꿈드림공작소 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "chungnam-kcci",
    region: "충남",
    name: "대한상공회의소 충남인력개발원",
    buildingNote: null,
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "chungbuk-cheongju-kopo",
    region: "충북",
    name: "한국폴리텍대학 청주캠퍼스",
    buildingNote: "제1공학관",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 제1공학관 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
  {
    id: "chungbuk-health-science",
    region: "충북",
    name: "충북보건과학대학교",
    buildingNote: "창의관",
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote: "2025 작업형 시험 이력 확인 · 창의관 · 장비 모델 미확인",
    equipmentModelIds: [],
    evidenceKind: "exam_history_2025",
    evidenceSourceUrl: PRACTICAL_2025_HISTORY_SOURCE.sourceUrl,
  },
];

const PRACTICAL_HISTORICAL_CANDIDATE_SEEDS: Array<
  [id: string, region: string, name: string, buildingNote: string | null]
> = [
  ["incheon-nam-kopo-candidate", "인천", "한국폴리텍대학 남인천캠퍼스", null],
  ["jeonbuk-iksan-kopo-candidate", "전북", "한국폴리텍대학 익산캠퍼스", null],
  ["jeju-kopo-candidate", "제주", "한국폴리텍대학 제주캠퍼스", null],
  ["chungbuk-chungju-kopo-candidate", "충북", "한국폴리텍대학 충주캠퍼스", null],
  ["chungbuk-cheongju-tech-high-candidate", "충북", "청주공업고등학교", "발전관"],
  ["gyeongbuk-gumi-kopo-engineering-candidate", "경북", "한국폴리텍대학 구미캠퍼스", "공학관"],
];

export const PRACTICAL_HISTORICAL_CANDIDATE_CENTERS: PracticalTestCenter[] =
  PRACTICAL_HISTORICAL_CANDIDATE_SEEDS.map(([id, region, name, buildingNote]) => ({
    id,
    region,
    name,
    buildingNote,
    parkingNote: null,
    suppliedMaterialNote: null,
    rawFacilityNote:
      "과거 또는 사용자 제보 후보 · 실제 시행 회차와 장비 정보 확인 필요",
    equipmentModelIds: [],
    evidenceKind: "historical_candidate" as const,
    evidenceSourceUrl: null,
    evidenceNote:
      "공식 시행 회차 증거가 확보되기 전에는 현재 시험장 목록과 분리",
  }));

export const PRACTICAL_MAIN_TEST_CENTERS: PracticalTestCenter[] = [
  ...PRACTICAL_2026_FACILITY_CENTERS,
  ...PRACTICAL_2025_HISTORY_CENTERS,
];

export function getPracticalCenterEvidenceKind(
  center: PracticalTestCenter,
): PracticalCenterEvidenceKind {
  return center.evidenceKind ?? "facility_sheet_2026";
}

export function getPracticalCenterEvidenceLabel(
  center: PracticalTestCenter,
) {
  const kind = getPracticalCenterEvidenceKind(center);
  if (kind === "exam_history_2025") return "2025 시험 이력";
  if (kind === "historical_candidate") return "과거 후보";
  return "2026 시설표";
}

export const practicalTestCentersById = new Map(
  [...PRACTICAL_MAIN_TEST_CENTERS, ...PRACTICAL_HISTORICAL_CANDIDATE_CENTERS].map(
    (center) => [center.id, center],
  ),
);

/**
 * 공식 시설현황 XLSX에 적힌 범위만 V-AMT 학습환경과 비교한다.
 * 공압·유압 장비가 시설표에 없는 경우 동일하다고 추정하지 않는다.
 */
export function getPracticalCenterComparison(
  center: PracticalTestCenter,
): PracticalCenterComparison {
  const evidenceKind = getPracticalCenterEvidenceKind(center);
  const hasSNetTrainer = center.equipmentModelIds.includes("snet-fluid-power");
  const fluidDetail = hasSNetTrainer
    ? "공식 시설표에는 S-Net 장비로 기재되어 있어 V-AMT 화면·부품 배치와 일부 다를 수 있습니다."
    : evidenceKind === "exam_history_2025"
      ? "2025 시험 이력은 확인됐지만 공압·유압 장비 모델과 실습대 수량은 미확인입니다."
      : evidenceKind === "historical_candidate"
        ? "과거 후보 정보만 있어 실제 시행 회차와 공압·유압 장비를 모두 확인해야 합니다."
        : "공식 시설표에 공압·유압 장비 모델이 기재되지 않아 V-AMT와의 동일 여부를 확정할 수 없습니다.";

  return {
    pneumatic: {
      status: hasSNetTrainer ? "partially_different" : "not_published",
      label: hasSNetTrainer ? "일부 다름" : "미확인",
      detail: fluidDetail,
    },
    hydraulic: {
      status: hasSNetTrainer ? "partially_different" : "not_published",
      label: hasSNetTrainer ? "일부 다름" : "공개표 미기재",
      detail: fluidDetail,
    },
    welding: getWeldingComparison(center),
    parking: getParkingComparison(center),
  };
}

function getWeldingComparison(
  center: PracticalTestCenter,
): PracticalCenterComparison["welding"] {
  const weldingModels = center.equipmentModelIds
    .map((id) => practicalEquipmentModelsById.get(id)?.welding)
    .filter(
      (item): item is PracticalWeldingEquipmentInfo => Boolean(item),
    );
  const confirmed = weldingModels.filter(
    (item) => item.outputVerification === "confirmed",
  );
  const probable = weldingModels.filter(
    (item) => item.outputVerification === "probable",
  );
  const confirmedTypes = new Set(
    confirmed.map((item) => item.outputCurrentType),
  );
  const probableTypes = new Set(
    probable.map((item) => item.outputCurrentType),
  );

  if (confirmedTypes.has("ac_dc")) {
    return {
      status: "ac_or_dc",
      label: "교류·직류 겸용",
      detail: "확인된 장비 사양에서 AC·DC 출력을 모두 지원합니다.",
    };
  }

  if (
    confirmedTypes.has("ac") &&
    confirmedTypes.has("dc")
  ) {
    return {
      status: "ac_or_dc",
      label: "교류·직류 장비",
      detail: "시험장 시설표에서 교류와 직류 장비가 각각 확인됩니다.",
    };
  }

  if (confirmedTypes.has("dc")) {
    return {
      status: "dc",
      label: "직류",
      detail: "시설표 또는 확인된 장비 사양에서 직류(DC) 용접기로 확인됩니다.",
    };
  }

  if (confirmedTypes.has("ac")) {
    const hasProbableAc =
      probableTypes.has("ac") || probableTypes.has("ac_dc");
    return {
      status: "ac",
      label: hasProbableAc ? "교류 확인·일부 유력" : "교류",
      detail: hasProbableAc
        ? "교류(AC) 장비는 확인됐으며 일부 장비는 정확한 모델명·명판 확인이 남아 있습니다."
        : "시설표 또는 확인된 장비 사양에서 교류(AC) 용접기로 확인됩니다.",
    };
  }

  if (probableTypes.has("ac_dc")) {
    return {
      status: "needs_check",
      label: "교류·직류 유력",
      detail: "AC·DC 겸용 모델과 일치할 가능성이 높지만 시험장 명판의 ACDC 표기 확인이 필요합니다.",
    };
  }

  if (probableTypes.has("ac")) {
    return {
      status: "needs_check",
      label: "교류 유력",
      detail: "교류(AC) 장비 사양과 일치하지만 정확한 모델명 또는 명판 확인이 필요합니다.",
    };
  }

  return {
    status: "needs_check",
    label: "현장 확인",
    detail: "공식 시설표만으로 교류·직류를 확정할 수 없어 장비 명판 확인이 필요합니다.",
  };
}

function getParkingComparison(
  center: PracticalTestCenter,
): PracticalCenterComparison["parking"] {
  if (center.parkingNote?.includes("주차불가")) {
    return {
      status: "parking_unavailable",
      label: "주차불가",
      detail: center.parkingNote,
    };
  }

  if (center.parkingNote?.includes("주차협소")) {
    return {
      status: "parking_limited",
      label: "주차협소",
      detail: center.parkingNote,
    };
  }

  if (center.parkingNote?.includes("유료주차")) {
    return {
      status: "parking_limited",
      label: "유료주차",
      detail: center.parkingNote,
    };
  }

  return {
    status: "needs_check",
    label: "확인 필요",
    detail: "공식 시설표에 주차 가능 여부가 명시되지 않았습니다.",
  };
}
