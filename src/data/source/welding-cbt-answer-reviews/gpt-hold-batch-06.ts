import { Buffer } from "node:buffer";
import { gunzipSync } from "node:zlib";

import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";

type GptVerdict = "ACCEPT" | "REVISE" | "CHOICE_ISSUE" | "HOLD";
type GptResult = {
  id: string;
  verdict: GptVerdict;
  correctChoiceId: number;
  directSolution: string;
  choiceRationales: readonly string[];
  lessonSentence: string;
  tests: {
    calculation: "PASS" | "N/A" | "HOLD";
    lessonBinding: "PASS" | "REVISE" | "BLOCKED";
    notes?: string;
  };
};

const AUTHOR = "subject-2-gpt-hold-batch-06-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const EXPECTED_RESULT_COUNT = 50;
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);
const PROMOTED_C_IDS = new Set([
  "wcbt-9b5fbee6-490d-4332-a009-eabb40fcafb5",
  "wcbt-9b83fd23-5e95-4ccb-bf5e-3b5f67f62ea6",
]);

/**
 * Immutable, line-for-line result rows from the supplied GPT review. This
 * artifact remains local and does not alter the reconstructed source bank.
 */
const GPT_RESULTS = JSON.parse(
  gunzipSync(
    Buffer.from(
      [
        "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",
      ].join(""),
      "base64",
    ),
  ).toString("utf8"),
) as GptResult[];

const blockedReasons: Record<string, readonly string[]> = {
  "wcbt-9d5bb7dc-5042-45f0-9820-7f31a2d0d8a4": [
    "choice_issue_wording_corruption_and_nonunique: the source needs an original image or primary text to resolve whether 'discharge' was a reconstruction error for 'charging'.",
  ],
  "wcbt-9e115499-3857-4e97-9f2e-e4e7595b9ae5": [
    "hold_missing_vessel_capacity: the gas quantity cannot determine pressure without the cylinder volume or an authoritative omitted-condition recovery.",
  ],
  "wcbt-a0b1d99f-9464-4b13-9069-3385c1ae3556": [
    "choice_issue_toxicology_condition_missing: exposure duration and oxygen concentration are absent, so 15% and 30% cannot be uniquely separated.",
  ],
  "wcbt-abab436d-8dcb-4718-b143-81e3a90c090d": [
    "choice_issue_nonstandard_distractor: an original image or primary text is required to resolve the nonstandard 'electric radiation' wording.",
  ],
};

const calculationDetails: Record<string, {
  formula: string;
  substitution: string;
  result: string;
}> = {
  "wcbt-9d613c71-b324-4230-a601-ee0f52d4ad69": {
    formula: "Q = V × (Pinitial − Presidual)",
    substitution: "Q = 30 L × (150 − 100) kgf/cm² = 30 L × 50 kgf/cm²",
    result: "Q = 1500 L, matching choice 2.",
  },
  "wcbt-a28f1f15-d914-46e0-8b0d-71395c75c660": {
    formula: "t = (V × P) ÷ qtip",
    substitution: "t = (40 L × 100 kgf/cm²) ÷ 200 L/h",
    result: "t = 20 h, matching choice 1 under the stated textbook tip convention.",
  },
  "wcbt-a5e7e8de-25df-42c5-b3a2-c53c8506e121": {
    formula: "Q = V × (Pstart − Pend)",
    substitution: "Q = 40 L × (95 − 55) kgf/cm² = 40 L × 40 kgf/cm²",
    result: "Q = 1600 L, matching choice 3.",
  },
  "wcbt-aa2f39d5-1059-4648-8b93-bf53267409a4": {
    formula: "t = (V × P) ÷ qtip",
    substitution: "t = (33 L × 100 kgf/cm²) ÷ 300 L/h",
    result: "t = 11 h, matching choice 1 under the stated textbook tip convention.",
  },
  "wcbt-abcfadc7-3205-440f-a69f-074fc4d8aba1": {
    formula: "I₁ = S₁ ÷ V₁",
    substitution: "I₁ = 25,000 VA ÷ 200 V",
    result: "I₁ = 125 A, matching choice 3 in the single-phase exam calculation.",
  },
  "wcbt-ad05a0cc-f6a3-4d20-a05c-aa97092d02b9": {
    formula: "η = Pout ÷ (Pout + Ploss); textbook PF = Pin ÷ (Vopen × Iarc)",
    substitution: "Pout = 30 V × 200 A = 6 kW; η = 6 ÷ (6 + 4) × 100; PF = 10 kW ÷ (80 V × 200 A) × 100",
    result: "η = 60% and textbook PF = 62.5%, matching choice 2; this is not a substitute for an actual primary-side measurement.",
  },
  "wcbt-ae988bf0-4135-4bbd-96ee-57cb2f6183bf": {
    formula: "t = (V × P) ÷ qtip",
    substitution: "t = (33 L × 100 kgf/cm²) ÷ 300 L/h",
    result: "t = 11 h, matching choice 1 under the stated textbook tip convention.",
  },
  "wcbt-b02d3b54-c7f1-4f3a-8c0d-5b0709a998e2": {
    formula: "η = Pout ÷ (Pout + Ploss) × 100",
    substitution: "η = (30 V × 300 A) ÷ ((30 V × 300 A) + 4,000 W) × 100 = 9 kW ÷ 13 kW × 100",
    result: "η ≈ 69.23% ≈ 69%, matching choice 2.",
  },
};

