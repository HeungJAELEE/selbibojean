import type { PublicQuestion } from "@/lib/domain/types";
import {
  createWrittenSubjectFactCbtRegistry,
  getReviewedWrittenSubjectBundleCbtSelection,
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE,
  type WrittenSubjectFactCbtBinding,
} from "@/data/source/written-subject-cbt-selection";
import {
  WRITTEN_SUBJECT_ONE_MEMORY_GUIDE,
  type SubjectOneMemoryBundle,
} from "@/data/source/written-subject-one-memory-guide";
import { getWrittenSubjectFactId } from "@/data/source/written-subject-fact-lesson-links";

export type SubjectOneFactCbtBinding = WrittenSubjectFactCbtBinding;

export const SUBJECT_ONE_NO_DIRECT_CBT_NOTE =
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE;

/**
 * Fact와 원문 기출의 판단 대상이 직접 일치하는 경우만 등록합니다.
 * 제목·레슨·키워드 자동 매칭은 공개 경로에서 사용하지 않습니다.
 */
const DIRECT_ORIGINAL_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:1:fluid-foundation:SI 기본단위": ["U-1185", "U-1267"],
  "legacy:1:fluid-foundation:밀도·비중량·비중": ["U-116"],
  "legacy:1:fluid-foundation:압력 관계": ["U-134", "U-485", "U-1052"],
  "legacy:1:fluid-laws:보일의 법칙": ["U-117"],
  "legacy:1:fluid-laws:샤를의 법칙": ["U-806"],
  "legacy:1:fluid-laws:파스칼의 원리": ["U-479"],
  "legacy:1:fluid-laws:연속의 법칙": ["U-749", "U-896"],
  "legacy:1:fluid-laws:베르누이 정리": ["U-133"],
  "legacy:1:fluid-laws:레이놀즈수": ["U-402"],
  "legacy:1:pneumatic-foundation:공압의 장점": ["U-561", "U-1342"],
  "legacy:1:pneumatic-foundation:공압의 한계": ["U-162", "U-747"],
  "legacy:1:pneumatic-foundation:용적형 압축기": [
    "U-1087",
    "U-1177",
    "U-1347",
  ],
  "legacy:1:pneumatic-foundation:동력형 압축기": ["U-1389"],
  "legacy:1:pneumatic-foundation:후부냉각·건조": [
    "U-331",
    "U-404",
    "U-1184",
  ],
  "legacy:1:pneumatic-foundation:FRL": ["U-548", "U-1230"],
  "legacy:1:hydraulic-power:유압의 장점": ["U-945", "U-1297"],
  "legacy:1:hydraulic-power:작동유 역할": ["U-1229"],
  "legacy:1:hydraulic-power:용적식 펌프": ["U-124", "U-1268"],
  "legacy:1:hydraulic-power:펌프와 모터": ["U-622", "U-951"],
  "legacy:1:hydraulic-power:실린더 출력": ["U-330"],
  "legacy:1:hydraulic-power:어큐뮬레이터": ["U-334", "U-490"],
  "legacy:1:valves-circuits:릴리프밸브": ["U-123", "U-797"],
  "legacy:1:valves-circuits:감압밸브": ["U-627"],
  "legacy:1:valves-circuits:시퀀스밸브": ["U-693", "U-1269"],
  "legacy:1:valves-circuits:방향제어밸브": ["U-211", "U-1138"],
  "legacy:1:valves-circuits:미터인·미터아웃": [
    "U-795",
    "U-796",
    "U-992",
  ],
  "legacy:1:valves-circuits:특수 회로": ["U-113", "U-208", "U-393"],
  "legacy:1:hydraulic-troubleshooting:캐비테이션": ["U-947"],
  "legacy:1:hydraulic-troubleshooting:에어레이션": ["U-1139"],
  "legacy:1:hydraulic-troubleshooting:채터링": ["U-170", "U-1236"],
  "legacy:1:hydraulic-troubleshooting:기호 판독": ["U-211", "U-303"],
  "legacy:1:actuators-piping-maintenance:공기압 요소 번호": ["U-487"],
  "legacy:1:actuators-piping-maintenance:단동·복동 실린더": ["U-1225"],
  "legacy:1:actuators-piping-maintenance:특수 실린더": [
    "U-300",
    "U-396",
    "U-808",
    "U-854",
  ],
  "legacy:1:actuators-piping-maintenance:쿠션·설치": [
    "U-405",
    "U-687",
    "U-1231",
  ],
  "legacy:1:actuators-piping-maintenance:유압 액추에이터": ["U-114"],
  "legacy:1:actuators-piping-maintenance:공압 주배관·이음": [
    "U-1091",
    "U-1299",
  ],
  "legacy:1:electric-electronic:옴의 법칙": ["U-907"],
  "legacy:1:electric-electronic:수동·능동소자": ["U-475", "U-1388"],
  "legacy:1:electric-electronic:변압기": ["U-304", "U-1036"],
  "legacy:1:electric-electronic:유도전동기": [
    "U-746",
    "U-1035",
    "U-1194",
  ],
  "legacy:1:electric-electronic:직류전동기": ["U-1164"],
  "legacy:1:logic-plc:AND·OR·NOT": ["U-408", "U-562", "U-1387"],
  "legacy:1:logic-plc:a·b접점": ["U-410"],
  "legacy:1:logic-plc:자기유지·인터록": ["U-686", "U-755"],
  "legacy:1:logic-plc:PLC 스캔": ["U-255", "U-901", "U-942"],
  "legacy:1:logic-plc:시퀀스 제어": ["U-125", "U-897", "U-1393"],
  "legacy:1:automatic-control:개회로 제어": ["U-630", "U-1349"],
  "legacy:1:automatic-control:폐회로 제어": ["U-165", "U-245", "U-329"],
  "legacy:1:automatic-control:P 제어": ["U-030"],
  "legacy:1:automatic-control:I 제어": ["U-683"],
  "legacy:1:automatic-control:D 제어": ["U-556"],
  "legacy:1:automatic-control:과도응답": ["U-899"],
  "legacy:1:sensors-signals:근접센서": ["U-128", "U-902", "U-1275"],
  "legacy:1:sensors-signals:온도센서": ["U-498"],
  "legacy:1:sensors-signals:회전·속도 센서": [
    "U-046",
    "U-814",
    "U-908",
  ],
  "legacy:1:sensors-signals:감도·분해능": ["U-624"],
  "legacy:1:industrial-communication-handling:링형 네트워크": [
    "U-751",
    "U-1300",
  ],
  "legacy:1:industrial-communication-handling:핸들링": [
    "U-403",
    "U-616",
    "U-1141",
  ],
  "legacy:1:industrial-communication-handling:산업용 로봇": [
    "U-252",
    "U-1037",
    "U-1343",
  ],

  "s1-fluid-calculation-extended-combined-gas-law": ["U-117", "U-806"],
  "s1-fluid-calculation-extended-torricelli": ["U-344"],
  "s1-fluid-calculation-extended-hydraulic-power": ["U-623"],
  "s1-fluid-calculation-extended-pump-efficiency": ["U-1140"],
  "s1-fluid-calculation-extended-displacement-flow": ["U-1383"],
  "s1-compressor-air-treatment-details-reciprocating-rotary": [
    "U-742",
    "U-1177",
  ],
  "s1-compressor-air-treatment-details-turbo": ["U-1389"],
  "s1-compressor-air-treatment-details-multistage": ["U-331"],
  "s1-compressor-air-treatment-details-treatment-order": ["U-694"],
  "s1-compressor-air-treatment-details-dryer-types": ["U-691", "U-1184"],
  "s1-hydraulic-pumps-motors-details-gear": ["U-1140"],
  "s1-hydraulic-pumps-motors-details-vane": ["U-798", "U-1295"],
  "s1-hydraulic-pumps-motors-details-piston": ["U-565", "U-1233"],
  "s1-hydraulic-pumps-motors-details-trochoid": ["U-991"],
  "s1-hydraulic-pumps-motors-details-motor-types": ["U-301", "U-951"],
  "s1-valves-centers-special-circuits-pressure-valves": [
    "U-681",
    "U-852",
  ],
  "s1-valves-centers-special-circuits-centers": ["U-1138"],
  "s1-valves-centers-special-circuits-logic-valves": [
    "U-491",
    "U-555",
    "U-1348",
  ],
  "s1-valves-centers-special-circuits-speed-control": [
    "U-795",
    "U-992",
    "U-1090",
  ],
  "s1-valves-centers-special-circuits-lock-brake": ["U-564", "U-753"],
  "s1-actuator-types-piping-details-double-rod": ["U-1038"],
  "s1-actuator-types-piping-details-telescopic": ["U-300", "U-478"],
  "s1-actuator-types-piping-details-rodless": ["U-396", "U-949"],
  "s1-actuator-types-piping-details-ram-impact": ["U-808", "U-854"],
  "s1-actuator-types-piping-details-main-pipe": ["U-1299"],
  "s1-electronics-components-measurement-diode-zener": ["U-210", "U-1180"],
  "s1-electronics-components-measurement-rectifier": ["U-415"],
  "s1-electronics-components-measurement-meter-connection": ["U-953"],
  "s1-motors-starting-servo-stepper-dc": ["U-948", "U-1164"],
  "s1-motors-starting-servo-stepper-induction": [
    "U-746",
    "U-1035",
    "U-1194",
  ],
  "s1-motors-starting-servo-stepper-synchronous": ["U-1041"],
  "s1-motors-starting-servo-stepper-servo": ["U-1135", "U-1271"],
  "s1-motors-starting-servo-stepper-stepper": ["U-209", "U-799"],
  "s1-logic-plc-sequence-advanced-expanded-logic": [
    "U-408",
    "U-562",
    "U-1387",
  ],
  "s1-logic-plc-sequence-advanced-plc-structure": ["U-255", "U-901"],
  "s1-logic-plc-sequence-advanced-sequence-types": [
    "U-125",
    "U-897",
    "U-1393",
  ],
  "s1-logic-plc-sequence-advanced-representation": ["U-047", "U-481"],
  "s1-measurement-sampling-errors-sensor-principles": [
    "U-002",
    "U-128",
    "U-859",
    "U-902",
  ],
  "s1-measurement-sampling-errors-process-sensors": ["U-498", "U-692"],
  "s1-control-servo-transients-servo": ["U-804"],
  "s1-control-servo-transients-pid": ["U-030", "U-556", "U-683"],
  "s1-control-servo-transients-response-terms": ["U-899"],
  "s1-network-topology-handling-details-ring-mesh": ["U-751", "U-1300"],
  "s1-network-topology-handling-details-handling": [
    "U-403",
    "U-616",
    "U-1141",
  ],
  "s1-network-topology-handling-details-robot": [
    "U-252",
    "U-1037",
    "U-1343",
  ],
};

