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
  tests: Record<string, unknown> & { calculationChecked?: boolean };
};
type CalculationDetail = {
  formula: string;
  substitution: string;
  result: string;
};

const AUTHOR = "subject-2-gpt-hold-batch-08-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);
const lessonIdOverrides: Readonly<Record<string, string>> = {
  "wcbt-dd389161-8ff4-4984-8b5f-dc86347413e8": "lesson-welding-foundation-power-heat",
  "wcbt-e34e9863-3071-4160-badd-429e396e7c1c": "lesson-welding-foundation-power-heat",
  "wcbt-e82f878f-d67c-47cc-9afe-5f06f05207e4": "lesson-welding-safety-management",
};

const EXPECTED_IDS = [
  "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe",
  "wcbt-cf46554d-76b0-4f70-b7d5-d5e117ac105d",
  "wcbt-cfe0d4c7-a8db-42d1-9759-c25a03def708",
  "wcbt-d016bfad-2d67-4140-862e-2e56492d797e",
  "wcbt-d04cf3b7-0874-44d3-9438-a066fc26bdc8",
  "wcbt-d10ddb45-60d1-424f-8b14-7430a7158464",
  "wcbt-d1cc6867-006c-4d7f-bfad-2c48d66fca53",
  "wcbt-d1f709cb-3717-42ad-9551-8c19e93643bb",
  "wcbt-d2a0c21c-d30c-40c0-8a6c-940ea27a8387",
  "wcbt-d2d4d97a-7fe8-4e35-a83b-35b4294d79df",
  "wcbt-d3f71696-6187-4b10-b7af-3284f188d883",
  "wcbt-d588064c-625b-4689-8b7d-6e832b2c0f57",
  "wcbt-d6115815-1f6b-4057-8e47-544623efa126",
  "wcbt-d812451f-ba08-4667-86bb-c5ba6442fd20",
  "wcbt-d8b661b3-8b34-46ac-8107-5e584d0bc27e",
  "wcbt-d90bc15e-4578-41ca-9a90-a32fd2c8f6cc",
  "wcbt-d9548928-3ee2-4f2a-90d3-f50820142e3f",
  "wcbt-da2e3518-f489-417d-9957-0e74ef173857",
  "wcbt-dabf8f68-5efa-4f04-b9d7-c748ef21bebc",
  "wcbt-dc264edc-738f-4d92-9667-c15597b14bd0",
  "wcbt-dc4ee99f-f73c-4c24-adf6-460d2d45463d",
  "wcbt-dcc31c72-925e-4fca-a334-e1bef1c4c2cf",
  "wcbt-dd389161-8ff4-4984-8b5f-dc86347413e8",
  "wcbt-dd8f606c-ec88-4b08-83d2-6dbc9830b3fe",
  "wcbt-de3c3b0a-d038-4e5e-a1b5-84af45c5083f",
  "wcbt-de3d5b54-b1ff-488a-a622-444b949df0bb",
  "wcbt-de7f12c8-0081-4c24-8da4-ba7879e463a8",
  "wcbt-decc4b6d-72ae-403c-b61d-21c664cdfd73",
  "wcbt-df5595a1-87d5-43fe-87d7-efce22bbf671",
  "wcbt-e0c8202c-2ec8-4d42-bc1a-01a4daab8fd6",
  "wcbt-e0fa3fb4-694f-4e55-9678-33015de507e3",
  "wcbt-e13a6159-7287-49bd-84e2-2f5f201c9394",
  "wcbt-e18a8e80-3b6d-449d-9c9e-a19d718fe8d8",
  "wcbt-e2236840-c559-460c-8891-4b1456d3e72b",
  "wcbt-e322b722-f1e1-432c-872f-97476518af6d",
  "wcbt-e34e9863-3071-4160-badd-429e396e7c1c",
  "wcbt-e35ba685-ecc1-49da-99db-77b53525e58a",
  "wcbt-e3dcf843-d5b6-404d-a09a-ac7c419e0e26",
  "wcbt-e46283d7-7ceb-42c6-b9f0-7683f2de75a1",
  "wcbt-e4813b7a-2b14-4acf-8f30-22abdc152a54",
  "wcbt-e5699573-06f7-4875-ad2f-cede0184ab99",
  "wcbt-e5eb93a6-1f16-4d8c-ac02-1c4ddc75a4df",
  "wcbt-e77fd21a-737f-4407-a9fd-7fbcfae27f8d",
  "wcbt-e785ee2b-56ac-45e1-8ed0-ddb4abb9af47",
  "wcbt-e7d0a421-44c3-4f07-b260-94b85969805b",
  "wcbt-e8035ef5-ce6e-49f8-acd4-45aa6c0d916d",
  "wcbt-e82f878f-d67c-47cc-9afe-5f06f05207e4",
  "wcbt-e84ebfbd-e848-48e5-85f2-b66383042a0c",
  "wcbt-e9180f4c-f793-453d-a08e-e6e55c993354",
  "wcbt-e95eb7e9-5395-47d5-a327-deea591263c2",
] as const;

