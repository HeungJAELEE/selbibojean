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
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";

export type SubjectTwoFactCbtBinding = WrittenSubjectFactCbtBinding;

export const SUBJECT_TWO_NO_DIRECT_CBT_NOTE =
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE;

const DIRECT_ORIGINAL_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:2:classification-joints:융접": ["U-081"],
  "legacy:2:classification-joints:압접": ["U-081", "U-520"],
  "legacy:2:classification-joints:용접 이음": ["U-364"],
  "legacy:2:arc-foundation-polarity:아크 용접": ["U-884"],
  "legacy:2:arc-foundation-polarity:교류 용접기": ["U-779", "U-1114"],
  "legacy:2:arc-foundation-polarity:직류 정극성": ["U-1259"],
  "legacy:2:arc-foundation-polarity:전원 선정": ["U-779"],
  "legacy:2:electrodes-arc-blow:저수소계": [
    "WELD-ACTUAL-2009-Q51",
  ],
  "legacy:2:electrodes-arc-blow:아크 쏠림": ["U-977"],
  "legacy:2:electrodes-arc-blow:쏠림 대책": ["U-977"],
  "legacy:2:shielded-high-efficiency:CO₂ 용접": ["U-453"],
  "legacy:2:shielded-high-efficiency:차폐 조건": ["U-453"],
  "legacy:2:pressure-gas-special:저항용접 3요소": ["U-520"],
  "legacy:2:pressure-gas-special:플라즈마 아크": ["U-835"],
  "legacy:2:pressure-gas-special:테르밋 용접": [
    "U-235",
    "U-1163",
  ],
  "legacy:2:pressure-gas-special:기타 특수용접": ["U-884"],
  "legacy:2:weld-defects:언더컷": ["U-931"],
  "legacy:2:weld-defects:오버랩": ["U-931"],
  "legacy:2:weld-defects:용입 불량": ["U-931"],
  "legacy:2:weld-defects:스패터": ["U-931"],
  "legacy:2:weld-defects:은점·균열": [
    "WELD-ACTUAL-2009-Q51",
    "WELD-ACTUAL-2009-Q54",
  ],
  "legacy:2:deformation-stress:용접 후 완화": ["U-1022"],
  "legacy:2:inspection:PT": ["U-223"],
  "legacy:2:inspection:ET": ["U-224"],
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
  "s2-machine-workplace-safety-details-pressure": ["U-244"],
};

const PARTIAL_CONTEXT_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:2:shielded-high-efficiency:TIG": ["U-081"],
  "legacy:2:shielded-high-efficiency:서브머지드": ["U-081"],
  "legacy:2:pressure-gas-special:점·심 용접": ["U-520"],
  "legacy:2:deformation-stress:변형 원인": ["U-364"],
  "s2-pressure-welding-process-details-projection": ["U-520"],
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

  return getReviewedWrittenSubjectBundleCbtSelection(
    normalizedBundle,
    questions,
    bindingsByFactId,
    bundle.cbtStatusNote ?? SUBJECT_TWO_NO_DIRECT_CBT_NOTE,
  );
}
