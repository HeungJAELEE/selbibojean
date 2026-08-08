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
  candidateFieldReport?: PracticalCenterCandidateFieldReport;
};

export type PracticalCenterEvidenceKind =
  | "facility_sheet_2026"
  | "exam_history_2025"
  | "field_verified"
  | "verified_user_report"
  | "historical_candidate";

export type PracticalCenterCandidateSupplyGuidance = {
  weldingPpeProvision: "not_provided";
  otherSuppliesProvision: "provided" | "partially_not_provided";
  personalBringGuidance:
    | "welding_ppe_required"
    | "welding_ppe_required_other_items_recommended"
    | "welding_ppe_and_tools_required";
  sourceKind: "user_report";
  reportedAt: string;
  sourceUrl?: string;
  summary: string;
  requiredPersonalItems?: string[];
};

export type PracticalCenterCandidateFieldReport = {
  sourceKind: "user_report";
  reportedAt: string;
  reporterLabel?: string;
  sourceUrl?: string;
  summary: string;
  sections: Array<{
    category: "electrical_control" | "pneumatic" | "hydraulic" | "welding";
    title: string;
    notes: string[];
    caution?: string;
  }>;
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
    parkingNote: "주차불가 · 사용자 제보(2026-07-28)",
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
    candidateFieldReport: {
      sourceKind: "user_report",
      reportedAt: "2024-08-13",
      summary:
        "공압·유압 실습장비의 장비점검과 현장 이상 대응에 관한 수험자 제보입니다.",
      sections: [
        {
          category: "pneumatic",
          title: "공압 장비점검",
          notes: [
            "공압과 유압 시험이 나뉘어 운영됐다는 제보가 있습니다.",
            "공압 배기구와 호스 체결이 느슨하면 압력이 형성되지 않을 수 있어 장비점검 때 연결 상태를 확인하는 편이 좋습니다.",
            "리미트스위치 위치, 실린더 움직임, 솔레노이드밸브 동작을 시험 시작 전에 확인했다는 후기입니다.",
          ],
          caution:
            "압력이 형성되지 않거나 밸브가 작동하지 않으면 임의 수리하지 말고 즉시 감독관에게 알리세요.",
        },
        {
          category: "hydraulic",
          title: "유압 장비점검",
          notes: [
            "릴리프밸브로 시험장 지시 압력을 맞춘 뒤 회로를 진행했다는 제보가 있습니다.",
            "배선 또는 밸브 이상으로 출력이 나오지 않는 사례가 있었고, 같은 장비에서도 상태 차이가 있었다는 후기입니다.",
            "장비점검 시간을 활용해 호스·배선·밸브의 기본 동작을 확인하는 편이 좋다는 조언입니다.",
          ],
          caution:
            "압력 설정과 이상 대응은 해당 회차 감독관 안내를 우선하세요.",
        },
      ],
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
      reportedAt: "2026-07-30",
      summary:
        "용접 보호구는 개인 지참해야 합니다. 그 외 용접 도구는 미지참 시 시험장에서 제공받을 수 있으나, 본인 도구를 직접 구비해 지참하는 편이 더 낫다는 현장 권장 제보가 있습니다.",
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
    candidateSupplyGuidance: {
      weldingPpeProvision: "not_provided",
      otherSuppliesProvision: "partially_not_provided",
      personalBringGuidance: "welding_ppe_and_tools_required",
      sourceKind: "user_report",
      reportedAt: "2026-07-28",
      sourceUrl:
        "https://m.cafe.naver.com/ca-fe/web/cafes/29094056/articles/17545?tc=cafe_member_profile",
      summary:
        "용접 보호구와 슬래그망치·와이어브러시는 제공되지 않는다는 현장 제보가 있습니다. 누락 시 시험이 어렵다는 안내를 받았으므로 반드시 개인 지참하고, 미보유 품목은 시험 전에 구매·준비하세요.",
      requiredPersonalItems: [
        "용접면·보안경 등 용접 보호구",
        "용접 장갑",
        "용접 앞치마",
        "슬래그망치",
        "와이어브러시",
      ],
    },
    candidateFieldReport: {
      sourceKind: "user_report",
      reportedAt: "2026-07-28",
      sourceUrl:
        "https://m.cafe.naver.com/ca-fe/web/cafes/29094056/articles/17545?tc=cafe_member_profile",
      summary:
        "인천폴리텍 산학협력관의 전기제어·공압·유압·용접 장비 상태와 당일 운영을 정리한 사용자 현장 제보입니다.",
      sections: [
        {
          category: "electrical_control",
          title: "유공압 전기장비",
          notes: [
            "전기 패널은 전반적으로 신품에 가까운 상태로 제보됐습니다.",
            "바나나 배선 중 헐거운 것이 있어 작업 전 결속 상태를 확인하고, 지나치게 헐거운 배선은 감독관에게 알려 교체하는 편이 안전합니다.",
            "제보 기준으로 COM 단자와 A·B 접점의 위아래 배치가 익숙한 연습 장비와 반대였습니다. 기억에 의존하지 말고 현장 단자 표기를 먼저 확인하세요.",
          ],
        },
        {
          category: "pneumatic",
          title: "공압장비",
          notes: [
            "장비 상태는 전반적으로 양호하다고 제보됐습니다.",
            "한 자리에서 에어 컴프레서가 작동하지 않았으나 감독관이 현장 조치했고, 지연 시간만큼 보상받았다는 사례가 있습니다.",
          ],
          caution:
            "장비가 작동하지 않으면 임의로 수리하지 말고 즉시 감독관에게 알려 조치 시간과 보상 여부를 확인하세요.",
        },
        {
          category: "hydraulic",
          title: "유압장비",
          notes: [
            "제품에 유압 기호가 이미지로 잘 표시되어 있고 전반적인 상태는 양호하다고 제보됐습니다.",
            "유압유가 예상보다 많이 흐를 수 있어 작업용 장갑을 준비하는 것이 도움이 됩니다.",
            "유압모터 회전 방향은 시험 전에 감독관이 설명했다는 제보가 있습니다.",
          ],
        },
        {
          category: "welding",
          title: "용접기와 평가",
          notes: [
            "구형 다이얼식 교류 아크용접기이며 전류(A)는 디지털 표시창에서 확인할 수 있습니다.",
            "여러 용접기를 동시에 사용할 때 표시 전류와 체감 출력이 달랐다는 제보가 있으나, 일률적으로 전류를 올리지 말고 시험편 상태와 감독관 안내를 기준으로 조정해야 합니다.",
            "언더컷·오버랩·비드 형상을 꼼꼼히 확인하고, 덧방이나 2차 온둘레 용접을 하지 말라는 사전 안내가 있었다고 제보됐습니다.",
            "에어건 가압 없이 물을 부어 누수 시험을 진행했다는 해당 회차 제보가 있습니다.",
          ],
          caution:
            "장비 설정과 누수 시험 방식은 회차별로 달라질 수 있습니다. 현장 설명을 최종 기준으로 따르세요.",
        },
      ],
    },
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

const CHANGWON_KOPO_REPORTED_CENTER: PracticalTestCenter = {
  id: "gyeongnam-changwon-kopo",
  region: "경남",
  name: "한국폴리텍대학 창원캠퍼스",
  buildingNote: "공유압 실습장",
  parkingNote: null,
  suppliedMaterialNote: null,
  rawFacilityNote:
    "사용자 제공 현장 사진과 수험자 제보로 공유압 전기제어 모듈과 유압 기초 실습장비 사용을 확인 · 세부 장비 모델 미확인",
  equipmentModelIds: [],
  evidenceKind: "verified_user_report",
  evidenceSourceUrl: null,
  evidenceNote:
    "사용자 제공 현장 사진과 구체적인 수험 경험으로 시험장 사용을 확인했습니다. 공식 시행 회차·건물의 정확한 명칭·장비 모델은 추가 확인이 필요합니다.",
  candidateFieldReport: {
    sourceKind: "user_report",
    reportedAt: "2026-07-30",
    reporterLabel: "수험자 24학번군바리",
    summary:
      "창원 폴리텍 공유압 실습장비의 배선 상태와 현장 대응 방법에 관한 수험자 제보입니다.",
    sections: [
      {
        category: "electrical_control",
        title: "공유압 전기제어 배선",
        notes: [
          "수험자 제보에 따르면 단선으로 의심되는 배선이 섞여 있어 회로가 작동하지 않는 경우가 있었습니다.",
          "작동 불량 원인을 오래 추적하기보다 연결한 배선을 모두 제거한 뒤 빠르게 다시 설치하는 편이 더 빨랐다는 후기입니다.",
        ],
        caution:
          "배선 이상이 의심되면 무리하게 수리하지 말고 감독관에게 알린 뒤 교체 가능 여부와 재작업 시간을 확인하세요. 장비 상태는 회차와 좌석마다 달라질 수 있습니다.",
      },
    ],
  },
};

const BUSAN_KOPO_FIELD_VERIFIED_CENTER: PracticalTestCenter = {
  id: "busan-kopo-facility-energy-lab",
  region: "부산",
  name: "한국폴리텍대학 부산캠퍼스 설비에너지보전실",
  buildingNote: "2216 설비에너지보전실 공·유압실",
  parkingNote: null,
  suppliedMaterialNote: null,
  rawFacilityNote:
    "사용자 제공 현장 사진에서 설비보전기사 시험장 표지와 공·유압 실습대, 전기 릴레이·버튼·타이머 모듈, 호스·부품 수납 상태를 확인 · 제조사·모델·정확한 수량은 미확인",
  equipmentModelIds: [],
  evidenceKind: "field_verified",
  evidenceSourceUrl: null,
  evidenceNote:
    "현장 사진에서 설비보전기사 시험장 표지를 확인했습니다. 최신 회차의 공식 지정 여부는 원서접수에서 다시 확인하세요.",
};

export const PRACTICAL_HISTORICAL_CANDIDATE_CENTERS: PracticalTestCenter[] =
  PRACTICAL_HISTORICAL_CANDIDATE_SEEDS.map(
    ([id, region, name, buildingNote]) => ({
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
    }),
  );

export const PRACTICAL_MAIN_TEST_CENTERS: PracticalTestCenter[] = [
  ...PRACTICAL_2026_FACILITY_CENTERS,
  ...PRACTICAL_2025_HISTORY_CENTERS,
  CHANGWON_KOPO_REPORTED_CENTER,
  BUSAN_KOPO_FIELD_VERIFIED_CENTER,
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
  if (kind === "field_verified") return "현장 사진 시험장 표지 확인";
  if (kind === "verified_user_report") return "현장 사진·수험자 제보 확인";
  if (kind === "historical_candidate") return "과거 후보";
  return "2026 시설표";
}

export const practicalTestCentersById = new Map(
  [...PRACTICAL_MAIN_TEST_CENTERS, ...PRACTICAL_HISTORICAL_CANDIDATE_CENTERS].map(
    (center) => [center.id, center],
  ),
);
practicalTestCentersById.set(
  "gyeongnam-changwon-kopo-candidate",
  CHANGWON_KOPO_REPORTED_CENTER,
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
      : evidenceKind === "verified_user_report"
        ? "현장 사진과 수험자 제보로 공유압 실습대 사용을 확인했지만 제조사·모델·좌석별 상태는 미확인입니다."
      : evidenceKind === "field_verified"
        ? "현장 사진에서 공·유압 실습대와 전기제어 모듈을 확인했지만 제조사·모델·정확한 수량은 미확인입니다."
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
