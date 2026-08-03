import type { PublicQuestion } from "@/lib/domain/types";
import {
  createWrittenSubjectFactCbtRegistry,
  getReviewedWrittenSubjectBundleCbtSelection,
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE,
  type WrittenSubjectFactCbtBinding,
} from "@/data/source/written-subject-cbt-selection";
import {
  WRITTEN_SUBJECT_TWO_MEMORY_GUIDE,
  type SubjectTwoMemoryBundle,
} from "@/data/source/written-subject-two-memory-guide";
import { getSubjectTwoBundleProjectedLessonIds } from "@/data/source/written-subject-two-lesson-projection";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";

export type SubjectTwoFactCbtBinding = WrittenSubjectFactCbtBinding;

export const SUBJECT_TWO_NO_DIRECT_CBT_NOTE =
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE;

const DIRECT_ORIGINAL_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:2:classification-joints:융접": [
    "U-081",
    "wcbt-54b1baf9-7574-493b-b616-6caa2db72509",
  ],
  "legacy:2:classification-joints:압접": [
    "U-081",
    "U-520",
    "wcbt-353e2c66-db3e-41e5-935b-8dd443ef736a",
  ],
  "legacy:2:classification-joints:용접 이음": ["U-364"],
  "legacy:2:classification-joints:용접 자세": [
    "wcbt-e3dcf843-d5b6-404d-a09a-ac7c419e0e26",
  ],
  "legacy:2:arc-foundation-polarity:아크 용접": ["U-884"],
  "legacy:2:arc-foundation-polarity:교류 용접기": ["U-779", "U-1114"],
  "legacy:2:arc-foundation-polarity:직류 정극성": [
    "U-1259",
    "wcbt-f188c6bb-300c-4827-9efd-3cfc26ffbd15",
  ],
  "legacy:2:arc-foundation-polarity:전원 선정": ["U-779"],
  "legacy:2:electrodes-arc-blow:저수소계": [
    "WELD-ACTUAL-2009-Q51",
    "wcbt-5fd128d0-334f-4f07-96a3-1a17fcb8d2f0",
  ],
  "legacy:2:electrodes-arc-blow:아크 쏠림": ["U-977"],
  "legacy:2:electrodes-arc-blow:쏠림 대책": ["U-977"],
  "legacy:2:shielded-high-efficiency:CO₂ 용접": ["U-453"],
  "legacy:2:shielded-high-efficiency:차폐 조건": ["U-453"],
  "legacy:2:shielded-high-efficiency:TIG": [
    "wcbt-c3b3f647-5df3-417e-90f8-e58b0ec8aa66",
  ],
  "legacy:2:shielded-high-efficiency:서브머지드": [
    "wcbt-1c007e72-16d0-4990-bda0-8de1ffa49614",
  ],
  "legacy:2:pressure-gas-special:저항용접 3요소": ["U-520"],
  "legacy:2:pressure-gas-special:플라즈마 아크": ["U-835"],
  "legacy:2:pressure-gas-special:테르밋 용접": [
    "U-235",
    "U-1163",
  ],
  "legacy:2:pressure-gas-special:기타 특수용접": [
    "U-884",
    "wcbt-eed26a0a-e7e0-40b4-92ad-768820b0448c",
  ],
  "legacy:2:weld-defects:언더컷": ["U-931"],
  "legacy:2:weld-defects:오버랩": ["U-931"],
  "legacy:2:weld-defects:용입 불량": ["U-931"],
  "legacy:2:weld-defects:스패터": [
    "U-931",
    "wcbt-b21592e6-d7fb-4390-85f3-6ff9855b9209",
  ],
  "legacy:2:weld-defects:기공": [
    "wcbt-c4744e84-4f79-496f-ab6f-0d8eac062463",
  ],
  "legacy:2:weld-defects:은점·균열": [
    "WELD-ACTUAL-2009-Q51",
    "WELD-ACTUAL-2009-Q54",
  ],
  "legacy:2:deformation-stress:용접 후 완화": ["U-1022"],
  "legacy:2:inspection:PT": ["U-223"],
  "legacy:2:inspection:ET": ["U-224"],
  "legacy:2:inspection:RT": [
    "wcbt-5e808e7a-4a33-4f64-a868-65f133a9916a",
  ],
  "legacy:2:ppe-signs-fire:보호구 원칙": [
    "wcbt-0211af37-8db1-464d-8dcf-eb1b4bf39e78",
  ],
  "legacy:2:ppe-signs-fire:용접 보호구": [
    "wcbt-0211af37-8db1-464d-8dcf-eb1b4bf39e78",
    "wcbt-6d0b74e0-f84d-433a-be85-73af29610321",
  ],
  "legacy:2:ppe-signs-fire:안전표지 색": [
    "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128",
  ],
  "legacy:2:ppe-signs-fire:화재 등급": [
    "wcbt-3cdeac36-72b5-4967-9ed9-8cc0756c94ae",
  ],
  "legacy:2:ppe-signs-fire:소화기 선정": [
    "wcbt-555a0255-d277-49d8-a6ca-f256252958be",
  ],
  "legacy:2:gas-electrical-machine-safety:산소": [
    "wcbt-415b45d0-c3d0-43b3-8f8f-0eec7b46bdfb",
  ],
  "legacy:2:gas-electrical-machine-safety:아세틸렌": [
    "wcbt-415b45d0-c3d0-43b3-8f8f-0eec7b46bdfb",
  ],
  "legacy:2:gas-electrical-machine-safety:역류·역화·인화": [
    "wcbt-65aa007e-6c83-4457-87da-227cc2814570",
    "wcbt-6d3bb63d-6bfd-4bb8-bb8f-9225487e769d",
  ],
  "legacy:2:gas-electrical-machine-safety:감전 방지": [
    "wcbt-79f3f7f3-4827-4d41-bd5f-c7cdfc2eb35b",
  ],
  "legacy:2:gas-electrical-machine-safety:원형톱 방호": ["U-200"],
  "legacy:2:gas-electrical-machine-safety:압력설비": ["U-244"],

  "s2-pressure-welding-process-details-three-elements": ["U-520"],
  "s2-pressure-welding-process-details-spot-seam": ["U-520"],
  "s2-electrode-flame-heat-input-details-low-hydrogen": [
    "WELD-ACTUAL-2009-Q51",
  ],
  "s2-electrode-flame-heat-input-details-polarity": ["U-1259"],
  "s2-advanced-arc-process-controls-co2": ["U-453"],
  "s2-advanced-arc-process-controls-special": ["U-835", "U-884"],
  "s2-ppe-classification-details-eye-face": [
    "wcbt-6d0b74e0-f84d-433a-be85-73af29610321",
    "wcbt-930074db-4314-4849-a66c-de84fb9d5312",
  ],
  "s2-safety-sign-fire-details-blue-green": [
    "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128",
  ],
  "s2-safety-sign-fire-details-four-categories": [
    "wcbt-8b3cecc3-52b9-405f-ba61-0c30a2c9d128",
  ],
  "s2-safety-sign-fire-details-combustion": [
    "wcbt-32fa0fc6-1a9f-471c-b844-71262d223288",
  ],
  "s2-safety-sign-fire-details-classes": [
    "wcbt-3cdeac36-72b5-4967-9ed9-8cc0756c94ae",
  ],
  "s2-safety-sign-fire-details-extinguisher": [
    "wcbt-555a0255-d277-49d8-a6ca-f256252958be",
  ],
  "s2-gas-cylinder-flashback-details-oxygen": [
    "wcbt-415b45d0-c3d0-43b3-8f8f-0eec7b46bdfb",
  ],
  "s2-gas-cylinder-flashback-details-acetylene": [
    "wcbt-415b45d0-c3d0-43b3-8f8f-0eec7b46bdfb",
  ],
  "s2-gas-cylinder-flashback-details-identification": [
    "wcbt-e7d0a421-44c3-4f07-b260-94b85969805b",
  ],
  "s2-gas-cylinder-flashback-details-stages": [
    "wcbt-65aa007e-6c83-4457-87da-227cc2814570",
    "wcbt-6d3bb63d-6bfd-4bb8-bb8f-9225487e769d",
  ],
  "s2-machine-workplace-safety-details-pressure": ["U-244"],
};

