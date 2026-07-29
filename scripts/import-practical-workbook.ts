import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
import {
  NCS_SOURCE_REGISTRY,
  PRACTICAL_PDF_PAGE_BY_TOPIC,
  PRACTICAL_VISUAL_AID_BY_QUESTION,
  PRACTICAL_VISUAL_AIDS_BY_CONCEPT,
  PRACTICAL_VISUAL_AIDS,
} from "../src/data/source/practical-source-registry";
import { PRACTICAL_PRIMARY_CATEGORY_BY_QUESTION } from "../src/data/source/practical-question-categories";
import { practicalQuestionFormatLabel } from "../src/data/source/practical-question-format-labels";
import {
  PRACTICAL_AUTHORED_PAST_QUESTIONS,
  PRACTICAL_AUTHORED_PREDICTED_QUESTIONS,
} from "../src/data/source/practical-authored-predicted-questions";
import { PRACTICAL_ROUND2_RECONSTRUCTED_QUESTIONS } from "../src/data/source/practical-round2-reconstructed-questions";
import { PRACTICAL_SUPPLEMENTAL_PREDICTED_QUESTIONS } from "../src/data/source/practical-supplemental-predicted-questions";
import { PRACTICAL_CONCEPT_EDITORIAL } from "../src/data/source/practical-concept-editorial";
import { PRACTICAL_NCS_COVERAGE_HOLDS } from "../src/data/source/practical-ncs-coverage-audit";
import { PRACTICAL_SUPPLEMENTAL_CONCEPTS } from "../src/data/source/practical-supplemental-concepts";
import { PRACTICAL_WRITTEN_AUDIT_DECISIONS } from "../src/data/source/practical-written-audit-decisions";
import { applyPracticalTheoryReinforcement } from "../src/data/source/practical-theory-reinforcements";
import { buildBalancedPracticalPredictedQuestions } from "../src/data/source/practical-balanced-predicted-questions";
import writtenContent from "../src/data/generated/content.json";
import type {
  PracticalConcept,
  PracticalContent,
  PracticalImportReport,
  PracticalNcsCoverage,
  PracticalQuestion,
  PracticalRubricItem,
  PracticalSourceRef,
  PracticalStudyCategory,
  PracticalStudyCategoryId,
} from "../src/lib/domain/practical-types";
import type { AuditDisposition } from "../src/lib/domain/types";
import { isPublishablePracticalQuestion } from "../src/lib/domain/practical";
import { isLearnerVisiblePracticalQuestion } from "../src/lib/content/learner-visibility";

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

