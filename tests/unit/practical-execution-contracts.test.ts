import { describe, expect, it } from "vitest";
import { z } from "zod";
import type {
  PracticalExamEvidence,
  PracticalMeasurement,
  PracticalTask,
  PracticalWorkRecord,
} from "@/lib/domain/practical-execution-types";
import {
  convertPracticalMeasurementInput,
  evaluatePracticalCalculation,
} from "@/lib/domain/practical-calculation-runtime";
import {
  canStartPracticalTask,
  countPracticalActualOccurrences,
  validatePracticalCoverageDeliverables,
  validatePracticalExamEvidenceGraph,
  validatePracticalMeasurementContract,
  validatePracticalWorkTransition,
} from "@/lib/validation/practical-execution";

function evidence(
  id: string,
  status: PracticalExamEvidence["status"],
  variantOfEvidenceId: string | null,
): PracticalExamEvidence {
  return {
    id,
    status,
    variantOfEvidenceId,
    conceptIds: ["concept-1"],
    taskIds: [],
    questionIds: [`question-${id}`],
    sessions:
      status === "past_reconstructed"
        ? [
            {
              year: 2026,
              round: 1,
              questionNo: 1,
              sourceType: "blog_reconstruction",
              confidence: "medium",
              sourceUrl: "https://example.com/reconstruction",
              sourceArtifactId: null,
              sourceFileHash: "sha256:fixture",
              capturedAt: "2026-07-26T00:00:00.000Z",
            },
          ]
        : [],
    formats: ["definition"],
    learningKeywords: ["축압기"],
    gradingRequiredKeywords: ["압력에너지 저장"],
  };
}

const task: PracticalTask = {
  id: "task-pneumatic-1",
  version: 1,
  effectiveFrom: "2026-07-26T00:00:00.000Z",
  supersedesVersion: null,
  acceptanceRuleVersion: 1,
  safetyGateVersion: 1,
  safetyGateIds: ["safety-1", "safety-2"],
  publishBlockerIds: [],
};

function workRecord(): PracticalWorkRecord {
  return {
    clientRecordId: "record-1",
    taskId: task.id,
    taskVersion: task.version,
    acceptanceRuleVersion: task.acceptanceRuleVersion,
    safetyGateVersion: task.safetyGateVersion,
    status: "not_started",
    startedAt: "2026-07-26T00:02:00.000Z",
    completedAt: null,
    abandonedAt: null,
    safetyChecks: [
      {
        safetyCheckId: "safety-1",
        state: "pass",
        reason: null,
        checkedAt: "2026-07-26T00:01:00.000Z",
      },
      {
        safetyCheckId: "safety-2",
        state: "not_applicable",
        reason: "이 과제에는 압력용기가 지급되지 않음",
        checkedAt: "2026-07-26T00:01:00.000Z",
      },
    ],
    requiredStepIds: ["step-1"],
    completedStepIds: [],
    requiredMeasurementIds: ["measurement-1"],
    completedMeasurementIds: [],
    selfAssessmentCompleted: false,
    statusHistory: [
      {
        status: "not_started",
        changedAt: "2026-07-26T00:00:00.000Z",
        reason: null,
      },
    ],
  };
}

const measurement: PracticalMeasurement = {
  id: "force",
  valueType: "number",
  judgmentMode: "range",
  formula: "F = pA",
  calculationRuleId: "hydraulic-force",
  calculationRuleVersion: 1,
  canonicalUnit: "N",
  acceptedInputUnits: ["N", "kN"],
  unitConversionGroup: "force",
  displayPrecision: 2,
};

