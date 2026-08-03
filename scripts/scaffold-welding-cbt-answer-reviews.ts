import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PART_COUNT = 19;
const SOURCE_PATH = path.resolve(
  process.cwd(),
  "src/data/source/welding-cbt-lesson-projection.json",
);
const OUTPUT_DIRECTORY = path.resolve(
  process.cwd(),
  "src/data/source/welding-cbt-answer-reviews",
);

type ProjectionEntry = {
  canonicalId: string;
  contentDigest: string;
};

type ExistingReview = {
  authoringDisposition?: unknown;
  reviewStatus?: unknown;
  conceptBinding?: unknown;
  answerExplanation?: unknown;
  solutionSteps?: unknown;
  keyRule?: unknown;
  choiceFeedback?: unknown;
  essentialRank?: unknown;
  essentialRationale?: unknown;
  holdReasons?: unknown;
  author?: unknown;
  authoredAt?: unknown;
  reviewer?: unknown;
  reviewedAt?: unknown;
};

function partLabel(partNumber: number) {
  return String(partNumber).padStart(2, "0");
}

function exportName(partNumber: number) {
  return `WELDING_CBT_ANSWER_REVIEWS_PART_${partLabel(partNumber)}`;
}

function partitionRange(total: number, partIndex: number) {
  const baseSize = Math.floor(total / PART_COUNT);
  const remainder = total % PART_COUNT;
  const start = partIndex * baseSize + Math.min(partIndex, remainder);
  const size = baseSize + (partIndex < remainder ? 1 : 0);
  return { start, size };
}

function pendingReview(entry: ProjectionEntry) {
  return {
    canonicalId: entry.canonicalId,
    contentDigest: entry.contentDigest,
    authoringDisposition: "pending",
    reviewStatus: "pending",
    assessmentKind: "application",
    primaryLeafLessonId: null,
    conceptBinding: null,
    answerExplanation: null,
    solutionSteps: [],
    keyRule: null,
    choiceFeedback: null,
    essentialRank: null,
    essentialRationale: null,
    holdReasons: [],
    author: null,
    authoredAt: null,
    reviewer: null,
    reviewedAt: null,
  };
}

function isPristinePending(review: ExistingReview) {
  return (
    (
      review.authoringDisposition === undefined
      || review.authoringDisposition === "pending"
    )
    &&
    review.reviewStatus === "pending"
    && review.conceptBinding === null
    && review.answerExplanation === null
    && Array.isArray(review.solutionSteps)
    && review.solutionSteps.length === 0
    && review.keyRule === null
    && review.choiceFeedback === null
    && review.essentialRank === null
    && review.essentialRationale === null
    && Array.isArray(review.holdReasons)
    && review.holdReasons.length === 0
    && review.author === null
    && review.authoredAt === null
    && review.reviewer === null
    && review.reviewedAt === null
  );
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function assertSafeToOverwrite(
  filePath: string,
  partNumber: number,
  force: boolean,
) {
  if (!(await fileExists(filePath))) return;

  if (!force) {
    throw new Error(`SCAFFOLD_TARGET_EXISTS part=${partLabel(partNumber)}`);
  }

  const moduleUrl = `${pathToFileURL(filePath).href}?safety=${Date.now()}`;
  const existingModule = await import(moduleUrl) as Record<string, unknown>;
  const existingReviews = existingModule[exportName(partNumber)];
  if (
    !Array.isArray(existingReviews)
    || existingReviews.some((review) => !isPristinePending(review))
  ) {
    throw new Error(
      `SCAFFOLD_AUTHORED_TARGET_REFUSED part=${partLabel(partNumber)}`,
    );
  }
}

function renderPart(partNumber: number, entries: readonly ProjectionEntry[]) {
  const reviews = entries.map(pendingReview);
  return [
    `export const ${exportName(partNumber)} = `,
    `${JSON.stringify(reviews, null, 2)} as const;\n`,
  ].join("");
}

async function main() {
  const force = process.argv.includes("--force");
  const dryRun = process.argv.includes("--dry-run");
  const source = JSON.parse(
    await readFile(SOURCE_PATH, "utf8"),
  ) as { entries: ProjectionEntry[] };
  const entries = [...source.entries].sort((left, right) =>
    left.canonicalId.localeCompare(right.canonicalId)
  );

  if (entries.length !== 525) {
    throw new Error(
      `SCAFFOLD_SOURCE_COUNT_MISMATCH expected=525 actual=${entries.length}`,
    );
  }

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const plannedFiles: string[] = [];
  for (let partIndex = 0; partIndex < PART_COUNT; partIndex += 1) {
    const partNumber = partIndex + 1;
    const targetPath = path.join(
      OUTPUT_DIRECTORY,
      `part-${partLabel(partNumber)}.ts`,
    );
    const { start, size } = partitionRange(entries.length, partIndex);
    const partEntries = entries.slice(start, start + size);
    await assertSafeToOverwrite(targetPath, partNumber, force);
    plannedFiles.push(path.relative(process.cwd(), targetPath));
    if (!dryRun) {
      await writeFile(
        targetPath,
        renderPart(partNumber, partEntries),
        "utf8",
      );
    }
  }

  console.log(
    JSON.stringify({
      ok: true,
      dryRun,
      force,
      entryCount: entries.length,
      partCount: PART_COUNT,
      files: plannedFiles,
    }),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ ok: false, code: message.split(" ")[0], message }));
  process.exit(1);
});
