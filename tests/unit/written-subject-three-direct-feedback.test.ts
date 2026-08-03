import { describe, expect, it } from "vitest";

import {
  GOLDEN_LESSONS,
  GOLDEN_QUESTION_FEEDBACK,
} from "@/data/source/golden-content";
import generatedContent from "@/data/generated/content.json";
import { choiceFeedbackPasses } from "@/lib/content/enrichment";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const runtime = buildRuntimeContent(generatedContent as GeneratedContent);

describe("subject 3 U-073 direct feedback", () => {
  it("explains every measuring instrument by its measurement and reference-axis placement", () => {
    const feedback = GOLDEN_QUESTION_FEEDBACK["U-073"];
    expect(feedback).toBeDefined();
    expect(Object.keys(feedback).map(Number).sort((left, right) => left - right)).toEqual([
      1,
      2,
      3,
      4,
    ]);

    expect(feedback[1].rationale).toContain("기준 길이");
    expect(feedback[2].rationale).toContain("오프셋");
    expect(feedback[3].rationale).toContain("같은 직선");
    expect(feedback[4].rationale).toContain("떨어져");
    expect(feedback[1].differenceFromCorrect).toContain("외측 마이크로미터");
    expect(feedback[2].differenceFromCorrect).toContain("외측 마이크로미터");
    expect(feedback[4].differenceFromCorrect).toContain("외측 마이크로미터");

    for (const choiceIndex of [1, 2, 3, 4]) {
      expect(
        choiceFeedbackPasses(feedback[choiceIndex], choiceIndex === 3),
        `choice ${choiceIndex}`,
      ).toBe(true);
    }
  });

  it("keeps the question-specific exam-point block available without treating it as a source-level anchor override", () => {
    const examPoint = GOLDEN_LESSONS["아베 원리"].blocks.find(
      (block) => block.id === "exam-point",
    );

    expect(examPoint?.title).toBe("U-073 판단 기준");
    expect(examPoint?.body).toContain("기준 눈금축이 일치하는 구조");
  });

  it("publishes the independently grounded backlog items", () => {
    const byId = new Map(
      runtime.questions.map((question) => [question.id, question]),
    );

    expect(isPublishableQuestion(byId.get("U-596")!)).toBe(true);
    expect(isPublishableQuestion(byId.get("U-594")!)).toBe(true);
    expect(isPublishableQuestion(byId.get("U-723")!)).toBe(true);
  });
});
