import subjectTwoSource from "@/data/source/written-subject-two-notion-body.json";
import {
  getSubjectTwoFactCbtBindings,
  type SubjectTwoFactCbtBinding,
} from "@/data/source/written-subject-two-cbt-links";
import { WRITTEN_SUBJECT_TWO_MEMORY_GUIDE } from "@/data/source/written-subject-two-memory-guide";
import {
  getWrittenSubjectFactId,
  getWrittenSubjectFactLessonTitles,
} from "@/data/source/written-subject-fact-lesson-links";
import type { PublicQuestion } from "@/lib/domain/types";

export type SubjectTwoSourceDisposition =
  | "mapped_to_fact"
  | "duplicate_of"
  | "structural_only"
  | "held"
  | "excluded_nonlearning";

export type SubjectTwoSourceOccurrence = {
  occurrenceId: string;
  lineNumber: number;
  text: string;
  disposition: SubjectTwoSourceDisposition;
  factIds: readonly string[];
  reason: string;
};

export type SubjectTwoClaimProvenance =
  | "source_preserved"
  | "supplemented"
  | "corrected"
  | "held_conflict";

export type SubjectTwoFactClaimAudit = {
  factId: string;
  provenance: SubjectTwoClaimProvenance;
  basisOccurrenceIds: readonly string[];
  evidenceLessonTitles: readonly string[];
  correctionReason?: string;
};

export type SubjectTwoQuestionAuditDisposition =
  | "direct_to_fact"
  | "partial_only"
  | "not_applicable"
  | "held";

export type SubjectTwoQuestionAudit = {
  questionId: string;
  disposition: SubjectTwoQuestionAuditDisposition;
  factIds: readonly string[];
  reason: string;
};

function getBundleFactIds(...bundleIds: string[]) {
  const selected = new Set(bundleIds);
  return WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.filter((bundle) =>
    selected.has(bundle.id),
  ).flatMap((bundle) =>
    bundle.facts.map((fact) => getWrittenSubjectFactId(2, bundle, fact)),
  );
}

const SECTION_RANGES = [
  {
    start: 2,
    factIds: getBundleFactIds(
      "classification-joints",
      "pressure-welding-process-details",
    ),
  },
  {
    start: 15,
    factIds: getBundleFactIds("electrodes-arc-blow"),
  },
  {
    start: 25,
    factIds: getBundleFactIds("classification-joints"),
  },
  {
    start: 32,
    factIds: getBundleFactIds(
      "arc-foundation-polarity",
      "shielded-high-efficiency",
      "advanced-arc-process-controls",
      "electrode-flame-heat-input-details",
    ),
  },
  {
    start: 47,
    factIds: getBundleFactIds(
      "weld-defects",
      "electrodes-arc-blow",
      "arc-foundation-polarity",
      "electrode-flame-heat-input-details",
    ),
  },
  {
    start: 70,
    factIds: getBundleFactIds(
      "shielded-high-efficiency",
      "pressure-gas-special",
      "advanced-arc-process-controls",
    ),
  },
  {
    start: 91,
    factIds: getBundleFactIds(
      "classification-joints",
      "deformation-stress",
    ),
  },
  {
    start: 102,
    factIds: getBundleFactIds("weld-defects"),
  },
  {
    start: 145,
    factIds: getBundleFactIds("deformation-stress"),
  },
  {
    start: 163,
    factIds: getBundleFactIds("inspection"),
  },
  {
    start: 178,
    factIds: getBundleFactIds("grooves-symbols"),
  },
  {
    start: 191,
    factIds: getBundleFactIds(
      "ppe-signs-fire",
      "ppe-classification-details",
    ),
  },
  {
    start: 218,
    factIds: getBundleFactIds(
      "ppe-signs-fire",
      "safety-sign-fire-details",
    ),
  },
  {
    start: 240,
    factIds: getBundleFactIds(
      "gas-electrical-machine-safety",
      "gas-cylinder-flashback-details",
    ),
  },
  {
    start: 260,
    factIds: getBundleFactIds(
      "gas-electrical-machine-safety",
      "machine-workplace-safety-details",
    ),
  },
  {
    start: 286,
    factIds: getBundleFactIds(
      "gas-electrical-machine-safety",
      "machine-workplace-safety-details",
    ),
  },
] as const;

