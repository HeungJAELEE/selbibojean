import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const buildScript = path.join(root, "scripts", "run-vinext-build.ts");
const publicBusanMedia = path.join(
  root,
  "public",
  "practical",
  "test-centers",
  "busan-kopo",
);

let failedAsExpected = false;
try {
  await execFileAsync(process.execPath, ["--import", "tsx", buildScript], {
    cwd: root,
    env: {
      ...process.env,
      ENABLE_BUSAN_KOPO_MEDIA: "true",
      BUILD_TEST_FAIL_AFTER_PREP: "true",
    },
    maxBuffer: 20 * 1024 * 1024,
  });
} catch {
  failedAsExpected = true;
}

if (!failedAsExpected) {
  throw new Error("forced build failure did not occur");
}

try {
  await access(publicBusanMedia);
  throw new Error("gated Busan media remained under public after failure");
} catch (error) {
  if (
    error instanceof Error &&
    error.message === "gated Busan media remained under public after failure"
  ) {
    throw error;
  }
}

console.log("GATED_MEDIA_FAILURE_CLEANUP_OK");
