import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BdaPracticalTabs } from "@/components/bda-practical-tabs";

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

describe("BDA 실기 탭 키보드 탐색", () => {
  it("선택 탭만 순차 탭 이동 대상에 둔다", () => {
    render(<BdaPracticalTabs activeTab="type2" />);
    expect(screen.getByRole("tab", { name: /유형 2/ })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("tab", { name: /시험 안내/ })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("좌우·Home·End 키로 탭 포커스를 순환한다", () => {
    render(<BdaPracticalTabs activeTab="overview" />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();

    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(tabs[1]).toHaveFocus();

    fireEvent.keyDown(tabs[1], { key: "End" });
    expect(tabs.at(-1)).toHaveFocus();

    fireEvent.keyDown(tabs.at(-1)!, { key: "ArrowRight" });
    expect(tabs[0]).toHaveFocus();

    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(tabs.at(-1)).toHaveFocus();

    fireEvent.keyDown(tabs.at(-1)!, { key: "Home" });
    expect(tabs[0]).toHaveFocus();
  });
});
