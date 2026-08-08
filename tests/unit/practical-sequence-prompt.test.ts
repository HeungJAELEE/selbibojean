import { describe, expect, it } from "vitest";

import type { PracticalVisualAid } from "@/lib/domain/practical-types";
import {
  findPracticalSequenceFrameByToken,
  resolvePracticalSequenceFrameTokens,
  toPracticalSequenceFrameTokens,
  toPublicPracticalSequenceVisualAid,
} from "@/lib/practical-sequence-server";
import { findForbiddenPreSubmitFields } from "@/lib/security/answer-leak";

const visualAid = {
  id: "sequence-visual",
  frames: [
    {
      id: "canonical-first-step",
      path: "/practical/visuals/canonical-first-step.png",
      promptAltText: "작업 순서를 판단하기 위한 장면",
      learningAltText: "측정면을 청소하고 영점을 확인한다.",
      captionBeforeAnswer: null,
      captionAfterAnswer: "먼저 측정면을 청소하고 영점을 확인한다.",
      outputAssetHash: "first-secret-hash",
    },
    {
      id: "canonical-final-step",
      path: "/practical/visuals/canonical-final-step.png",
      promptAltText: "작업 순서를 판단하기 위한 다른 장면",
      learningAltText: "측정값을 기록하고 공구를 정리한다.",
      captionBeforeAnswer: "장면의 작업을 확인하세요.",
      captionAfterAnswer: "마지막으로 측정값을 기록하고 공구를 정리한다.",
      outputAssetHash: "final-secret-hash",
    },
  ],
} as PracticalVisualAid;

describe("practical sequence prompt projection", () => {
  it("replaces canonical frame identifiers and paths with learner-safe tokens", () => {
    const prompt = toPublicPracticalSequenceVisualAid({
      questionId: "question-1",
      visualAid,
      frameIds: ["canonical-final-step", "canonical-first-step"],
    });

    expect(prompt.frames.map((frame) => frame.promptAltText)).toEqual([
      "작업 순서를 판단하기 위한 다른 장면",
      "작업 순서를 판단하기 위한 장면",
    ]);
    expect(prompt.frames.map((frame) => frame.id)).not.toEqual([
      "canonical-final-step",
      "canonical-first-step",
    ]);
    expect(
      prompt.frames.every((frame) =>
        frame.imageUrl.startsWith(
          "/api/practical/sequence-frame/question-1/",
        ),
      ),
    ).toBe(true);
    expect(findForbiddenPreSubmitFields(prompt)).toEqual([]);

    const serialized = JSON.stringify(prompt);
    for (const secret of [
      "canonical-first-step",
      "canonical-final-step",
      "/practical/visuals/canonical-first-step.png",
      "/practical/visuals/canonical-final-step.png",
      "측정면을 청소하고 영점을 확인한다.",
      "측정값을 기록하고 공구를 정리한다.",
      "first-secret-hash",
      "final-secret-hash",
    ]) {
      expect(serialized).not.toContain(secret);
    }
  });

  it("resolves only a complete permutation of opaque frame tokens", () => {
    const canonicalIds = visualAid.frames.map((frame) => frame.id);
    const tokens = toPracticalSequenceFrameTokens(
      "question-1",
      visualAid,
      canonicalIds,
    );

    expect(tokens).not.toBeNull();
    expect(
      resolvePracticalSequenceFrameTokens(
        "question-1",
        visualAid,
        tokens ?? [],
      ),
    ).toEqual(canonicalIds);
    expect(
      resolvePracticalSequenceFrameTokens("question-1", visualAid, [
        "unknown-token",
        "another-token",
      ]),
    ).toBeNull();
    expect(
      findPracticalSequenceFrameByToken(
        "question-1",
        visualAid,
        tokens?.[0] ?? "",
      )?.id,
    ).toBe(canonicalIds[0]);
  });
});
