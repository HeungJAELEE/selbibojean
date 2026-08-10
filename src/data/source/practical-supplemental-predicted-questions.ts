import type {
  PracticalConcept,
  PracticalQuestion,
  PracticalStudyCategoryId,
} from "@/lib/domain/practical-types";
import { PRACTICAL_NCS_UNIT_QUESTION_EDITORIAL_BY_CONCEPT_ID } from "./practical-ncs-unit-reinforcements";
import { PRACTICAL_SUPPLEMENTAL_CONCEPTS } from "./practical-supplemental-concepts";

const CATEGORY_BY_CONCEPT: Record<string, PracticalStudyCategoryId> = {
  "PCON-SUP-001": "formula_calculation",
  "PCON-SUP-002": "formula_calculation",
  "PCON-SUP-003": "work_procedure",
  "PCON-SUP-004": "theory_concept",
  "PCON-SUP-005": "work_procedure",
  "PCON-SUP-006": "work_procedure",
  "PCON-SUP-007": "visual_identification",
  "PCON-SUP-008": "theory_concept",
  "PCON-SUP-009": "theory_concept",
  "PCON-SUP-010": "work_procedure",
  "PCON-SUP-011": "visual_identification",
  "PCON-SUP-012": "visual_identification",
  "PCON-SUP-013": "visual_identification",
  "PCON-SUP-014": "work_procedure",
  "PCON-SUP-015": "theory_concept",
  "PCON-SUP-016": "theory_concept",
  "PCON-SUP-017": "work_procedure",
  "PCON-SUP-018": "formula_calculation",
  "PCON-SUP-019": "work_procedure",
  "PCON-SUP-020": "visual_identification",
  "PCON-SUP-021": "work_procedure",
  "PCON-SUP-022": "work_procedure",
  "PCON-SUP-023": "visual_identification",
  "PCON-SUP-024": "visual_identification",
  "PCON-SUP-025": "formula_calculation",
  "PCON-SUP-026": "formula_calculation",
  "PCON-SUP-027": "visual_identification",
  "PCON-SUP-028": "visual_identification",
  "PCON-SUP-029": "visual_identification",
  "PCON-SUP-030": "work_procedure",
  "PCON-SUP-031": "visual_identification",
  "PCON-SUP-032": "work_procedure",
  "PCON-SUP-033": "work_procedure",
  "PCON-SUP-034": "work_procedure",
  "PCON-SUP-035": "visual_identification",
  "PCON-SUP-036": "theory_concept",
  "PCON-SUP-037": "visual_identification",
  "PCON-SUP-038": "work_procedure",
  "PCON-SUP-039": "visual_identification",
  "PCON-SUP-040": "theory_concept",
  "PCON-SUP-041": "work_procedure",
  "PCON-SUP-042": "work_procedure",
  "PCON-SUP-043": "work_procedure",
};

function questionId(conceptId: string) {
  return `EXP-${conceptId.replace("PCON-", "")}`;
}

function answerFor(
  concept: PracticalConcept,
  category: PracticalStudyCategoryId,
) {
  if (category === "formula_calculation") {
    const procedure = concept.procedure.slice(0, 3);
    return [
      concept.definition,
      `계산식: ${concept.formula.join(" / ")}`,
      procedure.length > 0 ? `적용 순서: ${procedure.join(" → ")}` : "",
    ].filter(Boolean).join("\n");
  }
  if (category === "work_procedure") {
    return concept.procedure
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");
  }
  if (category === "visual_identification") {
    return [
      concept.definition,
      `판단 요소: ${concept.components.slice(0, 5).join(" / ")}`,
      `판단 원리: ${concept.principle}`,
    ].join("\n");
  }
  return [
    concept.definition,
    concept.principle,
    concept.safety[0] ? `적용 시 주의: ${concept.safety[0]}` : "",
  ].filter(Boolean).join("\n");
}

function stemFor(
  concept: PracticalConcept,
  category: PracticalStudyCategoryId,
) {
  if (category === "formula_calculation") {
    return `${concept.title}에 사용하는 핵심 계산식과 각 식의 적용조건을 쓰고, 계산 전에 확인해야 할 조건 2가지를 쓰시오.`;
  }
  if (category === "work_procedure") {
    return `${concept.title}의 작업 또는 점검 순서를 작업 전 안전조치를 포함하여 4단계 이상으로 쓰시오.`;
  }
  if (category === "visual_identification") {
    return `${concept.title}을 사진·도면 또는 부품에서 식별할 때 확인해야 할 구성요소나 판단기준 3가지를 쓰고, 핵심 작동원리를 설명하시오.`;
  }
  return `${concept.title}의 정의와 핵심 작동원리를 쓰고, 실제 적용 시 주의사항 1가지를 쓰시오.`;
}

