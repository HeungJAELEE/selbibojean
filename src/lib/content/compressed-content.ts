import type { GeneratedContent } from "@/lib/domain/types";

export type RuntimeContentMetadata = {
  formatVersion: 1;
  encoding: "gzip";
  sourceSha256: string;
  uncompressedBytes: number;
  compressedBytes: number;
};

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function decodeCompressedContent<T = GeneratedContent>(
  compressedBytes: Uint8Array<ArrayBuffer>,
  metadata: RuntimeContentMetadata,
): Promise<T> {
  if (
    metadata.formatVersion !== 1 ||
    metadata.encoding !== "gzip" ||
    metadata.compressedBytes !== compressedBytes.byteLength
  ) {
    throw new Error("Runtime content metadata does not match the compressed asset.");
  }

  const decompressor = new DecompressionStream("gzip");
  const writer = decompressor.writable.getWriter();
  const decompressedPromise = new Response(decompressor.readable).arrayBuffer();
  await writer.write(compressedBytes);
  await writer.close();
  const decompressed = await decompressedPromise;

  if (decompressed.byteLength !== metadata.uncompressedBytes) {
    throw new Error("Runtime content length verification failed.");
  }

  const digest = await crypto.subtle.digest("SHA-256", decompressed);
  if (toHex(digest) !== metadata.sourceSha256) {
    throw new Error("Runtime content SHA-256 verification failed.");
  }

  return JSON.parse(new TextDecoder().decode(decompressed)) as T;
}
