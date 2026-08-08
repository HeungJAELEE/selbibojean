import { copyFile, mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

type ReviewItem = {
  id: string;
  outputFile: string;
  technicalReviewStatus: "verified" | "held";
  rightsStatus: string;
  altText: string;
  linkedContentIds: string[];
};

const repoRoot = resolve(import.meta.dirname, "..");
const stagingRoot = join(repoRoot, "work", "visual-staging");
const publicRoot = join(repoRoot, "public", "practical", "visuals");
const verification = JSON.parse(
  await readFile(join(stagingRoot, "verification.json"), "utf8"),
) as { results: Array<{ id: string; status: "verified" }> };
const reviews = JSON.parse(
  await readFile(join(stagingRoot, "reviews.json"), "utf8"),
) as { items: ReviewItem[] };
const verifiedIds = new Set(verification.results.map((item) => item.id));

await mkdir(publicRoot, { recursive: true });
for (const review of reviews.items) {
  if (
    review.technicalReviewStatus !== "verified" ||
    !verifiedIds.has(review.id) ||
    !review.rightsStatus ||
    !review.altText.trim() ||
    review.linkedContentIds.length === 0
  ) {
    throw new Error(`promote 조건 미충족: ${review.id}`);
  }
  await copyFile(
    join(stagingRoot, review.outputFile),
    join(publicRoot, review.outputFile),
  );
}

console.log(`${reviews.items.length}개 검수 완료 자산을 public에 반영했습니다.`);
