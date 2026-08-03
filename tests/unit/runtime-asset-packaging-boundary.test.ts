import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ResolvedConfig } from "vite";
import { sites } from "../../build/sites-vite-plugin";
import { stagePagesOutput } from "../../scripts/pages-package";

const temporaryDirectories: string[] = [];

async function createTemporaryRoot() {
  const root = await mkdtemp(join(tmpdir(), "seolbi-runtime-package-"));
  temporaryDirectories.push(root);
  return root;
}

async function exists(filePath: string) {
  return access(filePath).then(
    () => true,
    () => false,
  );
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("runtime answer-bank packaging boundary", () => {
  it("removes stale public runtime copies without deleting unrelated build assets", async () => {
    const root = await createTemporaryRoot();
    await mkdir(resolve(root, ".openai"), { recursive: true });
    await mkdir(resolve(root, "public", "data"), { recursive: true });
    await mkdir(resolve(root, "dist", "client", "data"), { recursive: true });
    await mkdir(resolve(root, "dist", "client", "assets"), { recursive: true });
    await mkdir(resolve(root, "dist", "pages", "data"), { recursive: true });
    await mkdir(resolve(root, "dist", "pages", "images"), { recursive: true });
    await writeFile(
      resolve(root, ".openai", "hosting.json"),
      '{"project_id":"test-project"}',
    );
    await writeFile(resolve(root, "public", "data", "content.bin"), "private");
    await writeFile(
      resolve(root, "dist", "client", "data", "content.bin"),
      "private",
    );
    await writeFile(
      resolve(root, "dist", "pages", "data", "content.bin"),
      "private",
    );
    await writeFile(
      resolve(root, "dist", "client", "assets", "keep.js"),
      "client",
    );
    await writeFile(
      resolve(root, "dist", "pages", "images", "keep.webp"),
      "pages",
    );

    const plugin = sites();
    const configResolved = plugin.configResolved;
    if (!configResolved) {
      throw new Error("Expected the sites plugin to expose configResolved.");
    }
    if (typeof configResolved === "function") {
      await configResolved.call({} as never, { root } as ResolvedConfig);
    } else {
      await configResolved.handler.call(
        {} as never,
        { root } as ResolvedConfig,
      );
    }
    const closeBundle = plugin.closeBundle;
    if (!closeBundle) {
      throw new Error("Expected the sites plugin to expose closeBundle.");
    }
    if (typeof closeBundle === "function") {
      await closeBundle.call({} as never);
    } else {
      await closeBundle.handler.call({} as never);
    }

    expect(await exists(resolve(root, "public", "data"))).toBe(false);
    expect(await exists(resolve(root, "dist", "client", "data"))).toBe(false);
    expect(await exists(resolve(root, "dist", "pages", "data"))).toBe(false);
    expect(
      await readFile(resolve(root, "dist", "client", "assets", "keep.js"), "utf8"),
    ).toBe("client");
    expect(
      await readFile(resolve(root, "dist", "pages", "images", "keep.webp"), "utf8"),
    ).toBe("pages");
  });

  it("stages server modules and Worker-routed opaque data under Pages output", async () => {
    const root = await createTemporaryRoot();
    const clientDirectory = resolve(root, "dist", "client");
    const serverDirectory = resolve(root, "dist", "server");
    const serverAssetsDirectory = resolve(serverDirectory, "assets");
    const serverSsrDirectory = resolve(serverDirectory, "ssr");
    const workerEntry = resolve(serverDirectory, "index.js");
    const pagesDirectory = resolve(root, "dist", "pages");
    await mkdir(resolve(clientDirectory, "data"), { recursive: true });
    await mkdir(resolve(clientDirectory, "assets"), { recursive: true });
    await mkdir(serverAssetsDirectory, { recursive: true });
    await mkdir(serverSsrDirectory, { recursive: true });
    await writeFile(resolve(clientDirectory, "data", "content.bin"), "private");
    await writeFile(resolve(clientDirectory, "assets", "client.js"), "client");
    await writeFile(workerEntry, "export default { fetch() {} };");
    await writeFile(
      resolve(serverDirectory, "__vite_rsc_assets_manifest.js"),
      "export default {};",
    );
    await writeFile(resolve(serverAssetsDirectory, "runtime.js"), "export {};");
    await writeFile(resolve(serverAssetsDirectory, "content-hash.bin"), "private");
    await writeFile(
      resolve(serverSsrDirectory, "index.js"),
      "export const render = () => null;",
    );

    await stagePagesOutput({
      clientDirectory,
      pagesDirectory,
      serverDirectory,
    });

    expect(
      await readFile(resolve(pagesDirectory, "data", "content.bin"), "utf8"),
    ).toBe("private");
    expect(
      await readFile(resolve(pagesDirectory, "assets", "client.js"), "utf8"),
    ).toBe("client");
    expect(
      await readFile(resolve(pagesDirectory, "_worker.js", "index.js"), "utf8"),
    ).toBe('export { default } from "./server/index.js";\n');
    expect(
      await readFile(
        resolve(pagesDirectory, "_worker.js", "server", "index.js"),
        "utf8",
      ),
    ).toContain("export default");
    expect(
      await readFile(
        resolve(
          pagesDirectory,
          "_worker.js",
          "server",
          "assets",
          "content-hash.bin",
        ),
        "utf8",
      ),
    ).toBe("private");
    expect(
      await readFile(
        resolve(pagesDirectory, "_worker.js", "server", "ssr", "index.js"),
        "utf8",
      ),
    ).toContain("render");
    expect(
      await readFile(
        resolve(
          pagesDirectory,
          "_worker.js",
          "server",
          "__vite_rsc_assets_manifest.js",
        ),
        "utf8",
      ),
    ).toContain("export default");
  });
});
