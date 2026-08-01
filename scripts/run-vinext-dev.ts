import { execFile, spawn } from "node:child_process";
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
const vinextArgs = process.argv.slice(2);

let exitCode = 1;

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

  exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [vinextCli, "dev", ...vinextArgs], {
      cwd: root,
      env: process.env,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  await Promise.all([
    rm(transientPublicData, { recursive: true, force: true }),
    rm(gatedBusanMedia, { recursive: true, force: true }),
  ]);
}

process.exit(exitCode);
