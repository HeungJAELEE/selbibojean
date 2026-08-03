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
};

const AUTHOR = "subject-2-gpt-hold-batch-09-author";
const REVIEWED_AT = "2026-08-03T00:00:00.000Z";
const PUBLISHABLE_VERDICTS = new Set<GptVerdict>(["ACCEPT", "REVISE"]);
const PROMOTED_C_IDS = new Set([
  "wcbt-f2780053-6468-4757-b3d9-1688a5f19728",
  "wcbt-f7042fb6-cd59-4f0d-8d7f-a79c6ee076be",
]);

const EXPECTED_IDS = [
  "wcbt-ea9d7b6f-0e26-42e7-bec6-4a1af51504ce",
  "wcbt-eae3f4e9-688f-43f2-b3e8-bf68969e4331",
  "wcbt-ebf2676a-c3bf-4638-aab9-cccf1a5e9b9e",
  "wcbt-edacdead-4c69-4bdf-a2bb-0712e26e48c2",
  "wcbt-eed26a0a-e7e0-40b4-92ad-768820b0448c",
  "wcbt-efa35849-446d-46ff-bbfb-67a9c20befd4",
  "wcbt-f035c47d-d873-4913-9ab5-c59531e934e8",
  "wcbt-f06c129c-e5ec-4723-9b0d-75464898dafb",
  "wcbt-f11e5087-d570-483e-8bdf-dafcfee28744",
  "wcbt-f129cd98-0a8c-4d40-9d9a-8c2db7129cde",
  "wcbt-f188c6bb-300c-4827-9efd-3cfc26ffbd15",
  "wcbt-f1a7d802-f94c-4458-9865-3e6360962150",
  "wcbt-f1fe152b-068c-4593-80f6-e450c4da1a55",
  "wcbt-f25dcfe3-5f09-41ec-bb2c-3928bfebde9d",
  "wcbt-f2780053-6468-4757-b3d9-1688a5f19728",
  "wcbt-f2a3cc9c-18e0-4356-bc1c-1ba865e29259",
  "wcbt-f2c2332a-e350-4cf6-86ba-d156a035bc93",
  "wcbt-f3483828-12c5-4cc8-8f64-15bbbd64dbdd",
  "wcbt-f3ea6923-ff9f-4e21-b0ce-309dc296f93b",
  "wcbt-f40755ed-7d3f-4569-94c7-08971e2076fc",
  "wcbt-f411d3f8-5a61-4360-b948-b5a5d1c7e1c9",
  "wcbt-f4c7f1aa-e109-48a9-b254-57a6c2822297",
  "wcbt-f57d62cb-bb21-48ed-84d7-48921ddfe072",
  "wcbt-f5e6ee10-2de5-479a-80b0-a1a8e9f51541",
  "wcbt-f6a20fe8-0880-4e2a-9878-0207e051da08",
  "wcbt-f6e2d9cc-1c74-451a-a94b-7dd84ea556c7",
  "wcbt-f7042fb6-cd59-4f0d-8d7f-a79c6ee076be",
  "wcbt-f77b67db-0542-40fa-ab23-440aecb7bfd8",
  "wcbt-f79ddd21-a686-4eb6-9aeb-63a132c59e6a",
  "wcbt-f7d0db74-b25d-49e0-892f-061828641c40",
  "wcbt-f89970bc-935a-4b92-986a-1cf9a8a85e4a",
  "wcbt-f930d348-8d63-427e-9737-51fcf85526e8",
  "wcbt-fb87cad6-15a6-486f-8a1d-2cd427ee0e66",
  "wcbt-fcc15073-28c6-48bb-b735-8ee30957ed8b",
  "wcbt-fd41f16c-fb1e-4943-b917-a0ab7f2c8707",
] as const;

/** Immutable result rows from the supplied GPT Pro review JSONL. */
const GPT_RESULTS = gunzipSync(
  Buffer.from(
    [
  "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",
    ].join(""),
    "base64",
  ),
).toString("utf8") as string;
const parsedResults = JSON.parse(GPT_RESULTS) as GptResult[];

const blockedReasons: Record<string, readonly string[]> = {
  "wcbt-edacdead-4c69-4bdf-a2bb-0712e26e48c2": [
    "choice_issue_brazing_temperature_conditions_missing: the immutable stem omits filler metal, flux, atmosphere, and process, so 500-700 C and higher-temperature brazing ranges cannot be reduced to one unique answer.",
  ],
  "wcbt-fd41f16c-fb1e-4943-b917-a0ab7f2c8707": [
    "choice_issue_resistance_welding_classification_ambiguous: percussion welding and atomic-hydrogen welding are both outside a strict resistance-welding classification, so the immutable choices have multiple answers.",
  ],
};

