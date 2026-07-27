export type PracticalTestCenter = {
  id: string;
  officialNumber: number;
  region: string;
  name: string;
  parkingNote: string | null;
  facilitySheetRow: number;
  suppliedMaterialNote: string | null;
  rawFacilityNote: string;
  equipmentModelIds: string[];
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
    equipmentModelIds: [],
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
    equipmentModelIds: [],
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
    equipmentModelIds: [],
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
    equipmentModelIds: ["postech-weltop-300"],
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
    equipmentModelIds: [],
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
    equipmentModelIds: [],
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
    equipmentModelIds: ["postech-weltop-300"],
  },
];

export const practicalTestCentersById = new Map(
  PRACTICAL_TEST_CENTERS.map((center) => [center.id, center]),
);

/**
 * 공식 시설현황 XLSX에 적힌 범위만 V-AMT 학습환경과 비교한다.
 * 공압·유압 장비가 시설표에 없는 경우 동일하다고 추정하지 않는다.
 */
export function getPracticalCenterComparison(
  center: PracticalTestCenter,
): PracticalCenterComparison {
  const hasSNetTrainer = center.equipmentModelIds.includes("snet-fluid-power");
  const fluidDetail = hasSNetTrainer
    ? "공식 시설표에는 S-Net 장비로 기재되어 있어 V-AMT 화면·부품 배치와 일부 다를 수 있습니다."
    : "공식 시설표에 공압·유압 장비 모델이 기재되지 않아 V-AMT와의 동일 여부를 확정할 수 없습니다.";

  return {
    pneumatic: {
      status: hasSNetTrainer ? "partially_different" : "not_published",
      label: hasSNetTrainer ? "일부 다름" : "공개표 미기재",
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
  const raw = center.rawFacilityNote.toLowerCase();
  const ids = new Set(center.equipmentModelIds);
  const isDc =
    raw.includes("dc용접기") || ids.has("national-nsa-250pa");
  const isAc =
    raw.includes("교류") ||
    raw.includes("ac arc") ||
    raw.includes("weltop-ac") ||
    ids.has("hanheung-haw-300") ||
    ids.has("hanheung-haw-350") ||
    ids.has("cnw-cw-wa300e") ||
    ids.has("postech-weltop-300");

  if (isAc && isDc) {
    return {
      status: "ac_or_dc",
      label: "교류·직류",
      detail: "공식 시설표에 교류와 직류 용접 장비 정보가 함께 확인됩니다.",
    };
  }

  if (isDc) {
    return {
      status: "dc",
      label: "직류",
      detail: "공식 시설표 또는 확인된 장비 사양에서 직류 용접기로 확인됩니다.",
    };
  }

  if (isAc) {
    return {
      status: "ac",
      label: "교류",
      detail: "공식 시설표 또는 동일 모델의 명시 정보에서 교류 용접기로 확인됩니다.",
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

  return {
    status: "needs_check",
    label: "확인 필요",
    detail: "공식 시설표에 주차 가능 여부가 명시되지 않았습니다.",
  };
}
