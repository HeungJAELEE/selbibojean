import "server-only";

import generatedContent from "@/data/generated/content.json";
import type { GeneratedContent, Lesson, Question } from "@/lib/domain/types";

const content = generatedContent as GeneratedContent;

export async function getContent() {
  return content;
}

export async function getQuestion(questionId: string): Promise<Question | undefined> {
  return (await getContent()).questions.find((question) => question.id === questionId);
}

export async function getLesson(lessonId: string): Promise<Lesson | undefined> {
  return (await getContent()).lessons.find((lesson) => lesson.id === lessonId);
}