const lessonBindingOverrides: Record<string, {
  lessonId: string;
  assertionText: string;
}> = {
  "wcbt-9b5fbee6-490d-4332-a009-eabb40fcafb5": {
    lessonId: "lesson-welding-safety-management",
    assertionText: "안전색채 문항은 출제연도에 유효한 KS 판본의 색상·의미 표를 기준으로 판정하고 현행 산업안전보건표지 색체계와 혼용하지 않는다.",
  },
  "wcbt-96491c19-65a8-4703-bb9a-06b9ba852fee": {
    lessonId: "lesson-welding-safety-management",
    assertionText: "작업 전 안전표지의 색상과 지시 의미를 확인해 작업자가 필요한 행동을 오인하지 않도록 관리한다.",
  },
  "wcbt-9c5a0873-ff16-4e2b-b488-0b6dd9f1f967": {
    lessonId: "lesson-welding-safety-ventilation",
    assertionText: "배기풍이 보호가스를 흩뜨리면 기공이 생길 수 있으므로 후드 위치와 풍속을 조정한다.",
  },
  "wcbt-a510e570-ea74-4dce-8b15-0975fdcfcc86": {
    lessonId: "lesson-welding-safety-management",
    assertionText: "작업 전 안전표지의 경고 의미를 확인하고 현장 조건에 맞는 안전조치를 적용한다.",
  },
  "wcbt-a56f0c35-a8b1-4111-8239-642683810836": {
    lessonId: "lesson-welding-foundation-electrodes",
    assertionText: "저수소계 용접봉은 확산성 수소를 줄이는 데 유리하지만 습기를 먹으면 목적을 잃는다.",
  },
  "wcbt-aa17492a-f0b7-44a3-857a-27e1b5258a01": {
    lessonId: "lesson-welding-foundation-electrodes",
    assertionText: "피복 종류마다 아크 특성, 용입, 비드, 자세 적합성이 다르다.",
  },
  "wcbt-b21592e6-d7fb-4390-85f3-6ff9855b9209": {
    lessonId: "lesson-welding-foundation-power-heat",
    assertionText: "아크 길이와 전류 조건은 용접 아크의 안정성과 입열에 함께 영향을 준다.",
  },
};

const calculationAssertionOverrides: Record<string, string> = {
  "wcbt-a5e7e8de-25df-42c5-b3a2-c53c8506e121":
    "산소 소비량은 Q=V×(P₁-P₂)로 계산하며, 40L×(95-55)=1600L이다.",
};

function assessmentKindFor(result: GptResult) {
  return result.tests.calculation === "PASS" ? "calculation" as const : "principle" as const;
}

