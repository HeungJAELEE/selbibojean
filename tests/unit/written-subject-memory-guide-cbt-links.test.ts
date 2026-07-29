import { describe, expect, it } from "vitest";
import generatedContent from "@/data/generated/content.json";
import { WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE } from "@/data/source/written-subject-four-memory-guide";
import { WRITTEN_SUBJECT_ONE_MEMORY_GUIDE } from "@/data/source/written-subject-one-memory-guide";
import { WRITTEN_SUBJECT_THREE_MEMORY_GUIDE } from "@/data/source/written-subject-three-memory-guide";
import { WRITTEN_SUBJECT_TWO_MEMORY_GUIDE } from "@/data/source/written-subject-two-memory-guide";
import {
  getWrittenSubjectBundleLessonTitles,
  getWrittenSubjectFactLessonTitles,
} from "@/data/source/written-subject-fact-lesson-links";
import {
  isPublishableLesson,
  isPublishableQuestion,
} from "@/lib/domain/practice";
import { getSafeOriginalsByQuestion } from "@/lib/content/practice-presentations";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent } from "@/lib/domain/types";

const content = buildRuntimeContent(generatedContent as GeneratedContent);

const GUIDES = [
  {
    subjectCode: 1,
    subjectId: "subject-1",
    bundles: WRITTEN_SUBJECT_ONE_MEMORY_GUIDE,
  },
  {
    subjectCode: 2,
    subjectId: "subject-2",
    bundles: WRITTEN_SUBJECT_TWO_MEMORY_GUIDE,
  },
  {
    subjectCode: 3,
    subjectId: "subject-3",
    bundles: WRITTEN_SUBJECT_THREE_MEMORY_GUIDE,
  },
  {
    subjectCode: 4,
    subjectId: "subject-4",
    bundles: WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE,
  },
] as const;

describe("written subject memory guide CBT links", () => {
  it("uses reviewed semantic links instead of positional fact-to-lesson pairing", () => {
    const compressorBundle = WRITTEN_SUBJECT_ONE_MEMORY_GUIDE.find(
      (bundle) => bundle.id === "pneumatic-foundation",
    )!;
    const dynamicCompressor = compressorBundle.facts.find(
      (fact) => fact.cue === "동력형 압축기",
    )!;
    expect(
      getWrittenSubjectFactLessonTitles(1, compressorBundle, dynamicCompressor),
    ).toEqual(["공기압축기 분류", "압축기 작동원리"]);
    expect(
      getWrittenSubjectFactLessonTitles(1, compressorBundle, dynamicCompressor),
    ).not.toContain("애프터쿨러");

    const factoryBundle = WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE.find(
      (bundle) => bundle.id === "factory-project",
    )!;
    const criticalPath = factoryBundle.facts.find(
      (fact) => fact.cue === "주공정",
    )!;
    expect(
      getWrittenSubjectFactLessonTitles(4, factoryBundle, criticalPath),
    ).toEqual(["PERT 임계경로"]);
    expect(
      getWrittenSubjectFactLessonTitles(4, factoryBundle, criticalPath),
    ).not.toContain("PERT 기대시간");
  });

  it("keeps every fact-to-lesson link explicit and inside its published bundle", () => {
    const errors: string[] = [];

    for (const guide of GUIDES) {
      const publicLessonTitles = new Set(
        content.lessons
          .filter(
            (lesson) =>
              lesson.subjectId === guide.subjectId &&
              isPublishableLesson(lesson),
          )
          .map((lesson) => lesson.title),
      );

      for (const bundle of guide.bundles) {
        const bundleLessonTitles = getWrittenSubjectBundleLessonTitles(
          guide.subjectCode,
          bundle,
        );

        for (const title of bundleLessonTitles) {
          if (!publicLessonTitles.has(title)) {
            errors.push(`${guide.subjectId}:${bundle.id}:missing:${title}`);
          }
        }

        for (const fact of bundle.facts) {
          const factLessonTitles = getWrittenSubjectFactLessonTitles(
            guide.subjectCode,
            bundle,
            fact,
          );

          if (factLessonTitles.length === 0) {
            errors.push(
              `${guide.subjectId}:${bundle.id}:${fact.cue}:unlinked`,
            );
          }

          for (const title of factLessonTitles) {
            if (!publicLessonTitles.has(title)) {
              errors.push(
                `${guide.subjectId}:${bundle.id}:${fact.cue}:missing:${title}`,
              );
            }
            if (!bundleLessonTitles.includes(title)) {
              errors.push(
                `${guide.subjectId}:${bundle.id}:${fact.cue}:outside-bundle:${title}`,
              );
            }
          }
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("keeps year, session, number, and source on every published original CBT question", () => {
    const publicQuestions = content.questions.filter(isPublishableQuestion);
    const safeOriginals = getSafeOriginalsByQuestion(
      publicQuestions,
      content.variants,
    );
    const incompleteOriginals = [...safeOriginals.values()]
      .flat()
      .filter((variant) => {
        return (
          !variant.year ||
          !variant.sessionLabel.trim() ||
          !variant.questionNumber ||
          !variant.sourceUrl.trim()
        );
      })
      .map((variant) => variant.externalId);

    expect(incompleteOriginals).toEqual([]);
  });

  it("links a verified CBT question or declares an explicit review boundary", () => {
    const unaccountedBundles: string[] = [];

    for (const guide of GUIDES) {
      const publicLessons = content.lessons.filter(
        (lesson) =>
          lesson.subjectId === guide.subjectId && isPublishableLesson(lesson),
      );
      const publicQuestions = content.questions.filter(
        (question) =>
          question.subjectId === guide.subjectId &&
          isPublishableQuestion(question),
      );
      const originalsByQuestion = getSafeOriginalsByQuestion(
        publicQuestions,
        content.variants,
      );

      for (const bundle of guide.bundles) {
        const bundleLessonTitles = getWrittenSubjectBundleLessonTitles(
          guide.subjectCode,
          bundle,
        );
        const relatedLessons = publicLessons.filter((lesson) =>
          bundleLessonTitles.includes(lesson.title),
        );
        const lessonIds = new Set(relatedLessons.map((lesson) => lesson.id));
        const hasLinkedQuestion = publicQuestions.some(
          (question) =>
            lessonIds.has(question.lessonId) &&
            originalsByQuestion.has(question.id),
        );

        const hasExplicitReviewBoundary =
          "cbtStatusNote" in bundle &&
          typeof bundle.cbtStatusNote === "string" &&
          bundle.cbtStatusNote.length > 0;

        if (!hasLinkedQuestion && !hasExplicitReviewBoundary) {
          unaccountedBundles.push(`${guide.subjectId}:${bundle.id}`);
        }
      }
    }

    expect(unaccountedBundles).toEqual([]);
  });
});