function buildNcsCoverage(concepts: PracticalConcept[]): PracticalNcsCoverage {
  const documents = Object.entries(NCS_SOURCE_REGISTRY).map(
    ([ncsCode, registry]) => {
      const linkedConcepts = concepts.filter((concept) =>
        concept.ncsSources.some((source) => source.ncsCode === ncsCode),
      );
      const conceptIds = linkedConcepts.map((concept) => concept.id).sort();
      const sourceReferenceCount = linkedConcepts.reduce(
        (count, concept) =>
          count +
          concept.ncsSources.filter((source) => source.ncsCode === ncsCode)
            .length,
        0,
      );
      const heldItems = PRACTICAL_NCS_COVERAGE_HOLDS.filter(
        (item) => item.ncsCode === ncsCode,
      );

      return {
        ncsCode,
        documentTitle: registry.title,
        version: registry.version,
        sourceUrl: registry.sourceUrl,
        sourceFileHash: registry.hash,
        conceptIds,
        sourceReferenceCount,
        heldItems,
        status:
          conceptIds.length > 0 && heldItems.length > 0
            ? ("covered_with_holds" as const)
            : conceptIds.length > 0
              ? ("covered" as const)
              : ("held" as const),
      };
    },
  );

  const unaccounted = documents.filter(
    (document) =>
      document.conceptIds.length === 0 && document.heldItems.length === 0,
  );
  if (unaccounted.length > 0) {
    throw new Error(
      `NCS 원문 대조 누락: ${unaccounted.map((item) => item.ncsCode).join(", ")}`,
    );
  }

  const uniqueLessonIds = new Set(
    documents.flatMap((document) => document.conceptIds),
  );
  return {
    summary: {
      totalDocuments: documents.length,
      accountedDocuments: documents.filter(
        (document) =>
          document.conceptIds.length > 0 || document.heldItems.length > 0,
      ).length,
      uniqueLessonCount: uniqueLessonIds.size,
      sourceReferenceCount: documents.reduce(
        (count, document) => count + document.sourceReferenceCount,
        0,
      ),
      heldItems: PRACTICAL_NCS_COVERAGE_HOLDS.length,
    },
    documents,
  };
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
  "P-2025-1-Q05": {
    disposition: "verified",
    note:
      "2025년 1회 복원 글의 입체·정면도·제3각법 배치를 기준으로 같은 모서리 정보를 갖춘 자체 SVG를 제작했다.",
  },
  "P-2025-1-Q06": {
    disposition: "verified",
    note:
      "2025년 1회 복원 글의 e-b-a-c-g-d-i-h-f 순서를 확인하고 NCS 열간조립 원리와 대조한 자체 절차 도식을 사용한다.",
  },
  "P-2025-1-Q09": {
    disposition: "verified",
    note:
      "2025년 1회 복원 글의 GHS 그림문자 배열을 기준으로 같은 판독조건의 자체 도식을 제작했다.",
  },
  "P-2025-1-Q10": {
    disposition: "verified",
    note:
      "2025년 1회 복원 글의 수평·수직·축방향 답과 회전기계 진동 측정 기준을 대조한 자체 방향도를 사용한다.",
  },
  "P-2025-2-Q03": {
    disposition: "verified",
    note:
      "2025년 2회 복원 글의 브래킷 A·B 지시 위치와 3-M4 깊이 10, 3-10 리브 조건을 자체 도면으로 재구성했다.",
  },
  "P-2025-2-Q04": {
    disposition: "verified",
    note:
      "2025년 2회 복원 글에서 네 공구의 명칭과 연결형 형식을 확인하고 자체 공구 도식을 사용한다.",
  },
  "P-2025-2-Q01-1": {
    disposition: "held_asset_missing",
    note:
      "정답 후보인 복열 자동조심 롤러베어링과 일치하는 NCS 사진은 확인했지만, 복원문제의 네 선택 사진 전체와 순서를 재현할 동일 원문 묶음은 확보하지 못했다.",
  },
  "P-2025-2-Q05": {
    disposition: "verified",
    note:
      "2025년 2회 복원 글의 48.2 mm 판독값이 나오도록 주척 48 mm와 버니어 0.2 mm 일치눈금을 자체 제작했다.",
  },
  "P-2025-2-Q10": {
    disposition: "held_source_missing",
    note:
      "기어 손상 사진과 공개답을 함께 확정할 동일 NCS 원문 또는 독립 기술근거를 확보하지 못했다.",
  },
  "P-2025-3-Q04": {
    disposition: "verified",
    note: "2025년 3회 복원 글의 사각·사다리꼴·톱니·둥근나사 순서를 자체 형상도로 재구성했다.",
  },
  "P-2025-3-Q05": {
    disposition: "verified",
    note: "2025년 3회 복원 글의 편심·편각 두 축 중심선 관계를 자체 도식으로 재구성했다.",
  },
  "P-2025-3-Q06": {
    disposition: "verified",
    note: "2025년 3회 복원 글의 인벌류트·사이클로이드 생성 설명을 자체 곡선 도식과 연결했다.",
  },
  "P-2025-3-Q07": {
    disposition: "verified",
    note:
      "2025년 3회 복원 글의 축 휨 측정 배치를 다이얼게이지와 V블록 자체 도식으로 재구성했다.",
  },
  "P-2025-3-Q10": {
    disposition: "verified",
    note: "2025년 3회 복원 글의 네 구성요소를 자체 베어링 단면도와 연결했다.",
  },
  "P-2026-1-Q03": {
    disposition: "verified",
    note:
      "2026년 1회 복원 글의 구동장치 단면과 ⑥·⑦·⑧ 위치 관계를 자체 단면도로 재구성했다.",
  },
  "P-2026-1-Q06": {
    disposition: "verified",
    note:
      "2026년 1회 복원 글에서 다이얼게이지·깊이 마이크로미터·내측 마이크로미터 순서를 확인하고, CC0·퍼블릭도메인 실사로 같은 식별 순서를 구성했다.",
  },
  "P-2026-1-Q10": {
    disposition: "verified",
    note:
      "2026년 1회 복원 글의 연선 압착 측정 설명과 NCS 저널베어링 점검 원리를 대조한 자체 단면도를 사용한다.",
  },
};

