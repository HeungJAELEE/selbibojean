import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const vinextCli = path.join(root, "node_modules", "vinext", "dist", "cli.js");
const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
const prepareScript = path.join(root, "scripts", "prepare-runtime-assets.ts");
const transientPublicData = path.join(root, "public", "data");
const gatedBusanMedia = path.join(
  root,
  "public",
  "practical",
  "test-centers",
  "busan-kopo",
);

let exitCode = 0;

try {
  const prepared = await execFileAsync(
    process.execPath,
    [tsxCli, prepareScript],
    {
      cwd: root,
      env: process.env,
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  if (prepared.stdout) process.stdout.write(prepared.stdout);
  if (prepared.stderr) process.stderr.write(prepared.stderr);
  if (process.env.BUILD_TEST_FAIL_AFTER_PREP === "true") {
    throw new Error("forced failure after runtime preparation");
  }
  const result = await execFileAsync(process.execPath, [vinextCli, "build"], {
    cwd: root,
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
} catch (error) {
  exitCode = 1;
  if (
    error &&
    typeof error === "object" &&
    "stdout" in error &&
    typeof error.stdout === "string"
  ) {
    process.stdout.write(error.stdout);
  }
  if (
    error &&
    typeof error === "object" &&
    "stderr" in error &&
    typeof error.stderr === "string"
  ) {
    process.stderr.write(error.stderr);
  }
  console.error("vinext build failed.");
} finally {
  await Promise.all([
    rm(transientPublicData, { recursive: true, force: true }),
    rm(gatedBusanMedia, { recursive: true, force: true }),
  ]);
}

if (exitCode !== 0) process.exit(exitCode);

console.log(
  "Removed transient public/data and gated media staging after build; private sources remain outside public.",
);
