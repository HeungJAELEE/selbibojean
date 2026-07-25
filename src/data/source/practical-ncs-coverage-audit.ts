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
    id: "NCS-HOLD-SEN-PHOTOELECTRIC",
    ncsCode: "1503010204",
    title: "광전스위치 세부 작동방식의 그림 판독",
    pdfPages: "53",
    printedPages: "41",
    figureNumbers: ["광전스위치 예시 그림"],
    disposition: "held_visual_asset",
    rationale:
      "원문 예시 그림만으로는 시험에서 요구할 수 있는 설치·광축·반사형 세부 판정을 동일하게 복원할 수 없다.",
    nextAction: "원본 그림번호와 정답 결정요소가 대조되면 그림 맞추기 항목으로 별도 승격한다.",
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
    id: "NCS-HOLD-WELD-REPAIR-VISUAL",
    ncsCode: "1601050108",
    title: "보수용접 결함 사진·검사 판정 이미지",
    pdfPages: "35, 61",
    printedPages: "23, 49",
    figureNumbers: ["결함부 보수·비파괴검사 도해"],
    disposition: "held_visual_asset",
    rationale:
      "결함 판정은 사진의 확대방향·표시·검사 조건에 좌우되므로 원본과 동일성 검증 없이 그림 문제로 공개하지 않는다.",
    nextAction: "NCS 그림번호와 공개 이용조건을 확인한 뒤 원본 또는 독립 재도식으로 재검수한다.",
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
  {
    id: "NCS-HOLD-MEASURING-VISUAL",
    ncsCode: "1502010504",
    title: "사인바·V블록·나사 유효경의 원본 측정 배치",
    pdfPages: "59-62, 67-68, 84-87",
    printedPages: "47-50, 55-56, 72-75",
    figureNumbers: ["그림 3-14-3-20", "그림 3-46"],
    disposition: "held_visual_asset",
    rationale:
      "측정값을 판정하는 핵심은 기구 배치와 눈금이므로, 원문 그림을 정확히 대조하기 전에는 그림 맞추기 문제로 공개하지 않는다.",
    nextAction: "원문 그림의 페이지·번호·정답 결정요소를 대조한 뒤 이미지를 별도 등록한다.",
  },
  {
    id: "NCS-HOLD-DRIVE-VISUAL",
    ncsCode: "1503010120",
    title: "구동장치 조립공구·축정렬 원본 사진",
    pdfPages: "19, 21, 42, 44-46",
    printedPages: "7, 9, 30, 32-34",
    figureNumbers: ["그림 2-7-2-10"],
    disposition: "held_visual_asset",
    rationale:
      "공구·정렬 상태는 촬영 방향과 부품 형상에 따라 답이 달라질 수 있어 원문 사진을 추정해 붙이지 않는다.",
    nextAction: "NCS 원본 사진의 공개 이용조건과 답안 판정요소를 확인한 후 이미지 학습으로 승격한다.",
  },
  {
    id: "NCS-HOLD-DRIVE-MAINTENANCE-VISUAL",
    ncsCode: "1505010108",
    title: "구동장치 정비의 원본 사진·간극 수치표",
    pdfPages: "96-100, 105, 116, 122, 156-168",
    printedPages: "84-88, 93, 104, 110, 144-156",
    figureNumbers: ["그림 3-6-3-42", "그림 4-23-4-36"],
    disposition: "held_visual_asset",
    rationale:
      "베어링·브레이크·윤활의 실사 사진과 간극 수치는 기종·도면·정비기준을 확인해야 하므로 원문 그대로 복제하거나 임의 도식으로 대체하지 않는다.",
    nextAction: "원본 사진·표의 이용조건과 실제 출제 캡처 일치 여부를 대조한 뒤 항목별로 승격한다.",
  },
];