const ACTUAL_STEM_OVERRIDES: Record<string, string> = {
  "P-2025-1-Q01":
    "플랜지 커플링의 체결볼트 4개 중 1개가 절단된 상태이다. 볼트지름 10 mm, PCD 100 mm, 허용전단응력 50 MPa일 때 전달 가능한 회전토크를 구하시오.",
  "P-2025-1-Q02":
    "맞물린 두 기어 중 작은 기어를 고정하고 큰 기어의 잇면에 측정기를 설치해 틈새만큼 움직여 값을 읽는다. 측정항목 ①과 사용하는 측정기 ②를 쓰시오.",
  "P-2025-1-Q03":
    "자동화 시스템에서 센서가 기능을 충분히 발휘하기 위해 기본적으로 요구되는 성능 4가지를 쓰시오.",
  "P-2025-1-Q04":
    "그림 (가)~(라)를 보고 각 구름베어링의 명칭을 순서대로 쓰시오.",
  "P-2025-1-Q05":
    "주어진 입체를 화살표 방향에서 정면으로 보았을 때, 제시된 정면도를 기준으로 평면도와 우측면도를 제3각법으로 완성하시오.",
  "P-2025-1-Q06":
    "보기 a~i의 베어링 유도가열기 작업을 올바른 순서로 배열하시오.",
  "P-2025-1-Q07":
    "오버홀(overhaul)의 의미와 목적을 각각 쓰시오.",
  "P-2025-1-Q08":
    "다음 보기에서 O링의 구비조건으로 적합한 것을 모두 고르시오.",
  "P-2025-1-Q09":
    "다음 화학물질 경고 그림문자의 명칭과 의미를 쓰시오.",
  "P-2025-1-Q10":
    "감속기의 부하측과 반부하측 베어링 부위에 가속도 센서를 부착할 때 측정방향 3가지를 쓰시오.",
  "P-2025-2-Q01-1":
    "다음 네 베어링 그림 중 자동조심 롤러베어링을 골라 기호를 쓰시오.",
  "P-2025-2-Q01-2":
    "그림에서 자동조심 롤러베어링을 고르고, 보기에서 그 특징에 해당하는 항목을 모두 고르시오.",
  "P-2025-2-Q02":
    "센서의 히스테리시스(hysteresis)를 설명하시오.",
  "P-2025-2-Q03":
    "브래킷 도면에서 A와 B로 지시한 가공·형상 조건의 의미를 각각 설명하시오.",
  "P-2025-2-Q04":
    "그림 (1)~(4)의 공구와 보기 a~d의 설명을 알맞게 연결하시오.",
  "P-2025-2-Q05":
    "그림의 측정기 명칭을 쓰고 눈금을 판독하여 측정값을 mm로 쓰시오.",
  "P-2025-2-Q06":
    "전단응력 12 MPa인 M10 리머볼트 4개로 체결되고 PCD가 200 mm인 플랜지 커플링의 최대 전달토크를 구하시오.",
  "P-2025-2-Q07":
    "브레이크를 지나치게 사용해 마찰열로 브레이크 오일이 기화하고 배관에 기포가 생겨 제동력이 급격히 저하되는 현상의 명칭을 쓰시오.",
  "P-2025-2-Q08":
    "그림 (가)~(라)의 호흡보호구와 보기 a~d의 설명을 알맞게 연결하시오.",
  "P-2025-2-Q09":
    "산업재해 예방을 위한 LOTO의 의미와 목적을 쓰시오.",
  "P-2025-2-Q10":
    "기어 치면 손상에 관한 (가)~(다)의 설명을 읽고 각각의 명칭을 쓰시오.",
  "P-2025-3-Q01":
    "구멍 Ø60(+0.030/0), 축 Ø60(-0.005/-0.010)의 끼워맞춤 명칭과 최대틈새·최소틈새를 구하시오.",
  "P-2025-3-Q02":
    "다음 산업안전표지 (가)~(라)의 의미를 각각 쓰시오.",
  "P-2025-3-Q03":
    "TPM의 자주보전을 정의하고, 보기 a~e를 이용해 자주보전 7단계의 빈칸을 올바른 순서로 완성하시오.",
  "P-2025-3-Q04":
    "그림 (가)~(라)의 나사산 모양을 보고 각 나사의 명칭을 쓰시오.",
  "P-2025-3-Q05":
    "플랜지로 연결한 두 축의 정렬불량 그림 (가), (나)의 명칭을 쓰시오.",
  "P-2025-3-Q06":
    "실을 원기둥에서 풀 때 생기는 궤적과 구름원이 피치원 안팎을 구를 때 생기는 궤적에 해당하는 기어 치형곡선의 명칭을 각각 쓰시오.",
  "P-2025-3-Q07":
    "그림과 같이 축의 휨을 측정할 때 사용하는 주 공구 A와 보조 공구 B의 명칭을 쓰시오.",
  "P-2025-3-Q08":
    "복동실린더의 내경 32 mm, 로드지름 12 mm, 압력 0.5 MPa, 전·후진 추력효율 80%일 때 전진 및 후진 출력을 구하시오.",
  "P-2025-3-Q09":
    "유압식 브레이크 오일이 갖추어야 할 특성을 보기에서 모두 고르시오.",
  "P-2025-3-Q10":
    "구름베어링의 기본 구성요소 4가지를 쓰시오.",
  "P-2026-1-Q01":
    "회전운동을 직선운동으로 바꾸거나 직선운동을 회전운동으로 바꿀 때 사용하는 기어의 명칭을 쓰시오.",
  "P-2026-1-Q02":
    "보기 a~f의 안전표지에서 금지표지와 경고표지를 골라 기호·명칭을 쓰고, 지시표지에 따라 착용할 보호구를 쓰시오.",
  "P-2026-1-Q03":
    "기계 구동장치 단면도에서 ⑥, ⑦, ⑧로 지시한 부품의 명칭을 쓰시오.",
  "P-2026-1-Q04":
    "작업 시작 전·중·후 매일 실시하는 점검과, 일정 주기로 정비원을 중심으로 실시하는 점검의 명칭을 각각 쓰시오.",
  "P-2026-1-Q05":
    "부하시간 460분, 정지시간 60분, 생산량 400개, 기준사이클 0.5분/개, 실제사이클 0.8분/개, 양품률 98%일 때 설비종합효율을 구하시오.",
  "P-2026-1-Q06":
    "그림 (1)~(3)의 측정기 명칭을 각각 쓰시오.",
  "P-2026-1-Q07":
    "비압축성 유체를 사용하는 유압기기에 적용되는 파스칼의 원리를 설명하고 힘·면적 관계식을 완성하시오.",
  "P-2026-1-Q08":
    "슬리브의 내치와 크라우닝된 허브 외치가 맞물리는 커플링의 명칭과 특징 3가지를 쓰시오.",
  "P-2026-1-Q09":
    "도면을 보고 구동장치와 기어의 명칭, 표시된 기하공차 종류, Ø44G7/h6의 끼워맞춤 종류를 쓰시오.",
  "P-2026-1-Q10":
    "저널베어링 위에 연선을 놓고 캡을 규정토크로 조인 뒤 다시 분해해 눌린 연선 두께를 측정하는 작업의 명칭을 쓰시오.",
};

