import { getExamTermDisplayLabel } from "./exam-terms";
import type { PracticalTextbookSubjectId } from "./practical-textbook-taxonomy";
import type { PracticalSourceRef } from "@/lib/domain/practical-types";

export type ExamSummaryEvidence = {
  evidenceIds: string[];
  writtenQuestionIds: string[];
  practicalQuestionIds: string[];
  ncsSourceRefs: PracticalSourceRef[];
};

export type ExamSummaryItem = {
  cue: string;
  answer: string;
  conceptId: string;
  evidence: ExamSummaryEvidence;
};

export type ExamQuickComparison = {
  title: string;
  rows: Array<{ label: string; distinction: string }>;
  evidence: ExamSummaryEvidence;
};

export type ExamSummaryFormula = {
  label: string;
  formula: string;
  note: string;
  conceptId: string;
  evidence: ExamSummaryEvidence;
};

export type ExamSubjectLens = {
  examDirection: string;
  priorities: [string, string, string];
  mustMemorize: string[];
  representativeQuestionIds: string[];
};

export type ExamSubjectCheatSheet = {
  subjectId: PracticalTextbookSubjectId;
  sharedCore: ExamSummaryItem[];
  written: ExamSubjectLens;
  practicalWritten: ExamSubjectLens;
  quickComparisons: ExamQuickComparison[];
  formulas: ExamSummaryFormula[];
};

export type ExamSubjectLensId = "written" | "practicalWritten";

function evidence(
  practicalQuestionIds: string[] = [],
  evidenceIds: string[] = practicalQuestionIds.map(
    (questionId) => `evidence:${questionId}`,
  ),
): ExamSummaryEvidence {
  return {
    evidenceIds,
    writtenQuestionIds: [],
    practicalQuestionIds,
    ncsSourceRefs: [],
  };
}

const subject1Core: ExamSummaryItem[] = [
  {
    cue: "릴리프밸브 / 감압밸브",
    answer:
      "릴리프밸브는 회로 최고압력을 제한하고, 감압밸브는 분기 회로의 2차측 압력을 낮춰 유지한다.",
    conceptId: "PCON-SUP-007",
    evidence: evidence(["EXP-SUP-007"]),
  },
  {
    cue: "시퀀스밸브",
    answer: "설정압력에 도달하면 다음 액추에이터의 동작을 시작한다.",
    conceptId: "PCON-SUP-007",
    evidence: evidence(["EXP-SUP-007"]),
  },
  {
    cue: "카운터밸런스밸브",
    answer: "배압을 유지해 자중에 의한 부하의 낙하를 방지한다.",
    conceptId: "PCON-SUP-007",
    evidence: evidence(["EXP-SUP-007"]),
  },
  {
    cue: "미터인 / 미터아웃",
    answer: "미터인은 입구 유량, 미터아웃은 출구 유량을 조절한다.",
    conceptId: "PCON-SUP-004",
    evidence: evidence(["EXP-SUP-004"]),
  },
  {
    cue: "셔틀 / 2압 밸브",
    answer: "셔틀은 OR, 2압 밸브는 AND 논리로 동작한다.",
    conceptId: "PCON-SUP-037",
    evidence: evidence(["EXP-SUP-037"]),
  },
  {
    cue: "파일럿 체크밸브",
    answer: "평상시 역류를 막아 위치를 유지하고 파일럿압으로 잠금을 해제한다.",
    conceptId: "PCON-SUP-009",
    evidence: evidence(["EXP-SUP-009"]),
  },
  {
    cue: "어큐뮬레이터",
    answer: "유압에너지를 저장해 충격·맥동을 흡수하고 비상 동력을 보조한다.",
    conceptId: "PCON-040",
    evidence: evidence(["P-2026-1-Q09"]),
  },
  {
    cue: "유도형 / 정전용량형 센서",
    answer: "유도형은 금속, 정전용량형은 금속과 비금속을 검출한다.",
    conceptId: "PCON-SUP-011",
    evidence: evidence(["EXP-SUP-011"]),
  },
  {
    cue: "히스테리시스",
    answer: "센서의 접근 동작점과 이탈 복귀점 사이의 거리 차이다.",
    conceptId: "PCON-011",
    evidence: evidence(["P-2025-2-Q02"]),
  },
  {
    cue: "유압실린더 추력",
    answer: "F=P×A이며 후진 추력은 피스톤 면적에서 로드 면적을 뺀다.",
    conceptId: "PCON-025",
    evidence: evidence(["P-2025-3-Q08"]),
  },
  {
    cue: "파스칼 원리",
    answer: "밀폐 유체에 가한 압력은 모든 방향으로 동일하게 전달된다.",
    conceptId: "PCON-032",
    evidence: evidence(["P-2025-1-Q03"]),
  },
  {
    cue: "송풍기 동력 상사법칙",
    answer: "같은 송풍기·동일 유체·동일 효율이면 동력은 회전수의 세제곱에 비례한다.",
    conceptId: "PCON-SUP-003",
    evidence: evidence(["P-2026-2-Q03"]),
  },
];

