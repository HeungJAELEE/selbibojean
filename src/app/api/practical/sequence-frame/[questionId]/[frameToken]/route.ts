import {
  getPublicPracticalQuestion,
  getPublicPracticalVisualAid,
} from "@/lib/content/practical-repository";
import {
  findPracticalSequenceFrameByToken,
  getPracticalPromptVisualUsage,
} from "@/lib/practical-sequence-server";

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
    return new Response("Not found", { status: 404 });
  }

  const question = await getPublicPracticalQuestion(questionId);
  if (!question || question.examFormat !== "sequence") {
    return new Response("Not found", { status: 404 });
  }
  const visualAid = await getPublicPracticalVisualAid(
    question.visualAidId,
    getPracticalPromptVisualUsage(question),
  );
  if (!visualAid || visualAid.frames.length < 2) {
    return new Response("Not found", { status: 404 });
  }

  const frame = findPracticalSequenceFrameByToken(
    question.id,
    visualAid,
    frameToken,
  );
  if (!frame) {
    return new Response("Not found", { status: 404 });
  }

  const assetResponse = await fetch(new URL(frame.path, request.url), {
    headers: { accept: "image/*" },
  });
  const contentType = assetResponse.headers.get("content-type") ?? "";
  if (!assetResponse.ok || !contentType.startsWith("image/")) {
    return new Response("Image unavailable", { status: 502 });
  }

  return new Response(assetResponse.body, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": contentType,
      "x-content-type-options": "nosniff",
    },
  });
}
