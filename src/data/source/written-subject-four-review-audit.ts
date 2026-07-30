import subjectFourSource from "@/data/source/written-subject-four-notion-body.json";
import {
  getSubjectFourFactCbtBindings,
  type SubjectFourFactCbtBinding,
} from "@/data/source/written-subject-four-cbt-links";
import { WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE } from "@/data/source/written-subject-four-memory-guide";
import {
  getWrittenSubjectFactId,
  getWrittenSubjectFactLessonTitles,
} from "@/data/source/written-subject-fact-lesson-links";
import type { PublicQuestion } from "@/lib/domain/types";

export type SubjectFourSourceDisposition =
  | "mapped_to_fact"
  | "duplicate_of"
  | "structural_only"
  | "held"
  | "excluded_nonlearning";

export type SubjectFourSourceOccurrence = {
  occurrenceId: string;
  lineNumber: number;
  text: string;
  disposition: SubjectFourSourceDisposition;
  factIds: readonly string[];
  reason: string;
};

export type SubjectFourClaimProvenance =
  | "source_preserved"
  | "supplemented"
  | "corrected"
  | "held_conflict";

export type SubjectFourFactClaimAudit = {
  factId: string;
  provenance: SubjectFourClaimProvenance;
  basisOccurrenceIds: readonly string[];
  evidenceLessonTitles: readonly string[];
  correctionReason?: string;
};

export type SubjectFourQuestionAuditDisposition =
  | "direct_to_fact"
  | "partial_only"
  | "not_applicable"
  | "held";

export type SubjectFourQuestionAudit = {
  questionId: string;
  disposition: SubjectFourQuestionAuditDisposition;
  factIds: readonly string[];
  reason: string;
};

function getBundleFactIds(...bundleIds: string[]) {
  const selected = new Set(bundleIds);
  return WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.filter((bundle) =>
    selected.has(bundle.id),
  ).flatMap((bundle) =>
    bundle.facts.map((fact) => getWrittenSubjectFactId(4, bundle, fact)),
  );
}

