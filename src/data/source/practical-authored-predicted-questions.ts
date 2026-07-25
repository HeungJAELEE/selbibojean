import type { PracticalQuestion, PracticalSourceRef } from "@/lib/domain/practical-types";
import { NCS_SOURCE_REGISTRY } from "./practical-source-registry";

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

export const PRACTICAL_AUTHORED_PREDICTED_QUESTIONS: PracticalQuestion[] = [
  {
    id: "EXP-C08",
    kind: "predicted",
    title: "파스칼 원리의 압력 전달",
    formatLabel: "원리 정의(밀폐 정지유체의 압력 전달)",
    stem:
      "밀폐된 정지유체가 채워진 두 실린더에서 입력 피스톤을 누를 때, 출력 피스톤의 힘이 커질 수 있는 원리를 2문장 이내로 쓰시오.",
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
    stem:
      "입력 피스톤의 지름이 20 mm, 출력 피스톤의 지름이 60 mm이다. 손실과 누설을 무시하고 입력 피스톤을 90 mm 이동시켰을 때, (1) 출력힘은 입력힘의 몇 배인지와 (2) 출력 피스톤의 이동거리를 구하시오.",
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
    stem:
      "유압 브레이크에서 페달을 밟은 뒤 제동력이 생기기까지의 압력 전달 경로와, 출력측 힘이 달라지는 파스칼 원리를 3문장 이내로 쓰시오.",
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
      { id: "EXP-C07-r1", label: "마스터 실린더부터 출력측까지 전달 경로", points: 2 },
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
];
