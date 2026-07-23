"use client";

import { createElement, Fragment, type ReactNode } from "react";
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
    /^\s*([-*+]|\d+\.)\s+/.test(line) ||
    /^\s*>\s?/.test(line) ||
    /^\s*```/.test(line) ||
    /^\s*\$\$\s*$/.test(line) ||
    isTableDivider(lines[index + 1])
  );
}

function MarkdownBlocks({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
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
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={`code-${index}`} className="my-5 overflow-x-auto rounded-xl bg-[#173957] p-4 text-sm text-slate-50">
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const children = renderInline(heading[2], `heading-${index}`);
      blocks.push(
        heading[1].length === 1 ? (
          <h2 key={`heading-${index}`} className="mt-7 text-xl font-extrabold text-[#173957]">
            {children}
          </h2>
        ) : (
          <h3 key={`heading-${index}`} className="mt-6 text-lg font-extrabold text-[#173957]">
            {children}
          </h3>
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
        <div key={`table-${index}`} className="my-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="bg-[#173957] text-white">
              <tr>
                {header.map((cell, cellIndex) => (
                  <th key={cellIndex} className="px-4 py-3 font-extrabold">
                    {renderInline(cell, `th-${index}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 align-top leading-6 text-[#344b60]">
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
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="my-5 rounded-r-xl border-l-4 border-[#16697a] bg-[#eaf7f6] px-5 py-2 text-[#294a58]"
        >
          <p className="my-3 leading-8">{renderInline(quote.join(" "), `quote-${index}`)}</p>
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
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol
          key={`ol-${index}`}
          className="my-4 list-decimal space-y-2 pl-6 text-[#344b60] marker:font-bold marker:text-[#16697a]"
        >
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="pl-1 leading-7">
              {renderInline(item, `ol-${index}-${itemIndex}`)}
            </li>
          ))}
        </ol>,
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
      <p key={`paragraph-${index}`} className="my-3 leading-8 text-[#344b60]">
        {renderInline(paragraph.join(" "), `paragraph-${index}`)}
      </p>,
    );
  }

  return <>{blocks.map((block, blockIndex) => <Fragment key={blockIndex}>{block}</Fragment>)}</>;
}

export function MarkdownContent({ content, compact = false }: { content: string; compact?: boolean }) {
  return (
    <div className={cn("markdown-content", compact && "text-sm [&_p]:leading-7")}>
      <MarkdownBlocks content={content} />
    </div>
  );
}
