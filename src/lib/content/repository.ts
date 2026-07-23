import "server-only";

import rawGeneratedContent from "@/data/generated/content.json";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent, Lesson, Question } from "@/lib/domain/types";

let contentPromise: Promise<GeneratedContent> | undefined;

async function loadContent() {
  // 정답·해설이 포함된 기준 데이터는 서버 전용 모듈 그래프에만 번들한다.
  // Sites 정적 자산에 복사하지 않으므로 /data 경로를 통한 원본 공개를
  // 구조적으로 차단한다.
  return rawGeneratedContent as GeneratedContent;
}

export async function getContent() {
  contentPromise ??= loadContent().then(buildRuntimeContent);
  return contentPromise;
}

export async function getQuestion(questionId: string): Promise<Question | undefined> {
  return (await getContent()).questions.find((question) => question.id === questionId);
}

export async function getLesson(lessonId: string): Promise<Lesson | undefined> {
  return (await getContent()).lessons.find((lesson) => lesson.id === lessonId);
}
