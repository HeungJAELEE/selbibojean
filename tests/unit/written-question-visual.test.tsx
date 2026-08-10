import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SingleQuestion } from "@/components/single-question";
import {
  WRITTEN_QUESTION_VISUALS,
  WrittenQuestionVisual,
} from "@/components/written-question-visual";
import type { PublicQuestion } from "@/lib/domain/types";

const restoredQuestion: PublicQuestion = {
  id: "U-722",
  canonicalNumber: 725,
  subjectId: "subject-1",
  conceptGroupId: "s1-g08",
  conceptId: "concept-49lr6o",
  lessonId: "lesson-49lr6o",
  lessonAnchor: "source",
  stem: "원문에 제시된 회전식 공압 액추에이터 기호에 해당하는 기기는?",
  choices: [
    { id: "U-722-c1", order: 1, text: "공압실린더" },
    { id: "U-722-c2", order: 2, text: "공압모터" },
    { id: "U-722-c3", order: 3, text: "유압펌프" },
    { id: "U-722-c4", order: 4, text: "에어탱크" },
  ],
  sourceLabel: "https://cbtbank.kr/exam/de20180428",
  contentStatus: "published",
  provenance: {
    reconstructed: true,
    historical: false,
    original: false,
  },
};

describe("written question visual restoration", () => {
  it("renders the reviewed self-authored symbol without answer metadata", () => {
    render(<WrittenQuestionVisual questionId="U-722" />);

    const figure = screen.getByTestId("written-question-visual-U-722");
    expect(figure.querySelector("svg")).not.toBeNull();
    expect(figure).toHaveTextContent("자체 재작성한 학습용 도해");

    const serialized = JSON.stringify(WRITTEN_QUESTION_VISUALS);
    expect(serialized).not.toContain("correctChoiceId");
    expect(serialized).not.toContain("verifiedAnswer");
    expect(serialized).not.toContain("공압모터");
  });

  it("renders nothing for questions without a reviewed visual", () => {
    const { container } = render(
      <WrittenQuestionVisual questionId="U-035" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("mounts the restored visual inside the real written question form", () => {
    render(<SingleQuestion question={restoredQuestion} />);

    expect(
      screen.getByRole("heading", { name: restoredQuestion.stem }),
    ).toBeVisible();
    expect(screen.getByTestId("written-question-visual-U-722")).toBeVisible();
    expect(screen.getByTestId("inline-cbt-submit-U-722")).toBeDisabled();
  });
});
