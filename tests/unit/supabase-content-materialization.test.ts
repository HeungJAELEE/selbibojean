import generatedContent from "@/data/generated/content.json";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import {
  buildSupabaseMaterialization,
  stableContentUuid,
} from "@/lib/content/supabase-materialization";
import { isPublishableQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";
import { describe, expect, it } from "vitest";

const runtime = buildRuntimeContent(generatedContent as GeneratedContent);
const plan = buildSupabaseMaterialization(
  runtime,
  "00000000-0000-4000-8000-000000000001",
);

describe("Supabase content materialization", () => {
  it("uses stable UUIDs for stable source identities", () => {
    const first = stableContentUuid("question", "U-001");
    expect(first).toBe(stableContentUuid("question", "U-001"));
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(first).not.toBe(stableContentUuid("choice", "U-001"));
  });

  it("materializes the complete runtime question bank", () => {
    const reviewedPublishedQuestionIds = new Set(
      runtime.variants
        .filter(
          (variant) =>
            variant.reviewed !== undefined &&
            variant.reviewState === "published",
        )
        .map((variant) => variant.canonicalId),
    );
    expect(plan.counts.questions).toBe(runtime.questions.length);
    expect(plan.counts.choices).toBe(
      runtime.questions.reduce(
        (total, question) => total + question.choices.length,
        0,
      ),
    );
    expect(plan.counts.questionVariants).toBe(runtime.variants.length);
    expect(plan.counts.publishedQuestions).toBe(
      runtime.questions.filter(
        (question) =>
          isPublishableQuestion(question) ||
          reviewedPublishedQuestionIds.has(question.id),
      ).length,
    );
    expect(plan.counts.answerKeys).toBe(plan.counts.questions);
    expect(plan.counts.questionConcepts).toBe(plan.counts.questions);
    expect(
      plan.questions
        .filter((question) => question.status === "published")
        .every(
          (question) =>
            question.answer_validated &&
            question.explanation_validated &&
            question.choice_feedback_validated &&
            question.theory_link_validated,
        ),
    ).toBe(true);
  });

  it("keeps answer-bearing data out of public question and variant rows", () => {
    expect(plan.questions.every((question) => question.explanation === "")).toBe(
      true,
    );
    const publicRows = JSON.stringify({
      questions: plan.questions,
      choices: plan.choices,
      questionVariants: plan.questionVariants,
    });
    expect(publicRows).not.toContain("correct_choice_id");
    expect(publicRows).not.toContain("answer_text");
    expect(publicRows).not.toContain("\"answer\":");
    expect(
      plan.questionVariants.every(
        (variant) =>
          !("answer" in variant.payload) &&
          !("explanation" in variant.payload) &&
          !("choices" in variant.payload),
      ),
    ).toBe(true);
  });

  it("maps every answer key and concept link to its owning question", () => {
    const choiceOwner = new Map(
      plan.choices.map((choice) => [choice.id, choice.question_id]),
    );
    expect(
      plan.answerKeys.every(
        (answer) =>
          choiceOwner.get(answer.correct_choice_id) === answer.question_id,
      ),
    ).toBe(true);
    expect(
      plan.questionConcepts.every(
        (relation) =>
          relation.question_id.length > 0 && relation.concept_id.length > 0,
      ),
    ).toBe(true);
  });

  it("is deterministic for the same runtime snapshot", () => {
    const replay = buildSupabaseMaterialization(
      runtime,
      "00000000-0000-4000-8000-000000000001",
    );
    expect(replay.digest).toBe(plan.digest);
    expect(replay.counts).toEqual(plan.counts);
  });
});