const subject2Core: ExamSummaryItem[] = [
  {
    cue: "언더컷",
    answer: "모재와 용접비드 경계가 홈처럼 파인 결함이다.",
    conceptId: "PCON-044",
    evidence: evidence(["EXP-W02"]),
  },
  {
    cue: "오버랩",
    answer: "용착금속이 모재와 융합되지 않은 채 겹쳐진 결함이다.",
    conceptId: "PCON-044",
    evidence: evidence(["EXP-W01"]),
  },
  {
    cue: "기공",
    answer: "가스가 빠져나오지 못해 용접금속 내부에 생긴 빈 공간이다.",
    conceptId: "PCON-044",
    evidence: evidence(["EXP-W03"]),
  },
  {
    cue: "슬래그 혼입",
    answer: "층간 청소 불량 등으로 슬래그가 용접금속 안에 남은 결함이다.",
    conceptId: "PCON-044",
    evidence: evidence(["EXP-W03"]),
  },
  {
    cue: "용입 / 융합 불량",
    answer: "용입 불량은 뿌리부 미용융, 융합 불량은 모재·패스 사이 미융합이다.",
    conceptId: "PCON-044",
    evidence: evidence(["EXP-W03"]),
  },
  {
    cue: "VT / PT / MT / UT / RT",
    answer:
      "VT는 외관, PT는 표면개구, MT는 강자성체 표면·표면근처, UT·RT는 내부 결함 검사에 쓴다.",
    conceptId: "PCON-045",
    evidence: evidence(["EXP-VIS-RT-FILM-01"]),
  },
  {
    cue: "WPS",
    answer: "모재·용접봉·전류·자세·예열 등 승인된 작업조건을 정한 절차서다.",
    conceptId: "PCON-SUP-016",
    evidence: evidence(["EXP-SUP-016"]),
  },
  {
    cue: "1G / 2G / 3G / 4G",
    answer: "아래보기 / 수평 / 수직 / 위보기 맞대기용접 자세다.",
    conceptId: "PCON-SUP-019",
    evidence: evidence(["EXP-SUP-019"]),
  },
  {
    cue: "LOTO",
    answer: "차단→잠금·표찰→잔류에너지 제거→무에너지 확인 순서다.",
    conceptId: "PCON-017",
    evidence: evidence(["P-2025-2-Q09"]),
  },
  {
    cue: "안전표지",
    answer: "금지·경고·지시·안내의 의미와 작업자가 해야 할 행동을 함께 쓴다.",
    conceptId: "PCON-009",
    evidence: evidence(["P-2025-3-Q02", "P-2026-1-Q02", "EXP-S02"]),
  },
  {
    cue: "호흡보호구",
    answer: "유해물질과 산소농도를 먼저 확인하고 산소결핍에는 공기정화식을 쓰지 않는다.",
    conceptId: "PCON-016",
    evidence: evidence(["P-2025-2-Q08"]),
  },
  {
    cue: "연삭숫돌 시운전",
    answer: "작업 시작 전 1분 이상, 숫돌 교체 후 3분 이상 시운전하고 파편 비산 방지 덮개를 갖춘다.",
    conceptId: "PCON-SUP-043",
    evidence: evidence(["P-2026-2-Q06"]),
  },
];

