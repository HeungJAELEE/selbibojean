import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PracticalVisualAidFigure } from "@/components/practical-visual-aid";
import { PRACTICAL_VISUAL_AIDS } from "@/data/source/practical-source-registry";

const aid = (id: string) => {
  const found = PRACTICAL_VISUAL_AIDS.find((item) => item.id === id);
  expect(found, `missing visual aid ${id}`).toBeDefined();
  return found!;
};

describe("PracticalVisualAidFigure prompt source notice", () => {
  it("labels a self-authored reconstruction as non-original", () => {
    render(
      <PracticalVisualAidFigure
        visualAid={aid("diagram-third-angle-projection-problem")}
        mode="prompt"
      />,
    );

    expect(
      screen.getByTestId("practical-visual-prompt-source-notice"),
    ).toHaveTextContent(
      "NCS 근거 기반 자체 제작 복원 도식이며, 원시험 원본 이미지가 아닙니다.",
    );
    expect(screen.queryByText("NCS 원문 이미지")).not.toBeInTheDocument();
  });
});
