import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import { WRITTEN_WELDING_DEFECTS } from "@/data/source/written-welding-defects";
import {
  getApprovedWeldingDefectContent,
  mergeApprovedWeldingDefectContent,
} from "@/lib/content/welding-defect-approved";
import { getPastExamExamples } from "@/lib/content/past-exam-examples";
import type { GeneratedContent } from "@/lib/domain/types";

describe("approved welding defect content", () => {
  it("publishes nine defect lessons with five source-backed mock questions each", () => {
    const supplement = getApprovedWeldingDefectContent();
    const mockQuestions = supplement.questions.filter((question) =>
      question.id.startsWith("WELD-DEF-"),
    );

    expect(WRITTEN_WELDING_DEFECTS).toHaveLength(9);
    expect(supplement.lessons).toHaveLength(9);
    expect(mockQuestions).toHaveLength(45);
    for (const lesson of supplement.lessons) {
      const defect = WRITTEN_WELDING_DEFECTS.find(
        (item) => item.id === lesson.id,
      );
      expect(
        mockQuestions.filter((question) => question.lessonId === lesson.id),
      ).toHaveLength(5);
      expect(lesson.relatedQuestionIds).toHaveLength(
        5 + (defect?.actualQuestionIds.length ?? 0),
      );
    }
  });

  it("keeps the two silver-spot originals with exact year, session and question numbers", () => {
    const supplement = getApprovedWeldingDefectContent();

    expect(supplement.variants).toEqual([
      expect.objectContaining({
        canonicalId: "WELD-ACTUAL-2009-Q51",
        year: 2009,
        sessionLabel: "제3회 용접기사 필기",
        questionNumber: 51,
        stem: "용접금속에서 수소의 영향이 아닌 것은?",
        answer: "④ 석출경화",
      }),
      expect.objectContaining({
        canonicalId: "WELD-ACTUAL-2009-Q54",
        year: 2009,
        sessionLabel: "제3회 용접기사 필기",
        questionNumber: 54,
        stem: "은점(fish eye)에 관한 설명 중 틀린 것은?",
        answer: "④ 불순물 S, P의 편석에 의한 것이다.",
      }),
    ]);
    expect(
      supplement.questions
        .filter((question) => question.id.startsWith("WELD-ACTUAL-"))
        .map((question) => question.lessonId),
    ).toEqual([
      "lesson-welding-defect-crack",
      "lesson-welding-defect-crack",
    ]);
  });

  it("exposes both originals as usable CBT examples on the silver-spot lesson", () => {
    const content = mergeApprovedWeldingDefectContent(
      generatedContent as GeneratedContent,
    );
    const examples = getPastExamExamples(
      content,
      "lesson-welding-defect-crack",
      5,
    );

    expect(examples.map((example) => example.questionNumber).sort()).toEqual([
      51, 54,
    ]);
    expect(
      examples.every(
        (example) =>
          example.year === 2009 &&
          example.sessionLabel === "제3회 용접기사 필기",
      ),
    ).toBe(true);
  });
});
