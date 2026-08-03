import { WELDING_CBT_LEAF_TARGETS } from "@/data/source/welding-cbt-lesson-taxonomy";

const BUNDLE_LESSON_IDS: Record<string, readonly string[]> = {
  "classification-joints": [
    "lesson-welding-foundation-basics",
    "lesson-welding-foundation-joints-symbols",
  ],
  "arc-foundation-polarity": ["lesson-welding-foundation-power-heat"],
  "electrodes-arc-blow": [
    "lesson-welding-foundation-electrodes",
    "lesson-welding-process-smaw",
  ],
  "shielded-high-efficiency": [
    "lesson-welding-process-gtaw",
    "lesson-welding-process-gmaw",
    "lesson-welding-process-fcaw",
    "lesson-welding-process-saw",
    "lesson-welding-process-shielding",
  ],
  "pressure-gas-special": [
    "lesson-welding-gas-equipment-flame",
    "lesson-welding-gas-cutting",
    "lesson-welding-resistance",
    "lesson-welding-special-processes",
  ],
  "weld-defects": [
    "lesson-welding-defect-undercut",
    "lesson-welding-defect-overlap",
    "lesson-welding-defect-porosity",
    "lesson-welding-defect-slag",
    "lesson-welding-defect-penetration-fusion",
    "lesson-welding-defect-spatter",
    "lesson-welding-defect-burn-through",
    "lesson-welding-defect-crack",
    "lesson-welding-defect-arc-strike",
  ],
  "deformation-stress": ["lesson-welding-foundation-deformation"],
  inspection: ["lesson-welding-inspection-ndt"],
  "grooves-symbols": ["lesson-welding-foundation-joints-symbols"],
  "ppe-signs-fire": [
    "lesson-welding-safety-ppe",
    "lesson-1ctkzud",
    "lesson-welding-safety-fire",
  ],
  "gas-electrical-machine-safety": [
    "lesson-welding-safety-gas",
    "lesson-welding-safety-electrical",
    "lesson-welding-safety-machinery",
    "lesson-welding-safety-management",
  ],
  "pressure-welding-process-details": [
    "lesson-welding-foundation-brazing-pressure",
    "lesson-welding-resistance",
  ],
  "electrode-flame-heat-input-details": [
    "lesson-welding-foundation-electrodes",
    "lesson-welding-foundation-power-heat",
    "lesson-welding-gas-equipment-flame",
  ],
  "advanced-arc-process-controls": [
    "lesson-welding-process-gtaw",
    "lesson-welding-process-gmaw",
    "lesson-welding-process-saw",
    "lesson-welding-special-processes",
  ],
  "ppe-classification-details": [
    "lesson-welding-safety-ppe",
    "lesson-welding-safety-chemical",
  ],
  "safety-sign-fire-details": [
    "lesson-1ctkzud",
    "lesson-welding-safety-fire",
  ],
  "gas-cylinder-flashback-details": ["lesson-welding-safety-gas"],
  "machine-workplace-safety-details": [
    "lesson-welding-safety-machinery",
    "lesson-welding-safety-lifting-fall",
    "lesson-welding-safety-management",
  ],
};

export function getSubjectTwoBundleProjectedLessonIds(bundleId: string) {
  return BUNDLE_LESSON_IDS[bundleId] ?? [];
}

export function getSubjectTwoBundleProjectedLessonTitles(bundleId: string) {
  return getSubjectTwoBundleProjectedLessonIds(bundleId)
    .map(
      (lessonId) =>
        WELDING_CBT_LEAF_TARGETS[
          lessonId as keyof typeof WELDING_CBT_LEAF_TARGETS
        ]?.title,
    )
    .filter((title) => title !== undefined);
}
