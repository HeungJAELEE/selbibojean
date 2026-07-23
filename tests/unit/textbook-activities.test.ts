import { describe, expect, it } from "vitest";
import data from "@/data/generated/content.json";
import {
  getTextbookActivities,
  getTextbookActivity,
  textbookActivitySchema,
} from "@/lib/content/textbook-activities";
import { getApprovedWeldingProcessContent } from "@/lib/content/welding-process-approved";

describe("textbook activities", () => {
  it("publishes the four exam-linked activities with valid contracts", () => {
    const activities = getTextbookActivities();

    expect(activities).toHaveLength(4);
    expect(activities.map((activity) => activity.type)).toEqual([
      "accumulator-pressure",
      "pid-effects",
      "welding-classification",
      "welding-classification",
    ]);

    for (const activity of activities) {
      expect(textbookActivitySchema.parse(activity)).toEqual(activity);
      expect(activity.gradingPolicy).toBe("exploration:no-answer");
      expect(activity.hints.length).toBeGreaterThanOrEqual(2);
      expect(activity.status).toBe("published");
      expect(activity.version).toBe(1);
    }
  });

  it("links only existing published questions and contains no answer payload", () => {
    const questions = new Map(
      [
        ...data.questions,
        ...getApprovedWeldingProcessContent().questions,
      ].map((question) => [question.id, question]),
    );

    for (const activity of getTextbookActivities()) {
      for (const questionId of activity.questionIds) {
        expect(questions.get(questionId)?.contentStatus).toBe("published");
      }
      const serialized = JSON.stringify(activity);
      expect(serialized).not.toContain("correctChoiceId");
      expect(serialized).not.toContain("answerText");
      expect(serialized).not.toContain("choiceFeedback");
      expect(serialized).not.toContain("explanation");
    }
  });

  it("compares all five arc-welding processes by electrode and shielding", () => {
    const activity = getTextbookActivity("s2-g02", "process");

    expect(activity?.type).toBe("welding-classification");
    if (!activity || activity.type !== "welding-classification") {
      throw new Error("s2-g02:process 용접 공정 활동을 찾을 수 없습니다.");
    }

    expect(activity.config.options.map((option) => option.id)).toEqual([
      "smaw",
      "gtaw",
      "gmaw",
      "fcaw",
      "saw",
    ]);
    expect(activity.questionIds).toEqual([
      "WELD-PROC-001",
      "WELD-PROC-002",
      "WELD-PROC-003",
      "WELD-PROC-004",
      "WELD-PROC-005",
    ]);
    expect(activity.sourceRefs).toEqual(
      activity.questionIds.map((questionId) => `question:${questionId}`),
    );

    const comparisonText = activity.config.options
      .map((option) => `${option.filler} ${option.principle}`)
      .join(" ");
    expect(comparisonText).toContain("비소모성 텅스텐 전극");
    expect(comparisonText).toContain("소모성 솔리드 와이어");
    expect(comparisonText).toContain("플럭스가 충전된");
    expect(comparisonText).toContain("입상 플럭스");
    expect(comparisonText).toContain("불활성 보호가스");
  });

  it("resolves activities only for the intended concept families", () => {
    expect(getTextbookActivity("s1-g02", "accumulator")?.type).toBe("accumulator-pressure");
    expect(getTextbookActivity("s1-g11", "action")?.type).toBe("pid-effects");
    expect(getTextbookActivity("s2-g01", "classification")?.type).toBe("welding-classification");
    expect(getTextbookActivity("s2-g02", "process")?.type).toBe("welding-classification");
    expect(getTextbookActivity("s4-g14", "application")).toBeUndefined();
  });
});
