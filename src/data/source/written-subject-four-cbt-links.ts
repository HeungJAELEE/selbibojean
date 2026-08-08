import type { PublicQuestion } from "@/lib/domain/types";
import {
  createWrittenSubjectFactCbtRegistry,
  getReviewedWrittenSubjectBundleCbtSelection,
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE,
  type WrittenSubjectFactCbtBinding,
} from "@/data/source/written-subject-cbt-selection";
import {
  WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE,
  type SubjectFourMemoryBundle,
} from "@/data/source/written-subject-four-memory-guide";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";

export type SubjectFourFactCbtBinding = WrittenSubjectFactCbtBinding;

export const SUBJECT_FOUR_NO_DIRECT_CBT_NOTE =
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE;

const DIRECT_ORIGINAL_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:4:signal-measurement:정특성·동특성": ["U-051"],
  "legacy:4:signal-measurement:FFT": ["U-037"],
  "legacy:4:signal-measurement:윈도우 함수": ["U-1189"],
  "legacy:4:signal-measurement:표본화": ["U-865"],
  "legacy:4:signal-measurement:RMS": ["U-566", "U-812"],
  "legacy:4:process-measurement:열전대": ["U-017", "U-032"],
  "legacy:4:process-measurement:측온저항체": ["U-811"],
  "legacy:4:process-measurement:차압식 유량계": ["U-997"],
  "legacy:4:process-measurement:전자유량계": ["U-815"],
  "legacy:4:process-measurement:비접촉 레벨": ["U-496"],
  "legacy:4:vibration-foundation:진동 3요소": ["U-005"],
  "legacy:4:vibration-foundation:진폭 표현": [
    "U-RMS-001",
    "U-022",
    "U-043",
    "U-1191",
  ],
  "legacy:4:vibration-foundation:변위·속도·가속도": ["U-021"],
  "legacy:4:vibration-foundation:공진·위험속도": ["U-1000"],
  "legacy:4:vibration-foundation:진동 절연": ["U-049"],
  "legacy:4:rotating-diagnosis:언밸런스": ["U-508"],
  "legacy:4:rotating-diagnosis:축정렬 불량": ["U-761", "U-913"],
  "legacy:4:rotating-diagnosis:기어 결함": ["U-141"],
  "legacy:4:rotating-diagnosis:베어링 결함": ["U-958"],
  "legacy:4:rotating-diagnosis:유막 불안정": ["U-1350"],
  "legacy:4:noise-acoustics:회절·굴절": ["U-012"],
  "legacy:4:noise-acoustics:마스킹": ["U-019"],
  "legacy:4:noise-acoustics:흡음·차음": ["U-762"],
  "legacy:4:noise-acoustics:청감보정": ["U-1243"],
  "legacy:4:noise-acoustics:암소음": ["U-1193", "U-1307"],
  "legacy:4:condition-diagnosis:설비진단 목적": ["U-013", "U-041"],
  "legacy:4:condition-diagnosis:간이진단": ["U-020"],
  "legacy:4:condition-diagnosis:정밀진단": ["U-701"],
  "legacy:4:condition-diagnosis:페로그래피": ["U-009"],
  "legacy:4:condition-diagnosis:SOAP·ICP": ["U-538", "U-611"],
  "legacy:4:maintenance-methods:사후보전 BM": ["U-282", "U-883"],
  "legacy:4:maintenance-methods:예방보전 PM": ["U-063"],
  "legacy:4:maintenance-methods:예지보전 PdM": ["U-922"],
  "s4-maintenance-methods-improvement-maintenance-cm": ["U-770"],
  "legacy:4:maintenance-methods:보전예방 MP": ["U-163"],
  "legacy:4:maintenance-organization-resources-qc:보전조직": [
    "U-150",
    "U-182",
  ],
  "legacy:4:maintenance-organization-resources-qc:보전예산·원가": [
    "U-1314",
    "U-1316",
  ],
  "legacy:4:maintenance-organization-resources-qc:보전자재·재고": [
    "U-278",
    "U-658",
    "U-1250",
  ],
  "legacy:4:maintenance-organization-resources-qc:2궤법·사용고발주": [
    "U-151",
    "U-1198",
  ],
  "legacy:4:maintenance-organization-resources-qc:PDCA·QC 도구": [
    "U-072",
    "U-189",
    "U-435",
    "U-711",
  ],
  "legacy:4:reliability-life-cycle:초기고장기": ["U-1246"],
  "legacy:4:reliability-life-cycle:우발고장기": ["U-963"],
  "legacy:4:reliability-life-cycle:MTBF·MTTR": ["U-689", "U-1247"],
  "legacy:4:reliability-life-cycle:가용도": ["U-148", "U-201", "U-279"],
  "legacy:4:tpm-autonomous:TPM": ["U-066"],
  "legacy:4:tpm-autonomous:자주보전": ["U-239"],
  "legacy:4:tpm-autonomous:7단계 흐름": [
    "U-070",
    "U-272",
    "U-350",
    "U-1249",
  ],
  "legacy:4:tpm-autonomous:6대 로스": ["U-645"],
  "legacy:4:tpm-autonomous:PM 분석": ["U-065", "U-874", "U-1064"],
  "legacy:4:factory-project:제품별 배치": ["U-061"],
  "legacy:4:factory-project:기능별 배치": ["U-193"],
  "legacy:4:factory-project:GT 셀 배치": ["U-1159"],
  "legacy:4:factory-project:고정위치 배치": ["U-276"],
  "legacy:4:factory-project:주공정": ["U-965"],
  "legacy:4:economics-cost:LCC": ["U-1251"],
  "legacy:4:economics-cost:합리화·확장 투자": ["U-058"],
  "legacy:4:economics-cost:방위·전략 투자": ["U-765"],
  "legacy:4:economics-cost:MAPI": ["U-964"],
  "legacy:4:economics-cost:기회손실": ["U-522"],
  "legacy:4:energy-management:부하율": ["U-767"],
  "legacy:4:energy-management:부등률": ["U-185"],
  "legacy:4:energy-management:직접 전력손실": ["U-513"],
  "legacy:4:energy-management:열관리": ["U-352", "U-425"],
  "legacy:4:energy-management:배열회수": ["U-1281"],
  "legacy:4:lubrication-foundation:윤활 기능": ["U-1339"],
  "legacy:4:lubrication-foundation:유체윤활": ["U-542"],
  "legacy:4:lubrication-foundation:경계윤활": ["U-734"],
  "legacy:4:lubrication-foundation:ISO VG": ["U-1122"],
  "legacy:4:lubrication-foundation:기어손상": ["U-100"],
  "legacy:4:lubricants-grease:점도지수": ["U-181"],
  "legacy:4:lubricants-grease:전산가": ["U-1025"],
  "legacy:4:lubricants-grease:주도·적점": ["U-106", "U-1340"],
  "legacy:4:lubricants-grease:극압첨가제": ["U-191", "U-298"],
  "legacy:4:oil-supply-management:전손식": ["U-325"],
  "legacy:4:oil-supply-management:유욕·비말": ["U-135", "U-294"],
  "legacy:4:oil-supply-management:링·체인 급유": ["U-935"],
  "legacy:4:oil-supply-management:강제순환": ["U-293"],
  "legacy:4:oil-supply-management:중앙집중급유": ["U-1265"],

  "s4-diagnosis-methods-sensors-diagnosis-methods": ["U-578"],
  "s4-diagnosis-methods-sensors-sensor-classification": ["U-635"],
  "s4-diagnosis-methods-sensors-piezo-accelerometer": ["U-220", "U-759"],
  "s4-diagnosis-methods-sensors-eddy-current": ["U-348", "U-1241"],
  "s4-noise-calculation-control-plane-spherical-wave": ["U-570"],
  "s4-noise-calculation-control-db-sum": ["U-1238"],
  "s4-noise-calculation-control-mass-law": ["U-494"],
  "s4-noise-calculation-control-silencer": ["U-816"],
  "s4-noise-calculation-control-fast-slow": ["U-025"],
  "s4-maintenance-foundation-standards-facility-classification": ["U-360"],
  "s4-maintenance-foundation-standards-maintenance-standards": [
    "U-647",
    "U-663",
  ],
  "s4-maintenance-foundation-standards-planned-emergency": [
    "U-232",
    "U-1105",
  ],
  "s4-maintenance-foundation-standards-urgency": ["U-821"],
  "s4-reliability-oee-calculation-failure-repair-rate": ["U-590", "U-226"],
  "s4-reliability-oee-calculation-time-availability": ["U-873"],
  "s4-reliability-oee-calculation-performance": ["U-769"],
  "s4-reliability-oee-calculation-quality": ["U-351"],
  "s4-reliability-oee-calculation-oee": ["U-1203"],
  "s4-lubrication-properties-deterioration-flash-point": ["U-386"],
  "s4-lubrication-properties-deterioration-oxidation": ["U-786"],
  "s4-lubrication-properties-deterioration-demulsibility": ["U-1260"],
  "s4-lubrication-properties-deterioration-contamination": [
    "U-677",
    "U-1264",
  ],
  "s4-lubrication-properties-deterioration-field-check": ["U-737"],
  "s4-grease-thickeners-tests-lithium": ["U-547"],
  "s4-grease-thickeners-tests-sodium": ["U-099"],
  "s4-grease-thickeners-tests-compatibility": ["U-1263"],
  "s4-grease-thickeners-tests-bleeding-stability": ["U-230", "U-843"],
  "s4-machine-element-lubrication-analysis-oil-analysis": [
    "U-009",
    "U-328",
    "U-611",
  ],
  "s4-machine-element-lubrication-analysis-reciprocating-compressor": [
    "U-192",
    "U-675",
  ],
  "s4-machine-element-lubrication-analysis-hydraulic-oil": ["U-1264"],
  "s4-machine-element-lubrication-analysis-bearing-grease": ["U-738"],
  "s4-gear-damage-types-scoring": ["U-100"],
  "s4-gear-damage-types-pitting": ["U-161"],
  "s4-gear-damage-types-spalling": ["U-388"],
  "s4-gear-damage-types-ridging": ["U-668"],
};

