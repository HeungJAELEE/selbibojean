import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRACTICAL_NCS_UNIT_CANDIDATES,
  PRACTICAL_NCS_UNIT_REGISTRY,
  PRACTICAL_RESTORED_SOURCE_SWEEP,
} from "@/data/source/practical-written-source-sweep";
import { PRACTICAL_NCS_UNIT_PROMOTIONS } from "@/data/source/practical-ncs-unit-reinforcements";
import type { PracticalContent } from "@/lib/domain/practical-types";

type SourceSweepReport = {
  summary: {
    ncsDocuments: number;
    ncsUnits: number;
    baselineExistingCoveredUnits: number;
    promotedUnits: number;
    coveredUnits: number;
    candidateUnits: number;
    priorityA: number;
    priorityB: number;
    priorityC: number;
    unmappedNcsSourceRefs: number;
    unaccountedUnits: number;
    restoredSourceSubmissions: number;
    restoredUniqueSourceUrls: number;
    pendingRestoredSourceUrls: number;
  };
  units: Array<{
    id: string;
    ncsCode: string;
    unitId: string;
    priority: "A" | "B" | "C";
    status:
      | "existing_past_anchored"
      | "existing_predicted_or_adjacent"
      | "promoted_ncs_supplement"
      | "candidate_editorial_hold";
    conceptIds: string[];
    candidate: { id: string; publicationStatus: "editorial_hold" } | null;
    promotion: {
      candidateId: string;
      conceptId: string;
      questionId: string;
      publicationStatus: "published";
      evidenceStatus: "ncs_supplement";
    } | null;
  }>;
  restoredSources: typeof PRACTICAL_RESTORED_SOURCE_SWEEP;
};

const [content, report] = await Promise.all([
  readFile(
    path.join(process.cwd(), "src/data/generated/practical-content.json"),
    "utf8",
  ).then((value) => JSON.parse(value) as PracticalContent),
  readFile(
    path.join(
      process.cwd(),
      "src/data/generated/practical-written-source-sweep.json",
    ),
    "utf8",
  ).then((value) => JSON.parse(value) as SourceSweepReport),
]);

const key = (item: { ncsCode: string; unitId: string }) =>
  `${item.ncsCode}:${item.unitId}`;

