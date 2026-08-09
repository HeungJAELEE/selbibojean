import "server-only";

import { decodeCompressedContent, type RuntimeContentMetadata } from "@/lib/content/compressed-content";
import type {
  ConceptGroup,
  GeneratedContent,
  Lesson,
  PublicQuestion,
  Question,
  Subject,
} from "@/lib/domain/types";

const COMPRESSED_CONTENT_PATH = "/data/content.bin";
const CONTENT_METADATA_PATH = "/data/content.meta.json";

type RuntimeAssetFetcher = (path: string) => Promise<Response>;
type RuntimeGlobal = typeof globalThis & {
  __SEOLBI_RUNTIME_ASSET_FETCH__?: RuntimeAssetFetcher;
};

let contentPromise: Promise<GeneratedContent> | undefined;
export type WrittenTheorySubjectContent = {
  subjects: Subject[];
  conceptGroups: ConceptGroup[];
  lessons: Array<
    Pick<
      Lesson,
      "id" | "title" | "subjectId" | "conceptGroupId" | "contentRole"
    >
  >;
  questions: PublicQuestion[];
};
export type WrittenMockSetupMetadata = {
  subjects: Subject[];
  availableBySubject: Record<string, number>;
  publishedBySubject: Record<string, number>;
  availableYears: number[];
  availableByYearRange: Record<string, Record<string, number>>;
  publishedByYearRange: Record<string, Record<string, number>>;
};

const subjectContentPromises = new Map<
  string,
  Promise<WrittenTheorySubjectContent>
>();

async function readRuntimeAssets(
  compressedPath = COMPRESSED_CONTENT_PATH,
  metadataPath = CONTENT_METADATA_PATH,
) {
  const assetFetcher = (globalThis as RuntimeGlobal).__SEOLBI_RUNTIME_ASSET_FETCH__;

  if (assetFetcher) {
    const [compressedResponse, metadataResponse] = await Promise.all([
      assetFetcher(compressedPath),
      assetFetcher(metadataPath),
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
    readFile(path.join(runtimeDirectory, path.basename(compressedPath))),
    readFile(path.join(runtimeDirectory, path.basename(metadataPath)), "utf8"),
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
  contentPromise ??= loadContent();
  return contentPromise;
}

export async function getWrittenMockSetupMetadata() {
  const assetFetcher = (globalThis as RuntimeGlobal).__SEOLBI_RUNTIME_ASSET_FETCH__;
  if (assetFetcher) {
    const response = await assetFetcher("/data/mock-setup.json");
    if (!response.ok) {
      throw new Error(`Written mock setup asset is unavailable (${response.status}).`);
    }
    return response.json() as Promise<WrittenMockSetupMetadata>;
  }

  const [{ readFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const file = path.join(process.cwd(), ".runtime-assets", "data", "mock-setup.json");
  return JSON.parse(await readFile(file, "utf8")) as WrittenMockSetupMetadata;
}

export async function getWrittenTheorySubjectContent(subjectId: string) {
  if (!/^subject-[1-4]$/.test(subjectId)) {
    throw new Error(`Unsupported written subject: ${subjectId}`);
  }

  const existing = subjectContentPromises.get(subjectId);
  if (existing) return existing;

  const basePath = `/data/content-${subjectId}`;
  const subjectPromise = readRuntimeAssets(
    `${basePath}.bin`,
    `${basePath}.meta.json`,
  ).then(({ compressed, metadata }) =>
    decodeCompressedContent<WrittenTheorySubjectContent>(compressed, metadata),
  );
  subjectContentPromises.set(subjectId, subjectPromise);
  return subjectPromise;
}

export async function getQuestion(questionId: string): Promise<Question | undefined> {
  return (await getContent()).questions.find((question) => question.id === questionId);
}

export async function getLesson(lessonId: string): Promise<Lesson | undefined> {
  return (await getContent()).lessons.find((lesson) => lesson.id === lessonId);
}

export async function getQuestionVariant(externalId: string) {
  return (await getContent()).variants.find(
    (variant) => variant.externalId === externalId,
  );
}
