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
    calculation?: string;
    gate: "accept" | "revise" | "choice_issue" | "hold";
  };
};

const AUTHOR = "subject-2-gpt-hold-batch-03-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const EXPECTED_RESULT_COUNT = 50;
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);
const PROMOTED_C_IDS = new Set([
  "wcbt-54512c61-a0a5-4069-8454-408808fb6884",
  "wcbt-58dc1504-10b8-4b86-888c-f8b6f89665cc",
  "wcbt-5f1c3bdf-7069-46e7-a669-a5f30ebe7e2a",
]);
const lessonIdOverrides: Readonly<Record<string, string>> = {
  "wcbt-54512c61-a0a5-4069-8454-408808fb6884": "lesson-welding-safety-ppe",
  "wcbt-58dc1504-10b8-4b86-888c-f8b6f89665cc": "lesson-welding-safety-ppe",
  "wcbt-5f1c3bdf-7069-46e7-a669-a5f30ebe7e2a": "lesson-welding-safety-ppe",
};
// Reused from the verified KOSHA welding-safety evidence already present in
// this source directory; no external source is inferred or synthesized here.
const KOSHA_WELDING_SAFETY_SOURCE =
  "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s";

/**
 * Immutable, line-for-line response from the supplied review packet. This
 * artifact deliberately remains local until a separate integration decision.
 */
const GPT_RESULTS = JSON.parse(
  gunzipSync(
    Buffer.from("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", "base64"),
  ).toString("utf8"),
) as GptResult[];

const blockedReasons: Record<string, readonly string[]> = {
  "wcbt-4d23cb4d-867e-44fa-9848-b127a9b6d5f1": [
    "choice_issue_multiple_incorrect_choices: index 2 and index 3 are both incorrect under the supplied staircase criteria, so the immutable source cannot be scored as a single-answer question.",
  ],
  "wcbt-50c18982-fab2-44eb-9f47-8f8c9ea42367": [
    "hold_unparseable_choice_text: index 1 says that alternating current is worn more often than direct current; its subject and verb do not form a technically evaluable choice.",
  ],
};

function lessonIdFor(result: GptResult) {
  const override = lessonIdOverrides[result.id];
  if (override) return override;
  const text = result.directSolution + " " + result.lessonSentence;
  if (/점용접|프로젝션|저항용접|전극팁/u.test(text)) {
    return "lesson-welding-resistance";
  }
  if (/용접봉|피복|플럭스|슬래그|E5326|저수소/u.test(text)) {
    return "lesson-welding-foundation-electrodes";
  }
  if (/전압|전류|정류기|교류|직류|전격방지/u.test(text)) {
    return "lesson-welding-foundation-power-heat";
  }
  if (/가스|아세틸렌|산소|불꽃|토치|팁|용기|연납땜/u.test(text)) {
    return "lesson-welding-gas-equipment-flame";
  }
  if (/안전|차광|환기|CO₂|보건|표지|감전|보호구|소화기/u.test(text)) {
    return "lesson-welding-safety-management";
  }
  if (/마찰|압접|납땜/u.test(text)) {
    return "lesson-welding-foundation-brazing-pressure";
  }
  return "lesson-welding-foundation-basics";
}

function assessmentKindFor(result: GptResult) {
  if (result.tests.calculation) return "calculation" as const;
  if (/안전|감전|차광|환기|보호구|소화|표지|고압가스/u.test(
    result.directSolution + " " + result.lessonSentence,
  )) {
    return "safety" as const;
  }
  return "principle" as const;
}

function solutionStepsFor(
  result: GptResult,
  correctChoice: string,
  assessmentKind: ReturnType<typeof assessmentKindFor>,
) {
  if (assessmentKind !== "calculation") {
    return [
      "지문 조건 확인: " + result.lessonSentence,
      "정답 보기 대조 (" + correctChoice + "): " + result.directSolution,
    ];
  }
  return [
    "계산식: " + result.tests.calculation,
    "대입·단위: " + result.directSolution,
    "결과: " + correctChoice + "가 계산 결과와 일치한다.",
  ];
}

function publishCandidate(
  result: GptResult,
  digest: string,
  source: (typeof rawWeldingCbtBank.records)[number],
) {
  const lessonId = lessonIdFor(result);
  const assessmentKind = assessmentKindFor(result);
  const correctChoice = source.choices[source.correctIndex];
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
        { kind: "lesson_block" as const, ref: lessonId + "#principle" },
        { kind: "source_question" as const, ref: result.id },
        ...(assessmentKind === "safety"
          ? [{
            kind: "official_source" as const,
            ref: KOSHA_WELDING_SAFETY_SOURCE,
          }]
          : []),
        ...(assessmentKind === "calculation"
          ? [{
            kind: "calculation_derivation" as const,
            ref: result.tests.calculation ?? result.directSolution,
          }]
          : []),
      ],
    },
    answerExplanation: result.directSolution,
    solutionSteps: solutionStepsFor(result, correctChoice, assessmentKind),
    keyRule: result.lessonSentence,
    choiceFeedback: result.choiceRationales.map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === source.correctIndex;
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale,
        plausibleReason: "선택지 판별: " + rationale,
        incorrectPoint: isCorrect ? null : "오답 판정 근거: " + rationale,
        keyRule: isCorrect
          ? result.lessonSentence
          : result.lessonSentence + " 선택지 판별 근거: " + rationale,
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
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_03_EXACT_SET_MISMATCH");
}

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_03 =
  GPT_RESULTS.map((result) => {
    const projection = projectionById.get(result.id);
    const source = sourceById.get(result.id);
    if (
      !projection
      || !source
      || source.correctIndex !== result.correctChoiceId
      || source.choices.length !== 4
      || result.choiceRationales.length !== 4
    ) {
      throw new Error(
        "SUBJECT_2_GPT_HOLD_BATCH_03_SOURCE_MISMATCH:" + result.id,
      );
    }

    const reasons = blockedReasons[result.id];
    const isPublishable = PUBLISHABLE_VERDICTS.has(result.verdict)
      || PROMOTED_C_IDS.has(result.id);
    if (!isPublishable || reasons) {
      if (!reasons) {
        throw new Error(
          "SUBJECT_2_GPT_HOLD_BATCH_03_UNLEDGERED_HOLD:" + result.id,
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
