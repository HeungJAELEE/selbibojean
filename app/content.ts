import { subject1Enrichment } from "./enrichment/subject1";
import { subject2Enrichment } from "./enrichment/subject2";
import { subject3Enrichment } from "./enrichment/subject3";
import { subject4Enrichment } from "./enrichment/subject4";
import notionCatalogJson from "./generated/notion-catalog.json";

export type SourceType =
  | "NCS 원문"
  | "공식 기준"
  | "상세 해설"
  | "Notion 원문"
  | "비공식 수험자 복원"
  | "출제 예상·변형";

export type ReviewStatus = "검토 완료" | "확인 필요";

export type QuizType =
  | "single-choice"
  | "multiple-choice"
  | "calculation"
  | "short-answer"
  | "sequence"
  | "photo";

export interface QuizOption {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  type: QuizType;
  sourceType: SourceType;
  question: string;
  options: QuizOption[];
  answerId: string;
  explanation: string;
}

export interface DetailSection {
  title: string;
  body: string;
}

export interface ComparisonRow {
  label: string;
  value: string;
  note?: string;
}

export type TheoryContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level: number }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string }
  | { type: "callout"; text: string; icon?: string }
  | { type: "code"; text: string; language?: string }
  | { type: "table"; headers?: string[]; rows: string[][]; caption?: string }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      sourceUrl?: string;
      rightsStatus?: "cleared" | "unknown" | "link-only";
    }
  | { type: "divider" };

export interface NotionTopicPayload {
  schemaVersion: number;
  id: string;
  title: string;
  sourcePath: string;
  blocks: TheoryContentBlock[];
}

export interface Topic {
  id: string;
  title: string;
  summary30s: string;
  tags: string[];
  synonyms: string[];
  sourceType: SourceType;
  reviewStatus: ReviewStatus;
  reviewedAt: string;
  keyPoints?: string[];
  detailSections?: DetailSection[];
  comparisons?: ComparisonRow[];
  workSteps?: string[];
  examConnection?: string;
  commonTrap?: string;
  sourceNote?: string;
  quiz?: Quiz;
  kind?: "curated" | "notion-original";
  categoryPath?: string[];
  contentUrl?: string;
  plainTextExcerpt?: string;
  sourcePath?: string;
  sourceUrl?: string;
}

export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  title: string;
  shortTitle: string;
  chapters: Chapter[];
}

export interface IndexedTopic extends Topic {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterTitle: string;
}

export interface NotionCatalogStats {
  subjects: number;
  chapters: number;
  topics: number;
  headings: number;
  tables: number;
  images: number;
  textCharacters: number;
}

interface NotionCatalog {
  schemaVersion: number;
  generatedFrom: string[];
  generatedAt: string | null;
  subjects: Subject[];
  stats: NotionCatalogStats;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNotionCatalog(value: unknown): NotionCatalog {
  if (!isObjectRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.subjects)) {
    throw new Error("Invalid Notion catalog root");
  }
  if (!Array.isArray(value.generatedFrom) || !value.generatedFrom.every((item) => typeof item === "string")) {
    throw new Error("Invalid Notion catalog source metadata");
  }
  if (value.generatedFrom.some((item) => /(?:^[a-z]:\\|\/users\/|x-amz-|security-token)/i.test(item))) {
    throw new Error("Notion catalog exposes a local path or temporary credential");
  }
  if (!(value.generatedAt === null || typeof value.generatedAt === "string") || !isObjectRecord(value.stats)) {
    throw new Error("Invalid Notion catalog generation metadata");
  }

  const statKeys: Array<keyof NotionCatalogStats> = [
    "subjects",
    "chapters",
    "topics",
    "headings",
    "tables",
    "images",
    "textCharacters",
  ];
  if (!statKeys.every((key) => typeof value.stats[key] === "number" && Number.isInteger(value.stats[key]) && Number(value.stats[key]) >= 0)) {
    throw new Error("Invalid Notion catalog statistics");
  }

  let chapterCount = 0;
  let topicCount = 0;
  for (const subject of value.subjects) {
    if (!isObjectRecord(subject) || typeof subject.id !== "string" || typeof subject.title !== "string" ||
      typeof subject.shortTitle !== "string" || !Array.isArray(subject.chapters)) {
      throw new Error("Invalid Notion catalog subject");
    }
    chapterCount += subject.chapters.length;
    for (const chapter of subject.chapters) {
      if (!isObjectRecord(chapter) || typeof chapter.id !== "string" || typeof chapter.title !== "string" || !Array.isArray(chapter.topics)) {
        throw new Error("Invalid Notion catalog chapter");
      }
      topicCount += chapter.topics.length;
      for (const topic of chapter.topics) {
        if (!isObjectRecord(topic) || typeof topic.id !== "string" || typeof topic.title !== "string" ||
          typeof topic.summary30s !== "string") {
          throw new Error("Invalid Notion catalog topic");
        }
        if (topic.tags !== undefined && (!Array.isArray(topic.tags) || !topic.tags.every((item) => typeof item === "string"))) {
          throw new Error("Invalid Notion topic search metadata");
        }
        if (topic.synonyms !== undefined && (!Array.isArray(topic.synonyms) || !topic.synonyms.every((item) => typeof item === "string"))) {
          throw new Error("Invalid Notion topic synonym metadata");
        }
        if (topic.contentUrl !== undefined && (typeof topic.contentUrl !== "string" || !/^\/generated\/topics\/[a-z0-9._-]+\.json$/i.test(topic.contentUrl))) {
          throw new Error("Invalid Notion topic content URL");
        }
        if (topic.reviewedAt !== undefined && typeof topic.reviewedAt !== "string") {
          throw new Error("Invalid Notion topic review date");
        }
        if (topic.categoryPath !== undefined && (!Array.isArray(topic.categoryPath) || !topic.categoryPath.every((item) => typeof item === "string"))) {
          throw new Error("Invalid Notion topic category path");
        }
        if (typeof topic.sourcePath === "string" && /(?:^[a-z]:\\|\/users\/|x-amz-|security-token)/i.test(topic.sourcePath)) {
          throw new Error("Notion topic exposes a local path or temporary credential");
        }
      }
    }
  }

  if (topicCount !== Number(value.stats.topics) || chapterCount !== Number(value.stats.chapters) ||
    value.subjects.length !== Number(value.stats.subjects)) {
    throw new Error("Notion catalog statistics do not match its hierarchy");
  }
  return value as unknown as NotionCatalog;
}

const REVIEWED_AT = "2026-07-20";

function conciseTopic(
  id: string,
  title: string,
  summary30s: string,
  tags: string[],
  synonyms: string[] = [],
): Topic {
  return {
    id,
    title,
    summary30s,
    tags,
    synonyms,
    sourceType: "상세 해설",
    reviewStatus: "확인 필요",
    reviewedAt: REVIEWED_AT,
  };
}

