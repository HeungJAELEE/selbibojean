import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LessonExamTypes } from "@/components/lesson-exam-types";
import generatedContent from "@/data/generated/content.json";
import { getPastExamPatternSummary } from "@/lib/content/past-exam-examples";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent } from "@/lib/domain/types";

const REPRESENTATIVE_QUESTION_ID = "U-081";
const REPRESENTATIVE_LESSON_ID = "lesson-1ec09vl";

describe("lesson theory answer safety", () => {
  it("keeps an approved runtime question's answers and explanations out of theory SSR", () => {
    const content = buildRuntimeContent(generatedContent as GeneratedContent);
    const representative = content.questions.find(
      (question) => question.id === REPRESENTATIVE_QUESTION_ID,
    );
    expect(representative?.approvedReview).toBeDefined();

    const summary = getPastExamPatternSummary(
      content,
      REPRESENTATIVE_LESSON_ID,
      5,
    );
    const serializedSummary = JSON.stringify(summary);
    const html = renderToStaticMarkup(
      <LessonExamTypes summary={summary} authoredPoints={[]} />,
    );

    expect(summary.total).toBeGreaterThan(0);
    const answerBearingText = [
      representative!.answerText,
      representative!.explanation,
      representative!.approvedReview!.directSolution,
      ...representative!.choices.map((choice) => choice.feedback.rationale),
    ];
    for (const protectedText of answerBearingText) {
      expect(serializedSummary).not.toContain(protectedText);
      expect(html).not.toContain(protectedText);
    }
  }, 60_000);
});
