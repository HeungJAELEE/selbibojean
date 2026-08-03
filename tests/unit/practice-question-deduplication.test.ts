import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  selectDeduplicatedPracticeQuestions,
  type PracticeQuestionDeduplicationCandidate,
} from "@/lib/content/practice-question-deduplication";

function candidate(
  id: string,
  overrides: Partial<PracticeQuestionDeduplicationCandidate> = {},
): PracticeQuestionDeduplicationCandidate {
  return {
    id,
    lessonId: "lesson-a",
    stem: `Question ${id}`,
    choices: ["one", "two", "three", "four"],
    ...overrides,
  };
}

describe("practice question deduplication", () => {
  it("applies exact deduplication after the existing eligible-question selectors", async () => {
    const route = await readFile(
      path.join(process.cwd(), "src/app/api/practice/session/route.ts"),
      "utf8",
    );

    expect(route).toContain('from "@/lib/content/practice-question-deduplication"');
    expect(route).toContain("selectSessionQuestions(");
    expect(route).toContain("selectAllocatedSessionQuestions(");
    expect(route).toContain('selectPracticeQuestions(questions, filter, "all", seed)');
    expect(route).toContain("filterPracticeContentByYearRange(");
    expect(route).toContain("createPracticePresentations(");
  });

  it("keeps at most one candidate for explicit, canonical, or exact-content duplicate groups", () => {
    const result = selectDeduplicatedPracticeQuestions(
      [
        candidate("canonical-1", { canonicalId: "canonical-a" }),
        candidate("canonical-2", { canonicalId: "canonical-a" }),
        candidate("declared-1", { duplicateGroupId: "declared-a" }),
        candidate("declared-2", { duplicateGroupId: "declared-a" }),
        candidate("exact-1", {
          stem: "Exact stem",
          choices: ["a", "b", "c", "d"],
        }),
        candidate("exact-2", {
          stem: "  Exact   stem ",
          choices: ["d", "c", "b", "a"],
        }),
        candidate("different-choice", {
          stem: "Exact stem",
          choices: ["a", "b", "c", "other"],
        }),
      ],
      { count: "all", seed: 20260803 },
    );

    expect(result.map((item) => item.id)).toHaveLength(4);
    expect(result.map((item) => item.id)).toEqual(
      expect.arrayContaining(["different-choice"]),
    );
    expect(
      result.filter((item) => item.canonicalId === "canonical-a"),
    ).toHaveLength(1);
    expect(
      result.filter((item) => item.duplicateGroupId === "declared-a"),
    ).toHaveLength(1);
    expect(
      result.filter(
        (item) => item.stem.includes("Exact") && item.id !== "different-choice",
      ),
    ).toHaveLength(1);
  });

  it("prioritizes lower essential ranks within each requested lesson and is repeatable for a seed", () => {
    const candidates = [
      candidate("a-rank-2", { lessonId: "lesson-a", essentialRank: 2 }),
      candidate("a-rank-1", { lessonId: "lesson-a", essentialRank: 1 }),
      candidate("a-unranked", { lessonId: "lesson-a" }),
      candidate("b-rank-2", { lessonId: "lesson-b", essentialRank: 2 }),
      candidate("b-rank-1", { lessonId: "lesson-b", essentialRank: 1 }),
    ];

    const options = {
      count: 3,
      seed: 19,
      lessonTargets: { "lesson-a": 2, "lesson-b": 1 },
    };
    const first = selectDeduplicatedPracticeQuestions(candidates, options);
    const second = selectDeduplicatedPracticeQuestions(candidates, options);

    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
    expect(first.map((item) => item.id)).toEqual([
      "a-rank-1",
      "a-rank-2",
      "b-rank-1",
    ]);
  });

  it("silently fills an under-supplied lesson target from other eligible lessons", () => {
    const result = selectDeduplicatedPracticeQuestions(
      [
        candidate("a-only", { lessonId: "lesson-a", canonicalId: "same" }),
        candidate("a-duplicate", { lessonId: "lesson-a", canonicalId: "same" }),
        candidate("b-one", { lessonId: "lesson-b" }),
        candidate("c-one", { lessonId: "lesson-c" }),
      ],
      {
        count: 3,
        seed: 7,
        lessonTargets: { "lesson-a": 2 },
      },
    );

    expect(result).toHaveLength(3);
    expect(new Set(result.map((item) => item.id)).size).toBe(3);
    expect(result.filter((item) => item.canonicalId === "same")).toHaveLength(
      1,
    );
    expect(result.map((item) => item.lessonId)).toEqual(
      expect.arrayContaining(["lesson-b", "lesson-c"]),
    );
  });
});
