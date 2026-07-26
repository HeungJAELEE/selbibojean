import { describe, expect, it } from "vitest";
import rawPracticalContent from "@/data/generated/practical-content.json";
import {
  getPracticalWorkTask,
  getPracticalWorkTasksForConcept,
  PRACTICAL_WORK_MODULES,
  PRACTICAL_WORK_TASKS,
} from "@/data/source/practical-work-tasks";
import type { PracticalContent } from "@/lib/domain/practical-types";

const content = rawPracticalContent as PracticalContent;

describe("NCS practical work content", () => {
  it("covers all eleven books with real tasks and records", () => {
    expect(PRACTICAL_WORK_MODULES).toHaveLength(11);
    expect(PRACTICAL_WORK_TASKS.length).toBeGreaterThanOrEqual(30);
    expect(
      PRACTICAL_WORK_MODULES.every((module) => module.taskIds.length >= 2),
    ).toBe(true);
    expect(
      PRACTICAL_WORK_TASKS.every(
        (task) =>
          task.theoryTopics.length > 0 &&
          task.safetyChecks.length > 0 &&
          task.steps.length > 0 &&
          task.measurements.length > 0 &&
          task.acceptanceChecks.length > 0 &&
          task.diagnostics.length > 0 &&
          task.recordFields.length > 0,
      ),
    ).toBe(true);
  });

  it("keeps uncertain field criteria manual and source-conditioned", () => {
    const automaticMeasurements = PRACTICAL_WORK_TASKS.flatMap(
      (task) => task.measurements,
    ).filter(
      (measurement) =>
        measurement.calculationRuleId !== null ||
        measurement.judgmentMode !== "manual",
    );
    expect(automaticMeasurements).toEqual([]);
    expect(
      PRACTICAL_WORK_TASKS.flatMap((task) => task.measurements).every(
        (measurement) =>
          measurement.acceptanceCriteria.length > 0 &&
          measurement.sourceCondition.length > 0,
      ),
    ).toBe(true);
  });

  it("resolves both stable task IDs and public slugs", () => {
    const task = PRACTICAL_WORK_TASKS[0];
    expect(getPracticalWorkTask(task.id)?.id).toBe(task.id);
    expect(getPracticalWorkTask(task.slug)?.id).toBe(task.id);
  });

  it("connects every NCS coverage concept to at least one work task", () => {
    for (const document of content.ncsCoverage.documents) {
      const workModule = PRACTICAL_WORK_MODULES.find(
        (item) => item.ncsCode === document.ncsCode,
      );
      expect(workModule, document.ncsCode).toBeDefined();
      for (const conceptId of document.conceptIds) {
        expect(
          workModule?.conceptIds,
          `${document.ncsCode}/${conceptId}`,
        ).toContain(conceptId);
        expect(getPracticalWorkTasksForConcept(conceptId).length).toBeGreaterThan(
          0,
        );
      }
    }
  });
});
