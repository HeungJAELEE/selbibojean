import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { practicalTestCenterMediaByCenter } from "@/data/source/practical-test-center-media";
import { practicalTestCentersById } from "@/data/source/practical-test-centers";

const centerId = "busan-kopo-facility-energy-lab";
const privateMediaRoot = path.join(
  process.cwd(),
  "assets",
  "private",
  "practical",
  "test-centers",
  "busan-kopo",
);

type ManifestAsset = {
  id: string;
  file: string;
  width: number;
  height: number;
  sha256: string;
};

const manifest = JSON.parse(
  fs.readFileSync(path.join(privateMediaRoot, "media-manifest.json"), "utf8"),
) as { assets: ManifestAsset[] };

describe("Busan KOPO privacy-reviewed media", () => {
  it("connects only the stable Busan KOPO center ID", () => {
    const group = practicalTestCenterMediaByCenter.get(centerId);

    expect(practicalTestCentersById.has(centerId)).toBe(true);
    expect(group?.centerId).toBe(centerId);
    expect(group?.items.map((item) => item.id)).toEqual(
      manifest.assets.map((asset) => asset.id),
    );
    expect(group?.items).toHaveLength(7);
  });

  it("keeps generated files dimension- and hash-locked without EXIF or XMP", async () => {
    for (const asset of manifest.assets) {
      const buffer = fs.readFileSync(path.join(privateMediaRoot, asset.file));
      const metadata = await sharp(buffer).metadata();

      expect(metadata.width).toBe(asset.width);
      expect(metadata.height).toBe(asset.height);
      expect(metadata.exif).toBeUndefined();
      expect(metadata.xmp).toBeUndefined();
      expect(createHash("sha256").update(buffer).digest("hex")).toBe(
        asset.sha256,
      );
    }
  });

  it("uses two bounded sign crops instead of the privacy-unsafe original", () => {
    const group = practicalTestCenterMediaByCenter.get(centerId);
    const signItems = group?.items.slice(0, 2) ?? [];

    expect(signItems.map((item) => item.src)).toEqual([
      "/practical/test-centers/busan-kopo/facility-room-sign.webp",
      "/practical/test-centers/busan-kopo/practical-test-site-sign.webp",
    ]);
    expect(signItems.every((item) => item.evidenceNote?.includes("원본"))).toBe(
      true,
    );
  });

  it("keeps gated files outside public until an approved release build", () => {
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          "public",
          "practical",
          "test-centers",
          "busan-kopo",
        ),
      ),
    ).toBe(false);
  });
});