const plcLadderBasic: Topic = {
  ...conciseTopic(
    "plc-ladder-basic",
    "PLC 래더 기본",
    "래더 프로그램은 좌우 전원선 사이에 입력 조건과 출력 코일을 배치해 제어논리를 표현한다. 접점의 직렬 연결은 AND, 병렬 연결은 OR 논리에 해당한다.",
    ["PLC", "래더", "시퀀스", "AND", "OR"],
    ["programmable logic controller", "ladder diagram", "LD", "래더도"],
  ),
  keyPoints: [
    "기본 스캔은 입력 읽기, 프로그램 연산, 출력 갱신의 순서로 반복된다.",
    "직렬 접점은 모든 조건이 참일 때, 병렬 접점은 하나 이상이 참일 때 도통된다.",
    "자기유지는 출력 보조접점을 시작 접점과 병렬로 연결해 운전 상태를 유지한다.",
  ],
  detailSections: [
    {
      title: "래더의 구성",
      body: "좌우 모선 사이의 한 줄을 런(rung)이라 한다. 입력 접점과 내부 비트 조건은 왼쪽에, 출력 코일·타이머·카운터 같은 명령은 오른쪽에 놓고 왼쪽에서 오른쪽, 위에서 아래로 논리를 해석한다.",
    },
    {
      title: "PLC 스캔",
      body: "PLC는 입력 이미지 테이블을 갱신한 뒤 프로그램을 순차 연산하고 결과를 출력 이미지에 반영한다. 따라서 같은 스캔 안에서도 명령 순서와 내부 비트 갱신 시점이 동작에 영향을 줄 수 있다.",
    },
    {
      title: "자기유지와 정지 우선",
      body: "운전 코일의 보조접점을 시작 접점과 병렬로 두면 시작 버튼에서 손을 떼어도 출력이 유지된다. 정지 조건과 보호 인터록은 운전 경로에 직렬로 배치하고, 실제 설비에서는 고장 시 안전한 상태가 되도록 회로를 검토한다.",
    },
  ],
  comparisons: [
    { label: "직렬 접점", value: "AND", note: "모든 조건이 참이어야 도통" },
    { label: "병렬 접점", value: "OR", note: "하나 이상의 조건이 참이면 도통" },
    { label: "b접점 명령", value: "NOT 검사", note: "지정 비트가 OFF일 때 논리 참" },
  ],
  workSteps: [
    "입·출력 주소표와 안전 조건을 먼저 확인한다.",
    "동작 순서를 조건식 또는 타임차트로 정리한다.",
    "래더를 작성하고 인터록·자기유지·정지 조건을 검토한다.",
    "강제 출력 없이 모니터링한 뒤 단계적으로 시운전한다.",
  ],
  examConnection:
    "직렬·병렬 논리 판별, 스캔 순서, 자기유지 회로와 인터록의 접점 상태가 자주 연결되어 출제된다.",
  commonTrap:
    "래더의 접점 기호를 실제 스위치의 물리적 NO·NC 상태와 무조건 동일하게 해석하면 안 된다. 접점 명령은 해당 비트의 상태를 검사한다.",
  sourceNote: "PLC 제조사별 명령 표기와 스캔 규칙을 공식 매뉴얼로 대조한 뒤 공개한다.",
  quiz: {
    id: "quiz-plc-ladder-basic-01",
    type: "single-choice",
    sourceType: "출제 예상·변형",
    question: "조건 A와 B가 모두 참일 때만 출력 Y가 켜지게 하는 래더 구성은?",
    options: [
      { id: "A", text: "A와 B의 a접점을 직렬로 연결한다." },
      { id: "B", text: "A와 B의 a접점을 병렬로 연결한다." },
      { id: "C", text: "출력 Y 코일 두 개를 병렬로 연결한다." },
      { id: "D", text: "A 접점 없이 B 접점만 연결한다." },
    ],
    answerId: "A",
    explanation:
      "두 접점을 직렬로 연결하면 A와 B가 모두 참인 경우에만 논리 경로가 성립하므로 AND 동작이 된다.",
  },
};

const weldingDefect: Topic = {
  ...conciseTopic(
    "welding-defect",
    "용접 결함",
    "용접 결함은 균열, 기공, 슬래그 혼입, 언더컷, 융합불량 등으로 구분한다. 결함의 위치와 형상을 확인한 뒤 용접조건, 모재 상태, 작업방법에서 원인을 찾아야 한다.",
    ["용접", "결함", "균열", "기공", "언더컷"],
    ["weld defect", "porosity", "undercut", "slag inclusion"],
  ),
  keyPoints: [
    "균열은 구조 건전성에 큰 영향을 줄 수 있으므로 승인된 절차에 따라 평가·제거·보수한다.",
    "기공은 수분·오염·보호가스 불량, 슬래그 혼입은 층간 청소 불량이나 부적절한 운봉과 관련될 수 있다.",
    "언더컷은 용접부 가장자리에 홈이 생긴 결함이며 과대한 전류, 긴 아크, 빠른 진행 등이 원인이 될 수 있다.",
  ],
  detailSections: [
    {
      title: "형상 결함",
      body: "언더컷은 비드 가장자리 모재가 파인 상태이고, 오버랩은 용착금속이 모재에 융합되지 않은 채 겹쳐진 상태다. 과대·과소 보강, 루트 오목과 용락도 형상과 허용기준을 함께 확인한다.",
    },
    {
      title: "내부 결함",
      body: "기공은 가스가 빠져나오지 못해 생긴 공동, 슬래그 혼입은 비금속 개재물이 갇힌 상태다. 융합불량과 용입불량은 각각 용접금속-모재의 융합 또는 이음 루트까지의 용입이 충분하지 않은 경우다.",
    },
    {
      title: "원인과 조치",
      body: "모재와 용접재료의 청결·건조 상태, 전류·전압·진행속도, 아크 길이, 보호가스 유량과 바람, 홈 형상과 층간 청소를 순서대로 확인한다. 보수 여부는 적용 규격과 승인 절차에 따라 결정한다.",
    },
  ],
  comparisons: [
    { label: "기공", value: "가스 공동", note: "오염·수분·가스 차폐 상태 확인" },
    { label: "슬래그 혼입", value: "비금속 개재물", note: "층간 청소·운봉 확인" },
    { label: "언더컷", value: "비드 토의 홈", note: "전류·아크 길이·속도 확인" },
    { label: "융합불량", value: "경계면 미융합", note: "입열·각도·홈 형상 확인" },
  ],
  workSteps: [
    "외관과 결함 위치·길이·방향을 기록한다.",
    "적용 기준에 맞는 비파괴검사로 범위를 확인한다.",
    "용접조건, 재료 상태, 작업기록에서 원인을 분석한다.",
    "승인된 절차로 제거·보수하고 재검사한다.",
  ],
  examConnection:
    "결함 사진이나 단면 형상을 보고 명칭을 고르거나, 결함별 발생 원인과 예방대책을 연결하는 문제가 대표적이다.",
  commonTrap:
    "비드 외관만 보고 내부 결함이 없다고 단정할 수 없다. 필요하면 적절한 비파괴검사를 적용해야 한다.",
  sourceNote: "적용 용접기준과 결함별 허용·판정기준을 확인한 뒤 공개한다.",
  quiz: {
    id: "quiz-welding-defect-01",
    type: "single-choice",
    sourceType: "출제 예상·변형",
    question: "용접 비드 가장자리의 모재가 파여 홈처럼 남는 결함은?",
    options: [
      { id: "A", text: "기공" },
      { id: "B", text: "언더컷" },
      { id: "C", text: "슬래그 혼입" },
      { id: "D", text: "융합불량" },
    ],
    answerId: "B",
    explanation: "언더컷은 용접 비드의 토(toe) 부근 모재가 파여 홈이 형성된 상태를 말한다.",
  },
};

