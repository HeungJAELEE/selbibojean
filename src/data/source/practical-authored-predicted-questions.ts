import type {
  PracticalQuestion,
  PracticalSourceRef,
} from "@/lib/domain/practical-types";
import { NCS_SOURCE_REGISTRY } from "./practical-source-registry";
import {
  PRACTICAL_TASK_INSPECTION_SEEDS,
  PRACTICAL_TASK_SEQUENCE_SEEDS,
} from "./practical-task-sequences";

/**
 * 원본 워크북의 40개 예상문제를 보존하면서, 실제 복원에서 확인된 파스칼
 * 관계식을 NCS 원문 근거로 확장한 자체 예상문제다.
 *
 * 실제 회차·출제횟수는 부여하지 않으며, 이 파일의 문제는 모두 occurrence=null이다.
 */
const PASCAL_NCS_SOURCE: PracticalSourceRef = {
  ncsCode: "1505010108",
  documentTitle: NCS_SOURCE_REGISTRY["1505010108"].title,
  version: NCS_SOURCE_REGISTRY["1505010108"].version,
  pdfPage: 140,
  printedPage: 122,
  figureNumber: null,
  performanceCriteria: "파스칼 원리와 유압에 의한 힘 전달",
  sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
  sourceUrl: NCS_SOURCE_REGISTRY["1505010108"].sourceUrl,
};

const GEAR_COUPLING_SEQUENCE_SOURCE: PracticalSourceRef = {
  ncsCode: "1505010108",
  documentTitle: NCS_SOURCE_REGISTRY["1505010108"].title,
  version: NCS_SOURCE_REGISTRY["1505010108"].version,
  pdfPage: 47,
  printedPage: 35,
  figureNumber: "그림 1-44",
  performanceCriteria: "기어 커플링 측정 및 조립 순서",
  sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
  sourceUrl: NCS_SOURCE_REGISTRY["1505010108"].sourceUrl,
};

const TAPERED_BEARING_SEQUENCE_SOURCE: PracticalSourceRef = {
  ncsCode: "1505010108",
  documentTitle: NCS_SOURCE_REGISTRY["1505010108"].title,
  version: NCS_SOURCE_REGISTRY["1505010108"].version,
  pdfPage: 130,
  printedPage: 118,
  figureNumber: "그림 3-43~3-48",
  performanceCriteria: "테이퍼 롤러베어링 조립 및 축방향 간극 조정",
  sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
  sourceUrl: NCS_SOURCE_REGISTRY["1505010108"].sourceUrl,
};

const BEARING_DAMAGE_SOURCE: PracticalSourceRef = {
  ncsCode: "1505010108",
  documentTitle: NCS_SOURCE_REGISTRY["1505010108"].title,
  version: NCS_SOURCE_REGISTRY["1505010108"].version,
  pdfPage: 133,
  printedPage: 121,
  figureNumber: "표 3-3",
  performanceCriteria: "베어링 손상 상태 확인과 원인·대책 판별",
  sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
  sourceUrl: NCS_SOURCE_REGISTRY["1505010108"].sourceUrl,
};

const RT_FILM_DEFECT_SOURCE: PracticalSourceRef = {
  ncsCode: "1601050108",
  documentTitle: NCS_SOURCE_REGISTRY["1601050108"].title,
  version: NCS_SOURCE_REGISTRY["1601050108"].version,
  pdfPage: 86,
  printedPage: 75,
  figureNumber: "그림 3-11",
  performanceCriteria: "방사선투과 필름 지시를 이용한 용접결함 판독",
  sourceFileHash: NCS_SOURCE_REGISTRY["1601050108"].hash,
  sourceUrl: NCS_SOURCE_REGISTRY["1601050108"].sourceUrl,
};

const taskSequenceSource = (
  sequence: (typeof PRACTICAL_TASK_SEQUENCE_SEEDS)[number],
): PracticalSourceRef => {
  const registry = NCS_SOURCE_REGISTRY[sequence.sourcePdfId];
  const firstFrame = sequence.frames[0];
  const lastFrame = sequence.frames.at(-1) ?? firstFrame;

  return {
    ncsCode: sequence.sourcePdfId,
    documentTitle: registry.title,
    version: registry.version,
    pdfPage: firstFrame.pdfPage,
    printedPage: firstFrame.printedPage,
    figureNumber: `${firstFrame.figureNumber}~${lastFrame.figureNumber}`,
    performanceCriteria:
      sequence.assessmentFormat === "inspection"
        ? `${sequence.title} 점검 위치와 측정 항목 판별`
        : `${sequence.title} 작업순서와 완료 판정`,
    sourceFileHash: registry.hash,
    sourceUrl: registry.sourceUrl,
  };
};

