import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RandomPractice } from "@/components/random-practice";
import { WrittenMockSetup } from "@/components/written-mock-setup";
import type { Subject } from "@/lib/domain/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

const subjects: Subject[] = [
  {
    id: "subject-1",
    code: 1,
    title: "공유압",
    shortTitle: "공유압",
    description: "공유압 기초",
    color: "#16697a",
  },
];

describe("practice choice shuffle controls", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sessionId: "session-1",
            storage: "guest",
            availableCount: 0,
            limited: false,
            shuffleChoices: false,
            questions: [],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("sends the custom mock shuffle toggle as an explicit boolean", async () => {
    render(
      <WrittenMockSetup
        subjects={subjects}
        availableBySubject={{ "subject-1": 20 }}
        sourceBankBySubject={{ "subject-1": 323 }}
        availableYears={[2025]}
        availableByYearRange={{ "2025-2025": { "subject-1": 20 } }}
        choiceShuffleEnabled
      />,
    );

    expect(
      screen.getByText(/기출 원장 323문제는 전부 보존합니다/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/기출 원장 323문제/)).toHaveLength(2);
    expect(
      screen.getByText(/보강 대기 303문제는 삭제하지 않고/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /보기 순서 섞기/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /커스텀 모의고사 시작/ }),
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const request = vi.mocked(fetch).mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      mode: "mock",
      shuffleChoices: false,
    });
  });

  it("shows random-mode shuffle only behind the flag and sends its value", async () => {
    render(
      <RandomPractice
        subjects={subjects}
        groups={[]}
        choiceShuffleEnabled
      />,
    );

    const toggle = screen.getByRole("checkbox", {
      name: /보기 순서 섞기/,
    });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    fireEvent.click(
      screen.getByRole("button", { name: "중복 없이 랜덤 시작" }),
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const request = vi.mocked(fetch).mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      mode: "all",
      shuffleChoices: false,
    });
  });

  it("does not expose or enable shuffle when the release flag is off", async () => {
    render(
      <RandomPractice
        subjects={subjects}
        groups={[]}
        choiceShuffleEnabled={false}
      />,
    );

    expect(
      screen.queryByRole("checkbox", { name: /보기 순서 섞기/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "중복 없이 랜덤 시작" }),
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const request = vi.mocked(fetch).mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body)).shuffleChoices).toBe(false);
  });
});