const taperedRollerBearing: Topic = {
  ...conciseTopic(
    "tapered-roller-bearing",
    "테이퍼 롤러베어링",
    "원뿔형 궤도와 롤러로 반경하중과 한 방향 축하중을 함께 지지한다. 보통 두 개를 대향 배치해 양방향 축하중을 받고, 조립 시 내부간극이나 예압을 조정한다.",
    ["베어링", "구름베어링", "테이퍼 롤러", "예압", "내부간극"],
    ["tapered roller bearing", "원추 롤러베어링", "테이퍼 베어링"],
  ),
  keyPoints: [
    "내륜·롤러 조립체와 외륜을 분리할 수 있어 설치와 점검이 비교적 쉽다.",
    "내부간극과 예압은 회전 정밀도, 발열, 소음, 수명에 직접 영향을 준다.",
    "압입력은 끼워맞춤되는 궤도륜에만 가하고 롤러를 통해 전달하지 않는다.",
  ],
  detailSections: [
    {
      title: "구조와 하중",
      body: "내륜·외륜 궤도와 롤러가 원뿔의 꼭짓점 방향으로 만나도록 설계되어 반경하중과 축하중을 동시에 받는다. 단열형은 한 방향 축하중을 받으므로 보통 정면 또는 배면 조합으로 사용한다.",
    },
    {
      title: "끼워맞춤과 장착",
      body: "회전하중을 받는 궤도륜에는 일반적으로 억지 끼워맞춤을 적용한다. 압입 시 힘은 끼워맞춤되는 궤도륜에 직접 가하고, 가열 장착은 온도와 시간을 관리해 재료·윤활제·실을 손상시키지 않도록 한다.",
    },
    {
      title: "간극과 예압",
      body: "간극이 지나치면 진동과 정밀도 저하가 생길 수 있고 예압이 지나치면 마찰·온도와 손상 위험이 증가한다. 제조사 절차에 따라 엔드플레이, 회전 토크 또는 너트 조임량으로 조정한다.",
    },
  ],
  comparisons: [
    { label: "단열형", value: "한 방향 축하중", note: "대향 배치로 양방향 대응" },
    { label: "간극 과다", value: "진동·소음 증가", note: "정밀도와 하중분포 악화" },
    { label: "예압 과다", value: "발열·수명 저하", note: "회전 토크 상승" },
  ],
  workSteps: [
    "축·하우징의 손상, 치수, 모서리와 청결 상태를 확인한다.",
    "지정된 끼워맞춤과 장착 방향에 맞춰 궤도륜에만 힘을 가한다.",
    "제조사 기준으로 내부간극 또는 예압을 조정한다.",
    "윤활 후 손회전, 회전 토크, 온도와 소음을 확인한다.",
  ],
  examConnection:
    "하중 방향에 따른 배치, 압입력을 가하는 위치, 가열 장착, 내부간극과 예압의 영향을 묻는 작업순서·사진판별 문제로 연결된다.",
  commonTrap:
    "예압은 클수록 좋다는 설명은 틀리다. 과도한 예압은 발열과 조기 손상을 유발한다.",
  sourceNote: "NCS 및 베어링 제조사의 장착·간극 기준과 대조한 뒤 공개한다.",
  quiz: {
    id: "quiz-tapered-roller-bearing-01",
    type: "single-choice",
    sourceType: "출제 예상·변형",
    question: "축에 베어링 내륜을 억지 끼워맞춤할 때 압입력을 가해야 하는 곳은?",
    options: [
      { id: "A", text: "내륜" },
      { id: "B", text: "외륜" },
      { id: "C", text: "롤러" },
      { id: "D", text: "케이지" },
    ],
    answerId: "A",
    explanation:
      "축과 억지 끼워맞춤되는 내륜에 직접 힘을 가해야 한다. 외륜에 힘을 가하면 하중이 롤러와 궤도면을 통과해 손상을 일으킬 수 있다.",
  },
};

