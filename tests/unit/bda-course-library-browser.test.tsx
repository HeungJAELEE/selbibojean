import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  BdaCourseLibraryBrowser,
  type PublicBdaCourseResource,
} from "@/components/bda-course-library-browser";

const items: PublicBdaCourseResource[] = [
  {
    id: "course_0000000000000001",
    relativePath: "AI실무기본_2주차/데이터전처리/실습.ipynb",
    fileName: "실습.ipynb",
    title: "데이터 전처리 실습",
    extension: ".ipynb",
    bytes: 10_000,
    sourceGroup: "ai-practice-course",
    week: 2,
    domain: "data-handling",
    role: "notebook",
    practicalTrack: "type1",
    examRelevance: "core",
    handling: "metadata-only",
    reviewFlags: [],
    notebook: {
      totalCells: 12,
      codeCells: 8,
      markdownCells: 4,
      firstHeading: "전처리",
    },
  },
  {
    id: "course_0000000000000002",
    relativePath: "AI실무기본_4주차/딥러닝/PyTorch.pdf",
    fileName: "PyTorch.pdf",
    title: "PyTorch 기본",
    extension: ".pdf",
    bytes: 20_000,
    sourceGroup: "ai-practice-course",
    week: 4,
    domain: "deep-learning",
    role: "lecture",
    practicalTrack: "supplementary",
    examRelevance: "supplementary",
    handling: "metadata-only",
    reviewFlags: ["copyright-review"],
  },
];

afterEach(cleanup);

describe("BDA AI 교육자료 브라우저", () => {
  it("검색과 시험 연관성 필터를 함께 적용한다", () => {
    render(<BdaCourseLibraryBrowser items={items} />);
    expect(screen.getByText("2개 자료")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("파일명·경로·확장자 검색"), {
      target: { value: "PyTorch" },
    });
    expect(screen.getByText("1개 자료")).toBeInTheDocument();
    expect(screen.getByText("PyTorch 기본")).toBeInTheDocument();
    expect(screen.queryByText("데이터 전처리 실습")).not.toBeInTheDocument();
  });

  it("검색 결과가 없을 때 복구 가능한 빈 상태를 보여준다", () => {
    render(<BdaCourseLibraryBrowser items={items} />);
    fireEvent.change(screen.getByPlaceholderText("파일명·경로·확장자 검색"), {
      target: { value: "일치하지않는검색어" },
    });
    expect(screen.getByText("일치하는 자료가 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "초기화" })).toBeEnabled();
  });

  it("시스템 파일을 숨기고 시험 연관성이 높은 자료부터 보여준다", () => {
    const hiddenSystemItem = {
      ...items[0],
      id: "course_0000000000000003",
      relativePath: "1주차/.DS_Store",
      fileName: ".DS_Store",
      title: ".DS_Store",
      extension: ".ds_store",
      handling: "exclude-runtime",
      examRelevance: "manual-review",
    } satisfies PublicBdaCourseResource;

    render(
      <BdaCourseLibraryBrowser
        items={[items[1], hiddenSystemItem, items[0]]}
      />,
    );

    expect(screen.getByText("2개 자료")).toBeInTheDocument();
    expect(screen.queryByText(".DS_Store")).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["데이터 전처리 실습", "PyTorch 기본"]);
  });

  it("더 보기 뒤 필터를 바꾸면 기본 표시 개수로 돌아간다", () => {
    const manyItems = Array.from({ length: 30 }, (_, index) => ({
      ...items[0],
      id: `course_${(index + 10).toString(16).padStart(16, "0")}`,
      title: `데이터 실습 ${String(index + 1).padStart(2, "0")}`,
      relativePath: `AI실무기본_2주차/데이터전처리/실습-${index + 1}.ipynb`,
    })) satisfies PublicBdaCourseResource[];

    render(<BdaCourseLibraryBrowser items={manyItems} />);
    expect(screen.getAllByRole("article")).toHaveLength(24);
    fireEvent.click(screen.getByRole("button", { name: /다음 6개 더 보기/ }));
    expect(screen.getAllByRole("article")).toHaveLength(30);

    fireEvent.change(screen.getByRole("combobox", { name: "자료 형식" }), {
      target: { value: "notebook" },
    });
    expect(screen.getAllByRole("article")).toHaveLength(24);
  });
});
