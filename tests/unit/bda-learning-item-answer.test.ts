import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/bda/bank/answer/route";
import {
  getBdaLearningPractice,
  getBdaQbank,
  toPublicBdaQbankLearningSummary,
} from "@/lib/content/bda-qbank-repository";

describe("BDA reconstructed learning item answer gate", () => {
  it("keeps answers, explanations, and source URLs out of listing DTOs", () => {
    const summaries = getBdaQbank().learningItems.map(
      toPublicBdaQbankLearningSummary,
    );
    const serialized = JSON.stringify(summaries);

    expect(summaries).toHaveLength(183);
    expect(serialized).not.toContain("answerCore");
    expect(serialized).not.toContain("independentExplanation");
    expect(serialized).not.toContain("sourceUrl");
    expect(serialized).not.toContain("correctChoiceId");
  });

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
    expect(body.choiceFeedback).toHaveLength(4);
    expect(
      body.choiceFeedback.every(
        (choice: { rationale?: string }) => choice.rationale,
      ),
    ).toBe(true);
    expect(typeof body.isCorrect).toBe("boolean");
    expect(body.notice).toContain("공식 정답이 아니라");
  });

  it("refuses to grade an item that is still in the review queue", async () => {
    expect(getBdaLearningPractice("YJ69_002")).toBeUndefined();

    const response = await POST(
      new Request("http://localhost/api/bda/bank/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: "YJ69_002",
          choiceId: "YJ69_002-choice-1",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("재검수");
    expect(body).not.toHaveProperty("correctChoice");
    expect(body).not.toHaveProperty("answerCore");
  });
});
