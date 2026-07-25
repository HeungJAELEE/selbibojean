import "server-only";

import { decodeCompressedContent, type RuntimeContentMetadata } from "@/lib/content/compressed-content";
import { buildRuntimeContent } from "@/lib/content/runtime-content";
import type { GeneratedContent, Lesson, Question } from "@/lib/domain/types";

const COMPRESSED_CONTENT_PATH = "/data/content.bin";
const CONTENT_METADATA_PATH = "/data/content.meta.json";

type RuntimeAssetFetcher = (path: string) => Promise<Response>;
type RuntimeGlobal = typeof globalThis & {
  __SEOLBI_RUNTIME_ASSET_FETCH__?: RuntimeAssetFetcher;
};

let contentPromise: Promise<GeneratedContent> | undefined;

async function readRuntimeAssets() {
  const assetFetcher = (globalThis as RuntimeGlobal).__SEOLBI_RUNTIME_ASSET_FETCH__;

  if (assetFetcher) {
    const [compressedResponse, metadataResponse] = await Promise.all([
      assetFetcher(COMPRESSED_CONTENT_PATH),
      assetFetcher(CONTENT_METADATA_PATH),
    ]);

    if (!compressedResponse.ok || !metadataResponse.ok) {
      throw new Error(
        `Server runtime content assets are unavailable (${compressedResponse.status}/${metadataResponse.status}).`,
      );
    }

    return {
      compressed: new Uint8Array(await compressedResponse.arrayBuffer()),
      metadata: (await metadataResponse.json()) as RuntimeContentMetadata,
    };
  }

  // Local Node development and build-time fallback. This path is not used in the
  // deployed Worker, where the internal ASSETS binding is injected above.
  const [{ readFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const runtimeDirectory = path.join(process.cwd(), ".runtime-assets", "data");
  const [compressed, metadata] = await Promise.all([
    readFile(path.join(runtimeDirectory, "content.bin")),
    readFile(path.join(runtimeDirectory, "content.meta.json"), "utf8"),
  ]);

  return {
    compressed: new Uint8Array(compressed),
    metadata: JSON.parse(metadata) as RuntimeContentMetadata,
  };
}

async function loadContent() {
  // Answers and explanations are decompressed only in the server module graph.
  // External /data requests are blocked by worker/index.ts before ASSETS routing.
  const { compressed, metadata } = await readRuntimeAssets();
  return decodeCompressedContent(compressed, metadata);
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
