import { describe, expect, it } from "vitest";

import {
  getHistoricalPracticalTrainingResources,
  getPublicPracticalTrainingResources,
  PRACTICAL_TRAINING_RESOURCES,
} from "@/data/source/practical-training-resources";

describe("practical training resources", () => {
  it("publishes only independently verified official HTTPS pages", () => {
    const publicResources = getPublicPracticalTrainingResources("2026-07-28");

    expect(publicResources.map((resource) => resource.id)).toEqual([
      "qnet-public-practical-problems",
      "kopo-dream-workshop",
      "kopo-jungsu-incumbent-training",
      "jeonbuk-korcham-welding-practice-2026",
    ]);
    for (const resource of publicResources) {
      const url = new URL(resource.url);
      expect(url.protocol).toBe("https:");
      expect(
        url.hostname.endsWith("q-net.or.kr") ||
          url.hostname.endsWith("kopo.ac.kr") ||
          url.hostname.endsWith("korchamhrd.net"),
      ).toBe(true);
      expect(resource.verifiedAt).toBe("2026-07-28");
      expect(resource.region.trim()).not.toBe("");
      expect(resource.locationNote).toContain("참고");
    }
  });

  it("publishes an ended official course only through the historical selector", () => {
    const asanHistory = PRACTICAL_TRAINING_RESOURCES.find(
      (resource) =>
        resource.id === "asan-kopo-seolbi-welding-2026-history",
    );

    expect(asanHistory).toMatchObject({
      publicationStatus: "public",
      listingStatus: "historical",
      region: "충남",
      validThrough: "2026-07-05",
    });
    expect(
      getPublicPracticalTrainingResources("2026-07-28").some(
        (resource) =>
          resource.id === "asan-kopo-seolbi-welding-2026-history",
      ),
    ).toBe(false);
    expect(
      getHistoricalPracticalTrainingResources("2026-07-28").map(
        (resource) => resource.id,
      ),
    ).toEqual(["asan-kopo-seolbi-welding-2026-history"]);
  });

  it("moves a time-limited course from current to historical deterministically", () => {
    expect(
      getPublicPracticalTrainingResources("2026-10-18").some(
        (resource) =>
          resource.id === "jeonbuk-korcham-welding-practice-2026",
      ),
    ).toBe(true);
    expect(
      getPublicPracticalTrainingResources("2026-10-19").some(
        (resource) =>
          resource.id === "jeonbuk-korcham-welding-practice-2026",
      ),
    ).toBe(false);
    expect(
      getHistoricalPracticalTrainingResources("2026-10-19").map(
        (resource) => resource.id,
      ),
    ).toEqual([
      "jeonbuk-korcham-welding-practice-2026",
      "asan-kopo-seolbi-welding-2026-history",
    ]);
    expect(() => getPublicPracticalTrainingResources("2026/10/19")).toThrow(
      "YYYY-MM-DD",
    );
    expect(() =>
      getHistoricalPracticalTrainingResources("2026/10/19"),
    ).toThrow("YYYY-MM-DD");
  });
});
