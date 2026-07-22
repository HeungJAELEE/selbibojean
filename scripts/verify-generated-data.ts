import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedContent } from "../src/lib/domain/types";
import { isPublishableQuestion } from "../src/lib/domain/practice";

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "generated", "content.json");
  const data = JSON.parse(await readFile(filePath, "utf8")) as GeneratedContent;
  const errors: string[] = [];
  if (!data.report.exactMatch) errors.push("엑셀 기준 수량 대사가 일치하지 않습니다.");
  if (data.conceptGroups.length !== 44) errors.push(`세부항목군이 44개가 아닙니다: ${data.conceptGroups.length}`);
  if (new Set(data.questions.map((question) => question.id)).size !== data.questions.length) errors.push("문제 ID가 중복됩니다.");
  if (new Set(data.lessons.map((lesson) => lesson.id)).size !== data.lessons.length) errors.push("레슨 ID가 중복됩니다.");
  if (data.variants.length !== data.report.rows.originals) errors.push(`원문 변형문제 수가 다릅니다: ${data.variants.length}`);
  if (data.variants.some((variant) => !variant.canonicalId)) errors.push("대표문제 연결이 없는 원문 변형문제가 있습니다.");

  const invalidPublished = data.questions.filter(
    (question) => question.contentStatus === "published" && !isPublishableQuestion(question),
  );
  if (invalidPublished.length) errors.push(`공개 조건 미충족 문제가 ${invalidPublished.length}개 있습니다.`);

  const lessonIds = new Set(data.lessons.map((lesson) => lesson.id));
  const brokenLinks = data.questions.filter((question) => !lessonIds.has(question.lessonId));
  if (brokenLinks.length) errors.push(`이론 연결이 끊긴 문제가 ${brokenLinks.length}개 있습니다.`);

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL: ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(
    `PASS: 원문 ${data.report.rows.originals}, 대표 ${data.report.rows.canonicalQuestions}, 매핑 ${data.report.rows.mappings}, 잔여 ${data.report.rows.backlog}, 44개 세부항목군, 공개 문제 ${data.report.publishedQuestionCount}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
