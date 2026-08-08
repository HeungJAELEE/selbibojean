import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getExamSubjectCheatSheet } from "@/data/source/practical-exam-subject-summaries";
import {
  LEARNER_CONTENT_POLICY_BY_ID,
  isLearnerVisibleContentId,
  isLearnerVisiblePolicy,
  isLearnerVisiblePracticalQuestion,
} from "@/lib/content/learner-visibility";
import type {
  LearnerContentPolicy,
  PracticalContent,
} from "@/lib/domain/practical-types";

const content = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src/data/generated/practical-content.json"),
    "utf8",
  ),
) as PracticalContent;

describe("learner-facing welding calculation boundary", () => {
  it("hides every explicitly tagged welding calculation", () => {
    const weldingCalculationIds = Object.entries(
      LEARNER_CONTENT_POLICY_BY_ID,
    )
      .filter(([, policy]) => policy.topic === "welding_calculation")
      .map(([id]) => id);

    expect(weldingCalculationIds).toEqual([
      "PCON-SUP-002",
      "EXP-SUP-002",
      "PCON-SUP-018",
      "EXP-SUP-018",
    ]);
    expect(
      weldingCalculationIds.every(
        (id) => !isLearnerVisibleContentId(id),
      ),
    ).toBe(true);
  });

  it("keeps the source records for internal review", () => {
    expect(content.concepts.some((item) => item.id === "PCON-SUP-002")).toBe(
      true,
    );
    expect(content.concepts.some((item) => item.id === "PCON-SUP-018")).toBe(
      true,
    );
    expect(content.questions.some((item) => item.id === "EXP-SUP-002")).toBe(
      true,
    );
    expect(content.questions.some((item) => item.id === "EXP-SUP-018")).toBe(
      true,
    );
  });

  it("does not hide non-welding calculations", () => {
    const nonWeldingCalculation: LearnerContentPolicy = {
      topic: "other",
      visibility: "learner_public",
    };
    expect(isLearnerVisiblePolicy(nonWeldingCalculation)).toBe(true);
    expect(isLearnerVisibleContentId("PCON-025")).toBe(true);
  });

  it("keeps subject 2 summary links inside the learner-visible boundary", () => {
    const summary = getExamSubjectCheatSheet("subject-2");
    expect(summary).toBeDefined();
    expect(
      summary?.sharedCore.every((fact) =>
        isLearnerVisibleContentId(fact.conceptId),
      ),
    ).toBe(true);
    expect(
      summary?.practicalWritten.representativeQuestionIds.every(
        isLearnerVisibleContentId,
      ),
    ).toBe(true);
  });

  it("hides a public question when any linked concept is internal only", () => {
    expect(
      isLearnerVisiblePracticalQuestion({
        id: "SAFE-QUESTION",
        conceptIds: ["PCON-SUP-018"],
      }),
    ).toBe(false);
  });
});
