import { spawn } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
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
const workerConfig = resolve(rootDirectory, "dist", "server", "wrangler.json");
const wranglerCli = resolve(rootDirectory, "node_modules", "wrangler", "bin", "wrangler.js");

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

async function reserveLocalPort() {
  return new Promise<number>((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not reserve a local preview port."));
        return;
      }
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolvePort(port)));
    });
  });
}

async function stopPreview(processId: number | undefined) {
  if (!processId) return;
  if (process.platform === "win32") {
    await new Promise<void>((resolveStop) => {
      const killer = spawn("taskkill", ["/pid", String(processId), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
      killer.once("exit", () => resolveStop());
      killer.once("error", () => resolveStop());
    });
    return;
  }
  process.kill(processId, "SIGTERM");
}

async function prerenderWrittenTheory() {
  const port = await reserveLocalPort();
  const previewUrl = `http://127.0.0.1:${port}`;
  const output: string[] = [];
  const preview = spawn(
    process.execPath,
    [
      wranglerCli,
      "dev",
      "--config",
      workerConfig,
      "--ip",
      "127.0.0.1",
      "--port",
      String(port),
      "--local",
      "--log-level",
      "error",
    ],
    {
      cwd: rootDirectory,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  preview.stdout?.on("data", (chunk) => output.push(String(chunk)));
  preview.stderr?.on("data", (chunk) => output.push(String(chunk)));

  try {
    const deadline = Date.now() + 60_000;
    let ready = false;
    while (!ready && Date.now() < deadline) {
      try {
        const response = await fetch(`${previewUrl}/written/theory`);
        ready = response.ok;
      } catch {
        // Wrangler is still starting.
      }
      if (!ready) {
        await new Promise((resolveWait) => setTimeout(resolveWait, 250));
      }
    }
    if (!ready) {
      throw new Error(
        `Local Worker did not become ready for prerendering.\n${output.join("").slice(-4_000)}`,
      );
    }

    const routes = [
      { url: "/written/theory", output: "written/theory/index.html", legacyRedirect: true },
      ...["subject-1", "subject-2", "subject-3", "subject-4"].map((subjectId) => ({
        url: `/written/theory/subject/${subjectId}`,
        output: `written/theory/subject/${subjectId}/index.html`,
        legacyRedirect: false,
      })),
    ];

    for (const route of routes) {
      const response = await fetch(`${previewUrl}${route.url}`);
      if (!response.ok) {
        throw new Error(`Prerender failed for ${route.url}: HTTP ${response.status}`);
      }
      let html = await response.text();
      if (route.legacyRedirect) {
        html = html.replace(
          "</head>",
          `<script>try{const s=new URLSearchParams(location.search).get("subject");if(/^subject-[1-4]$/.test(s))location.replace("/written/theory/subject/"+s+location.hash)}catch{}</script></head>`,
        );
      }
      const destination = resolve(pagesDirectory, route.output);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, html, "utf8");
    }

    await writeFile(
      resolve(pagesDirectory, "_routes.json"),
      `${JSON.stringify(
        {
          version: 1,
          include: ["/*"],
          exclude: ["/written/theory", "/written/theory/subject/*"],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } finally {
    await stopPreview(preview.pid);
  }
}

await requireFile(clientDirectory, "Client build output");
await requireFile(workerEntry, "Server Worker entry");
await requireFile(resolve(runtimeDataDirectory, "content.bin"), "Compressed runtime content");
await requireFile(resolve(runtimeDataDirectory, "content.meta.json"), "Runtime content metadata");
for (const subjectId of ["subject-1", "subject-2", "subject-3", "subject-4"]) {
  await requireFile(
    resolve(runtimeDataDirectory, `content-${subjectId}.bin`),
    `Compressed runtime content for ${subjectId}`,
  );
  await requireFile(
    resolve(runtimeDataDirectory, `content-${subjectId}.meta.json`),
    `Runtime content metadata for ${subjectId}`,
  );
}

await rm(pagesDirectory, { recursive: true, force: true });
await mkdir(dirname(pagesWorker), { recursive: true });
await cp(clientDirectory, pagesDirectory, { recursive: true });
await cp(runtimeDataDirectory, pagesDataDirectory, { recursive: true });
await prerenderWrittenTheory();

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
const expectedDataFiles = [
  "content.bin",
  "content.meta.json",
  ...["subject-1", "subject-2", "subject-3", "subject-4"].flatMap(
    (subjectId) => [
      `content-${subjectId}.bin`,
      `content-${subjectId}.meta.json`,
    ],
  ),
].sort();
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
