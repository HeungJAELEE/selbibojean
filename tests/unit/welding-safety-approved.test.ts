import { describe, expect, it } from "vitest";

import {
  getApprovedWeldingSafetyContent,
  mergeApprovedWeldingSafetyContent,
} from "@/lib/content/welding-safety-approved";
import { isPublishableQuestion, toPublicQuestion } from "@/lib/domain/practice";
import type { GeneratedContent } from "@/lib/domain/types";

describe("33차 용접 안전 명시 승인 게이트", () => {
  it("원본상 검수대기인 150문항과 30개 레슨을 공개하지 않는다", () => {
    const supplement = getApprovedWeldingSafetyContent();

    expect(supplement.audit).toEqual({
      reviewedQuestions: 150,
      publishedQuestions: 0,
      heldQuestions: 150,
      publishedLessons: 0,
      heldLessons: 30,
      invalidAnswerLinks: 0,
      invalidTheoryLinks: 0,
      invalidChoiceFeedback: 0,
    });
    expect(supplement.questions.some(isPublishableQuestion)).toBe(false);
    expect(
      supplement.lessons.every(
        (lesson) =>
          lesson.contentStatus === "in_review" &&
          lesson.quality.passed &&
          lesson.sourceNeeded,
      ),
    ).toBe(true);
  });

  it("제출 전 공개 문제에는 정답·해설·선택지 피드백을 포함하지 않는다", () => {
    const supplement = getApprovedWeldingSafetyContent();
    const publicQuestion = toPublicQuestion(supplement.questions[0]);

    expect(publicQuestion).not.toHaveProperty("correctChoiceId");
    expect(publicQuestion).not.toHaveProperty("answerText");
    expect(publicQuestion).not.toHaveProperty("explanation");
    expect(publicQuestion.choices[0]).not.toHaveProperty("feedback");
  });

  it("기존 콘텐츠와 병합할 때 기존 ID를 덮어쓰지 않는다", () => {
    const supplement = getApprovedWeldingSafetyContent();
    const existing = {
      formatVersion: 2,
      subjects: [],
      conceptGroups: [],
      questions: [supplement.questions[0]],
      lessons: [supplement.lessons[0]],
      variants: [],
      backlog: [],
      report: {
        generatedAt: "",
        sourceFile: "",
        sourceSha256: "",
        rows: { originals: 0, canonicalQuestions: 0, mappings: 0, backlog: 0 },
        expected: {
          originals: 0,
          canonicalQuestions: 0,
          mappings: 0,
          backlog: 0,
        },
        exactMatch: true,
        uniqueConcepts: 0,
        canonicalConcepts: 0,
        numberOnlyAnswers: 0,
        reviewStatusCount: 0,
        publishedQuestionCount: 1,
        reviewQuestionCount: 0,
        blockedQuestionCount: 0,
        publication: {
          ready: 1,
          review: 0,
          blocked: 0,
          blockerCounts: {
            incomplete: 0,
            answer_unverified: 0,
            mapping_unverified: 0,
            asset_required: 0,
            answer_conflict: 0,
            authoritative_source_required: 0,
            high_risk_source: 0,
            content_quality: 0,
            lesson_source_needed: 0,
          },
        },
        verification: {
          verified: 1,
          blocked: 0,
          workbookConfirmed: 0,
          sourceBackedReconstruction: 0,
          authoritativeSourceVerified: 1,
          manualSourceRequired: 0,
          riskCounts: {
            asset_required: 0,
            answer_conflict: 0,
            authoritative_source_required: 0,
            historical_context: 0,
            editorial_reconstruction: 0,
          },
        },
        coverage: { covered: 1, partial: 0, missing: 0, blocked: 0 },
        quality: {
          lessonPassed: 1,
          lessonFailed: 0,
          choiceFeedbackPassed: 4,
          choiceFeedbackFailed: 0,
          genericPhraseMatches: 0,
          languageIssueMatches: 0,
        },
        groupQuality: [],
        warnings: [],
      },
    } satisfies GeneratedContent;

    const merged = mergeApprovedWeldingSafetyContent(existing);
    expect(new Set(merged.questions.map((question) => question.id)).size).toBe(
      merged.questions.length,
    );
    expect(new Set(merged.lessons.map((lesson) => lesson.id)).size).toBe(
      merged.lessons.length,
    );
    expect(merged.questions).toHaveLength(150);
    expect(merged.lessons).toHaveLength(30);
  });
});