const vibrationDiagnosis: Topic = {
  ...conciseTopic(
    "vibration-diagnosis",
    "진동 진단",
    "진동 진단은 진폭, 주파수, 위상과 시간에 따른 추세를 함께 분석해 고장 징후를 찾는 방법이다. 회전속도 성분과 고조파, 베어링 결함주파수를 설비 조건과 연결해 판단한다.",
    ["진동", "설비진단", "1X", "위상", "추세"],
    ["vibration diagnosis", "condition monitoring", "진동 분석"],
  ),
  keyPoints: [
    "불평형은 흔히 회전속도와 같은 1X 성분이 반경 방향에서 크게 나타난다.",
    "정렬불량은 1X·2X 성분과 축 방향 진동이 동반될 수 있지만 스펙트럼 하나만으로 확정할 수 없다.",
    "동일 측정 위치·방향·부하에서 수집한 추세 데이터가 단일 측정값보다 신뢰도가 높다.",
  ],
  detailSections: [
    {
      title: "측정량과 센서",
      body: "변위는 저주파·축 거동, 속도는 설비의 전반적인 진동 상태, 가속도는 고주파 충격 감시에 주로 활용한다. 센서 부착 방식과 측정 방향, 샘플링 조건은 데이터 품질을 좌우한다.",
    },
    {
      title: "스펙트럼 해석",
      body: "시간파형을 FFT로 변환하면 회전주파수 1X와 고조파, 기어 맞물림, 베어링 결함 관련 성분을 분리해 볼 수 있다. 피크의 위치뿐 아니라 진폭·측정방향·위상·측파대와 운전조건을 함께 본다.",
    },
    {
      title: "추세와 판정",
      body: "경보치는 설비 종류와 측정량, 위치, 운전조건에 맞게 설정한다. 동일 조건의 기준값과 변화율을 비교하고 온도·윤활·정렬·소음 등 다른 점검 결과로 교차 확인한다.",
    },
  ],
  comparisons: [
    { label: "불평형", value: "주로 반경 방향 1X", note: "위상과 운전조건으로 확인" },
    { label: "정렬불량", value: "1X·2X 및 축 방향", note: "결합기 형상에 따라 달라짐" },
    { label: "기계적 풀림", value: "다수 고조파 가능", note: "체결·기초 상태 확인" },
  ],
  workSteps: [
    "설비 속도·부하와 측정 위치·방향을 기록한다.",
    "센서를 일관된 방식으로 부착해 시간파형과 스펙트럼을 수집한다.",
    "기준값·추세·주파수 성분·위상을 비교한다.",
    "의심 원인을 다른 점검 결과로 확인하고 조치 후 재측정한다.",
  ],
  examConnection:
    "1X·2X 성분과 불평형·정렬불량을 연결하거나 변위·속도·가속도의 적용 범위를 비교하는 유형으로 출제된다.",
  commonTrap:
    "가장 큰 피크를 곧바로 고장 원인으로 확정하면 안 된다. 운전조건, 위상, 방향, 추세와 다른 점검 결과를 함께 확인해야 한다.",
  sourceNote: "설비별 기준치, 센서 사양과 측정조건을 확인한 뒤 공개한다.",
  quiz: {
    id: "quiz-vibration-diagnosis-01",
    type: "single-choice",
    sourceType: "출제 예상·변형",
    question: "회전체 불평형을 의심하게 하는 대표적인 초기 진동 특징은?",
    options: [
      { id: "A", text: "회전속도의 1X 성분이 반경 방향에서 우세하다." },
      { id: "B", text: "모든 주파수 성분이 완전히 사라진다." },
      { id: "C", text: "회전속도와 무관한 직류 성분만 증가한다." },
      { id: "D", text: "설비 정지 중에만 1X 성분이 발생한다." },
    ],
    answerId: "A",
    explanation:
      "불평형은 질량중심의 편심 때문에 매 회전마다 반복되는 힘을 만들어 1X 회전주파수 성분이 우세해지는 경우가 많다. 다만 이것만으로 원인을 확정하지는 않는다.",
  },
};

