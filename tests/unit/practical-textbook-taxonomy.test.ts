import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  practicalTextbookPlacementByConceptId,
  practicalTextbookStudyTypes,
  practicalTextbookSubjects,
} from "@/data/source/practical-textbook-taxonomy";
import type { PracticalContent } from "@/lib/domain/practical-types";

const content = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src/data/generated/practical-content.json"),
    "utf8",
  ),
) as PracticalContent;

describe("practical NCS textbook taxonomy", () => {
  it("places every published practical concept in exactly one canonical subject", () => {
    const publishedIds = content.concepts
      .filter((concept) => concept.contentStatus === "published")
      .map((concept) => concept.id)
      .sort();

    expect(Object.keys(practicalTextbookPlacementByConceptId).sort()).toEqual(
      publishedIds,
    );
    expect(practicalTextbookSubjects.map((subject) => subject.id)).toEqual([
      "subject-1",
      "subject-2",
      "subject-3",
      "subject-4",
    ]);
  });

  it("gives every concept at least one textbook learning type", () => {
    const validTypeIds = new Set(practicalTextbookStudyTypes.map((type) => type.id));
    for (const placement of Object.values(practicalTextbookPlacementByConceptId)) {
      expect(placement.studyTypeIds.length).toBeGreaterThan(0);
      expect(placement.studyTypeIds.every((id) => validTypeIds.has(id))).toBe(true);
    }
  });

  it("normalizes sensors and hydraulic circuits into subject 1", () => {
    for (const conceptId of ["PCON-003", "PCON-011", "PCON-034", "PCON-039"]) {
      expect(practicalTextbookPlacementByConceptId[conceptId]?.subjectId).toBe(
        "subject-1",
      );
    }
  });

  it("keeps missing NCS locations out of the source-confirmed path", () => {
    for (const conceptId of ["PCON-015", "PCON-021", "PCON-027", "PCON-034"]) {
      expect(
        practicalTextbookPlacementByConceptId[conceptId]?.sourceEvidence,
      ).toBe("review_required");
    }
  });

  it("puts only NCS-supported calculations in the formula study type", () => {
    const formulaConceptIds = Object.entries(
      practicalTextbookPlacementByConceptId,
    )
      .filter(([, placement]) => placement.studyTypeIds.includes("formula"))
      .map(([conceptId]) => conceptId)
      .sort();

    expect(formulaConceptIds).toEqual([
      "PCON-014",
      "PCON-019",
      "PCON-025",
      "PCON-032",
      "PCON-037",
      "PCON-SUP-001",
      "PCON-SUP-002",
      "PCON-SUP-018",
      "PCON-SUP-025",
      "PCON-SUP-026",
    ]);

    for (const conceptId of [
      "PCON-001",
      "PCON-011",
      "PCON-024",
      "PCON-030",
      "PCON-031",
      "PCON-034",
      "PCON-035",
      "PCON-039",
      "PCON-040",
      "PCON-046",
    ]) {
      expect(
        practicalTextbookPlacementByConceptId[conceptId]?.studyTypeIds,
      ).not.toContain("formula");
    }
  });
});
