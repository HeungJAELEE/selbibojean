import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const appRouterFetch = vi.hoisted(() =>
  vi.fn(async () => new Response("app response", { status: 200 })),
);

vi.mock("vinext/server/app-router-entry", () => ({
  default: { fetch: appRouterFetch },
}));

import worker from "../../worker/index";

type WorkerEnv = Parameters<typeof worker.fetch>[1];
type WorkerContext = Parameters<typeof worker.fetch>[2];
type RuntimeGlobal = typeof globalThis & {
  __SEOLBI_RUNTIME_ASSET_FETCH__?: (path: string) => Promise<Response>;
};

const context: WorkerContext = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
};

function createEnv(
  assetFetch: ReturnType<typeof vi.fn<(request: Request) => Promise<Response>>>,
): WorkerEnv {
  return { ASSETS: { fetch: assetFetch } };
}

function imageRequest(assetPath: string) {
  const url = new URL("/_vinext/image", "https://example.test");
  url.searchParams.set("url", assetPath);
  url.searchParams.set("w", "640");
  url.searchParams.set("q", "75");
  return new Request(url);
}

describe("Worker runtime asset boundary", () => {
  beforeEach(() => {
    appRouterFetch.mockClear();
  });

  afterEach(() => {
    delete (globalThis as RuntimeGlobal).__SEOLBI_RUNTIME_ASSET_FETCH__;
  });

  it.each([
    "/data/content.bin",
    "/%64ata/content.bin",
    "/%2564ata/content.bin",
    "/.runtime-assets/data/content.bin",
    "/images/preview.bin",
    "/content.meta.json",
    "/content.manifest.json",
  ])("blocks public runtime asset request %s before ASSETS", async (pathname) => {
    const assetFetch = vi.fn(async () =>
      new Response(new Uint8Array([0x1f, 0x8b]), {
        status: 200,
        headers: { "Content-Type": "application/gzip" },
      }),
    );

    const response = await worker.fetch(
      new Request(new URL(pathname, "https://example.test")),
      createEnv(assetFetch),
      context,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(assetFetch).not.toHaveBeenCalled();
    expect(appRouterFetch).not.toHaveBeenCalled();
  });

  it.each([
    "/data/content.bin",
    "/%64ata/content.bin",
    "/%2564ata/content.bin",
    "/assets/../data/content.bin",
    "/.runtime-assets/data/content.bin",
    "/images/preview.bin",
    "/content.meta.json",
    "/content.manifest.json",
    "/images/unsafe.svg",
  ])("blocks image proxy source %s before ASSETS", async (assetPath) => {
    const assetFetch = vi.fn(async () =>
      new Response(new Uint8Array([0x1f, 0x8b]), {
        status: 200,
        headers: { "Content-Type": "application/gzip" },
      }),
    );

    const response = await worker.fetch(
      imageRequest(assetPath),
      createEnv(assetFetch),
      context,
    );

    expect(response.ok).toBe(false);
    expect(assetFetch).not.toHaveBeenCalled();
  });

  it("rejects an image extension whose ASSETS response is not an image MIME", async () => {
    const assetFetch = vi.fn(async () =>
      new Response(new Uint8Array([0x1f, 0x8b]), {
        status: 200,
        headers: { "Content-Type": "application/gzip" },
      }),
    );

    const response = await worker.fetch(
      imageRequest("/images/photo.png"),
      createEnv(assetFetch),
      context,
    );

    expect(response.status).toBe(400);
    expect(assetFetch).toHaveBeenCalledTimes(1);
    expect(new Uint8Array(await response.arrayBuffer())).not.toEqual(
      new Uint8Array([0x1f, 0x8b]),
    );
  });

  it("passes through a normalized image path only when extension and MIME are allowed", async () => {
    const imageBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const assetFetch = vi.fn(async (request: Request) => {
      void request;
      return new Response(imageBytes, {
        status: 200,
        headers: { "Content-Type": "image/png" },
      });
    });

    const response = await worker.fetch(
      imageRequest("/images/photo.png"),
      createEnv(assetFetch),
      context,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(imageBytes);
    const firstAssetRequest = assetFetch.mock.calls[0]?.[0];
    expect(firstAssetRequest).toBeInstanceOf(Request);
    if (!(firstAssetRequest instanceof Request)) {
      throw new Error("Expected the image source request to reach ASSETS.");
    }
    expect(new URL(firstAssetRequest.url).pathname).toBe("/images/photo.png");
  });

  it("rejects every non-allowlisted key in the internal fetcher", async () => {
    const assetFetch = vi.fn(async (request: Request) =>
      new Response(new URL(request.url).pathname, { status: 200 }),
    );
    const env = createEnv(assetFetch);

    await worker.fetch(
      new Request("https://example.test/written/theory"),
      env,
      context,
    );
    const runtimeFetch = (globalThis as RuntimeGlobal)
      .__SEOLBI_RUNTIME_ASSET_FETCH__;
    expect(runtimeFetch).toBeTypeOf("function");

    for (const blocked of [
      "/data/../images/photo.png",
      "/images/photo.png",
      "/data/content.manifest.json",
      "/data/content-subject-5.bin",
    ]) {
      const response = await runtimeFetch!(blocked);
      expect(response.status).toBe(404);
    }
    expect(assetFetch).not.toHaveBeenCalled();
  });

  it("reads an allowlisted runtime asset only through the internal ASSETS binding", async () => {
    const runtimeBytes = new Uint8Array([0x1f, 0x8b, 0x08]);
    const assetFetch = vi.fn(async (request: Request) => {
      void request;
      return new Response(runtimeBytes, {
        status: 200,
        headers: { "Content-Type": "application/gzip" },
      });
    });
    const env = createEnv(assetFetch);

    await worker.fetch(
      new Request("https://example.test/written/theory"),
      env,
      context,
    );
    const runtimeFetch = (globalThis as RuntimeGlobal)
      .__SEOLBI_RUNTIME_ASSET_FETCH__;
    const response = await runtimeFetch!("/data/content.bin");

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(runtimeBytes);
    expect(assetFetch).toHaveBeenCalledTimes(1);
    expect(
      new URL(assetFetch.mock.calls[0]![0].url).pathname,
    ).toBe("/data/content.bin");
  });
});