const baseSubjects: Subject[] = [
  {
    id: "subject-01",
    title: "공유압 및 자동제어",
    shortTitle: "공유압·제어",
    chapters: [
      {
        id: "chapter-01",
        title: "공유압",
        topics: [
          conciseTopic(
            "hydraulic-pump-actuator",
            "유압 펌프와 액추에이터",
            "펌프는 원동기의 기계에너지를 유체의 흐름으로 바꾸고 압력은 부하 저항에 의해 형성된다. 실린더는 직선운동, 유압모터는 회전운동을 만든다.",
            ["유압", "펌프", "실린더", "액추에이터"],
            ["hydraulic pump", "actuator", "유압모터"],
          ),
          conciseTopic(
            "pressure-flow-direction-valve",
            "압력·유량·방향 제어밸브",
            "압력제어밸브는 힘과 안전 한계, 유량제어밸브는 속도, 방향제어밸브는 작동 방향과 정지를 담당한다. 회로 기호의 포트와 정상 위치를 함께 읽는다.",
            ["유압밸브", "압력", "유량", "방향제어"],
            ["relief valve", "flow control valve", "directional valve", "DCV"],
          ),
          conciseTopic(
            "pneumatic-basic-circuit",
            "공압 기본회로와 기호",
            "공압 회로는 압축공기 공급, FRL, 방향·유량 제어밸브와 실린더로 구성된다. 미터아웃 회로는 배기 유량을 조절해 비교적 안정적으로 속도를 제어한다.",
            ["공압", "FRL", "미터아웃", "공압기호"],
            ["pneumatic", "air circuit", "filter regulator lubricator"],
          ),
        ],
      },
      {
        id: "chapter-02",
        title: "전기·전자 장치",
        topics: [
          conciseTopic(
            "dc-ac-circuit",
            "직류·교류 회로 기초",
            "직류는 극성과 크기가 일정하고 교류는 시간에 따라 크기와 방향이 변한다. 옴의 법칙과 직·병렬 합성, 유효전력과 역률을 회로 조건에 맞게 적용한다.",
            ["직류", "교류", "옴의 법칙", "전력"],
            ["DC", "AC", "Ohm's law", "역률"],
          ),
          conciseTopic(
            "relay-contactor-control",
            "릴레이·전자접촉기 제어",
            "릴레이와 전자접촉기는 코일에 전류를 흘려 접점을 전환한다. 접촉기는 주회로 부하 개폐에, 보조접점은 자기유지·인터록·상태신호에 사용한다.",
            ["릴레이", "전자접촉기", "보조접점", "자기유지"],
            ["relay", "magnetic contactor", "MC", "전자개폐기"],
          ),
          conciseTopic(
            "power-semiconductor",
            "반도체와 전력전자 소자",
            "다이오드는 정류, 트랜지스터는 증폭·스위칭에 쓰인다. SCR·TRIAC·IGBT 같은 전력소자는 전압·전류·스위칭 속도와 방열 조건에 맞춰 선정한다.",
            ["반도체", "다이오드", "SCR", "IGBT"],
            ["semiconductor", "thyristor", "power electronics"],
          ),
        ],
      },
      {
        id: "chapter-03",
        title: "센서",
        topics: [
          conciseTopic(
            "proximity-photo-sensor",
            "근접·광전 센서",
            "유도형 근접센서는 금속, 정전용량형은 비금속을 포함한 물체, 광전센서는 빛의 차단·반사를 검출한다. 검출거리와 주변 재질·오염·상호간섭을 확인한다.",
            ["근접센서", "광전센서", "유도형", "정전용량형"],
            ["proximity sensor", "photoelectric sensor", "inductive", "capacitive"],
          ),
          conciseTopic(
            "process-sensor",
            "온도·압력·유량 센서",
            "온도는 열전대·측온저항체, 압력은 탄성체·압전·스트레인 방식, 유량은 차압·전자·초음파 등으로 측정한다. 범위와 정확도, 유체 특성을 함께 본다.",
            ["온도센서", "압력센서", "유량계", "계측"],
            ["thermocouple", "RTD", "pressure transmitter", "flowmeter"],
          ),
          conciseTopic(
            "pnp-npn-wiring",
            "PNP·NPN 출력과 센서 배선",
            "PNP 출력은 부하로 전류를 공급하고 NPN 출력은 부하 전류를 0V 쪽으로 흘린다. PLC 입력 공통단의 극성과 센서 전원선을 맞춰야 정상 검출된다.",
            ["PNP", "NPN", "센서배선", "소싱", "싱킹"],
            ["sourcing", "sinking", "3-wire sensor"],
          ),
        ],
      },
      {
        id: "chapter-04",
        title: "모터제어",
        topics: [
          conciseTopic(
            "induction-motor",
            "삼상 유도전동기의 원리",
            "삼상 전원이 만드는 회전자계가 회전자에 유도전류와 토크를 발생시킨다. 회전자는 동기속도보다 느리게 돌아야 유도가 유지되며 그 차이를 슬립이라 한다.",
            ["유도전동기", "회전자계", "동기속도", "슬립"],
            ["induction motor", "squirrel cage motor", "삼상모터"],
          ),
          conciseTopic(
            "motor-starting-circuit",
            "정역·Y-Δ 기동회로",
            "정역운전은 두 상을 바꿔 회전자계 방향을 반전하며 전기·기계 인터록이 필요하다. Y-Δ 기동은 기동전류를 낮추지만 기동토크도 직접기동의 약 1/3로 줄어든다.",
            ["정역운전", "Y-Δ", "기동회로", "인터록"],
            ["star-delta", "wye-delta", "forward reverse", "기동전류"],
          ),
          conciseTopic(
            "inverter-control",
            "인버터 속도제어",
            "인버터는 주파수와 전압을 조절해 교류전동기 속도와 토크를 제어한다. 가감속시간, V/f 또는 벡터제어, 모터 정격과 회생·제동 조건을 설정한다.",
            ["인버터", "주파수제어", "V/f", "벡터제어"],
            ["VFD", "variable frequency drive", "frequency inverter"],
          ),
        ],
      },
      {
        id: "chapter-05",
        title: "공정제어",
        topics: [
          plcLadderBasic,
          conciseTopic(
            "sequence-interlock",
            "시퀀스 인터록과 자기유지",
            "자기유지는 순간 운전신호 뒤에도 출력을 유지하고, 인터록은 동시에 동작하면 위험한 출력을 상호 금지한다. 정지·과부하 같은 안전 조건은 우선 차단되도록 구성한다.",
            ["시퀀스", "인터록", "자기유지", "안전회로"],
            ["sequence control", "interlock", "seal-in", "latching"],
          ),
          conciseTopic(
            "pid-feedback",
            "PID 제어와 피드백",
            "피드백 제어는 설정값과 측정값의 오차를 줄인다. P는 현재 오차, I는 누적 오차, D는 변화율에 반응하며 공정 특성에 맞게 이득을 조정한다.",
            ["PID", "피드백", "비례", "적분", "미분"],
            ["feedback control", "proportional integral derivative", "제어루프"],
          ),
        ],
      },
    ],
  },
  {
    id: "subject-02",
    title: "용접 및 안전관리",
    shortTitle: "용접·안전",
    chapters: [
      {
        id: "chapter-06",
        title: "용접 일반",
        topics: [
          conciseTopic(
            "arc-welding-polarity",
            "아크용접의 원리와 극성",
            "아크 열로 모재와 용가재를 녹여 접합한다. 직류 정극성·역극성은 전극과 모재의 발열 분포, 용입과 전극 용융량에 영향을 주므로 공정 지침에 맞춘다.",
            ["아크용접", "극성", "정극성", "역극성"],
            ["arc welding", "DCEN", "DCEP", "straight polarity", "reverse polarity"],
          ),
          conciseTopic(
            "weld-joint-position-symbol",
            "용접 이음·자세·기호",
            "맞대기·겹치기·T 이음과 아래보기·수평·수직·위보기 자세를 구분한다. 용접기호는 기준선, 화살표, 기본기호와 치수·꼬리표를 함께 읽는다.",
            ["용접이음", "용접자세", "용접기호", "도면"],
            ["weld joint", "welding position", "welding symbol", "groove weld"],
          ),
          conciseTopic(
            "weld-material-haz",
            "용접재료와 열영향부",
            "용접재료는 모재 강도·성분과 사용환경에 맞춰 선정한다. 열영향부는 녹지 않았지만 열 사이클로 조직과 성질이 변한 영역이므로 예열·입열·후열을 관리한다.",
            ["용접재료", "열영향부", "예열", "후열"],
            ["HAZ", "heat affected zone", "filler metal", "welding consumable"],
          ),
        ],
      },
      {
        id: "chapter-07",
        title: "용접 시공",
        topics: [
          conciseTopic(
            "welding-condition-sequence",
            "용접조건과 작업순서",
            "모재·홈과 용접재료를 확인하고 청소·가접·예열 후 본용접과 층간 청소를 수행한다. 전류·전압·속도·입열과 패스 순서를 절차서 범위에서 관리한다.",
            ["용접조건", "작업순서", "입열", "층간온도"],
            ["WPS", "welding procedure", "travel speed", "interpass temperature"],
          ),
          conciseTopic(
            "welding-deformation",
            "변형·잔류응력 억제",
            "불균일한 가열·냉각으로 수축과 잔류응력이 생긴다. 대칭·후퇴·스킵 용접, 역변형, 구속과 적정 입열을 적용하되 과도한 구속에 따른 균열도 주의한다.",
            ["용접변형", "잔류응력", "역변형", "스킵용접"],
            ["welding distortion", "residual stress", "back-step", "skip welding"],
          ),
          weldingDefect,
        ],
      },
      {
        id: "chapter-08",
        title: "비파괴검사",
        topics: [
          conciseTopic(
            "vt-pt-mt",
            "육안·침투·자분탐상검사",
            "VT는 표면 상태, PT는 비다공성 재료의 표면 개구 결함, MT는 강자성체의 표면·근표면 결함을 찾는다. 전처리와 관찰조건, 후처리가 결과 신뢰도를 좌우한다.",
            ["VT", "PT", "MT", "비파괴검사"],
            ["visual testing", "penetrant testing", "magnetic particle testing", "NDT"],
          ),
          conciseTopic(
            "rt-ut",
            "방사선·초음파탐상검사",
            "RT는 투과 방사선의 감쇠 차이로 내부 형상을 영상화하고, UT는 초음파 반사로 결함 위치와 크기를 추정한다. 형상·두께·접근성·안전조건에 맞춰 선택한다.",
            ["RT", "UT", "방사선탐상", "초음파탐상"],
            ["radiographic testing", "ultrasonic testing", "NDT", "NDE"],
          ),
          conciseTopic(
            "ndt-selection",
            "검사방법 선택과 판정",
            "검출할 결함의 위치·방향, 재료, 두께, 표면상태와 접근성을 기준으로 검사법을 고른다. 지시는 곧 결함이나 불합격을 뜻하지 않으며 적용 기준으로 판정한다.",
            ["NDT", "검사선정", "결함판정", "감도"],
            ["non-destructive testing", "NDE", "비파괴평가", "acceptance criteria"],
          ),
        ],
      },
      {
        id: "chapter-09",
        title: "안전관리",
        topics: [
          conciseTopic(
            "welding-cutting-safety",
            "용접·절단 작업안전",
            "가연물을 제거·차폐하고 화재감시와 소화설비를 준비한다. 환기, 차광·보안면, 가스용기 고정과 역화방지, 밀폐공간 허가를 작업 전 확인한다.",
            ["용접안전", "절단", "화재감시", "가스용기"],
            ["hot work", "fire watch", "flashback arrestor", "PPE"],
          ),
          conciseTopic(
            "machine-maintenance-safety",
            "기계설비 보전 작업안전",
            "정지·격리·잔류에너지 제거 후 작업하고 회전체·중량물·고소·협착 위험을 평가한다. 보호장치 복구와 공구·인원 확인 뒤 통제된 절차로 재가동한다.",
            ["보전안전", "협착", "중량물", "재가동"],
            ["maintenance safety", "machine guarding", "risk assessment", "JSA"],
          ),
          conciseTopic(
            "lockout-tagout",
            "에너지 차단과 잠금표찰",
            "LOTO는 에너지원 식별, 정지, 격리, 잠금·표찰, 저장에너지 해소, 무에너지 확인 후 작업하는 절차다. 해제와 재가동은 권한과 인원 확인을 거친다.",
            ["LOTO", "에너지차단", "잠금표찰", "무에너지"],
            ["lockout tagout", "energy isolation", "zero energy state"],
          ),
        ],
      },
    ],
  },
  {
    id: "subject-03",
    title: "기계설계 일반",
    shortTitle: "기계설계",
    chapters: [
      {
        id: "chapter-10",
        title: "도면해독",
        topics: [
          conciseTopic(
            "projection-section",
            "투상도와 단면도",
            "정투상도는 물체를 서로 직각인 방향에서 나타내며 필요한 최소 투상도로 형상을 전달한다. 단면도는 절단 위치와 방향을 확인하고 해칭·숨은선 생략 규칙을 적용한다.",
            ["투상도", "단면도", "제도", "해칭"],
            ["orthographic projection", "section view", "cutting plane"],
          ),
          conciseTopic(
            "tolerance-fit",
            "치수공차와 끼워맞춤",
            "공차는 허용되는 치수 변동 범위이며 구멍과 축의 최대·최소치 조합으로 틈새·중간·억지 끼워맞춤이 결정된다. 기능과 가공성을 함께 고려해 등급을 정한다.",
            ["치수공차", "끼워맞춤", "구멍기준", "축기준"],
            ["tolerance", "fit", "clearance fit", "interference fit"],
          ),
          conciseTopic(
            "geometric-tolerance-roughness",
            "기하공차와 표면거칠기",
            "기하공차는 형상·자세·위치·흔들림의 허용범위를, 표면거칠기는 미세 요철의 정도를 지정한다. 데이텀과 공차영역, 가공 방향 기호를 함께 읽는다.",
            ["기하공차", "표면거칠기", "데이텀", "공차영역"],
            ["GD&T", "geometric tolerance", "surface roughness", "datum"],
          ),
        ],
      },
      {
        id: "chapter-11",
        title: "기본측정기",
        topics: [
          conciseTopic(
            "vernier-caliper",
            "버니어캘리퍼스 읽기",
            "본척에서 버니어 0점 직전 값을 읽고 일치하는 버니어 눈금을 더한다. 외측·내측·깊이를 측정할 수 있으며 영점, 시차, 측정력과 죠의 기울어짐을 확인한다.",
            ["버니어캘리퍼스", "본척", "버니어", "측정"],
            ["vernier caliper", "노기스", "캘리퍼"],
          ),
          conciseTopic(
            "micrometer",
            "마이크로미터 측정",
            "슬리브 눈금과 심블 눈금을 합해 치수를 읽는다. 측정면을 청소하고 영점을 확인한 뒤 래칫으로 일정한 측정력을 주며 온도와 정렬 오차를 줄인다.",
            ["마이크로미터", "슬리브", "심블", "래칫"],
            ["micrometer", "outside micrometer", "마이크로미터 헤드"],
          ),
          conciseTopic(
            "dial-gauge",
            "다이얼게이지와 비교측정",
            "다이얼게이지는 기준값에 대한 변위를 확대해 표시한다. 스탠드를 견고히 고정하고 측정축을 이동 방향과 맞춘 뒤 흔들림·평행도·축정렬을 비교 측정한다.",
            ["다이얼게이지", "비교측정", "런아웃", "축정렬"],
            ["dial indicator", "dial gauge", "runout", "인디케이터"],
          ),
        ],
      },
      {
        id: "chapter-12",
        title: "기계가공",
        topics: [
          conciseTopic(
            "lathe-process",
            "선반가공의 종류와 조건",
            "선반은 공작물을 회전시키고 공구를 이송해 외경·내경·단면·나사 등을 가공한다. 회전수는 절삭속도와 지름으로 정하고 이송·절입과 공구 형상을 조절한다.",
            ["선반", "절삭속도", "회전수", "나사가공"],
            ["lathe", "turning", "facing", "thread cutting"],
          ),
          conciseTopic(
            "milling-drilling",
            "밀링·드릴링 가공",
            "밀링은 회전 다인 공구로 평면·홈·윤곽을, 드릴링은 구멍을 가공한다. 공작물 고정, 공구 돌출, 회전수·이송과 칩 배출을 확인한다.",
            ["밀링", "드릴링", "엔드밀", "구멍가공"],
            ["milling", "drilling", "end mill", "reaming"],
          ),
          conciseTopic(
            "cutting-tool-wear",
            "절삭조건과 공구마모",
            "절삭속도·이송·절입은 생산성, 절삭력, 열과 표면품질을 함께 바꾼다. 여유면마모·크레이터마모·치핑을 관찰해 공구수명과 조건을 조정한다.",
            ["절삭조건", "공구마모", "공구수명", "치핑"],
            ["tool wear", "flank wear", "crater wear", "Taylor tool life"],
          ),
        ],
      },
      {
        id: "chapter-13",
        title: "기계재료",
        topics: [
          conciseTopic(
            "steel-heat-treatment",
            "철강재료와 열처리",
            "탄소와 합금원소, 조직과 열처리에 따라 강의 성질이 달라진다. 담금질은 경도, 뜨임은 취성 완화, 풀림은 연화, 불림은 조직 미세화와 균질화를 목적으로 한다.",
            ["철강", "열처리", "담금질", "뜨임", "풀림"],
            ["steel", "quenching", "tempering", "annealing", "normalizing"],
          ),
          conciseTopic(
            "nonferrous-material",
            "비철금속과 합금",
            "알루미늄은 경량·내식, 구리는 전기·열전도, 황동·청동은 가공성·내마모, 티타늄은 비강도와 내식성이 특징이다. 사용환경과 접촉부식도 고려한다.",
            ["비철금속", "알루미늄", "구리", "황동", "청동"],
            ["nonferrous metal", "aluminum", "brass", "bronze", "titanium"],
          ),
          conciseTopic(
            "material-test",
            "인장·경도·충격시험",
            "인장시험은 항복·인장강도와 연신율, 경도시험은 압입 저항, 충격시험은 노치가 있는 시편의 흡수에너지를 평가한다. 시험법과 시편 조건을 함께 기록한다.",
            ["인장시험", "경도시험", "충격시험", "재료시험"],
            ["tensile test", "hardness", "Charpy", "Brinell", "Rockwell", "Vickers"],
          ),
        ],
      },
      {
        id: "chapter-14",
        title: "구동장치 조립",
        topics: [
          taperedRollerBearing,
          conciseTopic(
            "shaft-key-spline",
            "축·키·스플라인 조립",
            "축은 회전력과 굽힘을 전달하고 키·스플라인은 축과 허브 사이 토크를 전달한다. 끼워맞춤, 키의 접촉면, 모서리 손상과 축방향 고정을 확인한다.",
            ["축", "키", "스플라인", "토크전달"],
            ["shaft", "key", "spline", "keyway"],
          ),
          conciseTopic(
            "belt-chain-gear-alignment",
            "벨트·체인·기어 정렬",
            "벨트는 장력과 풀리 정렬, 체인은 처짐과 스프로킷 정렬, 기어는 백래시와 치면 접촉을 관리한다. 과도한 장력은 베어링과 축 수명을 줄인다.",
            ["벨트", "체인", "기어", "정렬", "장력"],
            ["belt drive", "chain drive", "gear mesh", "backlash", "sprocket"],
          ),
        ],
      },
      {
        id: "chapter-15",
        title: "기계장치 보전",
        topics: [
          conciseTopic(
            "disassembly-cleaning-assembly",
            "분해·세척·조립 작업",
            "에너지 차단 후 위치표시와 사진·치수를 기록하며 순서대로 분해한다. 부품별 세척·검사·보관을 거쳐 규정 토크와 간극으로 조립하고 시운전한다.",
            ["분해", "세척", "조립", "작업순서"],
            ["disassembly", "cleaning", "assembly", "overhaul"],
          ),
          conciseTopic(
            "shaft-alignment",
            "축정렬과 커플링 점검",
            "축정렬은 두 축 중심선의 오프셋과 각도 오차를 허용범위로 맞추는 작업이다. 소프트풋과 배관 응력을 먼저 제거하고 다이얼 또는 레이저로 냉간 보정한다.",
            ["축정렬", "커플링", "오프셋", "각도오차"],
            ["shaft alignment", "coupling", "soft foot", "laser alignment"],
          ),
          conciseTopic(
            "failure-analysis",
            "고장 원인 분석과 보전 표준",
            "현상·시간·운전조건과 손상 증거를 보존하고 직접원인과 근본원인을 분리한다. 5 Why·FTA·FMEA 등을 활용해 조치, 검증, 표준 개정까지 연결한다.",
            ["고장분석", "근본원인", "FMEA", "보전표준"],
            ["RCA", "root cause analysis", "5 Why", "FTA", "failure analysis"],
          ),
        ],
      },
    ],
  },
  {
    id: "subject-04",
    title: "설비진단 및 관리",
    shortTitle: "진단·관리",
    chapters: [
      {
        id: "chapter-16",
        title: "진동·소음",
        topics: [
          vibrationDiagnosis,
          conciseTopic(
            "frequency-analysis-fft",
            "주파수 분석과 FFT",
            "FFT는 시간파형을 주파수 성분으로 분해한다. 샘플링 주파수, 측정시간, 분해능과 창 함수를 적절히 정하고 회전수 1X·고조파·측파대를 해석한다.",
            ["FFT", "주파수분석", "샘플링", "분해능"],
            ["fast Fourier transform", "spectrum", "window function", "Nyquist"],
          ),
          conciseTopic(
            "noise-vibration-control",
            "소음 측정과 방음·방진",
            "소음은 음압레벨과 주파수 특성, 진동은 전달경로와 공진을 측정한다. 대책은 발생원 저감, 전달경로 차단, 수음·수진점 보호 순으로 검토한다.",
            ["소음", "방음", "방진", "공진"],
            ["noise control", "sound pressure level", "isolation", "damping"],
          ),
        ],
      },
      {
        id: "chapter-17",
        title: "설비관리계획",
        topics: [
          conciseTopic(
            "maintenance-strategy",
            "사후·예방·예지보전",
            "사후보전은 고장 후, 예방보전은 시간·사용량 기준, 예지보전은 상태 데이터 기준으로 수행한다. 설비 중요도, 고장영향, 비용과 검출 가능성으로 조합한다.",
            ["사후보전", "예방보전", "예지보전", "CBM"],
            ["breakdown maintenance", "preventive maintenance", "predictive maintenance", "condition based maintenance"],
          ),
          conciseTopic(
            "maintenance-planning",
            "보전계획과 일정관리",
            "작업범위, 위험, 인력·공구·자재, 표준시간과 정지창을 계획하고 우선순위를 정한다. 계획 대비 실적과 지연 원인을 분석해 주기와 표준을 개선한다.",
            ["보전계획", "일정관리", "작업지시", "정지보전"],
            ["maintenance planning", "scheduling", "work order", "shutdown maintenance"],
          ),
          conciseTopic(
            "spare-parts-life-cycle",
            "예비품과 설비수명 관리",
            "예비품은 고장영향, 조달기간, 사용빈도와 보관수명을 기준으로 중요도와 재고수준을 정한다. 설비 생애주기 비용과 노후화·단종 위험도 함께 관리한다.",
            ["예비품", "재고", "설비수명", "생애주기비용"],
            ["spare parts", "lead time", "life cycle cost", "LCC", "obsolescence"],
          ),
        ],
      },
      {
        id: "chapter-18",
        title: "TPM·OEE",
        topics: [
          conciseTopic(
            "tpm-autonomous-maintenance",
            "TPM과 자주보전",
            "TPM은 전원이 참여해 설비종합효율과 무고장 체질을 높이는 활동이다. 자주보전은 청소·급유·점검·조임과 이상 발견 능력을 현장 작업자에게 정착시킨다.",
            ["TPM", "자주보전", "전원참가", "설비효율"],
            ["total productive maintenance", "autonomous maintenance", "AM", "전사적 생산보전"],
          ),
          conciseTopic(
            "oee-calculation",
            "OEE 구성과 계산",
            "OEE는 시간가동률×성능가동률×양품률로 계산한다. 정지손실, 속도손실, 불량손실을 분리해 병목과 개선 우선순위를 찾는 지표다.",
            ["OEE", "시간가동률", "성능가동률", "양품률"],
            ["overall equipment effectiveness", "availability", "performance", "quality rate", "설비종합효율"],
          ),
          conciseTopic(
            "six-big-losses",
            "설비 6대 로스",
            "6대 로스는 고장, 준비·조정, 순간정지·공회전, 속도저하, 공정불량·재작업, 기동수율 저하다. 각 손실을 OEE 세 요소와 연결해 개선한다.",
            ["6대 로스", "고장로스", "순간정지", "속도저하"],
            ["six big losses", "minor stop", "setup loss", "startup loss"],
          ),
        ],
      },
      {
        id: "chapter-19",
        title: "윤활관리",
        topics: [
          conciseTopic(
            "lubricant-property-selection",
            "윤활제 성질과 선정",
            "윤활유·그리스는 점도, 점도지수, 기유와 첨가제, 온도·하중·속도·환경에 맞춰 고른다. 점도가 너무 낮으면 유막 부족, 너무 높으면 마찰과 발열이 커질 수 있다.",
            ["윤활제", "점도", "점도지수", "그리스"],
            ["lubricant", "viscosity", "viscosity index", "base oil", "additive"],
          ),
          conciseTopic(
            "lubrication-method",
            "급유 방식과 윤활주기",
            "수동·적하·유욕·순환·비산·집중급유 등 방식은 속도, 하중, 열 제거와 접근성에 맞춘다. 적정량과 주기는 제조사 기준과 상태점검 결과로 조정한다.",
            ["급유", "윤활주기", "유욕", "순환급유", "집중급유"],
            ["lubrication method", "oil bath", "circulating oil", "central lubrication"],
          ),
          conciseTopic(
            "oil-analysis-contamination",
            "오염관리와 오일 분석",
            "입자·수분·열화 생성물은 마모와 윤활 실패를 촉진한다. 대표성 있게 시료를 채취해 점도, 수분, 산가, 입자수와 마모금속의 추세를 함께 해석한다.",
            ["오일분석", "오염관리", "입자수", "수분", "마모분석"],
            ["oil analysis", "contamination control", "particle count", "wear debris", "ferrography"],
          ),
        ],
      },
    ],
  },
];

