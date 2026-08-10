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
    const summaryTable = screen.getByRole("region", {
      name: "중주제 A 핵심 정리 표. 좌우로 드래그해 확인",
    });
    expect(summaryTable).toHaveAttribute("tabindex", "0");
    expect(summaryTable).toHaveClass(
      "overflow-x-auto",
      "overscroll-x-contain",
      "touch-pan-x",
      "[-webkit-overflow-scrolling:touch]",
    );
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

  it("routes reviewed fact links to their exact public evidence sections", () => {
    const { unmount } = render(
      <WrittenSubjectMemoryGuide
        subjectCode={3}
        heading="결정격자 연결 시험"
        description="근거 앵커 확인"
        parts={[{ id: "materials", label: "가공·재료" }]}
        bundles={[
          {
            id: "casting-plastic-materials",
            part: "가공·재료",
            title: "주조·소성가공·금속의 성질",
            memoryLine: "결정구조와 변형성",
            facts: [
              {
                id: "s3-casting-plastic-materials-crystal-lattices",
                cue: "결정격자",
                answer:
                  "FCC는 조밀충진 슬립면에서 전위 이동이 비교적 쉬워 전연성이 좋습니다.",
                detailLessonTitles: ["금속 결정격자와 변형"],
              },
            ],
            traps: [],
            detailLessonTitles: ["금속 결정격자와 변형"],
            cbtStatusNote: "연결 검수 중",
          },
        ]}
        lessons={[
          {
            id: "notion-gap-metal-crystal-lattices-deformation",
            title: "금속 결정격자와 변형 개정",
          },
        ]}
        questions={[]}
      />,
    );

    const latticeLinks = screen.getAllByRole("link", {
      name: /금속 결정격자와 변형 개정/,
    });
    expect(latticeLinks).toHaveLength(2);
    expect(latticeLinks[0]).toHaveAttribute(
      "href",
      "/written/theory/notion-gap-metal-crystal-lattices-deformation#principle",
    );
    expect(latticeLinks[1]).toHaveAttribute(
      "href",
      "/written/theory/notion-gap-metal-crystal-lattices-deformation",
    );

    unmount();

    render(
      <WrittenSubjectMemoryGuide
        subjectCode={4}
        heading="개량보전 연결 시험"
        description="근거 앵커 확인"
        parts={[{ id: "maintenance", label: "보전·신뢰성" }]}
        bundles={[
          {
            id: "maintenance-methods",
            part: "보전·신뢰성",
            title: "사후·예방·예지·개량·보전예방",
            memoryLine: "보전 방식 구분",
            facts: [
              {
                id: "s4-maintenance-methods-improvement-maintenance-cm",
                cue: "개량보전 CM",
                answer: "기존 설비의 약점을 고쳐 재발을 막습니다.",
                detailLessonTitles: ["상태기준보전"],
              },
            ],
            traps: [],
            detailLessonTitles: ["상태기준보전"],
            cbtStatusNote: "연결 검수 중",
          },
        ]}
        lessons={[{ id: "lesson-1d16t6u", title: "상태기준보전" }]}
        questions={[]}
      />,
    );

    const maintenanceLinks = screen.getAllByRole("link", {
      name: /상태기준보전/,
    });
    expect(maintenanceLinks).toHaveLength(2);
    expect(maintenanceLinks[0]).toHaveAttribute(
      "href",
      "/written/theory/lesson-1d16t6u#definition",
    );
    expect(maintenanceLinks[1]).toHaveAttribute(
      "href",
      "/written/theory/lesson-1d16t6u",
    );
  });
});