const lessonIdOverrides: Record<string, string> = {
  "wcbt-f188c6bb-300c-4827-9efd-3cfc26ffbd15": "lesson-welding-foundation-power-heat",
  "wcbt-f411d3f8-5a61-4360-b948-b5a5d1c7e1c9": "lesson-welding-special-processes",
  "wcbt-f77b67db-0542-40fa-ab23-440aecb7bfd8": "lesson-welding-foundation-electrodes",
  "wcbt-f930d348-8d63-427e-9737-51fcf85526e8": "lesson-welding-foundation-electrodes",
  "wcbt-f2780053-6468-4757-b3d9-1688a5f19728": "lesson-welding-inspection-ndt",
  "wcbt-f7042fb6-cd59-4f0d-8d7f-a79c6ee076be": "lesson-welding-safety-management",
};

const projectionById = new Map(
  WELDING_CBT_LESSON_PROJECTION.entries.map((entry) => [entry.canonicalId, entry]),
);
const sourceById = new Map(
  rawWeldingCbtBank.records
    .filter((record) => record.correctIndex !== null)
    .map((record) => [record.canonicalId, record]),
);

if (
  parsedResults.length !== EXPECTED_IDS.length
  || new Set(parsedResults.map((result) => result.id)).size !== EXPECTED_IDS.length
  || parsedResults.some((result, index) => result.id !== EXPECTED_IDS[index])
) {
  throw new Error("SUBJECT_2_GPT_HOLD_BATCH_09_EXACT_SET_MISMATCH");
}

function holdEntry(
  result: GptResult,
  contentDigest: string,
  holdReasons: readonly string[],
) {
  return {
    canonicalId: result.id,
    contentDigest,
    authoringDisposition: "hold_candidate" as const,
    reviewStatus: "hold" as const,
    assessmentKind: "principle" as const,
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

function publishCandidate(
  result: GptResult,
  source: (typeof rawWeldingCbtBank.records)[number],
  contentDigest: string,
  lessonId: string,
) {
  const correctChoice = source.choices[source.correctIndex];
  if (!correctChoice) {
    throw new Error("SUBJECT_2_GPT_HOLD_BATCH_09_CORRECT_CHOICE_MISSING:" + result.id);
  }

  return {
    canonicalId: result.id,
    contentDigest,
    authoringDisposition: "publish_candidate" as const,
    reviewStatus: "approved" as const,
    assessmentKind: "principle" as const,
    primaryLeafLessonId: lessonId,
    conceptBinding: {
      lessonId,
      lessonBlockId: "principle",
      assertionText: result.lessonSentence,
      evidenceRefs: [
        { kind: "lesson_block" as const, ref: lessonId + "#principle" },
        { kind: "source_question" as const, ref: result.id },
      ],
    },
    answerExplanation: result.directSolution,
    solutionSteps: [
      "Direct solution: " + result.directSolution,
      "Lesson criterion: " + result.lessonSentence,
    ],
    keyRule: result.lessonSentence,
    choiceFeedback: result.choiceRationales.map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === source.correctIndex;
      const choiceNumber = choiceIndex + 1;
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale,
        plausibleReason: "Choice-specific reasoning: " + rationale,
        incorrectPoint: isCorrect
          ? null
          : "Choice " + choiceNumber + " differs from correct choice "
            + (source.correctIndex + 1) + ": " + rationale,
        keyRule: "Rule applied to choice " + choiceNumber + ": " + result.lessonSentence,
        differenceFromCorrect: isCorrect
          ? null
          : "Unlike correct choice " + (source.correctIndex + 1) + " (" + correctChoice
            + "), choice " + choiceNumber + " is rejected because " + rationale,
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

export const WELDING_CBT_ANSWER_REVIEWS_SUBJECT_2_GPT_HOLD_BATCH_09 =
  parsedResults.map((result) => {
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
      throw new Error("SUBJECT_2_GPT_HOLD_BATCH_09_SOURCE_MISMATCH:" + result.id);
    }

    const lessonId = lessonIdOverrides[result.id] ?? projection.primaryLeafLessonId;
    const holdReasons = blockedReasons[result.id];
    if ((!PUBLISHABLE_VERDICTS.has(result.verdict) && !PROMOTED_C_IDS.has(result.id)) || holdReasons) {
      if (!holdReasons) {
        throw new Error("SUBJECT_2_GPT_HOLD_BATCH_09_UNLEDGERED_HOLD:" + result.id);
      }
      return holdEntry(result, projection.contentDigest, holdReasons);
    }

    if (!lessonId) {
      throw new Error("SUBJECT_2_GPT_HOLD_BATCH_09_UNRESOLVED_LESSON:" + result.id);
    }

    return publishCandidate(result, source, projection.contentDigest, lessonId);
  });