const taskSequenceQuestion = (
  sequence: (typeof PRACTICAL_TASK_SEQUENCE_SEEDS)[number],
): PracticalQuestion => {
  const occurrence = sequence.pastOccurrence ?? null;
  const occurrenceReviewNote = occurrence
    ? `${occurrence.year}년 ${occurrence.round}회 ${occurrence.questionNumber} 응시자 복원 유형을 NCS 원문 단계사진으로 재구성했다. 사진은 실제 시험지 원본이 아니라 순서 학습용 NCS 장면이다.`
    : null;

  return {
    id: sequence.questionId,
    kind: occurrence ? "past" : "predicted",
    title: sequence.title,
    formatLabel: "사진을 끌어 올바른 작업순서로 배열",
    stem: `다음 NCS 작업 장면을 ${sequence.title}의 올바른 순서로 배열하시오.`,
    modelAnswer: sequence.directAnswer,
    requiredKeywords: sequence.frames.map((frame) => frame.answerPhrase),
    acceptedAnswers: [
      sequence.frames.map((frame) => frame.answerPhrase).join(" → "),
    ],
    calculation: [],
    unit: null,
    rubric: [
      {
        id: `${sequence.questionId}-r1`,
        label: "전체 작업순서",
        points: 3,
      },
      {
        id: `${sequence.questionId}-r2`,
        label: "단계별 핵심 확인사항",
        points: 1,
      },
      {
        id: `${sequence.questionId}-r3`,
        label: "완료 후 검사·고정",
        points: 1,
      },
    ],
    traps: sequence.frames.slice(0, 3).map((frame) => frame.wrongAction),
    conceptIds: sequence.conceptIds,
    primaryStudyCategoryId: "work_procedure",
    studyCategoryIds: ["work_procedure", "visual_identification"],
    ncsSources: [taskSequenceSource(sequence)],
    visualAidId: sequence.id,
    label: occurrence ? "practical_exam" : "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence,
    predictedBasis: occurrence
      ? null
      : "NCS 원문 작업사진과 도해를 단계별로 분리하고, 제시 순서만 섞어 자체 구성했다.",
    reviewNote: occurrence
      ? occurrenceReviewNote!
      : "실제 기출 회차로 표시하지 않는 NCS 보강 순서형이다. 문제 화면은 중립 대체텍스트를 사용하고 정답 단계명은 제출 뒤 공개한다.",
    examFormat: "sequence",
    examCardIds: [sequence.examCardId],
    visualAidIds: [sequence.id],
    sequenceItemIds: sequence.frames.map(
      (_, index) => `${sequence.examCardId}-STEP-${index + 1}`,
    ),
    variantOfQuestionId: null,
    examEvidenceStatus: occurrence ? "past_reconstructed" : "ncs_supplement",
  };
};

