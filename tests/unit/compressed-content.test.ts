import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  decodeCompressedContent,
  type RuntimeContentMetadata,
} from "@/lib/content/compressed-content";
import type { GeneratedContent } from "@/lib/domain/types";

function createFixture() {
  const content = {
    formatVersion: 2,
    subjects: [],
    conceptGroups: [],
    questions: [],
    lessons: [],
    variants: [],
    backlog: [],
    report: { generatedAt: "fixture" },
  } as unknown as GeneratedContent;
  const source = Buffer.from(JSON.stringify(content), "utf8");
  const compressed = gzipSync(source);
  const metadata: RuntimeContentMetadata = {
    formatVersion: 1,
    encoding: "gzip",
    sourceSha256: createHash("sha256").update(source).digest("hex"),
    uncompressedBytes: source.byteLength,
    compressedBytes: compressed.byteLength,
  };

  return {
    content,
    compressed: new Uint8Array(compressed),
    metadata,
  };
}

describe("compressed server content", () => {
  it("decodes and verifies a gzip payload with Worker-compatible Web APIs", async () => {
    const fixture = createFixture();

    await expect(
      decodeCompressedContent(fixture.compressed, fixture.metadata),
    ).resolves.toEqual(fixture.content);
  });

  it("rejects content whose integrity metadata does not match", async () => {
    const fixture = createFixture();

    await expect(
      decodeCompressedContent(fixture.compressed, {
        ...fixture.metadata,
        sourceSha256: "0".repeat(64),
      }),
    ).rejects.toThrow("SHA-256");
  });
});
