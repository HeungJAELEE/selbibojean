import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { normalizeCanonicalTaxonomy } from "@/lib/content/taxonomy-normalization";
import type { GeneratedContent } from "@/lib/domain/types";

const source = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src", "data", "generated", "content.json"),
    "utf8",
  ),
) as GeneratedContent;

describe("canonical 2025–2028 taxonomy", () => {
  const content = normalizeCanonicalTaxonomy(source);

  it("uses the current four subject names", () => {
    expect(content.subjects.map((subject) => subject.title)).toEqual([
      "공유압 및 자동제어",
      "용접 및 안전관리",
      "기계설비 일반",
      "설비진단 및 관리",
    ]);
  });

  it("moves arc and resistance processes out of the legacy welding basics bucket", () => {
    const co2Lesson = content.lessons.find(
      (lesson) => lesson.title === "CO₂ 아크용접",
    );
    const resistanceLesson = content.lessons.find(
      (lesson) => lesson.title === "저항용접",
    );

    expect(co2Lesson?.conceptGroupId).toBe("s2-g02");
    expect(resistanceLesson?.conceptGroupId).toBe("s2-g03");
    expect(
      content.questions.find(
        (question) => question.lessonId === co2Lesson?.id,
      )?.conceptGroupId,
    ).toBe("s2-g02");
    expect(
      content.questions.find(
        (question) => question.lessonId === resistanceLesson?.id,
      )?.conceptGroupId,
    ).toBe("s2-g03");
  });

  it("keeps every question in the same group as its linked lesson", () => {
    const groupByLessonId = new Map(
      content.lessons.map((lesson) => [lesson.id, lesson.conceptGroupId]),
    );
    expect(
      content.questions.filter(
        (question) =>
          question.conceptGroupId !== groupByLessonId.get(question.lessonId),
      ),
    ).toEqual([]);
  });

  it("does not keep draft questions on published lesson related lists", () => {
    const publishableQuestionIds = new Set(
      content.questions
        .filter((question) => question.contentStatus === "published")
        .map((question) => question.id),
    );
    expect(
      content.lessons
        .filter((lesson) => lesson.contentStatus === "published")
        .flatMap((lesson) =>
          lesson.relatedQuestionIds.filter(
            (questionId) => !publishableQuestionIds.has(questionId),
          ),
        ),
    ).toEqual([]);
  });
});
