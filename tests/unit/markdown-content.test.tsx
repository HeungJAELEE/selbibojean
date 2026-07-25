import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownContent } from "@/components/markdown-content";
import type { PublicBdaSourcePracticeBlock } from "@/lib/domain/bda-source-practice";

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

  it("keeps concept additions and their analogy inside one callout", () => {
    const { container } = render(
      <MarkdownContent
        content={[
          "> ⭐ (+개념추가) 가명정보 활용 원칙 및 비식별 5대 기술",
          "> 💡 **(친숙한 비유)** 가명 처리는 가발을 씌우는 것과 같습니다.",
        ].join("\n")}
      />,
    );

    const callouts = container.querySelectorAll("blockquote");
    expect(callouts).toHaveLength(1);
    expect(callouts[0]).toHaveTextContent("개념 확장");
    expect(callouts[0]).toHaveTextContent("가명정보 활용 원칙");
    expect(callouts[0]).toHaveTextContent("친숙한 비유");
    expect(callouts[0].querySelectorAll("p")).toHaveLength(2);
  });

  it("keeps numbered concepts and their detail bullets in one ordered sequence", () => {
    const { container } = render(
      <MarkdownContent
        content={[
          "1. **데이터 사이언티스트**",
          "- 역할: 모델링 및 인사이트 도출",
          "2. **데이터 엔지니어**",
          "- 역할: 파이프라인 구축",
          "3. **알고리즈미스트**",
          "- 역할: 알고리즘 감사",
        ].join("\n")}
      />,
    );

    expect(container.textContent).toContain("1데이터 사이언티스트");
    expect(container.textContent).toContain("2데이터 엔지니어");
    expect(container.textContent).toContain("3알고리즈미스트");
  });

  it("renders a reviewed source-practice marker as a toggle without answer data", () => {
    const block: PublicBdaSourcePracticeBlock = {
      id: "s1-final-b001",
      sourceSnapshotId: "s1-final",
      subjectId: "bda-s1",
      blockIndex: 1,
      auditStatus: "published",
      auditNote: "검수 완료",
      questions: [
        {
          id: "s1-final-b001-q1",
          blockId: "s1-final-b001",
          subjectId: "bda-s1",
          sourceSnapshotId: "s1-final",
          mode: "multiple_choice",
          stem: "DIKW에서 지식에 해당하는 것은?",
          choices: [
            { id: "c1", order: 1, text: "데이터" },
            { id: "c2", order: 2, text: "정보" },
            { id: "c3", order: 3, text: "지식" },
            { id: "c4", order: 4, text: "지혜" },
          ],
          sourceType: "user_provided",
          evidenceGrade: "B",
          reviewStatus: "검수 완료",
          reviewDisposition: "corrected",
          practiceNotice: "제출 후 정답 공개",
        },
      ],
    };

    const { container } = render(
      <MarkdownContent
        content="[[BDA_SOURCE_PRACTICE:s1-final-b001]]"
        sourcePracticeBlocks={[block]}
      />,
    );

    expect(container.querySelector("details")).toBeInTheDocument();
    expect(container).toHaveTextContent("실제 문제 1개");
    expect(container).not.toHaveTextContent("정답은 3번");
  });
});
