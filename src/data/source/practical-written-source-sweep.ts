import type { PracticalWrittenExamCardFormat } from "@/lib/domain/practical-types";

export const PRACTICAL_WRITTEN_SOURCE_SWEEP_VERSION = "2026-08-10";

export type PracticalNcsUnitPriority = "A" | "B" | "C";

export type PracticalNcsUnit = {
  id: string;
  ncsCode: string;
  unitId: string;
  title: string;
  printedPageStart: number;
  printedPageEnd: number | null;
};

export type PracticalNcsCandidate = {
  id: string;
  ncsCode: string;
  unitId: string;
  title: string;
  priority: Exclude<PracticalNcsUnitPriority, "A">;
  memoryCapsule: string;
  requiredKeywords: string[];
  questionFormats: PracticalWrittenExamCardFormat[];
  predictedPromptSeeds: string[];
  neighborConceptIds: string[];
  sourceStatus: "ncs_text_extracted";
  publicationStatus: "editorial_hold";
  holdReason: string;
};

export type PracticalRestoredSourceSweepItem = {
  id: string;
  url: string;
  occurrence: { year: number; round: number } | null;
  status: "mapped_existing" | "source_pending_extraction";
  evidenceClass: "unverified_user_report";
  questionIds: string[];
  submissionCount: number;
  note: string;
};

const unit = (
  ncsCode: string,
  unitId: string,
  title: string,
  printedPageStart: number,
  printedPageEnd: number | null,
): PracticalNcsUnit => ({
  id: `ncs:${ncsCode}:${unitId}`,
  ncsCode,
  unitId,
  title,
  printedPageStart,
  printedPageEnd,
});

/**
 * Drive의 11개 NCS 학습모듈 목차를 원문 순서대로 보존한 61개 세부학습단위다.
 * 책 단위의 단순 연결을 전 범위 커버리지로 오인하지 않도록, 모든 NCS 출처는
 * 아래 단위 중 정확히 하나에 귀속되어야 한다.
 */
export const PRACTICAL_NCS_UNIT_REGISTRY: PracticalNcsUnit[] = [
  unit("1502010504", "1-1", "도면의 측정 부분과 측정 방법 파악", 3, 16),
  unit("1502010504", "2-1", "측정기 및 필요한 보조 기구의 선정", 17, 37),
  unit("1502010504", "3-1", "측정기 사용 준비", 38, 57),
  unit("1502010504", "3-2", "측정의 수행 및 측정 결과의 판단", 58, null),

  unit("1502010511", "1-1", "도면 해독 자료 수집 및 치수공차 확인", 3, 38),
  unit("1502010511", "1-2", "설계 변경 사항 및 도면 표준 파악", 39, 62),
  unit("1502010511", "2-1", "투상도 확인", 63, 80),
  unit("1502010511", "3-1", "측정할 요소, 치수 및 부품 특성 파악", 81, 99),
  unit("1502010511", "3-2", "측정 정밀도 및 도면의 부가기호 파악", 100, null),

  unit("1505010108", "1-1", "커플링 특성 파악", 3, 14),
  unit("1505010108", "1-2", "커플링 정비", 15, 46),
  unit("1505010108", "2-1", "감속기 특성 파악", 47, 57),
  unit("1505010108", "2-2", "감속기 정비", 58, 79),
  unit("1505010108", "3-1", "휠·베어링 특성 파악", 80, 98),
  unit("1505010108", "3-2", "휠·베어링 정비", 99, 125),
  unit("1505010108", "4-1", "브레이크 특성 파악", 126, 140),
  unit("1505010108", "4-2", "브레이크 정비", 141, null),

  unit("1601050108", "1-1", "치수 및 구조상의 결함 확인", 3, 12),
  unit("1601050108", "1-2", "용접 중 결함 추정", 13, 21),
  unit("1601050108", "2-1", "결함 판정기준 확인", 22, 44),
  unit("1601050108", "2-2", "용접결함의 보수작업 진행 여부 확인", 45, 53),
  unit("1601050108", "3-1", "용접결함부 보수용접", 54, 66),
  unit("1601050108", "3-2", "용접부 비파괴검사", 67, null),

  unit("1503010216", "1-1", "유압동력 발생장치 선정", 3, 16),
  unit("1503010216", "1-2", "유압제어 밸브 선정", 17, 33),
  unit("1503010216", "1-3", "유압 액추에이터 선정", 34, 54),
  unit("1503010216", "2-1", "유압제어 회로 구성", 55, 100),
  unit("1503010216", "2-2", "전기 유압제어 회로 구성", 101, 166),
  unit("1503010216", "3-1", "유압시스템 구축", 167, 183),
  unit("1503010216", "3-2", "부가조건 회로 시운전", 184, 192),
  unit("1503010216", "3-3", "유압회로 결함 추적", 193, null),

  unit("1503010215", "1-1", "공기압 요소 사양 선정 및 결과물 정리", 3, 40),
  unit("1503010215", "1-2", "제어 방법 설계", 41, 54),
  unit("1503010215", "2-1", "회로도 작성", 55, 112),
  unit("1503010215", "2-2", "공기압제어 회로 구성", 113, 140),
  unit("1503010215", "3-1", "부하의 운동 특성에 따른 조정 및 시운전", 141, 162),
  unit("1503010215", "3-2", "공기압기기 이상 유무 파악", 163, null),

  unit("1503010204", "1-1", "적합한 센서의 선정", 3, 44),
  unit("1503010204", "2-1", "센싱을 위한 회로 구성", 45, 67),
  unit("1503010204", "3-1", "센서의 종류별 특성", 68, 97),
  unit("1503010204", "3-2", "센서 활용을 위한 전기회로 설계", 98, 110),
  unit("1503010204", "4-1", "센서의 점검 및 관리", 111, null),

  unit("1503010201", "1-1", "기계시스템 사양서 및 사용자 요구사항 분석", 3, 18),
  unit("1503010201", "1-2", "운영환경 및 관련요구사항 분석", 19, 36),
  unit("1503010201", "2-1", "기계시스템 작동방법 및 공정 분석", 37, 48),
  unit("1503010201", "2-2", "조작자 중심의 제어방안 확보", 49, 70),
  unit("1503010201", "3-1", "기계 구성요소를 그룹화하고 모델링", 71, null),

  unit("1503010122", "1-1", "안전기준 확인과 보완", 3, 18),
  unit("1503010122", "2-1", "안전보호 장구 착용과 안전기준에 따른 작업 수행", 19, 27),
  unit("1503010122", "2-2", "안전기준 준수 사항 적용과 안전사고 예방 활동", 28, null),

  unit("1503010120", "1-1", "조립 계획 수립", 3, 13),
  unit("1503010120", "1-2", "조립 치공구 활용", 14, 22),
  unit("1503010120", "2-1", "구동 부품 검사", 23, 28),
  unit("1503010120", "2-2", "구동 장치 기능 및 부품 조립", 29, 41),
  unit("1503010120", "3-1", "구동 장치 조립 상태 확인 및 검사", 42, 47),
  unit("1503010120", "3-2", "구동 장치 동작 상태 검사", 48, null),

  unit("1601050111", "1-1", "용접부 온도 관리", 3, 30),
  unit("1601050111", "2-1", "아래보기 자세 용접", 31, 67),
  unit("1601050111", "3-1", "수직 자세 용접", 68, 82),
  unit("1601050111", "4-1", "수평 자세 용접", 83, 97),
  unit("1601050111", "5-1", "위보기 자세 용접", 98, null),
];