const SECTION_RANGES = [
  {
    start: 2,
    factIds: getBundleFactIds(
      "condition-diagnosis",
      "reliability-life-cycle",
      "diagnosis-methods-sensors",
    ),
  },
  {
    start: 19,
    factIds: getBundleFactIds(
      "signal-measurement",
      "diagnosis-methods-sensors",
    ),
  },
  {
    start: 24,
    factIds: getBundleFactIds(
      "vibration-foundation",
      "rotating-diagnosis",
    ),
  },
  {
    start: 70,
    factIds: getBundleFactIds(
      "noise-acoustics",
      "noise-calculation-control",
    ),
  },
  {
    start: 115,
    factIds: getBundleFactIds(
      "condition-diagnosis",
      "diagnosis-methods-sensors",
    ),
  },
  {
    start: 125,
    factIds: getBundleFactIds(
      "noise-acoustics",
      "noise-calculation-control",
    ),
  },
  {
    start: 142,
    factIds: getBundleFactIds(
      "noise-acoustics",
      "noise-calculation-control",
    ),
  },
  {
    start: 152,
    factIds: getBundleFactIds(
      "maintenance-methods",
      "maintenance-foundation-standards",
    ),
  },
  {
    start: 165,
    factIds: getBundleFactIds("maintenance-methods"),
  },
  {
    start: 178,
    factIds: getBundleFactIds(
      "factory-project",
      "economics-cost",
      "energy-management",
      "maintenance-foundation-standards",
    ),
  },
  {
    start: 226,
    factIds: getBundleFactIds(
      "reliability-life-cycle",
      "reliability-oee-calculation",
    ),
  },
  {
    start: 242,
    factIds: getBundleFactIds(
      "reliability-life-cycle",
      "reliability-oee-calculation",
      "economics-cost",
    ),
  },
  {
    start: 283,
    factIds: getBundleFactIds(
      "tpm-autonomous",
      "maintenance-organization-resources-qc",
    ),
  },
  {
    start: 316,
    factIds: getBundleFactIds("maintenance-organization-resources-qc"),
  },
  {
    start: 344,
    factIds: getBundleFactIds("maintenance-organization-resources-qc"),
  },
  {
    start: 364,
    factIds: getBundleFactIds(
      "maintenance-methods",
      "maintenance-foundation-standards",
    ),
  },
  {
    start: 373,
    factIds: getBundleFactIds(
      "tpm-autonomous",
      "maintenance-organization-resources-qc",
    ),
  },
  {
    start: 408,
    factIds: getBundleFactIds("maintenance-organization-resources-qc"),
  },
  {
    start: 432,
    factIds: getBundleFactIds("maintenance-organization-resources-qc"),
  },
  {
    start: 439,
    factIds: getBundleFactIds("maintenance-organization-resources-qc"),
  },
  {
    start: 460,
    factIds: getBundleFactIds(
      "lubrication-foundation",
      "lubrication-properties-deterioration",
    ),
  },
  {
    start: 498,
    factIds: getBundleFactIds(
      "lubricants-grease",
      "lubrication-properties-deterioration",
    ),
  },
  {
    start: 516,
    factIds: getBundleFactIds(
      "lubricants-grease",
      "grease-thickeners-tests",
    ),
  },
  {
    start: 539,
    factIds: getBundleFactIds("oil-supply-management"),
  },
  {
    start: 559,
    factIds: getBundleFactIds(
      "condition-diagnosis",
      "lubricants-grease",
      "lubrication-properties-deterioration",
      "machine-element-lubrication-analysis",
    ),
  },
  {
    start: 592,
    factIds: getBundleFactIds(
      "machine-element-lubrication-analysis",
      "gear-damage-types",
      "lubrication-foundation",
    ),
  },
  {
    start: 623,
    factIds: getBundleFactIds("maintenance-methods", "tpm-autonomous"),
  },
  {
    start: 629,
    factIds: getBundleFactIds(
      "reliability-life-cycle",
      "reliability-oee-calculation",
      "economics-cost",
    ),
  },
  {
    start: 639,
    factIds: getBundleFactIds(
      "tpm-autonomous",
      "reliability-oee-calculation",
    ),
  },
  {
    start: 651,
    factIds: getBundleFactIds("oil-supply-management"),
  },
  {
    start: 659,
    factIds: getBundleFactIds(
      "machine-element-lubrication-analysis",
      "gear-damage-types",
    ),
  },
  {
    start: 662,
    factIds: getBundleFactIds(
      "lubricants-grease",
      "grease-thickeners-tests",
    ),
  },
  {
    start: 669,
    factIds: getBundleFactIds(
      "lubrication-properties-deterioration",
      "machine-element-lubrication-analysis",
      "grease-thickeners-tests",
      "oil-supply-management",
    ),
  },
  {
    start: 678,
    factIds: getBundleFactIds(
      "vibration-foundation",
      "rotating-diagnosis",
      "noise-acoustics",
      "noise-calculation-control",
    ),
  },
  {
    start: 693,
    factIds: getBundleFactIds("gear-damage-types"),
  },
] as const;

const STRUCTURAL_LINES = new Set([
  1, 69, 151, 241, 363, 459, 621, 677, 678,
]);

