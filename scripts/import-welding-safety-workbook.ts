import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { readSheet } from "read-excel-file/node";

import {
  buildWeldingSafetyReviewDataset,
  type WeldingSafetyRawRow,
} from "../src/lib/content/welding-safety-supplement";

const DEFAULT_SOURCE =
  path.join(homedir(), "Downloads", "설비보전기사_용접안전_전용문제은행_33차_전회차완료(1).xlsx");
const DEFAULT_REPORT =
  path.join(homedir(), "Downloads", "설비보전기사_용접안전_전용문제은행_33차_전회차완료_보고서.md");
const QUESTION_SHEET = "안전문제_통합_283";
const LESSON_SHEET = "안전이론_레슨_30";
const REVIEW_SHEET = "검수대기_150";
const ROUND_SHEET = "CBT_전회차_완료현황";
const OUTPUT = path.join(
  process.cwd(),
  "src",
  "data",
  "generated",
  "welding-safety-review.json",
);

type CellValue = string | number | boolean | Date | null;

function toPrimitive(value: CellValue): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function rowsToRecords(sheetRows: CellValue[][]): WeldingSafetyRawRow[] {
  const headers = (sheetRows[0] ?? []).map((value) => String(toPrimitive(value) ?? "").trim());
  return sheetRows.slice(1).flatMap((row) => {
    const record: WeldingSafetyRawRow = {};
    let hasValue = false;
    headers.forEach((header, column) => {
      if (!header) return;
      const value = toPrimitive(row[column] ?? null);
      record[header] = value;
      if (value !== null && value !== "") hasValue = true;
    });
    return hasValue ? [record] : [];
  });
}

function assertReportMetric(report: string, label: string, expected: number) {
  const line = report
    .split(/\r?\n/)
    .find((candidate) => candidate.includes(`| ${label} |`));
  const actual = line ? Number(line.match(/\|\s*([0-9,]+)\s*\|\s*$/)?.[1].replaceAll(",", "")) : NaN;
  if (actual !== expected) {
    throw new Error(`33차 보고서 수량 불일치: ${label} ${String(actual)}/${expected}`);
  }
}

async function main() {
  const sourcePath = path.resolve(process.argv[2] || process.env.WELDING_SAFETY_WORKBOOK_PATH || DEFAULT_SOURCE);
  const reportPath = path.resolve(
    process.argv[3] || process.env.WELDING_SAFETY_REPORT_PATH || DEFAULT_REPORT,
  );
  let sourceBuffer: Buffer;
  let reportBuffer: Buffer;
  try {
    sourceBuffer = await readFile(sourcePath);
    reportBuffer = await readFile(reportPath);
  } catch {
    throw new Error(
      `33차 누적 원본 또는 보고서를 찾지 못했습니다.\n엑셀: ${sourcePath}\n보고서: ${reportPath}\n` +
        "파일을 첨부하거나 WELDING_SAFETY_WORKBOOK_PATH와 WELDING_SAFETY_REPORT_PATH를 지정하세요.",
    );
  }
  const reportText = reportBuffer.toString("utf8");
  assertReportMetric(reportText, "최종 통합 안전문항", 283);
  assertReportMetric(reportText, "등록 CBT 회차", 25);
  assertReportMetric(reportText, "검토완료 회차", 25);
  assertReportMetric(reportText, "안전 이론 레슨", 30);
  assertReportMetric(reportText, "누적 검수대기", 150);

  const [questionSheet, lessonSheet, reviewSheet, roundSheet] = await Promise.all([
    readSheet(sourceBuffer, QUESTION_SHEET),
    readSheet(sourceBuffer, LESSON_SHEET),
    readSheet(sourceBuffer, REVIEW_SHEET),
    readSheet(sourceBuffer, ROUND_SHEET),
  ]);
  const content = JSON.parse(
    await readFile(path.join(process.cwd(), "src", "data", "generated", "content.json"), "utf8"),
  ) as { questions?: Array<{ id: string; stem: string }> };
  const dataset = buildWeldingSafetyReviewDataset({
    questionRows: rowsToRecords(questionSheet as CellValue[][]),
    lessonRows: rowsToRecords(lessonSheet as CellValue[][]),
    reviewRows: rowsToRecords(reviewSheet as CellValue[][]),
    roundRows: rowsToRecords(roundSheet as CellValue[][]),
    existingQuestions: content.questions ?? [],
    sourceFile: path.basename(sourcePath),
    sourceSha256: createHash("sha256").update(sourceBuffer).digest("hex"),
    sourceReportFile: path.basename(reportPath),
    sourceReportSha256: createHash("sha256").update(reportBuffer).digest("hex"),
    questionSheet: QUESTION_SHEET,
    lessonSheet: LESSON_SHEET,
    reviewSheet: REVIEW_SHEET,
    roundSheet: ROUND_SHEET,
    generatedAt: new Date().toISOString(),
  });

  const { counts, expected } = dataset;
  if (
    counts.importedQuestions !== expected.questions ||
    counts.importedLessons !== expected.lessons ||
    counts.importedReviewQueueEntries !== expected.reviewQueueEntries ||
    counts.importedRounds !== expected.rounds ||
    counts.completedRounds !== expected.completedRounds ||
    counts.excludedRows > 0 ||
    counts.duplicateRows > 0 ||
    counts.invalidRows > 0
  ) {
    throw new Error(
      [
        "33차 누적 원본 대사가 일치하지 않아 출력하지 않았습니다.",
        `문제 ${counts.importedQuestions}/${expected.questions}`,
        `레슨 ${counts.importedLessons}/${expected.lessons}`,
        `검수대기 ${counts.importedReviewQueueEntries}/${expected.reviewQueueEntries}`,
        `회차 ${counts.completedRounds}/${expected.completedRounds}`,
        `제외 ${counts.excludedRows}, 중복 ${counts.duplicateRows}, 불완전 ${counts.invalidRows}`,
        ...dataset.warnings.slice(0, 10),
      ].join("\n"),
    );
  }

  await writeFile(OUTPUT, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`용접 안전 검수 큐 생성 완료: ${OUTPUT}`);
  console.log(
    `문제 ${counts.importedQuestions}개, 레슨 ${counts.importedLessons}개, ` +
      `검수대기 ${counts.importedReviewQueueEntries}개, 회차 ${counts.completedRounds}개 — 전부 공개 차단 상태`,
  );
  console.log(
    `기존 사이트 완전일치 후보 ${counts.siteDuplicateCandidates}개, ` +
      `현행검증 URL 누락 ${counts.missingAuthoritativeSources}개`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
