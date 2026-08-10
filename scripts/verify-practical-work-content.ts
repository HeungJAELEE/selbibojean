import rawPracticalContent from "../src/data/generated/practical-content.json";
import { NCS_SOURCE_REGISTRY } from "../src/data/source/practical-source-registry";
import {
  PRACTICAL_WORK_MODULES,
  PRACTICAL_WORK_TASKS,
} from "../src/data/source/practical-work-tasks";
import { PRACTICAL_REQUIRED_TOPICS_BY_NCS_CODE } from "../src/data/source/practical-required-topics";
import { PRACTICAL_NCS_UNIT_PROMOTIONS } from "../src/data/source/practical-ncs-unit-reinforcements";
import type { PracticalContent } from "../src/lib/domain/practical-types";

const content = rawPracticalContent as PracticalContent;
const errors: string[] = [];

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
}

const expectedNcsCodes = Object.keys(NCS_SOURCE_REGISTRY).sort();
const moduleNcsCodes = PRACTICAL_WORK_MODULES.map((module) => module.ncsCode).sort();
if (JSON.stringify(expectedNcsCodes) !== JSON.stringify(moduleNcsCodes)) {
  errors.push("NCS 11권과 작업형 모듈의 문서 코드 집합이 일치하지 않습니다.");
}

const taskIds = PRACTICAL_WORK_TASKS.map((task) => task.id);
const taskSlugs = PRACTICAL_WORK_TASKS.map((task) => task.slug);
for (const duplicate of duplicateValues(taskIds)) {
  errors.push(`중복 수행과제 ID: ${duplicate}`);
}
for (const duplicate of duplicateValues(taskSlugs)) {
  errors.push(`중복 수행과제 slug: ${duplicate}`);
}

const publishedConceptIds = new Set(
  content.concepts
    .filter((concept) => concept.contentStatus === "published")
    .map((concept) => concept.id),
);
const taskIdSet = new Set(taskIds);
const writtenOnlyReinforcementConceptIds = new Set(
  PRACTICAL_NCS_UNIT_PROMOTIONS.map((item) => item.conceptId),
);

for (const workModule of PRACTICAL_WORK_MODULES) {
  const coverageDocument = content.ncsCoverage.documents.find(
    (document) => document.ncsCode === workModule.ncsCode,
  );
  if (workModule.taskIds.length < 2) {
    errors.push(`${workModule.ncsCode} ${workModule.documentTitle}: 수행과제가 2개 미만입니다.`);
  }
  if (workModule.taskIds.some((taskId) => !taskIdSet.has(taskId))) {
    errors.push(`${workModule.ncsCode} ${workModule.documentTitle}: 존재하지 않는 수행과제를 연결했습니다.`);
  }
  if (workModule.conceptIds.some((conceptId) => !publishedConceptIds.has(conceptId))) {
    errors.push(`${workModule.ncsCode} ${workModule.documentTitle}: 공개되지 않은 이론을 연결했습니다.`);
  }
  if (!coverageDocument) {
    errors.push(
      `${workModule.ncsCode} ${workModule.documentTitle}: NCS Coverage 문서를 찾을 수 없습니다.`,
    );
  } else {
    const missingCoverageConceptIds = coverageDocument.conceptIds.filter(
      (conceptId) =>
        !writtenOnlyReinforcementConceptIds.has(conceptId) &&
        !workModule.conceptIds.includes(conceptId),
    );
    if (missingCoverageConceptIds.length > 0) {
      errors.push(
        `${workModule.ncsCode} ${workModule.documentTitle}: 수행과제에 연결되지 않은 Coverage 이론 ${missingCoverageConceptIds.join(", ")}`,
      );
    }
  }
  const moduleContentText = JSON.stringify(
    PRACTICAL_WORK_TASKS.filter(
      (task) => task.ncsCode === workModule.ncsCode,
    ),
  );
  const missingRequiredTopics = (
    PRACTICAL_REQUIRED_TOPICS_BY_NCS_CODE[workModule.ncsCode] ?? []
  ).filter((topic) => !moduleContentText.includes(topic));
  if (missingRequiredTopics.length > 0) {
    errors.push(
      `${workModule.ncsCode} ${workModule.documentTitle}: 통합 분석 필수 주제 누락 ${missingRequiredTopics.join(", ")}`,
    );
  }
}

