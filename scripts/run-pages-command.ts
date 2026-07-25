import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const rootDirectory = process.cwd();
const action = process.argv[2];

if (action !== "dev" && action !== "deploy") {
  throw new Error('Usage: tsx scripts/run-pages-command.ts <dev|deploy>');
}

const wranglerEntry = resolve(
  rootDirectory,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);
const pagesOutputDirectory = resolve(rootDirectory, "dist", "pages");
const temporaryConfigDirectory = await mkdtemp(
  join(tmpdir(), "seolbi-pages-"),
);
const temporaryConfig = resolve(temporaryConfigDirectory, "wrangler.jsonc");

// Vinext writes a redirected Workers configuration under the repository's
// .wrangler directory. Running Pages from that tree makes Wrangler merge the
// incompatible Workers and Pages base paths. A short-lived standard Pages
// config outside the repository avoids the collision without mutating either
// deployment configuration.
await writeFile(
  temporaryConfig,
  `${JSON.stringify(
    {
      $schema: resolve(
        rootDirectory,
        "node_modules",
        "wrangler",
        "config-schema.json",
      ),
      name: "seolbi-learning-platform",
      pages_build_output_dir: pagesOutputDirectory,
      compatibility_date: "2026-07-25",
      compatibility_flags: ["nodejs_compat"],
    },
    null,
    2,
  )}\n`,
  "utf8",
);

try {
  const wranglerArguments = [
    wranglerEntry,
    "pages",
    action,
    "--cwd",
    temporaryConfigDirectory,
  ];

  if (action === "dev") {
    wranglerArguments.push("--port", "8788", "--ip", "127.0.0.1");
  }

  const child = spawn(process.execPath, wranglerArguments, {
    cwd: rootDirectory,
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: "1331127386217adcf945dbdaa15ffdef",
    },
    stdio: "inherit",
    windowsHide: true,
  });

  const exitCode = await new Promise<number>((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        resolveExit(1);
        return;
      }
      resolveExit(code ?? 1);
    });
  });

  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
} finally {
  await rm(temporaryConfigDirectory, { recursive: true, force: true });
}