function calculationStepsFor(result: GptResult) {
  const detail = calculationDetails[result.id];
  if (!detail) {
    throw new Error(`SUBJECT_2_GPT_HOLD_BATCH_06_CALCULATION_DETAIL_MISSING:${result.id}`);
  }
  const overrides: Record<string, readonly string[]> = {
    "wcbt-9d613c71-b324-4230-a601-ee0f52d4ad69": [
      "계산식은 소비 산소량 Q=용기 내용적 V×압력 감소량 (P₁-P₂)입니다.",
      "값을 대입하면 Q=30L×(150-100)=30L×50이며 곱은 1,500입니다.",
      "계산 결과는 1,500L이므로 정답은 1500입니다.",
    ],
    "wcbt-a28f1f15-d914-46e0-8b0d-71395c75c660": [
      "계산식은 작업시간 t=(용기 내용적 V×환산압력 P)÷팁의 소비량 q입니다.",
      "10MPa를 약 100kgf/cm²로 바꾸어 t=(40L×100kgf/cm²)÷200L/h=20으로 계산합니다.",
      "계산 결과는 72,000s이며, 이는 20시간이므로 정답은 20시간입니다.",
    ],
    "wcbt-a5e7e8de-25df-42c5-b3a2-c53c8506e121": [
      "계산식은 소비량 Q=용기 내용적 V×(시작압력 P₁-종료압력 P₂)입니다.",
      "값을 대입하면 Q=40L×(95-55)=40L×40이며 곱은 1,600입니다.",
      "계산 결과는 1,600L이므로 정답은 1600입니다.",
    ],
    "wcbt-aa2f39d5-1059-4648-8b93-bf53267409a4": [
      "계산식은 작업시간 t=(산소용기 내용적 V×충전압력 P)÷팁 소비량 q입니다.",
      "값을 대입하면 t=(33L×100kgf/cm²)÷300L/h=11로 계산됩니다.",
      "계산 결과는 39,600s이며, 이는 11시간이므로 정답은 11시간입니다.",
    ],
    "wcbt-abcfadc7-3205-440f-a69f-074fc4d8aba1": [
      "계산식은 단상 용접기의 1차 전류 I=S÷V입니다.",
      "값을 대입하면 I=25,000VA÷200V이며 몫은 125입니다.",
      "계산 결과는 125A이므로 정답은 125A 퓨즈입니다.",
    ],
    "wcbt-ad05a0cc-f6a3-4d20-a05c-aa97092d02b9": [
      "계산식은 Pout=Varc×Iarc, 효율 η=Pout÷(Pout+Ploss)×100, 역률 PF=(Pout+Ploss)÷(V₀×Iarc)×100입니다.",
      "값을 대입하면 Pout=30V×200A=6,000W이고, η=6÷(6+4)×100=60, PF=10,000W÷(80V×200A)×100=62.5로 계산합니다.",
      "계산 결과는 효율 60%와 역률 62.5%이므로 두 번째 보기입니다.",
    ],
    "wcbt-ae988bf0-4135-4bbd-96ee-57cb2f6183bf": [
      "계산식은 프랑스식 300번 팁의 사용시간 t=(V×P)÷q입니다.",
      "값을 대입하면 t=(33L×100kgf/cm²)÷300L/h=11로 계산됩니다.",
      "계산 결과는 39,600s이며, 이는 11시간이므로 정답은 11시간입니다.",
    ],
    "wcbt-b02d3b54-c7f1-4f3a-8c0d-5b0709a998e2": [
      "계산식은 아크출력 Pout=Varc×Iarc, 효율 η=Pout÷(Pout+Ploss)×100입니다.",
      "Pout=30V×300A=9,000W이고 η=9,000W÷(9,000W+4,000W)×100=69.23으로 계산합니다.",
      "계산 결과는 약 69%이므로 정답은 69입니다.",
    ],
  };
  return overrides[result.id] ?? [
    `계산식: ${detail.formula}`,
    `대입·단위: ${detail.substitution}`,
    `계산 결과: ${detail.result}`,
  ];
}