for (const task of PRACTICAL_WORK_TASKS) {
  if (!(task.ncsCode in NCS_SOURCE_REGISTRY)) {
    errors.push(`${task.id}: 등록되지 않은 NCS 코드입니다.`);
  }
  if (task.conceptIds.length === 0 || task.theoryTopics.length === 0) {
    errors.push(`${task.id}: 연결 이론 또는 보강 이론이 비어 있습니다.`);
  }
  if (task.conceptIds.some((conceptId) => !publishedConceptIds.has(conceptId))) {
    errors.push(`${task.id}: 존재하지 않거나 비공개인 개념을 연결했습니다.`);
  }
  if (
    task.safetyChecks.length === 0 ||
    task.safetyGateIds.length !== task.safetyChecks.length ||
    task.safetyGateIds.some(
      (safetyCheckId) =>
        !task.safetyChecks.some((check) => check.id === safetyCheckId),
    )
  ) {
    errors.push(`${task.id}: 안전 게이트와 안전 체크가 일치하지 않습니다.`);
  }
  if (
    duplicateValues(task.safetyGateIds).length ||
    duplicateValues(task.steps.map((step) => step.id)).length ||
    duplicateValues(task.measurements.map((measurement) => measurement.id)).length
  ) {
    errors.push(`${task.id}: 안전·단계·측정 ID가 중복되었습니다.`);
  }
  const phases = new Set(task.steps.map((step) => step.phase));
  for (const requiredPhase of ["prepare", "record"] as const) {
    if (!phases.has(requiredPhase)) {
      errors.push(`${task.id}: 필수 수행단계 ${requiredPhase}가 없습니다.`);
    }
  }
  if (!phases.has("execute") && !phases.has("isolate")) {
    errors.push(`${task.id}: 실제 수행 또는 에너지 격리 단계가 없습니다.`);
  }
  if (
    task.measurements.length === 0 ||
    task.acceptanceChecks.length === 0 ||
    task.diagnostics.length === 0 ||
    task.recordFields.length === 0
  ) {
    errors.push(`${task.id}: 측정·판정·진단·기록 중 누락된 산출물이 있습니다.`);
  }
  for (const measurement of task.measurements) {
    if (!measurement.label || !measurement.method || !measurement.acceptanceCriteria) {
      errors.push(`${task.id}/${measurement.id}: 측정방법 또는 판정기준이 비어 있습니다.`);
    }
    if (
      measurement.valueType !== "number" &&
      (measurement.canonicalUnit !== null ||
        measurement.acceptedInputUnits.length > 0 ||
        measurement.unitConversionGroup !== null)
    ) {
      errors.push(`${task.id}/${measurement.id}: 비수치 측정항목에 단위가 지정되었습니다.`);
    }
    if (
      measurement.valueType === "number" &&
      (!measurement.canonicalUnit ||
        !measurement.acceptedInputUnits.includes(measurement.canonicalUnit))
    ) {
      errors.push(`${task.id}/${measurement.id}: 수치 측정항목의 기준단위가 불완전합니다.`);
    }
    if (
      measurement.calculationRuleId !== null ||
      measurement.calculationRuleVersion !== null
    ) {
      errors.push(`${task.id}/${measurement.id}: 검수되지 않은 자동계산 규칙이 연결되었습니다.`);
    }
  }
}

const totalSafetyChecks = PRACTICAL_WORK_TASKS.reduce(
  (sum, task) => sum + task.safetyChecks.length,
  0,
);
const totalMeasurements = PRACTICAL_WORK_TASKS.reduce(
  (sum, task) => sum + task.measurements.length,
  0,
);
const totalSteps = PRACTICAL_WORK_TASKS.reduce(
  (sum, task) => sum + task.steps.length,
  0,
);
const totalRequiredTopics = Object.values(
  PRACTICAL_REQUIRED_TOPICS_BY_NCS_CODE,
).reduce(
  (sum, topics) => sum + topics.length,
  0,
);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Practical work content verified: ${PRACTICAL_WORK_MODULES.length} modules, ` +
    `${PRACTICAL_WORK_TASKS.length} tasks, ${totalSteps} steps, ` +
    `${totalSafetyChecks} safety gates, ${totalMeasurements} measurements, ` +
    `${totalRequiredTopics} required topics.`,
);
