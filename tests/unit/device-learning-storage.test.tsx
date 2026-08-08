import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeviceLearningStorage } from "@/components/device-learning-storage";
import { GUEST_ATTEMPTS_KEY } from "@/lib/learning/guest-attempt-storage";

const storedAttempt = {
  questionId: "question-1",
  selectedChoiceId: "choice-2",
  isCorrect: true,
  selfRating: "unsure",
  attemptKind: "initial",
  attemptedAt: "2026-08-01T00:00:00.000Z",
  dueAt: "2026-08-04T00:00:00.000Z",
};

describe("device learning storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clearly marks guest learning as stored on this device only", () => {
    localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify([storedAttempt]));

    render(<DeviceLearningStorage authenticated={false} />);

    expect(
      screen.getByRole("heading", {
        name: "비로그인 · 이 기기에만 저장 중",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/학습 기록 1개/)).toBeInTheDocument();
  });

  it("merges only after an authenticated user presses the button", async () => {
    localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify([storedAttempt]));
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, merged: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    render(<DeviceLearningStorage authenticated />);
    expect(fetch).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", {
        name: "현재 기기 기록을 계정에 합치기",
      }),
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/account/merge-guest-learning",
        expect.objectContaining({ method: "POST" }),
      );
    });
    await waitFor(() => {
      expect(localStorage.getItem(GUEST_ATTEMPTS_KEY)).toBeNull();
    });
    expect(
      screen.getByText("1개 학습 기록을 계정에 병합했습니다."),
    ).toBeInTheDocument();
  });

  it("keeps local records when the merge is incomplete", async () => {
    localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify([storedAttempt]));
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "기기 기록 전체를 병합하지 못했습니다.",
          merged: 0,
        }),
        {
          status: 503,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    render(<DeviceLearningStorage authenticated />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "현재 기기 기록을 계정에 합치기",
      }),
    );

    await screen.findByText("기기 기록 전체를 병합하지 못했습니다.");
    expect(localStorage.getItem(GUEST_ATTEMPTS_KEY)).not.toBeNull();
  });
});
