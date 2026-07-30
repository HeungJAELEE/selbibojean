import subjectOneSource from "@/data/source/written-subject-one-notion-body.json";
import {
  getSubjectOneFactCbtBindings,
  type SubjectOneFactCbtBinding,
} from "@/data/source/written-subject-one-cbt-links";
import { WRITTEN_SUBJECT_ONE_MEMORY_GUIDE } from "@/data/source/written-subject-one-memory-guide";
import {
  getWrittenSubjectFactId,
  getWrittenSubjectFactLessonTitles,
} from "@/data/source/written-subject-fact-lesson-links";
import type { PublicQuestion } from "@/lib/domain/types";

export type SubjectOneSourceDisposition =
  | "mapped_to_fact"
  | "duplicate_of"
  | "structural_only"
  | "held"
  | "excluded_nonlearning";

export type SubjectOneSourceOccurrence = {
  occurrenceId: string;
  lineNumber: number;
  text: string;
  disposition: SubjectOneSourceDisposition;
  factIds: readonly string[];
  reason: string;
};

export type SubjectOneClaimProvenance =
  | "source_preserved"
  | "supplemented"
  | "corrected"
  | "held_conflict";

export type SubjectOneFactClaimAudit = {
  factId: string;
  provenance: SubjectOneClaimProvenance;
  basisOccurrenceIds: readonly string[];
  evidenceLessonTitles: readonly string[];
  correctionReason?: string;
};

export type SubjectOneQuestionAuditDisposition =
  | "direct_to_fact"
  | "partial_only"
  | "not_applicable"
  | "held";

export type SubjectOneQuestionAudit = {
  questionId: string;
  disposition: SubjectOneQuestionAuditDisposition;
  factIds: readonly string[];
  reason: string;
};

function getBundleFactIds(...bundleIds: string[]) {
  const selected = new Set(bundleIds);
  return WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.filter((bundle) =>
    selected.has(bundle.id),
  ).flatMap((bundle) =>
    bundle.facts.map((fact) => getWrittenSubjectFactId(1, bundle, fact)),
  );
}

