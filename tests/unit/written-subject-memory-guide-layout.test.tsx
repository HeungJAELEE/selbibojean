import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WrittenSubjectMemoryGuide } from "@/components/written-subject-memory-guide";

describe("WrittenSubjectMemoryGuide hierarchy", () => {
  it("orders the public learning surface without exposing the private source archive", () => {
    render(
      <WrittenSubjectMemoryGuide
        subjectCode={1}
        heading="구조화 시험"
        description="구조 확인"
        parts={[{ id: "major-a", label: "대주제 A" }]}
        bundles={[
          {
            id: "middle-a",
            part: "대주제 A",
            title: "중주제 A",
            memoryLine: "중주제 요약",
            facts: [
              {
                cue: "구분 A",
                answer: "핵심 A",
                detailLessonTitles: ["소주제 A"],
              },
            ],
            traps: [{ statement: "오답 A", correction: "정정 A" }],
            detailLessonTitles: ["소주제 A"],
            cbtStatusNote: "연결 검수 중",
          },
          {
            id: "middle-b",
            part: "대주제 A",
            title: "중주제 B",
            memoryLine: "두 번째 중주제 요약",
            facts: [{ cue: "구분 B", answer: "핵심 B" }],
            traps: [{ statement: "오답 B", correction: "정정 B" }],
            detailLessonTitles: [],
            cbtStatusNote: "연결 검수 중",
          },
        ]}
        lessons={[{ id: "lesson-a", title: "소주제 A" }]}
        questions={[]}
      />,
    );

    const guide = screen.getByTestId("written-subject-one-memory-guide");
    const majorTopic = guide.querySelector("#subject-one-major-a");

    expect(majorTopic).toHaveAttribute("open");
    expect(screen.getByText(/대주제 01/)).toBeVisible();
    expect(screen.getByText("중주제 01")).toBeVisible();
    expect(screen.getAllByText("중주제 종합 정리")[0]).toBeVisible();
    expect(screen.getByText("소주제 선택")).toBeVisible();
    const subtopicLinks = screen.getAllByRole("link", { name: /소주제 A/ });
    expect(subtopicLinks).toHaveLength(2);
    subtopicLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/written/theory/lesson-a");
    });
    expect(
      screen.getByTestId("subject-one-traps-middle-a"),
    ).not.toHaveAttribute("open");
    expect(
      screen.getByTestId("subject-one-bundle-middle-a"),
    ).toHaveAttribute("open");
    expect(
      screen.getByTestId("subject-one-bundle-middle-b"),
    ).not.toHaveAttribute("open");
    expect(
      screen.queryByTestId("subject-one-practice-middle-a"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("과목 전체 종합정리 원문 펼쳐보기"),
    ).not.toBeInTheDocument();
    expect(
      guide.querySelector('a[href*="notion.site"]'),
    ).not.toBeInTheDocument();
  });
});
