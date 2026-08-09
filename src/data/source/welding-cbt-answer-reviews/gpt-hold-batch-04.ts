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
  tests: readonly string[];
};

const AUTHOR = "subject-2-gpt-hold-batch-04-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);
const PROMOTED_C_IDS = new Set([
  "wcbt-7146bf9e-a336-4d68-bf23-9834c2003f93",
]);

const EXPECTED_IDS = [
  "wcbt-660f8987-975b-459d-b9ed-4e0b29ab5517",
  "wcbt-665aa96d-358b-49b6-85ff-2a4959aeb072",
  "wcbt-666809c5-1e60-4f90-af52-aaf84b843e31",
  "wcbt-66ec4b00-f32e-4898-98e4-bb812a67e35c",
  "wcbt-67e3488a-e554-4546-a776-5464d75a2154",
  "wcbt-68ccd2ca-fecb-43b8-a631-c14971189e6f",
  "wcbt-6922ab0e-8efe-44d8-88d4-2936190714ec",
  "wcbt-697ddc41-8c7f-4a06-a251-3dd3a0753f7d",
  "wcbt-69bf7747-7602-433d-beb5-34aa05b0bccc",
  "wcbt-69fa37b5-9016-4e3f-9d57-7579a738c287",
  "wcbt-6a14f9d1-0b9c-4729-8688-819fdaa8297a",
  "wcbt-6a17f14d-41d7-4669-a7e3-1054c35dc564",
  "wcbt-6a36f746-613a-4870-9adf-dff0317f635a",
  "wcbt-6a84812d-8286-4bc0-9589-c9da392da3b5",
  "wcbt-6ae3f4ba-da59-4882-9527-c93cf40b3178",
  "wcbt-6b397197-6e80-4a75-9116-d1917669bcea",
  "wcbt-6c01dced-9b5b-42eb-a493-265efccd5087",
  "wcbt-6c715cc5-a085-4b96-b5a3-1214ec67ad82",
  "wcbt-6ca39a2c-f256-4cb4-ba4e-383f6dacd918",
  "wcbt-6d0b74e0-f84d-433a-be85-73af29610321",
  "wcbt-6d3a365d-009d-4bcc-919d-93541d0c85d3",
  "wcbt-6d3bb63d-6bfd-4bb8-bb8f-9225487e769d",
  "wcbt-6d971281-bbd4-45d2-9968-fdc9c770d1ef",
  "wcbt-6d9f3f9a-b947-4d13-9fd3-97a40ea4ab86",
  "wcbt-6dc1fdb7-e852-4eee-85f5-055c3ce19861",
  "wcbt-6e148eed-ae64-40f1-a514-463bfb57b82b",
  "wcbt-6e1842ed-1b16-4aca-94f3-38222279db32",
  "wcbt-6e2eda31-ff77-4159-831f-a97b7c319a4d",
  "wcbt-6e332d06-879a-4586-8cd3-70541d393e91",
  "wcbt-6e9aafab-29de-4eeb-b2da-a29acbb0f38d",
  "wcbt-6ea640f7-c430-4abe-b5a8-d862c2312571",
  "wcbt-6ef58bc6-26fd-4833-8db1-2dc3709e7c3a",
  "wcbt-70aee86e-0061-464c-ae45-3531caf57c40",
  "wcbt-70da0854-ea6b-4050-80bc-40f4b566f194",
  "wcbt-7101c3dc-d865-4f47-b357-7c93684c24fa",
  "wcbt-7146bf9e-a336-4d68-bf23-9834c2003f93",
  "wcbt-717fc07f-e0dc-44eb-8306-8be92109748b",
  "wcbt-71abac61-0c5f-463c-8d97-1e0ab952971d",
  "wcbt-71df4419-2eb7-4839-b826-5dbd4aa6d22e",
  "wcbt-722146cd-c070-464b-9743-47ee073680dd",
  "wcbt-733fbcae-d2c2-46c4-9f35-02eddba9997b",
  "wcbt-7464fb6c-ed91-480e-b2d4-df7cf83ba538",
  "wcbt-748c6048-140c-4585-99b2-1ba6b0389fc0",
  "wcbt-74f42564-e007-4f81-949b-e9cf09db5cd6",
  "wcbt-74f658b2-544b-498c-9fd6-c8f240721933",
  "wcbt-7549a259-99cd-4fe0-8c3e-4e1b5a4f665f",
  "wcbt-75d4bef1-9728-4ca6-95c3-0a84cbf1e096",
  "wcbt-76197828-9f05-496a-94a8-403ea045bdb8",
  "wcbt-764e8511-5d60-4b47-bf08-203d771097b8",
  "wcbt-76a22788-0490-409d-807e-b4151a3b2eba",
] as const;

