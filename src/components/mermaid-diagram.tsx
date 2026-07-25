"use client";

import { useEffect, useId, useRef } from "react";

export function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    let active = true;
    const container = containerRef.current;
    if (!container) return;

    container.textContent = "도식을 불러오는 중입니다.";

    void import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "inherit",
          themeVariables: {
            primaryColor: "#eaf7f4",
            primaryTextColor: "#173957",
            primaryBorderColor: "#0f766e",
            lineColor: "#39738a",
            secondaryColor: "#fff7df",
            tertiaryColor: "#f5f8fa",
          },
        });
        return mermaid.render(`bda-mermaid-${instanceId}`, code);
      })
      .then(({ svg }) => {
        if (active && containerRef.current) containerRef.current.innerHTML = svg;
      })
      .catch(() => {
        if (active && containerRef.current) {
          containerRef.current.textContent = "원천 도식을 렌더링하지 못했습니다. 아래 원문 코드를 확인하세요.";
          const pre = document.createElement("pre");
          pre.textContent = code;
          pre.className = "mt-3 overflow-x-auto whitespace-pre-wrap text-left text-xs";
          containerRef.current.appendChild(pre);
        }
      });

    return () => {
      active = false;
    };
  }, [code, instanceId]);

  return (
    <div
      ref={containerRef}
      className="my-6 overflow-x-auto rounded-2xl border border-teal-100 bg-white p-4 text-center text-sm text-slate-500 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      role="img"
      aria-label="Notion 원천에서 이관한 개념 도식"
    />
  );
}
