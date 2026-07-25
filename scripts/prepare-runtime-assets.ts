import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const privateOutputDirectory = path.join(process.cwd(), ".runtime-assets", "data");
const workerAssetDirectory = path.join(process.cwd(), "public", "data");
const sourceFile = path.join(process.cwd(), "src", "data", "generated", "content.json");
const outputDirectories = [privateOutputDirectory, workerAssetDirectory];

await Promise.all(
  outputDirectories.map(async (outputDirectory) => {
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });
  }),
);

const source = await readFile(sourceFile);

// Fail the build before emitting an asset when the canonical source is not valid JSON.
JSON.parse(source.toString("utf8"));

const compressed = gzipSync(source, { level: 9 });
const sourceSha256 = createHash("sha256").update(source).digest("hex");
const metadata = {
  formatVersion: 1,
  encoding: "gzip",
  sourceSha256,
  uncompressedBytes: source.byteLength,
  compressedBytes: compressed.byteLength,
} as const;

await Promise.all(
  outputDirectories.flatMap((outputDirectory) => [
    writeFile(path.join(outputDirectory, "content.bin"), compressed),
    writeFile(
      path.join(outputDirectory, "content.meta.json"),
      `${JSON.stringify(metadata)}\n`,
      "utf8",
    ),
  ]),
);

const ratio = ((compressed.byteLength / source.byteLength) * 100).toFixed(1);
console.log(
  `Prepared server-only learning content: ${source.byteLength} bytes -> ${compressed.byteLength} gzip bytes (${ratio}%).`,
);
console.log(
  "Runtime content staged for the internal ASSETS binding; the Worker blocks external /data requests.",
);
