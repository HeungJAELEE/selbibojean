import { Buffer } from "node:buffer";
import { gunzipSync } from "node:zlib";

import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";

type GptVerdict = "ACCEPT" | "REVISE" | "CHOICE_ISSUE" | "HOLD";
type CalculationEvidence = {
  formula: string;
  substitution: string;
  result: string;
};
type GptResult = {
  id: string;
  verdict: GptVerdict;
  correctChoiceId: number;
  directSolution: string;
  choiceRationales: readonly string[];
  lessonSentence: string;
  tests: Record<string, unknown> & { calculation?: CalculationEvidence };
};

const AUTHOR = "subject-2-gpt-hold-batch-05-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);

const EXPECTED_IDS = [
  "wcbt-77c96178-7761-4243-9762-d85f730d8676",
  "wcbt-77d74eb7-43d2-421e-91a6-66405189f1f2",
  "wcbt-77fe689b-73dd-4b7f-80fd-4d794d468b8f",
  "wcbt-786dc116-eed5-4aed-b41f-2fd4def06920",
  "wcbt-799be6ca-ad4f-487b-872c-68392459797f",
  "wcbt-79f3f7f3-4827-4d41-bd5f-c7cdfc2eb35b",
  "wcbt-7a095646-c8af-460d-ae55-23c8a4e14805",
  "wcbt-7a2a008d-bc95-4b06-b520-5c5e8b75a408",
  "wcbt-7a4b416c-da37-4c7b-ab99-08b322d65700",
  "wcbt-7adf06d7-5cc9-4ee1-b138-1bbd4cb63f5e",
  "wcbt-7afa6e4e-4671-4bce-b61a-5d632c452259",
  "wcbt-7cbc2b96-1c2a-4e8f-a3df-8375e14ce9de",
  "wcbt-7d2aba6c-7ddf-4559-bfcb-b535c53c7d21",
  "wcbt-7f217133-abbe-4aa7-ad38-ab2aba2d869c",
  "wcbt-7f774cbd-2064-4e3d-a315-eff2f15d2e85",
  "wcbt-80706c8a-dcaa-46b3-b224-5b0be9571ad1",
  "wcbt-8110b161-2486-4565-af02-fe35b463d8d5",
  "wcbt-8136767c-e891-4be3-b146-2262eb3b1609",
  "wcbt-8256a6bc-6d25-4444-aee5-433e254cc50a",
  "wcbt-82d1138e-598e-4c93-abd5-3cf8336e9f79",
  "wcbt-82dc3102-37c3-4776-87d6-687fd59c644b",
  "wcbt-8300ec36-b2c5-46ab-ba1c-2d0dbfe2e0f3",
  "wcbt-84152a71-d25a-4012-867d-fec93e3b54c7",
  "wcbt-84763bc0-9648-4942-a4e5-4e9ef4659b74",
  "wcbt-84f775a0-c945-40ff-a349-f48457be3752",
  "wcbt-85708e17-4943-4867-acd6-9dd53ab04a3e",
  "wcbt-85957333-1657-4bf9-beb9-2e6e7ef627bf",
  "wcbt-85f146ae-1ef7-4a74-994d-af4975753cfd",
  "wcbt-868cd16d-a8be-406d-90d9-30db9b7fcf2d",
  "wcbt-86ef214a-a8b8-4b1d-8eb2-67d88b6920c1",
  "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128",
  "wcbt-8b411328-b443-462d-b541-04b20f0d1009",
  "wcbt-8b917311-40fb-4ad0-83e4-f4defa8993e2",
  "wcbt-8bd32a13-a544-4238-8cf9-7b73632b9ed2",
  "wcbt-8c6297e5-7253-427d-8e7d-d69da076df9b",
  "wcbt-8d95af75-7382-4895-a637-dd79dea99d64",
  "wcbt-8dc15426-0548-4953-aa70-cd2ff217b9fa",
  "wcbt-8e49c987-7eae-400b-a310-44c7b1243175",
  "wcbt-8eeaa651-8843-46ee-a866-cf3f942db146",
  "wcbt-8f2a8bdf-84c2-4d6c-a18e-bf9095360aaf",
  "wcbt-901628ba-de3a-4f81-b9fc-76d7afb8b893",
  "wcbt-91703a40-c539-4c1b-944f-21d1aa5ab13f",
  "wcbt-922e945a-a2af-4f2d-9d79-cef946bf1562",
  "wcbt-930074db-4314-4849-a66c-de84fb9d5312",
  "wcbt-93154ef4-aea0-455d-8056-1cf2958182f3",
  "wcbt-9398f220-d2e7-4e16-b52b-c594091d6dd1",
  "wcbt-93b768cb-bf55-4b99-b6de-7e1d9d471453",
  "wcbt-93d836a7-62f0-45e0-a4bd-5904119c428b",
  "wcbt-9571fa34-020d-437e-b8d1-5b1fae0de65d",
  "wcbt-9585836a-4e5e-4770-8365-ca5a34d328a6",
] as const;