const ACTUAL_PROMPT_OPTIONS: Record<string, string[]> = {
  "P-2025-1-Q06": [
    "a. 온도센서를 베어링 내륜에 부착",
    "b. 언더바에 베어링을 끼워 가열기에 설치",
    "c. 가열온도 설정",
    "d. 설정온도 도달 후 가열 정지·탈자",
    "e. 베어링 내경에 맞는 언더바 선택",
    "f. 가열된 베어링을 축에 삽입해 자연냉각",
    "g. 가열 시작",
    "h. 전원을 끄고 언더바에서 베어링 분리",
    "i. 방열장갑 착용",
  ],
  "P-2025-1-Q08": [
    "A 내열성이 좋다",
    "B 마찰계수가 낮다",
    "C 내마멸성이 낮다",
    "D 내유성이 좋다",
    "E 압축저항성이 낮다",
    "F 유연성이 좋다",
    "G 장시간 사용해도 탄성을 유지한다",
    "H 영구변형이 되어야 한다",
    "I 온도변화에도 안정성을 유지한다",
  ],
  "P-2025-2-Q04": [
    "a. 기어·풀리·베어링 등을 축에서 분리할 때 사용하는 공구",
    "b. 원형 너트나 베어링 잠금너트의 홈 또는 걸고리에 걸어 조이거나 푸는 공구",
    "c. 스냅링을 벌리거나 오므려 축 또는 구멍에 설치하거나 빼는 공구",
    "d. 육각머리 볼트·너트를 조이거나 풀 때 사용하는 핸들과 여러 크기의 소켓으로 구성된 공구",
  ],
  "P-2025-2-Q08": [
    "a. 정화통을 통해 화학적 흡착으로 유기용제·산성 또는 염기성 가스에 대응한다.",
    "b. 입자상 오염물질을 차단하며 특급·1급·2급으로 구분한다.",
    "c. 산소가 충분하고 고농도 분진이나 유해물질이 있는 장소에서 작업시간이 길거나 작업강도가 클 때 송풍기로 여과공기를 공급한다.",
    "d. 외부 공기를 공급하며 산소 부족 또는 고농도 유해물질 장소에서 사용할 수 있으나 호스 때문에 이동이 제한된다.",
  ],
  "P-2025-2-Q01-2": [
    "a. 고속회전에 적합하다",
    "b. 외륜 궤도면이 구면이다",
    "c. 자동으로 중심이 조절된다",
    "d. 진동·충격하중에 약하다",
    "e. 일반적으로 가장 많이 사용되는 베어링이다",
    "f. 중심축 조절이 가능하다",
  ],
  "P-2025-3-Q03": [
    "a. 총점검",
    "b. 표준화",
    "c. 자주점검",
    "d. 자주보전 기준서 작성",
    "e. 발생원·곤란개소 대책",
  ],
  "P-2025-3-Q09": [
    "a. 비등점이 낮다",
    "b. 점도지수가 높다",
    "c. 내열성이 있다",
    "d. 인화점이 낮다",
    "e. 빙점이 높다",
    "f. 윤활성이 좋다",
    "g. 비압축성 유체이다",
    "h. 고무·금속 부품을 부식시키지 않는다",
  ],
};