const topicEnrichment: Record<string, Partial<Topic>> = {
  ...subject1Enrichment,
  ...subject2Enrichment,
  ...subject3Enrichment,
  ...subject4Enrichment,
};

const curatedSubjects: Subject[] = baseSubjects.map((subject) => ({
  ...subject,
  chapters: subject.chapters.map((chapter) => ({
    ...chapter,
    topics: chapter.topics.map((topic) => ({
      ...topic,
      ...(topicEnrichment[topic.id] ?? {}),
      kind: "curated" as const,
    })),
  })),
}));

const notionCatalog = parseNotionCatalog(notionCatalogJson);

export const notionCatalogStats: NotionCatalogStats = notionCatalog.stats;
export const notionCatalogGeneratedAt = notionCatalog.generatedAt;

function normalizeNotionSubject(subject: Subject): Subject {
  const importedAt = typeof notionCatalog.generatedAt === "string"
    ? notionCatalog.generatedAt.slice(0, 10)
    : REVIEWED_AT;
  return {
    ...subject,
    chapters: subject.chapters
      .filter((chapter) => chapter.topics.length > 0)
      .map((chapter) => ({
        ...chapter,
        topics: chapter.topics.map((topic) => ({
          ...topic,
          tags: topic.tags ?? [],
          synonyms: topic.synonyms ?? [],
          contentUrl: topic.contentUrl ?? `/generated/topics/${topic.id}.json`,
          reviewedAt: topic.reviewedAt ?? importedAt,
          kind: "notion-original" as const,
          sourceType: "Notion 원문" as const,
          reviewStatus: "확인 필요" as const,
        })),
      })),
  };
}

