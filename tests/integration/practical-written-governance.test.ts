import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type {
  PracticalCoverageEntityRegistry,
  PracticalWrittenGovernanceManifest,
} from "@/lib/domain/practical-execution-types";
import type { PracticalContent } from "@/lib/domain/practical-types";
import {
  countPracticalActualOccurrences,
  validatePracticalCoverageDeliverables,
  validatePracticalExamEvidenceGraph,
} from "@/lib/validation/practical-execution";

const [content, manifest] = await Promise.all([
  readFile(
    path.join(process.cwd(), "src/data/generated/practical-content.json"),
    "utf8",
  ).then((value) => JSON.parse(value) as PracticalContent),
  readFile(
    path.join(
      process.cwd(),
      "src/data/generated/practical-written-governance.json",
    ),
    "utf8",
  ).then((value) => JSON.parse(value) as PracticalWrittenGovernanceManifest),
]);

describe("practical written governance manifest", () => {
  it("accounts for every reconstructed, predicted, and NCS supplement item", () => {
    expect(manifest.scope).toBe("practical_written_only");
    expect(manifest.sourceSha256).toBe(content.report.sourceSha256);
    expect(manifest.report.evidence).toEqual({
      pastReconstructed: 42,
      pastVariant: 0,
      predictedRelated: 118,
      ncsSupplement: 43,
    });
    expect(validatePracticalExamEvidenceGraph(manifest.evidence)).toEqual([]);
    expect(countPracticalActualOccurrences(manifest.evidence)).toBe(42);
  });

  it("keeps all work-task links and records outside the written-only scope", () => {
    expect(manifest.evidence.every((item) => item.taskIds.length === 0)).toBe(
      true,
    );
    expect(
      manifest.coverage.every((item) =>
        item.deliverables
          .filter(
            (deliverable) =>
              deliverable.kind === "task" ||
              deliverable.kind === "record",
          )
          .every(
            (deliverable) =>
              deliverable.status === "not_applicable" &&
              deliverable.linkedIds.length === 0,
          ),
      ),
    ).toBe(true);
  });

  it("validates all NCS document coverage links by entity type", () => {
    const registry: PracticalCoverageEntityRegistry = {
      theory: new Set(content.concepts.map((concept) => concept.id)),
      visual: new Set(content.visualAids.map((visualAid) => visualAid.id)),
      assessment: new Set(content.questions.map((question) => question.id)),
      task: new Set(),
      record: new Set(),
    };
    expect(manifest.coverage).toHaveLength(11);
    expect(
      manifest.coverage.flatMap((item) =>
        validatePracticalCoverageDeliverables(
          item.deliverables,
          registry,
        ),
      ),
    ).toEqual([]);
  });

  it("records every held written question without publishing it as coverage", () => {
    const heldQuestionIds = content.questions
      .filter((question) => question.auditDisposition.startsWith("held_"))
      .map((question) => question.id)
      .sort();
    const recordedIds = manifest.holds
      .filter((hold) => hold.sourceKind === "question")
      .map((hold) => hold.sourceId)
      .sort();
    expect(recordedIds).toEqual(heldQuestionIds);
    expect(recordedIds).toHaveLength(21);
  });

  it("keeps official and NCS source references for promoted corrections", () => {
    const byQuestionId = (questionId: string) =>
      manifest.evidence.find((item) => item.questionIds.includes(questionId));

    expect(byQuestionId("P-2025-2-Q08")?.sourceRefs.length).toBeGreaterThanOrEqual(
      3,
    );
    expect(byQuestionId("P-2025-2-Q01-2")?.sourceRefs.length).toBeGreaterThanOrEqual(
      3,
    );
    expect(byQuestionId("P-2026-1-Q08")?.sourceRefs.length).toBeGreaterThanOrEqual(
      3,
    );
  });
});
