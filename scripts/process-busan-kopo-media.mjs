import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const repoRoot = resolve(import.meta.dirname, "..");
const sourceRoot =
  process.env.BUSAN_KOPO_MEDIA_SOURCE_DIR ??
  "C:\\Users\\JaeheungLee\\OneDrive\\문서\\카카오톡 받은 파일\\설비보전기사";
const outputRoot = join(
  repoRoot,
  "assets",
  "private",
  "practical",
  "test-centers",
  "busan-kopo",
);

const source = (name) => join(sourceRoot, name);
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

// The first photo contains a person and a candidate roster. Only these two
// bounded sign crops are allowed; the original and any wider crop stay outside
// the repository.
const assets = [
  {
    id: "busan-kopo-facility-room-sign",
    source: source("KakaoTalk_20260801_075945669.jpg"),
    output: "facility-room-sign.webp",
    crop: { left: 45, top: 105, width: 165, height: 190 },
    review: "cropped sign only; excludes person and candidate roster",
  },
  {
    id: "busan-kopo-practical-test-site-sign",
    source: source("KakaoTalk_20260801_075945669.jpg"),
    output: "practical-test-site-sign.webp",
    crop: { left: 680, top: 570, width: 370, height: 330 },
    review: "cropped sign only; excludes person and candidate roster",
  },
  {
    id: "busan-kopo-pneumatic-training-room-overview",
    source: source("KakaoTalk_20260801_075945669_01.jpg"),
    output: "pneumatic-training-room-overview.webp",
    review: "reviewed: no person, roster, document, monitor, or identifying reflection",
  },
  {
    id: "busan-kopo-electropneumatic-training-bench-front",
    source: source("KakaoTalk_20260801_075945669_02.jpg"),
    output: "electropneumatic-training-bench-front.webp",
    review: "reviewed: no person, roster, document, monitor, or identifying reflection",
  },
  {
    id: "busan-kopo-electropneumatic-training-bench-angle",
    source: source("KakaoTalk_20260801_075945669_03.jpg"),
    output: "electropneumatic-training-bench-angle.webp",
    review: "reviewed: no person, roster, document, monitor, or identifying reflection",
  },
  {
    id: "busan-kopo-electropneumatic-training-benches-overview",
    source: source("KakaoTalk_20260801_080035379.jpg"),
    output: "electropneumatic-training-benches-overview.webp",
    review: "reviewed: no person, roster, document, monitor, or identifying reflection",
  },
  {
    id: "busan-kopo-electropneumatic-training-bench-wide",
    source: source("KakaoTalk_20260801_080035379_02.jpg"),
    output: "electropneumatic-training-bench-wide.webp",
    review: "reviewed: no person, roster, document, monitor, or identifying reflection",
  },
];

await mkdir(outputRoot, { recursive: true });

const manifest = [];
for (const asset of assets) {
  const sourceBuffer = await readFile(asset.source);
  let image = sharp(sourceBuffer, { failOn: "error" }).rotate();
  if (asset.crop) image = image.extract(asset.crop);

  // Re-encoding from pixels strips EXIF/XMP and does not preserve source metadata.
  const outputBuffer = await image.webp({ quality: 88, effort: 6 }).toBuffer();
  const outputPath = join(outputRoot, asset.output);
  await writeFile(outputPath, outputBuffer);
  const metadata = await sharp(outputBuffer).metadata();

  if (!metadata.width || !metadata.height || metadata.exif || metadata.xmp) {
    throw new Error(`Unsafe or invalid output metadata: ${asset.output}`);
  }

  manifest.push({
    id: asset.id,
    file: asset.output,
    width: metadata.width,
    height: metadata.height,
    sha256: sha256(outputBuffer),
    review: asset.review,
  });
}

await writeFile(
  join(outputRoot, "media-manifest.json"),
  `${JSON.stringify({ generatedBy: "process-busan-kopo-media.mjs", assets: manifest }, null, 2)}\n`,
  "utf8",
);

console.log(`Processed ${manifest.length} privacy-reviewed Busan KOPO assets.`);
