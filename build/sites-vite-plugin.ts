import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export function sites(): Plugin {
  let root = process.cwd();
  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const builtRuntimeAssets = resolve(root, "dist", "client", "data");
      const privateRuntimeAssets = resolve(root, ".runtime-assets", "data");
      const developmentRuntimeAssets = resolve(root, "public", "data");
      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });
      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
      await rm(builtRuntimeAssets, { recursive: true, force: true });
      await mkdir(builtRuntimeAssets, { recursive: true });
      await cp(privateRuntimeAssets, builtRuntimeAssets, { recursive: true });
      await rm(developmentRuntimeAssets, { recursive: true, force: true });
    },
  };
}
