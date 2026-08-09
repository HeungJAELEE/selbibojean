import { Buffer } from "node:buffer";
import { gunzipSync } from "node:zlib";

import rawWeldingCbtBank from "@/data/generated/welding-cbt-bank.json";
import { WELDING_CBT_LESSON_PROJECTION } from "@/data/source/welding-cbt-lesson-projection";

type GptVerdict = "ACCEPT" | "REVISE" | "CHOICE_ISSUE" | "HOLD";
type CalculationEvidence = { formula: string; substitution: string; result: string };
type GptResult = {
  id: string;
  verdict: GptVerdict;
  correctChoiceId: number;
  directSolution: string;
  choiceRationales: readonly string[];
  lessonSentence: string;
  tests: Record<string, unknown>;
};

const AUTHOR = "subject-2-gpt-hold-batch-07-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);

const EXPECTED_IDS = [
  "wcbt-b44c6391-c091-4a30-86f4-4db7cc66e042",
  "wcbt-b51a0d4b-4ffa-42a6-9541-d67601f6991d",
  "wcbt-b5db8dcc-598a-43ae-abff-96661bcf2707",
  "wcbt-b6170b72-ebf1-423e-a924-1ab656c039ba",
  "wcbt-b6dcab8c-097d-4aa9-9e5d-e589400ed107",
  "wcbt-b6ec049a-3023-487c-b28a-cac96dec3e9d",
  "wcbt-b7446bb2-a6d3-4e8d-bd4c-37cc2d15f6b8",
  "wcbt-b8eed5d3-45f3-4817-ae0c-16b24edc2aef",
  "wcbt-b98bb4f6-b005-4c3e-8d05-a7ffc7529ed3",
  "wcbt-ba5ac236-873f-47be-813b-1823dc99b131",
  "wcbt-bb1a153a-4e87-4af7-91df-b63f27b3cc39",
  "wcbt-bb46e1d0-c14a-41f2-8cb8-609b004f1b9f",
  "wcbt-bb5d5d2f-5e43-4885-938a-158efd1678cc",
  "wcbt-bbd5c5b3-2965-4c5d-9b34-955d68405c9e",
  "wcbt-bc50f787-acef-464f-bbb8-45024b58d596",
  "wcbt-bce3cfeb-3e2c-4a8d-8fe1-881a4e5a367e",
  "wcbt-bd1f47d5-667a-4d42-b72a-9a0010c19ee9",
  "wcbt-bd3f5cca-16d5-48b5-ab29-f857f3a2e827",
  "wcbt-beff8783-7b5d-4989-a337-d4d7b3506ffe",
  "wcbt-bf13ceb3-2308-4fad-bd37-e2fd026ae7ce",
  "wcbt-c05c93b5-5663-4e78-8871-d156bb4f078f",
  "wcbt-c0d01721-ad4b-4481-977f-06db04bd3f89",
  "wcbt-c11f00fd-734c-471c-b9be-e9937703c2d4",
  "wcbt-c2023671-499b-418f-b635-66d40a758128",
  "wcbt-c21531d9-223d-4572-9460-1e80f2e9cd75",
  "wcbt-c24361f3-a550-4009-9085-f42dd41ed8d2",
  "wcbt-c2bf8f9d-2b38-4b83-b592-45107077a9ba",
  "wcbt-c37cac88-310a-4d05-b13b-a63b5aa4b0d9",
  "wcbt-c3b3f647-5df3-417e-90f8-e58b0ec8aa66",
  "wcbt-c3b79dfe-54de-429e-9bee-f842bad64249",
  "wcbt-c424eeb3-b2b1-4e72-a427-c4dc7cf7f264",
  "wcbt-c4744e84-4f79-496f-ab6f-0d8eac062463",
  "wcbt-c47fcc2c-cd8a-4833-9093-cf7fd36d8c98",
  "wcbt-c56f30ee-f211-4c2e-b573-f0f4797ceb6e",
  "wcbt-c5b6edeb-085e-4fa2-b735-7f07f6dc3477",
  "wcbt-c5fbf279-a648-4d1d-9462-abffd6cb9b1a",
  "wcbt-c64381ad-91e6-4b16-82fc-63bd206bf1be",
  "wcbt-c84b2840-9aec-4719-bb7c-9f0916b7ab17",
  "wcbt-c8afd1af-91f1-4cde-947c-26d530c5c95b",
  "wcbt-c8dc3368-3fcd-4383-9aa0-02961d337997",
  "wcbt-c8f1fe36-7712-43c1-b228-eaa20988e52e",
  "wcbt-c9940318-4550-4ce9-bf71-c7f810861fd0",
  "wcbt-ca5a48ae-2ed9-477c-b4c9-896abfc18ee2",
  "wcbt-cbe1febc-3857-4d07-9925-14da803dbaac",
  "wcbt-cbfb7700-fd7f-4fe7-b262-bcbf544fa0a6",
  "wcbt-cc962377-fe06-436e-8fa0-895042a3684e",
  "wcbt-cd02234a-2201-4e0d-b017-526e5f875999",
  "wcbt-cd4322fb-71f8-43ff-88ba-3f94b4faa7b2",
  "wcbt-cded0304-db1f-43f3-b6b7-058b579531e0",
  "wcbt-ce5568b4-be67-4f2e-a451-09a07459ff81"
] as const;

