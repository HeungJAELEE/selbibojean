import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { notionGapWrittenLessons } from "@/lib/content/notion-gap-written-lessons";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import { supplementalWrittenLessons } from "@/lib/content/supplemental-written-lessons";
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

  it("freezes the reviewed-integration runtime publication baseline", () => {
    expect(content.questions.filter(isPublishableQuestion)).toHaveLength(1490);
    expect(content.lessons.filter(isPublishableLesson)).toHaveLength(1283);
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

    expect(audited).toHaveLength(297);
    expect(
      audited.filter((question) => question.audit?.scope === "review_queue"),
    ).toHaveLength(274);
    expect(
      audited.filter(
        (question) => question.audit?.scope === "high_risk_public",
      ),
    ).toHaveLength(23);
    expect(held).toHaveLength(113);
    expect(held.some(isPublishableQuestion)).toBe(false);
    expect(
      held.every(
        (question) =>
          Boolean(question.audit?.reviewNote.trim()) &&
          Boolean(question.audit?.nextAction.trim()),
      ),
    ).toBe(true);
  });

  it("keeps reviewed choice conflicts blocked with canonical answer-conflict blockers", () => {
    const questionById = new Map(
      content.questions.map((question) => [question.id, question]),
    );
    const lessonById = new Map(
      content.lessons.map((lesson) => [lesson.id, lesson]),
    );

    for (const canonicalId of ["U-1215", "U-1161", "U-1166", "U-1072", "U-1089"]) {
      const question = questionById.get(canonicalId);
      expect(question).toBeDefined();
      expect(question?.contentStatus).toBe("in_review");
      expect(question?.publication).toMatchObject({
        readiness: "blocked",
        blockers: expect.arrayContaining(["answer_conflict"]),
      });
      expect(question?.publication?.blockers).not.toContain(
        "choice_conflict_non_scoring",
      );
      expect(question?.publication?.blockers).not.toContain(
        "answer_key_correction_pending_runtime_validation",
      );
      expect(isPublishableQuestion(question!)).toBe(false);

      const lesson = lessonById.get(question!.lessonId);
      expect(lesson).toBeDefined();
      expect(isPublishableLesson(lesson!)).toBe(false);
    }
  });

  it("keeps canonical runtime-integration repairs mapping-gated", () => {
    for (const canonicalId of ["U-649", "U-478"]) {
      const question = content.questions.find((item) => item.id === canonicalId);
      expect(question).toBeDefined();
      expect(question?.publication).toMatchObject({
        readiness: "blocked",
        blockers: expect.arrayContaining(["mapping_unverified"]),
      });
      expect(isPublishableQuestion(question!)).toBe(false);
    }
  });

  it("publishes supplemental theory while keeping it outside question statistics", () => {
    const supplemental = content.lessons.filter(
      (lesson) => lesson.contentRole === "supplemental",
    );

    expect(supplemental).toHaveLength(
      supplementalWrittenLessons.length + notionGapWrittenLessons.length,
    );
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
