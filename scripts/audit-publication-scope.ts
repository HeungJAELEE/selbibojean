import { readFileSync } from "node:fs";

import type {
  GeneratedContent,
  Lesson,
  LessonBlockKind,
  Question,
} from "../src/lib/domain/types";

const data = JSON.parse(
  readFileSync(new URL("../src/data/generated/content.json", import.meta.url), "utf8"),
) as GeneratedContent;

function countBy<T>(items: T[], key: (item: T) => string) {
  return Object.fromEntries(
    [...items.reduce((counts, item) => {
      const value = key(item);
      counts.set(value, (counts.get(value) ?? 0) + 1);
      return counts;
    }, new Map<string, number>())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")),
  );
}

function groupBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const groupKey = key(item);
    groups[groupKey] = [...(groups[groupKey] ?? []), item];
    return groups;
  }, {});
}

function sample<T>(items: T[], select: (item: T) => unknown, limit = 10) {
  return items.slice(0, limit).map(select);
}

function failedValidation(question: Question) {
  const failures = Object.entries(question.validation)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  return failures.length > 0 ? failures.join("+") : "all-pass";
}

function normalizeConceptTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .replace(/[\s·ㆍ,.()\[\]{}'"/\\_-]+/g, "")
    .trim();
}

function lessonSourceText(lesson: Lesson) {
  return lesson.blocks.find((block) => block.kind === "source")?.body ?? "";
}

const HIGH_RISK_PATTERN =
  /법령|산업안전|안전보건|KS\b|ISO\b|규격|제조사|이미지|사진|과거 기준|현행 확인|미확인|충돌|오류|복원 필요/i;

function lessonQualityFailures(lesson: Lesson) {
  const requiredCharacters = lesson.quality.tier === "core" ? 1000 : lesson.quality.tier === "standard" ? 700 : 500;
  const requiredKinds: LessonBlockKind[] = ["definition", "principle", "exam_point", "trap", "source"];
  const kinds = new Set(lesson.blocks.map((block) => block.kind));
  const failures: string[] = [];
  if (lesson.quality.substantiveCharacters < requiredCharacters) failures.push("insufficient-characters");
  if (lesson.quality.genericPhraseMatches.length > 0) failures.push("generic-language");
  if (lesson.quality.languageIssueMatches.length > 0) failures.push("korean-language");
  if (lesson.summary.length !== 3) failures.push("summary-count");
  if (new Set(lesson.summary.map((line) => line.replace(/\s+/g, " ").trim())).size !== 3) failures.push("summary-duplicate");
  if (lesson.summary.some((line) => line.replace(/\s+/g, " ").trim().length < 24)) failures.push("summary-short");
  requiredKinds.forEach((kind) => {
    if (!kinds.has(kind)) failures.push(`missing-${kind}`);
  });
  return failures;
}

function isConfirmedStatus(status: string) {
  return status === "확정" || status.startsWith("확정 ");
}

const warningQuestionIds = new Set(
  data.report.warnings
    .map((warning) => warning.match(/^(U-\d+):/)?.[1])
    .filter((id): id is string => Boolean(id)),
);
const lessonById = new Map(data.lessons.map((lesson) => [lesson.id, lesson]));

function publicationBlockers(question: Question) {
  if (question.publication) return question.publication.blockers;
  const blockers: string[] = [];
  const lesson = lessonById.get(question.lessonId);
  if (!Object.values(question.validation).every(Boolean)) blockers.push("validation-failed");
  if (warningQuestionIds.has(question.id)) blockers.push("mapping-review");
  if (HIGH_RISK_PATTERN.test(`${question.stem} ${question.explanation} ${question.reviewStatus}`)) blockers.push("high-risk-source");
  if (lesson?.sourceNeeded) blockers.push("lesson-source-needed");
  if (!isConfirmedStatus(question.reviewStatus)) blockers.push("editorial-review");
  return [...new Set(blockers)];
}

const duplicateConcepts = [...data.lessons.reduce((groups, lesson) => {
  const key = `${lesson.subjectId}:${normalizeConceptTitle(lesson.title)}`;
  const existing = groups.get(key) ?? [];
  existing.push({ id: lesson.id, title: lesson.title, groupId: lesson.conceptGroupId });
  groups.set(key, existing);
  return groups;
}, new Map<string, Array<{ id: string; title: string; groupId: string }>>())]
  .filter(([, lessons]) => lessons.length > 1)
  .map(([key, lessons]) => ({ key, lessons }));

const feedbackFrequency = [...data.questions.flatMap((question) => question.choices).reduce((counts, choice) => {
  const feedback = [
    choice.feedback.rationale,
    choice.feedback.plausibleReason,
    choice.feedback.incorrectPoint,
    choice.feedback.keyRule,
    choice.feedback.differenceFromCorrect,
  ].filter(Boolean).join("\n");
  counts.set(feedback, (counts.get(feedback) ?? 0) + 1);
  return counts;
}, new Map<string, number>())]
  .sort((a, b) => b[1] - a[1]);

const nonPublishedQuestions = data.questions.filter((question) => question.contentStatus !== "published");
const nonPublishedLessons = data.lessons.filter((lesson) => lesson.contentStatus !== "published");
const validationFailureGroups = groupBy(nonPublishedQuestions, failedValidation);
const lessonFailureGroups = groupBy(
  data.lessons.filter((lesson) => !lesson.quality.passed),
  (lesson) => lessonQualityFailures(lesson).join("+") || "unexplained",
);
const blockerRows = nonPublishedQuestions.map((question) => ({
  question,
  blockers: publicationBlockers(question),
}));

const report = {
  generatedAt: new Date().toISOString(),
  sourceGeneratedAt: data.report.generatedAt,
  totals: {
    subjects: data.subjects.length,
    conceptGroups: data.conceptGroups.length,
    canonicalQuestions: data.questions.length,
    variants: data.variants.length,
    lessons: data.lessons.length,
    backlog: data.backlog.length,
    choices: data.questions.reduce((total, question) => total + question.choices.length, 0),
  },
  questions: {
    byStatus: countBy(data.questions, (question) => question.contentStatus),
    byReviewStatus: countBy(data.questions, (question) => question.reviewStatus || "(empty)"),
    byValidationResult: countBy(data.questions, failedValidation),
    publishableAllValidationPass: data.questions.filter((question) =>
      Object.values(question.validation).every(Boolean),
    ).length,
    nonPublishedWithAllValidationPass: nonPublishedQuestions.filter((question) =>
      Object.values(question.validation).every(Boolean),
    ).length,
    publicationBlockers: countBy(blockerRows, (row) => row.blockers.join("+") || "ready"),
    singleBlockerCounts: countBy(
      blockerRows.flatMap((row) => row.blockers),
      (blocker) => blocker,
    ),
    editorialReady: blockerRows.filter((row) => row.blockers.length === 1 && row.blockers[0] === "editorial-review").length,
    failureSamples: Object.fromEntries(
      Object.entries(validationFailureGroups).map(([reason, questions]) => [
        reason,
        sample(questions ?? [], (question) => ({
          id: question.id,
          stem: question.stem,
          groupId: question.conceptGroupId,
          lessonId: question.lessonId,
          status: question.contentStatus,
          reviewStatus: question.reviewStatus,
        })),
      ]),
    ),
  },
  lessons: {
    byStatus: countBy(data.lessons, (lesson) => lesson.contentStatus),
    byCoverage: countBy(data.lessons, (lesson) => lesson.coverageStatus),
    byQuality: countBy(data.lessons, (lesson) => lesson.quality.passed ? "passed" : "failed"),
    sourceNeeded: data.lessons.filter((lesson) => lesson.sourceNeeded).length,
    sourceLinked: data.lessons.filter((lesson) => lesson.quality.sourceLinked).length,
    nonPublishedWithQualityPass: nonPublishedLessons.filter((lesson) => lesson.quality.passed).length,
    nonPublishedWithSourceBlock: nonPublishedLessons.filter((lesson) => lessonSourceText(lesson).length > 0).length,
    duplicateNormalizedTitles: duplicateConcepts,
    failureReasons: Object.fromEntries(
      Object.entries(lessonFailureGroups).map(([reason, lessons]) => [reason, lessons?.length ?? 0]),
    ),
    failureSamples: sample(
      nonPublishedLessons.filter((lesson) => !lesson.quality.passed),
      (lesson) => ({
        id: lesson.id,
        title: lesson.title,
        groupId: lesson.conceptGroupId,
        status: lesson.contentStatus,
        coverageStatus: lesson.coverageStatus,
        sourceNeeded: lesson.sourceNeeded,
        quality: lesson.quality,
      }),
      30,
    ),
  },
  feedback: {
    distinctCompleteFeedback: feedbackFrequency.length,
    duplicatedCompleteFeedbackCount: feedbackFrequency.filter(([, count]) => count > 1).length,
    maximumExactRepeat: feedbackFrequency[0]?.[1] ?? 0,
    mostRepeated: feedbackFrequency.slice(0, 20).map(([text, count]) => ({ count, text })),
  },
  groups: data.report.groupQuality,
  mappingWarnings: {
    total: data.report.warnings.length,
    weak: data.report.warnings.filter((warning) => warning.includes("(weak")).length,
    fallback: data.report.warnings.filter((warning) => warning.includes("(fallback")).length,
    details: data.report.warnings.map((warning) => {
      const id = warning.match(/^(U-\d+):/)?.[1];
      const question = id ? data.questions.find((item) => item.id === id) : null;
      const lesson = question ? lessonById.get(question.lessonId) : null;
      return {
        warning,
        question: question
          ? {
              id: question.id,
              concept: lesson?.title,
              groupId: question.conceptGroupId,
              stem: question.stem,
              answer: question.answerText,
              reviewStatus: question.reviewStatus,
            }
          : null,
      };
    }),
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
