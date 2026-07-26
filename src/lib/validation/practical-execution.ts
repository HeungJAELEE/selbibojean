import type {
  PracticalCalculationRule,
  PracticalCoverageDeliverable,
  PracticalCoverageEntityRegistry,
  PracticalExamEvidence,
  PracticalMeasurement,
  PracticalSafetyCheckRecord,
  PracticalTask,
  PracticalUnitDefinition,
  PracticalWorkRecord,
  PracticalWorkStatus,
} from "@/lib/domain/practical-execution-types";

export type PracticalContractIssue = {
  code: string;
  entityId: string;
  message: string;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasDuplicates(values: string[]) {
  return new Set(values).size !== values.length;
}

export function validatePracticalExamEvidenceGraph(
  evidenceItems: PracticalExamEvidence[],
): PracticalContractIssue[] {
  const issues: PracticalContractIssue[] = [];
  const evidenceById = new Map(evidenceItems.map((item) => [item.id, item]));

  for (const evidence of evidenceItems) {
    const targetId = evidence.variantOfEvidenceId;
    if (evidence.status === "past_variant" && !targetId) {
      issues.push({
        code: "variant_source_required",
        entityId: evidence.id,
        message: "past_variant에는 variantOfEvidenceId가 필요합니다.",
      });
    }
    if (evidence.status !== "past_variant" && targetId !== null) {
      issues.push({
        code: "variant_source_forbidden",
        entityId: evidence.id,
        message: "past_variant가 아닌 Evidence는 변형 원본을 가질 수 없습니다.",
      });
    }
    if (targetId === evidence.id) {
      issues.push({
        code: "variant_self_reference",
        entityId: evidence.id,
        message: "Evidence는 자기 자신을 변형 원본으로 참조할 수 없습니다.",
      });
    } else if (targetId && !evidenceById.has(targetId)) {
      issues.push({
        code: "variant_source_missing",
        entityId: evidence.id,
        message: `변형 원본 Evidence가 없습니다: ${targetId}`,
      });
    }
    if (
      hasDuplicates(evidence.conceptIds) ||
      hasDuplicates(evidence.taskIds) ||
      hasDuplicates(evidence.questionIds) ||
      hasDuplicates(evidence.sourceRefs)
    ) {
      issues.push({
        code: "duplicate_evidence_link",
        entityId: evidence.id,
        message: "Evidence 연결 ID 또는 출처에 중복이 있습니다.",
      });
    }
    if (
      evidence.sessions.some(
        (session) =>
          (!hasText(session.sourceUrl) &&
            !hasText(session.sourceArtifactId)) ||
          !hasText(session.sourceFileHash) ||
          !hasText(session.capturedAt),
      )
    ) {
      issues.push({
        code: "evidence_source_incomplete",
        entityId: evidence.id,
        message:
          "출제 근거에는 URL 또는 내부 자산과 파일 해시·수집시각이 필요합니다.",
      });
    }
  }

  for (const start of evidenceItems) {
    const visited = new Set<string>();
    let current: PracticalExamEvidence | undefined = start;
    while (current?.variantOfEvidenceId) {
      if (visited.has(current.id)) {
        issues.push({
          code: "variant_cycle",
          entityId: start.id,
          message: "Evidence 변형 원본 관계에 순환 참조가 있습니다.",
        });
        break;
      }
      visited.add(current.id);
      current = evidenceById.get(current.variantOfEvidenceId);
    }
  }

  return issues;
}

export function countPracticalActualOccurrences(
  evidenceItems: PracticalExamEvidence[],
) {
  return evidenceItems
    .filter((evidence) => evidence.status === "past_reconstructed")
    .reduce((total, evidence) => total + evidence.sessions.length, 0);
}

export function validatePracticalCoverageDeliverables(
  deliverables: PracticalCoverageDeliverable[],
  entityRegistry: PracticalCoverageEntityRegistry,
): PracticalContractIssue[] {
  const issues: PracticalContractIssue[] = [];

  for (const [index, deliverable] of deliverables.entries()) {
    const entityId = `${deliverable.kind}:${index}`;
    if (hasDuplicates(deliverable.linkedIds)) {
      issues.push({
        code: "duplicate_coverage_link",
        entityId,
        message: "Coverage 산출물 연결 ID에 중복이 있습니다.",
      });
    }
    if (
      deliverable.linkedIds.some(
        (linkedId) => !entityRegistry[deliverable.kind].has(linkedId),
      )
    ) {
      issues.push({
        code: "coverage_link_type_mismatch",
        entityId,
        message: "산출물 종류와 연결 엔터티 종류가 일치하지 않습니다.",
      });
    }
    if (deliverable.status === "published" && deliverable.linkedIds.length === 0) {
      issues.push({
        code: "published_coverage_unlinked",
        entityId,
        message: "published 산출물에는 연결 ID가 하나 이상 필요합니다.",
      });
    }
    if (
      deliverable.status === "not_applicable" &&
      (deliverable.linkedIds.length > 0 || !hasText(deliverable.rationale))
    ) {
      issues.push({
        code: "invalid_not_applicable_coverage",
        entityId,
        message:
          "not_applicable 산출물은 연결 ID 없이 제외 근거를 기록해야 합니다.",
      });
    }
    if (
      deliverable.status === "held" &&
      (!deliverable.disposition ||
        !hasText(deliverable.rationale) ||
        !hasText(deliverable.nextAction))
    ) {
      issues.push({
        code: "incomplete_held_coverage",
        entityId,
        message: "held 산출물에는 보류유형·근거·다음 조치가 필요합니다.",
      });
    }
  }
  return issues;
}

export function canStartPracticalTask(
  requiredSafetyCheckIds: string[],
  records: PracticalSafetyCheckRecord[],
): boolean {
  const recordsById = new Map<string, PracticalSafetyCheckRecord>();
  for (const record of records) {
    if (recordsById.has(record.safetyCheckId)) return false;
    recordsById.set(record.safetyCheckId, record);
  }
  return requiredSafetyCheckIds.every((id) => {
    const record = recordsById.get(id);
    if (!record) return false;
    if (record.state === "pass") return Boolean(record.checkedAt);
    return (
      record.state === "not_applicable" &&
      hasText(record.reason) &&
      Boolean(record.checkedAt)
    );
  });
}

const ALLOWED_WORK_TRANSITIONS: Record<
  PracticalWorkStatus,
  PracticalWorkStatus[]
> = {
  not_started: ["in_progress"],
  in_progress: ["completed", "abandoned"],
  completed: [],
  abandoned: ["in_progress"],
};

export function validatePracticalWorkTransition(
  record: PracticalWorkRecord,
  task: PracticalTask,
  nextStatus: PracticalWorkStatus,
): PracticalContractIssue[] {
  const issues: PracticalContractIssue[] = [];
  if (!ALLOWED_WORK_TRANSITIONS[record.status].includes(nextStatus)) {
    issues.push({
      code: "invalid_work_status_transition",
      entityId: record.clientRecordId,
      message: `${record.status}에서 ${nextStatus}(으)로 전환할 수 없습니다.`,
    });
  }
  if (
    record.taskId !== task.id ||
    record.taskVersion !== task.version ||
    record.acceptanceRuleVersion !== task.acceptanceRuleVersion ||
    record.safetyGateVersion !== task.safetyGateVersion
  ) {
    issues.push({
      code: "work_record_version_mismatch",
      entityId: record.clientRecordId,
      message: "작업기록의 과제·판정·안전 게이트 버전이 현재 과제와 다릅니다.",
    });
  }
  if (
    nextStatus === "in_progress" &&
    !canStartPracticalTask(task.safetyGateIds, record.safetyChecks)
  ) {
    issues.push({
      code: "safety_gate_not_passed",
      entityId: record.clientRecordId,
      message: "필수 안전 체크를 통과하기 전에는 작업을 시작할 수 없습니다.",
    });
  }
  if (nextStatus === "in_progress" && !hasText(record.startedAt)) {
    issues.push({
      code: "started_timestamp_required",
      entityId: record.clientRecordId,
      message: "작업 시작 또는 재개 전환에는 startedAt이 필요합니다.",
    });
  }
  if (
    record.status === "abandoned" &&
    nextStatus === "in_progress" &&
    !record.statusHistory.some((entry) => entry.status === "abandoned")
  ) {
    issues.push({
      code: "abandoned_history_required",
      entityId: record.clientRecordId,
      message: "중단 후 재개할 때는 중단 이력을 보존해야 합니다.",
    });
  }
  if (nextStatus === "completed" && !hasText(record.completedAt)) {
    issues.push({
      code: "completed_timestamp_required",
      entityId: record.clientRecordId,
      message: "완료 전환에는 completedAt이 필요합니다.",
    });
  }
  if (
    nextStatus === "completed" &&
    (record.requiredStepIds.some(
      (id) => !record.completedStepIds.includes(id),
    ) ||
      record.requiredMeasurementIds.some(
        (id) => !record.completedMeasurementIds.includes(id),
      ) ||
      !record.selfAssessmentCompleted)
  ) {
    issues.push({
      code: "work_completion_incomplete",
      entityId: record.clientRecordId,
      message: "필수 단계·측정·자기평가를 모두 마쳐야 완료할 수 있습니다.",
    });
  }
  if (nextStatus === "abandoned" && !hasText(record.abandonedAt)) {
    issues.push({
      code: "abandoned_timestamp_required",
      entityId: record.clientRecordId,
      message: "중단 전환에는 abandonedAt이 필요합니다.",
    });
  }
  return issues;
}

export function validatePracticalMeasurementContract(
  measurement: PracticalMeasurement,
  calculationRules: PracticalCalculationRule[],
  unitDefinitions: PracticalUnitDefinition[],
): PracticalContractIssue[] {
  const issues: PracticalContractIssue[] = [];
  const rule = calculationRules.find(
    (candidate) =>
      candidate.id === measurement.calculationRuleId &&
      candidate.version === measurement.calculationRuleVersion,
  );
  if (measurement.calculationRuleId && !rule) {
    issues.push({
      code: "calculation_rule_missing",
      entityId: measurement.id,
      message: "등록된 계산 규칙과 버전을 찾을 수 없습니다.",
    });
  }
  const dimensionless =
    measurement.canonicalUnit === null &&
    measurement.unitConversionGroup === null &&
    measurement.acceptedInputUnits.length === 0;
  if (!dimensionless) {
    if (
      !measurement.canonicalUnit ||
      !measurement.unitConversionGroup ||
      measurement.acceptedInputUnits.length === 0 ||
      hasDuplicates(measurement.acceptedInputUnits)
    ) {
      issues.push({
        code: "invalid_measurement_unit_contract",
        entityId: measurement.id,
        message: "단위 측정값에는 기준단위·허용단위·변환그룹이 필요합니다.",
      });
    }
    for (const unit of measurement.acceptedInputUnits) {
      const definition = unitDefinitions.find((item) => item.unit === unit);
      if (
        !definition ||
        definition.conversionGroup !== measurement.unitConversionGroup ||
        definition.canonicalUnit !== measurement.canonicalUnit
      ) {
        issues.push({
          code: "unit_definition_mismatch",
          entityId: measurement.id,
          message: `허용 입력단위의 변환 정의가 일치하지 않습니다: ${unit}`,
        });
      }
    }
  }
  if (
    measurement.displayPrecision !== null &&
    (!Number.isInteger(measurement.displayPrecision) ||
      measurement.displayPrecision < 0)
  ) {
    issues.push({
      code: "invalid_display_precision",
      entityId: measurement.id,
      message: "표시 정밀도는 0 이상의 정수여야 합니다.",
    });
  }
  if (rule && rule.outputUnit !== (measurement.canonicalUnit ?? "")) {
    issues.push({
      code: "calculation_output_unit_mismatch",
      entityId: measurement.id,
      message: "계산 규칙의 출력단위가 측정 기준단위와 다릅니다.",
    });
  }
  return issues;
}