const taskInspectionQuestion = (
  inspection: (typeof PRACTICAL_TASK_INSPECTION_SEEDS)[number],
): PracticalQuestion => ({
  id: inspection.questionId,
  kind: "predicted",
  title: inspection.title,
  formatLabel: "사진의 점검 위치와 측정 항목 연결",
  stem:
    "다음 NCS 브레이크 점검 장면 (가)~(라)를 보고 각 장면에서 확인하거나 측정하는 항목을 쓰시오.",
  modelAnswer:
    "(가) 패드 잔여 두께 측정, (나) 라이닝 슈 두께·폭 측정, (다) 브레이크액 수위·오염 확인, (라) 패드 표면·웨어 인디케이터 확인",
  requiredKeywords: [
    "패드 잔여 두께",
    "라이닝 슈 두께·폭",
    "브레이크액 수위·오염",
    "패드 표면·웨어 인디케이터",
  ],
  acceptedAnswers: [
    "패드 잔여 두께 / 라이닝 슈 두께·폭 / 브레이크액 수위·오염 / 패드 표면·웨어 인디케이터",
  ],
  calculation: [],
  unit: null,
  rubric: [
    {
      id: `${inspection.questionId}-r1`,
      label: "(가)·(나) 치수 측정 항목",
      points: 2,
    },
    {
      id: `${inspection.questionId}-r2`,
      label: "(다)·(라) 상태 점검 항목",
      points: 2,
    },
    {
      id: `${inspection.questionId}-r3`,
      label: "디스크 패드와 드럼 라이닝 구분",
      points: 1,
    },
  ],
  traps: [
    "사진을 근거 없이 고정 작업순서로 배열하지 않는다.",
    "패드 잔여 두께와 라이닝 슈 폭을 같은 측정으로 쓰지 않는다.",
    "브레이크액 수위만 보고 마찰재 상태 점검을 생략하지 않는다.",
  ],
  conceptIds: inspection.conceptIds,
  primaryStudyCategoryId: "visual_identification",
  studyCategoryIds: ["visual_identification", "theory_concept"],
  ncsSources: [taskSequenceSource(inspection)],
  visualAidId: inspection.id,
  label: "predicted_exam",
  auditDisposition: "verified",
  contentStatus: "published",
  occurrence: null,
  predictedBasis:
    "NCS 원문의 브레이크액·패드·라이닝 점검 사진을 정답 문구 없이 분리해 사진 식별형으로 구성했다.",
  reviewNote:
    "네 사진은 하나의 고정 작업순서를 보여 주지 않으므로 순서형으로 승격하지 않았다. 문제 화면에서는 점검명과 의미가 드러나지 않는 중립 파일명·대체텍스트를 사용한다.",
  examFormat: "image",
  examCardIds: [inspection.examCardId],
  visualAidIds: [inspection.id],
  sequenceItemIds: [],
  variantOfQuestionId: null,
  examEvidenceStatus: "ncs_supplement",
});

export const PRACTICAL_AUTHORED_PAST_QUESTIONS: PracticalQuestion[] =
  PRACTICAL_TASK_SEQUENCE_SEEDS.filter(
    (sequence) => sequence.pastOccurrence !== undefined,
  ).map(taskSequenceQuestion);