const SECTION_RANGES = [
  {
    start: 3,
    factIds: getBundleFactIds(
      "fluid-foundation",
      "pneumatic-foundation",
      "hydraulic-power",
    ),
  },
  {
    start: 12,
    factIds: getBundleFactIds("fluid-laws", "fluid-calculation-extended"),
  },
  {
    start: 27,
    factIds: getBundleFactIds(
      "actuators-piping-maintenance",
      "fluid-laws",
    ),
  },
  {
    start: 36,
    factIds: getBundleFactIds(
      "fluid-calculation-extended",
      "hydraulic-power",
    ),
  },
  {
    start: 45,
    factIds: getBundleFactIds(
      "pneumatic-foundation",
      "hydraulic-power",
      "actuators-piping-maintenance",
      "industrial-communication-handling",
    ),
  },
  {
    start: 59,
    factIds: getBundleFactIds(
      "hydraulic-power",
      "hydraulic-pumps-motors-details",
      "hydraulic-troubleshooting",
    ),
  },
  {
    start: 76,
    factIds: getBundleFactIds(
      "pneumatic-foundation",
      "compressor-air-treatment-details",
    ),
  },
  {
    start: 126,
    factIds: getBundleFactIds(
      "pneumatic-foundation",
      "compressor-air-treatment-details",
      "valves-circuits",
    ),
  },
  {
    start: 141,
    factIds: getBundleFactIds(
      "hydraulic-power",
      "hydraulic-pumps-motors-details",
    ),
  },
  {
    start: 171,
    factIds: getBundleFactIds(
      "valves-circuits",
      "valves-centers-special-circuits",
    ),
  },
  {
    start: 189,
    factIds: getBundleFactIds(
      "hydraulic-power",
      "valves-circuits",
      "valves-centers-special-circuits",
    ),
  },
  {
    start: 210,
    factIds: getBundleFactIds(
      "valves-circuits",
      "hydraulic-troubleshooting",
      "hydraulic-pumps-motors-details",
    ),
  },
  {
    start: 249,
    factIds: getBundleFactIds(
      "fluid-foundation",
      "fluid-laws",
      "hydraulic-troubleshooting",
      "fluid-calculation-extended",
    ),
  },
  {
    start: 266,
    factIds: getBundleFactIds(
      "hydraulic-power",
      "hydraulic-pumps-motors-details",
      "fluid-calculation-extended",
    ),
  },
  {
    start: 276,
    factIds: getBundleFactIds(
      "valves-circuits",
      "valves-centers-special-circuits",
    ),
  },
  {
    start: 297,
    factIds: getBundleFactIds(
      "valves-circuits",
      "valves-centers-special-circuits",
      "hydraulic-troubleshooting",
    ),
  },
  {
    start: 327,
    factIds: getBundleFactIds(
      "valves-circuits",
      "valves-centers-special-circuits",
      "logic-plc",
    ),
  },
  {
    start: 359,
    factIds: getBundleFactIds(
      "actuators-piping-maintenance",
      "actuator-types-piping-details",
      "hydraulic-pumps-motors-details",
    ),
  },
  {
    start: 384,
    factIds: getBundleFactIds(
      "electric-electronic",
      "electronics-components-measurement",
    ),
  },
  {
    start: 407,
    factIds: getBundleFactIds(
      "logic-plc",
      "logic-plc-sequence-advanced",
    ),
  },
  {
    start: 431,
    factIds: getBundleFactIds(
      "electric-electronic",
      "electronics-components-measurement",
      "motors-starting-servo-stepper",
    ),
  },
  {
    start: 476,
    factIds: getBundleFactIds(
      "actuators-piping-maintenance",
      "actuator-types-piping-details",
    ),
  },
  {
    start: 493,
    factIds: getBundleFactIds(
      "logic-plc",
      "logic-plc-sequence-advanced",
      "automatic-control",
      "control-servo-transients",
    ),
  },
  {
    start: 550,
    factIds: getBundleFactIds(
      "sensors-signals",
      "measurement-sampling-errors",
      "electronics-components-measurement",
    ),
  },
  {
    start: 587,
    factIds: getBundleFactIds(
      "sensors-signals",
      "measurement-sampling-errors",
    ),
  },
  {
    start: 619,
    factIds: getBundleFactIds(
      "industrial-communication-handling",
      "network-topology-handling-details",
    ),
  },
] as const;

const HELD_LINES = new Map<number, string>([
  [5, "속도 범위와 스틱슬립 부재를 장치 조건 없이 절대화하여 공개 근거로 사용하지 않음"],
  [25, "레이놀즈수 층류·천이·난류 경계 표기가 손상되어 수치 근거로 사용하지 않음"],
  [35, "레이놀즈수 부등호와 경계값 표기가 손상되어 수치 근거로 사용하지 않음"],
  [40, "양정식의 유량 단위와 분모가 맞지 않아 계산식 근거로 사용하지 않음"],
  [41, "PS 환산 분모는 압력·유량 단위 계약 없이 단독 적용할 수 없어 보류"],
  [50, "공압 스틱슬립과 초기비용을 조건 없이 절대화한 문장을 그대로 공개하지 않음"],
  [60, "펌프가 압력을 생성한다는 표현은 부하가 압력을 형성한다는 설명으로 교정 필요"],
  [63, "스크루모터 부재와 99.9% 표현은 역사적 분류·장치 예외를 지운 절대표현이라 보류"],
  [95, "팬·블로어·압축기 경계는 적용 규격과 압력비 기준 확인 전 단일 수치로 공개하지 않음"],
  [96, "팬 경계의 구식 단일 게이지압 수치는 규격 확인 전 보류"],
  [97, "블로어 경계의 구식 단일 게이지압 수치는 규격 확인 전 보류"],
  [98, "압축기 경계의 구식 단일 게이지압 수치는 규격 확인 전 보류"],
  [112, "후부냉각기 출구온도와 수분 제거율은 장치 조건에 따라 달라 절대값 공개 보류"],
  [125, "편집자 확인 문구와 초건조 절대표현을 공개 학습 근거로 사용하지 않음"],
  [552, "능동형·수동형 센서 용어는 계측 분야의 분류 관례가 달라 원문 정의를 그대로 공개하지 않음"],
  [553, "자기발전형과 외부전원형 분류가 전 행과 연동돼 용어 교정 전 보류"],
  [562, "광전센서 검출거리의 단일 최대값은 제품 사양에 따라 달라 보류"],
  [566, "열전대 사용온도 절대값은 형식·선경·보호관·분위기 조건에 따라 달라 보류"],
  [570, "온도변환기 요구조건의 절대표현과 단위 표현이 부정확해 보류"],
  [592, "A/D 코드 환산은 기준전압·양자화 규칙·반올림 방식이 명시되지 않아 예시값을 보류"],
]);