function mergeSubjectCatalog(curated: Subject[], imported: Subject[]): Subject[] {
  const merged = curated.map((subject) => ({
    ...subject,
    chapters: subject.chapters.map((chapter) => ({
      ...chapter,
      topics: [...chapter.topics],
    })),
  }));

  for (const rawSubject of imported) {
    const importedSubject = normalizeNotionSubject(rawSubject);
    if (importedSubject.chapters.length === 0) continue;

    const existingSubject = merged.find((subject) => subject.id === importedSubject.id);
    if (!existingSubject) {
      merged.push(importedSubject);
      continue;
    }

    for (const importedChapter of importedSubject.chapters) {
      const existingChapter = existingSubject.chapters.find(
        (chapter) => chapter.id === importedChapter.id,
      );
      if (!existingChapter) {
        existingSubject.chapters.push(importedChapter);
        continue;
      }

      for (const importedTopic of importedChapter.topics) {
        const collision = existingChapter.topics.some((topic) => topic.id === importedTopic.id);
        if (collision) {
          throw new Error(`Duplicate topic id in Notion catalog: ${importedTopic.id}`);
        }
        existingChapter.topics.push(importedTopic);
      }
    }
  }

  return merged;
}

export const subjects: Subject[] = mergeSubjectCatalog(
  curatedSubjects,
  notionCatalog.subjects ?? [],
);

