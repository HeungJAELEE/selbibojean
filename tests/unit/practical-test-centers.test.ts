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

  it("keeps raw facility labels while storing normalized welding models separately", () => {
    const cw3m = practicalEquipmentModelsById.get("cnw-cw-3m");
    const cat3m = practicalEquipmentModelsById.get("cnw-cw-cat3m");
    const yeongju = practicalEquipmentModelsById.get(
      "postech-weltop-acdc300a",
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
      outputVerification: "confirmed",
    });
    expect(yeongju?.welding).toMatchObject({
      normalizedModelName: "WELTOP-ACDC300A",
      outputCurrentType: "ac_dc",
      outputVerification: "probable",
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
      label: "교류·직류 유력",
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