const HELD_LINES = new Map<number, string>([
  [6, "아크·가스 온도와 SAW 속도·용입 배수는 장치·조건 없이 절대값으로 공개하지 않음"],
  [9, "납땜 온도 경계는 적용 표준 용어와 합금 조건 확인 전 원문 수치만으로 공개하지 않음"],
  [16, "아크쏠림 전류 경계는 이음·자기회로 조건에 따라 달라 단일 수치 공개 보류"],
  [33, "TIG·MIG 선택을 판두께 하나로 절대화한 문장은 공개 판단기준으로 사용하지 않음"],
  [42, "차폐 방풍 풍속과 SAW 자세를 절대화한 수치는 공정절차 확인 전 보류"],
  [43, "MIG 용착효율 단일 백분율은 공정·와이어·전달모드 조건 확인 전 보류"],
  [45, "아크온도·적정간격과 전류-아크길이 관계를 단일 수치·단순 반비례로 공개하지 않음"],
  [61, "저수소계 재건조 온도·시간은 전극 제조사와 규격 지침이 우선이라 보류"],
  [71, "CO₂ 설치 이격·온도·농도 수치는 장비·환기·현행 기준 확인 전 보류"],
  [73, "SAW 속도·용입·돌출길이·루트간격 절대값과 눈보호 불필요 표현은 안전상 공개 보류"],
  [76, "TIG 스패터 부재와 전극색·극성을 절대화한 표현은 전극 규격·공정조건 확인 전 보류"],
  [77, "TIG 노즐 재질 설명에 검증되지 않은 재료 표현이 포함돼 보류"],
  [78, "특정 판두께의 전극지름·전류값은 WPS와 장비 조건 없이 일반화하지 않음"],
  [83, "플라즈마 온도·판두께 적용범위를 절대값으로 단정해 보류"],
  [92, "피복 손상 처리와 공구 명칭이 불명확하고 작업절차 근거가 없어 보류"],
  [180, "개선홈 판두께·안전율 절대값은 설계규격·하중·재료조건 확인 전 보류"],
  [207, "안전모 일률 교체주기는 제조사·점검결과·현행 지침이 우선이라 보류"],
  [208, "안전모 내전압 단일 수치는 제품 인증등급과 현행 기준 확인 전 보류"],
  [210, "보일러 수선에서 특수 보호구가 불필요하다는 절대표현은 위험성평가 원칙과 충돌해 보류"],
  [214, "차광도와 전류의 단일 대응은 공정·아크거리·필터규격 확인 전 보류"],
  [215, "신호수 청력보호구 일률 금지는 소음노출 저감·통신 대책과 함께 판단해야 해 보류"],
  [245, "가스용기 색상·충전조건은 현행 용기표시와 법령 확인 전 공개 보류"],
  [246, "아세틸렌 용기 색상·충전조건·구리함량 수치는 현행 기준 확인 전 보류"],
  [247, "여러 가스의 용기색을 한 줄로 고정한 표는 현행 표시체계 검증 전 보류"],
  [248, "암모니아 용해배수와 누설검지·제독 절차는 물질안전자료 확인 전 보류"],
  [249, "동합금 함량 절대값과 누설점검 절차는 현행 표준·SDS 확인 전 보류"],
  [253, "역화방지장치 설치 위치를 무조건 양단으로 단정해 승인 작업표준 확인 전 보류"],
  [257, "가열 토치의 수중 냉각 절차는 제조사 승인 절차 없이 따라 하면 위험해 보류"],
  [259, "비상 차단 순서는 장비·역화방지기·작업표준에 따라야 하므로 단일 절차 공개 보류"],
  [263, "중대재해 보고 문구는 현행 법령 확인이 필요한 법적 의무라 보류"],
  [264, "쾌적온도·실내외 온도차 단일 수치는 작업강도·습도·현행 기준 확인 전 보류"],
  [265, "압력방출장치 설정 배수는 현행 법령·설비조건 확인 전 보류"],
  [266, "파열판 설치·면제 치수는 현행 법령과 물질위험성 확인 전 보류"],
  [268, "연삭숫돌 무부하 시운전 시간은 현행 규정·제조사 지침 확인 전 보류"],
  [270, "숫돌 부시 간극 단일 수치는 숫돌·축 규격과 제조사 기준 확인 전 보류"],
  [272, "롤러기 급정지장치 위치는 현행 법정 기준 확인 전 보류"],
  [273, "손 조작식 설치높이 수치는 현행 법정 기준 확인 전 보류"],
  [274, "복부 조작식 설치높이 수치는 현행 법정 기준 확인 전 보류"],
  [275, "무릎 조작식 설치높이 수치는 현행 법정 기준 확인 전 보류"],
  [276, "감전 한계전류·무부하전압·정기청소 주기는 현행 안전기준 확인 전 보류"],
  [277, "전격방지기 배선 단면적은 장비 정격·배선조건·현행 기준 확인 전 보류"],
  [279, "전동기 퓨즈를 정격전류의 두 배로 일률 선정하는 것은 보호협조 검토 없이 위험해 보류"],
  [281, "작업 조도 절대값은 작업 종류와 현행 법령 확인 전 보류"],
  [282, "통로 폭과 구획색은 현행 사업장 기준 확인 전 보류"],
  [283, "CO₂ 농도별 증상·사망 단정 수치는 최신 노출기준·응급지침 확인 전 보류"],
  [284, "환기횟수 단일 범위는 공정 발생량·국소배기 설계 없이 일반화하지 않음"],
  [285, "로봇 방호울타리 높이 단일 수치는 위험성평가·현행 로봇안전 기준 확인 전 보류"],
  [287, "도급 법정 정의는 현행 법령 확인이 필요한 항목이라 원문만으로 공개하지 않음"],
  [288, "관계수급인 법정 용어는 현행 법령 확인 전 보류"],
  [289, "중대재해 법정 분류기준은 현행 법령 확인 전 보류"],
  [290, "사망자 기준은 현행 법령 확인 전 보류"],
  [291, "요양기간·부상자 수 기준은 현행 법령 확인 전 보류"],
  [292, "부상·직업성질병 인원 기준은 현행 법령 확인 전 보류"],
  [293, "중대재해 기준 사례는 현행 법령 확인 전 보류"],
  [294, "위험물 운반 수납률·압력 기준은 현행 위험물 규정 확인 전 보류"],
  [295, "고체 위험물 수납률 수치는 현행 규정 확인 전 보류"],
  [296, "액체 위험물 수납률·증기압 수치는 현행 규정 확인 전 보류"],
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
    text.startsWith("```") ||
    /^\|[\s:-]+\|/.test(text) ||
    /^>?\s*\[!/.test(text) ||
    /^>?\s*요약/.test(text)
  );
}

export function getSubjectTwoSourceOccurrenceAudit() {
  return subjectTwoSource.body
    .split(/\r?\n/)
    .map((rawText, index): SubjectTwoSourceOccurrence | null => {
      const lineNumber = index + 1;
      const text = rawText.trim();
      if (!text) return null;
      const occurrenceId = `s2-source-line-${String(lineNumber).padStart(3, "0")}`;

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
          reason: "과목·절·표·인용의 읽기 구조를 만드는 항목",
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
      (occurrence): occurrence is SubjectTwoSourceOccurrence =>
        occurrence !== null,
    );
}

const CORRECTED_FACT_REASONS = new Map<string, string>([
  [
    "legacy:2:shielded-high-efficiency:TIG",
    "판두께 하나로 공정을 절대 선택하지 않고 재질·품질·자세·생산성을 함께 보도록 교정",
  ],
  [
    "legacy:2:shielded-high-efficiency:차폐 조건",
    "단일 풍속값 대신 WPS와 승인 작업표준의 방풍·환기 조건을 우선하도록 교정",
  ],
  [
    "s2-electrode-flame-heat-input-details-low-hydrogen",
    "고정 재건조 수치 대신 전극 제조사·규격의 건조 및 보관 지침을 우선하도록 교정",
  ],
  [
    "s2-ppe-classification-details-helmet",
    "안전모 일률 교체주기·전압값을 제거하고 인증 성능·상태점검 기준으로 교정",
  ],
  [
    "s2-machine-workplace-safety-details-pressure",
    "노후 법정 배수·치수 대신 현행 법령·검사기준·최고사용압력을 우선하도록 교정",
  ],
]);

export function getSubjectTwoFactClaimAudit() {
  const occurrences = getSubjectTwoSourceOccurrenceAudit();

  return WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.flatMap((bundle) =>
    bundle.facts.map((fact): SubjectTwoFactClaimAudit => {
      const factId = getWrittenSubjectFactId(2, bundle, fact);
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
          2,
          bundle,
          fact,
        ),
        ...(correctionReason ? { correctionReason } : {}),
      };
    }),
  );
}

function reverseFactIdsByQuestion(
  bindings: readonly SubjectTwoFactCbtBinding[],
  status: SubjectTwoFactCbtBinding["status"],
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

export function getSubjectTwoQuestionAudit(
  questions: readonly PublicQuestion[],
) {
  const bindings = getSubjectTwoFactCbtBindings();
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
        question.subjectId === "subject-2" && question.provenance.original,
    )
    .map((question): SubjectTwoQuestionAudit => {
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
          reason: "일부 보기·조건만 겹쳐 직접 문제로는 공개하지 않음",
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