const ACTUAL_ANSWER_OVERRIDES: Record<string, string> = {
  "P-2025-1-Q05":
    "정면도 위에 평면도를, 정면도 오른쪽에 우측면도를 배치하고 입체의 가시 모서리와 경사면을 제3각법으로 정확히 투상한다.",
  "P-2025-1-Q06": "e → b → a → c → g → d → i → h → f",
  "P-2025-2-Q01-2":
    "자동조심 롤러베어링은 (다)이다. 특징은 b 외륜 궤도면이 구면, c 자동조심, f 중심축 조절·정렬오차 허용이다.",
  "P-2025-3-Q03":
    "초기청소 → 발생원·곤란개소 대책 → 자주보전 기준서 작성 → 총점검 → 자주점검 → 표준화 → 자주관리",
  "P-2026-1-Q07":
    "밀폐된 비압축성 정지유체에 가한 압력은 모든 방향으로 동일하게 전달된다. P₁=P₂, 즉 F₁/A₁=F₂/A₂이다.",
};

function actualAudit(id: string, value: unknown): AuditDisposition {
  const decision = PRACTICAL_WRITTEN_AUDIT_DECISIONS[id];
  if (decision) return decision.disposition;
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
  if (id === "EXP-C03") return "verified";
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
  if (!explicitPrimary && input.id === "EXP-H04") {
    return {
      primaryStudyCategoryId: "work_procedure",
      studyCategoryIds: ["work_procedure", "visual_identification", "theory_concept"],
    };
  }
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
      const auditDecision = PRACTICAL_WRITTEN_AUDIT_DECISIONS[id];
      const answer =
        ACTUAL_ANSWER_OVERRIDES[id] ??
        auditDecision?.modelAnswer ??
        text(row["검증답안"]);
      const calculation = lines(row["계산식·조건"]);
      const visualAidId = promptVisualAidId(id);
      const stem =
        ACTUAL_STEM_OVERRIDES[id] ?? text(row["문제요약"]);
      const studyCategories = studyCategoriesForQuestion({
        id,
        title,
        stem,
        calculation,
        visualAidId,
      });
      return {
      id,
      kind: "past",
      title,
      formatLabel: practicalQuestionFormatLabel(id, title),
        stem,
        promptOptions: ACTUAL_PROMPT_OPTIONS[id],
        modelAnswer: answer,
        requiredKeywords:
          auditDecision?.requiredKeywords ?? list(answer),
        acceptedAnswers:
          auditDecision?.acceptedAnswers ?? [answer],
        calculation,
        unit: answer.match(/\b(?:N·m|N|MPa|mm|%|kN)\b/)?.[0] ?? null,
        rubric: rubric(null, id),
        traps: auditDecision?.traps ?? list(row["검토메모"]),
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
          auditDecision?.note ??
          ACTUAL_AUDIT_OVERRIDES[id]?.note ??
          text(row["검토메모"]),
      };
    },
  );
  actualQuestions.push(
    ...PRACTICAL_AUTHORED_PAST_QUESTIONS,
    ...PRACTICAL_ROUND2_RECONSTRUCTED_QUESTIONS,
  );

  const workbookPredictedQuestions: PracticalQuestion[] = rowsToRecords(
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
      formatLabel: practicalQuestionFormatLabel(id, title),
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
          ? "2026년 1회 OEE 계산 복원문제의 공식과 조건을 바탕으로 이미지 없이 풀 수 있는 지문형 예상문제로 공개한다."
          : text(row["검증상태"]),
    };
  });

  const expandedWorkbookPredictedQuestions = workbookPredictedQuestions.flatMap(
    (question) => {
      if (question.id !== "EXP-H04") return [question];

      const functionQuestion: PracticalQuestion = {
        ...question,
        id: "EXP-H04A",
        title: "축압기의 기능 3가지",
        formatLabel: "축압기의 기능 3가지",
        stem: "축압기의 기능 3가지를 쓰시오.",
        modelAnswer:
          "에너지 저장, 맥동·충격 흡수, 누설 보상 또는 비상 동력 공급.",
        requiredKeywords: ["에너지 저장", "맥동·충격 흡수", "누설 보상"],
        acceptedAnswers: [
          "에너지 저장",
          "압력에너지 저장",
          "맥동 흡수",
          "충격 흡수",
          "누설 보상",
          "비상 동력",
        ],
        rubric: [
          { id: "EXP-H04A-r1", label: "에너지 저장", points: 1 },
          { id: "EXP-H04A-r2", label: "맥동 또는 충격 흡수", points: 1 },
          { id: "EXP-H04A-r3", label: "누설 보상 또는 비상 동력 공급", points: 1 },
        ],
        traps: ["증압기처럼 압력을 높이는 장치로 설명", "안전조치를 기능 답안에 섞어 작성"],
        primaryStudyCategoryId: "theory_concept",
        studyCategoryIds: ["theory_concept"],
        predictedBasis: "NCS 유압제어의 어큐뮬레이터 기능·안전회로 수행내용",
        reviewNote:
          "원본 예상문항 EXP-H04의 복합 요구 중 기능 서술만 분리했다.",
      };

      const safetyQuestion: PracticalQuestion = {
        ...question,
        id: "EXP-H04B",
        title: "축압기 분해 전 조치 2가지",
        formatLabel: "축압기 분해 전 조치 2가지",
        stem: "축압기를 분해하기 전에 해야 할 안전조치 2가지를 쓰시오.",
        modelAnswer:
          "유압측을 차단·감압하여 잔압을 제거하고, 가스측 잔압 또는 충전압을 확인한 뒤 제조사 절차에 따라 방출·격리한다.",
        requiredKeywords: ["유압측 잔압 제거", "가스측 잔압 확인"],
        acceptedAnswers: [
          "유압 배출",
          "잔압 제거",
          "감압",
          "가스측 잔압 확인",
          "질소 충전압 확인",
          "차단 격리",
        ],
        rubric: [
          { id: "EXP-H04B-r1", label: "유압측 차단·감압·잔압 제거", points: 2 },
          { id: "EXP-H04B-r2", label: "가스측 잔압 또는 충전압 확인", points: 2 },
          { id: "EXP-H04B-r3", label: "제조사 절차·전용장비·격리 언급", points: 1 },
        ],
        traps: ["압력계 0만 보고 바로 분해", "산소나 압축공기 충전", "가압상태에서 플러그 또는 밸브 해체"],
        primaryStudyCategoryId: "work_procedure",
        studyCategoryIds: ["work_procedure", "theory_concept"],
        predictedBasis: "NCS 유압제어의 어큐뮬레이터 안전회로와 정비 전 잔압 제거 절차",
        reviewNote:
          "원본 예상문항 EXP-H04의 복합 요구 중 분해 전 안전조치만 분리했다.",
      };

      return [functionQuestion, safetyQuestion];
    },
  );

  const authoredPredictedQuestions = [
    ...PRACTICAL_AUTHORED_PREDICTED_QUESTIONS,
    ...PRACTICAL_SUPPLEMENTAL_PREDICTED_QUESTIONS,
  ];
  const predictedQuestions = [
    ...expandedWorkbookPredictedQuestions,
    ...authoredPredictedQuestions,
  ];
  const duplicatePredictedId = predictedQuestions.find(
    (question, index) =>
      predictedQuestions.findIndex((candidate) => candidate.id === question.id) !==
      index,
  );
  if (duplicatePredictedId) {
    throw new Error(`출제예상 문항 ID가 중복되었습니다: ${duplicatePredictedId.id}`);
  }
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
        [
          ...[...relatedPastQuestionIds, ...relatedPredictedQuestionIds]
            .map((questionId) => questionById.get(questionId)?.visualAidId)
            .filter((visualAidId): visualAidId is string =>
              Boolean(visualAidId),
            ),
          ...(PRACTICAL_VISUAL_AIDS_BY_CONCEPT[id] ?? []),
        ],
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

  const supplementalConcepts = PRACTICAL_SUPPLEMENTAL_CONCEPTS.map(
    (concept): PracticalConcept => {
      const relatedPastQuestionIds = actualQuestions
        .filter((question) => question.conceptIds.includes(concept.id))
        .map((question) => question.id);
      const relatedPredictedQuestionIds = predictedQuestions
        .filter((question) => question.conceptIds.includes(concept.id))
        .map((question) => question.id);
      const visualAidIds = [
        ...new Set(
          [
            ...[...relatedPastQuestionIds, ...relatedPredictedQuestionIds]
              .map((questionId) => questionById.get(questionId)?.visualAidId)
              .filter((visualAidId): visualAidId is string =>
                Boolean(visualAidId),
              ),
            ...(PRACTICAL_VISUAL_AIDS_BY_CONCEPT[concept.id] ?? []),
          ],
        ),
      ];

      return {
        ...concept,
        labels: [
          ...(relatedPastQuestionIds.length > 0
            ? (["practical_exam"] as const)
            : []),
          ...(relatedPredictedQuestionIds.length > 0
            ? (["predicted_exam"] as const)
            : []),
        ],
        relatedPastQuestionIds,
        relatedPredictedQuestionIds,
        visualAidIds,
      };
    },
  );

  const concepts: PracticalConcept[] = [
    ...workbookConcepts,
    ...supplementalConcepts,
  ].map(applyPracticalTheoryReinforcement);

  const balancedPredictedQuestions =
    buildBalancedPracticalPredictedQuestions({
      existingQuestions: questions,
      concepts,
      visualAids: PRACTICAL_VISUAL_AIDS,
      writtenQuestions: writtenContent.questions,
    });
  const oeeWorkbookQuestion = questionById.get("EXP-C03");
  const oeeWrittenEvidence = balancedPredictedQuestions.find(
    (question) => question.id === "EXP-BAL-CALC-OEE",
  );
  if (!oeeWorkbookQuestion || !oeeWrittenEvidence?.ncsSources[0]) {
    throw new Error("EXP-C03 공개에 필요한 검증된 OEE 필기 근거가 없습니다.");
  }
  oeeWorkbookQuestion.ncsSources = [oeeWrittenEvidence.ncsSources[0]];
  oeeWorkbookQuestion.writtenSourceQuestionIds =
    oeeWrittenEvidence.writtenSourceQuestionIds;
  const duplicateBalancedId = balancedPredictedQuestions.find(
    (question) => questionById.has(question.id),
  );
  if (duplicateBalancedId) {
    throw new Error(
      `균형 예상문항 ID가 기존 문항과 중복되었습니다: ${duplicateBalancedId.id}`,
    );
  }
  predictedQuestions.push(...balancedPredictedQuestions);
  questions.push(...balancedPredictedQuestions);
  for (const question of balancedPredictedQuestions) {
    questionById.set(question.id, question);
    for (const conceptId of question.conceptIds) {
      const concept = concepts.find((candidate) => candidate.id === conceptId);
      if (!concept) {
        throw new Error(
          `균형 예상문항의 연결 개념이 없습니다: ${question.id}/${conceptId}`,
        );
      }
      concept.relatedPredictedQuestionIds = [
        ...new Set([...concept.relatedPredictedQuestionIds, question.id]),
      ];
      if (!concept.labels.includes("predicted_exam")) {
        concept.labels.push("predicted_exam");
      }
    }
  }

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
  const unknownManifestIds = Object.keys(
    PRACTICAL_PRIMARY_CATEGORY_BY_QUESTION,
  ).filter((questionId) => !questionById.has(questionId));
  if (classifiedQuestionIds.size !== questions.length || unknownManifestIds.length > 0) {
    throw new Error(
      `실기 유형 분류 대사 실패: questions=${questions.length}, classified=${classifiedQuestionIds.size}, unknownManifest=${unknownManifestIds.join(",")}`,
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
  const ncsCoverage = buildNcsCoverage(concepts);
  const report: PracticalImportReport = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(sourcePath),
    sourceSha256,
    rows: {
      past: actualQuestions.length,
      predicted: predictedQuestions.length,
      workbookPredicted: expandedWorkbookPredictedQuestions.length,
      authoredPredicted: authoredPredictedQuestions.length,
      balancedPredicted: balancedPredictedQuestions.length,
      concepts: workbookConcepts.length,
      supplementalConcepts: PRACTICAL_SUPPLEMENTAL_CONCEPTS.length,
      ncsDocuments: rowsToRecords(ncsRows).length,
      visualAids: PRACTICAL_VISUAL_AIDS.length,
    },
    publication: {
      past: actualQuestions.filter(
        (question) =>
          isPublishablePracticalQuestion(question) &&
          isLearnerVisiblePracticalQuestion(question),
      ).length,
      predicted: predictedQuestions.filter(
        (question) =>
          isPublishablePracticalQuestion(question) &&
          isLearnerVisiblePracticalQuestion(question),
      ).length,
      concepts: workbookConcepts.filter((concept) => concept.contentStatus === "published").length,
      supplementalConcepts: PRACTICAL_SUPPLEMENTAL_CONCEPTS.filter(
        (concept) => concept.contentStatus === "published",
      ).length,
      held: held.length,
      heldByDisposition,
    },
    ncsCoverage: ncsCoverage.summary,
    exactMatch:
      actualQuestions.length === 51 &&
      expandedWorkbookPredictedQuestions.length === 41 &&
      authoredPredictedQuestions.length === 77 &&
      balancedPredictedQuestions.length === 67 &&
      predictedQuestions.length === 185 &&
      workbookConcepts.length === 46 &&
      rowsToRecords(ncsRows).length === 11 &&
      ncsCoverage.summary.totalDocuments === 11 &&
      ncsCoverage.summary.accountedDocuments === 11,
    warnings: [
      "EXP-C03 OEE 계산은 2026년 1회 복원문제의 공식과 조건을 바탕으로 이미지 없는 지문형 예상문제로 공개했다.",
      "제3각법 등 제3자 원도형은 공개 자산으로 복제하지 않고 같은 판독조건의 자체 SVG로 재구성했다.",
      "응시자 복원 캡처와 블로그 이미지는 문항 대조에만 사용하고 공개 이미지로 복제하지 않았다.",
    ],
  };

  const content: PracticalContent = {
    formatVersion: 1,
    generatedAt: report.generatedAt,
    questions,
    concepts,
    studyCategories,
    visualAids: PRACTICAL_VISUAL_AIDS,
    ncsCoverage,
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
