import { describe, expect, it } from "vitest";
import {
  getPracticalCenterComparison,
  PRACTICAL_2025_HISTORY_CENTERS,
  PRACTICAL_HISTORICAL_CANDIDATE_CENTERS,
  PRACTICAL_MAIN_TEST_CENTERS,
  PRACTICAL_TEST_CENTERS,
  PRACTICAL_TEST_CENTER_SOURCE,
} from "@/data/source/practical-test-centers";
import { practicalEquipmentModelsById } from "@/data/source/practical-equipment-models";

describe("practical test center source catalog", () => {
  it("keeps the 18 official facility rows with stable unique IDs", () => {
    expect(PRACTICAL_TEST_CENTERS).toHaveLength(18);
    expect(new Set(PRACTICAL_TEST_CENTERS.map((center) => center.id)).size).toBe(
      18,
    );
    expect(
      new Set(PRACTICAL_TEST_CENTERS.map((center) => center.facilitySheetRow))
        .size,
    ).toBe(18);
    expect(PRACTICAL_TEST_CENTER_SOURCE.sourceFileSha256).toMatch(/^[A-F0-9]{64}$/);
  });

  it("adds 15 verified 2025 venue histories and keeps six candidates separate", () => {
    expect(PRACTICAL_2025_HISTORY_CENTERS).toHaveLength(15);
    expect(PRACTICAL_MAIN_TEST_CENTERS).toHaveLength(33);
    expect(PRACTICAL_HISTORICAL_CANDIDATE_CENTERS).toHaveLength(6);
    expect(new Set(PRACTICAL_MAIN_TEST_CENTERS.map((center) => center.id)).size).toBe(
      33,
    );
    expect(
      PRACTICAL_2025_HISTORY_CENTERS.every(
        (center) => center.evidenceKind === "exam_history_2025",
      ),
    ).toBe(true);
  });

  it("resolves only explicitly normalized equipment models", () => {
    for (const center of PRACTICAL_TEST_CENTERS) {
      expect(center.rawFacilityNote.trim().length, center.id).toBeGreaterThan(0);
      for (const modelId of center.equipmentModelIds) {
        expect(
          practicalEquipmentModelsById.has(modelId),
          `${center.id} missing ${modelId}`,
        ).toBe(true);
      }
    }
  });

  it("keeps user-reported supply guidance separate from official facility-sheet notes", () => {
    const busan = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "busan-technical-high",
    );
    const paju = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "gyeonggi-kcci",
    );
    const seongnam = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "seongnam-kopo-nuri",
    );

    expect(
      PRACTICAL_TEST_CENTERS.filter((center) => center.candidateSupplyGuidance),
    ).toHaveLength(3);
    expect(busan?.suppliedMaterialNote).toBeNull();
    expect(paju?.suppliedMaterialNote).toBeNull();
    expect(seongnam?.suppliedMaterialNote).toBeNull();
    expect(busan?.candidateSupplyGuidance).toMatchObject({
      weldingPpeProvision: "not_provided",
      otherSuppliesProvision: "provided",
      personalBringGuidance: "welding_ppe_required",
      sourceKind: "user_report",
      reportedAt: "2026-07-28",
    });
    expect(paju?.candidateSupplyGuidance).toEqual(
      busan?.candidateSupplyGuidance,
    );
    expect(seongnam?.candidateSupplyGuidance).toMatchObject({
      weldingPpeProvision: "not_provided",
      otherSuppliesProvision: "provided",
      personalBringGuidance:
        "welding_ppe_required_other_items_recommended",
      sourceKind: "user_report",
      reportedAt: "2026-07-28",
    });
  });

  it("does not guess unpublished V-AMT equivalence and preserves explicit parking limits", () => {
    const seongnam = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "seongnam-kopo-nuri",
    );
    const seoul = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "seoul-north-tech",
    );

    expect(seongnam).toBeDefined();
    expect(seoul).toBeDefined();
    expect(getPracticalCenterComparison(seongnam!).pneumatic.label).toBe(
      "일부 다름",
    );
    expect(getPracticalCenterComparison(seoul!).pneumatic.label).toBe(
      "미확인",
    );
    expect(getPracticalCenterComparison(seoul!).parking.label).toBe(
      "주차불가",
    );
  });

  it("keeps raw facility labels while storing normalized welding models separately", () => {
    const cw3m = practicalEquipmentModelsById.get("cnw-cw-3m");
    const cat3m = practicalEquipmentModelsById.get("cnw-cw-cat3m");
    const yeongju = practicalEquipmentModelsById.get(
      "postech-weltop-unknown-300a",
    );
    const gumi = practicalEquipmentModelsById.get("postech-ac300a");

    expect(cw3m?.welding).toMatchObject({
      rawModelName: "CW-3M",
      normalizedModelName: "CW-CTA3M",
      normalizationStatus: "probable_alias",
      outputCurrentType: "ac",
      outputVerification: "probable",
    });
    expect(cat3m?.welding).toMatchObject({
      rawModelName: "CW-CAT3M",
      normalizedModelName: "CW-CTA3M",
      normalizationStatus: "probable_transcription_error",
      outputCurrentType: "ac",
      outputVerification: "probable",
    });
    expect(yeongju?.welding).toMatchObject({
      normalizedModelName: null,
      outputCurrentType: "unknown",
      outputVerification: "unknown",
    });
    expect(gumi?.welding).toMatchObject({
      normalizedModelName: "AC300A",
      outputCurrentType: "ac",
      outputVerification: "confirmed",
    });
  });

  it("does not overstate probable welding models as confirmed", () => {
    const suncheon = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "jeonnam-suncheon-kopo",
    );
    const yeongju = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "gyeongbuk-yeongju-kopo",
    );
    const gumi = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "gumi-kopo-nuri",
    );
    const gyeonggi = PRACTICAL_TEST_CENTERS.find(
      (center) => center.id === "gyeonggi-kcci",
    );

    expect(getPracticalCenterComparison(suncheon!).welding).toMatchObject({
      status: "needs_check",
      label: "교류 유력",
    });
    expect(getPracticalCenterComparison(yeongju!).welding).toMatchObject({
      status: "needs_check",
      label: "현장 확인",
    });
    expect(getPracticalCenterComparison(gumi!).welding).toMatchObject({
      status: "ac",
      label: "교류",
    });
    expect(getPracticalCenterComparison(gyeonggi!).welding).toMatchObject({
      status: "ac",
      label: "교류 확인·일부 유력",
    });
  });
});