/**
 * Immutable, line-for-line result rows from the supplied GPT Pro review.
 * This artifact remains local and is not a publication integration.
 */
const GPT_RESULTS = JSON.parse(
  gunzipSync(
    Buffer.from("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", "base64"),
  ).toString("utf8"),
) as GptResult[];

const blockedReasons: Record<string, readonly string[]> = {
  "wcbt-6ca39a2c-f256-4cb4-ba4e-383f6dacd918": [
    "choice_issue_missing_tip_size_fuel_gas_and_material_thickness: the stem's 'normal work' condition cannot fix one oxygen pressure range.",
  ],
  "wcbt-6d0b74e0-f84d-433a-be85-73af29610321": [
    "choice_issue_process_and_current_specific_shade_table: the stated 300 A work combines processes with different shade selections.",
  ],
  "wcbt-6d971281-bbd4-45d2-9968-fdc9c770d1ef": [
    "choice_issue_source_error_notice: V-groove thickness selection depends on groove geometry, root condition, backing, and process.",
  ],
  "wcbt-6e148eed-ae64-40f1-a514-463bfb57b82b": [
    "choice_issue_ambiguous_reverse-flow_sequence: immediate response and preventive actions are mixed without an unambiguous valve sequence.",
  ],
  "wcbt-70aee86e-0061-464c-ae45-3531caf57c40": [
    "choice_issue_missing_pressure_balance_and_tip_specification: oxygen pressure cannot be excluded as a reverse-flashback contributor in every setup.",
  ],
  "wcbt-7101c3dc-d865-4f47-b357-7c93684c24fa": [
    "choice_issue_probable_typo: 'ignition equipment for fire suppression' appears to be a source typo for fire-extinguishing equipment, changing the answer set.",
  ],
  "wcbt-74f42564-e007-4f81-949b-e9cf09db5cd6": [
    "choice_issue_answer_option_absent: welding current setting alone does not identify the greatest shock-risk condition.",
  ],
  "wcbt-75d4bef1-9728-4ca6-95c3-0a84cbf1e096": [
    "choice_issue_missing_arc_current: shade selection requires both process and current, so one range cannot answer every TIG/MIG/CO2 condition.",
  ],
};

function assessmentKindFor(result: GptResult) {
  return result.tests.some((test) => test.startsWith("formula="))
    ? "calculation" as const
    : "principle" as const;
}

// The projection retains some historical leaf IDs that are not in the
// publishable leaf-lesson library.  Keep the question's projected digest, but
// bind the approved answer review to the available teaching surface that
// covers the same assessment topic.
const PUBLISHED_LESSON_TARGETS: Readonly<Record<string, string>> = {
  "lesson-welding-process-smaw": "lesson-welding-foundation-power-heat",
  "lesson-welding-process-saw": "lesson-welding-special-processes",
  "lesson-welding-defect-crack": "lesson-welding-inspection-ndt",
  "lesson-welding-defect-undercut": "lesson-welding-special-processes",
};

function publishedLessonIdFor(projectedLessonId: string) {
  return PUBLISHED_LESSON_TARGETS[projectedLessonId] ?? projectedLessonId;
}

function answerExplanationFor(result: GptResult, source: (typeof rawWeldingCbtBank.records)[number]) {
  return "문제의 조건인 '" + source.stem + "'을 기준으로 판단하면, "
    + result.directSolution;
}

function keyRuleFor(
  result: GptResult,
  source: (typeof rawWeldingCbtBank.records)[number],
  correctChoice: string,
) {
  return "이 문항에서는 " + result.lessonSentence
    + " 따라서 정답 보기 " + (source.correctIndex + 1) + "의 '" + correctChoice
    + "'가 조건에 맞는다.";
}

function principleStepsFor(
  result: GptResult,
  source: (typeof rawWeldingCbtBank.records)[number],
  correctChoice: string,
) {
  const correctRationale = result.choiceRationales[source.correctIndex];
  if (!correctRationale) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_04_CORRECT_RATIONALE_MISSING:" + result.id);
  }

  return [
    "판단 대상: '" + source.stem + "'에서 묻는 조건과 분류를 먼저 확인한다.",
    "정답 보기 검토: " + (source.correctIndex + 1) + "번 '" + correctChoice
      + "'는 " + correctRationale,
    "적용 결론: " + result.lessonSentence,
  ];
}

