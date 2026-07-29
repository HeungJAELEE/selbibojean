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

  it("renders fourth-level source headings without exposing Markdown hashes", () => {
    const { getByRole, queryByText } = render(
      <MarkdownContent content={"#### 속도 제어 회로 3가지\n\n1. **미터 인**"} />,
    );

    expect(
      getByRole("heading", { level: 4, name: "속도 제어 회로 3가지" }),
    ).toBeInTheDocument();
    expect(queryByText("#### 속도 제어 회로 3가지")).not.toBeInTheDocument();
  });
});
