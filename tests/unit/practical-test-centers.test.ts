import { describe, expect, it } from "vitest";
import {
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
});
