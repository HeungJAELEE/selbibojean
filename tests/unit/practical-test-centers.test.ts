import { describe, expect, it } from "vitest";
import {
  getPracticalCenterComparison,
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
      "공개표 미기재",
    );
    expect(getPracticalCenterComparison(seoul!).parking.label).toBe(
      "주차불가",
    );
  });
});
