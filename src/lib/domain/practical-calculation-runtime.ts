import type { ZodType } from "zod";
import type {
  PracticalCalculationResult,
  PracticalCalculationRule,
  PracticalMeasurement,
  PracticalUnitConversionResult,
  PracticalUnitDefinition,
} from "@/lib/domain/practical-execution-types";

export type PracticalCalculationRuntime = {
  rules: PracticalCalculationRule[];
  inputSchemas: ReadonlyMap<string, ZodType>;
  evaluators: ReadonlyMap<string, (input: unknown) => number>;
};

export function evaluatePracticalCalculation(
  measurement: PracticalMeasurement,
  input: unknown,
  runtime: PracticalCalculationRuntime,
): PracticalCalculationResult {
  if (!measurement.calculationRuleId || !measurement.calculationRuleVersion) {
    return { status: "manual_review", reason: "calculation_rule_missing" };
  }
  const sameId = runtime.rules.filter(
    (rule) => rule.id === measurement.calculationRuleId,
  );
  const rule = sameId.find(
    (candidate) => candidate.version === measurement.calculationRuleVersion,
  );
  if (!rule) {
    return {
      status: "manual_review",
      reason:
        sameId.length > 0
          ? "calculation_rule_version_mismatch"
          : "calculation_rule_missing",
    };
  }
  if (rule.outputUnit !== (measurement.canonicalUnit ?? "")) {
    return { status: "manual_review", reason: "output_unit_mismatch" };
  }
  const schema = runtime.inputSchemas.get(rule.inputSchemaId);
  if (!schema) return { status: "manual_review", reason: "input_schema_missing" };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { status: "manual_review", reason: "input_invalid" };
  const evaluator = runtime.evaluators.get(rule.evaluatorKey);
  if (!evaluator) return { status: "manual_review", reason: "evaluator_missing" };
  const value = evaluator(parsed.data);
  if (!Number.isFinite(value)) {
    return { status: "manual_review", reason: "output_invalid" };
  }
  return {
    status: "calculated",
    value,
    canonicalUnit: measurement.canonicalUnit,
  };
}

export type PracticalUnitConversionRuntime = {
  definitions: PracticalUnitDefinition[];
  converters: ReadonlyMap<string, (value: number) => number>;
};

export function convertPracticalMeasurementInput(
  measurement: PracticalMeasurement,
  value: number,
  inputUnit: string | null,
  runtime: PracticalUnitConversionRuntime,
): PracticalUnitConversionResult {
  if (
    measurement.canonicalUnit === null &&
    measurement.unitConversionGroup === null &&
    measurement.acceptedInputUnits.length === 0
  ) {
    return Number.isFinite(value)
      ? { status: "converted", value, canonicalUnit: null }
      : { status: "manual_review", reason: "output_invalid" };
  }
  if (!inputUnit || !measurement.acceptedInputUnits.includes(inputUnit)) {
    return { status: "manual_review", reason: "unit_not_accepted" };
  }
  const definition = runtime.definitions.find((item) => item.unit === inputUnit);
  if (!definition) {
    return { status: "manual_review", reason: "unit_definition_missing" };
  }
  if (definition.conversionGroup !== measurement.unitConversionGroup) {
    return { status: "manual_review", reason: "conversion_group_mismatch" };
  }
  if (definition.canonicalUnit !== measurement.canonicalUnit) {
    return { status: "manual_review", reason: "canonical_unit_mismatch" };
  }
  const converter = runtime.converters.get(definition.toCanonicalRuleId);
  if (!converter) return { status: "manual_review", reason: "converter_missing" };
  const converted = converter(value);
  if (!Number.isFinite(converted)) {
    return { status: "manual_review", reason: "output_invalid" };
  }
  return {
    status: "converted",
    value: converted,
    canonicalUnit: measurement.canonicalUnit,
  };
}
