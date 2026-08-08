import type { PublicQuestion } from "@/lib/domain/types";
import {
  createWrittenSubjectFactCbtRegistry,
  getReviewedWrittenSubjectBundleCbtSelection,
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE,
  type WrittenSubjectBundleForCbt,
  type WrittenSubjectFactCbtBinding,
} from "@/data/source/written-subject-cbt-selection";

export type SubjectThreeFactCbtBinding = WrittenSubjectFactCbtBinding;

export const SUBJECT_THREE_NO_DIRECT_CBT_NOTE =
  WRITTEN_SUBJECT_NO_DIRECT_CBT_NOTE;

const DIRECT_ORIGINAL_QUESTION_IDS: Record<string, readonly string[]> = {
  "s3-measurement-principles-abbe-principle": ["U-073"],
  "s3-measurement-principles-direct-measurement": ["U-318"],
  "s3-measurement-principles-comparative-indirect-measurement": [
    "U-441",
    "U-724",
    "U-1216",
  ],
  "s3-gauges-drawing-rules-limit-gauge": ["U-054"],
  "s3-gauges-drawing-rules-feeler-gauge": ["U-782"],
  "s3-gauges-drawing-rules-gear-drawing": ["U-136", "U-197"],
  "s3-machine-tools-cutting-milling": ["U-721"],
  "s3-machine-tools-cutting-drilling-boring-reaming": [
    "U-972",
    "U-594",
    "U-533",
  ],
  "s3-machine-tools-cutting-taper-machining": ["U-1282"],
  "s3-chips-tools-finishing-built-up-edge": ["U-240", "U-440"],
  "s3-chips-tools-finishing-tapping": ["U-377", "U-882"],
  "s3-chips-tools-finishing-dressing": ["U-655"],
  "s3-chips-tools-finishing-lapping": ["U-449"],
  "s3-casting-plastic-materials-cold-working": ["U-1319"],
  "s3-heat-treatment-testing-quenching": ["U-776", "U-925"],
  "s3-heat-treatment-testing-tempering": ["U-249"],
  "s3-heat-treatment-testing-annealing": ["U-288"],
  "s3-heat-treatment-testing-normalizing": ["U-1110"],
  "s3-heat-treatment-testing-nitriding": ["U-667", "U-1210"],
  "s3-heat-treatment-testing-induction-hardening": ["U-603"],
  "s3-assembly-fasteners-torque-wrench": ["U-195"],
  "s3-assembly-fasteners-fastener-locking": [
    "U-085",
    "U-237",
    "U-602",
    "U-661",
    "U-968",
    "U-1112",
  ],
  "s3-assembly-fasteners-key": ["U-532", "U-1069", "U-976"],
  "s3-assembly-fasteners-pin": ["U-371"],
  "s3-assembly-fasteners-cotter": ["U-537"],
  "s3-shaft-coupling-bearing-clutch": ["U-928"],
  "s3-shaft-coupling-bearing-rigid-flexible-couplings": ["U-718"],
  "s3-shaft-coupling-bearing-shaft-alignment": ["U-078", "U-1016"],
  "s3-shaft-coupling-bearing-bearing-damage": ["U-878"],
  "s3-shaft-coupling-bearing-bearing-assembly": ["U-445", "U-1254"],
  "s3-power-transmission-gear-damage": ["U-362", "U-837", "U-1207"],
  "s3-power-transmission-v-belt": ["U-246", "U-836", "U-1253"],
  "s3-power-transmission-chain": ["U-659", "U-969", "U-1256"],
  "s3-power-transmission-rubber-spring": ["U-373", "U-447"],
  "s3-piping-valves-seals-union": ["U-320"],
  "s3-piping-valves-seals-flange": ["U-079", "U-599"],
  "s3-piping-valves-seals-expansion-joint": ["U-206", "U-238"],
  "s3-piping-valves-seals-gate-valve": ["U-242"],
  "s3-piping-valves-seals-check-valve": ["U-527"],
  "s3-piping-valves-seals-butterfly-valve": ["U-720"],
  "s3-piping-valves-seals-mechanical-seal": ["U-234", "U-084", "U-600"],
  "s3-piping-valves-seals-labyrinth-seal": ["U-082"],
  "s3-piping-valves-seals-anaerobic-adhesive": ["U-241"],
  "s3-fluid-machinery-troubles-cavitation": ["U-781", "U-1161"],
  "s3-fluid-machinery-troubles-water-hammer": [
    "U-203",
    "U-443",
    "U-1257",
  ],
  "s3-fluid-machinery-troubles-pump-no-discharge": ["U-092"],
  "s3-fluid-machinery-troubles-blower": ["U-446", "U-1021"],
  "s3-fluid-machinery-troubles-positive-displacement-compressor": [
    "U-087",
    "U-290",
    "U-1286",
  ],
  "s3-fluid-machinery-troubles-turbo-compressor": ["U-664", "U-290"],
  "s3-motor-startup-maintenance-three-phase-loss": ["U-877"],
  "s3-motor-startup-maintenance-motor-overheating": [
    "U-317",
    "U-521",
    "U-626",
    "U-656",
  ],
  "s3-motor-startup-maintenance-inspection-record": ["U-199"],
};