function formatLabelFor(category: PracticalStudyCategoryId) {
  if (category === "formula_calculation") return "계산식·적용조건";
  if (category === "work_procedure") return "작업·점검 순서";
  if (category === "visual_identification") return "사진·도면 판독기준";
  return "개념 정의·작동원리";
}

function makeQuestion(concept: PracticalConcept): PracticalQuestion {
  const editorial =
    PRACTICAL_NCS_UNIT_QUESTION_EDITORIAL_BY_CONCEPT_ID[concept.id];
  const category =
    editorial?.primaryStudyCategoryId ?? CATEGORY_BY_CONCEPT[concept.id];
  if (!category) {
    throw new Error(`보강용 예상문제의 유형 분류가 없습니다: ${concept.id}`);
  }
  const id = questionId(concept.id);
  const modelAnswer = editorial?.modelAnswer ?? answerFor(concept, category);
  const requiredKeywords = concept.requiredKeywords.slice(0, 6);
  const rubricKeywords = requiredKeywords.slice(0, 3);
  const studyCategoryIds = [
    category,
    ...(category === "theory_concept"
      ? []
      : (["theory_concept"] as const)),
  ];
  const sourceTitles = [...new Set(concept.ncsSources.map((source) => source.documentTitle))];

  return {
    id,
    kind: "predicted",
    title: `${concept.title} 예상문제`,
    formatLabel: editorial?.formatLabel ?? formatLabelFor(category),
    stem: editorial?.stem ?? stemFor(concept, category),
    modelAnswer,
    answerDefinition: editorial?.answerDefinition,
    memoryTip: editorial?.memoryTip,
    requiredKeywords,
    acceptedAnswers: [modelAnswer],
    calculation:
      category === "formula_calculation" ? concept.formula : [],
    unit: null,
    rubric: editorial
      ? editorial.rubricLabels.map((label, index) => ({
          id: `${id}-r${index + 1}`,
          label,
          points: 1,
        }))
      : [
          {
            id: `${id}-r1`,
            label:
              category === "work_procedure"
                ? "작업 전 확인·안전조치"
                : "개념 또는 대상의 정확한 정의",
            points: 1,
          },
          ...rubricKeywords.map((keyword, index) => ({
            id: `${id}-r${index + 2}`,
            label: `필수 판단요소: ${keyword}`,
            points: 1,
          })),
          {
            id: `${id}-r${rubricKeywords.length + 2}`,
            label:
              category === "formula_calculation"
                ? "공식의 적용조건과 단위 확인"
                : category === "work_procedure"
                  ? "순서와 완료 확인"
                  : "원리와 실제 적용 연결",
            points: 1,
          },
        ],
    traps: concept.traps.slice(0, 4),
    conceptIds: [concept.id],
    primaryStudyCategoryId: category,
    studyCategoryIds: [...new Set(studyCategoryIds)],
    ncsSources: concept.ncsSources,
    visualAidId: null,
    label: "predicted_exam",
    auditDisposition: "verified",
    contentStatus: "published",
    occurrence: null,
    predictedBasis:
      `${sourceTitles.join("·")}의 NCS 수행내용과 ${concept.examFormats.join("·")} 출제형식을 바탕으로 자체 구성했다.`,
    reviewNote:
      "NCS 원문 기반 보강 개념의 자체 예상문제다. 실제 기출·복원문제가 아니며 출제 이력과 기출 빈도에 포함하지 않는다. 공개 이미지 없이도 답안 조건이 완결되도록 작성했다.",
    examFormat: editorial?.examFormat,
    examEvidenceStatus: editorial ? "ncs_supplement" : undefined,
  };
}

export const PRACTICAL_SUPPLEMENTAL_PREDICTED_QUESTIONS: PracticalQuestion[] =
  PRACTICAL_SUPPLEMENTAL_CONCEPTS.map(makeQuestion);

export const PRACTICAL_SUPPLEMENTAL_PRIMARY_CATEGORY_BY_QUESTION =
  Object.fromEntries(
    PRACTICAL_SUPPLEMENTAL_PREDICTED_QUESTIONS.map((question) => [
      question.id,
      question.primaryStudyCategoryId,
    ]),
  ) as Record<string, PracticalStudyCategoryId>;
