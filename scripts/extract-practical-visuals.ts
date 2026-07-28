import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { PRACTICAL_VISUAL_CROP_SPECS } from "../src/data/source/practical-visual-crop-specs";

const repoRoot = resolve(import.meta.dirname, "..");
const stagingRoot = join(repoRoot, "work", "visual-staging");
const sourceRoot = process.env.NCS_VISUAL_SOURCE_DIR;
const requestedIds = new Set(
  (process.env.PRACTICAL_VISUAL_CROP_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);
const cropSpecs =
  requestedIds.size === 0
    ? PRACTICAL_VISUAL_CROP_SPECS
    : PRACTICAL_VISUAL_CROP_SPECS.filter((spec) => requestedIds.has(spec.id));

const sha256 = (buffer: Buffer) =>
  createHash("sha256").update(buffer).digest("hex");

const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `${command} 실패: ${result.stderr || result.stdout || "출력 없음"}`,
    );
  }
  return result.stdout;
};

await mkdir(stagingRoot, { recursive: true });

if (cropSpecs.length === 0) {
  console.log("등록된 신규 PDF 크롭 명세가 없습니다. public/ 변경 없음.");
  process.exit(0);
}

if (!sourceRoot) {
  throw new Error(
    "NCS_VISUAL_SOURCE_DIR가 필요합니다. 원본 PDF는 저장소 밖에 둡니다.",
  );
}

const ids = new Set<string>();
for (const spec of cropSpecs) {
  if (ids.has(spec.id)) throw new Error(`중복 크롭 ID: ${spec.id}`);
  ids.add(spec.id);
  if (spec.outputFormat === "svg") {
    throw new Error(`PDF 크롭은 SVG로 추출하지 않습니다: ${spec.id}`);
  }

  const sourcePdf = join(sourceRoot, `${spec.sourcePdfId}.pdf`);
  const sourceBuffer = await readFile(sourcePdf);
  const sourceHash = sha256(sourceBuffer);
  if (sourceHash !== spec.sourcePdfSha256) {
    throw new Error(`원본 PDF SHA-256 불일치: ${spec.id}`);
  }

  const info = run("pdfinfo", [
    "-f",
    String(spec.pdfPage),
    "-l",
    String(spec.pdfPage),
    sourcePdf,
  ]);
  const rotation = Number(info.match(/rot:\s+(\d+)/i)?.[1] ?? 0);
  if (rotation !== spec.pageRotation) {
    throw new Error(
      `페이지 회전 불일치: ${spec.id}, expected=${spec.pageRotation}, actual=${rotation}`,
    );
  }

  const pagePrefix = join(stagingRoot, `${spec.id}-source-page`);
  run("pdftoppm", [
    "-f",
    String(spec.pdfPage),
    "-l",
    String(spec.pdfPage),
    "-singlefile",
    "-r",
    String(spec.renderDpi),
    "-png",
    sourcePdf,
    pagePrefix,
  ]);

  const pagePath = `${pagePrefix}.png`;
  const image = sharp(pagePath);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`렌더 페이지 크기 확인 실패: ${spec.id}`);
  }

  const left = Math.round(metadata.width * spec.crop.x);
  const top = Math.round(metadata.height * spec.crop.y);
  const width = Math.round(metadata.width * spec.crop.width);
  const height = Math.round(metadata.height * spec.crop.height);
  if (
    left < 0 ||
    top < 0 ||
    width <= 0 ||
    height <= 0 ||
    left + width > metadata.width ||
    top + height > metadata.height
  ) {
    throw new Error(`정규화 크롭 좌표가 페이지 범위를 벗어남: ${spec.id}`);
  }

  const extension = spec.outputFormat;
  const outputPath = join(stagingRoot, `${spec.id}.${extension}`);
  const cropped = image.extract({ left, top, width, height });
  const outputBuffer =
    extension === "webp"
      ? await cropped.webp({ lossless: true }).toBuffer()
      : await cropped.png().toBuffer();
  await writeFile(outputPath, outputBuffer);
  await writeFile(
    join(stagingRoot, `${spec.id}.metadata.json`),
    `${JSON.stringify(
      {
        ...spec,
        sourcePdf: basename(sourcePdf),
        sourcePdfSha256: sourceHash,
        renderedPageSize: { width: metadata.width, height: metadata.height },
        outputFile: basename(outputPath),
        outputAssetHash: sha256(outputBuffer),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

console.log(
  `${cropSpecs.length}개 후보를 work/visual-staging에 추출했습니다.`,
);
