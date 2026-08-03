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
    feedbackQuality: "pending_review",
    feedbackNotice:
      "이 문항은 선택지별 풀이와 개념 연결을 검수 중입니다. 검수되지 않은 공통 문구는 표시하지 않습니다.",
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
  it("does not expose generic legacy filler while direct feedback is pending", () => {
    const feedback = makeFeedback();
    feedback.isCorrect = false;
    feedback.errorReason = "개념 혼동";
    feedback.selectedChoice = {
      ...feedback.selectedChoice,
      rationale:
        "관련 용어이지만 질문이 요구하는 조건에 직접 답하는 보기는 정답입니다.",
      plausibleReason:
        "같은 분야의 용어나 조건을 사용해 정답처럼 보일 수 있습니다.",
      incorrectPoint: "대상·기능·적용 조건이 다릅니다.",
    };

    render(
      <PracticeFeedbackPanel
        feedback={feedback}
        lessonHref="/written/theory/lesson-1#principle"
      />,
    );

    expect(screen.getByTestId("pending-review-feedback")).toHaveTextContent(
      "선택지별 풀이와 개념 연결을 검수 중",
    );
    expect(screen.queryByText("왜 그럴듯해 보였나")).not.toBeInTheDocument();
    expect(screen.queryByText("실제로 틀린 지점")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "관련 용어이지만 질문이 요구하는 조건에 직접 답하는 보기는 정답입니다.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("대상·기능·적용 조건이 다릅니다.")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "개념에서 확인하기" })).not.toBeInTheDocument();
  });

  it("renders one approved solution, selected reason, and concept without legacy boilerplate", () => {
    const feedback = makeFeedback();
    feedback.feedbackQuality = "approved_direct";
    feedback.feedbackNotice = null;
    feedback.isCorrect = false;
    feedback.errorReason = "개념 혼동";
    feedback.selectedChoice = {
      ...feedback.selectedChoice,
      id: "choice-2",
      text: "선택한 오답",
      rationale: "이 선택지만의 승인 판단 근거",
    };
    feedback.approvedReview = {
      directSolution: "승인된 직접 풀이",
      selectedChoiceReason: "이 선택지만의 승인 판단 근거",
      conceptBinding: {
        assertionText: "전류와 전압은 문제의 적용 조건에 맞춰 함께 판단합니다.",
        href: "/written/theory/lesson-canonical#structure",
      },
      calculation: {
        formula: "H=ηVI×60/v",
        substitution: "H=1×24×200×60÷6",
        result: "48000J/cm",
        unit: "J/cm",
      },
    };
    feedback.conceptSupport = {
      title: "공통 레슨 제목",
      summary: ["공통 요약 1", "공통 요약 2", "공통 요약 3"],
      blocks: [
        { id: "definition", kind: "definition", title: "정의", body: "공통 정의 본문" },
        { id: "principle", kind: "principle", title: "원리", body: "공통 원리 본문" },
        { id: "formula", kind: "formula", title: "공식", body: "공통 공식 본문" },
        { id: "trap", kind: "trap", title: "함정", body: "공통 함정 본문" },
      ],
    };

    render(
      <PracticeFeedbackPanel
        feedback={feedback}
        lessonHref="/written/theory/lesson-canonical?returnTo=%2Fwritten%2Fpractice%2Frandom#structure"
      />,
    );

    expect(screen.getAllByText("승인된 직접 풀이")).toHaveLength(1);
    expect(screen.getAllByText("이 선택지만의 승인 판단 근거")).toHaveLength(1);
    expect(
      screen.getAllByText(
        "전류와 전압은 문제의 적용 조건에 맞춰 함께 판단합니다.",
      ),
    ).toHaveLength(1);
    expect(screen.getByText("H=ηVI×60/v")).toBeInTheDocument();
    expect(screen.getByText("48000J/cm")).toBeInTheDocument();
    expect(screen.queryByText("전체 해설")).not.toBeInTheDocument();
    expect(screen.queryByText("왜 그럴듯해 보였나")).not.toBeInTheDocument();
    expect(screen.queryByText("실제로 틀린 지점")).not.toBeInTheDocument();
    expect(screen.queryByText("정답을 가르는 핵심 규칙")).not.toBeInTheDocument();
    expect(screen.queryByText("공통 요약 1")).not.toBeInTheDocument();
    expect(screen.queryByText("공통 정의 본문")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "개념에서 확인하기" }),
    ).toHaveAttribute(
      "href",
      "/written/theory/lesson-canonical?returnTo=%2Fwritten%2Fpractice%2Frandom#structure",
    );
    expect(
      screen.getAllByText("다른 보기까지 비교하기"),
    ).not.toHaveLength(0);
  });

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