const candidate = (
  value: Omit<
    PracticalNcsCandidate,
    "sourceStatus" | "publicationStatus" | "holdReason"
  > & { holdReason?: string },
): PracticalNcsCandidate => ({
  ...value,
  sourceStatus: "ncs_text_extracted",
  publicationStatus: "editorial_hold",
  holdReason:
    value.holdReason ??
    "NCS 원문에서 학습 재료는 확인했지만 동일한 복원문제 원문·공식 답안이 없어 예상형 후보로만 유지한다.",
});

/**
 * 현재 생성 개념의 NCS 출처를 61개 단위에 투영했을 때 직접 참조가 없던
 * 단위를 채우는 목록이다. 아래 캡슐은 전 범위 누락 방지용 후보이며 자동 발행하지 않는다.
 */
export const PRACTICAL_NCS_UNIT_CANDIDATES: PracticalNcsCandidate[] = [
  candidate({
    id: "NCS-CAND-MEASURE-SELECT",
    ncsCode: "1502010504",
    unitId: "2-1",
    title: "측정 대상과 공차에 맞는 측정기 선정",
    priority: "B",
    memoryCapsule:
      "측정기는 대상의 형상·측정범위·허용공차·재질·수량·환경을 먼저 확인하고, 필요한 분해능과 접촉 여부에 맞춰 선정한다. 정반·V블록·스탠드·게이지블록 같은 보조기구도 측정 자세와 기준면에 맞춰 함께 고른다.",
    requiredKeywords: ["형상", "측정범위", "허용공차", "분해능", "재질", "보조기구"],
    questionFormats: ["matching", "diagnosis", "definition"],
    predictedPromptSeeds: [
      "외경·내경·높이·원주흔들림 측정에 알맞은 측정기와 보조기구를 연결하시오.",
      "연질 공작물과 대량 반복검사에서 측정기 선정 기준이 달라지는 이유를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-014", "PCON-024", "PCON-031", "PCON-037"],
  }),
  candidate({
    id: "NCS-CAND-DRAWING-REVISION",
    ncsCode: "1502010511",
    unitId: "1-2",
    title: "도면 개정과 최신본 확인",
    priority: "B",
    memoryCapsule:
      "설계변경 시 개정번호·개정사유·개정부위를 확인하고 승인·통보 이력을 추적한다. 작업지시서, 검사기준서와 도면의 개정상태가 일치하는 최신본인지 확인한 뒤 작업한다.",
    requiredKeywords: ["개정번호", "개정사유", "개정부위", "승인", "통보", "최신본"],
    questionFormats: ["sequence", "diagnosis", "definition"],
    predictedPromptSeeds: [
      "도면 개정 시 확인해야 할 항목과 관련 부서 통보 순서를 쓰시오.",
      "작업지시서와 도면의 개정번호가 다를 때 우선 조치할 내용을 쓰시오.",
    ],
    neighborConceptIds: ["PCON-019", "PCON-SUP-024"],
  }),
  candidate({
    id: "NCS-CAND-DRAWING-MEASUREMENT-ELEMENTS",
    ncsCode: "1502010511",
    unitId: "3-1",
    title: "도면에서 측정요소와 부품특성 찾기",
    priority: "B",
    memoryCapsule:
      "작업지시서와 도면에서 데이텀, 개별·일반공차, 측정치수, 재질·표면처리·주기사항을 확인해 측정요소를 정한다. 데이텀 기준과 부품 특성을 빠뜨리면 같은 치수라도 측정방법이 달라질 수 있다.",
    requiredKeywords: ["데이텀", "개별공차", "일반공차", "측정치수", "재질", "주기사항"],
    questionFormats: ["drawing", "matching", "diagnosis"],
    predictedPromptSeeds: [
      "도면에서 측정 전 확인해야 할 데이텀·공차·부품 특성을 쓰시오.",
      "일반공차와 개별공차가 함께 표시된 도면의 적용 우선순위를 설명하시오.",
    ],
    neighborConceptIds: ["PCON-019", "PCON-SUP-024"],
  }),
  candidate({
    id: "NCS-CAND-BRAKE-CHARACTERISTICS",
    ncsCode: "1505010108",
    unitId: "4-1",
    title: "브레이크 종류와 제동원리",
    priority: "B",
    memoryCapsule:
      "포지티브 브레이크는 작동시켜 제동하고, 네거티브 브레이크는 무동력·중립 상태에서 제동되며 작동 신호로 해제된다. 디스크·드럼 브레이크는 마찰을 이용하고, 유압식은 파스칼 원리로 조작력을 전달한다.",
    requiredKeywords: ["포지티브", "네거티브", "디스크", "드럼", "마찰", "유압"],
    questionFormats: ["image", "matching", "definition", "diagnosis"],
    predictedPromptSeeds: [
      "포지티브 브레이크와 네거티브 브레이크의 무동력 상태를 비교하시오.",
      "디스크식과 드럼식 브레이크의 구성품과 제동 접촉부를 연결하시오.",
    ],
    neighborConceptIds: ["PCON-015", "PCON-026", "PCON-SUP-030"],
  }),
  candidate({
    id: "NCS-CAND-WELD-DEFECT-ESTIMATION",
    ncsCode: "1601050108",
    unitId: "1-2",
    title: "용접 중 결함 원인과 예방",
    priority: "B",
    memoryCapsule:
      "기공·피트는 오염·습기·용접봉 건조불량·긴 아크·부적정 속도와 연결되고, 슬래그 혼입은 층간 청소불량·전류과소·운봉과 봉각도 불량과 연결된다. 원인에 맞춰 청소·건조·적정 전류·아크길이·운봉을 조정한다.",
    requiredKeywords: ["기공", "슬래그 혼입", "청소", "용접봉 건조", "적정 전류", "운봉"],
    questionFormats: ["diagnosis", "matching", "definition"],
    predictedPromptSeeds: [
      "기공과 슬래그 혼입의 원인 및 예방대책을 각각 쓰시오.",
      "용접 결함 사진과 발생원인·조치방법을 연결하시오.",
    ],
    neighborConceptIds: ["PCON-043", "PCON-044", "PCON-046"],
  }),
  candidate({
    id: "NCS-CAND-WELD-REPAIR",
    ncsCode: "1601050108",
    unitId: "3-1",
    title: "용접결함 제거와 보수용접",
    priority: "B",
    memoryCapsule:
      "보수용접은 안전·청결·작업공간 확보 → 결함 위치 확인 → 가우징·연삭 등으로 결함 제거 → WPS와 재질에 맞는 예열·보수용접 → 후열·세척·검사 순으로 진행한다. 균열은 끝단 진행을 막는 조치 후 완전히 제거한다.",
    requiredKeywords: ["결함 확인", "가우징", "결함 제거", "WPS", "보수용접", "후검사"],
    questionFormats: ["sequence", "diagnosis", "definition"],
    predictedPromptSeeds: [
      "용접결함부 보수용접의 작업순서를 쓰시오.",
      "균열·언더컷·슬래그 혼입의 보수 전 제거방법을 구분하시오.",
    ],
    neighborConceptIds: ["PCON-043", "PCON-044", "PCON-045", "PCON-046"],
    holdReason:
      "보수 원리는 NCS에서 확인했지만 예열·후열 수치는 재질·두께·WPS에 종속되므로 수치형 답안은 별도 근거 확인 전 발행하지 않는다.",
  }),
  candidate({
    id: "NCS-CAND-WELD-NDT",
    ncsCode: "1601050108",
    unitId: "3-2",
    title: "보수용접 후 비파괴검사 선택",
    priority: "B",
    memoryCapsule:
      "표면 결함은 육안검사(VT)·침투탐상(PT)·자분탐상(MT), 내부 결함은 방사선투과(RT)·초음파탐상(UT)을 중심으로 확인한다. 재질, 예상 결함 위치와 형상에 따라 방법을 선택하고 보수 완료 여부를 판정한다.",
    requiredKeywords: ["VT", "PT", "MT", "RT", "UT", "표면·내부 결함"],
    questionFormats: ["matching", "definition", "diagnosis", "sequence"],
    predictedPromptSeeds: [
      "표면 결함과 내부 결함에 알맞은 비파괴검사법을 연결하시오.",
      "침투탐상검사의 전처리부터 관찰까지 기본 순서를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-043", "PCON-044", "PCON-045"],
  }),
  candidate({
    id: "NCS-CAND-HYDRAULIC-VALVE-SELECTION",
    ncsCode: "1503010216",
    unitId: "1-2",
    title: "유압제어밸브 기능별 선정",
    priority: "B",
    memoryCapsule:
      "유압밸브는 압력·방향·유량 제어로 나누고, 회로의 요구압력·유량·작동방향·부하조건에 맞춰 선정한다. 릴리프는 최고압 제한, 감압은 분기압 저감, 방향제어는 유로 전환, 유량제어는 속도 조절에 사용한다.",
    requiredKeywords: ["압력제어", "방향제어", "유량제어", "릴리프", "감압", "속도"],
    questionFormats: ["symbol", "matching", "diagnosis"],
    predictedPromptSeeds: [
      "릴리프·감압·시퀀스·유량제어밸브의 기능을 연결하시오.",
      "실린더 속도와 최고압력을 각각 조정할 밸브를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-008", "PCON-025", "PCON-040", "PCON-SUP-007"],
  }),
  candidate({
    id: "NCS-CAND-ELECTROHYDRAULIC-CIRCUIT",
    ncsCode: "1503010216",
    unitId: "2-2",
    title: "전기유압 논리회로 구성",
    priority: "B",
    memoryCapsule:
      "전기유압 회로는 입력스위치·센서 → 릴레이 논리·인터록 → 솔레노이드 출력 → 방향제어밸브·액추에이터 순으로 읽는다. 전원을 차단한 상태에서 배선·배관하고 AND·OR 조건과 접점상태를 확인한 뒤 시험한다.",
    requiredKeywords: ["입력", "릴레이", "인터록", "솔레노이드", "AND·OR", "전원차단"],
    questionFormats: ["symbol", "sequence", "diagnosis", "matching"],
    predictedPromptSeeds: [
      "전기유압 회로에서 입력·논리·출력 요소를 구분하시오.",
      "두 스위치가 모두 눌려야 작동하는 회로의 논리와 배선 원칙을 쓰시오.",
    ],
    neighborConceptIds: ["PCON-040", "PCON-SUP-009", "PCON-SUP-010"],
  }),
  candidate({
    id: "NCS-CAND-HYDRAULIC-SYSTEM-BUILD",
    ncsCode: "1503010216",
    unitId: "3-1",
    title: "유압시스템 구축 4단계",
    priority: "C",
    memoryCapsule:
      "유압시스템 구축은 요구기능·힘·압력·속도 확인 → 동작선도·회로도·부품목록 작성 → 안전수칙과 정해진 순서에 따른 설치 → 오일량·회전방향·밸브 초기값을 확인한 저압 시험운전 순으로 진행한다.",
    requiredKeywords: ["요구기능", "회로도", "부품목록", "설치", "초기값", "저압 시험"],
    questionFormats: ["sequence", "diagnosis"],
    predictedPromptSeeds: [
      "유압시스템을 구축하는 네 단계를 순서대로 쓰시오.",
      "최초 기동 전 확인해야 할 오일·전동기·밸브 조건을 쓰시오.",
    ],
    neighborConceptIds: ["PCON-040", "PCON-SUP-006", "PCON-SUP-007"],
  }),
  candidate({
    id: "NCS-CAND-HYDRAULIC-AUXILIARY-CONTROLS",
    ncsCode: "1503010216",
    unitId: "3-2",
    title: "유압 부가조건과 안전제어",
    priority: "B",
    memoryCapsule:
      "기본 1사이클 회로에 메인·시동·리셋·자동/수동·단속/연속·정지·비상정지 조건을 추가한다. 비상정지 동작은 장치와 에너지 특성에 맞게 위험을 키우지 않는 정지상태를 만들도록 설계·검증한다.",
    requiredKeywords: ["메인", "시동", "리셋", "자동·수동", "단속·연속", "비상정지"],
    questionFormats: ["matching", "sequence", "diagnosis"],
    predictedPromptSeeds: [
      "시동·리셋·정지·비상정지 스위치의 역할을 연결하시오.",
      "단속/연속 및 자동/수동 선택회로의 목적을 설명하시오.",
    ],
    neighborConceptIds: ["PCON-SUP-009", "PCON-SUP-010", "PCON-SUP-034"],
  }),
  candidate({
    id: "NCS-CAND-PNEUMATIC-LOGIC",
    ncsCode: "1503010215",
    unitId: "1-2",
    title: "공압 논리와 제어방식",
    priority: "B",
    memoryCapsule:
      "3/2밸브의 정상닫힘·정상열림은 YES·NOT 기능에 대응하고, 2압밸브는 두 입력이 모두 있어야 출력되는 AND, 셔틀밸브는 어느 한 입력으로 출력되는 OR 기능을 만든다.",
    requiredKeywords: ["3/2밸브", "YES·NOT", "2압밸브", "AND", "셔틀밸브", "OR"],
    questionFormats: ["symbol", "matching", "definition"],
    predictedPromptSeeds: [
      "2압밸브와 셔틀밸브의 논리기능을 쓰시오.",
      "YES·NOT·AND·OR 기능에 대응하는 공압밸브를 연결하시오.",
    ],
    neighborConceptIds: ["PCON-SUP-005", "PCON-SUP-037", "PCON-SUP-038"],
  }),
  candidate({
    id: "NCS-CAND-PNEUMATIC-CIRCUIT-ASSEMBLY",
    ncsCode: "1503010215",
    unitId: "2-2",
    title: "공압회로 부품선정·배관·배선",
    priority: "B",
    memoryCapsule:
      "회로도에서 공압부품과 전기제어부품의 명칭·수량·규격을 목록화하고 간섭이 없게 배치한다. 공급을 차단한 상태에서 보통 배관 후 배선하며, 피팅·호스경로·소음기·가동부 여유와 누설·단락을 확인한 뒤 시험한다.",
    requiredKeywords: ["부품목록", "배치", "배관", "배선", "누설", "간섭"],
    questionFormats: ["sequence", "drawing", "diagnosis"],
    predictedPromptSeeds: [
      "공압제어 회로 구성의 준비·배관·배선·시험 순서를 쓰시오.",
      "회로도에는 생략되기 쉬우나 실제 구성에 필요한 부속품을 쓰시오.",
    ],
    neighborConceptIds: ["PCON-SUP-005", "PCON-SUP-037", "PCON-SUP-038"],
  }),
  candidate({
    id: "NCS-CAND-PNEUMATIC-COMMISSIONING",
    ncsCode: "1503010215",
    unitId: "3-1",
    title: "공압 부하특성 조정과 시운전",
    priority: "B",
    memoryCapsule:
      "시운전은 초기위치와 안전구간을 확인하고 낮은 압력·충분히 열린 유량조건에서 시작한다. 압력은 힘, 유량은 속도에 주로 영향을 주므로 부하 움직임을 보며 압력·유량·쿠션을 단계적으로 조정하고 결과를 기록한다.",
    requiredKeywords: ["초기위치", "저압 시작", "압력-힘", "유량-속도", "쿠션", "기록"],
    questionFormats: ["sequence", "diagnosis", "definition"],
    predictedPromptSeeds: [
      "공압 실린더 시운전 시 압력·유량·쿠션을 조정하는 순서를 쓰시오.",
      "실린더 힘 부족과 속도 저하의 점검 항목을 구분하시오.",
    ],
    neighborConceptIds: ["PCON-041", "PCON-042", "PCON-SUP-003", "PCON-SUP-004"],
  }),
  candidate({
    id: "NCS-CAND-PNEUMATIC-TROUBLESHOOTING",
    ncsCode: "1503010215",
    unitId: "3-2",
    title: "공압 이상 원인 추적",
    priority: "B",
    memoryCapsule:
      "공급압·유량·누설을 먼저 확인하고 입력센서 → 릴레이·논리 → 솔레노이드·밸브 → 액추에이터 순으로 신호를 추적한다. 한 번에 하나의 원인만 점검·조치하고 결과를 재확인한다.",
    requiredKeywords: ["압력", "유량", "누설", "입력", "제어", "출력"],
    questionFormats: ["diagnosis", "sequence", "matching"],
    predictedPromptSeeds: [
      "공압 실린더가 움직이지 않을 때 공급부부터 출력부까지 점검순서를 쓰시오.",
      "압력과 유량이 각각 과대·과소일 때 나타나는 현상을 연결하시오.",
    ],
    neighborConceptIds: ["PCON-041", "PCON-042", "PCON-SUP-003", "PCON-SUP-005"],
  }),
  candidate({
    id: "NCS-CAND-SENSOR-RELAY-CIRCUIT",
    ncsCode: "1503010204",
    unitId: "3-2",
    title: "센서 출력과 릴레이제어 회로",
    priority: "B",
    memoryCapsule:
      "센서 신호는 접점·릴레이 논리를 거쳐 솔레노이드와 액추에이터를 구동한다. N/O·N/C 접점, 센서 출력형식과 전원조건을 확인하고 변위-단계선도의 동작순서와 실제 입출력을 대조한다.",
    requiredKeywords: ["센서 신호", "N/O·N/C", "릴레이", "솔레노이드", "입출력", "변위-단계선도"],
    questionFormats: ["symbol", "drawing", "sequence", "diagnosis"],
    predictedPromptSeeds: [
      "센서·릴레이·솔레노이드가 연결된 제어 신호 흐름을 쓰시오.",
      "N/O와 N/C 접점을 회로 동작조건에 맞게 구분하시오.",
    ],
    neighborConceptIds: ["PCON-003", "PCON-011", "PCON-SUP-011", "PCON-SUP-040"],
  }),
  candidate({
    id: "NCS-CAND-SENSOR-MAINTENANCE",
    ncsCode: "1503010204",
    unitId: "4-1",
    title: "센서 점검과 이상조치",
    priority: "B",
    memoryCapsule:
      "센서는 설치상태·검출거리·검출물·오염·케이블·전원·출력신호를 주기적으로 확인한다. 충격과 과도한 체결력을 피하고 동력선·고압선과 배선을 분리하며, 이상 시 입력과 출력의 변화를 순서대로 확인한다.",
    requiredKeywords: ["설치상태", "검출거리", "오염", "케이블", "전원", "출력신호"],
    questionFormats: ["diagnosis", "sequence", "matching"],
    predictedPromptSeeds: [
      "근접센서가 불규칙하게 동작할 때 점검 항목을 쓰시오.",
      "센서 배선 시 동력선과 분리해야 하는 이유를 설명하시오.",
    ],
    neighborConceptIds: ["PCON-003", "PCON-011", "PCON-SUP-012", "PCON-SUP-013"],
  }),
  candidate({
    id: "NCS-CAND-SYSTEM-GROUPING",
    ncsCode: "1503010201",
    unitId: "3-1",
    title: "기계시스템 구성요소 그룹화",
    priority: "C",
    memoryCapsule:
      "기계시스템을 구조물·구동부·액추에이터·센서·제어기·에너지공급부로 나누고 공정 또는 기능·에너지원별로 그룹화한다. 그룹별 정격·제어방식·연결관계를 목록화하면 모델링과 부품선정의 기준이 된다.",
    requiredKeywords: ["구조물", "구동부", "액추에이터", "센서", "제어기", "그룹화"],
    questionFormats: ["matching", "drawing", "definition"],
    predictedPromptSeeds: [
      "자동화 설비의 구성요소를 기능별로 그룹화하시오.",
      "공정별 부품목록에 포함해야 할 사양 항목을 쓰시오.",
    ],
    neighborConceptIds: ["PCON-SUP-001", "PCON-SUP-015", "PCON-SUP-036"],
  }),
  candidate({
    id: "NCS-CAND-PPE-SELECTION",
    ncsCode: "1503010122",
    unitId: "2-1",
    title: "위험요인별 보호구 선정과 착용",
    priority: "B",
    memoryCapsule:
      "보호구는 비산·분진·유해가스·소음·감전·낙하·용접광 등 위험요인에 맞춰 선정하고, 사용 전 손상·유효상태·밀착을 확인한 뒤 위험 노출 전에 착용한다. 보호구만으로 위험을 제거했다고 보지 않는다.",
    requiredKeywords: ["위험요인", "보호구 선정", "사용 전 점검", "밀착", "노출 전 착용", "공학적 대책"],
    questionFormats: ["image", "matching", "diagnosis"],
    predictedPromptSeeds: [
      "작업별 위험요인과 필요한 보호구를 연결하시오.",
      "호흡보호구 사용 전 확인해야 할 사항을 쓰시오.",
    ],
    neighborConceptIds: ["PCON-009", "PCON-016", "PCON-017", "PCON-SUP-043"],
    holdReason:
      "보호구 선정 원칙만 사용하며 법정 수치·등급·교체주기는 최신 법령과 제조사 조건 확인 전 발행하지 않는다.",
  }),
  candidate({
    id: "NCS-CAND-SAFETY-PREVENTION",
    ncsCode: "1503010122",
    unitId: "2-2",
    title: "작업 전 안전점검과 사고예방",
    priority: "B",
    memoryCapsule:
      "작업 전 위험요인과 에너지원·통로·방호장치·표지·비상연락을 확인하고, 작업 중 기준 준수 여부를 점검한다. 이상은 즉시 작업을 멈추고 격리·보고·시정한 뒤 재발방지 기록을 남긴다.",
    requiredKeywords: ["위험요인", "에너지원", "방호장치", "작업중지", "격리·보고", "재발방지"],
    questionFormats: ["sequence", "diagnosis", "matching"],
    predictedPromptSeeds: [
      "기계조립 작업 전 안전점검 항목을 쓰시오.",
      "이상 발견부터 작업 재개까지의 조치 순서를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-009", "PCON-016", "PCON-017", "PCON-043"],
    holdReason:
      "일반 안전원칙만 사용하며 재해보고 기한 등 법령 수치는 현행 공식 근거 재검증 전 문제화하지 않는다.",
  }),
  candidate({
    id: "NCS-CAND-JIG-FIXTURE",
    ncsCode: "1503010120",
    unitId: "1-2",
    title: "지그와 고정구의 기능",
    priority: "B",
    memoryCapsule:
      "지그는 공작물을 위치·고정하면서 부시 등으로 공구를 안내하고, 고정구는 공작물을 위치·고정하지만 공구를 직접 안내하지 않는다. 위치결정·지지·클램핑·공구 및 작업공간 간섭을 함께 확인한다.",
    requiredKeywords: ["지그", "고정구", "공구 안내", "위치결정", "지지", "클램핑"],
    questionFormats: ["image", "definition", "matching"],
    predictedPromptSeeds: [
      "지그와 고정구의 차이를 공구 안내 여부로 설명하시오.",
      "치공구의 기본 기능 세 가지를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-SUP-031"],
  }),
  candidate({
    id: "NCS-CAND-DRIVE-PART-INSPECTION",
    ncsCode: "1503010120",
    unitId: "2-1",
    title: "구동부품 도면검사",
    priority: "B",
    memoryCapsule:
      "구동부품은 도면의 치수공차·기하공차·표면거칠기·끼워맞춤 요구를 확인하고 알맞은 측정기와 보조구로 측정한다. 측정값을 검사기준과 비교해 합부를 판정하고 기록한다.",
    requiredKeywords: ["치수공차", "기하공차", "표면거칠기", "끼워맞춤", "측정기", "합부판정"],
    questionFormats: ["drawing", "matching", "sequence", "diagnosis"],
    predictedPromptSeeds: [
      "축과 베어링 끼워맞춤부 검사에 필요한 도면정보와 측정기를 쓰시오.",
      "측정값으로 구동부품의 합부를 판정하는 순서를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-001", "PCON-007", "PCON-013", "PCON-SUP-028"],
  }),
  candidate({
    id: "NCS-CAND-ASSEMBLY-STATE",
    ncsCode: "1503010120",
    unitId: "3-1",
    title: "구동장치 조립상태 검사",
    priority: "B",
    memoryCapsule:
      "시운전 전 부품 방향·청결·끼워맞춤·베어링 압입부·체결과 풀림방지·간극·축정렬·윤활상태를 조립도와 공정순서에 맞춰 확인하고 검사값을 기록한다.",
    requiredKeywords: ["조립도", "청결", "끼워맞춤", "체결", "간극", "축정렬"],
    questionFormats: ["sequence", "diagnosis", "matching"],
    predictedPromptSeeds: [
      "구동장치 시운전 전 조립상태 점검 항목을 쓰시오.",
      "베어링 조립 시 전동체에 하중이 전달되지 않게 하는 원칙을 설명하시오.",
    ],
    neighborConceptIds: ["PCON-001", "PCON-004", "PCON-006", "PCON-013"],
  }),
  candidate({
    id: "NCS-CAND-DYNAMIC-CHECK",
    ncsCode: "1503010120",
    unitId: "3-2",
    title: "구동장치 동작상태 시운전",
    priority: "B",
    memoryCapsule:
      "동작검사는 무부하·저속에서 시작해 회전방향, 이상음, 진동, 온도, 누설, 전류와 체결상태를 확인하고 기준값과 비교한다. 이상이 있으면 정지·에너지차단 후 원인을 수정하고 같은 조건으로 재시험한다.",
    requiredKeywords: ["무부하·저속", "회전방향", "이상음·진동", "온도", "정지·차단", "재시험"],
    questionFormats: ["sequence", "diagnosis"],
    predictedPromptSeeds: [
      "구동장치 최초 시운전의 점검순서를 쓰시오.",
      "시운전 중 진동과 발열이 증가할 때 우선 조치를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-001", "PCON-007", "PCON-013", "PCON-036"],
  }),
  candidate({
    id: "NCS-CAND-WELD-VERTICAL",
    ncsCode: "1601050111",
    unitId: "3-1",
    title: "수직 자세 맞대기용접",
    priority: "C",
    memoryCapsule:
      "수직 자세는 WPS에서 모재·이음형상·용접봉·전원·극성·패스와 전후처리를 확인하고 용융지가 처지지 않도록 아크길이·봉각도·운봉·속도를 조절한다. 구체 전류·온도는 WPS 조건을 따른다.",
    requiredKeywords: ["수직 자세", "WPS", "아크길이", "봉각도", "운봉", "용융지"],
    questionFormats: ["definition", "sequence", "diagnosis"],
    predictedPromptSeeds: [
      "수직 자세 용접 전 WPS에서 확인할 항목을 쓰시오.",
      "수직 자세에서 용융지 처짐을 줄이는 조정요소를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-046", "PCON-SUP-019", "PCON-SUP-020"],
    holdReason:
      "자세별 원리만 유지하며 전류·예열·층간온도 수치는 모재·두께·용접봉·WPS 확인 전 발행하지 않는다.",
  }),
  candidate({
    id: "NCS-CAND-WELD-HORIZONTAL",
    ncsCode: "1601050111",
    unitId: "4-1",
    title: "수평 자세 맞대기용접",
    priority: "C",
    memoryCapsule:
      "수평 자세는 WPS의 이음·모재·용접재료·자세 기호를 확인하고 중력으로 용융금속이 아래쪽에 치우치지 않도록 봉각도·운봉폭·속도와 층간 청소를 관리한다.",
    requiredKeywords: ["수평 자세", "WPS", "봉각도", "운봉폭", "속도", "층간 청소"],
    questionFormats: ["definition", "sequence", "diagnosis"],
    predictedPromptSeeds: [
      "수평 자세 용접에서 비드 쏠림을 줄이는 조정요소를 쓰시오.",
      "WPS·PQR·WPQ의 역할을 구분하시오.",
    ],
    neighborConceptIds: ["PCON-046", "PCON-SUP-019", "PCON-SUP-020"],
    holdReason:
      "자세별 원리만 유지하며 전류·예열·층간온도 수치는 모재·두께·용접봉·WPS 확인 전 발행하지 않는다.",
  }),
  candidate({
    id: "NCS-CAND-WELD-OVERHEAD",
    ncsCode: "1601050111",
    unitId: "5-1",
    title: "위보기 자세 맞대기용접",
    priority: "C",
    memoryCapsule:
      "위보기 자세는 WPS와 자세기호를 확인하고 낙하·화상 위험을 통제한 뒤 짧은 아크와 과도하지 않은 용융지로 작업한다. 전원차단·절연·보호구와 상부 용융금속 낙하구역 통제가 특히 중요하다.",
    requiredKeywords: ["위보기 자세", "WPS", "짧은 아크", "용융지", "절연", "낙하구역 통제"],
    questionFormats: ["definition", "sequence", "diagnosis"],
    predictedPromptSeeds: [
      "위보기 자세 용접의 주요 위험과 보호조치를 쓰시오.",
      "위보기 자세에서 아크길이와 용융지 크기를 관리하는 이유를 쓰시오.",
    ],
    neighborConceptIds: ["PCON-046", "PCON-SUP-019", "PCON-SUP-020"],
    holdReason:
      "자세별 원리만 유지하며 전류·예열·층간온도 수치는 모재·두께·용접봉·WPS 확인 전 발행하지 않는다.",
  }),
];

