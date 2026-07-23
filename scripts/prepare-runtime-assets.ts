import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.join(process.cwd(), "src", "data", "generated", "content.json");
const outputDirectory = path.join(process.cwd(), ".runtime-assets", "data");
const chunkByteLimit = 4_000_000;

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const content = JSON.parse(await readFile(source, "utf8")) as Record<string, unknown>;
const collections: Record<string, string[]> = {};
const base: Record<string, unknown> = {};

for (const [key, value] of Object.entries(content)) {
  if (!Array.isArray(value) || Buffer.byteLength(JSON.stringify(value)) <= chunkByteLimit) {
    base[key] = value;
    continue;
  }

  const files: string[] = [];
  let chunk: unknown[] = [];
  let chunkBytes = 2;

  for (const item of value) {
    const serialized = JSON.stringify(item);
    const itemBytes = Buffer.byteLength(serialized) + (chunk.length ? 1 : 0);
    if (chunk.length && chunkBytes + itemBytes > chunkByteLimit) {
      const file = `content-${key}-${files.length}.json`;
      await writeFile(path.join(outputDirectory, file), JSON.stringify(chunk));
      files.push(file);
      chunk = [];
      chunkBytes = 2;
    }
    chunk.push(item);
    chunkBytes += itemBytes;
  }

  if (chunk.length) {
    const file = `content-${key}-${files.length}.json`;
    await writeFile(path.join(outputDirectory, file), JSON.stringify(chunk));
    files.push(file);
  }
  collections[key] = files;
}

const manifest = {
  schemaVersion: 1,
  base,
  collections,
};
await writeFile(path.join(outputDirectory, "content-manifest.json"), JSON.stringify(manifest));

const generatedFiles = 1 + Object.values(collections).reduce((count, files) => count + files.length, 0);
console.log(`Prepared ${generatedFiles} private runtime content assets in .runtime-assets/data`);
