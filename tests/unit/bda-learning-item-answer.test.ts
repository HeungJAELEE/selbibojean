import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/bda/bank/answer/route";

describe("BDA reconstructed learning item answer gate", () => {
  it("rejects answer requests without an attempt", async () => {
    const response = await POST(
      new Request("http://localhost/api/bda/bank/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: "YJ69_001", attempt: "" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns the answer core only after a non-empty attempt", async () => {
    const response = await POST(
      new Request("http://localhost/api/bda/bank/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: "YJ69_001",
          attempt: "먼저 작성한 학습자 답안",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.answerCore).toBeTruthy();
    expect(body.notice).toContain("공식 정답이 아니라");
  });
});