/** Immutable, line-for-line GPT Pro review rows from the supplied packet. */
const GPT_RESULTS = JSON.parse(
  gunzipSync(Buffer.from([
    "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",
    "DnGW1LY2sgfUDnnXSfP80/8HLJkbirLpAAA=",
  ].join(""), "base64")).toString("utf8"),
) as GptResult[];

const CALCULATION_EVIDENCE: Record<string, CalculationEvidence> = {
  "wcbt-b8eed5d3-45f3-4817-ae0c-16b24edc2aef": { formula: "Q = Δm × v", substitution: "(34 kgf − 31 kgf) × 905 L/kg = 3 kg × 905 L/kg", result: "2715 L" },
  "wcbt-bb5d5d2f-5e43-4885-938a-158efd1678cc": { formula: "Q = V × P", substitution: "40.7 L × 150 = 6105 L", result: "6105 L" },
  "wcbt-c0d01721-ad4b-4481-977f-06db04bd3f89": { formula: "D₂ = D₁ × (I₁/I₂)²", substitution: "40% × (200 A/130 A)² = 94.68%", result: "95%" },
  "wcbt-c24361f3-a550-4009-9085-f42dd41ed8d2": { formula: "t = V × P ÷ q", substitution: "33 L × 100 ÷ 300 L/h = 11 h", result: "11 h" },
  "wcbt-c56f30ee-f211-4c2e-b573-f0f4797ceb6e": { formula: "I = S ÷ V", substitution: "25,000 VA ÷ 200 V = 125 A", result: "125 A" },
};

const blockedReasons: Record<string, readonly string[]> = {
  "wcbt-ba5ac236-873f-47be-813b-1823dc99b131": [
    "choice_issue_acetylene_explosion_numeric_claim_conflict: the reconstructed alternatives contain historical numeric conditions that conflict with the current evidence basis, so the immutable set cannot support one unique publishable answer.",
  ],
  "wcbt-bb1a153a-4e87-4af7-91df-b63f27b3cc39": [
    "choice_issue_welding_shade_number_current_condition_missing: shade-number selection requires actual arc-current conditions, which the immutable stem does not supply.",
  ],
  "wcbt-ca5a48ae-2ed9-477c-b4c9-896abfc18ee2": [
    "choice_issue_common_tig_mig_co2_shade_number_condition_missing: the immutable stem asks for a common fixed shade number although suitability varies by process and arc current.",
  ],
};

/** The projection retains four retired leaf keys; use the current same-subject leaf. */
const lessonIdOverrides: Record<string, string> = {
  "wcbt-b51a0d4b-4ffa-42a6-9541-d67601f6991d": "lesson-welding-foundation-deformation",
  "wcbt-c3b3f647-5df3-417e-90f8-e58b0ec8aa66": "lesson-welding-special-processes",
  "wcbt-c4744e84-4f79-496f-ab6f-0d8eac062463": "lesson-welding-foundation-electrodes",
  "wcbt-ce5568b4-be67-4f2e-a451-09a07459ff81": "lesson-welding-foundation-electrodes",
};

const calculationAssertionOverrides: Record<string, string> = {
  "wcbt-b8eed5d3-45f3-4817-ae0c-16b24edc2aef":
    "용해 아세틸렌량은 Q=Δm×905L/kg로 계산하며, (34kgf-31kgf)×905L/kg=2715L이다.",
};

function calculationEvidenceFor(result: GptResult) {
  return CALCULATION_EVIDENCE[result.id] ?? null;
}

function assessmentKindFor(result: GptResult) {
  return calculationEvidenceFor(result) ? "calculation" as const : "principle" as const;
}

