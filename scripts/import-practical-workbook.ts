import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
import {
  NCS_SOURCE_REGISTRY,
  PRACTICAL_PDF_PAGE_BY_TOPIC,
  PRACTICAL_VISUAL_AID_BY_QUESTION,
  PRACTICAL_VISUAL_AIDS,
} from "../src/data/source/practical-source-registry";
import { PRACTICAL_PRIMARY_CATEGORY_BY_QUESTION } from "../src/data/source/practical-question-categories";
import { PRACTICAL_CONCEPT_EDITORIAL } from "../src/data/source/practical-concept-editorial";
import { PRACTICAL_SUPPLEMENTAL_CONCEPTS } from "../src/data/source/practical-supplemental-concepts";
import type {
  PracticalConcept,
  PracticalContent,
  PracticalImportReport,
  PracticalQuestion,
  PracticalRubricItem,
  PracticalSourceRef,
  PracticalStudyCategory,
  PracticalStudyCategoryId,
} from "../src/lib/domain/practical-types";
import type { AuditDisposition } from "../src/lib/domain/types";

const DEFAULT_SOURCE =
  "C:/Users/JaeheungLee/.codex/outputs/019f89fa-0297-7823-b778-dda466695604/설비보전기사_작업형실기_기출복원_출제예상40_개념통합_2차.xlsx";
const OUTPUT_DIR = path.join(process.cwd(), "src", "data", "generated");

type ConceptSourcePage = {
  code: keyof typeof NCS_SOURCE_REGISTRY;
  pdfPage: number;
  printedPage: number;
  figureNumber?: string;
  performanceCriteria: string;
};