const PARTIAL_CONTEXT_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:2:shielded-high-efficiency:TIG": ["U-081"],
  "legacy:2:shielded-high-efficiency:서브머지드": ["U-081"],
  "legacy:2:pressure-gas-special:점·심 용접": ["U-520"],
  "legacy:2:deformation-stress:변형 원인": ["U-364"],
  "s2-pressure-welding-process-details-projection": ["U-520"],
  "s2-pressure-welding-process-details-solid-state": [
    "wcbt-fb87cad6-15a6-486f-8a1d-2cd427ee0e66",
  ],
  "s2-electrode-flame-heat-input-details-code": [
    "WELD-ACTUAL-2009-Q51",
  ],
  "s2-advanced-arc-process-controls-tig": ["U-081"],
};

const allFactIds = WRITTEN_SUBJECT_TWO_MEMORY_GUIDE.flatMap((bundle) =>
  bundle.facts.map((fact) => getWrittenSubjectFactId(2, bundle, fact)),
);

const bindings = allFactIds.map((factId): SubjectTwoFactCbtBinding => {
  const directQuestionIds = DIRECT_ORIGINAL_QUESTION_IDS[factId];
  if (directQuestionIds) {
    return {
      factId,
      status: "direct_original",
      questionIds: directQuestionIds,
    };
  }

  const partialQuestionIds = PARTIAL_CONTEXT_QUESTION_IDS[factId];
  if (partialQuestionIds?.length) {
    return {
      factId,
      status: "partial_context",
      questionIds: partialQuestionIds,
    };
  }

  return {
    factId,
    status: "no_direct_original",
    questionIds: [],
  };
});