describe("practical written 11-book source sweep", () => {
  it("accounts for every NCS table-of-contents unit without freezing content-row counts", () => {
    expect(new Set(PRACTICAL_NCS_UNIT_REGISTRY.map((item) => item.id)).size).toBe(
      PRACTICAL_NCS_UNIT_REGISTRY.length,
    );
    expect(report.summary.ncsUnits).toBe(PRACTICAL_NCS_UNIT_REGISTRY.length);
    expect(report.summary.ncsDocuments).toBe(
      new Set(PRACTICAL_NCS_UNIT_REGISTRY.map((item) => item.ncsCode)).size,
    );
    expect(report.units.map((item) => item.id)).toEqual(
      PRACTICAL_NCS_UNIT_REGISTRY.map((item) => item.id),
    );
    expect(report.summary.unmappedNcsSourceRefs).toBe(0);
    expect(report.summary.unaccountedUnits).toBe(0);
    expect(report.summary.coveredUnits).toBe(report.summary.ncsUnits);
    expect(
      report.summary.baselineExistingCoveredUnits +
        report.summary.promotedUnits,
    ).toBe(report.summary.coveredUnits);
    expect(report.summary.candidateUnits).toBe(0);
    expect(
      report.summary.priorityA +
        report.summary.priorityB +
        report.summary.priorityC,
    ).toBe(report.summary.ncsUnits);
  });

  it("promotes exactly the 27 units that lacked a direct existing concept reference", () => {
    const candidateKeys = PRACTICAL_NCS_UNIT_CANDIDATES.map(key).sort();
    const promotedKeys = report.units
      .filter((item) => item.status === "promoted_ncs_supplement")
      .map(key)
      .sort();
    const baselineExistingKeys = report.units
      .filter((item) => item.status.startsWith("existing_"))
      .map(key);

    expect(candidateKeys).toEqual(promotedKeys);
    expect(new Set(candidateKeys).size).toBe(candidateKeys.length);
    expect(
      candidateKeys.some((candidateKey) =>
        baselineExistingKeys.includes(candidateKey),
      ),
    ).toBe(false);
    expect(report.summary.promotedUnits).toBe(
      PRACTICAL_NCS_UNIT_CANDIDATES.length,
    );
  });

  it("preserves the source capsules while publishing one reviewed theory and question per unit", () => {
    const conceptIds = new Set(content.concepts.map((item) => item.id));
    const questionIds = new Set(content.questions.map((item) => item.id));
    const promotionByCandidateId = new Map(
      PRACTICAL_NCS_UNIT_PROMOTIONS.map((item) => [item.candidateId, item]),
    );

    for (const candidate of PRACTICAL_NCS_UNIT_CANDIDATES) {
      expect(candidate.sourceStatus).toBe("ncs_text_extracted");
      expect(candidate.publicationStatus).toBe("editorial_hold");
      expect(candidate.memoryCapsule.length).toBeGreaterThan(40);
      expect(candidate.requiredKeywords.length).toBeGreaterThanOrEqual(3);
      expect(candidate.predictedPromptSeeds.length).toBeGreaterThanOrEqual(2);
      expect(
        candidate.neighborConceptIds.every((conceptId) =>
          conceptIds.has(conceptId),
        ),
      ).toBe(true);
      const promotion = promotionByCandidateId.get(candidate.id);
      expect(promotion).toBeDefined();
      expect(conceptIds.has(promotion?.conceptId ?? "")).toBe(true);
      expect(questionIds.has(promotion?.questionId ?? "")).toBe(true);
      const concept = content.concepts.find(
        (item) => item.id === promotion?.conceptId,
      );
      const question = content.questions.find(
        (item) => item.id === promotion?.questionId,
      );
      expect(concept).toMatchObject({
        contentRole: "supplemental",
        contentStatus: "published",
        relatedPredictedQuestionIds: [promotion?.questionId],
      });
      expect(concept?.definition.length).toBeGreaterThan(30);
      expect(concept?.principle.length).toBeGreaterThan(50);
      expect(concept?.components.length).toBeGreaterThanOrEqual(3);
      expect(concept?.procedure.length).toBeGreaterThanOrEqual(3);
      expect(concept?.diagnosis.length).toBeGreaterThanOrEqual(1);
      expect(concept?.safety.length).toBeGreaterThanOrEqual(1);
      expect(concept?.traps.length).toBeGreaterThanOrEqual(2);
      expect(concept?.ncsSources).toHaveLength(1);
      expect(question).toMatchObject({
        kind: "predicted",
        contentStatus: "published",
        auditDisposition: "verified",
        occurrence: null,
        examEvidenceStatus: "ncs_supplement",
      });
      expect(question?.modelAnswer.length).toBeGreaterThan(30);
      expect(question?.answerDefinition?.length).toBeGreaterThan(20);
      expect(question?.memoryTip?.length).toBeGreaterThan(5);
      expect(question?.requiredKeywords.length).toBeGreaterThanOrEqual(3);
      expect(question?.rubric.length).toBeGreaterThanOrEqual(3);
      expect(question?.ncsSources).toEqual(concept?.ncsSources);
    }

    for (const id of [
      "NCS-CAND-PPE-SELECTION",
      "NCS-CAND-SAFETY-PREVENTION",
    ]) {
      expect(
        PRACTICAL_NCS_UNIT_CANDIDATES.find((item) => item.id === id)?.holdReason,
      ).toMatch(/법령|공식 근거/);
    }
    for (const id of [
      "NCS-CAND-WELD-VERTICAL",
      "NCS-CAND-WELD-HORIZONTAL",
      "NCS-CAND-WELD-OVERHEAD",
    ]) {
      expect(
        PRACTICAL_NCS_UNIT_CANDIDATES.find((item) => item.id === id)?.holdReason,
      ).toContain("WPS");
    }
  });

  it("records the duplicated restored URL once and never guesses its occurrence", () => {
    const pending = PRACTICAL_RESTORED_SOURCE_SWEEP.find(
      (item) => item.url === "https://blog.naver.com/moru-1/224367666966",
    );

    expect(pending).toMatchObject({
      status: "source_pending_extraction",
      occurrence: null,
      questionIds: [],
      submissionCount: 2,
    });
    expect(report.summary.restoredSourceSubmissions).toBe(
      PRACTICAL_RESTORED_SOURCE_SWEEP.reduce(
        (sum, item) => sum + item.submissionCount,
        0,
      ),
    );
    expect(report.summary.restoredUniqueSourceUrls).toBe(
      PRACTICAL_RESTORED_SOURCE_SWEEP.length,
    );
    expect(report.summary.pendingRestoredSourceUrls).toBe(
      PRACTICAL_RESTORED_SOURCE_SWEEP.filter(
        (item) => item.status === "source_pending_extraction",
      ).length,
    );
    expect(report.restoredSources).toEqual(PRACTICAL_RESTORED_SOURCE_SWEEP);
  });
});