const PRACTICAL_CONCEPT_SOURCE_PAGES: Record<string, ConceptSourcePage[]> = {
  "PCON-006": [
    { code: "1505010108", pdfPage: 122, printedPage: 110, figureNumber: "그림 3-33~3-34", performanceCriteria: "베어링 가열 조립과 열팽창을 이용한 끼워맞춤 작업" },
  ],
  "PCON-010": [
    { code: "1505010108", pdfPage: 75, printedPage: 63, figureNumber: "그림 2-15~2-16", performanceCriteria: "구동장치 진동 측정 위치와 상태진단" },
  ],
  "PCON-015": [
    { code: "1505010108", pdfPage: 153, printedPage: 141, performanceCriteria: "브레이크액의 수분 혼입과 베이퍼 록 점검" },
  ],
  "PCON-014": [
    { code: "1502010504", pdfPage: 84, printedPage: 72, performanceCriteria: "버니어캘리퍼스 눈금 읽기와 측정값 판독" },
  ],
  "PCON-017": [
    { code: "1503010122", pdfPage: 28, printedPage: 16, performanceCriteria: "정비 시 잠금장치·표지판 부착" },
    { code: "1505010108", pdfPage: 47, printedPage: 34, performanceCriteria: "정비 전 전원차단과 설치중 표시" },
  ],
  "PCON-018": [
    { code: "1505010108", pdfPage: 73, printedPage: 61, performanceCriteria: "기어 접촉무늬와 백래시 검사" },
    { code: "1505010108", pdfPage: 84, printedPage: 67, performanceCriteria: "기어 흠집·편마모·곰보 점검" },
  ],
  "PCON-019": [
    { code: "1502010511", pdfPage: 28, printedPage: 16, performanceCriteria: "공차역과 끼워맞춤 판정" },
  ],
  "PCON-020": [],
  "PCON-021": [],
  "PCON-022": [
    { code: "1505010108", pdfPage: 44, printedPage: 32, performanceCriteria: "풋라이너·조정볼트·다이얼게이지 축정렬" },
  ],
  "PCON-023": [
    { code: "1505010108", pdfPage: 59, printedPage: 47, performanceCriteria: "인벌류트·사이클로이드 치형 정의" },
  ],
  "PCON-024": [
    { code: "1502010504", pdfPage: 68, printedPage: 56, performanceCriteria: "다이얼게이지 0점 설정" },
    { code: "1502010504", pdfPage: 72, printedPage: 60, performanceCriteria: "다이얼게이지 구조와 특징" },
  ],
  "PCON-025": [
    { code: "1503010216", pdfPage: 48, printedPage: 36, performanceCriteria: "복동실린더 전진·후진 추력과 부하율" },
  ],
  "PCON-026": [
    { code: "1505010108", pdfPage: 140, printedPage: 122, performanceCriteria: "브레이크액 요구성질과 유압 전달" },
    { code: "1505010108", pdfPage: 155, printedPage: 142, performanceCriteria: "브레이크액 수분·베이퍼 록 점검" },
  ],
  "PCON-027": [],
  "PCON-028": [
    { code: "1502010511", pdfPage: 75, printedPage: 63, performanceCriteria: "투상·단면도 해독 원칙" },
  ],
  "PCON-029": [
    { code: "1503010201", pdfPage: 35, printedPage: 23, performanceCriteria: "일상·정기·정밀·특별점검 구분" },
  ],
  "PCON-030": [],
  "PCON-031": [
    { code: "1502010504", pdfPage: 67, printedPage: 55, performanceCriteria: "깊이·내측 마이크로미터 0점 설정" },
    { code: "1502010504", pdfPage: 68, printedPage: 56, performanceCriteria: "다이얼게이지 0점 설정" },
    { code: "1502010504", pdfPage: 72, printedPage: 60, performanceCriteria: "기본측정기 종류와 특징" },
  ],
  "PCON-032": [
    { code: "1505010108", pdfPage: 140, printedPage: 122, performanceCriteria: "파스칼 원리와 유압에 의한 힘 전달" },
  ],
  "PCON-033": [
    { code: "1505010108", pdfPage: 22, printedPage: 10, performanceCriteria: "기어 커플링의 구조와 토크 전달" },
    { code: "1505010108", pdfPage: 46, printedPage: 34, performanceCriteria: "기어 커플링 조립과 정렬·체결 점검" },
  ],
  "PCON-034": [],
  "PCON-035": [
    { code: "1505010108", pdfPage: 124, printedPage: 112, figureNumber: "그림 3-35~3-36", performanceCriteria: "저널베어링 간극·윤활상태 점검" },
  ],
  "PCON-036": [
    { code: "1503010120", pdfPage: 44, printedPage: 32, figureNumber: "그림 2-7~2-8", performanceCriteria: "베어링 조립 후 유격·예압·회전상태 확인" },
  ],
  "PCON-037": [
    { code: "1502010504", pdfPage: 87, printedPage: 75, performanceCriteria: "마이크로미터 슬리브·심블 눈금 판독" },
  ],
  "PCON-038": [
    { code: "1502010511", pdfPage: 77, printedPage: 65, performanceCriteria: "단면도 종류와 표시 관례" },
  ],
  "PCON-039": [
    { code: "1503010201", pdfPage: 54, printedPage: 42, performanceCriteria: "블리드오프 회로의 우회유량을 이용한 속도제어" },
  ],
  "PCON-040": [
    { code: "1503010216", pdfPage: 78, printedPage: 66, figureNumber: "그림 2-14", performanceCriteria: "어큐뮬레이터 기능과 안전회로" },
  ],
  "PCON-041": [
    { code: "1503010215", pdfPage: 24, printedPage: 12, performanceCriteria: "FRL 선정·배열·점검" },
  ],
  "PCON-042": [
    { code: "1503010215", pdfPage: 30, printedPage: 18, performanceCriteria: "방향제어밸브 종류·기호·조작방식" },
  ],
  "PCON-043": [
    { code: "1601050108", pdfPage: 14, printedPage: 2, performanceCriteria: "보수용접 안전과 보호구" },
    { code: "1503010122", pdfPage: 28, printedPage: 16, performanceCriteria: "조립·정비 안전통제" },
  ],
  "PCON-044": [
    { code: "1601050108", pdfPage: 35, printedPage: 23, performanceCriteria: "용접결함 제거와 보수 절차" },
  ],
  "PCON-045": [
    { code: "1601050108", pdfPage: 61, printedPage: 49, performanceCriteria: "용접부 비파괴검사와 판정" },
  ],
  "PCON-046": [
    { code: "1601050108", pdfPage: 35, printedPage: 23, performanceCriteria: "결함부 보수용접 수행순서" },
    { code: "1601050111", pdfPage: 15, printedPage: 3, performanceCriteria: "맞대기용접 조건과 작업 준비" },
  ],
};

type Row = Record<string, string | number | null>;

const DEFAULT_PAGE_BY_CODE: Record<string, { pdfPage: number; printedPage: number; figureNumber: string | null }> = {
  "1503010215": { pdfPage: 24, printedPage: 12, figureNumber: null },
  "1503010216": { pdfPage: 49, printedPage: 37, figureNumber: null },
  "1503010204": { pdfPage: 42, printedPage: 30, figureNumber: null },
  "1503010201": { pdfPage: 25, printedPage: 13, figureNumber: null },
  "1601050111": { pdfPage: 15, printedPage: 3, figureNumber: null },
  "1601050108": { pdfPage: 14, printedPage: 2, figureNumber: null },
  "1503010122": { pdfPage: 25, printedPage: 13, figureNumber: null },
  "1502010511": { pdfPage: 75, printedPage: 63, figureNumber: null },
  "1502010504": { pdfPage: 84, printedPage: 72, figureNumber: "그림 3-46" },
  "1503010120": { pdfPage: 42, printedPage: 30, figureNumber: null },
  "1505010108": { pdfPage: 96, printedPage: 84, figureNumber: null },
};

