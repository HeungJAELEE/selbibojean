"use client";

import { createElement, Fragment, type ReactNode } from "react";
import { BdaSourcePracticeBlock } from "@/components/bda-source-practice-block";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import type { PublicBdaSourcePracticeBlock } from "@/lib/domain/bda-source-practice";
import { markdownHeadingId, stripMarkdownDecoration } from "@/lib/markdown-outline";
import { cn } from "@/lib/utils";

const TEX_SYMBOLS: Record<string, string> = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\Delta": "Δ",
  "\\epsilon": "ε",
  "\\eta": "η",
  "\\theta": "θ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\pi": "π",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\tau": "τ",
  "\\phi": "φ",
  "\\omega": "ω",
  "\\Omega": "Ω",
  "\\propto": "∝",
  "\\times": "×",
  "\\cdot": "·",
  "\\pm": "±",
  "\\approx": "≈",
  "\\neq": "≠",
  "\\leq": "≤",
  "\\geq": "≥",
  "\\rightarrow": "→",
  "\\leftarrow": "←",
  "\\infty": "∞",
  "\\sum": "∑",
  "\\gg": "≫",
};

const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
  "+": "⁺",
};

export function normalizeMathExpression(source: string) {
  let value = source.trim().replace(/\\left|\\right/g, "");

  for (let pass = 0; pass < 3; pass += 1) {
    value = value
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)⁄($2)")
      .replace(/\\sqrt\{([^{}]+)\}/g, "√($1)")
      .replace(/\\(?:mathrm|text|operatorname)\{([^{}]+)\}/g, "$1");
  }

  for (const [tex, symbol] of Object.entries(TEX_SYMBOLS)) {
    value = value.replaceAll(tex, symbol);
  }

  value = value
    .replace(/\^\{([0-9+-]+)\}/g, (_, exponent: string) =>
      [...exponent].map((character) => SUPERSCRIPTS[character] ?? character).join(""),
    )
    .replace(/\^([0-9])/g, (_, exponent: string) => SUPERSCRIPTS[exponent] ?? exponent)
    .replace(/\s*([∝×±≈≠≤≥=])\s*/g, " $1 ")
    .replace(/\\[,;! ]/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return value;
}

function MathExpression({ source, display = false }: { source: string; display?: boolean }) {
  const normalized = normalizeMathExpression(source);
  const mathMl = createElement(
    "math" as "span",
    { "aria-label": normalized },
    createElement("mtext" as "span", null, normalized),
  );
  const expression = (
    <span className="katex">
      <span className="katex-mathml">{mathMl}</span>
      <span className="katex-html font-serif" aria-hidden="true">
        {normalized}
      </span>
    </span>
  );

  return display ? (
    <span className="katex-display my-5 block overflow-x-auto rounded-xl bg-slate-50 px-5 py-4 text-center text-lg">
      {expression}
    </span>
  ) : (
    expression
  );
}

