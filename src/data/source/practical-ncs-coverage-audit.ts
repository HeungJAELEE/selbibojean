import type { PracticalNcsCoverageHold } from "@/lib/domain/practical-types";

/**
 * NCS 11종 원문 대조에서 텍스트 레슨으로 승격하지 않은 범위다.
 * 보류는 누락이 아니라, 숫자·표준·원본 그림을 추정해 공개하지 않기 위한
 * 명시적 공개 차단 기록이다.
 */
export const PRACTICAL_NCS_COVERAGE_HOLDS: PracticalNcsCoverageHold[] = [
  {
    id: "NCS-HOLD-PNE-FLOW-CALC",
    ncsCode: "1503010215",
    title: "공압 유량식의 단위환산·압축성 조건",
    pdfPages: "34-35",
    printedPages: "22-23",
    figureNumbers: ["그림 1-14"],
    disposition: "held_source_or_standard",
    rationale:
      "원문에는 Q=A×v 관계가 있으나, L/min 환산과 압축공기 압력조건을 분리하지 않으면 계산문항 정답이 달라질 수 있다.",
    nextAction: "시험 조건과 단위가 함께 확인된 경우에만 계산문제로 승격한다.",
  },
  {
    id: "NCS-HOLD-HYD-MOTOR-TORQUE",
    ncsCode: "1503010216",
    title: "유압모터 토크·효율 수치계산",
    pdfPages: "79-80",
    printedPages: "67-68",
    figureNumbers: ["유압모터 작동 원리 도해"],
    disposition: "held_source_or_standard",
    rationale:
      "토크·배제용적·압력의 단위변환과 효율 조건이 문제별로 달라질 수 있어 원문 식만으로 공개 계산 풀이를 확정할 수 없다.",
    nextAction: "단위와 효율 조건이 명시된 독립 문제 또는 공식 기준을 확보한다.",
  },
  {
    id: "NCS-HOLD-SEN-LOADCELL",
    ncsCode: "1503010204",
    title: "로드셀 형식·원리의 세부 분류",
    pdfPages: "22",
    printedPages: "10",
    figureNumbers: [],
    disposition: "held_source_or_standard",
    rationale:
      "현재 확보된 원문 위치만으로는 로드셀의 형식별 원리·배선·정격을 안정적으로 교재화할 수 없다.",
    nextAction: "원리와 적용조건을 함께 제시하는 공식 기술자료를 추가 확보한다.",
  },
  {
    id: "NCS-HOLD-MSA-IPIK",
    ncsCode: "1503010201",
    title: "IP·IK 보호등급 표 전체 해독",
    pdfPages: "33-34",
    printedPages: "21-22",
    figureNumbers: ["그림 1-16-1-18"],
    disposition: "held_source_or_standard",
    rationale:
      "보호등급은 표준의 최신판과 제품 사양을 함께 확인해야 하므로 일부 숫자나 표를 발췌해 시험정답처럼 공개하지 않는다.",
    nextAction: "적용 표준판과 출제조건이 확인되면 표준·제품조건을 분리한 레슨으로 작성한다.",
  },
  {
    id: "NCS-HOLD-MSA-MOTOR-SELECTION",
    ncsCode: "1503010201",
    title: "모터 부하토크·용량 선정의 수치 적용",
    pdfPages: "27-28",
    printedPages: "15-16",
    figureNumbers: ["그림 1-5-1-9"],
    disposition: "held_source_or_standard",
    rationale:
      "부하 관성·가감속·안전율·효율이 빠진 상태에서 모터 선정을 단일 식으로 단정하면 오답이 될 수 있다.",
    nextAction: "변수와 적용조건이 완전한 문제 또는 제조사 선정 절차를 근거로 보강한다.",
  },
  {
    id: "NCS-HOLD-WELD-CONDITIONS",
    ncsCode: "1601050111",
    title: "WPS별 예열·층간온도·용접봉 관리 수치",
    pdfPages: "15-23, 53-54",
    printedPages: "3-11, 41-42",
    figureNumbers: ["그림 1-1", "그림 1-4-1-5", "그림 2-7-2-8"],
    disposition: "held_source_or_standard",
    rationale:
      "예열온도·층간온도·건조조건은 재질, 두께, 용접봉, WPS에 따라 달라 일반 수치로 공개하면 위험하다.",
    nextAction: "원리는 현재 레슨으로 유지하고 수치는 WPS·제조사 조건이 확인된 경우에만 제시한다.",
  },
  {
    id: "NCS-HOLD-SAFE-LEGAL",
    ncsCode: "1503010122",
    title: "조립안전관리의 법정 수치·현장별 통제조건",
    pdfPages: "24-28",
    printedPages: "12-16",
    figureNumbers: ["표 1-5"],
    disposition: "held_source_or_standard",
    rationale:
      "LOTO와 전동공구 안전의 세부 조건은 최신 법령, 사업장 절차, 제조사 매뉴얼이 우선이다.",
    nextAction: "현재 공개 레슨은 작업순서와 원칙만 유지하고, 수치·법정조건은 공식 최신근거 확인 후 추가한다.",
  },
  {
    id: "NCS-HOLD-DRAWING-STANDARD-TABLES",
    ncsCode: "1502010511",
    title: "표면거칠기·기하공차 표준표와 원본 도면",
    pdfPages: "28, 75-77, 120-125",
    printedPages: "16, 63-65, 108-113",
    figureNumbers: ["그림 2-1", "그림 3-16-3-23"],
    disposition: "held_source_or_standard",
    rationale:
      "표준 기호와 수치표는 적용판·도면 조건이 있어 표 일부만 분리해 정답화하지 않는다.",
    nextAction: "개념 정의는 유지하고 표준표·도면 이미지는 최신판 및 원본 이용조건 확인 후 추가한다.",
  },
];