export const allChapters: Chapter[] = subjects.flatMap((subject) => subject.chapters);

export const allTopics: IndexedTopic[] = subjects.flatMap((subject) =>
  subject.chapters.flatMap((chapter) =>
    chapter.topics.map((topic) => ({
      ...topic,
      subjectId: subject.id,
      subjectTitle: subject.title,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    })),
  ),
);

export const topicById = new Map(allTopics.map((topic) => [topic.id, topic]));

if (topicById.size !== allTopics.length) {
  throw new Error("Notion catalog contains duplicate topic ids");
}

export const topicPathById = new Map(
  allTopics.map((topic) => [
    topic.id,
    {
      subjectId: topic.subjectId,
      subjectTitle: topic.subjectTitle,
      chapterId: topic.chapterId,
      chapterTitle: topic.chapterTitle,
    },
  ]),
);

const curatedTopicIds = new Set(
  curatedSubjects.flatMap((subject) =>
    subject.chapters.flatMap((chapter) => chapter.topics.map((topic) => topic.id)),
  ),
);

const incompleteTopics = allTopics.filter(
  (topic) =>
    curatedTopicIds.has(topic.id) &&
    (topic.keyPoints?.length !== 3 ||
      (topic.detailSections?.length ?? 0) < 2 ||
      (topic.comparisons?.length ?? 0) < 2 ||
      (topic.workSteps?.length ?? 0) < 3 ||
      !topic.examConnection ||
      !topic.commonTrap ||
      !topic.quiz ||
      topic.quiz.options.length !== 4),
);

if (incompleteTopics.length > 0) {
  throw new Error(
    `Incomplete textbook topics: ${incompleteTopics.map((topic) => topic.id).join(", ")}`,
  );
}

export const representativeTopicIds = [
  "tapered-roller-bearing",
  "plc-ladder-basic",
  "welding-defect",
  "vibration-diagnosis",
] as const;

export const representativeTopics: IndexedTopic[] = representativeTopicIds
  .map((topicId) => allTopics.find((topic) => topic.id === topicId))
  .filter((topic): topic is IndexedTopic => topic !== undefined);

export function getTopicById(topicId: string): IndexedTopic | undefined {
  return topicById.get(topicId);
}
