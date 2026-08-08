import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConceptVisualAid } from "@/components/concept-visual-aid";
import generatedContent from "@/data/generated/content.json";
import { getLessonFamily } from "@/lib/content/lesson-families";
import type { GeneratedContent } from "@/lib/domain/types";

const content = generatedContent as GeneratedContent;

describe("tolerance and geometric-tolerance learning aid", () => {
  it("replaces the generic concept map with the authored fit and symbol tables", () => {
    const family = getLessonFamily(content, "s3-g01", "tolerance");
    expect(family).toBeDefined();

    render(<ConceptVisualAid family={family!} />);

    expect(screen.queryByText("Concept map")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "공차·끼워맞춤과 기하공차를 표에서 바로 판독하기",
      }),
    ).toBeVisible();

    const fitTable = screen.getByRole("region", {
      name: "끼워맞춤 판정 기준표",
    });
    expect(within(fitTable).getByText("헐거운 끼워맞춤")).toBeVisible();
    expect(within(fitTable).getByText("Smin = Dmin − dmax > 0")).toBeVisible();
    expect(within(fitTable).getByText("중간 끼워맞춤")).toBeVisible();
    expect(within(fitTable).getByText("억지 끼워맞춤")).toBeVisible();
    expect(screen.getByText(/한쪽 공차기호만/)).toBeVisible();

    const symbolTable = screen.getByRole("region", {
      name: "기하공차 기호와 데이텀 기준표",
    });
    expect(within(symbolTable).getByText("진직도")).toBeVisible();
    expect(within(symbolTable).getByText("원통도")).toBeVisible();
    expect(within(symbolTable).getByText("직각도")).toBeVisible();
    expect(within(symbolTable).getByText("위치도")).toBeVisible();
    expect(within(symbolTable).getByText("온 흔들림")).toBeVisible();
    expect(within(symbolTable).getAllByText("필요")).toHaveLength(3);
  });

  it("does not render a generic concept map for unsupported families", () => {
    const family = getLessonFamily(content, "s3-g01", "measurement");
    expect(family).toBeDefined();

    const { container } = render(<ConceptVisualAid family={family!} />);
    expect(container).toBeEmptyDOMElement();
  });
});