/**
 * Immutable, line-for-line result rows from the supplied GPT review. This
 * artifact remains local and does not alter the reconstructed source bank.
 */
const GPT_RESULTS = gunzipSync(
  Buffer.from(
      [
      "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",
      ].join(""),
      "base64",
  ),
).toString("utf8").trim().split("\n").map((line) => JSON.parse(line) as GptResult);

const blockedReasons: Record<string, readonly string[]> = {
  "wcbt-d6115815-1f6b-4057-8e47-544623efa126": [
    "hold_primary_conflict_acetylene_autoignition_temperature: supplied 406-408 C conflicts with current primary-source evidence of about 305 C, so the immutable choices do not support one unique answer.",
  ],
};

const calculationDetails: Record<string, CalculationDetail> = {
  "wcbt-cf105c30-d472-4fa4-af62-66079cb9f7fe": {
    formula: "V approximately equals cylinder volume times gauge pressure.",
    substitution: "V = 33.7 L times 120 kgf/cm2 = 4044 L.",
    result: "4044 L matches choice 2; this retains the supplied high-pressure exam approximation and its stated absolute-pressure caveat.",
  },
  "wcbt-d10ddb45-60d1-424f-8b14-7430a7158464": {
    formula: "Consumed gas volume equals cylinder volume times pressure decrease.",
    substitution: "Delta P = 80 - 10 = 70 kgf/cm2; V = 50 L times 70 kgf/cm2 = 3500 L.",
    result: "3500 L matches choice 2.",
  },
  "wcbt-da2e3518-f489-417d-9957-0e74ef173857": {
    formula: "Single-phase current I = S / V.",
    substitution: "I = 25000 VA / 200 V = 125 A.",
    result: "125 A matches choice 3.",
  },
  "wcbt-de3c3b0a-d038-4e5e-a1b5-84af45c5083f": {
    formula: "Mild-steel gas-welding empirical relation d = T / 2 + 1 mm.",
    substitution: "T = 2(d - 1) = 2 times (3.2 mm - 1 mm) = 4.4 mm.",
    result: "4.4 mm matches choice 1.",
  },
  "wcbt-e322b722-f1e1-432c-872f-97476518af6d": {
    formula: "Single-phase input current I = S / V.",
    substitution: "I = 25000 VA / 200 V = 125 A.",
    result: "125 A matches choice 3.",
  },
  "wcbt-e5699573-06f7-4875-ad2f-cede0184ab99": {
    formula: "Exam approximation V approximately equals cylinder volume times filling pressure.",
    substitution: "V = 46.7 L times 150 kgf/cm2 = 7005 L.",
    result: "7005 L matches choice 4.",
  },
  "wcbt-e9180f4c-f793-453d-a08e-e6e55c993354": {
    formula: "Exam approximation V approximately equals cylinder volume times filling pressure.",
    substitution: "V = 33.7 L times 120 kgf/cm2 = 4044 L.",
    result: "4044 L matches choice 2.",
  },
};

function assessmentKindFor(result: GptResult) {
  return result.tests.calculationChecked === true ? "calculation" as const : "principle" as const;
}