const PARTIAL_CONTEXT_QUESTION_IDS: Record<string, readonly string[]> = {
  "legacy:1:fluid-foundation:점도와 동점도": ["U-900"],
  "legacy:1:hydraulic-troubleshooting:스틱슬립": ["U-747"],
  "legacy:1:sensors-signals:정확도·정밀도": ["U-010"],
  "s1-electronics-components-measurement-transistor": ["U-1391"],
  "s1-logic-plc-sequence-advanced-demorgan": ["U-408", "U-562"],
  "s1-measurement-sampling-errors-error-loading": ["U-010"],
};

const allFactIds = WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.flatMap((bundle) =>
  bundle.facts.map((fact) => getWrittenSubjectFactId(1, bundle, fact)),
);

const bindings = allFactIds.map((factId): SubjectOneFactCbtBinding => {
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

export function getSubjectOneFactCbtBinding(factId: string) {
  return bindingsByFactId.get(factId);
}

export function getSubjectOneFactCbtBindings() {
  return [...bindings];
}

export function getSubjectOneBundleCbtSelection(
  bundle: SubjectOneMemoryBundle,
  questions: readonly PublicQuestion[],
) {
  const normalizedBundle = {
    facts: bundle.facts.map((fact) => ({
      ...fact,
      id: getWrittenSubjectFactId(1, bundle, fact),
    })),
  };

  return getReviewedWrittenSubjectBundleCbtSelection(
    normalizedBundle,
    questions,
    bindingsByFactId,
    SUBJECT_ONE_NO_DIRECT_CBT_NOTE,
  );
}
