import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PracticeFeedbackPanel } from "@/components/practice-feedback";
import type { PracticeFeedback } from "@/lib/domain/types";

function makeFeedback(answerAudit?: PracticeFeedback["answerAudit"]): PracticeFeedback {
  const common = {
    rationale: "선택지 판단 근거",
    plausibleReason: "혼동할 수 있는 이유",
    incorrectPoint: null,
    keyRule: "핵심 판단 규칙",
    differenceFromCorrect: null,
  };

  return {
    isCorrect: true,
    selectedChoice: { id: "choice-1", text: "검증 답", ...common },
    correctChoice: { id: "choice-1", text: "검증 답" },
    explanation: "답안 제출 뒤 제공되는 전체 풀이입니다.",
    errorReason: null,
    selfRating: "known",
    lesson: {
      id: "lesson-1",
      anchor: "principle",
      href: "/written/theory/lesson-1#principle",
    },
    conceptSupport: null,
    otherChoices: [
      {
        id: "choice-2",
        text: "오답 보기",
        isCorrect: false,
        ...common,
        incorrectPoint: "적용 조건이 다릅니다.",
      },
    ],
    answerAudit,
  };
}

describe("practice feedback audit disclosure", () => {
  it("does not render CBT correction details without post-submit audit feedback", () => {
    render(
      <PracticeFeedbackPanel
        feedback={makeFeedback()}
        lessonHref="/written/theory/lesson-1#principle"
      />,
    );

    expect(screen.queryByTestId("cbt-answer-correction")).not.toBeInTheDocument();
  });

  it("renders CBT and verified answers with evidence after submission", () => {
    render(
      <PracticeFeedbackPanel
        feedback={makeFeedback({
          auditDisposition: "cbt_corrected",
          cbtAnswer: "② CBT 공개답",
          verifiedAnswer: "① 검증 답",
          evidenceUrls: ["https://example.com/official"],
          reviewNote: "공식 근거로 정답을 보정했습니다.",
        })}
        lessonHref="/written/theory/lesson-1#principle"
      />,
    );

    const panel = screen.getByTestId("cbt-answer-correction");
    expect(panel).toHaveTextContent("CBT 공개답과 기술근거 불일치");
    expect(panel).toHaveTextContent("② CBT 공개답");
    expect(panel).toHaveTextContent("① 검증 답");
    expect(screen.getByRole("link", { name: "검증 근거 1" })).toHaveAttribute(
      "href",
      "https://example.com/official",
    );
  });
});