function publishCandidate(
  result: GptResult,
  projection: (typeof WELDING_CBT_LESSON_PROJECTION.entries)[number],
  source: (typeof rawWeldingCbtBank.records)[number],
) {
  const assessmentKind = assessmentKindFor(result);
  const lessonOverride = lessonBindingOverrides[result.id];
  const lessonId = lessonOverride?.lessonId ?? projection.primaryLeafLessonId;
  const correctChoice = source.choices[source.correctIndex];
  if (!lessonId || !correctChoice) {
    throw new Error(`SUBJECT_2_GPT_HOLD_BATCH_06_LESSON_OR_ANSWER_MISSING:${result.id}`);
  }
  if (result.verdict === "REVISE" && !result.directSolution.includes("다만")) {
    throw new Error(`SUBJECT_2_GPT_HOLD_BATCH_06_REVISE_CAVEAT_MISSING:${result.id}`);
  }

  return {
    canonicalId: result.id,
    contentDigest: projection.contentDigest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind,
    primaryLeafLessonId: lessonId,
    conceptBinding: {
      lessonId,
      lessonBlockId: "principle",
      assertionText:
        calculationAssertionOverrides[result.id]
        ?? lessonOverride?.assertionText
        ?? result.lessonSentence,
      evidenceRefs: [
        { kind: "lesson_block" as const, ref: `${lessonId}#principle` },
        { kind: "source_question" as const, ref: result.id },
        ...(assessmentKind === "calculation"
          ? [{
            kind: "calculation_derivation" as const,
            ref: calculationStepsFor(result).join("; "),
          }]
          : []),
      ],
    },
    answerExplanation: result.directSolution,
    solutionSteps: assessmentKind === "calculation"
      ? calculationStepsFor(result)
      : [
        `Decision path for the reconstructed option: ${result.choiceRationales[source.correctIndex]}`,
        `Applicable lesson condition: ${result.lessonSentence}`,
      ],
    keyRule: result.lessonSentence,
    choiceFeedback: result.choiceRationales.map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === source.correctIndex;
      const choiceNumber = choiceIndex + 1;
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale,
        plausibleReason: `Option ${choiceNumber} is evaluated on its own claim: ${rationale}`,
        incorrectPoint: isCorrect
          ? null
          : `Option ${choiceNumber} fails the applicable condition described here: ${rationale}`,
        keyRule: `Option ${choiceNumber} rule: ${result.lessonSentence} Applied to this option: ${rationale}`,
        differenceFromCorrect: isCorrect
          ? null
          : `Unlike correct option ${source.correctIndex + 1} (${correctChoice}), option ${choiceNumber} is rejected because ${rationale}`,
      };
    }),
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: AUTHOR,
    authoredAt: REVIEWED_AT,
    reviewer: AUTHOR,
    reviewedAt: REVIEWED_AT,
  };
}

const projectionById = new Map(
  WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [entry.canonicalId, entry]),
);
const sourceById = new Map(
  rawWeldingCbtBank.records
    .filter((record) => record.correctIndex !== null)
    .map((record) => [record.canonicalId, record]),
);

const verdictCounts = GPT_RESULTS.reduce<Record<GptVerdict, number>>(
  (counts, result) => ({ ...counts, [result.verdict]: counts[result.verdict] + 1 }),
  { ACCEPT: 0, REVISE: 0, CHOICE_ISSUE: 0, HOLD: 0 },
);
if (
  GPT_RESULTS.length !== EXPECTED_RESULT_COUNT
  || new Set(GPT_RESULTS.map((result) => result.id)).size !== EXPECTED_RESULT_COUNT
  || verdictCounts.ACCEPT !== 41
  || verdictCounts.REVISE !== 3
  || verdictCounts.CHOICE_ISSUE !== 3
  || verdictCounts.HOLD !== 3
) {
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_06_EXACT_SET_OR_VERDICT_MISMATCH");
}

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_06 =
  GPT_RESULTS.map((result) => {
    const projection = projectionById.get(result.id);
    const source = sourceById.get(result.id);
    if (
      !projection
      || !source
      || source.correctIndex !== result.correctChoiceId
      || source.choices.length !== 4
      || source.choices.some((choice) => typeof choice !== "string")
      || typeof source.stem !== "string"
      || result.choiceRationales.length !== source.choices.length
    ) {
      throw new Error(`SUBJECT_2_GPT_HOLD_BATCH_06_SOURCE_MISMATCH:${result.id}`);
    }

    const holdReasons = blockedReasons[result.id];
    if ((!PUBLISHABLE_VERDICTS.has(result.verdict) && !PROMOTED_C_IDS.has(result.id)) || holdReasons) {
      if (!holdReasons) {
        throw new Error(`SUBJECT_2_GPT_HOLD_BATCH_06_UNLEDGERED_HOLD:${result.id}`);
      }
      return {
        canonicalId: result.id,
        contentDigest: projection.contentDigest,
        authoringDisposition: "hold_candidate" as const,
        reviewStatus: "hold" as const,
        assessmentKind: assessmentKindFor(result),
        primaryLeafLessonId: null,
        conceptBinding: null,
        answerExplanation: null,
        solutionSteps: [],
        keyRule: null,
        choiceFeedback: null,
        essentialRank: null,
        essentialRationale: null,
        holdReasons,
        author: AUTHOR,
        authoredAt: REVIEWED_AT,
        reviewer: AUTHOR,
        reviewedAt: REVIEWED_AT,
      };
    }
    return publishCandidate(result, projection, source);
  });