const subject3Core: ExamSummaryItem[] = [
  {
    cue: "구름베어링 사진",
    answer: "전동체의 모양과 궤도 방향을 보고 볼·원통·테이퍼·스러스트 형식을 구분한다.",
    conceptId: "PCON-004",
    evidence: evidence(["P-2025-1-Q04", "P-2025-2-Q01-2"]),
  },
  {
    cue: "자동조심 롤러베어링",
    answer: "복열 배럴형 롤러와 구면 외륜 궤도로 축의 기울어짐을 허용한다.",
    conceptId: "PCON-004",
    evidence: evidence(["P-2025-2-Q01-2"]),
  },
  {
    cue: "베어링 조립",
    answer: "압입력은 억지끼워맞춤되는 링에 가하고, 가열 후에는 탈자·신속 장착·밀착을 확인한다.",
    conceptId: "PCON-006",
    evidence: evidence(["EXP-B03", "EXP-B06"]),
  },
  {
    cue: "끼워맞춤",
    answer: "최소틈새가 양수면 틈새, 최대틈새와 최대죔새가 함께 생기면 중간, 항상 죔새면 억지끼워맞춤이다.",
    conceptId: "PCON-019",
    evidence: evidence(["P-2025-3-Q01", "EXP-C04"]),
  },
  {
    cue: "최대·최소 틈새",
    answer: "최대틈새=구멍 최대-축 최소, 최소틈새=구멍 최소-축 최대이다.",
    conceptId: "PCON-019",
    evidence: evidence(["P-2025-3-Q01", "EXP-C04"]),
  },
  {
    cue: getExamTermDisplayLabel("vernier-main-scale", "주척"),
    answer: "버니어 0선 직전의 주척값에 일치눈금×최소눈금을 더한다.",
    conceptId: "PCON-014",
    evidence: evidence(["EXP-M01"]),
  },
  {
    cue: `${getExamTermDisplayLabel("gear-pitting", "피팅")} / 스폴링 / ${getExamTermDisplayLabel("gear-scoring", "스코어링")}`,
    answer: "작은 점상공 / 큰 조각 박리 / 미끄럼 방향의 긁힘·용착으로 구분한다.",
    conceptId: "PCON-018",
    evidence: evidence(["EXP-G03", "EXP-D03"]),
  },
  {
    cue: "백래시 부족",
    answer: "발열·소음·기어 록(물림 고착)을 유발한다.",
    conceptId: "PCON-018",
    evidence: evidence(["EXP-G03"]),
  },
  {
    cue: "감속기 점검",
    answer: "유면·누유·소음·진동·온도를 같은 운전조건에서 확인하고 이전 기록과 비교한다.",
    conceptId: "PCON-SUP-029",
    evidence: evidence(["EXP-SUP-029"]),
  },
  {
    cue: "브레이크 마모",
    answer: "라이닝·패드 두께와 좌우 간극을 제조사 기준과 비교해 조정 또는 교체를 판단한다.",
    conceptId: "PCON-SUP-030",
    evidence: evidence(["EXP-SUP-030"]),
  },
  {
    cue: "V벨트·풀리",
    answer: "벨트 형식·장력·정렬·균열·마모를 확인하고 풀리 홈과 맞는 형식을 사용한다.",
    conceptId: "PCON-SUP-031",
    evidence: evidence(["EXP-SUP-031"]),
  },
];