export const PRACTICAL_AUTHORED_PREDICTED_QUESTIONS: PracticalQuestion[] = [
  {
    id: "EXP-C08",
    kind: "predicted",
    title: "파스칼 원리의 압력 전달",
    formatLabel: "원리 정의(밀폐 정지유체의 압력 전달)",
    stem: "밀폐된 정지유체가 채워진 두 실린더에서 입력 피스톤을 누를 때, 출력 피스톤의 힘이 커질 수 있는 원리를 2문장 이내로 쓰시오.",
    modelAnswer:
      "입력 피스톤에 가한 힘으로 생긴 압력은 밀폐된 정지유체를 통해 출력측에도 동일하게 전달된다. P=F/A이므로 출력 피스톤의 면적이 더 크면 같은 압력에서 더 큰 출력힘을 얻는다.",
    requiredKeywords: [
      "밀폐 정지유체",
      "동일 압력 전달",
      "P=F/A",
      "출력 피스톤 면적",
    ],
    acceptedAnswers: [
      "밀폐된 정지유체에는 압력이 동일하게 전달되고, 출력측 면적이 크면 F=P×A에 따라 더 큰 힘을 낸다.",
      "P1=P2이고 P=F/A이므로 출력 피스톤 면적이 크면 출력힘이 커진다.",
    ],
    calculation: ["P=F/A", "밀폐된 정지유체에서 P₁=P₂"],
    unit: null,
    rubric: [
      { id: "EXP-C08-r1", label: "밀폐된 정지유체 조건", points: 1 },
      { id: "EXP-C08-r2", label: "동일 압력 전달", points: 2 },
      { id: "EXP-C08-r3", label: "P=F/A 또는 F=P×A 관계", points: 1 },
      { id: "EXP-C08-r4", label: "출력측 면적 증가와 출력힘 관계", points: 1 },
    ],
    traps: [
      "힘 자체가 그대로 전달된다고 쓰지 않는다.",
      "같은 것은 압력이며, 힘은 유효면적에 따라 달라진다.",
      "정지유체·밀폐 조건을 빼고 일반 유동 상태로 확대하지 않는다.",
    ],
    conceptIds: ["PCON-032"],
    primaryStudyCategoryId: "theory_concept",
    studyCategoryIds: ["theory_concept", "formula_calculation"],
    ncsSources: [PASCAL_NCS_SOURCE],
    visualAidId: null,
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "NCS 「운반하역기계 구동장치 정비」의 파스칼 원리와 유압에 의한 힘 전달 수행내용을 바탕으로, 실제 복원문제의 관계식을 정의형으로 변형해 자체 구성했다.",
    reviewNote:
      "NCS 원문 기반 자체 구성 문제다. 실제 회차·기출빈도에는 포함하지 않으며, 그림 없이도 정답 조건이 완결되는 정의형으로 작성했다.",
  },
  {
    id: "EXP-C06",
    kind: "predicted",
    title: "파스칼 면적비·이동거리 비교",
    formatLabel: "지름비에서 힘비·이동거리 비교",
    stem: "입력 피스톤의 지름이 20 mm, 출력 피스톤의 지름이 60 mm이다. 손실과 누설을 무시하고 입력 피스톤을 90 mm 이동시켰을 때, (1) 출력힘은 입력힘의 몇 배인지와 (2) 출력 피스톤의 이동거리를 구하시오.",
    modelAnswer:
      "(1) 출력힘은 입력힘의 9배이다. (2) 출력 피스톤의 이동거리는 10 mm이다.",
    requiredKeywords: ["지름비 제곱", "면적비 9", "체적 보존", "10 mm"],
    acceptedAnswers: [
      "힘비 9배, 이동거리 10 mm",
      "출력힘은 9배, 출력 이동거리는 10 mm",
    ],
    calculation: [
      "A₂/A₁=(D₂/D₁)²=(60/20)²=9",
      "F₂/F₁=A₂/A₁=9",
      "A₁s₁=A₂s₂ 이므로 s₂=90/9=10 mm",
    ],
    unit: "mm",
    rubric: [
      { id: "EXP-C06-r1", label: "면적비에 지름비의 제곱 적용", points: 2 },
      { id: "EXP-C06-r2", label: "출력힘비 9배", points: 1 },
      { id: "EXP-C06-r3", label: "체적 보존식 적용", points: 1 },
      { id: "EXP-C06-r4", label: "출력 이동거리 10 mm와 단위", points: 1 },
    ],
    traps: [
      "지름비 3을 그대로 힘비로 쓰지 않는다.",
      "출력 면적이 커지면 이동거리도 커진다고 쓰지 않는다.",
      "누설·손실을 무시한다는 문제 조건을 빠뜨리지 않는다.",
    ],
    conceptIds: ["PCON-032"],
    primaryStudyCategoryId: "formula_calculation",
    studyCategoryIds: ["formula_calculation", "theory_concept"],
    ncsSources: [PASCAL_NCS_SOURCE],
    visualAidId: null,
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "NCS 「운반하역기계 구동장치 정비」의 파스칼 원리·유압 힘 전달 수행내용과 2026년 1회 복원문제의 힘·면적 관계식을 결합한 자체 구성이다.",
    reviewNote:
      "NCS 원문 기반 자체 구성. 실제 회차·기출빈도에는 포함하지 않으며, 그림 없이 계산 조건을 완결해 제시한다.",
  },
  {
    id: "EXP-C07",
    kind: "predicted",
    title: "유압 브레이크의 파스칼 원리 적용",
    formatLabel: "유압 브레이크 적용과 압력 전달 설명",
    stem: "유압 브레이크에서 페달을 밟은 뒤 제동력이 생기기까지의 압력 전달 경로와, 출력측 힘이 달라지는 파스칼 원리를 3문장 이내로 쓰시오.",
    modelAnswer:
      "마스터 실린더에서 발생한 압력은 밀폐된 브레이크액과 배관을 통해 휠 실린더 또는 캘리퍼에 전달된다. 밀폐된 정지유체에서는 같은 압력이 전달되며 P=F/A이다. 따라서 출력측 유효면적이 달라지면 같은 압력에서도 제동력이 달라진다.",
    requiredKeywords: [
      "마스터 실린더",
      "밀폐 브레이크액·배관",
      "휠 실린더 또는 캘리퍼",
      "같은 압력",
      "유효면적",
    ],
    acceptedAnswers: [
      "마스터 실린더-브레이크액과 배관-휠 실린더(캘리퍼), 동일 압력, 면적비로 힘 변화",
      "마스터 실린더에서 발생한 압력이 밀폐 브레이크액을 통해 캘리퍼로 전달되고 유효면적에 따라 제동력이 달라진다",
    ],
    calculation: ["P=F/A", "밀폐된 정지유체의 압력 전달: P₁=P₂"],
    unit: null,
    rubric: [
      {
        id: "EXP-C07-r1",
        label: "마스터 실린더부터 출력측까지 전달 경로",
        points: 2,
      },
      { id: "EXP-C07-r2", label: "밀폐 유체의 동일 압력 전달", points: 1 },
      { id: "EXP-C07-r3", label: "유효면적에 따른 출력힘 변화", points: 1 },
      { id: "EXP-C07-r4", label: "P=F/A 또는 P₁=P₂ 적용", points: 1 },
    ],
    traps: [
      "압력이 면적에 비례해 커진다고 쓰지 않는다.",
      "출력측을 입력측과 같은 부품명으로만 쓰지 않는다.",
      "제동력은 압력만이 아니라 출력측 유효면적에도 관계됨을 빠뜨리지 않는다.",
    ],
    conceptIds: ["PCON-032"],
    primaryStudyCategoryId: "theory_concept",
    studyCategoryIds: ["theory_concept", "formula_calculation"],
    ncsSources: [PASCAL_NCS_SOURCE],
    visualAidId: null,
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "NCS 「운반하역기계 구동장치 정비」의 유압 브레이크 파스칼 원리·힘 전달 수행내용을 문장형 필답 조건으로 자체 구성했다.",
    reviewNote:
      "NCS 원문 기반 자체 구성. 실제 회차·기출빈도에는 포함하지 않으며, 장치 형상을 추정하지 않는 비이미지 서술형이다.",
  },
  {
    id: "EXP-VIS-GEAR-COUPLING-01",
    kind: "predicted",
    title: "기어 커플링 측정·조립 사진 순서",
    formatLabel: "사진 순서 배열과 단계별 핵심행동",
    stem: "다음 NCS 작업 장면 (가)~(라)를 기어 커플링의 측정·조립 순서대로 배열하고, 각 단계의 핵심행동을 쓰시오.",
    modelAnswer:
      "나 → 라 → 가 → 다. 같은 조건에서 양쪽 허브의 간격을 측정하고, 측정값에 맞춰 위치를 일치시킨 뒤 슬리브와 플랜지를 조립·체결한다. 마지막으로 지정 그리스를 주입하고 플러그를 체결한다.",
    requiredKeywords: [
      "나-라-가-다",
      "같은 조건 측정",
      "위치 일치",
      "조립·체결",
      "그리스 주입",
    ],
    acceptedAnswers: [
      "나 라 가 다",
      "(나)→(라)→(가)→(다)",
      "측정-위치맞춤-조립-그리스주입",
    ],
    calculation: [],
    unit: null,
    rubric: [
      {
        id: "EXP-VIS-GEAR-COUPLING-01-r1",
        label: "사진 순서 나-라-가-다",
        points: 2,
      },
      {
        id: "EXP-VIS-GEAR-COUPLING-01-r2",
        label: "동일 조건 간격 측정과 위치 맞춤",
        points: 1,
      },
      {
        id: "EXP-VIS-GEAR-COUPLING-01-r3",
        label: "조립·체결 후 그리스 주입",
        points: 2,
      },
    ],
    traps: [
      "그리스를 주입한 뒤 간격을 측정하지 않는다.",
      "간격 측정 없이 슬리브를 먼저 체결하지 않는다.",
      "조립 후 플러그 재체결을 빼지 않는다.",
    ],
    conceptIds: ["PCON-033"],
    primaryStudyCategoryId: "work_procedure",
    studyCategoryIds: ["work_procedure", "visual_identification"],
    ncsSources: [GEAR_COUPLING_SEQUENCE_SOURCE],
    visualAidId: "ncs-gear-coupling-sequence",
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "NCS 그림 1-44의 기어 커플링 측정·조립 연속 도해를 문제용으로 순서만 섞어 구성했다.",
    reviewNote:
      "NCS 원문 번호와 단계명을 크롭에서 제외했다. 문제 화면의 중립 대체텍스트에는 정답 순서를 넣지 않는다.",
    examFormat: "sequence",
    examCardIds: ["PWEC-GEAR-COUPLING-SEQUENCE"],
    visualAidIds: ["ncs-gear-coupling-sequence"],
    sequenceItemIds: [
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-1",
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-2",
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-3",
      "PWEC-GEAR-COUPLING-SEQUENCE-STEP-4",
    ],
    variantOfQuestionId: null,
    examEvidenceStatus: "ncs_supplement",
  },
  {
    id: "EXP-VIS-TAPERED-BEARING-01",
    kind: "predicted",
    title: "테이퍼 롤러베어링 조립·간극조정 사진 순서",
    formatLabel: "사진 순서 배열과 측정·고정 절차",
    stem: "다음 NCS 작업 장면 (가)~(마)를 테이퍼 롤러베어링 조립과 축방향 간극 조정 순서대로 배열하고, 간극 측정 후 실시할 조치를 쓰시오.",
    modelAnswer:
      "나 → 라 → 가 → 마 → 다. 안쪽 콘과 허브를 조립한 뒤 다이얼 게이지를 설치·영점 조정한다. 허브를 앞뒤로 흔들어 간극을 측정하고 규정값이 되도록 너트를 조정한 뒤 로크 와셔로 고정하고 커버를 조립한다.",
    requiredKeywords: [
      "나-라-가-마-다",
      "다이얼 게이지 영점",
      "허브를 앞뒤로 흔듦",
      "규정 간극",
      "로크 와셔 고정",
    ],
    acceptedAnswers: [
      "나 라 가 마 다",
      "(나)→(라)→(가)→(마)→(다)",
      "콘삽입-허브조립-게이지설치-간극조정-잠금",
    ],
    calculation: [],
    unit: null,
    rubric: [
      {
        id: "EXP-VIS-TAPERED-BEARING-01-r1",
        label: "사진 순서 나-라-가-마-다",
        points: 2,
      },
      {
        id: "EXP-VIS-TAPERED-BEARING-01-r2",
        label: "다이얼 게이지 설치·영점과 간극 측정",
        points: 2,
      },
      {
        id: "EXP-VIS-TAPERED-BEARING-01-r3",
        label: "규정값 조정 후 로크 와셔·커버 복구",
        points: 1,
      },
    ],
    traps: [
      "다이얼 게이지 설치 전에 조정 너트를 확정 고정하지 않는다.",
      "허브를 흔들지 않고 한 지점의 눈금만 읽지 않는다.",
      "간극 조정 뒤 로크 와셔 고정과 재확인을 빼지 않는다.",
    ],
    conceptIds: ["PCON-036"],
    primaryStudyCategoryId: "work_procedure",
    studyCategoryIds: ["work_procedure", "visual_identification"],
    ncsSources: [TAPERED_BEARING_SEQUENCE_SOURCE],
    visualAidId: "ncs-tapered-bearing-assembly-sequence",
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "NCS 그림 3-43~3-48의 테이퍼 롤러베어링 조립·간극조정 연속 사진을 문제용으로 순서만 섞어 구성했다.",
    reviewNote:
      "PDF p.130~132의 원문 사진을 단계별로 크롭했다. 제조사 규정 간극값은 문제에서 별도로 주어지지 않으면 특정 수치로 단정하지 않는다.",
    examFormat: "sequence",
    examCardIds: ["PWEC-TAPERED-BEARING-ASSEMBLY"],
    visualAidIds: ["ncs-tapered-bearing-assembly-sequence"],
    sequenceItemIds: [
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-1",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-2",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-3",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-4",
      "PWEC-TAPERED-BEARING-ASSEMBLY-STEP-5",
    ],
    variantOfQuestionId: null,
    examEvidenceStatus: "ncs_supplement",
  },
  {
    id: "EXP-VIS-BEARING-DAMAGE-01",
    kind: "predicted",
    title: "베어링 손상 사진 8종 판별",
    formatLabel: "손상 사진을 보고 명칭 쓰기",
    stem:
      "다음 NCS 베어링 손상 사진 (가)~(아)를 보고 각 손상명을 쓰시오.",
    modelAnswer:
      "(가) 파손, (나) 폴스 브리넬링·프레팅, (다) 녹·부식, (라) 플레이킹, (마) 전식, (바) 눌린 자국, (사) 용착, (아) 긁힘",
    requiredKeywords: [
      "파손",
      "폴스 브리넬링",
      "녹·부식",
      "플레이킹",
      "전식",
      "눌린 자국",
      "용착",
      "긁힘",
    ],
    acceptedAnswers: [
      "파손 / 폴스 브리넬링·프레팅 / 녹·부식 / 플레이킹 / 전식 / 눌린 자국 / 용착 / 긁힘",
    ],
    calculation: [],
    unit: null,
    rubric: [
      {
        id: "EXP-VIS-BEARING-DAMAGE-01-r1",
        label: "(가)~(라) 손상명",
        points: 2,
      },
      {
        id: "EXP-VIS-BEARING-DAMAGE-01-r2",
        label: "(마)~(아) 손상명",
        points: 2,
      },
      {
        id: "EXP-VIS-BEARING-DAMAGE-01-r3",
        label: "유사 손상 구분",
        points: 1,
      },
    ],
    traps: [
      "플레이킹과 눌린 자국을 모두 파손으로 적지 않는다.",
      "폴스 브리넬링과 전식을 같은 손상으로 보지 않는다.",
      "용착과 녹·부식을 변색만 보고 판단하지 않는다.",
    ],
    conceptIds: ["PCON-SUP-035"],
    primaryStudyCategoryId: "visual_identification",
    studyCategoryIds: ["visual_identification", "theory_concept"],
    ncsSources: [BEARING_DAMAGE_SOURCE],
    visualAidId: "ncs-bearing-damage-identification",
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "NCS 표 3-3의 손상 사진을 정답 문구 없이 분리하여 사진 식별형으로 구성했다.",
    reviewNote:
      "실제 시험 원본 사진이 아니라 NCS 보강 문제다. 문제 화면에서는 손상명이 보이지 않도록 사진 영역만 사용한다.",
    examFormat: "image",
    examCardIds: ["PWEC-BEARING-DAMAGE-IDENTIFICATION"],
    visualAidIds: ["ncs-bearing-damage-identification"],
    sequenceItemIds: [],
    variantOfQuestionId: null,
    examEvidenceStatus: "ncs_supplement",
  },
  {
    id: "EXP-VIS-RT-FILM-01",
    kind: "predicted",
    title: "RT 필름 용접결함 6종 판독",
    formatLabel: "방사선투과 필름을 보고 결함명 쓰기",
    stem:
      "다음 방사선투과 필름 (가)~(바)를 보고 각 용접결함명을 쓰시오.",
    modelAnswer:
      "(가) 균열, (나) 융합 불량, (다) 기공, (라) 언더컷, (마) 슬래그 섞임, (바) 용입 부족",
    requiredKeywords: [
      "균열",
      "융합 불량",
      "기공",
      "언더컷",
      "슬래그 섞임",
      "용입 부족",
    ],
    acceptedAnswers: [
      "균열 / 융합 불량 / 기공 / 언더컷 / 슬래그 섞임 / 용입 부족",
    ],
    calculation: [],
    unit: null,
    rubric: [
      {
        id: "EXP-VIS-RT-FILM-01-r1",
        label: "(가)~(다) 결함명",
        points: 2,
      },
      {
        id: "EXP-VIS-RT-FILM-01-r2",
        label: "(라)~(바) 결함명",
        points: 2,
      },
      {
        id: "EXP-VIS-RT-FILM-01-r3",
        label: "선형·원형 지시 구분",
        points: 1,
      },
    ],
    traps: [
      "용입 부족과 융합 불량을 같은 결함으로 쓰지 않는다.",
      "둥근 기공과 불규칙한 슬래그 지시를 구분한다.",
      "결함 위치를 보지 않고 밝기만으로 판독하지 않는다.",
    ],
    conceptIds: ["PCON-044", "PCON-045"],
    primaryStudyCategoryId: "visual_identification",
    studyCategoryIds: ["visual_identification", "theory_concept"],
    ncsSources: [RT_FILM_DEFECT_SOURCE],
    visualAidId: "ncs-rt-film-defect-identification",
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      "NCS 그림 3-11의 RT 필름을 정답 문구 없이 분리하여 결함 판독형으로 구성했다.",
    reviewNote:
      "실제 시험 원본 필름이 아니라 NCS 보강 문제다. 문제 화면에는 필름만 노출하고 결함명은 제출 후 보여 준다.",
    examFormat: "image",
    examCardIds: ["PWEC-RT-FILM-DEFECT-IDENTIFICATION"],
    visualAidIds: ["ncs-rt-film-defect-identification"],
    sequenceItemIds: [],
    variantOfQuestionId: null,
    examEvidenceStatus: "ncs_supplement",
  },
  ...PRACTICAL_TASK_INSPECTION_SEEDS.map(taskInspectionQuestion),
  ...PRACTICAL_TASK_SEQUENCE_SEEDS.filter(
    (sequence) => sequence.pastOccurrence === undefined,
  ).map(taskSequenceQuestion),
];