const HELD_LINES = new Map<number, string>([
  [
    575,
    "신유 대비 점도 변화 교환값은 유종·장비·제조사 기준에 따라 달라 보편 수치로 공개하지 않음",
  ],
  [
    576,
    "전산가 교환 기준은 유종·설비별 관리기준 확인 전 절대값 공개 보류",
  ],
  [
    577,
    "같은 원문 안에 수분 0.1%·0.05%와 0.5%가 충돌해 수치 공개 보류",
  ],
  [578, "인화점 저하 교환 기준은 적용 시험법과 유종 범위 확인 전 보류"],
  [603, "NAS 사용 한계는 설비 요구 청정도에 따라 달라 단일 등급 공개 보류"],
  [604, "NAS 입자수 범위는 규격 판과 입자크기 정의 검증 전 보류"],
  [
    605,
    "같은 원문 안에 수분 0.1%·0.05%와 0.5%가 충돌해 수치 공개 보류",
  ],
  [607, "유압탱크 유면 절대 백분율은 장비 매뉴얼 우선으로 공개 보류"],
  [613, "유막 100% 파괴·첨가제 무조건 투입은 과도한 절대표현이라 보류"],
  [616, "오일 완전 100% 교환은 설비 절차와 오염도 분석 전 단정하지 않음"],
  [648, "OEE 목표 백분율은 조직·설비 목표치로 시험 보편값 공개 보류"],
  [654, "강제순환 50m/s 기준은 장치 조건 검증 전 보류"],
  [666, "리튬계 그리스의 최고·130℃ 절대표현은 제품 규격별 차이로 보류"],
  [668, "칼슘계 그리스 80℃ 절대표현은 제품 규격별 차이로 보류"],
  [672, "베어링 그리스 충전비는 구조·속도·제조사 지침에 따라 달라 보류"],
  [
    673,
    "같은 원문 안에 수분 0.1%·0.05%와 0.5%가 충돌해 수치 공개 보류",
  ],
  [674, "NAS 단일 사용 한계는 설비 요구 청정도에 따라 달라 보류"],
  [675, "점도·전산가 절대 교환값은 유종별 관리기준 확인 전 보류"],
  [676, "링 잠김·탱크 유면 절대값은 장비 매뉴얼 확인 전 보류"],
  [
    692,
    "앞 절의 Fast·Slow 설명과 정반대로 충돌하며 검수된 공개 레슨 기준으로 교정",
  ],
]);

function sectionFactIdsAt(lineNumber: number) {
  let factIds: readonly string[] = [];
  for (const section of SECTION_RANGES) {
    if (section.start > lineNumber) break;
    factIds = section.factIds;
  }
  return factIds;
}

export function getSubjectFourSourceOccurrenceAudit() {
  return subjectFourSource.body
    .split(/\r?\n/)
    .map((rawText, index): SubjectFourSourceOccurrence | null => {
      const lineNumber = index + 1;
      const text = rawText.trim();
      if (!text) return null;
      const occurrenceId = `s4-source-line-${String(lineNumber).padStart(3, "0")}`;

      const holdReason = HELD_LINES.get(lineNumber);
      if (holdReason) {
        return {
          occurrenceId,
          lineNumber,
          text,
          disposition: "held",
          factIds: [],
          reason: holdReason,
        };
      }

      if (
        STRUCTURAL_LINES.has(lineNumber) ||
        text === "---" ||
        /^\|[\s:-]+\|/.test(text) ||
        text.includes("핵심 키워드")
      ) {
        return {
          occurrenceId,
          lineNumber,
          text,
          disposition: "structural_only",
          factIds: [],
          reason: "과목·표·부록의 읽기 구조를 만드는 항목",
        };
      }

      const factIds = sectionFactIdsAt(lineNumber);
      if (factIds.length === 0) {
        return {
          occurrenceId,
          lineNumber,
          text,
          disposition: "excluded_nonlearning",
          factIds: [],
          reason: "학습 주장 이전의 문서 메타 구조",
        };
      }

      return {
        occurrenceId,
        lineNumber,
        text,
        disposition: "mapped_to_fact",
        factIds,
        reason: "해당 원문 절을 담당하는 공개 중주제·원자 fact에 연결",
      };
    })
    .filter(
      (occurrence): occurrence is SubjectFourSourceOccurrence =>
        occurrence !== null,
    );
}