function calculationStepsFor(result: GptResult, correctChoice: string) {
  const overrides: Record<string, readonly string[]> = {
    "wcbt-666809c5-1e60-4f90-af52-aaf84b843e31": [
      "계산식은 단상 입력의 피상전력 관계 I=S÷V입니다.",
      "값을 대입하면 I=40,000VA÷200V이며 몫은 200입니다.",
      "계산 결과는 200A이므로 정답은 200입니다.",
    ],
    "wcbt-6e1842ed-1b16-4aca-94f3-38222279db32": [
      "계산식은 용접기 1차 전류 I=S÷V입니다.",
      "값을 대입하면 I=27,000VA÷300V이며 몫은 90입니다.",
      "계산 결과는 90A이므로 정답은 90A 퓨즈입니다.",
    ],
  };
  const override = overrides[result.id];
  if (override) return override;

  const formula = result.tests.find((test) => test.startsWith("formula="));
  const substitution = result.tests.find((test) =>
    test.startsWith("substitution=")
  );
  const resultValue = result.tests.find((test) => test.startsWith("result="));

  if (!formula || !substitution || !resultValue) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_04_CALCULATION_DETAIL_MISSING:" + result.id);
  }

  return [
    "Formula: " + formula.slice("formula=".length),
    "Substitution with units: " + substitution.slice("substitution=".length),
    "Result: " + resultValue.slice("result=".length) + "; this matches the correct choice " + correctChoice + ".",
  ];
}

function publishCandidate(
  result: GptResult,
  projection: (typeof WELDING_CBT_LESSON_PROJECTION.entries)[number],
  source: (typeof rawWeldingCbtBank.records)[number],
) {
  const assessmentKind = assessmentKindFor(result);
  const correctChoice = source.choices[source.correctIndex];
  const lessonId = projection.primaryLeafLessonId;

  if (!lessonId) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_04_LESSON_MISSING:" + result.id);
  }

  return {
    canonicalId: result.id,
    contentDigest: projection.contentDigest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind,
    primaryLeafLessonId: publishedLessonIdFor(lessonId),
    conceptBinding: {
      lessonId: publishedLessonIdFor(lessonId),
      lessonBlockId: "principle",
      assertionText: "'" + source.stem + "'의 개념 판단은 " + result.lessonSentence,
      evidenceRefs: [
        {
          kind: "lesson_block" as const,
          ref: publishedLessonIdFor(lessonId) + "#principle",
        },
        { kind: "source_question" as const, ref: result.id },
        ...(assessmentKind === "calculation"
          ? [{
            kind: "calculation_derivation" as const,
            ref: result.tests.join("; "),
          }]
          : []),
      ],
    },
    answerExplanation: answerExplanationFor(result, source),
    solutionSteps: assessmentKind === "calculation"
      ? calculationStepsFor(result, correctChoice)
      : principleStepsFor(result, source, correctChoice),
    keyRule: keyRuleFor(result, source, correctChoice),
    choiceFeedback: result.choiceRationales.map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === source.correctIndex;
      const choice = source.choices[choiceIndex];
      if (!choice) {
        throw new Error("SUBJECT_2_GPT_HOLD_BATCH_04_CHOICE_MISSING:" + result.id);
      }
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale,
        plausibleReason: "보기 " + (choiceIndex + 1) + " '" + choice
          + "'를 검토한 근거: " + rationale,
        incorrectPoint: isCorrect
          ? null
          : "보기 " + (choiceIndex + 1) + "의 오답 지점은 '" + choice
            + "'가 문항 조건과 맞지 않는다는 데 있다. " + rationale,
        keyRule: "보기 " + (choiceIndex + 1) + " 판별 규칙: "
          + result.lessonSentence + " 이 규칙을 '" + choice + "'에 적용한다.",
        differenceFromCorrect: isCorrect
          ? null
          : "정답은 " + (source.correctIndex + 1) + "번 '" + correctChoice
            + "'이고, " + (choiceIndex + 1) + "번 '" + choice + "'는 " + rationale,
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
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_04_EXACT_SET_MISMATCH");
}

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_04 =
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
      throw new Error("SUBJECT_2_GPT_HOLD_BATCH_04_SOURCE_MISMATCH:" + result.id);
    }

    const holdReasons = blockedReasons[result.id];
    if ((!PUBLISHABLE_VERDICTS.has(result.verdict) && !PROMOTED_C_IDS.has(result.id)) || holdReasons) {
      if (!holdReasons) {
        throw new Error("SUBJECT_2_GPT_HOLD_BATCH_04_UNLEDGERED_HOLD:" + result.id);
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
