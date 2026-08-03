import { execFileSync, spawn } from "node:child_process";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { buildRuntimeContent } from "../src/lib/content/runtime-content";
import type { GeneratedContent } from "../src/lib/domain/types";

const root = process.cwd();
const EXPECTED_SITE_ID = "appgprj_6a5cf5715fe4819189a1843f8cd3f749";
const REQUIRED_ROUTES = [
  "src/app/page.tsx",
  "src/app/written/theory/page.tsx",
  "src/app/written/practice/page.tsx",
  "src/app/written/review/page.tsx",
  "src/app/admin/review/welding-safety/page.tsx",
];
const runtimeModuleNames = [
  "content",
  "content-subject-1",
  "content-subject-2",
  "content-subject-3",
  "content-subject-4",
];
const BLOCKED_RUNTIME_REQUESTS = [
  "/data/content.bin",
  "/%64ata/content.bin",
  "/%2564ata/content.bin",
  "/.runtime-assets/data/content.bin",
  "/images/preview.bin",
  "/content.meta.json",
  "/content.manifest.json",
  "/_vinext/image?url=%2Fdata%2Fcontent.bin&w=640&q=75",
  "/_vinext/image?url=%2F%2564ata%2Fcontent.bin&w=640&q=75",
  "/_vinext/image?url=%2Fassets%2F..%2Fdata%2Fcontent.bin&w=640&q=75",
  "/_vinext/image?url=%2Fcontent.meta.json&w=640&q=75",
];

function fail(message: string): never {
  throw new Error(`Deployment readiness failed: ${message}`);
}

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(
    await readFile(path.join(root, relativePath), "utf8"),
  ) as T;
}

async function assertFile(relativePath: string) {
  await access(path.join(root, relativePath)).catch(() =>
    fail(`required file is missing: ${relativePath}`),
  );
}

async function assertMissing(relativePath: string) {
  await access(path.join(root, relativePath))
    .then(() => fail(`server-only runtime content is public: ${relativePath}`))
    .catch((error: unknown) => {
      if (
        error instanceof Error &&
        error.message.startsWith("Deployment readiness failed:")
      ) {
        throw error;
      }
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
}

async function walkFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
    }),
  );
  return files.flat();
}

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { cwd: root })
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function normalizedPath(filePath: string) {
  return filePath.replaceAll("\\", "/");
}

async function reserveLocalPort() {
  return new Promise<number>((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not reserve a local Worker port."));
        return;
      }
      server.close((error) =>
        error ? reject(error) : resolvePort(address.port),
      );
    });
  });
}

async function stopPreview(processId: number | undefined) {
  if (!processId) return;
  if (process.platform === "win32") {
    await new Promise<void>((resolveStop) => {
      const killer = spawn(
        "taskkill",
        ["/pid", String(processId), "/T", "/F"],
        { stdio: "ignore", windowsHide: true },
      );
      killer.once("exit", () => resolveStop());
      killer.once("error", () => resolveStop());
    });
    return;
  }
  process.kill(processId, "SIGTERM");
}

