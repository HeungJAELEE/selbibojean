import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/bda/bank/answer/route";
import { getBdaLearningPractice } from "@/lib/content/bda-qbank-repository";

describe("BDA reconstructed learning item answer gate", () => {
  it("publishes a question and four choices without the correct choice id", () => {
    const practice = getBdaLearningPractice("YJ69_001");

    expect(practice?.publicItem.questionStem).toBeTruthy();
    expect(practice?.publicItem.choices).toHaveLength(4);
    expect(practice?.publicItem).not.toHaveProperty("correctChoiceId");
  });

  it("rejects answer requests without a selected choice", async () => {
    const response = await POST(
      new Request("http://localhost/api/bda/bank/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: "YJ69_001", choiceId: "" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns the answer and explanation only after a valid choice submission", async () => {
    const practice = getBdaLearningPractice("YJ69_001");
    const choiceId = practice?.publicItem.choices[0]?.id;
    expect(choiceId).toBeTruthy();

    const response = await POST(
      new Request("http://localhost/api/bda/bank/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: "YJ69_001",
          choiceId,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.answerCore).toBeTruthy();
    expect(body.correctChoice).toBeTruthy();
    expect(typeof body.isCorrect).toBe("boolean");
    expect(body.notice).toContain("공식 정답이 아니라");
  });
});
