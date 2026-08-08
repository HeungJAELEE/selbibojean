import { describe, expect, it } from "vitest";
import { WRITTEN_SUBJECT_THREE_MEMORY_GUIDE } from "@/data/source/written-subject-three-memory-guide";

function getBundle(bundleId: string) {
  const bundle = WRITTEN_SUBJECT_THREE_MEMORY_GUIDE.find(
    (candidate) => candidate.id === bundleId,
  );
  expect(bundle, bundleId).toBeDefined();
  return bundle!;
}

function getFact(bundleId: string, factId: string) {
  const fact = getBundle(bundleId).facts.find(
    (candidate) => candidate.id === factId,
  );
  expect(fact, factId).toBeDefined();
  return fact!;
}

describe("subject 3 reviewed content corrections", () => {
  it("keeps clearance and interference formulas directionally correct", () => {
    const formulas = getBundle("drawing-lines-tolerance").formulas ?? [];
    expect(formulas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "최대 틈새",
          formula: "구멍 최대치수 - 축 최소치수",
        }),
        expect.objectContaining({
          label: "최소 틈새",
          formula: "구멍 최소치수 - 축 최대치수",
          note: expect.stringContaining("음수이면"),
        }),
        expect.objectContaining({
          label: "최대 죔새",
          formula: "축 최대치수 - 구멍 최소치수",
        }),
        expect.objectContaining({
          label: "최소 죔새",
          formula: "축 최소치수 - 구멍 최대치수",
          note: expect.stringContaining("음수이면"),
        }),
      ]),
    );
  });

  it("qualifies the 4.5 specific-gravity split as an exam convention", () => {
    expect(
      getFact(
        "casting-plastic-materials",
        "s3-casting-plastic-materials-specific-gravity",
      ).answer,
    ).toContain("시험상의 관용 분류");
  });

  it("uses C, Si, Mn, P, and S as the five steel elements", () => {
    const answer = getFact(
      "casting-plastic-materials",
      "s3-casting-plastic-materials-steel-five-elements",
    ).answer;
    expect(answer).toContain("C·Si·Mn·P·S");
    expect(answer).toContain("Fe는 강의 바탕 금속");
    expect(answer).toContain("포함하지 않습니다");
  });

  it("keeps phosphorus and sulfur shortness directions distinct", () => {
    expect(
      getFact(
        "casting-plastic-materials",
        "s3-casting-plastic-materials-phosphorus-shortness",
      ).answer,
    ).toContain("상온취성");
    expect(
      getFact(
        "casting-plastic-materials",
        "s3-casting-plastic-materials-sulfur-shortness",
      ).answer,
    ).toContain("적열취성");
  });

  it("keeps screw self-locking tied to lead angle below friction angle", () => {
    const answer = getFact(
      "assembly-fasteners",
      "s3-assembly-fasteners-screw-self-locking",
    ).answer;
    expect(answer).toContain("리드각 λ가 마찰각 φ보다 작으면");
  });

  it("keeps hand-tool safety statements actionable and non-destructive", () => {
    expect(
      getFact(
        "maintenance-tools-lubrication",
        "s3-maintenance-tools-lubrication-spanner",
      ).answer,
    ).toContain("몸 쪽으로 당겨");
    expect(
      getFact(
        "maintenance-tools-lubrication",
        "s3-maintenance-tools-lubrication-hammer",
      ).answer,
    ).toContain("깨끗하고 건조하게");
    expect(
      getFact(
        "maintenance-tools-lubrication",
        "s3-maintenance-tools-lubrication-chisel",
      ).answer,
    ).toContain("보안경");
    expect(
      getFact(
        "maintenance-tools-lubrication",
        "s3-maintenance-tools-lubrication-file",
      ).answer,
    ).toContain("줄솔");
  });
});
