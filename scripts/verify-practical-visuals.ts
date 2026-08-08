import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { PRACTICAL_VISUAL_CROP_SPECS } from "../src/data/source/practical-visual-crop-specs";

const repoRoot = resolve(import.meta.dirname, "..");
const stagingRoot = join(repoRoot, "work", "visual-staging");
const sha256 = (buffer: Buffer) =>
  createHash("sha256").update(buffer).digest("hex");

await mkdir(stagingRoot, { recursive: true });
const files = await readdir(stagingRoot).catch(() => []);
const metadataFiles = files.filter((file) => file.endsWith(".metadata.json"));
const specById = new Map(
  PRACTICAL_VISUAL_CROP_SPECS.map((spec) => [spec.id, spec]),
);
const results: Array<{ id: string; status: "verified"; outputAssetHash: string }> =
  [];

for (const metadataFile of metadataFiles) {
  const metadata = JSON.parse(
    await readFile(join(stagingRoot, metadataFile), "utf8"),
  ) as {
    id: string;
    sourcePdfSha256: string;
    pageRotation: number;
    outputFile: string;
    outputAssetHash: string;
  };
  const spec = specById.get(metadata.id);
  if (!spec) throw new Error(`명세에 없는 staging 자산: ${metadata.id}`);
  if (
    metadata.sourcePdfSha256 !== spec.sourcePdfSha256 ||
    metadata.pageRotation !== spec.pageRotation
  ) {
    throw new Error(`원본 계약 불일치: ${metadata.id}`);
  }
  const outputBuffer = await readFile(join(stagingRoot, metadata.outputFile));
  const outputAssetHash = sha256(outputBuffer);
  if (outputAssetHash !== metadata.outputAssetHash) {
    throw new Error(`staging 출력 해시 불일치: ${metadata.id}`);
  }
  results.push({ id: metadata.id, status: "verified", outputAssetHash });
}

await writeFile(
  join(stagingRoot, "verification.json"),
  `${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`,
  "utf8",
);
console.log(`${results.length}개 staging 자산의 원본·출력 해시를 검증했습니다.`);