const CORRECTED_FACT_REASONS = new Map<string, string>([
  [
    "s4-noise-calculation-control-fast-slow",
    "원문 내부의 상반된 Fast·Slow 설명을 검수된 공개 레슨과 기출 의미로 교정",
  ],
  [
    "s4-lubrication-properties-deterioration-contamination",
    "단일 NAS 한계값 대신 설비 요구 청정도와 현행 표기 확인 원칙으로 교정",
  ],
  [
    "s4-machine-element-lubrication-analysis-hydraulic-oil",
    "충돌하는 수분·유면 절대값을 제거하고 장비별 기준 우선으로 교정",
  ],
  [
    "s4-machine-element-lubrication-analysis-bearing-grease",
    "보편 충전비 단정 대신 구조·속도·제조사 기준 우선으로 교정",
  ],
  [
    "s4-grease-thickeners-tests-lithium",
    "최고·절대 온도 표현을 제거하고 일반적인 성능 특성으로 교정",
  ],
  [
    "s4-grease-thickeners-tests-calcium",
    "절대 사용온도 표현을 제거하고 전통적 칼슘비누계의 조건부 특성으로 교정",
  ],
]);

export function getSubjectFourFactClaimAudit() {
  const occurrences = getSubjectFourSourceOccurrenceAudit();

  return WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.flatMap((bundle) =>
    bundle.facts.map((fact): SubjectFourFactClaimAudit => {
      const factId = getWrittenSubjectFactId(4, bundle, fact);
      const correctionReason = CORRECTED_FACT_REASONS.get(factId);
      const basisOccurrenceIds = occurrences
        .filter(
          (occurrence) =>
            occurrence.disposition === "mapped_to_fact" &&
            occurrence.factIds.includes(factId),
        )
        .map((occurrence) => occurrence.occurrenceId);

      return {
        factId,
        provenance: correctionReason
          ? "corrected"
          : basisOccurrenceIds.length > 0
            ? "source_preserved"
            : "supplemented",
        basisOccurrenceIds,
        evidenceLessonTitles: getWrittenSubjectFactLessonTitles(
          4,
          bundle,
          fact,
        ),
        ...(correctionReason ? { correctionReason } : {}),
      };
    }),
  );
}

function reverseFactIdsByQuestion(
  bindings: readonly SubjectFourFactCbtBinding[],
  status: SubjectFourFactCbtBinding["status"],
) {
  const result = new Map<string, string[]>();
  for (const binding of bindings) {
    if (binding.status !== status) continue;
    for (const questionId of binding.questionIds) {
      const factIds = result.get(questionId) ?? [];
      factIds.push(binding.factId);
      result.set(questionId, factIds);
    }
  }
  return result;
}

export function getSubjectFourQuestionAudit(
  questions: readonly PublicQuestion[],
) {
  const bindings = getSubjectFourFactCbtBindings();
  const directByQuestion = reverseFactIdsByQuestion(
    bindings,
    "direct_original",
  );
  const partialByQuestion = reverseFactIdsByQuestion(
    bindings,
    "partial_context",
  );

  return questions
    .filter(
      (question) =>
        question.subjectId === "subject-4" && question.provenance.original,
    )
    .map((question): SubjectFourQuestionAudit => {
      const directFactIds = directByQuestion.get(question.id);
      if (directFactIds?.length) {
        return {
          questionId: question.id,
          disposition: "direct_to_fact",
          factIds: [...new Set(directFactIds)].sort(),
          reason: "원문 문항의 판단대상과 공개 fact의 의미가 직접 일치",
        };
      }

      const partialFactIds = partialByQuestion.get(question.id);
      if (partialFactIds?.length) {
        return {
          questionId: question.id,
          disposition: "partial_only",
          factIds: [...new Set(partialFactIds)].sort(),
          reason: "일부 조건만 겹쳐 직접 문제로는 공개하지 않음",
        };
      }

      return {
        questionId: question.id,
        disposition: "not_applicable",
        factIds: [],
        reason: "현재 통합 암기본 fact의 직접 판단대상 밖인 공개 원문",
      };
    });
}
