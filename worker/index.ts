import {
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  handleImageOptimization,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: Env, context: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/data" || url.pathname.startsWith("/data/")) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (
      url.pathname.startsWith("/assets/") ||
      url.pathname.startsWith("/images/") ||
      /\.[a-z0-9]{2,8}$/i.test(url.pathname)
    ) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }
    if (url.pathname === "/_vinext/image") {
      const images = env.IMAGES;
      if (!images) {
        const assetPath = url.searchParams.get("url");
        if (!assetPath || !assetPath.startsWith("/") || assetPath.startsWith("//")) {
          return new Response("Invalid image asset", { status: 400 });
        }
        return env.ASSETS.fetch(new Request(new URL(assetPath, request.url)));
      }
      const widths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (assetPath) => env.ASSETS.fetch(new Request(new URL(assetPath, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await images.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          },
        },
        widths,
      );
    }

    (
      globalThis as typeof globalThis & {
        __SEOLBI_RUNTIME_ASSET_FETCH__?: (path: string) => Promise<Response>;
      }
    ).__SEOLBI_RUNTIME_ASSET_FETCH__ = (path) =>
      env.ASSETS.fetch(new Request(new URL(path, request.url)));

    return handler.fetch(request, env, context);
  },
};

export default worker;
