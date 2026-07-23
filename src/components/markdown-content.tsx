"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";

const components: Components = {
  h3: ({ children }) => <h3 className="mt-6 text-lg font-extrabold text-[#173957]">{children}</h3>,
  p: ({ children }) => <p className="my-3 leading-8 text-[#344b60]">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-[#344b60] marker:text-[#16697a]">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 text-[#344b60] marker:font-bold marker:text-[#16697a]">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-extrabold text-[#173957]">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-r-xl border-l-4 border-[#16697a] bg-[#eaf7f6] px-5 py-2 text-[#294a58]">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[#173957] text-white">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>,
  th: ({ children }) => <th className="px-4 py-3 font-extrabold">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 align-top leading-6 text-[#344b60]">{children}</td>,
  code: ({ className, children }) => (
    <code className={cn("rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[.92em] text-[#8f3f0a]", className)}>
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a href={href} className="font-bold text-[#16697a] underline underline-offset-4">
      {children}
    </a>
  ),
};

export function MarkdownContent({ content, compact = false }: { content: string; compact?: boolean }) {
  return (
    <div className={cn("markdown-content", compact && "text-sm [&_p]:leading-7")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
