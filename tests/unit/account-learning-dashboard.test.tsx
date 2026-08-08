import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountLearningDashboard } from "@/components/account-learning-dashboard";
import type { AccountLearningSummary } from "@/lib/learning/account-learning-summary";

const summary: AccountLearningSummary = {
  mockSessions: 2,
  attempts: 10,
  correct: 6,
  wrong: 4,
  accuracy: 60,
  subjects: [
    {
      id: "subject-1",
      title: "설비진단 및 계측",
      subjectTitle: "설비진단 및 계측",
      attempts: 10,
      correct: 6,
      accuracy: 60,
      keywords: [],
    },
  ],
  weakGroups: [
    {
      id: "s1-g01",
      title: "공유압 기초",
      subjectTitle: "설비진단 및 계측",
      attempts: 5,
      correct: 2,
      accuracy: 40,
      keywords: ["압력", "유량"],
      href: "/written/theory/family/s1-g01/foundation",
    },
  ],
  strongGroups: [],
  weakConcepts: [
    {
      id: "concept-pressure",
      title: "압력 단위",
      subjectTitle: "설비진단 및 계측 · 공유압 기초",
      attempts: 3,
      correct: 1,
      accuracy: 33,
      keywords: ["압력"],
      href: "/written/theory/lesson-pressure",
    },
  ],
  focusKeywords: ["압력", "유량"],
};

describe("account learning dashboard", () => {
  it("connects mock results to middle topics, small topics, and focused practice", () => {
    render(<AccountLearningDashboard summary={summary} />);

    expect(screen.getByText("취약 중주제")).toBeInTheDocument();
    expect(screen.getByText("공유압 기초")).toBeInTheDocument();
    expect(screen.getByText("취약 소주제")).toBeInTheDocument();
    expect(screen.getByText("압력 단위")).toBeInTheDocument();
    expect(
      screen.getByText(/정답률 70% 미만인 중주제와 소주제만/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "개념 학습하기" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "개념 학습하기" })[0],
    ).toHaveAttribute(
      "href",
      "/written/theory/family/s1-g01/foundation",
    );
    expect(
      screen.getByRole("link", { name: "취약영역 집중 모의고사" }),
    ).toHaveAttribute("href", "/written/practice/random?mode=weak");
    expect(
      screen.getByRole("link", { name: "오답만 다시 풀기" }),
    ).toHaveAttribute("href", "/written/review?mode=wrong");
  });

  it("offers a clear starting action before any mock results exist", () => {
    render(
      <AccountLearningDashboard
        summary={{
          ...summary,
          mockSessions: 0,
          attempts: 0,
          correct: 0,
          wrong: 0,
          accuracy: null,
          subjects: [],
          weakGroups: [],
          weakConcepts: [],
          focusKeywords: [],
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "첫 모의고사 시작" }),
    ).toHaveAttribute("href", "/written/mock");
  });
});