const occurrenceQuestionIds = (year: number, round: number, count: number) =>
  Array.from(
    { length: count },
    (_, index) => `P-${year}-${round}-Q${String(index + 1).padStart(2, "0")}`,
  );

/**
 * 사용자가 제공한 네 URL 입력은 중복 URL 하나를 합쳐 3개 고유 출처로 기록한다.
 * 새 링크의 본문을 재현 가능하게 추출하기 전에는 기존 2026-2 문항과 합치거나
 * 새 회차로 추정하지 않는다.
 */
export const PRACTICAL_RESTORED_SOURCE_SWEEP: PracticalRestoredSourceSweepItem[] = [
  {
    id: "recall-source:moru:224275574425",
    url: "https://blog.naver.com/moru-1/224275574425",
    occurrence: { year: 2026, round: 1 },
    status: "mapped_existing",
    evidenceClass: "unverified_user_report",
    questionIds: occurrenceQuestionIds(2026, 1, 10),
    submissionCount: 1,
    note: "기존 2026년 1회 복원 10문항의 출처로 연결되어 있다.",
  },
  {
    id: "recall-source:bjs2236:224350755723",
    url: "https://blog.naver.com/bjs2236/224350755723",
    occurrence: { year: 2026, round: 2 },
    status: "mapped_existing",
    evidenceClass: "unverified_user_report",
    questionIds: occurrenceQuestionIds(2026, 2, 9),
    submissionCount: 1,
    note: "기존 2026년 2회 복원 9문항의 출처로 연결되어 있다.",
  },
  {
    id: "recall-source:moru:224367666966",
    url: "https://blog.naver.com/moru-1/224367666966",
    occurrence: null,
    status: "source_pending_extraction",
    evidenceClass: "unverified_user_report",
    questionIds: [],
    submissionCount: 2,
    note:
      "2026-08-10 사용자가 복원문제 출처로 두 번 제공했다. 본문·이미지·문항 배열을 재현 가능하게 확보하기 전에는 기존 회차의 보강 출처인지 신규 문항인지 추정하지 않는다.",
  },
];

export function findPracticalNcsUnit(ncsCode: string, printedPage: number) {
  return PRACTICAL_NCS_UNIT_REGISTRY.find(
    (item) =>
      item.ncsCode === ncsCode &&
      printedPage >= item.printedPageStart &&
      (item.printedPageEnd === null || printedPage <= item.printedPageEnd),
  );
}