async function verifyLocalWorkerBoundary() {
  const port = await reserveLocalPort();
  const origin = `http://127.0.0.1:${port}`;
  const output: string[] = [];
  const preview = spawn(
    process.execPath,
    [
      path.join(root, "node_modules", "wrangler", "bin", "wrangler.js"),
      "dev",
      "--config",
      path.join(root, "dist", "server", "wrangler.json"),
      "--ip",
      "127.0.0.1",
      "--port",
      String(port),
      "--local",
      "--log-level",
      "error",
    ],
    {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  preview.stdout?.on("data", (chunk) => output.push(String(chunk)));
  preview.stderr?.on("data", (chunk) => output.push(String(chunk)));

  try {
    const deadline = Date.now() + 45_000;
    let ready = false;
    while (!ready && Date.now() < deadline && preview.exitCode === null) {
      try {
        const response = await fetch(`${origin}/privacy`, {
          signal: AbortSignal.timeout(3_000),
        });
        ready = response.status < 500;
      } catch {
        // Wrangler is still starting.
      }
      if (!ready) {
        await new Promise((resolveWait) => setTimeout(resolveWait, 250));
      }
    }
    if (!ready) {
      fail(
        `local Worker did not start:\n${output.join("").slice(-4_000)}`,
      );
    }

    const representativeFlow = await fetch(`${origin}/written/theory`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!representativeFlow.ok) {
      fail(
        `representative Worker flow returned HTTP ${representativeFlow.status}`,
      );
    }

    for (const requestPath of BLOCKED_RUNTIME_REQUESTS) {
      const response = await fetch(`${origin}${requestPath}`, {
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      });
      const body = new Uint8Array(await response.arrayBuffer());
      if (response.status !== 404) {
        fail(`${requestPath} returned HTTP ${response.status}, expected 404`);
      }
      if (
        response.headers.get("content-type")?.includes("application/gzip") ||
        (body[0] === 0x1f && body[1] === 0x8b)
      ) {
        fail(`${requestPath} exposed gzip runtime content`);
      }
    }
  } finally {
    await stopPreview(preview.pid);
  }
}

for (const route of REQUIRED_ROUTES) await assertFile(route);
await assertFile("dist/server/index.js");
await assertFile("dist/server/.vite/manifest.json");
await assertFile("dist/.openai/hosting.json");
await assertFile("dist/server/wrangler.json");
await assertMissing("public/data");

const sourceHosting =
  await readJson<{ project_id?: string }>(".openai/hosting.json");
const builtHosting =
  await readJson<{ project_id?: string }>("dist/.openai/hosting.json");
if (sourceHosting.project_id !== EXPECTED_SITE_ID) {
  fail(`unexpected Sites project_id: ${String(sourceHosting.project_id)}`);
}
if (builtHosting.project_id !== sourceHosting.project_id) {
  fail("built hosting.json does not match the source project");
}

const wrangler = await readJson<{
  assets?: {
    binding?: string;
    directory?: string;
    run_worker_first?: boolean | string[];
  };
}>("dist/server/wrangler.json");
if (wrangler.assets?.binding !== "ASSETS") {
  fail("Cloudflare ASSETS binding is missing");
}
const workerFirst = wrangler.assets?.run_worker_first;
if (
  workerFirst !== true &&
  (!Array.isArray(workerFirst) ||
    !workerFirst.includes("/data") ||
    !workerFirst.includes("/data/*"))
) {
  fail("Cloudflare Worker-first rules do not cover /data and /data/*");
}

const clientDirectory = path.join(root, "dist", "client");
const clientFiles = await walkFiles(clientDirectory);
const expectedRuntimeAssetFiles = runtimeModuleNames
  .flatMap((moduleName) => [
    `data/${moduleName}.bin`,
    `data/${moduleName}.meta.json`,
  ])
  .sort();
const builtRuntimeAssetFiles = clientFiles
  .map((file) => normalizedPath(path.relative(clientDirectory, file)))
  .filter((file) => file.startsWith("data/"))
  .sort();
if (
  JSON.stringify(builtRuntimeAssetFiles) !==
  JSON.stringify(expectedRuntimeAssetFiles)
) {
  fail(
    `Worker-routed runtime asset set mismatch: ${builtRuntimeAssetFiles.join(", ")}`,
  );
}
for (const moduleName of runtimeModuleNames) {
  for (const extension of ["bin", "meta.json"]) {
    const relativeAsset = `${moduleName}.${extension}`;
    const sourceStats = await stat(
      path.join(root, ".runtime-assets", "data", relativeAsset),
    );
    const builtStats = await stat(
      path.join(clientDirectory, "data", relativeAsset),
    );
    if (sourceStats.size === 0 || builtStats.size !== sourceStats.size) {
      fail(`Worker-routed runtime asset size mismatch: ${relativeAsset}`);
    }
  }
}
const forbiddenClientAssets = clientFiles
  .map((file) => normalizedPath(path.relative(clientDirectory, file)))
  .filter(
    (file) =>
      !file.startsWith("data/") &&
      (file.toLowerCase().endsWith(".bin") ||
        /(^|\/)content(?:-[a-z0-9-]+)?\.(?:json|meta\.json|manifest(?:\.json)?)$/i.test(
          file,
        )),
  );
if (forbiddenClientAssets.length) {
  fail(
    `runtime content is present in the client asset tree: ${forbiddenClientAssets.join(", ")}`,
  );
}

const workerSource = await readFile(path.join(root, "worker", "index.ts"), "utf8");
for (const requiredGuard of [
  "isProtectedRuntimePath",
  "safeImageExtension",
  "__SEOLBI_RUNTIME_ASSET_FETCH__",
]) {
  if (!workerSource.includes(requiredGuard)) {
    fail(`Worker source guard is missing: ${requiredGuard}`);
  }
}

const contentPath = path.join(root, "src", "data", "generated", "content.json");
if ((await stat(contentPath)).size < 1_000_000) {
  fail("generated source content is unexpectedly small");
}

const tracked = trackedFiles();
const forbiddenTracked = tracked.filter(
  (file) =>
    ((/(^|\/)\.env($|\.)/.test(file) && file !== ".env.example") ||
      /\.(xlsx|xls|hwp)$/i.test(file) ||
      file.startsWith("public/data/")),
);
if (forbiddenTracked.length) {
  fail(
    `sensitive source or public runtime content is tracked: ${forbiddenTracked.join(", ")}`,
  );
}

const textClientFiles = clientFiles.filter((file) =>
  /\.(?:js|json|html|txt)$/i.test(file),
);
const baseContent = JSON.parse(
  await readFile(contentPath, "utf8"),
) as GeneratedContent;
const runtime = buildRuntimeContent(baseContent);
const sensitiveSamples = runtime.questions
  .filter((question) => question.contentStatus === "published")
  .flatMap((question) => [question.answerText, question.explanation])
  .map((value) => value.trim())
  .filter((value) => value.length >= 48)
  .sort((a, b) => b.length - a.length)
  .filter((value, index, values) => values.indexOf(value) === index)
  .slice(0, 40);
if (sensitiveSamples.length < 10) {
  fail("not enough sensitive samples for client answer-leak verification");
}

const answerLeakFiles = new Set<string>();
for (const file of textClientFiles) {
  const body = await readFile(file, "utf8");
  if (sensitiveSamples.some((sample) => body.includes(sample))) {
    answerLeakFiles.add(path.relative(root, file));
  }
}
if (answerLeakFiles.size) {
  fail(
    `answer or explanation text is present in client output: ${[
      ...answerLeakFiles,
    ].join(", ")}`,
  );
}

const wranglerDryRun = execFileSync(
  process.execPath,
  [
    path.join(root, "node_modules", "wrangler", "bin", "wrangler.js"),
    "deploy",
    "--config",
    path.join(root, "dist", "server", "wrangler.json"),
    "--dry-run",
  ],
  {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  },
);
if (
  !wranglerDryRun.includes("Attaching additional modules") ||
  !wranglerDryRun.includes("--dry-run: exiting now.")
) {
  fail("Wrangler dry-run did not validate the Worker Data modules");
}

await verifyLocalWorkerBoundary();

console.log(
  [
    "PASS: deployment readiness",
    `Sites project ${EXPECTED_SITE_ID}`,
    "runtime content packaged as Worker-routed opaque Pages assets",
    "direct and image-proxy runtime paths return 404 without gzip bytes",
    "representative /written/theory Worker flow returns 2xx",
    "no answer samples in client text assets",
    "Node runtime and Wrangler dry-run verified",
  ].join(" | "),
);
