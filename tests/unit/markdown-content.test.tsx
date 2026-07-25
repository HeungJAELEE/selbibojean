import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownContent } from "@/components/markdown-content";

describe("MarkdownContent math rendering", () => {
  it("renders inline LaTeX as accessible KaTeX instead of raw delimiters", () => {
    const { container } = render(<MarkdownContent content={String.raw`유량은 $Q\propto\sqrt{\Delta p}$이다.`} />);

    expect(container.querySelector(".katex")).toBeInTheDocument();
    expect(container.querySelector(".katex-mathml math")).not.toBeNull();
    expect(container.textContent).toContain("Q ∝ √(Δ p)");
    expect(container.textContent).not.toContain("$Q");
  });

  it("renders display math in a horizontally scrollable block", () => {
    const { container } = render(<MarkdownContent content={String.raw`$$
F=pA
$$`} />);

    expect(container.querySelector(".katex-display")).toBeInTheDocument();
    expect(container.querySelector(".katex-display .katex-mathml math")).not.toBeNull();
  });
});

describe("MarkdownContent textbook rendering", () => {
  it("renders chapter hierarchy, dividers, callouts, and a contained scrollable table", () => {
    const { container } = render(
      <MarkdownContent
        content={[
          "## Part1: 데이터의 기초",
          "> **\\[학습 목표\\]** 핵심 구분을 익힌다.",
          "---",
          "## 1. 데이터 정의",
          "### (1) 존재적 특성",
          "| 구분 | 설명 |",
          "| --- | --- |",
          "| 데이터 | 객관적 사실 |",
        ].join("\n")}
      />,
    );

    expect(container.querySelector("h2.textbook-chapter")).toHaveTextContent("Part1: 데이터의 기초");
    expect(container.querySelector("h3")).toHaveTextContent("1. 데이터 정의");
    expect(container.querySelector("h4")).toHaveTextContent("(1) 존재적 특성");
    expect(container.querySelector("hr")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toHaveTextContent("학습 목표");
    expect(container.querySelector(".markdown-table")).toHaveAttribute("tabindex", "0");
  });
});
