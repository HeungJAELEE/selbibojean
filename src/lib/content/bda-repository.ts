import "server-only";
import { bdaContent } from "@/data/source/bda-content";
import {
  bdaContentSchema,
  isPublishableBdaQuestion,
  type BdaLesson,
  type BdaQuestion,
  type BdaSubject,
} from "@/lib/domain/bda";

let parsedContent: ReturnType<typeof bdaContentSchema.parse> | null = null;

export function getBdaContent() {
  parsedContent ??= bdaContentSchema.parse(bdaContent);
  return parsedContent;
}

export function getBdaSubject(subjectId: string): BdaSubject | undefined {
  return getBdaContent().subjects.find((subject) => subject.id === subjectId);
}

export function getBdaLesson(lessonId: string): BdaLesson | undefined {
  return getBdaContent().lessons.find(
    (lesson) => lesson.id === lessonId && lesson.contentStatus === "published",
  );
}

export function getBdaQuestion(questionId: string): BdaQuestion | undefined {
  return getBdaContent().questions.find(
    (question) =>
      question.id === questionId && isPublishableBdaQuestion(question),
  );
}

export function getPublishedBdaQuestions(): BdaQuestion[] {
  return getBdaContent().questions.filter(isPublishableBdaQuestion);
}
