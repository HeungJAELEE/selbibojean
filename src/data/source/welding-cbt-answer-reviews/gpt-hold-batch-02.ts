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

const AUTHOR = "subject-2-gpt-hold-batch-02-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const EXPECTED_RESULT_COUNT = 50;
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);

/** Immutable response from the supplied JSONL review packet. */
const GPT_RESULTS = gunzipSync(
  Buffer.from("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", "base64"),
).toString("utf8").trim().split(/\r?\n/u).map((line) =>
  JSON.parse(line) as GptResult
);

const blockedReasons: Record<string, readonly string[]> = {
  "wcbt-425de48f-f4b5-4af4-b15a-b9c536583d6d": [
    "hold_source_pressure_unit_missing: the stem's pressure value lacks a unit, so the calculation cannot be dimensionally confirmed.",
  ],
  "wcbt-48a507ff-9d5b-4d18-af0d-cafee43ff243": [
    "hold_choice_issue_multiple_dangerous_options: both 8 vol% and 15 vol% CO₂ are dangerous, so the immutable source is not single-answer.",
  ],
};

const concreteChoiceRationaleOverrides: Record<string, readonly string[]> = {
  "wcbt-49a6b46a-d48e-4369-8005-26d7cd2dbc18": [
    "금지 표지는 행동을 제한하거나 중지시키는 뜻으로 빨간색을 쓰며, 파란색 지시와 구별된다.",
    "경고는 위험 가능성을 알리는 노란색이 기본이므로 특정 행동을 요구하는 파란색 지시가 아니다.",
    "녹색은 피난·구급 등 안전 안내를 뜻하므로 특정 행동을 명령하는 파란색 지시와 다르다.",
    "파란색 안전·보건표지는 보호구 착용처럼 특정 행동을 하도록 요구하는 지시 표지다.",
  ],
};

function choiceRationalesFor(result: GptResult) {
  return concreteChoiceRationaleOverrides[result.id] ?? result.choiceRationales;
}

function lessonIdFor(result: GptResult) {
  const text = `${result.directSolution} ${result.lessonSentence}`;
  if (/저항용접|점용접|심용접|프로젝션/u.test(text)) {
    return "lesson-welding-resistance";
  }
  if (/피복|용접봉|심선|페로망간|E43/u.test(text)) {
    return "lesson-welding-foundation-electrodes";
  }
  if (/전류|전압|아크|용접기|퓨즈/u.test(text)) {
    return "lesson-welding-foundation-power-heat";
  }
  if (/산소|아세틸렌|가스용기|토치|불꽃/u.test(text)) {
    return "lesson-welding-gas-equipment-flame";
  }
  if (/감전|안전모|보건표지|흄|보호구/u.test(text)) {
    return "lesson-welding-safety-management";
  }
  if (/납땜|브레이징|압접/u.test(text)) {
    return "lesson-welding-foundation-brazing-pressure";
  }
  return "lesson-welding-foundation-basics";
}

function assessmentKindFor(result: GptResult) {
  return result.tests.some((test) => test.startsWith("substitution:"))
    ? "calculation" as const
    : "principle" as const;
}

const CALCULATION_STEP_OVERRIDES: Record<string, readonly string[]> = {
  "wcbt-35b1b5d8-8d7b-4758-a45e-80a1b8419344": [
    "계산식은 단상 1차 입력의 피상전력 관계 I=S÷V입니다.",
    "값을 대입하면 I=25,000VA÷200V이며 몫은 125입니다.",
    "계산 결과는 125A이므로 정답은 125A 퓨즈입니다.",
  ],
};

function solutionStepsFor(result: GptResult, assessmentKind: ReturnType<typeof assessmentKindFor>) {
  if (assessmentKind !== "calculation") {
    return [
      `근거: ${result.directSolution}`,
      `판단 기준: ${result.lessonSentence}`,
    ];
  }
  const override = CALCULATION_STEP_OVERRIDES[result.id];
  if (override) return override;
  const formula = result.tests.find((test) => test.startsWith("formula:"));
  const substitution = result.tests.find((test) => test.startsWith("substitution:"));
  return [
    `공식: ${formula?.slice("formula:".length) ?? result.directSolution}`,
    `대입: ${substitution?.slice("substitution:".length) ?? result.directSolution}`,
    `단위·결과: ${result.directSolution}`,
  ];
}

function publishCandidate(
  result: GptResult,
  digest: string,
  source: (typeof rawWeldingCbtBank.records)[number],
) {
  const lessonId = lessonIdFor(result);
  const assessmentKind = assessmentKindFor(result);
  return {
    canonicalId: result.id,
    contentDigest: digest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind,
    primaryLeafLessonId: lessonId,
    conceptBinding: {
      lessonId,
      lessonBlockId: "principle",
      assertionText: result.lessonSentence,
      evidenceRefs: [
        { kind: "lesson_block" as const, ref: `${lessonId}#principle` },
        { kind: "source_question" as const, ref: result.id },
        ...(assessmentKind === "calculation"
          ? [{ kind: "calculation_derivation" as const, ref: result.directSolution }]
          : []),
      ],
    },
    answerExplanation: result.directSolution,
    solutionSteps: solutionStepsFor(result, assessmentKind),
    keyRule: result.lessonSentence,
    choiceFeedback: choiceRationalesFor(result).map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === source.correctIndex;
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale,
        plausibleReason: `보기 ${choiceIndex + 1}의 판단 근거: ${rationale}`,
        incorrectPoint: isCorrect ? null : `오답 근거: ${rationale}`,
        keyRule: isCorrect
          ? `선택 근거: ${result.lessonSentence}`
          : `반증 기준(보기 ${choiceIndex + 1}): ${result.directSolution}`,
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
  GPT_RESULTS.length !== EXPECTED_RESULT_COUNT
  || new Set(GPT_RESULTS.map((result) => result.id)).size !== EXPECTED_RESULT_COUNT
) {
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_02_EXACT_SET_MISMATCH");
}

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_02 =
  GPT_RESULTS.map((result) => {
    const projection = projectionById.get(result.id);
    const source = sourceById.get(result.id);
    if (
      !projection
      || !source
      || source.correctIndex !== result.correctChoiceId
      || source.choices.length !== 4
      || choiceRationalesFor(result).length !== 4
    ) {
      throw new Error(
        "SUBJECT_2_GPT_HOLD_BATCH_02_SOURCE_MISMATCH:" + result.id,
      );
    }

    const reasons = blockedReasons[result.id];
    if (!PUBLISHABLE_VERDICTS.has(result.verdict) || reasons) {
      if (!reasons) {
        throw new Error(
          "SUBJECT_2_GPT_HOLD_BATCH_02_UNLEDGERED_HOLD:" + result.id,
        );
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
        holdReasons: reasons,
        author: AUTHOR,
        authoredAt: REVIEWED_AT,
        reviewer: AUTHOR,
        reviewedAt: REVIEWED_AT,
      };
    }
    return publishCandidate(result, projection.contentDigest, source);
  });
