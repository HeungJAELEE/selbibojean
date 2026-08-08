import { describe, expect, it } from "vitest";

import { parseLessonExamPoints } from "@/components/lesson-exam-point-cards";

describe("lesson exam point cards", () => {
  it("parses learner-facing question and criterion pairs", () => {
    const points = parseLessonExamPoints(
      "**질문**\n첫 번째 질문\n\n**판단 기준**\n첫 번째 기준\n\n---\n\n" +
        "**질문**\n두 번째 질문\n\n**판단 기준**\n두 번째 기준",
    );

    expect(points).toEqual([
      { question: "첫 번째 질문", criterion: "첫 번째 기준" },
      { question: "두 번째 질문", criterion: "두 번째 기준" },
    ]);
  });

  it("does not turn unstructured lesson copy into partial cards", () => {
    expect(parseLessonExamPoints("일반 학습 문장")).toEqual([]);
  });
});
