import "server-only";

import s1Current from "@/data/notion-raw/s1-current.json";
import s1Final from "@/data/notion-raw/s1-final.json";
import s1V1 from "@/data/notion-raw/s1-v1.json";
import s1V2 from "@/data/notion-raw/s1-v2.json";
import s1V3 from "@/data/notion-raw/s1-v3.json";
import s2Current from "@/data/notion-raw/s2-current.json";
import s2Final from "@/data/notion-raw/s2-final.json";
import s2V1 from "@/data/notion-raw/s2-v1.json";
import s2V2 from "@/data/notion-raw/s2-v2.json";
import s3Current from "@/data/notion-raw/s3-current.json";
import s3Final from "@/data/notion-raw/s3-final.json";
import s3V1 from "@/data/notion-raw/s3-v1.json";
import s3V2 from "@/data/notion-raw/s3-v2.json";
import s3V3 from "@/data/notion-raw/s3-v3.json";
import s3V4 from "@/data/notion-raw/s3-v4.json";
import s4Final from "@/data/notion-raw/s4-final.json";
import s4V1 from "@/data/notion-raw/s4-v1.json";

export type BdaNotionSnapshot = {
  id: string;
  notionId: string;
  title: string;
  sourceUrl: string;
  subjectId: "bda-s1" | "bda-s2" | "bda-s3" | "bda-s4";
  revision: "final" | "current" | "integration";
  contentLines: string[];
};

const snapshots = [
  s1Current,
  s1Final,
  s1V1,
  s1V2,
  s1V3,
  s2Current,
  s2Final,
  s2V1,
  s2V2,
  s3Current,
  s3Final,
  s3V1,
  s3V2,
  s3V3,
  s3V4,
  s4Final,
  s4V1,
] as BdaNotionSnapshot[];

export const bdaTextbookSubjects = [
  {
    id: "bda-s1",
    order: 1,
    title: "빅데이터 분석기획",
    description: "데이터·가치·거버넌스·분석기획·수집·저장·개인정보",
  },
  {
    id: "bda-s2",
    order: 2,
    title: "빅데이터 탐색",
    description: "전처리·EDA·표본·확률·추정·가설검정·회귀진단",
  },
  {
    id: "bda-s3",
    order: 3,
    title: "빅데이터 모델링",
    description: "회귀·분류·트리·SVM·신경망·앙상블·군집·시계열",
  },
  {
    id: "bda-s4",
    order: 4,
    title: "빅데이터 결과 해석",
    description: "평가지표·교차검증·최적화·설명가능성·시각화·배포",
  },
] as const;

function rawContent(snapshot: BdaNotionSnapshot) {
  return snapshot.contentLines.join("\n");
}