const PARTIAL_CONTEXT_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:4:vibration-foundation:진동 3요소": [
    "U-416",
    "U-862",
    "U-955",
    "U-1351",
  ],
  "legacy:4:lubricants-grease:그리스 구조": ["U-097"],
  "s4-diagnosis-methods-sensors-stroboscope": [],
  "s4-maintenance-foundation-standards-three-elements": [],
  "s4-grease-thickeners-tests-calcium": ["U-547"],
  "s4-machine-element-lubrication-analysis-turbo-compressor": [],
  "s4-gear-damage-types-device-boundary": ["U-100"],
};

const allFactIds = WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.flatMap((bundle) =>
  bundle.facts.map((fact) => getWrittenSubjectFactId(4, bundle, fact)),
);

const bindings = allFactIds.map((factId): SubjectFourFactCbtBinding => {
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

export function getSubjectFourFactCbtBinding(factId: string) {
  return bindingsByFactId.get(factId);
}

export function getSubjectFourFactCbtBindings() {
  return [...bindings];
}

export function getSubjectFourBundleCbtSelection(
  bundle: SubjectFourMemoryBundle,
  questions: readonly PublicQuestion[],
) {
  const normalizedBundle = {
    facts: bundle.facts.map((fact) => ({
      ...fact,
      id: getWrittenSubjectFactId(4, bundle, fact),
    })),
  };

  return getReviewedWrittenSubjectBundleCbtSelection(
    normalizedBundle,
    questions,
    bindingsByFactId,
    SUBJECT_FOUR_NO_DIRECT_CBT_NOTE,
  );
}
