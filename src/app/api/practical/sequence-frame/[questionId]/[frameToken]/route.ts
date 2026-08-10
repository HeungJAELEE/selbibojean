import {
  getPublicPracticalQuestion,
  getPublicPracticalVisualAid,
} from "@/lib/content/practical-repository";
import {
  findPracticalSequenceFrameByToken,
  getPracticalPromptVisualUsage,
} from "@/lib/practical-sequence-server";
import {
  normalizePracticalSequenceVisualAssetPath,
  type PracticalVisualAssetGlobal,
} from "@/lib/practical-visual-asset-path";

function errorResponse(body: string, status: 404 | 502) {
  return new Response(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ questionId: string; frameToken: string }>;
  },
) {
  const { questionId, frameToken } = await params;
  if (!/^[A-Za-z0-9_-]{24}$/.test(frameToken)) {
    return errorResponse("Not found", 404);
  }

  const question = await getPublicPracticalQuestion(questionId);
  if (!question || question.examFormat !== "sequence") {
    return errorResponse("Not found", 404);
  }
  const visualAid = await getPublicPracticalVisualAid(
    question.visualAidId,
    getPracticalPromptVisualUsage(question),
  );
  if (!visualAid || visualAid.frames.length < 2) {
    return errorResponse("Not found", 404);
  }

  const frame = findPracticalSequenceFrameByToken(
    question.id,
    visualAid,
    frameToken,
  );
  if (!frame) {
    return errorResponse("Not found", 404);
  }

  const assetPath = normalizePracticalSequenceVisualAssetPath(frame.path);
  if (!assetPath) return errorResponse("Not found", 404);

  let assetResponse: Response;
  try {
    const internalAssetFetch = (globalThis as PracticalVisualAssetGlobal)
      .__SEOLBI_PRACTICAL_VISUAL_ASSET_FETCH__;
    assetResponse = internalAssetFetch
      ? await internalAssetFetch(assetPath)
      : await fetch(new URL(assetPath, request.url), {
          headers: { accept: "image/*" },
        });
  } catch {
    return errorResponse("Image unavailable", 502);
  }
  const contentType = assetResponse.headers.get("content-type") ?? "";
  if (!assetResponse.ok || !contentType.toLowerCase().startsWith("image/")) {
    return errorResponse("Image unavailable", 502);
  }

  return new Response(assetResponse.body, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": contentType,
      "x-content-type-options": "nosniff",
    },
  });
}