function stripHtml(text: string) {
  return text
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/<\/?[A-Za-z][^>\n]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeTableCell(text: string) {
  return stripHtml(text).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function tableToMarkdown(table: string) {
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
      escapeTableCell(cell[1]),
    ),
  ).filter((row) => row.length > 0);

  if (!rows.length) return "";
  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => [
    ...row,
    ...Array.from({ length: Math.max(0, width - row.length) }, () => ""),
  ]);
  const header = normalized[0];
  const divider = header.map(() => "---");
  return [
    `| ${header.join(" | ")} |`,
    `| ${divider.join(" | ")} |`,
    ...normalized.slice(1).map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function protectFencedCode(content: string) {
  const blocks: string[] = [];
  const protectedContent = content.replace(/```[\s\S]*?```/g, (block) => {
    const token = `\uE000BDA_CODE_${blocks.length}\uE001`;
    blocks.push(block);
    return token;
  });
  return {
    content: protectedContent,
    restore(value: string) {
      return value.replace(/\uE000BDA_CODE_(\d+)\uE001/g, (_, rawIndex: string) =>
        blocks[Number(rawIndex)] ?? "",
      );
    },
  };
}

function normalizeQuotedStructure(content: string) {
  const output: string[] = [];
  let quoteOpen = false;

  for (const rawLine of content.split("\n")) {
    const isQuote = /^\s*>/.test(rawLine);
    const isIndentedQuoteChild =
      quoteOpen && /^\t+\s*(?:[-*+]|\d+\.)\s+/.test(rawLine);

    if (isQuote) {
      const expanded = rawLine.replace(/<br\s*\/?>\s*/gi, "\n> ");
      output.push(...expanded.split("\n"));
      quoteOpen = true;
      continue;
    }

    if (isIndentedQuoteChild) {
      output.push(`> ${rawLine.trim()}`);
      continue;
    }

    output.push(rawLine);
    if (rawLine.trim()) quoteOpen = false;
  }

  return output.join("\n");
}

export function sanitizeNotionSnapshot(snapshot: BdaNotionSnapshot) {
  const protectedCode = protectFencedCode(rawContent(snapshot));
  const content = normalizeQuotedStructure(protectedCode.content);
  let hiddenExerciseCount = 0;

  const sanitized = protectedCode.restore(content
    .replace(/<details[^>]*>[\s\S]*?<\/details>/gi, () => {
      hiddenExerciseCount += 1;
      return `\n[[BDA_SOURCE_PRACTICE:${blockId(snapshot.id, hiddenExerciseCount)}]]\n`;
    })
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (table) => `\n${tableToMarkdown(table)}\n`)
    .replace(/<\/?(?:columns|column|colgroup|col)(?:\s[^>]*)?>/gi, "\n")
    .replace(/<empty-block\s*\/>/gi, "")
    .replace(/✅\s*/g, "")
    .replace(/\*\*([①②③④⑤][^*\n]+)\*\*/g, "$1")
    .replace(/\s*\{toggle="true"\}\s*$/gm, "")
    .replace(/\s*\{color="[^"]+"\}\s*$/gm, "")
    .replace(/^\t+/gm, "")
    .replace(/\[!([A-Z]+)\]<br>\s*/g, "**$1** — ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[A-Za-z][^>\n]*>/g, "")
    .replace(
      /Value\(W\)≫Value\(K\)\\?>Value\(I\)\\?>Value\(D\)[^\n]*/g,
      "$Value(W) \\\\gg Value(K) > Value(I) > Value(D)$",
    )
    .replace(/Value\*Value\*/g, "Value")
    .replace(/\b(10|2)(\d{1,2})\1\2\b/g, (_, base: string, exponent: string) =>
      `$${base}^{${exponent}}$`,
    )
    .replace(/\b(10|2)n\1\*n\*/g, "$1ⁿ")
    .replace(/\b(10|2)\*n\*/g, "$1ⁿ")
    .replace(/[ \t]+---[ \t]*$/gm, "\n---")
    .replace(/\n{3,}/g, "\n\n")
    .trim());

  return { content: sanitized, hiddenExerciseCount };
}

function blockId(snapshotId: string, blockIndex: number) {
  return `${snapshotId}-b${String(blockIndex).padStart(3, "0")}`;
}

export function getBdaNotionSnapshots() {
  return snapshots;
}

export function getBdaNotionSnapshot(snapshotId: string) {
  return snapshots.find((snapshot) => snapshot.id === snapshotId);
}

export function getBdaTextbookSubject(subjectId: string) {
  return bdaTextbookSubjects.find((subject) => subject.id === subjectId);
}

export function getBdaTextbookSubjectSnapshots(subjectId: string) {
  return snapshots
    .filter((snapshot) => snapshot.subjectId === subjectId)
    .sort((left, right) => {
      const rank = { final: 0, current: 1, integration: 2 };
      return rank[left.revision] - rank[right.revision] || left.title.localeCompare(right.title, "ko");
    });
}

export function getBdaCanonicalSnapshot(subjectId: string) {
  return getBdaTextbookSubjectSnapshots(subjectId).find((snapshot) => snapshot.revision === "final")
    ?? getBdaTextbookSubjectSnapshots(subjectId)[0];
}

export function getBdaNotionMigrationStats() {
  return snapshots.reduce(
    (stats, snapshot) => {
      const content = rawContent(snapshot);
      stats.characterCount += content.length;
      stats.tableCount += (content.match(/<table\b/g) ?? []).length;
      stats.diagramCount += (content.match(/```mermaid/g) ?? []).length;
      stats.exerciseCount += (content.match(/<details\b/g) ?? []).length;
      stats.imageCount += (content.match(/<(?:image|img)\b/gi) ?? []).length;
      return stats;
    },
    {
      pageCount: snapshots.length,
      characterCount: 0,
      tableCount: 0,
      diagramCount: 0,
      exerciseCount: 0,
      imageCount: 0,
    },
  );
}