describe("practical v3 execution contracts", () => {
  it("requires past variants to reference an existing acyclic Evidence", () => {
    const original = evidence("evidence-original", "past_reconstructed", null);
    const variant = evidence(
      "evidence-variant",
      "past_variant",
      original.id,
    );
    expect(validatePracticalExamEvidenceGraph([original, variant])).toEqual([]);
    expect(countPracticalActualOccurrences([original, variant])).toBe(1);

    const cyclicA = evidence("cyclic-a", "past_variant", "cyclic-b");
    const cyclicB = evidence("cyclic-b", "past_variant", "cyclic-a");
    expect(
      validatePracticalExamEvidenceGraph([cyclicA, cyclicB]).map(
        (issue) => issue.code,
      ),
    ).toContain("variant_cycle");
  });

  it("validates coverage links by deliverable kind and disposition", () => {
    const registry = {
      theory: new Set(["theory-1"]),
      visual: new Set(["visual-1"]),
      task: new Set(["task-1"]),
      assessment: new Set(["assessment-1"]),
      record: new Set(["record-1"]),
    };
    expect(
      validatePracticalCoverageDeliverables(
        [
          {
            kind: "theory",
            status: "published",
            linkedIds: ["theory-1"],
            disposition: null,
            rationale: "NCS 원문 반영",
            nextAction: null,
          },
        ],
        registry,
      ),
    ).toEqual([]);
    expect(
      validatePracticalCoverageDeliverables(
        [
          {
            kind: "visual",
            status: "held",
            linkedIds: [],
            disposition: "held_visual_asset",
            rationale: "",
            nextAction: null,
          },
        ],
        registry,
      ).map((issue) => issue.code),
    ).toContain("incomplete_held_coverage");
  });

  it("blocks work until every safety check passes or has a justified N/A", () => {
    const record = workRecord();
    expect(canStartPracticalTask(task.safetyGateIds, record.safetyChecks)).toBe(
      true,
    );
    expect(validatePracticalWorkTransition(record, task, "in_progress")).toEqual(
      [],
    );

    record.safetyChecks[1] = {
      ...record.safetyChecks[1],
      reason: " ",
    };
    expect(canStartPracticalTask(task.safetyGateIds, record.safetyChecks)).toBe(
      false,
    );
    expect(
      validatePracticalWorkTransition(record, task, "in_progress").map(
        (issue) => issue.code,
      ),
    ).toContain("safety_gate_not_passed");
  });

  it("requires steps, measurements, self-assessment, and timestamps to complete", () => {
    const record = workRecord();
    record.status = "in_progress";
    record.completedAt = "2026-07-26T00:10:00.000Z";
    expect(
      validatePracticalWorkTransition(record, task, "completed").map(
        (issue) => issue.code,
      ),
    ).toContain("work_completion_incomplete");

    record.completedStepIds = ["step-1"];
    record.completedMeasurementIds = ["measurement-1"];
    record.selfAssessmentCompleted = true;
    expect(validatePracticalWorkTransition(record, task, "completed")).toEqual(
      [],
    );
  });

  it("runs only registered calculation rules with validated inputs", () => {
    const rules = [
      {
        id: "hydraulic-force",
        version: 1,
        inputSchemaId: "pressure-area",
        evaluatorKey: "pressure-times-area",
        outputUnit: "N",
      },
    ];
    const runtime = {
      rules,
      inputSchemas: new Map([
        [
          "pressure-area",
          z.object({ pressurePa: z.number(), areaM2: z.number() }),
        ],
      ]),
      evaluators: new Map<string, (input: unknown) => number>([
        [
          "pressure-times-area",
          (input) => {
            const values = input as { pressurePa: number; areaM2: number };
            return values.pressurePa * values.areaM2;
          },
        ],
      ]),
    };
    expect(
      evaluatePracticalCalculation(
        measurement,
        { pressurePa: 1_000_000, areaM2: 0.002 },
        runtime,
      ),
    ).toEqual({ status: "calculated", value: 2000, canonicalUnit: "N" });
    expect(
      evaluatePracticalCalculation(measurement, { pressurePa: "invalid" }, runtime),
    ).toEqual({ status: "manual_review", reason: "input_invalid" });
  });

  it("converts accepted units to canonical precision without display rounding", () => {
    const definitions = [
      {
        unit: "N",
        conversionGroup: "force",
        canonicalUnit: "N",
        toCanonicalRuleId: "identity",
        fromCanonicalRuleId: "identity",
      },
      {
        unit: "kN",
        conversionGroup: "force",
        canonicalUnit: "N",
        toCanonicalRuleId: "kn-to-n",
        fromCanonicalRuleId: "n-to-kn",
      },
    ];
    expect(
      validatePracticalMeasurementContract(
        measurement,
        [
          {
            id: "hydraulic-force",
            version: 1,
            inputSchemaId: "pressure-area",
            evaluatorKey: "pressure-times-area",
            outputUnit: "N",
          },
        ],
        definitions,
      ),
    ).toEqual([]);
    const converted = convertPracticalMeasurementInput(
      measurement,
      1.23456,
      "kN",
      {
        definitions,
        converters: new Map([
          ["identity", (value) => value],
          ["kn-to-n", (value) => value * 1000],
        ]),
      },
    );
    expect(converted.status).toBe("converted");
    if (converted.status === "converted") {
      expect(converted.value).toBeCloseTo(1234.56, 10);
      expect(converted.canonicalUnit).toBe("N");
    }
  });
});
