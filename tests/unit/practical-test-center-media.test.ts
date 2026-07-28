import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRACTICAL_TEST_CENTER_MEDIA_GROUPS,
  practicalTestCenterMediaByCenter,
} from "@/data/source/practical-test-center-media";
import { practicalTestCentersById } from "@/data/source/practical-test-centers";

describe("practical test center media catalog", () => {
  it("maps all 17 user-provided photos to three known test centers", () => {
    expect(PRACTICAL_TEST_CENTER_MEDIA_GROUPS).toHaveLength(3);
    expect(practicalTestCenterMediaByCenter.get("incheon-kopo-industry")?.items).toHaveLength(
      9,
    );
    expect(practicalTestCenterMediaByCenter.get("jeonnam-suncheon-kopo")?.items).toHaveLength(
      7,
    );
    expect(practicalTestCenterMediaByCenter.get("ulsan-kopo")?.items).toHaveLength(
      1,
    );

    for (const group of PRACTICAL_TEST_CENTER_MEDIA_GROUPS) {
      expect(practicalTestCentersById.has(group.centerId), group.centerId).toBe(
        true,
      );
      expect(group.sourceLabel).toBe("사용자 제공 현장 사진");
      expect(group.receivedAt).toMatch(/^2026-07-(27|28)$/);
    }
    expect(
      practicalTestCenterMediaByCenter.get("incheon-kopo-industry")?.receivedAt,
    ).toBe("2026-07-28");
  });

  it("keeps IDs and public media paths unique and backed by real files", () => {
    const items = PRACTICAL_TEST_CENTER_MEDIA_GROUPS.flatMap(
      (group) => group.items,
    );
    const ids = items.map((item) => item.id);
    const paths = items.flatMap((item) =>
      item.fullSrc ? [item.src, item.fullSrc] : [item.src],
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);

    for (const publicPath of paths) {
      expect(publicPath).toMatch(/^\/practical\/test-centers\//);
      expect(
        fs.existsSync(
          path.join(process.cwd(), "public", publicPath.replace(/^\//, "")),
        ),
        publicPath,
      ).toBe(true);
    }
  });

  it("links the Incheon facility article without treating it as the photo owner", () => {
    const incheon = practicalTestCenterMediaByCenter.get(
      "incheon-kopo-industry",
    );

    expect(incheon?.sourceUrl).toContain(
      "cafe.naver.com/f-e/cafes/29094056/articles/14301",
    );
    expect(incheon?.sourceLabel).toBe("사용자 제공 현장 사진");
    expect(incheon?.items.at(-1)).toMatchObject({
      id: "incheon-kt-300ac-welder",
      width: 1600,
      height: 1578,
      category: "welding",
    });
  });

  it("preserves the Ulsan photo and facility-sheet model conflict", () => {
    const ulsan = practicalTestCenterMediaByCenter.get("ulsan-kopo");
    const note = ulsan?.items[0]?.evidenceNote ?? "";

    expect(ulsan?.items[0]?.caption).toContain("KT-300AC");
    expect(note).toContain("CW-WA300E");
    expect(note).toContain("분리해 표시");
  });
});
