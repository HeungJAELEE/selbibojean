import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildRuntimeContent } from "@/lib/content/runtime-content";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

const base = JSON.parse(
  await readFile(
    path.join(process.cwd(), "src", "data", "generated", "content.json"),
    "utf8",
  ),
) as GeneratedContent;
const content = buildRuntimeContent(base);

describe("runtime merged content gates", () => {
  it("keeps IDs and question-to-lesson taxonomy relationships consistent", () => {
    expect(new Set(content.questions.map((item) => item.id)).size).toBe(
      content.questions.length,
    );
    expect(new Set(content.lessons.map((item) => item.id)).size).toBe(
      content.lessons.length,
    );
    const lessonById = new Map(
      content.lessons.map((lesson) => [lesson.id, lesson]),
    );
    expect(
      content.questions.filter((question) => {
        const lesson = lessonById.get(question.lessonId);
        return !lesson || lesson.conceptGroupId !== question.conceptGroupId;
      }),
    ).toEqual([]);
  });

  it("publishes a question only when its linked lesson is also publishable", () => {
    const lessonById = new Map(
      content.lessons.map((lesson) => [lesson.id, lesson]),
    );
    expect(
      content.questions
        .filter(isPublishableQuestion)
        .filter(
          (question) =>
            !isPublishableLesson(lessonById.get(question.lessonId)!),
        ),
    ).toEqual([]);
  });

  it("publishes reviewed 33rd-batch welding safety rows and keeps unresolved rows blocked", () => {
    const weldingQuestions = content.questions.filter((question) =>
      question.id.startsWith("welding-safety-b33-"),
    );
    const heldWelding = weldingQuestions.filter((question) =>
      question.audit?.auditDisposition.startsWith("held_"),
    );

    expect(weldingQuestions.filter(isPublishableQuestion)).toHaveLength(133);
    expect(heldWelding).toHaveLength(17);
    expect(heldWelding.some(isPublishableQuestion)).toBe(false);
  });

  it("applies the complete written-question audit and blocks every held item", () => {
    const audited = content.questions.filter((question) => question.audit);
    const held = audited.filter((question) =>
      question.audit?.auditDisposition.startsWith("held_"),
    );

    expect(audited).toHaveLength(281);
    expect(
      audited.filter((question) => question.audit?.scope === "review_queue"),
    ).toHaveLength(257);
    expect(
      audited.filter(
        (question) => question.audit?.scope === "high_risk_public",
      ),
    ).toHaveLength(24);
    expect(held).toHaveLength(95);
    expect(held.some(isPublishableQuestion)).toBe(false);
    expect(
      held.every(
        (question) =>
          Boolean(question.audit?.reviewNote.trim()) &&
          Boolean(question.audit?.nextAction.trim()),
      ),
    ).toBe(true);
  });

  it("publishes supplemental theory while keeping it outside question statistics", () => {
    const supplemental = content.lessons.filter(
      (lesson) => lesson.contentRole === "supplemental",
    );

    expect(supplemental).toHaveLength(14);
    expect(supplemental.every(isPublishableLesson)).toBe(true);
    expect(
      supplemental.every((lesson) => lesson.relatedQuestionIds.length === 0),
    ).toBe(true);
    const supplementalIds = new Set(supplemental.map((lesson) => lesson.id));
    expect(
      content.questions.some((question) =>
        supplementalIds.has(question.lessonId),
      ),
    ).toBe(false);
  });
});
