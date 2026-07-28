import { describe, expect, it } from "vitest";
import {
  findForbiddenPreSubmitFields,
  normalizeAnswerSentinel,
  uniqueAnswerSentinels,
} from "@/lib/security/answer-leak";

describe("answer leak guard", () => {
  it("finds forbidden answer fields at any nested DTO depth", () => {
    expect(
      findForbiddenPreSubmitFields({
        id: "question-1",
        nested: {
          rubric: [{ label: "정답", points: 2 }],
        },
      }),
    ).toEqual([
      {
        path: "$.nested.rubric",
        field: "rubric",
      },
    ]);
  });

  it("does not reject answer-free pre-submit fields", () => {
    expect(
      findForbiddenPreSubmitFields({
        id: "question-1",
        title: "축압기의 기능",
        learningKeywords: ["압력에너지"],
        visualAidId: null,
      }),
    ).toEqual([]);
  });

  it("rejects canonical sequence metadata from pre-submit visual DTOs", () => {
    expect(
      findForbiddenPreSubmitFields({
        frames: [
          {
            learningAltText: "answer-bearing action",
            captionAfterAnswer: "final step",
            outputAssetHash: "internal-hash",
          },
        ],
        promptFrameIds: ["canonical-frame-id"],
      }).map((finding) => finding.field),
    ).toEqual([
      "learningAltText",
      "captionAfterAnswer",
      "outputAssetHash",
      "promptFrameIds",
    ]);
  });

  it("normalizes and deduplicates only long unique answer sentinels", () => {
    const longAnswer =
      "  축압기는 압력 에너지를 저장하고 맥동을 흡수하며 비상 동력원으로 사용한다.  ";
    expect(normalizeAnswerSentinel(longAnswer)).not.toMatch(/\s{2,}/);
    expect(
      uniqueAnswerSentinels([longAnswer, longAnswer, "짧은 답"], 20),
    ).toEqual([normalizeAnswerSentinel(longAnswer)]);
  });
});
