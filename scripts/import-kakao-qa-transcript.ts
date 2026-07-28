import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildKakaoQaReviewDataset,
  parseKakaoQaTranscript,
  renderKakaoQaReviewMarkdown,
} from "../src/lib/content/kakao-qa-transcript";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const OUTPUT_DIRECTORY = path.join(process.cwd(), "data", "private");
const JSON_OUTPUT = path.join(OUTPUT_DIRECTORY, "kakao-qa-review.json");
const MARKDOWN_OUTPUT = path.join(OUTPUT_DIRECTORY, "kakao-qa-review.md");

async function main() {
  const sourceArgument =
    process.argv[2] || process.env.KAKAO_QA_TRANSCRIPT_PATH;
  if (!sourceArgument) {
    throw new Error(
      "카카오톡 TXT 경로가 필요합니다. 인자 또는 KAKAO_QA_TRANSCRIPT_PATH를 지정하세요.",
    );
  }

  const sourcePath = path.resolve(sourceArgument);
  if (path.extname(sourcePath).toLowerCase() !== ".txt") {
    throw new Error("카카오톡 원본은 .txt 파일만 허용합니다.");
  }
  const sourceBuffer = await readFile(sourcePath);
  if (sourceBuffer.byteLength === 0 || sourceBuffer.byteLength > MAX_SOURCE_BYTES) {
    throw new Error(
      `원본 크기는 1바이트 이상 ${MAX_SOURCE_BYTES.toLocaleString("ko-KR")}바이트 이하여야 합니다.`,
    );
  }

  const transcript = parseKakaoQaTranscript(sourceBuffer.toString("utf8"));
  const dataset = buildKakaoQaReviewDataset({
    transcript,
    sourceFile: path.basename(sourcePath),
    sourceSha256: createHash("sha256").update(sourceBuffer).digest("hex"),
  });

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(JSON_OUTPUT, `${JSON.stringify(dataset, null, 2)}\n`, "utf8"),
    writeFile(MARKDOWN_OUTPUT, renderKakaoQaReviewMarkdown(dataset), "utf8"),
  ]);

  console.log(`비공개 Q&A 검토 큐 생성: ${JSON_OUTPUT}`);
  console.log(`검토 요약 생성: ${MARKDOWN_OUTPUT}`);
  console.log(
    [
      `메시지 ${dataset.summary.parsedMessageCount.toLocaleString("ko-KR")}건`,
      `후보 ${dataset.summary.candidateCount.toLocaleString("ko-KR")}건`,
      `첨부 누락 ${dataset.summary.attachmentPlaceholderCount.toLocaleString("ko-KR")}건`,
      `고유 링크 ${dataset.summary.uniqueExternalLinkCount.toLocaleString("ko-KR")}건`,
      "즉시 공개 0건",
    ].join(" · "),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