function sectionFactIdsAt(lineNumber: number) {
  let factIds: readonly string[] = [];
  for (const section of SECTION_RANGES) {
    if (section.start > lineNumber) break;
    factIds = section.factIds;
  }
  return factIds;
}

function isStructuralLine(text: string) {
  return (
    text.startsWith("#") ||
    text === "---" ||
    /^\|[\s:-]+\|/.test(text) ||
    /^>?\s*🔖/.test(text)
  );
}

export function getSubjectOneSourceOccurrenceAudit() {
  return subjectOneSource.body
    .split(/\r?\n/)
    .map((rawText, index): SubjectOneSourceOccurrence | null => {
      const lineNumber = index + 1;
      const text = rawText.trim();
      if (!text) return null;
      const occurrenceId = `s1-source-line-${String(lineNumber).padStart(3, "0")}`;

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

      if (isStructuralLine(text)) {
        return {
          occurrenceId,
          lineNumber,
          text,
          disposition: "structural_only",
          factIds: [],
          reason: "과목·절·표의 읽기 구조를 만드는 항목",
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
      (occurrence): occurrence is SubjectOneSourceOccurrence =>
        occurrence !== null,
    );
}

const CORRECTED_FACT_REASONS = new Map<string, string>([
  [
    "legacy:1:hydraulic-power:용적식 펌프",
    "펌프는 유량을 만들고 회로 부하가 압력을 형성한다는 표준 설명으로 교정",
  ],
  [
    "s1-hydraulic-pumps-motors-details-motor-types",
    "스크루모터가 존재하지 않는다는 절대표현을 제거하고 대표 시험 분류로 한정",
  ],
  [
    "s1-measurement-sampling-errors-sensor-principles",
    "능동·수동 센서의 분야별 용어 충돌을 피하고 개별 검출 원리 중심으로 교정",
  ],
  [
    "s1-measurement-sampling-errors-current-ad",
    "A/D 코드 계산을 기준전압·비트수·양자화 규칙이 제시된 경우로 한정",
  ],
]);

export function getSubjectOneFactClaimAudit() {
  const occurrences = getSubjectOneSourceOccurrenceAudit();

  return WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.flatMap((bundle) =>
    bundle.facts.map((fact): SubjectOneFactClaimAudit => {
      const factId = getWrittenSubjectFactId(1, bundle, fact);
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
          1,
          bundle,
          fact,
        ),
        ...(correctionReason ? { correctionReason } : {}),
      };
    }),
  );
}

function reverseFactIdsByQuestion(
  bindings: readonly SubjectOneFactCbtBinding[],
  status: SubjectOneFactCbtBinding["status"],
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

export function getSubjectOneQuestionAudit(
  questions: readonly PublicQuestion[],
) {
  const bindings = getSubjectOneFactCbtBindings();
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
        question.subjectId === "subject-1" && question.provenance.original,
    )
    .map((question): SubjectOneQuestionAudit => {
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
