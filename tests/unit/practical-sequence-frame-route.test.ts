import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  PracticalVisualAid,
  PublicPracticalQuestion,
} from "@/lib/domain/practical-types";
import { toPracticalSequenceFrameTokens } from "@/lib/practical-sequence-server";
import type { PracticalVisualAssetGlobal } from "@/lib/practical-visual-asset-path";

const mocks = vi.hoisted(() => ({
  getPublicPracticalQuestion: vi.fn(),
  getPublicPracticalVisualAid: vi.fn(),
}));

vi.mock("@/lib/content/practical-repository", () => ({
  getPublicPracticalQuestion: mocks.getPublicPracticalQuestion,
  getPublicPracticalVisualAid: mocks.getPublicPracticalVisualAid,
}));

const question = {
  id: "sequence-question",
  kind: "predicted",
  title: "균열 정지구멍·제거·보수 3단계",
  formatLabel: "사진을 끌어 올바른 작업순서로 배열",
  stem: "사진을 올바른 작업순서로 배열하시오.",
  conceptIds: ["PCON-001"],
  primaryStudyCategoryId: "work_procedure",
  studyCategoryIds: ["work_procedure"],
  ncsSources: [],
  visualAidId: "sequence-visual",
  label: "predicted_exam",
  auditDisposition: "verified",
  contentStatus: "published",
  occurrence: null,
  predictedBasis: "NCS 작업 장면 기반",
  examFormat: "sequence",
  examCardIds: [],
  visualAidIds: ["sequence-visual"],
  sequenceItemIds: ["step-1", "step-2"],
  unit: null,
  variantOfQuestionId: null,
  examEvidenceStatus: "ncs_supplement",
} satisfies PublicPracticalQuestion;

function makeVisualAid(path = "/practical/visuals/crack-repair-stop-holes.png") {
  return {
    id: "sequence-visual",
    frames: [
      {
        id: "canonical-first-step",
        path,
        promptAltText: "작업 순서를 판단하기 위한 장면",
        learningAltText: "균열 끝에 정지구멍을 가공한다.",
        captionBeforeAnswer: null,
        captionAfterAnswer: "균열 끝에 정지구멍을 가공한다.",
        outputAssetHash: "asset-hash-1",
      },
      {
        id: "canonical-second-step",
        path: "/practical/visuals/crack-repair-gouge-groove.png",
        promptAltText: "작업 순서를 판단하기 위한 다른 장면",
        learningAltText: "결함부를 제거한다.",
        captionBeforeAnswer: null,
        captionAfterAnswer: "결함부를 제거한다.",
        outputAssetHash: "asset-hash-2",
      },
    ],
  } as PracticalVisualAid;
}

function routeContext(visualAid: PracticalVisualAid) {
  const token = toPracticalSequenceFrameTokens(
    question.id,
    visualAid,
    visualAid.frames.map((frame) => frame.id),
  )?.[0];
  if (!token) throw new Error("Expected an opaque frame token.");
  return {
    request: new Request(
      `https://example.test/api/practical/sequence-frame/${question.id}/${token}`,
    ),
    context: { params: Promise.resolve({ questionId: question.id, frameToken: token }) },
  };
}

describe("GET /api/practical/sequence-frame/[questionId]/[frameToken]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getPublicPracticalQuestion.mockResolvedValue(question);
  });

  afterEach(() => {
    delete (globalThis as PracticalVisualAssetGlobal)
      .__SEOLBI_PRACTICAL_VISUAL_ASSET_FETCH__;
  });

  it("streams an opaque sequence frame through the Worker asset hook", async () => {
    const visualAid = makeVisualAid();
    mocks.getPublicPracticalVisualAid.mockResolvedValue(visualAid);
    const imageBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const assetFetch = vi.fn(async () =>
      new Response(imageBytes, {
        status: 200,
        headers: { "Content-Type": "image/png" },
      }),
    );
    (globalThis as PracticalVisualAssetGlobal)
      .__SEOLBI_PRACTICAL_VISUAL_ASSET_FETCH__ = assetFetch;
    const { request, context } = routeContext(visualAid);
    const { GET } = await import(
      "@/app/api/practical/sequence-frame/[questionId]/[frameToken]/route"
    );

    const response = await GET(request, context);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(imageBytes);
    expect(assetFetch).toHaveBeenCalledWith(
      "/practical/visuals/crack-repair-stop-holes.png",
    );
  });

  it("fails closed before the asset hook for a non-allowlisted canonical path", async () => {
    const visualAid = makeVisualAid("/data/content.bin");
    mocks.getPublicPracticalVisualAid.mockResolvedValue(visualAid);
    const assetFetch = vi.fn();
    (globalThis as PracticalVisualAssetGlobal)
      .__SEOLBI_PRACTICAL_VISUAL_ASSET_FETCH__ = assetFetch;
    const { request, context } = routeContext(visualAid);
    const { GET } = await import(
      "@/app/api/practical/sequence-frame/[questionId]/[frameToken]/route"
    );

    const response = await GET(request, context);

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("Not found");
    expect(assetFetch).not.toHaveBeenCalled();
  });

  it("does not proxy non-image bytes returned by the asset hook", async () => {
    const visualAid = makeVisualAid();
    mocks.getPublicPracticalVisualAid.mockResolvedValue(visualAid);
    (globalThis as PracticalVisualAssetGlobal)
      .__SEOLBI_PRACTICAL_VISUAL_ASSET_FETCH__ = vi.fn(async () =>
        new Response("application response", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
      );
    const { request, context } = routeContext(visualAid);
    const { GET } = await import(
      "@/app/api/practical/sequence-frame/[questionId]/[frameToken]/route"
    );

    const response = await GET(request, context);

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("Image unavailable");
  });
});
