export type PracticalTrainingResource = {
  id: string;
  title: string;
  provider: string;
  region: string;
  locationNote: string;
  url: string;
  kind:
    | "official_exam_portal"
    | "open_training_portal"
    | "training_catalog"
    | "training_course";
  topicTags: string[];
  audienceNote: string;
  availabilityNote: string;
  listingStatus: "current_reference" | "scheduled" | "historical";
  verifiedAt: string;
  validThrough: string | null;
  publicationStatus: "public" | "held";
  evidenceNote: string;
};

/**
 * 사용자 대화에서 발견한 링크를 그대로 신뢰하지 않고, 2026-07-28에
 * 각 운영기관의 실제 페이지를 다시 열어 확인한 공식 자료만 담는다.
 */
export const PRACTICAL_TRAINING_RESOURCES: PracticalTrainingResource[] = [
  {
    id: "qnet-public-practical-problems",
    title: "Q-Net 공개문제 자료실",
    provider: "한국산업인력공단 Q-Net",
    region: "전국",
    locationNote:
      "전국 수험자가 공식 시험 자료를 확인할 때 참고하는 온라인 자료실",
    url: "https://www.q-net.or.kr/cst006.do?code=1204&gId=&gSite=Q&id=cst00601",
    kind: "official_exam_portal",
    topicTags: ["공개문제", "실기시험", "지참준비물"],
    audienceNote: "전체 수험자",
    availabilityNote:
      "종목명으로 검색해 최신 설비보전기사 공개문제와 공지 여부를 확인",
    listingStatus: "current_reference",
    verifiedAt: "2026-07-28",
    validThrough: null,
    publicationStatus: "public",
    evidenceNote:
      "Q-Net 공식 공개문제 자료실 목록과 실기시험 지참준비물 메뉴를 확인",
  },
  {
    id: "kopo-dream-workshop",
    title: "한국폴리텍대학 꿈드림공작소 프로그램",
    provider: "한국폴리텍대학",
    region: "전국",
    locationNote:
      "가까운 캠퍼스와 교육 주제를 선택해 지역별 프로그램을 찾을 때 참고하는 통합 검색 경로",
    url: "https://dream.kopo.ac.kr/ko/",
    kind: "open_training_portal",
    topicTags: ["용접", "공압", "유압", "시퀀스", "장비 실습"],
    audienceNote: "프로그램별 대상·정원·캠퍼스 조건 확인",
    availabilityNote:
      "시설·장비 개방과 무료 기술교육 프로그램을 캠퍼스·키워드로 검색",
    listingStatus: "current_reference",
    verifiedAt: "2026-07-28",
    validThrough: null,
    publicationStatus: "public",
    evidenceNote:
      "꿈드림공작소 공식 홈에서 시설·장비 개방, 무료 기술교육·체험 안내와 프로그램 검색 기능을 확인",
  },
  {
    id: "kopo-jungsu-incumbent-training",
    title: "서울정수산학협력단 재직자 향상과정",
    provider: "한국폴리텍대학 서울정수산학협력단",
    region: "서울",
    locationNote:
      "서울 지역의 공압·유압·자동제어 교육 경로를 찾을 때 참고",
    url: "https://sanhak.kopo.ac.kr/jungsu/selectCrseWebList.do?key=1239",
    kind: "training_catalog",
    topicTags: ["공압", "유압", "자동제어", "재직자교육"],
    audienceNote:
      "재직자·기업 협약 등 과정별 선발 조건과 제출서류를 반드시 확인",
    availabilityNote:
      "공압·유압·자동제어 과정의 개설 여부와 접수 상태는 목록에서 수시 확인",
    listingStatus: "current_reference",
    verifiedAt: "2026-07-28",
    validThrough: null,
    publicationStatus: "public",
    evidenceNote:
      "공식 과정 목록과 2026년 공압제어·유압제어 실무 과정 상세를 확인했으나 해당 회차는 접수 마감",
  },
  {
    id: "jeonbuk-korcham-welding-practice-2026",
    title: "전북인력개발원 용접실무",
    provider: "대한상공회의소 전북인력개발원",
    region: "전북",
    locationNote: "전북 지역의 재직자 용접 실습 교육을 찾을 때 참고",
    url: "https://jb.korchamhrd.net/education/improvementEduDetail.do?bunryu=1%2C3%2C8&callFlag=YEAR&gaebalwon_cd=08000&mcourse_no=M0591&menuId=3837&rootMenuId=3830",
    kind: "training_course",
    topicTags: ["용접실무", "재직자교육"],
    audienceNote:
      "중소기업 재직근로자 대상이며 기업 협약·신청 가능 여부를 공식 페이지에서 확인",
    availabilityNote:
      "2026-10-17~2026-10-18 예정 회차가 표시되지만 일정·정원·폐강 여부는 변동 가능",
    listingStatus: "scheduled",
    verifiedAt: "2026-07-28",
    validThrough: "2026-10-18",
    publicationStatus: "public",
    evidenceNote:
      "전북인력개발원 공식 용접실무 상세에서 16시간 과정과 2026-10-17~18 회차를 확인",
  },
  {
    id: "asan-kopo-seolbi-welding-2026-history",
    title: "아산 꿈드림공작소 설비보전기사 용접 실습",
    provider: "한국폴리텍대학 아산캠퍼스",
    region: "충남",
    locationNote:
      "충남 지역에서 운영된 설비보전기사 용접 실습의 과거 사례",
    url: "https://dream.kopo.ac.kr/ko/intro/asan/view/22051/description",
    kind: "training_course",
    topicTags: ["설비보전기사", "피복아크용접", "홀용접", "필릿용접"],
    audienceNote: "일반인 대상이었던 2026년 종료 과정",
    availabilityNote:
      "2026-07-04~2026-07-05 운영 종료. 현재 모집 과정이 아니며 향후 유사 과정 탐색용 기록으로 보존",
    listingStatus: "historical",
    verifiedAt: "2026-07-28",
    validThrough: "2026-07-05",
    publicationStatus: "public",
    evidenceNote:
      "공식 상세 페이지에서 아산캠퍼스 2공학관 1층 용접실·재료실험실 운영과 지원마감·운영 종료 상태를 확인",
  },
];

export function getPublicPracticalTrainingResources(asOf: string) {
  assertValidAsOf(asOf);
  return PRACTICAL_TRAINING_RESOURCES.filter(
    (resource) =>
      resource.publicationStatus === "public" &&
      resource.listingStatus !== "historical" &&
      (resource.validThrough === null || resource.validThrough >= asOf),
  );
}

export function getHistoricalPracticalTrainingResources(asOf: string) {
  assertValidAsOf(asOf);
  return PRACTICAL_TRAINING_RESOURCES.filter(
    (resource) =>
      resource.publicationStatus === "public" &&
      (resource.listingStatus === "historical" ||
        (resource.validThrough !== null && resource.validThrough < asOf)),
  );
}

function assertValidAsOf(asOf: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(asOf)) {
    throw new Error("asOf는 YYYY-MM-DD 형식이어야 합니다.");
  }
}