function calculationStepsFor(result: GptResult, correctChoice: string) {
  const detail = calculationDetails[result.id];
  if (!detail) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_08_CALCULATION_DETAIL_MISSING:" + result.id);
  }

  const overrides: Record<string, readonly string[]> = {
    "wcbt-d10ddb45-60d1-424f-8b14-7430a7158464": [
      "계산식은 산소 소비량 Q=용기 내용적 V×압력 감소량 (P₁-P₂)입니다.",
      "압력 감소량은 80-10=70이고 Q=50L×70으로 대입해 3,500을 얻습니다.",
      "계산 결과는 3,500L이므로 정답은 3500ℓ입니다.",
    ],
    "wcbt-da2e3518-f489-417d-9957-0e74ef173857": [
      "계산식은 단상 1차 전류 I=S÷V입니다.",
      "값을 대입하면 I=25,000VA÷200V이며 몫은 125입니다.",
      "계산 결과는 125A이므로 정답은 125[A]입니다.",
    ],
    "wcbt-de3c3b0a-d038-4e5e-a1b5-84af45c5083f": [
      "계산식은 연강 가스용접의 경험식 d=T÷2+1mm이며, 이를 정리하면 T=2(d-1mm)입니다.",
      "용접봉 지름 d=3.2mm를 대입하면 T=2×(3.2mm-1mm)이고 계산값은 4.4입니다.",
      "계산 결과는 4.4mm이므로 정답은 4.4입니다.",
    ],
    "wcbt-e322b722-f1e1-432c-872f-97476518af6d": [
      "계산식은 피복금속 아크 용접기의 1차 전류 I=S÷V입니다.",
      "값을 대입하면 I=25,000VA÷200V이며 몫은 125입니다.",
      "계산 결과는 125A이므로 세 번째 보기입니다.",
    ],
    "wcbt-e5699573-06f7-4875-ad2f-cede0184ab99": [
      "계산식은 대기압 환산 산소량 Q=용기 내용적 V×충전압력 P입니다.",
      "값을 대입하면 Q=46.7L×150이며 곱은 7,005입니다.",
      "계산 결과는 7,005L이므로 정답은 7005입니다.",
    ],
    "wcbt-e9180f4c-f793-453d-a08e-e6e55c993354": [
      "계산식은 대기압 환산용적 Q=용기 내용적 V×충전압력 P입니다.",
      "값을 대입하면 Q=33.7L×120이며 곱은 4,044입니다.",
      "계산 결과는 4,044L이므로 정답은 4044입니다.",
    ],
  };
  return overrides[result.id] ?? [
    "계산식: " + detail.formula,
    "대입·단위: " + detail.substitution,
    "계산 결과: " + detail.result + " 정답 보기 " + correctChoice + "와 대조합니다.",
  ];
}

function publishCandidate(
  result: GptResult,
  projection: (typeof WELDING_CBT_LESSON_PROJECTION.entries)[number],
  source: (typeof rawWeldingCbtBank.records)[number],
) {
  const lessonId = lessonIdOverrides[result.id] ?? projection.primaryLeafLessonId;
  const correctChoice = source.choices[source.correctIndex];
  const assessmentKind = assessmentKindFor(result);
  if (!lessonId || !correctChoice) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_08_LESSON_OR_ANSWER_MISSING:" + result.id);
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
      assertionText: result.lessonSentence,
      evidenceRefs: [
        { kind: "lesson_block" as const, ref: lessonId + "#principle" },
        { kind: "source_question" as const, ref: result.id },
        ...(assessmentKind === "calculation"
          ? [{
            kind: "calculation_derivation" as const,
            ref: calculationStepsFor(result, correctChoice).join("; "),
          }]
          : []),
      ],
    },
    answerExplanation: result.directSolution,
    solutionSteps: assessmentKind === "calculation"
      ? calculationStepsFor(result, correctChoice)
      : [
        "Direct solution: " + result.directSolution,
        "Lesson criterion: " + result.lessonSentence,
      ],
    keyRule: result.lessonSentence,
    choiceFeedback: result.choiceRationales.map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === source.correctIndex;
      const choiceNumber = choiceIndex + 1;
      const choiceRationale = rationale.length >= 12
        ? rationale
        : "선택지 " + choiceNumber + " 판단 근거: " + rationale;
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale: choiceRationale,
        plausibleReason: "Choice-specific reasoning: " + choiceRationale,
        incorrectPoint: isCorrect
          ? null
          : "Choice " + choiceNumber + " differs from correct choice "
            + (source.correctIndex + 1) + ": " + choiceRationale,
        keyRule: "Rule applied to choice " + choiceNumber + ": " + result.lessonSentence,
        differenceFromCorrect: isCorrect
          ? null
          : "Unlike correct choice " + (source.correctIndex + 1) + " (" + correctChoice
            + "), choice " + choiceNumber + " is rejected because " + choiceRationale,
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
  GPT_RESULTS.length !== EXPECTED_IDS.length
  || new Set(GPT_RESULTS.map((result) => result.id)).size !== EXPECTED_IDS.length
  || GPT_RESULTS.some((result, index) => result.id !== EXPECTED_IDS[index])
  || verdictCounts.ACCEPT !== 49
  || verdictCounts.REVISE !== 0
  || verdictCounts.CHOICE_ISSUE !== 0
  || verdictCounts.HOLD !== 1
) {
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_08_EXACT_SET_OR_VERDICT_MISMATCH");
}

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_08 =
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
      throw new Error("SUBJECT_2_GPT_HOLD_BATCH_08_SOURCE_MISMATCH:" + result.id);
    }

    const holdReasons = blockedReasons[result.id];
    if (!PUBLISHABLE_VERDICTS.has(result.verdict) || holdReasons) {
      if (!holdReasons) {
        throw new Error("SUBJECT_2_GPT_HOLD_BATCH_08_UNLEDGERED_HOLD:" + result.id);
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