const PARTIAL_CONTEXT_QUESTION_IDS: Record<string, readonly string[]> = {
  "s3-drawing-lines-tolerance-fit-types": ["U-1254"],
  "s3-machine-tools-cutting-lathe": ["U-204"],
  "s3-machine-tools-cutting-up-milling": ["U-721"],
  "s3-machine-tools-cutting-down-milling": ["U-721"],
  "s3-chips-tools-finishing-wheel-loading-glazing": ["U-655"],
  "s3-chips-tools-finishing-truing": ["U-655"],
  "s3-casting-plastic-materials-hot-working": ["U-1319"],
  "s3-casting-plastic-materials-malleability": ["U-1319"],
  "s3-casting-plastic-materials-ductility": ["U-1319"],
  "s3-heat-treatment-testing-metal-diffusion": ["U-153"],
  "s3-assembly-fasteners-screw-extractor": ["U-832"],
  "s3-assembly-fasteners-screw-self-locking": ["U-1255"],
  "s3-shaft-coupling-bearing-coupling": ["U-372"],
  "s3-shaft-coupling-bearing-oldham-coupling": ["U-718"],
  "s3-power-transmission-brake-fade": ["U-834"],
  "s3-power-transmission-brake-vapor-lock": ["U-834"],
  "s3-motor-startup-maintenance-disassembly-assembly": ["U-1017"],
};

const NO_DIRECT_ORIGINAL_FACT_IDS = [
  "s3-drawing-lines-tolerance-line-priority",
  "s3-drawing-lines-tolerance-section-view",
  "s3-drawing-lines-tolerance-dimensional-tolerance",
  "s3-drawing-lines-tolerance-hole-basis-system",
  "s3-drawing-lines-tolerance-drawing-symbols",
  "s3-measurement-principles-systematic-error",
  "s3-measurement-principles-random-error",
  "s3-measurement-principles-taylor-principle",
  "s3-gauges-drawing-rules-gauge-block",
  "s3-gauges-drawing-rules-surface-roughness",
  "s3-gauges-drawing-rules-material-symbols",
  "s3-chips-tools-finishing-continuous-chip",
  "s3-chips-tools-finishing-honing",
  "s3-casting-plastic-materials-casting-allowances",
  "s3-casting-plastic-materials-special-casting",
  "s3-casting-plastic-materials-crystal-lattices",
  "s3-casting-plastic-materials-specific-gravity",
  "s3-casting-plastic-materials-steel-five-elements",
  "s3-casting-plastic-materials-phosphorus-shortness",
  "s3-casting-plastic-materials-sulfur-shortness",
  "s3-heat-treatment-testing-carburizing",
  "s3-heat-treatment-testing-flame-hardening",
  "s3-heat-treatment-testing-material-testing",
  "s3-assembly-fasteners-jig",
  "s3-assembly-fasteners-fixture",
  "s3-power-transmission-backlash",
  "s3-piping-valves-seals-globe-valve",
  "s3-fluid-machinery-troubles-surging",
  "s3-motor-startup-maintenance-cross-tightening",
  "s3-motor-startup-maintenance-no-load-test",
  "s3-maintenance-tools-lubrication-five-functions",
  "s3-maintenance-tools-lubrication-spanner",
  "s3-maintenance-tools-lubrication-hammer",
  "s3-maintenance-tools-lubrication-chisel",
  "s3-maintenance-tools-lubrication-file",
] as const;

const bindings = [
  ...Object.entries(DIRECT_ORIGINAL_QUESTION_IDS).map(
    ([factId, questionIds]): SubjectThreeFactCbtBinding => ({
      factId,
      status: "direct_original",
      questionIds,
    }),
  ),
  ...Object.entries(PARTIAL_CONTEXT_QUESTION_IDS).map(
    ([factId, questionIds]): SubjectThreeFactCbtBinding => ({
      factId,
      status: "partial_context",
      questionIds,
    }),
  ),
  ...NO_DIRECT_ORIGINAL_FACT_IDS.map(
    (factId): SubjectThreeFactCbtBinding => ({
      factId,
      status: "no_direct_original",
      questionIds: [],
    }),
  ),
];

const bindingsByFactId = createWrittenSubjectFactCbtRegistry(bindings);

export function getSubjectThreeFactCbtBinding(factId: string) {
  return bindingsByFactId.get(factId);
}

export function getSubjectThreeBundleCbtSelection(
  bundle: WrittenSubjectBundleForCbt,
  questions: readonly PublicQuestion[],
) {
  return getReviewedWrittenSubjectBundleCbtSelection(
    bundle,
    questions,
    bindingsByFactId,
    SUBJECT_THREE_NO_DIRECT_CBT_NOTE,
  );
}