/** Immutable, line-for-line result rows from the supplied GPT Pro review. */
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
  "wcbt-7a2a008d-bc95-4b06-b520-5c5e8b75a408": [
    "choice_issue_all_choices_related_to_acetylene_explosion_safety: pressure, acetone, heat, and copper-alloy conditions each have a material safety relationship, so the immutable set has no technically unique answer.",
  ],
  "wcbt-7f774cbd-2064-4e3d-a315-eff2f15d2e85": [
    "choice_issue_correct_mig_downslope_function_absent: the stem describes crater down-slope/current taper, while the immutable choices name start, burn-back, pre-flow, and post-flow functions only.",
  ],
};

const realLessonBindingOverrides: Record<
  string,
  {
    lessonId: string;
    lessonBlockId: string;
    assertionText: string;
    officialSourceRef?: string;
  }
> = {
  "wcbt-7a095646-c8af-460d-ae55-23c8a4e14805": {
    lessonId: "lesson-welding-foundation-electrodes",
    lessonBlockId: "definition",
    assertionText: "피복제는 아크 안정, 보호가스와 슬래그 형성, 탈산·정련에 관여한다.",
  },
  "wcbt-7d2aba6c-7ddf-4559-bfcb-b535c53c7d21": {
    lessonId: "lesson-welding-foundation-electrodes",
    lessonBlockId: "structure",
    assertionText: "GMAW는 연속 솔리드와이어가 전극과 용가재 역할을 하며 외부 보호가스를 쓴다.",
  },
  "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128": {
    lessonId: "lesson-welding-safety-management",
    lessonBlockId: "exam-point",
    assertionText: "안전관리 문제는 작업 전 점검·안전교육·재해예방 원칙을 실제 작업 조건과 연결해 묻는다.",
    officialSourceRef: "Korean-OSH-sign-color-table",
  },
};

function calculationEvidenceFor(result: GptResult) {
  const calculation = result.tests.calculation;
  if (
    !calculation
    || typeof calculation.formula !== "string"
    || typeof calculation.substitution !== "string"
    || typeof calculation.result !== "string"
  ) {
    return null;
  }
  return calculation;
}

function assessmentKindFor(result: GptResult) {
  if (result.id === "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128") {
    return "identification" as const;
  }
  return calculationEvidenceFor(result) ? "calculation" as const : "principle" as const;
}

const calculationAssertionOverrides: Record<string, string> = {
  "wcbt-868cd16d-a8be-406d-90d9-30db9b7fcf2d":
    "작업시간은 t=(V×P)÷q로 계산하며, 33L×100÷300L/h=11시간이다.",
};

function calculationStepsFor(result: GptResult, correctChoice: string) {
  const overrides: Record<string, readonly string[]> = {
    "wcbt-8136767c-e891-4be3-b146-2262eb3b1609": [
      "계산식은 작업시간 t=(용기 내용적 V×충전압력 P)÷팁의 산소소비량 q입니다.",
      "값을 대입하면 t=(40.7L×100kgf/cm²)÷100L/h=40.7이며 이는 146,520s로 환산됩니다.",
      "계산 결과는 147,600s이므로, 이를 시간으로 반올림한 정답은 41시간입니다.",
    ],
    "wcbt-868cd16d-a8be-406d-90d9-30db9b7fcf2d": [
      "계산식은 프랑스식 팁의 작업시간 t=(V×P)÷q입니다.",
      "값을 대입하면 t=(33L×100kgf/cm²)÷300L/h=11로 계산됩니다.",
      "계산 결과는 39,600s이며, 이는 11시간이므로 정답은 11시간입니다.",
    ],
  };
  const override = overrides[result.id];
  if (override) return override;

  const calculation = calculationEvidenceFor(result);
  if (!calculation) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_05_CALCULATION_DETAIL_MISSING:" + result.id);
  }
  return [
    "Formula: " + calculation.formula,
    "Substitution with units: " + calculation.substitution,
    "Result: " + calculation.result + "; this matches the correct choice " + correctChoice + ".",
  ];
}

