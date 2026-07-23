import "server-only";

import type { GeneratedContent, Lesson, Question } from "@/lib/domain/types";
import { buildRuntimeContent } from "@/lib/content/runtime-content";

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

declare global {
  var __SEOLBI_ASSETS__: AssetFetcher | undefined;
}

let contentPromise: Promise<GeneratedContent> | undefined;

interface ContentManifest {
  schemaVersion: 1;
  base: Record<string, unknown>;
  collections: Record<string, string[]>;
}

async function fetchAssetJson(pathname: string) {
  const response = await globalThis.__SEOLBI_ASSETS__!.fetch(
    new Request(`https://seolbi-assets.local/data/${pathname}`),
  );
  if (!response.ok) {
    throw new Error(`콘텐츠 자산을 불러오지 못했습니다. (${response.status})`);
  }
  return response.json() as Promise<unknown>;
}

async function loadContent() {
  try {
    if (globalThis.__SEOLBI_ASSETS__) {
      const manifest = (await fetchAssetJson("content-manifest.json")) as ContentManifest;
      const content: Record<string, unknown> = { ...manifest.base };

      for (const [key, files] of Object.entries(manifest.collections)) {
        const chunks = (await Promise.all(files.map((file) => fetchAssetJson(file)))) as unknown[][];
        content[key] = chunks.flat();
      }
      return content as unknown as GeneratedContent;
    }

    const [{ readFile }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
    const filePath = path.join(process.cwd(), "src", "data", "generated", "content.json");
    return JSON.parse(await readFile(filePath, "utf8")) as GeneratedContent;
  } catch (error) {
    console.error("Failed to load the generated learning content.", error);
    throw error;
  }
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