const subject4Core: ExamSummaryItem[] = [
  {
    cue: "사후보전",
    answer: "고장이 발생한 뒤 수리해 기능을 회복하는 보전방식이다.",
    conceptId: "PCON-SUP-034",
    evidence: evidence(["EXP-SUP-034"]),
  },
  {
    cue: "예방보전",
    answer: "정해진 주기나 사용량에 따라 점검·교환해 고장을 예방한다.",
    conceptId: "PCON-020",
    evidence: evidence(["P-2025-3-Q03"]),
  },
  {
    cue: "예지보전",
    answer: "진동·온도·윤활 등 상태 추세로 고장 시점을 예측해 정비한다.",
    conceptId: "PCON-SUP-033",
    evidence: evidence(["EXP-SUP-033"]),
  },
  {
    cue: "개량보전",
    answer: "고장 원인을 제거하도록 설비의 구조·재질·운전조건을 개선한다.",
    conceptId: "PCON-SUP-034",
    evidence: evidence(["EXP-SUP-034"]),
  },
  {
    cue: "자주보전",
    answer: "운전자가 청소·점검·급유·조임으로 기본조건을 유지하고 이상을 조기에 발견한다.",
    conceptId: "PCON-020",
    evidence: evidence(["P-2025-3-Q03"]),
  },
  {
    cue: "자주보전 7스텝",
    answer: `초기청소에서 시작해 발생원 대책·기준·점검·표준화를 거쳐 ${getExamTermDisplayLabel("autonomous-maintenance-final-step", "자주관리 철저")}로 정착한다.`,
    conceptId: "PCON-020",
    evidence: evidence(["P-2025-3-Q03"]),
  },
  {
    cue: "OEE",
    answer: "시간가동률×성능가동률×양품률로 설비의 종합적인 손실을 본다.",
    conceptId: "PCON-030",
    evidence: evidence(["P-2026-1-Q05"]),
  },
  {
    cue: "TPM 6대 로스",
    answer: "고장, 작업준비·조정, 일시정지·공운전, 속도저하, 공정불량·수정, 초기수율 로스다.",
    conceptId: "PCON-030",
    evidence: evidence(["P-2026-1-Q05"]),
  },
  {
    cue: "진동 측정 방향",
    answer: "같은 측정점·운전조건에서 수평(H)·수직(V)·축방향(A)을 기록해 추세를 비교한다.",
    conceptId: "PCON-SUP-033",
    evidence: evidence(["EXP-SUP-033"]),
  },
  {
    cue: "윤활 점검",
    answer: "유종·급유량·주기·오염·누유를 확인하고 과소·과다 급유를 모두 피한다.",
    conceptId: "PCON-SUP-032",
    evidence: evidence(["EXP-SUP-032"]),
  },
  {
    cue: "고장추적",
    answer: "현상 확인→원인 후보→점검→조치→동일 조건 재시험→기록 순으로 닫는다.",
    conceptId: "PCON-SUP-034",
    evidence: evidence(["EXP-SUP-034"]),
  },
];

