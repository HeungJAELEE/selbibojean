import { cp, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { build } from "esbuild";

const rootDirectory = process.cwd();
const clientDirectory = resolve(rootDirectory, "dist", "client");
const workerEntry = resolve(rootDirectory, "dist", "server", "index.js");
const pagesDirectory = resolve(rootDirectory, "dist", "pages");
const pagesWorker = resolve(pagesDirectory, "_worker.js");
const runtimeDataDirectory = resolve(rootDirectory, ".runtime-assets", "data");
const pagesDataDirectory = resolve(pagesDirectory, "data");

async function requireFile(path: string, label: string) {
  try {
    await stat(path);
  } catch {
    throw new Error(`${label} is missing: ${relative(rootDirectory, path)}. Run \"npm run build\" first.`);
  }
}

async function gzipSize(path: string) {
  let bytes = 0;
  const { createReadStream } = await import("node:fs");
  await pipeline(
    createReadStream(path),
    createGzip({ level: 9 }),
    new Writable({
      write(chunk, _encoding, callback) {
        bytes += chunk.length;
        callback();
      },
    }),
  );
  return bytes;
}

await requireFile(clientDirectory, "Client build output");
await requireFile(workerEntry, "Server Worker entry");
await requireFile(resolve(runtimeDataDirectory, "content.bin"), "Compressed runtime content");
await requireFile(resolve(runtimeDataDirectory, "content.meta.json"), "Runtime content metadata");

await rm(pagesDirectory, { recursive: true, force: true });
await mkdir(dirname(pagesWorker), { recursive: true });
await cp(clientDirectory, pagesDirectory, { recursive: true });
await cp(runtimeDataDirectory, pagesDataDirectory, { recursive: true });

await build({
  absWorkingDir: rootDirectory,
  bundle: true,
  entryPoints: [workerEntry],
  external: ["node:*"],
  format: "esm",
  minify: true,
  outfile: pagesWorker,
  platform: "neutral",
  sourcemap: false,
  target: "es2022",
});

const workerSource = await readFile(pagesWorker, "utf8");
if (!workerSource.includes("export")) {
  throw new Error("Pages Worker bundle has no ESM export.");
}

const packagedDataFiles = (await readdir(pagesDataDirectory)).sort();
const expectedDataFiles = ["content.bin", "content.meta.json"];
if (JSON.stringify(packagedDataFiles) !== JSON.stringify(expectedDataFiles)) {
  throw new Error(
    `Refusing unexpected Pages data assets: ${packagedDataFiles.join(", ") || "(empty)"}.`,
  );
}

const compressedBytes = await gzipSize(pagesWorker);
console.log(
  `Cloudflare Pages package ready: ${relative(rootDirectory, pagesDirectory)} ` +
    `(${relative(rootDirectory, pagesWorker)}, gzip ${compressedBytes} bytes).`,
);
console.log("Preview with: npm run preview:pages");
console.log("Deploy with: npm run deploy:pages");