function calculationStepsFor(result: GptResult, correctChoice: string) {
  const calculation = calculationEvidenceFor(result);
  if (!calculation) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_07_CALCULATION_DETAIL_MISSING:" + result.id);
  }
  const overrides: Record<string, readonly string[]> = {
    "wcbt-b8eed5d3-45f3-4817-ae0c-16b24edc2aef": [
      "계산식은 아세틸렌 양 Q=충전 질량차 Δm×15℃ 환산량 905L/kg입니다.",
      "충전 질량차는 34kgf-31kgf=3kg이고 Q=3kg×905L/kg로 대입합니다.",
      "계산 결과는 2,715L이므로 네 번째 보기입니다.",
    ],
    "wcbt-bb5d5d2f-5e43-4885-938a-158efd1678cc": [
      "계산식은 산소의 대기압 환산량 Q=용기 내용적 V×충전압력 P입니다.",
      "값을 대입하면 Q=40.7L×150이며 곱은 6,105입니다.",
      "계산 결과는 6,105L이므로 정답은 6105입니다.",
    ],
    "wcbt-c0d01721-ad4b-4481-977f-06db04bd3f89": [
      "계산식은 허용사용률 D₂=D₁×(I₁÷I₂)²입니다.",
      "값을 대입하면 D₂=40%×(200A÷130A)²이며 계산값은 94.68입니다.",
      "계산 결과는 약 95%이므로 네 번째 보기입니다.",
    ],
    "wcbt-c24361f3-a550-4009-9085-f42dd41ed8d2": [
      "계산식은 작업시간 t=(용기 내용적 V×충전압력 P)÷팁 소비량 q입니다.",
      "값을 대입하면 t=(33L×100kgf/cm²)÷300L/h=11로 계산됩니다.",
      "계산 결과는 39,600s이며, 이는 11시간이므로 정답은 11시간입니다.",
    ],
    "wcbt-c56f30ee-f211-4c2e-b573-f0f4797ceb6e": [
      "계산식은 단상 용접기 입력전류 I=S÷V입니다.",
      "값을 대입하면 I=25,000VA÷200V이며 몫은 125입니다.",
      "계산 결과는 125A이므로 세 번째 보기입니다.",
    ],
  };
  return overrides[result.id] ?? [
    "계산식: " + calculation.formula,
    "대입·단위: " + calculation.substitution,
    "계산 결과: " + calculation.result + "; 정답 보기 " + correctChoice + "와 대조합니다.",
  ];
}

function publishCandidate(
  result: GptResult,
  projection: (typeof WELDING_CBT_LESSON_PROJECTION.entries)[number],
  source: (typeof rawWeldingCbtBank.records)[number],
) {
  const assessmentKind = assessmentKindFor(result);
  const lessonId = lessonIdOverrides[result.id] ?? projection.primaryLeafLessonId;
  const correctChoice = source.choices[source.correctIndex];
  if (!lessonId || !correctChoice) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_07_LESSON_OR_ANSWER_MISSING:" + result.id);
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
      lessonBlockId: "principle",
      assertionText: calculationAssertionOverrides[result.id] ?? result.lessonSentence,
      evidenceRefs: [
        { kind: "lesson_block" as const, ref: lessonId + "#principle" },
        { kind: "source_question" as const, ref: result.id },
        ...(calculation ? [{
          kind: "calculation_derivation" as const,
          ref: "formula=" + calculation.formula + "; substitution=" + calculation.substitution + "; result=" + calculation.result,
        }] : []),
      ],
    },
    answerExplanation: result.directSolution + " 정답 선택지는 ‘" + correctChoice + "’이다.",
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
        incorrectPoint: isCorrect ? null : "Selected-versus-correct distinction: " + rationale,
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
  WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [entry.canonicalId, entry]),
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
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_07_EXACT_SET_MISMATCH");
}

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_07 =
  GPT_RESULTS.map((result) => {
    const projection = projectionById.get(result.id);
    const source = sourceById.get(result.id);
    if (
      !projection
      || !source
      || projection.contentDigest !== source.canonicalFingerprint
      || source.correctIndex !== result.correctChoiceId
      || source.choices.length !== 4
      || source.choices.some((choice) => typeof choice !== "string")
      || typeof source.stem !== "string"
      || result.choiceRationales.length !== source.choices.length
    ) {
      throw new Error("SUBJECT_2_GPT_HOLD_BATCH_07_SOURCE_MISMATCH:" + result.id);
    }

    const holdReasons = blockedReasons[result.id];
    if (!PUBLISHABLE_VERDICTS.has(result.verdict) || holdReasons) {
      if (!holdReasons) {
        throw new Error("SUBJECT_2_GPT_HOLD_BATCH_07_UNLEDGERED_HOLD:" + result.id);
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
