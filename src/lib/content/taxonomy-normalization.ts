import { conceptGroups, subjects } from "@/lib/domain/catalog";
import type { GeneratedContent } from "@/lib/domain/types";

const LEGACY_LESSON_GROUP_OVERRIDES = new Map<string, string>([
  ["CO₂ 아크용접", "s2-g02"],
  ["저항용접", "s2-g03"],
]);

const REVIEWED_LESSON_GROUP_OVERRIDES = new Map<string, string>([
  ...[
    "lesson-w9cpkq",
    "lesson-10dr8g",
    "lesson-ptw5i5",
    "lesson-aenvu6",
    "lesson-polxof",
    "lesson-gkv0x6",
    "lesson-5g4oy0",
    "lesson-rfxryp",
    "lesson-1qciwn2",
    "lesson-a1jde0",
    "lesson-ijl9tk",
    "lesson-1ict18j",
    "lesson-1y7dg5v",
    "lesson-1gkkcfs",
  ].map((id) => [id, "s1-g06"] as const),
  ...[
    "lesson-osztt8",
    "lesson-6jatm",
    "lesson-1rxcf26",
    "lesson-kh5ins",
    "lesson-69y7kr",
    "lesson-1ilzzc",
    "lesson-1xdlkv6",
  ].map((id) => [id, "s1-g03"] as const),
  ["lesson-naksg5", "s1-g09"],
  ["lesson-1az42pb", "s1-g09"],
  ["lesson-u30gss", "s1-g09"],
  ["lesson-ayt9si", "s1-g12"],
  ["lesson-dc867l", "s1-g12"],
  ["lesson-1viyswi", "s1-g12"],
  ["lesson-nmauc2", "s1-g07"],
  ["lesson-1k0dvtw", "s1-g07"],
  ["lesson-1di2sn1", "s2-g02"],
  ["lesson-2xbi8q", "s2-g02"],
  ["lesson-f0ho2s", "s2-g02"],
  ["lesson-1oasq1o", "s4-g04"],
  ["lesson-1ung7xm", "s4-g04"],
  ["lesson-1if5krx", "s4-g04"],
  ["lesson-27mw9x", "s4-g04"],
]);

function isRuntimePublishableQuestion(
  question: GeneratedContent["questions"][number],
) {
  return (
    question.contentStatus === "published" &&
    question.validation.answer &&
    question.validation.explanation &&
    question.validation.choiceFeedback &&
    question.validation.theoryLink &&
    question.validation.contentQuality &&
    question.choices.length >= 2
  );
}

/**
 * Keeps runtime content on the canonical 2025–2028 taxonomy even when the
 * checked-in workbook snapshot still contains legacy subject labels or a
 * previously reviewed lesson assignment.
 */
export function normalizeCanonicalTaxonomy(
  content: GeneratedContent,
): GeneratedContent {
  const lessons = content.lessons.map((lesson) => ({
    ...lesson,
    conceptGroupId:
      REVIEWED_LESSON_GROUP_OVERRIDES.get(lesson.id) ??
      LEGACY_LESSON_GROUP_OVERRIDES.get(lesson.title) ??
      lesson.conceptGroupId,
  }));
  const groupByLessonId = new Map(
    lessons.map((lesson) => [lesson.id, lesson.conceptGroupId]),
  );
  const questions = content.questions.map((question) => ({
    ...question,
    conceptGroupId:
      groupByLessonId.get(question.lessonId) ?? question.conceptGroupId,
  }));
  const publishableLessonIds = new Set(
    lessons
      .filter(
        (lesson) =>
          lesson.contentStatus === "published" &&
          lesson.publication?.readiness === "ready" &&
          lesson.coverageStatus === "covered" &&
          lesson.quality.passed &&
          !lesson.sourceNeeded,
      )
      .map((lesson) => lesson.id),
  );
  const normalizedQuestions = questions.map((question) => {
    if (
      !isRuntimePublishableQuestion(question) ||
      publishableLessonIds.has(question.lessonId)
    ) {
      return question;
    }
    return {
      ...question,
      contentStatus: "in_review" as const,
      publication: {
        readiness: "blocked" as const,
        blockers: ["lesson_source_needed" as const],
      },
      validation: {
        ...question.validation,
        theoryLink: false,
      },
    };
  });
  const publishableQuestionIds = new Set(
    normalizedQuestions
      .filter(isRuntimePublishableQuestion)
      .map((question) => question.id),
  );
  const normalizedLessons = lessons.map((lesson) => ({
    ...lesson,
    relatedQuestionIds:
      lesson.contentStatus === "published"
        ? lesson.relatedQuestionIds.filter((id) =>
            publishableQuestionIds.has(id),
          )
        : lesson.relatedQuestionIds,
  }));

  const groupQuality = conceptGroups.map((group) => {
    const groupLessons = normalizedLessons.filter(
      (lesson) => lesson.conceptGroupId === group.id,
    );
    const groupQuestions = normalizedQuestions.filter(
      (question) => question.conceptGroupId === group.id,
    );
    const publishedLessons = groupLessons.filter(
      (lesson) => lesson.contentStatus === "published",
    );
    const publishedQuestions = groupQuestions.filter(
      (question) => question.contentStatus === "published",
    );

    return {
      groupId: group.id,
      title: group.title,
      lessonCount: groupLessons.length,
      lessonPassed: groupLessons.filter((lesson) => lesson.quality.passed)
        .length,
      publishedLessonCount: publishedLessons.length,
      publishedLessonPassed: publishedLessons.filter(
        (lesson) => lesson.quality.passed,
      ).length,
      questionCount: groupQuestions.length,
      publishedQuestionCount: publishedQuestions.length,
      choiceFeedbackCount: groupQuestions.reduce(
        (total, question) => total + question.choices.length,
        0,
      ),
      choiceFeedbackPassed: groupQuestions.reduce(
        (total, question) =>
          total +
          (question.validation.choiceFeedback ? question.choices.length : 0),
        0,
      ),
    };
  });

  return {
    ...content,
    subjects: subjects.map((subject) => ({ ...subject })),
    conceptGroups: conceptGroups.map((group) => ({
      ...group,
      keywords: [...group.keywords],
    })),
    lessons: normalizedLessons,
    questions: normalizedQuestions,
    report: {
      ...content.report,
      groupQuality,
    },
  };
}
