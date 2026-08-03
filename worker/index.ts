/// <reference types="vite/client" />

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

const subjectIds = ["subject-1", "subject-2", "subject-3", "subject-4"] as const;
const runtimeAssetPaths = new Set([
  "/data/content.bin",
  "/data/content.meta.json",
  ...subjectIds.flatMap((subjectId) => [
    `/data/content-${subjectId}.bin`,
    `/data/content-${subjectId}.meta.json`,
  ]),
]);
const safeImageExtension =
  /\.(?:avif|bmp|gif|ico|jpe?g|png|tiff?|webp)$/i;
const contentManifestName =
  /^content(?:-[a-z0-9-]+)?\.(?:json|meta\.json|manifest(?:\.json)?)$/i;

function protectedNotFound() {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function normalizePathname(pathname: string) {
  let decoded = pathname;
  for (let attempt = 0; attempt < 8 && decoded.includes("%"); attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      return null;
    }
  }
  if (
    decoded.includes("%") ||
    decoded.includes("\\") ||
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return null;
  }
  return decoded;
}

function isProtectedRuntimePath(pathname: string) {
  const lowerPath = pathname.toLowerCase();
  const fileName = lowerPath.slice(lowerPath.lastIndexOf("/") + 1);
  return (
    lowerPath === "/data" ||
    lowerPath.startsWith("/data/") ||
    lowerPath === "/.runtime-assets" ||
    lowerPath.startsWith("/.runtime-assets/") ||
    lowerPath.endsWith(".bin") ||
    contentManifestName.test(fileName)
  );
}

function safeAssetUrl(assetPath: string, requestUrl: string) {
  if (
    assetPath.includes("\\") ||
    !assetPath.startsWith("/") ||
    assetPath.startsWith("//")
  ) {
    return null;
  }
  let candidate: URL;
  try {
    candidate = new URL(assetPath, requestUrl);
  } catch {
    return null;
  }
  if (candidate.origin !== new URL(requestUrl).origin) return null;
  const normalizedPath = normalizePathname(candidate.pathname);
  if (!normalizedPath || isProtectedRuntimePath(normalizedPath)) return null;
  candidate.pathname = normalizedPath;
  candidate.hash = "";
  return candidate;
}

function publicAssetRequest(request: Request, pathname: string) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  return new Request(assetUrl, request);
}

async function fetchBundledRuntimeAsset(pathname: string, env: Env) {
  if (!runtimeAssetPaths.has(pathname)) return protectedNotFound();
  const assetUrl = new URL(pathname, "https://runtime-assets.internal");
  const response = await env.ASSETS.fetch(new Request(assetUrl));
  if (!response.ok) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request: Request, env: Env, context: ExecutionContext) {
    const url = new URL(request.url);
    const normalizedPath = normalizePathname(url.pathname);
    if (!normalizedPath || isProtectedRuntimePath(normalizedPath)) {
      return protectedNotFound();
    }
    if (
      normalizedPath.startsWith("/assets/") ||
      normalizedPath.startsWith("/images/") ||
      /\.[a-z0-9]{2,8}$/i.test(normalizedPath)
    ) {
      const assetResponse = await env.ASSETS.fetch(
        publicAssetRequest(request, normalizedPath),
      );
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }
    if (normalizedPath === "/_vinext/image") {
      const imageAssetUrl = safeAssetUrl(
        url.searchParams.get("url") ?? "",
        request.url,
      );
      if (
        !imageAssetUrl ||
        !safeImageExtension.test(imageAssetUrl.pathname)
      ) {
        return protectedNotFound();
      }
      const fetchAsset = async (assetPath: string) => {
        const assetUrl = safeAssetUrl(assetPath, request.url);
        if (!assetUrl || !safeImageExtension.test(assetUrl.pathname)) {
          return protectedNotFound();
        }
        return env.ASSETS.fetch(new Request(assetUrl));
      };
      const images = env.IMAGES;
      if (!images) {
        const widths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
        return handleImageOptimization(request, { fetchAsset }, widths);
      }
      const widths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset,
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
      fetchBundledRuntimeAsset(path, env);

    return handler.fetch(request, env, context);
  },
};

export default worker;