function valueToPrimitive(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function rowsToRecords(sheetRows: readonly (readonly unknown[])[]) {
  const headers = (sheetRows[0] ?? []).map((value) =>
    String(valueToPrimitive(value) ?? "").trim(),
  );
  return sheetRows.slice(1).flatMap((row) => {
    const record: Row = {};
    let hasValue = false;
    headers.forEach((header, index) => {
      if (!header) return;
      const value = valueToPrimitive(row[index] ?? null);
      record[header] = value;
      if (value !== null && value !== "") hasValue = true;
    });
    return hasValue ? [record] : [];
  });
}

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function list(value: unknown) {
  return text(value)
    .split(/\s*(?:;|→|,|\n)\s*/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function lines(value: unknown) {
  return text(value)
    .split(/\s*(?:→|\n)\s*/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOccurrence(year: unknown, round: unknown, number: unknown) {
  return `${text(year)}-${text(round)}-${text(number).replace(/\s+/g, "")}`;
}

function sourceCodes(value: unknown) {
  return text(value)
    .split(/\s*\+\s*/g)
    .map((code) => code.trim())
    .filter((code) => code in NCS_SOURCE_REGISTRY);
}

function topicPage(code: string, topic: string) {
  const topicEntry = Object.entries(PRACTICAL_PDF_PAGE_BY_TOPIC).find(
    ([key]) => key.startsWith(`${code}:`) && topic.includes(key.split(":")[1]),
  );
  return topicEntry?.[1] ?? DEFAULT_PAGE_BY_CODE[code];
}

function sourceRefs(codeValue: unknown, topic: string): PracticalSourceRef[] {
  return sourceCodes(codeValue).map((code) => {
    const registry =
      NCS_SOURCE_REGISTRY[code as keyof typeof NCS_SOURCE_REGISTRY];
    const page = topicPage(code, topic);
    return {
      ncsCode: code,
      documentTitle: registry.title,
      version: registry.version,
      pdfPage: page?.pdfPage ?? null,
      printedPage: page?.printedPage ?? null,
      figureNumber: page?.figureNumber ?? null,
      performanceCriteria: `${topic} 관련 NCS 수행내용과 작업·점검 절차`,
      sourceFileHash: registry.hash,
      sourceUrl: registry.sourceUrl,
    };
  });
}

function conceptSourceRefs(
  conceptId: string,
  codeValue: unknown,
  topic: string,
): PracticalSourceRef[] {
  if (!(conceptId in PRACTICAL_CONCEPT_SOURCE_PAGES)) {
    return sourceRefs(codeValue, topic);
  }
  return PRACTICAL_CONCEPT_SOURCE_PAGES[conceptId].map((page) => {
    const registry = NCS_SOURCE_REGISTRY[page.code];
    return {
      ncsCode: page.code,
      documentTitle: registry.title,
      version: registry.version,
      pdfPage: page.pdfPage,
      printedPage: page.printedPage,
      figureNumber: page.figureNumber ?? null,
      performanceCriteria: page.performanceCriteria,
      sourceFileHash: registry.hash,
      sourceUrl: registry.sourceUrl,
    };
  });
}

function rubric(value: unknown, questionId: string): PracticalRubricItem[] {
  const raw = list(value);
  if (raw.length === 0) {
    return [{ id: `${questionId}-r1`, label: "핵심 답안과 적용조건", points: 5 }];
  }
  return raw.map((item, index) => {
    const match = item.match(/(\d+(?:\.\d+)?)\s*점/);
    return {
      id: `${questionId}-r${index + 1}`,
      label: item.replace(/\s*\d+(?:\.\d+)?\s*점\s*$/g, "").trim() || item,
      points: match ? Number(match[1]) : 1,
    };
  });
}

const ACTUAL_AUDIT_OVERRIDES: Record<
  string,
  { disposition: AuditDisposition; note: string }
> = {
  "P-2025-1-Q06": {
    disposition: "held_source_missing",
    note:
      "복원문제는 유도가열기 작업순서를 요구하지만 확보한 NCS 그림은 오일 배스 가열·가열 후 조립 장면이다. 동일 작업순서 원문을 확보하기 전까지 공개하지 않는다.",
  },
  "P-2025-1-Q09": {
    disposition: "held_asset_missing",
    note:
      "안전표지의 모양·색상 식별에 원그림이 필요하나 현재 저장소에 시험 원그림 또는 동일 NCS 원본이 없다.",
  },
  "P-2025-1-Q10": {
    disposition: "held_asset_missing",
    note:
      "H·V·A 측정방향을 판단할 시험 원그림과 동일 NCS 원본을 찾지 못했다. 자체 제작 도식은 기출 문제 자료로 사용하지 않는다.",
  },
  "P-2025-2-Q04": {
    disposition: "held_asset_missing",
    note:
      "복원문제의 네 정비 공구를 모두 포함하는 동일 NCS 원사진을 확인하지 못했다.",
  },
  "P-2025-2-Q01-1": {
    disposition: "held_asset_missing",
    note:
      "정답 후보인 복열 자동조심 롤러베어링과 일치하는 NCS 사진은 확인했지만, 복원문제의 네 선택 사진 전체와 순서를 재현할 동일 원문 묶음은 확보하지 못했다.",
  },
  "P-2025-2-Q05": {
    disposition: "held_asset_missing",
    note:
      "확보한 NCS 버니어캘리퍼스 원문 예시는 21.60 mm이며 복원문제의 48.2 mm 눈금과 다르다.",
  },
  "P-2025-2-Q10": {
    disposition: "held_source_missing",
    note:
      "기어 손상 사진과 공개답을 함께 확정할 동일 NCS 원문 또는 독립 기술근거를 확보하지 못했다.",
  },
  "P-2025-3-Q04": {
    disposition: "held_asset_missing",
    note: "나사산 형상 식별에 필요한 시험 원그림과 동일 NCS 원본이 없다.",
  },
  "P-2025-3-Q05": {
    disposition: "held_asset_missing",
    note: "축정렬 불량 유형을 판별할 시험 원그림과 동일 NCS 원본이 없다.",
  },
  "P-2025-3-Q06": {
    disposition: "held_asset_missing",
    note: "기어 치형 곡선을 판별할 시험 원그림과 동일 NCS 원본이 없다.",
  },
  "P-2025-3-Q07": {
    disposition: "held_asset_missing",
    note:
      "다이얼 게이지·V블록의 정확한 측정 배치를 보여 주는 시험 원그림과 동일 NCS 원본이 없다.",
  },
  "P-2025-3-Q10": {
    disposition: "held_asset_missing",
    note: "번호가 붙은 베어링 구성요소 원그림과 동일 NCS 원본이 없다.",
  },
  "P-2026-1-Q06": {
    disposition: "held_asset_missing",
    note: "세 측정기의 시험 실사와 동일한 NCS 원사진을 확인하지 못했다.",
  },
  "P-2026-1-Q10": {
    disposition: "held_asset_missing",
    note:
      "저널베어링 납선 간극 측정의 시험 단면도와 동일한 NCS 원본을 확인하지 못했다.",
  },
};

function actualAudit(id: string, value: unknown): AuditDisposition {
  const override = ACTUAL_AUDIT_OVERRIDES[id];
  if (override) return override.disposition;
  const status = text(value);
  if (
    status === "verified" ||
    status === "cbt_corrected" ||
    status === "held_answer_conflict" ||
    status === "held_asset_missing" ||
    status === "held_source_missing"
  ) {
    return status;
  }
  return "held_source_missing";
}

function predictedAudit(id: string, value: unknown): AuditDisposition {
  if (id === "EXP-C03") return "held_source_missing";
  if (text(value).startsWith("held_")) {
    // EXP-S02는 이미지 없이도 표지의 색·형상·의미를 묻도록 정식 재작성한다.
    return id === "EXP-S02" ? "verified" : (text(value) as AuditDisposition);
  }
  return "verified";
}

function predictedStem(id: string, original: string) {
  if (id === "EXP-B01") {
    return "NCS 원문 사진 (가)~(라)를 보고 각 베어링의 명칭을 순서대로 쓰시오.";
  }
  if (id === "EXP-G04") {
    return "평행 오프셋 불량, 각도 불량, 복합 불량의 정의와 두 축 중심선의 관계를 각각 설명하시오.";
  }
  if (id === "EXP-D02") {
    return "축정렬 불량 중 평행 오프셋과 각도 불량을 중심선의 위치 및 각도 관계로 비교하시오.";
  }
  if (id === "EXP-S02") {
    return "안전표지에서 금지·경고·지시 표지를 구분하는 색상과 기본 형상, 작업자가 따라야 할 행동을 각각 쓰시오.";
  }
  if (id === "EXP-W03") {
    return `${original} 단, 모재·용접절차·제조사 기준을 확인해야 하는 항목을 답안에 포함하시오.`;
  }
  return original;
}

function predictedAnswer(id: string, original: string) {
  if (id === "EXP-B01") {
    return "(가) 원통 롤러 베어링, (나) 테이퍼 롤러 베어링, (다) 스러스트 볼 베어링, (라) 스러스트 니들 베어링";
  }
  return original;
}

function promptVisualAidId(questionId: string) {
  const visualAidId = PRACTICAL_VISUAL_AID_BY_QUESTION[questionId];
  if (!visualAidId) return null;
  const visualAid = PRACTICAL_VISUAL_AIDS.find((aid) => aid.id === visualAidId);
  return visualAid?.publicUseStatus === "public" &&
    visualAid.examMatchStatus === "exact_source"
    ? visualAid.id
    : null;
}

const STUDY_CATEGORY_DEFINITIONS: Array<
  Omit<PracticalStudyCategory, "questionIds" | "conceptIds">
> = [
  {
    id: "visual_identification",
    title: "그림·사진 식별",
    shortTitle: "그림 맞추기",
    description:
      "NCS 원문 사진·도면·기호에서 형상, 배치, 지시선, 눈금과 기호를 읽어 명칭이나 상태를 판별합니다.",
    ncsLearningFlow: [
      "먼저 전체 장치와 촬영·단면 방향을 확인합니다.",
      "정답을 가르는 형상, 전동체, 지시선, 눈금, 기호를 찾습니다.",
      "보기와 비슷한 장치의 구조 차이를 비교합니다.",
      "원본 그림이 없으면 형상이나 번호를 추정하지 않습니다.",
    ],
    examMethods: [
      "사진을 보고 명칭 쓰기",
      "번호가 붙은 구성요소 쓰기",
      "눈금·도면·기호 판독",
      "그림으로 상태·불량 유형 구분",
    ],
  },
  {
    id: "formula_calculation",
    title: "공식·계산",
    shortTitle: "공식 문제",
    description:
      "공식의 물리적 의미와 적용조건을 먼저 확인하고 단위를 통일한 뒤 계산과 검산까지 수행합니다.",
    ncsLearningFlow: [
      "문제에서 주어진 값과 요구값을 기호로 정리합니다.",
      "공식의 적용조건과 유효면적·반지름·효율을 확인합니다.",
      "N, mm, MPa 등 단위를 먼저 통일합니다.",
      "계산식, 대입, 결과, 단위를 순서대로 답안에 씁니다.",
    ],
    examMethods: [
      "전달토크·추력 계산",
      "공차·틈새·끼워맞춤 계산",
      "OEE·효율 계산",
      "측정값과 총지시변동 계산",
    ],
  },
  {
    id: "theory_concept",
    title: "이론·개념",
    shortTitle: "개념 문제",
    description:
      "정의, 구조, 기능, 특징, 고장현상과 비교 기준을 NCS 수행내용의 표현으로 정리합니다.",
    ncsLearningFlow: [
      "용어의 정의와 목적을 한 문장으로 구분합니다.",
      "구성요소와 작동원리를 원인과 결과로 연결합니다.",
      "유사 개념은 구조, 하중, 기능, 적용대상으로 비교합니다.",
      "답안에는 필수 기술용어와 적용조건을 함께 씁니다.",
    ],
    examMethods: [
      "정의·목적 쓰기",
      "특징 복수 서술",
      "현상·원인·대책 연결",
      "유사 장치·보전방식 비교",
    ],
  },
  {
    id: "work_procedure",
    title: "작업·절차형(필답)",
    shortTitle: "작업순서 문제",
    description:
      "실제 작업형 과제가 아니라 필답에서 조립·분해·점검·안전·시운전 순서를 서술하는 유형입니다.",
    ncsLearningFlow: [
      "작업 전 에너지 차단과 안전상태를 먼저 확보합니다.",
      "분해·점검·교체·조립 순서를 선후관계로 정리합니다.",
      "측정값과 합격기준, 체결·윤활 조건을 확인합니다.",
      "시운전과 최종 확인, 기록까지 답안에 포함합니다.",
    ],
    examMethods: [
      "작업순서 배열",
      "점검항목·판정기준 쓰기",
      "LOTO·안전조치 서술",
      "분해·조립·보수용접 표준흐름",
    ],
  },
];

function studyCategoriesForQuestion(input: {
  id: string;
  title: string;
  stem: string;
  calculation: string[];
  visualAidId: string | null;
}): {
  primaryStudyCategoryId: PracticalStudyCategoryId;
  studyCategoryIds: PracticalStudyCategoryId[];
} {
  const explicitPrimary =
    PRACTICAL_PRIMARY_CATEGORY_BY_QUESTION[input.id];
  if (!explicitPrimary) {
    throw new Error(`문항 주분류가 없습니다: ${input.id}`);
  }
  const value = `${input.title} ${input.stem}`;
  const categories = new Set<PracticalStudyCategoryId>();
  const visual =
    Boolean(input.visualAidId) ||
    /사진|그림|도면|단면|투상|해칭|식별|판독|눈금|기호|측정기|나사산 형상|치형 곡선|구성요소|표지/.test(
      value,
    );
  const formula =
    input.calculation.length > 0 ||
    /전달토크|추력|출력|OEE 계산|최대.?최소 틈새|끼워맞춤과 틈새|파스칼 원리|유압출력|TIR|측정값을 구|토크를 구|계산/.test(
      value,
    );
  const work =
    /작업|순서|절차|장착|조립|분해|점검|측정방법|정비|오버홀|LOTO|안전조치|보수용접|엔드플레이|급유|시운전|유량제어회로/.test(
      value,
    );
  const theory =
    /정의|목적|특징|요구성능|히스테리시스|기능|원리|현상|비교|종류|분류|손상|베이퍼 록|랙과 피니언/.test(
      value,
    );

  if (visual) categories.add("visual_identification");
  if (formula) categories.add("formula_calculation");
  if (work) categories.add("work_procedure");
  if (theory || categories.size === 0) categories.add("theory_concept");

  const primaryStudyCategoryId = explicitPrimary;

  return {
    primaryStudyCategoryId,
    studyCategoryIds: [
      primaryStudyCategoryId,
      ...[...categories].filter((category) => category !== primaryStudyCategoryId),
    ],
  };
}

function questionSourceRefs(
  questionId: string,
  codeValue: unknown,
  topic: string,
): PracticalSourceRef[] {
  const visualAidId = promptVisualAidId(questionId);
  const visualAid = PRACTICAL_VISUAL_AIDS.find(
    (aid) => aid.id === visualAidId,
  );
  if (!visualAid) return sourceRefs(codeValue, topic);
  const registry =
    NCS_SOURCE_REGISTRY[
      visualAid.ncsCode as keyof typeof NCS_SOURCE_REGISTRY
    ];
  return [
    {
      ncsCode: visualAid.ncsCode,
      documentTitle: registry.title,
      version: registry.version,
      pdfPage: visualAid.pdfPage,
      printedPage: visualAid.printedPage,
      figureNumber: visualAid.figureNumber,
      performanceCriteria: `${topic} 관련 NCS 원문 그림과 수행내용`,
      sourceFileHash: visualAid.sourceFileHash,
      sourceUrl: registry.sourceUrl,
    },
  ];
}

function conceptForQuestion(
  questionId: string,
  occurrenceKey: string | null,
  conceptTitle: string,
  concepts: Array<{ id: string; title: string; actual: string; predicted: string }>,
) {
  const direct = concepts.filter((concept) => {
    if (questionId.startsWith("EXP-")) {
      return concept.predicted.includes(questionId);
    }
    if (!occurrenceKey) return false;
    return concept.actual
      .split(/\s*;\s*/g)
      .some((item) => item.replace(/\s+/g, "-") === occurrenceKey);
  });
  if (direct.length > 0) return direct.map((concept) => concept.id);

  const normalizedTitle = conceptTitle.replace(/\s+/g, "");
  const fallback = concepts.find(
    (concept) =>
      concept.title.replace(/\s+/g, "").includes(normalizedTitle) ||
      normalizedTitle.includes(concept.title.replace(/\s+/g, "").replace(/\(.*?\)/g, "")),
  );
  return fallback ? [fallback.id] : [];
}

async function main() {
  const sourcePath = process.env.PRACTICAL_WORKBOOK ?? DEFAULT_SOURCE;
  const sourceBuffer = await readFile(sourcePath);
  const sourceSha256 = createHash("sha256").update(sourceBuffer).digest("hex");
  const [actualRows, predictedRows, conceptRows, ncsRows] = await Promise.all([
    readSheet(sourceBuffer, "기출문항_41"),
    readSheet(sourceBuffer, "예상문제_40"),
    readSheet(sourceBuffer, "실기개념_상세"),
    readSheet(sourceBuffer, "NCS문서_11"),
  ]);

  const rawConcepts = rowsToRecords(conceptRows);
  const conceptIndex = rawConcepts.map((row) => ({
    id: text(row["개념ID"]),
    title: text(row["개념명·표기"]),
    actual: text(row["관련 복원문제"]),
    predicted: text(row["관련 예상문제"]),
  }));

  const actualQuestions: PracticalQuestion[] = rowsToRecords(actualRows).map(
    (row) => {
      const id = text(row["문항ID"]);
      const title = text(row["개념명"]);
      const auditDisposition = actualAudit(id, row["검수상태"]);
      const occurrenceKey = normalizeOccurrence(
        row["연도"],
        row["회차"],
        row["문항번호"],
      );
      const answer = text(row["검증답안"]);
      const calculation = lines(row["계산식·조건"]);
      const visualAidId = promptVisualAidId(id);
      const studyCategories = studyCategoriesForQuestion({
        id,
        title,
        stem: text(row["문제요약"]),
        calculation,
        visualAidId,
      });
      return {
        id,
        kind: "past",
        title,
        stem: text(row["문제요약"]),
        modelAnswer: answer,
        requiredKeywords: list(answer),
        acceptedAnswers: [answer],
        calculation,
        unit: answer.match(/\b(?:N·m|N|MPa|mm|%|kN)\b/)?.[0] ?? null,
        rubric: rubric(null, id),
        traps: list(row["검토메모"]),
        conceptIds: conceptForQuestion(
          id,
          occurrenceKey,
          title,
          conceptIndex,
        ),
        ...studyCategories,
        ncsSources: questionSourceRefs(id, row["NCS코드"], title),
        visualAidId,
        label: "practical_exam",
        auditDisposition,
        contentStatus:
          auditDisposition === "verified" || auditDisposition === "cbt_corrected"
            ? "published"
            : "in_review",
        occurrence: {
          year: Number(row["연도"]),
          round: Number(row["회차"]),
          questionNumber: text(row["문항번호"]),
          sourceType: text(row["출처유형"]),
          sourceUrl: text(row["출처URL"]),
          reconstructionConfidence: text(row["복원확실도"]),
        },
        predictedBasis: null,
        reviewNote:
          ACTUAL_AUDIT_OVERRIDES[id]?.note ?? text(row["검토메모"]),
      };
    },
  );

  const predictedQuestions: PracticalQuestion[] = rowsToRecords(
    predictedRows,
  ).map((row) => {
    const id = text(row["예상문제ID"]);
    const title = text(row["문제명"]).replace(/\s*\(출제 예상\)\s*$/g, "");
    const auditDisposition = predictedAudit(id, row["검증상태"]);
    const calculation = lines(row["계산과정"]);
    const visualAidId = promptVisualAidId(id);
    const stem = predictedStem(id, text(row["문제"]));
    const studyCategories = studyCategoriesForQuestion({
      id,
      title,
      stem,
      calculation,
      visualAidId,
    });
    return {
      id,
      kind: "predicted",
      title,
      stem,
      modelAnswer: predictedAnswer(id, text(row["모범답안"])),
      requiredKeywords:
        id === "EXP-B01"
          ? ["원통 롤러", "테이퍼 롤러", "스러스트 볼", "스러스트 니들"]
          : list(row["필수키워드"]),
      acceptedAnswers:
        id === "EXP-B01"
          ? [
              "원통형 롤러 베어링",
              "테이퍼드 롤러 베어링",
              "추력 볼 베어링",
              "추력 니들 롤러 베어링",
            ]
          : list(row["허용표현"]),
      calculation,
      unit: text(row["단위"]) || null,
      rubric:
        id === "EXP-B01"
          ? [
              { id: `${id}-r1`, label: "(가)~(라) 명칭 각 1점", points: 4 },
              {
                id: `${id}-r2`,
                label: "전동체 형상과 하중방향 연결",
                points: 2,
              },
            ]
          : rubric(row["부분점수"], id),
      traps:
        id === "EXP-B01"
          ? ["스러스트 볼과 스러스트 니들 혼동", "사진 순서를 답안 순서와 다르게 작성"]
          : list(row["오답함정"]),
      conceptIds: conceptForQuestion(id, null, title, conceptIndex),
      ...studyCategories,
      ncsSources: questionSourceRefs(
        id,
        row["NCS수행준거·코드"],
        title,
      ),
      visualAidId,
      label: "predicted_exam",
      auditDisposition,
      contentStatus:
        auditDisposition === "verified" || auditDisposition === "cbt_corrected"
          ? "published"
          : "in_review",
      occurrence: null,
      predictedBasis: text(row["예상근거"]),
      reviewNote:
        id === "EXP-C03"
          ? "OEE 계산 근거가 현재 확보한 NCS 11종에 없어 추가 원문 확보 전까지 공개하지 않는다."
          : text(row["검증상태"]),
    };
  });

  const questions = [...actualQuestions, ...predictedQuestions];
  const questionById = new Map(questions.map((question) => [question.id, question]));

  const workbookConcepts: PracticalConcept[] = rawConcepts.map((row) => {
    const id = text(row["개념ID"]);
    const editorial = PRACTICAL_CONCEPT_EDITORIAL[id];
    if (!editorial) {
      throw new Error(`교과서형 실기 개념 편집본이 없습니다: ${id}`);
    }
    const relatedPastQuestionIds = actualQuestions
      .filter((question) => question.conceptIds.includes(id))
      .map((question) => question.id);
    const relatedPredictedQuestionIds = predictedQuestions
      .filter((question) => question.conceptIds.includes(id))
      .map((question) => question.id);
    const labels = [
      ...(relatedPastQuestionIds.length > 0 ? (["practical_exam"] as const) : []),
      ...(relatedPredictedQuestionIds.length > 0
        ? (["predicted_exam"] as const)
        : []),
    ];
    const ncsCode = text(row["NCS문서"]);
    const visualAidIds = [
      ...new Set(
        [...relatedPastQuestionIds, ...relatedPredictedQuestionIds]
          .map((questionId) => questionById.get(questionId)?.visualAidId)
          .filter((visualAidId): visualAidId is string => Boolean(visualAidId)),
      ),
    ];
    return {
      id,
      title: text(row["개념명·표기"]).replace(/\s*\((?:공통|실기 출제|출제 예상)\)\s*$/g, ""),
      contentRole: "exam_linked",
      labels,
      subjectLabel: text(row["관련과목"]),
      groupLabel: text(row["대단원·세부항목군"]),
      learningGoals: editorial.learningGoals,
      definition: editorial.definition,
      principle: editorial.principle,
      components: editorial.components,
      procedure: editorial.procedure,
      formula: editorial.formula,
      diagnosis: editorial.diagnosis,
      safety: editorial.safety,
      examFormats: editorial.examFormats,
      requiredKeywords: editorial.requiredKeywords,
      traps: editorial.traps,
      relatedPastQuestionIds,
      relatedPredictedQuestionIds,
      existingLessonId: text(row["기존레슨ID"]) || null,
      theoryTreatment: text(row["이론처리방식"]),
      visualAidIds,
      ncsSources: conceptSourceRefs(
        id,
        ncsCode,
        text(row["개념명·표기"]),
      ),
      ncsLearningPoints: editorial.ncsLearningPoints,
      sourceReviewNote: editorial.sourceReviewNote,
      contentStatus: "published",
    };
  });

  const concepts: PracticalConcept[] = [
    ...workbookConcepts,
    ...PRACTICAL_SUPPLEMENTAL_CONCEPTS,
  ];

  const studyCategories: PracticalStudyCategory[] =
    STUDY_CATEGORY_DEFINITIONS.map((category) => {
      const questionIds = questions
        .filter(
          (question) => question.primaryStudyCategoryId === category.id,
        )
        .map((question) => question.id);
      const conceptIds = concepts
        .filter((concept) =>
          [...concept.relatedPastQuestionIds, ...concept.relatedPredictedQuestionIds]
            .some((questionId) => questionIds.includes(questionId)),
        )
        .map((concept) => concept.id);
      return { ...category, questionIds, conceptIds };
    });

  const classifiedQuestionIds = new Set(
    studyCategories.flatMap((category) => category.questionIds),
  );
  if (
    classifiedQuestionIds.size !== questions.length ||
    Object.keys(PRACTICAL_PRIMARY_CATEGORY_BY_QUESTION).length !==
      questions.length
  ) {
    throw new Error(
      `실기 유형 분류 대사 실패: questions=${questions.length}, classified=${classifiedQuestionIds.size}, manifest=${Object.keys(PRACTICAL_PRIMARY_CATEGORY_BY_QUESTION).length}`,
    );
  }

  const held = questions.filter(
    (question) =>
      question.auditDisposition !== "verified" &&
      question.auditDisposition !== "cbt_corrected",
  );
  const heldByDisposition = held.reduce<Record<string, number>>(
    (counts, question) => {
      counts[question.auditDisposition] =
        (counts[question.auditDisposition] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const report: PracticalImportReport = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(sourcePath),
    sourceSha256,
    rows: {
      past: actualQuestions.length,
      predicted: predictedQuestions.length,
      concepts: workbookConcepts.length,
      supplementalConcepts: PRACTICAL_SUPPLEMENTAL_CONCEPTS.length,
      ncsDocuments: rowsToRecords(ncsRows).length,
      visualAids: PRACTICAL_VISUAL_AIDS.length,
    },
    publication: {
      past: actualQuestions.filter((question) => question.contentStatus === "published").length,
      predicted: predictedQuestions.filter((question) => question.contentStatus === "published").length,
      concepts: workbookConcepts.filter((concept) => concept.contentStatus === "published").length,
      supplementalConcepts: PRACTICAL_SUPPLEMENTAL_CONCEPTS.filter(
        (concept) => concept.contentStatus === "published",
      ).length,
      held: held.length,
      heldByDisposition,
    },
    exactMatch:
      actualQuestions.length === 41 &&
      predictedQuestions.length === 40 &&
      workbookConcepts.length === 46 &&
      rowsToRecords(ncsRows).length === 11,
    warnings: [
      "EXP-C03 OEE 계산은 현재 확보한 NCS 11종 밖의 원문이 필요하여 공개 보류했다.",
      "제3각법 등 제3자 표준 출처가 표시된 원도형은 공개 자산으로 복제하지 않았다.",
      "응시자 복원 캡처는 출제 이력 대조에만 사용하고 공개 이미지로 복제하지 않았다.",
    ],
  };

  const content: PracticalContent = {
    formatVersion: 1,
    generatedAt: report.generatedAt,
    questions,
    concepts,
    studyCategories,
    visualAids: PRACTICAL_VISUAL_AIDS,
    report,
  };

  await Promise.all([
    writeFile(
      path.join(OUTPUT_DIR, "practical-content.json"),
      `${JSON.stringify(content, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(OUTPUT_DIR, "practical-import-report.json"),
      `${JSON.stringify(report, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(OUTPUT_DIR, "practical-visual-aids.json"),
      `${JSON.stringify(PRACTICAL_VISUAL_AIDS, null, 2)}\n`,
      "utf8",
    ),
  ]);

  console.log(
    JSON.stringify(
      {
        rows: report.rows,
        publication: report.publication,
        exactMatch: report.exactMatch,
      },
      null,
      2,
    ),
  );
}

await main();