export const EXAM_SUBJECT_CHEAT_SHEETS: ExamSubjectCheatSheet[] = [
  {
    subjectId: "subject-1",
    sharedCore: subject1Core,
    written: {
      examDirection: "밸브·센서의 기능 차이와 회로의 흐름을 선택지에서 빠르게 구분합니다.",
      priorities: ["제어밸브 기능", "센서 검출 특성", "회로·출력 계산"],
      mustMemorize: [
        "릴리프=최고압력, 감압=2차압력, 시퀀스=동작순서",
        "셔틀=OR, 2압=AND",
        "유도형=금속, 정전용량형=금속·비금속",
      ],
      representativeQuestionIds: ["P-2025-1-Q03", "P-2025-2-Q02", "P-2025-3-Q08"],
    },
    practicalWritten: {
      examDirection: "밸브·센서의 역할을 구분하고 회로 흐름과 실린더 출력 계산으로 연결합니다.",
      priorities: ["압력·유량·방향제어밸브", "센서 형식·동작 특성", "실린더 힘·회로 판독"],
      mustMemorize: [
        "릴리프=최고압력, 감압=2차압력, 시퀀스=동작순서, 카운터밸런스=낙하방지",
        "셔틀=OR, 2압=AND",
        "실린더 힘 F=P×A, 후진은 로드 면적 제외",
      ],
      representativeQuestionIds: ["P-2025-1-Q03", "P-2025-2-Q02", "P-2025-3-Q08"],
    },
    quickComparisons: [],
    formulas: [],
  },
  {
    subjectId: "subject-2",
    sharedCore: subject2Core,
    written: {
      examDirection: "용접 계산은 제외하고 결함·검사·기호·안전의 옳고 그름을 구분합니다.",
      priorities: ["용접 결함", "비파괴검사·기호", "작업안전"],
      mustMemorize: [
        "언더컷=홈, 오버랩=미융합 겹침",
        "PT=표면개구, MT=강자성체, UT·RT=내부결함",
        "LOTO=차단→잠금·표찰→잔류에너지 제거→무에너지 확인",
      ],
      representativeQuestionIds: ["P-2025-1-Q09", "P-2025-2-Q09", "EXP-W01"],
    },
    practicalWritten: {
      examDirection: "용접 계산은 제외하고 결함·검사·용접 조건의 옳고 그름과 안전조치 순서를 집중합니다.",
      priorities: ["결함 형상·원인·대책", "비파괴검사·기호·자세", "LOTO·보호구·화기작업"],
      mustMemorize: [
        "언더컷=홈, 오버랩=미융합 겹침",
        "PT=표면개구, MT=강자성체, UT·RT=내부결함",
        "용접 필답은 결함·기호·안전·이론 판별 중심",
      ],
      representativeQuestionIds: ["P-2025-1-Q09", "P-2025-2-Q09", "EXP-W01"],
    },
    quickComparisons: [],
    formulas: [],
  },
  {
    subjectId: "subject-3",
    sharedCore: subject3Core,
    written: {
      examDirection: "베어링·기어·측정기의 형상과 용도를 비교하고 끼워맞춤 계산 조건을 구분합니다.",
      priorities: ["베어링·기어 형식", "측정기·도면 판독", "조립·점검 기준"],
      mustMemorize: [
        "베어링은 전동체 모양·궤도 방향·분리 구조로 구분",
        "압입력은 억지끼워맞춤 링에 전달",
        "피팅=점상공, 스폴링=큰 박리, 스코어링=긁힘·용착",
      ],
      representativeQuestionIds: ["P-2025-1-Q04", "P-2025-3-Q01", "EXP-G03"],
    },
    practicalWritten: {
      examDirection: "사진·도면에서 명칭과 판독 단서를 찾고 조립순서·끼워맞춤·손상 판정으로 답을 만듭니다.",
      priorities: ["베어링 사진·조립", "끼워맞춤·측정 판독", "기어 손상·구동장치 점검"],
      mustMemorize: [
        "구름베어링은 전동체·궤도 방향으로 구분",
        "최대틈새=구멍 최대-축 최소, 최소틈새=구멍 최소-축 최대",
        `${getExamTermDisplayLabel("gear-pitting", "피팅")}=작은 점상공, 스폴링=큰 박리, ${getExamTermDisplayLabel("gear-scoring", "스코어링")}=긁힘·용착`,
        "백래시 부족은 발열·소음·기어 록(물림 고착)을 유발",
      ],
      representativeQuestionIds: ["P-2025-1-Q04", "P-2025-3-Q01", "EXP-G03"],
    },
    quickComparisons: [
      {
        title: "끼워맞춤 판정",
        rows: [
          { label: "틈새", distinction: "항상 구멍이 축보다 커서 최소틈새가 0 이상" },
          { label: "중간", distinction: "치수조합에 따라 틈새 또는 죔새 발생" },
          { label: "억지", distinction: "항상 축이 구멍보다 커서 죔새 발생" },
        ],
        evidence: evidence(["P-2025-3-Q01", "EXP-C04"]),
      },
      {
        title: "기어 치면 손상",
        rows: [
          { label: getExamTermDisplayLabel("gear-pitting", "피팅"), distinction: "작은 점상공" },
          { label: "스폴링", distinction: "넓고 깊은 조각 박리" },
          { label: getExamTermDisplayLabel("gear-scoring", "스코어링"), distinction: "미끄럼 방향 긁힘·용착" },
        ],
        evidence: evidence(["EXP-G03", "EXP-D03"]),
      },
    ],
    formulas: [
      {
        label: "끼워맞춤 틈새",
        formula: "Cmax=구멍 최대-축 최소, Cmin=구멍 최소-축 최대",
        note: "두 한계치가 모두 양수인지 확인해 끼워맞춤 종류까지 판정합니다.",
        conceptId: "PCON-019",
        evidence: evidence(["P-2025-3-Q01", "EXP-C04"]),
      },
    ],
  },
  {
    subjectId: "subject-4",
    sharedCore: subject4Core,
    written: {
      examDirection: "보전방식·TPM·상태진단의 목적과 적용 시점을 선택지에서 구분합니다.",
      priorities: ["보전방식 비교", "TPM·OEE·6대 로스", "진동·윤활·고장진단"],
      mustMemorize: [
        "사후=고장 후, 예방=주기, 예지=상태 추세, 개량=원인 제거",
        "OEE=시간가동률×성능가동률×양품률",
        "진동은 같은 위치·방향·운전조건에서 추세 비교",
      ],
      representativeQuestionIds: ["P-2025-3-Q03", "P-2026-1-Q05", "EXP-SUP-033"],
    },
    practicalWritten: {
      examDirection: "보전방식의 차이를 한 줄로 쓰고 TPM 단계·OEE·상태진단 순서를 답안으로 연결합니다.",
      priorities: ["보전방식·자주보전", "OEE·6대 로스", "진동·윤활·고장추적"],
      mustMemorize: [
        "사후=고장 후, 예방=주기, 예지=상태 추세, 개량=고장 원인 제거",
        `자주보전은 초기청소에서 ${getExamTermDisplayLabel("autonomous-maintenance-final-step", "자주관리 철저")}까지 7단계`,
        "OEE=시간가동률×성능가동률×양품률",
        "6대 로스는 시간·성능·품질 손실로 묶어 기억",
      ],
      representativeQuestionIds: ["P-2025-3-Q03", "P-2026-1-Q05", "EXP-SUP-033"],
    },
    quickComparisons: [
      {
        title: "보전방식 비교",
        rows: [
          { label: "사후보전", distinction: "고장 발생 후 복구" },
          { label: "예방보전", distinction: "주기·사용량 기준 사전 정비" },
          { label: "예지보전", distinction: "상태 추세로 정비시점 결정" },
          { label: "개량보전", distinction: "고장 원인이 생기지 않도록 설비 개선" },
        ],
        evidence: evidence(["EXP-SUP-033", "EXP-SUP-034"]),
      },
      {
        title: "TPM 6대 로스",
        rows: [
          { label: "시간", distinction: "고장 / 작업준비·조정" },
          { label: "성능", distinction: "일시정지·공운전 / 속도저하" },
          { label: "품질", distinction: "공정불량·수정 / 초기수율" },
        ],
        evidence: evidence(["P-2026-1-Q05"]),
      },
    ],
    formulas: [
      {
        label: "설비종합효율",
        formula: "OEE=시간가동률×성능가동률×양품률",
        note: "각 비율을 소수로 바꿔 곱한 뒤 마지막에 백분율로 표시합니다.",
        conceptId: "PCON-030",
        evidence: evidence(["P-2026-1-Q05"]),
      },
    ],
  },
];

export function getExamSubjectCheatSheet(
  subjectId: PracticalTextbookSubjectId,
) {
  return EXAM_SUBJECT_CHEAT_SHEETS.find(
    (summary) => summary.subjectId === subjectId,
  );
}

export function getExamSubjectLens(
  summary: ExamSubjectCheatSheet,
  lens: ExamSubjectLensId,
) {
  return summary[lens];
}

export function getExamSummaryItemByConceptId(conceptId: string) {
  return EXAM_SUBJECT_CHEAT_SHEETS.flatMap(
    (summary) => summary.sharedCore,
  ).find((item) => item.conceptId === conceptId);
}
