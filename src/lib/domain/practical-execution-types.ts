export type PracticalExamEvidenceStatus =
  | "past_reconstructed"
  | "past_variant"
  | "predicted_related"
  | "ncs_supplement";

export type PracticalExamEvidenceFormat =
  | "image"
  | "drawing"
  | "symbol"
  | "calculation"
  | "definition"
  | "sequence"
  | "matching"
  | "diagnosis";

export type PracticalExamEvidenceSession = {
  year: number;
  round: number;
  questionNo: number | null;
  sourceType: "official" | "blog_reconstruction";
  confidence: "high" | "medium" | "held";
  sourceUrl: string | null;
  sourceArtifactId: string | null;
  sourceFileHash: string;
  capturedAt: string;
};

export type PracticalExamEvidence = {
  id: string;
  status: PracticalExamEvidenceStatus;
  variantOfEvidenceId: string | null;
  conceptIds: string[];
  taskIds: string[];
  questionIds: string[];
  sessions: PracticalExamEvidenceSession[];
  sourceRefs: string[];
  formats: PracticalExamEvidenceFormat[];
  learningKeywords: string[];
  gradingRequiredKeywords: string[];
};

export type PracticalCoverageDeliverableKind =
  | "theory"
  | "visual"
  | "task"
  | "assessment"
  | "record";

export type PracticalCoverageDeliverable = {
  kind: PracticalCoverageDeliverableKind;
  status: "published" | "draft" | "held" | "not_applicable";
  linkedIds: string[];
  disposition:
    | "held_visual_asset"
    | "held_source_or_standard"
    | "needs_source"
    | "conflict_review"
    | null;
  rationale: string;
  nextAction: string | null;
};

export type PracticalCoverageEntityRegistry = Record<
  PracticalCoverageDeliverableKind,
  ReadonlySet<string>
>;

export type PracticalWrittenCoverageItem = {
  id: string;
  ncsCode: string;
  documentTitle: string;
  deliverables: PracticalCoverageDeliverable[];
};

export type PracticalWrittenGovernanceHold = {
  id: string;
  sourceKind: "question" | "ncs_coverage";
  sourceId: string;
  disposition:
    | "held_asset_missing"
    | "held_source_missing"
    | "held_answer_conflict"
    | "held_visual_asset"
    | "held_source_or_standard";
  rationale: string;
  nextAction: string;
};

export type PracticalWrittenGovernanceManifest = {
  formatVersion: 1;
  generatedAt: string;
  sourceSha256: string;
  scope: "practical_written_only";
  evidence: PracticalExamEvidence[];
  coverage: PracticalWrittenCoverageItem[];
  holds: PracticalWrittenGovernanceHold[];
  report: {
    evidence: {
      pastReconstructed: number;
      pastVariant: number;
      predictedRelated: number;
      ncsSupplement: number;
    };
    publication: {
      past: number;
      predicted: number;
      held: number;
    };
    coverage: {
      ncsDocuments: number;
      publishedTheoryLinks: number;
      publishedAssessmentLinks: number;
      publishedVisualLinks: number;
      excludedTaskDeliverables: number;
      excludedRecordDeliverables: number;
    };
  };
};

export type PracticalWorkStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "abandoned";

export type PracticalSafetyCheckState =
  | "unchecked"
  | "pass"
  | "fail"
  | "not_applicable";

export type PracticalSafetyCheckRecord = {
  safetyCheckId: string;
  state: PracticalSafetyCheckState;
  reason: string | null;
  checkedAt: string | null;
};

export type PracticalWorkStatusHistoryEntry = {
  status: PracticalWorkStatus;
  changedAt: string;
  reason: string | null;
};

export type PracticalTask = {
  id: string;
  version: number;
  effectiveFrom: string;
  supersedesVersion: number | null;
  acceptanceRuleVersion: number;
  safetyGateVersion: number;
  safetyGateIds: string[];
  publishBlockerIds: string[];
};

export type PracticalWorkRecord = {
  clientRecordId: string;
  taskId: string;
  taskVersion: number;
  acceptanceRuleVersion: number;
  safetyGateVersion: number;
  status: PracticalWorkStatus;
  startedAt: string | null;
  completedAt: string | null;
  abandonedAt: string | null;
  safetyChecks: PracticalSafetyCheckRecord[];
  requiredStepIds: string[];
  completedStepIds: string[];
  requiredMeasurementIds: string[];
  completedMeasurementIds: string[];
  selfAssessmentCompleted: boolean;
  statusHistory: PracticalWorkStatusHistoryEntry[];
};

export type PracticalMeasurementValueType =
  | "number"
  | "boolean"
  | "choice"
  | "text";

export type PracticalMeasurementJudgmentMode =
  | "range"
  | "exact"
  | "checklist"
  | "manual";

export type PracticalMeasurement = {
  id: string;
  valueType: PracticalMeasurementValueType;
  judgmentMode: PracticalMeasurementJudgmentMode;
  formula: string | null;
  calculationRuleId: string | null;
  calculationRuleVersion: number | null;
  canonicalUnit: string | null;
  acceptedInputUnits: string[];
  unitConversionGroup: string | null;
  displayPrecision: number | null;
};

export type PracticalCalculationRule = {
  id: string;
  version: number;
  inputSchemaId: string;
  evaluatorKey: string;
  outputUnit: string;
};

export type PracticalUnitDefinition = {
  unit: string;
  conversionGroup: string;
  canonicalUnit: string;
  toCanonicalRuleId: string;
  fromCanonicalRuleId: string;
};

export type PracticalCalculationResult =
  | {
      status: "calculated";
      value: number;
      canonicalUnit: string | null;
    }
  | {
      status: "manual_review";
      reason:
        | "calculation_rule_missing"
        | "calculation_rule_version_mismatch"
        | "input_schema_missing"
        | "input_invalid"
        | "evaluator_missing"
        | "output_invalid"
        | "output_unit_mismatch";
    };

export type PracticalUnitConversionResult =
  | {
      status: "converted";
      value: number;
      canonicalUnit: string | null;
    }
  | {
      status: "manual_review";
      reason:
        | "unit_not_accepted"
        | "unit_definition_missing"
        | "conversion_group_mismatch"
        | "canonical_unit_mismatch"
        | "converter_missing"
        | "output_invalid";
    };