function publishCandidate(
  result: GptResult,
  projection: (typeof WELDING_CBT_LESSON_PROJECTION.entries)[number],
  source: (typeof rawWeldingCbtBank.records)[number],
) {
  const assessmentKind = assessmentKindFor(result);
  const bindingOverride = realLessonBindingOverrides[result.id];
  const lessonId = bindingOverride?.lessonId ?? projection.primaryLeafLessonId;
  const correctChoice = source.choices[source.correctIndex];
  if (!lessonId || !correctChoice) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_05_LESSON_OR_ANSWER_MISSING:" + result.id);
  }

  const calculation = calculationEvidenceFor(result);
  return {
    canonicalId: result.id,
    contentDigest: projection.contentDigest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind,
    primaryLeafLessonId: lessonId,
    conceptBinding: {
      lessonId,
      lessonBlockId: bindingOverride?.lessonBlockId ?? "principle",
      assertionText:
        calculationAssertionOverrides[result.id]
        ?? bindingOverride?.assertionText
        ?? result.lessonSentence,
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: lessonId + "#" + (bindingOverride?.lessonBlockId ?? "principle"),
        },
        { kind: "source_question" as const, ref: result.id },
        ...(bindingOverride?.officialSourceRef
          ? [{ kind: "official_source" as const, ref: bindingOverride.officialSourceRef }]
          : []),
        ...(calculation
          ? [{
            kind: "calculation_derivation" as const,
            ref: "formula=" + calculation.formula
              + "; substitution=" + calculation.substitution
              + "; result=" + calculation.result,
          }]
          : []),
      ],
    },
    answerExplanation: result.directSolution,
    solutionSteps: assessmentKind === "calculation"
      ? calculationStepsFor(result, correctChoice)
      : ["Reasoning: " + result.directSolution, "Lesson criterion: " + result.lessonSentence],
    keyRule: "Key rule: " + result.lessonSentence,
    choiceFeedback: result.choiceRationales.map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === source.correctIndex;
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale,
        plausibleReason: "Choice-specific evidence: " + rationale,
        incorrectPoint: isCorrect
          ? null
          : "Selected-versus-correct distinction: " + rationale,
        keyRule: isCorrect
          ? "Key rule: " + result.lessonSentence
          : "Rule applied to this choice: " + result.lessonSentence + " " + rationale,
        differenceFromCorrect: isCorrect ? null : result.directSolution,
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
  WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [
    entry.canonicalId,
    entry,
  ]),
);
const sourceById = new Map(
  rawWeldingCbtBank.records
    .filter((record) => record.correctIndex !== null)
    .map((record) => [record.canonicalId, record]),
);

if (
  GPT_RESULTS.length !== EXPECTED_IDS.length
  || new Set(GPT_RESULTS.map((result) => result.id)).size !== EXPECTED_IDS.length
  || GPT_RESULTS.some((result, index) => result.id !== EXPECTED_IDS[index])
) {
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_05_EXACT_SET_MISMATCH");
}

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_05 =
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
      throw new Error("SUBJECT_2_GPT_HOLD_BATCH_05_SOURCE_MISMATCH:" + result.id);
    }

    const holdReasons = blockedReasons[result.id];
    if (!PUBLISHABLE_VERDICTS.has(result.verdict) || holdReasons) {
      if (!holdReasons) {
        throw new Error("SUBJECT_2_GPT_HOLD_BATCH_05_UNLEDGERED_HOLD:" + result.id);
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
