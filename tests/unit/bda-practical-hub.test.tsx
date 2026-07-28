import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import rawLibrary from "@/data/generated/bda-course-library.json";
import { BdaPracticalHub } from "@/components/bda-practical-hub";
import { bdaCourseLibrarySchema } from "@/lib/domain/bda-course-library";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("BDA 실기·AI 실무 허브", () => {
  const library = bdaCourseLibrarySchema.parse(rawLibrary);
  const conceptNames = {
    C005: "분석 문제 정의",
    C006: "분석 로드맵과 작업계획",
    C037: "실기 유형1 데이터 처리",
    C038: "실기 유형2 예측 파일 제출",
    C039: "실기 유형3 통계검정",
    C040: "데이터 윤리·데이터누수",
  };

  it("모든 탭을 접근 가능한 링크형 탭으로 제공한다", () => {
    render(
      <BdaPracticalHub
        activeTab="overview"
        library={library}
        practicalTaskCount={58}
        conceptNames={conceptNames}
      />,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(7);
    expect(screen.getByRole("tab", { name: /시험 안내/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /원본 자료실/ })).toHaveAttribute(
      "href",
      "/bda/practical?tab=course-library",
    );
  });

  it("시험 안내 탭에 공통 흐름·연결 개념·코드 레슨을 함께 표시한다", () => {
    render(
      <BdaPracticalHub
        activeTab="overview"
        library={library}
        practicalTaskCount={58}
        conceptNames={conceptNames}
      />,
    );
    expect(screen.getByText("모든 유형의 공통 풀이 순서")).toBeInTheDocument();
    expect(screen.getByText(/C040 데이터 윤리·데이터누수/)).toBeInTheDocument();
    expect(screen.getByText("시험 환경과 패키지 버전 확인")).toBeInTheDocument();
  });
});