const bindingsByFactId = createWrittenSubjectFactCbtRegistry(bindings);

export function getSubjectTwoFactCbtBinding(factId: string) {
  return bindingsByFactId.get(factId);
}

export function getSubjectTwoFactCbtBindings() {
  return [...bindings];
}

export function getSubjectTwoBundleCbtSelection(
  bundle: SubjectTwoMemoryBundle,
  questions: readonly PublicQuestion[],
) {
  const normalizedBundle = {
    facts: bundle.facts.map((fact) => ({
      ...fact,
      id: getWrittenSubjectFactId(2, bundle, fact),
    })),
  };

  const reviewedSelection = getReviewedWrittenSubjectBundleCbtSelection(
    normalizedBundle,
    questions,
    bindingsByFactId,
    bundle.cbtStatusNote ?? SUBJECT_TWO_NO_DIRECT_CBT_NOTE,
  );
  if (reviewedSelection.questions.length >= 5) return reviewedSelection;

  const projectedLessonIds = new Set(
    getSubjectTwoBundleProjectedLessonIds(bundle.id),
  );
  const selectedIds = new Set(
    reviewedSelection.questions.map((question) => question.id),
  );
  const projectedOriginals = questions
    .filter(
      (question) =>
        question.provenance.original &&
        projectedLessonIds.has(question.lessonId) &&
        !selectedIds.has(question.id),
    )
    .sort(compareProjectedOriginalQuestions);
  const questionsWithProjectedOriginals = [
    ...reviewedSelection.questions,
    ...projectedOriginals,
  ].slice(0, 5);

  return {
    questions: questionsWithProjectedOriginals,
    statusNote:
      questionsWithProjectedOriginals.length === 0
        ? reviewedSelection.statusNote
        : undefined,
  };
}

function compareProjectedOriginalQuestions(
  left: PublicQuestion,
  right: PublicQuestion,
) {
  const leftExam = left.provenance.exam;
  const rightExam = right.provenance.exam;
  const yearDifference = (rightExam?.year ?? 0) - (leftExam?.year ?? 0);
  if (yearDifference !== 0) return yearDifference;

  const sessionDifference = (rightExam?.sessionLabel ?? "").localeCompare(
    leftExam?.sessionLabel ?? "",
    "ko",
    { numeric: true },
  );
  if (sessionDifference !== 0) return sessionDifference;

  const numberDifference =
    (leftExam?.questionNumber ?? Number.MAX_SAFE_INTEGER) -
    (rightExam?.questionNumber ?? Number.MAX_SAFE_INTEGER);
  if (numberDifference !== 0) return numberDifference;
  return left.id.localeCompare(right.id);
}