function safeHref(href: string) {
  return /^(https?:\/\/|\/|#|mailto:)/i.test(href) ? href : "#";
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  text = text.replace(/\\([*_[\]()>#])/g, "$1");
  const tokenPattern = /(\$[^$\n]+\$|`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)]+\))/g;
  const output: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text))) {
    if (match.index > cursor) output.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (token.startsWith("$")) {
      output.push(<MathExpression key={key} source={token.slice(1, -1)} />);
    } else if (token.startsWith("`")) {
      output.push(
        <code key={key} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[.92em] text-[#8f3f0a]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      output.push(
        <strong key={key} className="font-extrabold text-[#173957]">
          {renderInline(token.slice(2, -2), `${key}-strong`)}
        </strong>,
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        output.push(
          <a
            key={key}
            href={safeHref(linkMatch[2])}
            className="font-bold text-[#16697a] underline underline-offset-4"
          >
            {renderInline(linkMatch[1], `${key}-link`)}
          </a>,
        );
      }
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string | undefined) {
  return Boolean(line && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line));
}

function isBlockStart(lines: string[], index: number) {
  const line = lines[index] ?? "";
  return (
    !line.trim() ||
    /^#{1,3}\s+/.test(line) ||
    /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line) ||
    /^\s*([-*+]|\d+\.)\s+/.test(line) ||
    /^\s*>\s?/.test(line) ||
    /^\s*```/.test(line) ||
    /^\s*\$\$\s*$/.test(line) ||
    /^\s*\[\[BDA_SOURCE_PRACTICE:[^\]]+\]\]\s*$/.test(line) ||
    isTableDivider(lines[index + 1])
  );
}

function MarkdownBlocks({
  content,
  sourcePracticeById,
}: {
  content: string;
  sourcePracticeById: Map<string, PublicBdaSourcePracticeBlock>;
}) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const sourcePracticeMarker = line
      .trim()
      .match(/^\[\[BDA_SOURCE_PRACTICE:([^\]]+)\]\]$/);
    if (sourcePracticeMarker) {
      const block = sourcePracticeById.get(sourcePracticeMarker[1]);
      blocks.push(
        block ? (
          <BdaSourcePracticeBlock key={`source-practice-${block.id}`} block={block} />
        ) : (
          <aside
            key={`source-practice-held-${sourcePracticeMarker[1]}`}
            className="my-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
          >
            이 원천 문제는 정답 근거를 다시 확인하고 있어 아직 공개하지 않았습니다.
          </aside>
        ),
      );
      index += 1;
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={`divider-${index}`} className="my-9 border-0 border-t border-slate-200" />);
      index += 1;
      continue;
    }

    if (/^\s*\$\$\s*$/.test(line)) {
      const math: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*\$\$\s*$/.test(lines[index])) {
        math.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(<MathExpression key={`math-${index}`} source={math.join(" ")} display />);
      continue;
    }

    if (/^\s*```/.test(line)) {
      const language = line.trim().slice(3).trim().toLowerCase();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(language === "mermaid"
        ? <MermaidDiagram key={`mermaid-${index}`} code={code.join("\n")} />
        : (
          <pre key={`code-${index}`} className="my-5 overflow-x-auto rounded-xl bg-[#173957] p-4 text-sm text-slate-50">
            <code>{code.join("\n")}</code>
          </pre>
        ));
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const children = renderInline(heading[2], `heading-${index}`);
      const headingId = markdownHeadingId(index);
      const headingLabel = stripMarkdownDecoration(heading[2]);
      const isChapter = /^(?:part|chapter)\s*\d*/i.test(headingLabel);
      blocks.push(
        isChapter ? (
          <h2
            id={headingId}
            key={`heading-${index}`}
            className="textbook-chapter mt-12 scroll-mt-24 rounded-2xl border border-teal-100 bg-gradient-to-r from-[#e9f7f5] to-white px-5 py-4 text-xl font-black leading-snug text-[#133d4c] sm:text-2xl"
          >
            {children}
          </h2>
        ) : heading[1].length <= 2 ? (
          <h3
            id={headingId}
            key={`heading-${index}`}
            className="mt-10 scroll-mt-24 border-b border-slate-200 pb-3 text-xl font-black leading-snug text-[#173957] sm:text-2xl"
          >
            {children}
          </h3>
        ) : (
          <h4
            id={headingId}
            key={`heading-${index}`}
            className="mt-7 scroll-mt-24 text-lg font-extrabold leading-snug text-[#173957]"
          >
            {children}
          </h4>
        ),
      );
      index += 1;
      continue;
    }

    if (isTableDivider(lines[index + 1])) {
      const header = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push(
        <div
          key={`table-${index}`}
          className="markdown-table my-6 max-w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
          role="region"
          aria-label="좌우로 스크롤할 수 있는 비교표"
          tabIndex={0}
        >
          <table className="w-max min-w-full max-w-none border-collapse text-left text-[13px] sm:text-sm">
            <thead className="bg-[#173957] text-white">
              <tr>
                {header.map((cell, cellIndex) => (
                  <th key={cellIndex} className="min-w-32 px-4 py-3 font-extrabold first:min-w-28">
                    {renderInline(cell, `th-${index}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="max-w-80 px-4 py-3 align-top leading-6 text-[#344b60]">
                      {renderInline(cell, `td-${index}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      const quoteText = quote.join("\n").trim();
      const firstLine = quote[0]?.trim() ?? "";
      const markerMatch = firstLine.match(/^(?:\*\*)?\\?\[!?([^\]\\]+)\\?\](?:\*\*)?\s*(.*)$/);
      const marker = markerMatch?.[1]?.toUpperCase();
      const isConceptAddition = /^\s*⭐\s*\(\+개념추가\)/.test(firstLine);
      let normalizedFirstLine = markerMatch
        ? markerMatch[2]
        : firstLine.replace(/^\s*⭐\s*\(\+개념추가\)\s*/, "");
      if (isConceptAddition) {
        normalizedFirstLine = normalizedFirstLine.replace(
          /\s+(💡\s*\*\*\(친숙한 비유\)\*\*)/,
          "\n\n$1",
        );
      }
      let quoteBody = [normalizedFirstLine, ...quote.slice(1)].join("\n").trim();
      if (isConceptAddition) {
        quoteBody = quoteBody.replace(/\n(?=\s*💡)/, "\n\n");
      }
      const isGoal = marker === "학습 목표";
      const isWarning = marker === "WARNING" || marker === "CAUTION" || marker === "IMPORTANT";
      const isTip = marker === "TIP" || marker === "NOTE";
      const isAnswerGuard = quoteText.startsWith("원천의 연습문제·정답 블록");
      const label = isGoal
        ? "학습 목표"
        : isWarning
          ? "시험 주의"
          : isConceptAddition
            ? "개념 확장"
          : isTip
            ? "핵심 팁"
            : isAnswerGuard
              ? "답안 보호"
              : null;
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className={cn(
            "my-6 rounded-2xl border px-5 py-4 text-[#294a58]",
            isWarning
              ? "border-amber-200 bg-amber-50"
              : isAnswerGuard
                ? "border-slate-200 bg-slate-50"
                : "border-teal-100 bg-[#eaf7f6]",
          )}
        >
          {label ? (
            <span className={cn(
              "mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide",
              isWarning
                ? "bg-amber-200/70 text-amber-950"
                : isAnswerGuard
                  ? "bg-slate-200 text-slate-700"
                  : "bg-teal-100 text-teal-900",
            )}>
              {label}
            </span>
          ) : null}
          <div className="-my-2 leading-8 [&_p]:my-2 [&_ul]:my-2">
            <MarkdownBlocks
              content={quoteBody}
              sourcePracticeById={sourcePracticeById}
            />
          </div>
        </blockquote>,
      );
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`} className="my-4 list-disc space-y-2 pl-6 text-[#344b60] marker:text-[#16697a]">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="pl-1 leading-7">
              {renderInline(item, `ul-${index}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: Array<{ number: number; title: string; details: string[] }> = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        const itemMatch = lines[index].match(/^\s*(\d+)\.\s+(.+)$/);
        if (!itemMatch) break;
        index += 1;
        const details: string[] = [];
        while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
          details.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
          index += 1;
        }
        items.push({
          number: Number(itemMatch[1]),
          title: itemMatch[2],
          details,
        });
      }
      blocks.push(
        <div
          key={`ol-${index}`}
          className="my-6 grid gap-3"
        >
          {items.map((item, itemIndex) => (
            <section
              key={`${item.number}-${itemIndex}`}
              className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-teal-100 text-sm font-black text-teal-900">
                {item.number}
              </span>
              <div className="min-w-0">
                <p className="font-extrabold leading-7 text-[#173957]">
                  {renderInline(item.title, `ol-${index}-${itemIndex}-title`)}
                </p>
                {item.details.length ? (
                  <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-[#455b70]">
                    {item.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="grid grid-cols-[.75rem_1fr] gap-1"
                      >
                        <span aria-hidden="true" className="pt-0.5 text-teal-700">•</span>
                        <span>
                          {renderInline(
                            detail,
                            `ol-${index}-${itemIndex}-${detailIndex}`,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>,
      );
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="my-4 break-words leading-8 text-[#344b60]">
        {renderInline(paragraph.join(" "), `paragraph-${index}`)}
      </p>,
    );
  }

  return <>{blocks.map((block, blockIndex) => <Fragment key={blockIndex}>{block}</Fragment>)}</>;
}

export function MarkdownContent({
  content,
  compact = false,
  sourcePracticeBlocks = [],
}: {
  content: string;
  compact?: boolean;
  sourcePracticeBlocks?: PublicBdaSourcePracticeBlock[];
}) {
  const sourcePracticeById = new Map(
    sourcePracticeBlocks.map((block) => [block.id, block]),
  );
  return (
    <div className={cn("markdown-content min-w-0", compact && "text-sm [&_p]:leading-7")}>
      <MarkdownBlocks content={content} sourcePracticeById={sourcePracticeById} />
    </div>
  );
}
