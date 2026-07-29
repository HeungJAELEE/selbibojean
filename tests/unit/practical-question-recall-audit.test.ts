import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRACTICAL_MAY_10_RECALL_AUDIT,
  PRACTICAL_PRIORITY_RECALL_AUDIT,
  PRACTICAL_QUESTION_RECALL_AUDIT,
} from "@/data/source/practical-question-recall-audit";
import {
  getPublicPracticalRecallRegistry,
  PRACTICAL_RECALL_ANSWER_DECISIONS,
  PRACTICAL_RECALL_EVIDENCE_REVIEWS,
  PRACTICAL_RECALL_REFERENCE_VISUALS,
  PRACTICAL_RECALL_STUDY_GUIDES,
} from "@/data/source/practical-question-recall-evidence";

describe("practical question recall audit", () => {
  it("classifies all 28 May 10 recall topics without publishing a new question", () => {
    expect(PRACTICAL_MAY_10_RECALL_AUDIT).toHaveLength(28);
    expect(
      PRACTICAL_MAY_10_RECALL_AUDIT.map((item) => item.recallNumber),
    ).toEqual([
      ...Array.from({ length: 22 }, (_, index) => index + 1),
      33,
      34,
      35,
      36,
      37,
      38,
    ]);
    expect(
      PRACTICAL_MAY_10_RECALL_AUDIT.every(
        (item) =>
          item.publicationStatus === "registered_reconstructed" &&
          item.evidenceClass === "unverified_user_report",
      ),
    ).toBe(true);
  });

  it("promotes duplicate topics through existing content instead of minting IDs", () => {
    const linkedPromotions = PRACTICAL_MAY_10_RECALL_AUDIT.filter(
      (item) => item.classification === "linked_learning_verified",
    );
    expect(linkedPromotions).toHaveLength(17);
    expect(
      linkedPromotions.every((item) => item.relatedContentIds.length > 0),
    ).toBe(
      true,
    );
    expect(
      PRACTICAL_MAY_10_RECALL_AUDIT.filter(
        (item) => item.classification === "duplicate_no_add",
      ),
    ).toHaveLength(0);
    expect(
      PRACTICAL_QUESTION_RECALL_AUDIT.some((item) =>
        item.relatedContentIds.some((id) => id.startsWith("recall:")),
      ),
    ).toBe(false);
  });

  it("keeps unresolved asset boundaries while reflecting resolved visual equivalents", () => {
    const byId = (id: string) =>
      PRACTICAL_PRIORITY_RECALL_AUDIT.find((item) => item.id === id);

    expect(byId("recall:2026-round2:m18-drawing")?.blockers).toEqual([
      "held_asset_missing",
    ]);
    expect(byId("recall:2026-round2:m18-drawing")?.classification).toBe(
      "answer_resolved_reconstructed",
    );
    expect(byId("recall:2026-round2:blower-power")?.blockers).toEqual([]);
    expect(byId("recall:2026-round2:blower-power")?.classification).toBe(
      "answer_resolved_reconstructed",
    );
    expect(byId("recall:2026-round2:sems-bolt")?.blockers).toEqual([]);
    expect(byId("recall:2026-round2:sems-bolt")?.classification).toBe(
      "answer_resolved_reconstructed",
    );
    expect(byId("recall:2026-round2:brake-lining")?.blockers).toEqual([]);
    expect(byId("recall:2026-round2:drip-lubrication")?.blockers).toContain(
      "held_asset_missing",
    );
  });

  it("uses unique internal audit IDs and no recalled answer text field", () => {
    const ids = PRACTICAL_QUESTION_RECALL_AUDIT.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      PRACTICAL_QUESTION_RECALL_AUDIT.every(
        (item) =>
          !Object.prototype.hasOwnProperty.call(item, "answer") &&
          !Object.prototype.hasOwnProperty.call(item, "answerText"),
      ),
    ).toBe(true);
  });
});

describe("public reconstructed-question registry", () => {
  it("registers every audited occurrence while keeping original-prompt boundaries explicit", () => {
    const registry = getPublicPracticalRecallRegistry();

    expect(registry).toHaveLength(PRACTICAL_QUESTION_RECALL_AUDIT.length);
    expect(new Set(registry.map((item) => item.id)).size).toBe(registry.length);
    expect(
      registry.find((item) => item.id === "recall:2026-round2:m18-drawing")
        ?.status,
    ).toBe("answer_resolved");
    expect(
      registry.find((item) => item.id === "recall:2026-round2:sems-bolt")
        ?.status,
    ).toBe("answer_resolved");
    expect(
      registry.find((item) => item.id === "recall:2026-round2:sems-bolt")
        ?.limitation,
    ).toContain("공식 원문 정답");
    expect(
      registry.find((item) => item.id === "recall:2026-05-10:11")?.status,
    ).toBe("learning_verified");
    expect(
      registry.find((item) => item.id === "recall:2026-05-10:17")?.status,
    ).toBe("learning_verified");
    expect(registry.some((item) => item.status === "answer_conflict")).toBe(
      false,
    );
    expect(
      registry.reduce<Record<string, number>>((counts, item) => {
        counts[item.status] = (counts[item.status] ?? 0) + 1;
        return counts;
      }, {}),
    ).toEqual({
      answer_resolved: 6,
      learning_verified: 28,
    });
  });

  it("promotes source-verified learning while keeping unresolved prompts on hold", () => {
    const reviewedIds = new Set(
      PRACTICAL_RECALL_EVIDENCE_REVIEWS.map((review) => review.auditId),
    );
    const learningVerified = PRACTICAL_QUESTION_RECALL_AUDIT.filter(
      (item) => item.classification === "learning_source_verified",
    );
    const linkedLearningVerified = PRACTICAL_QUESTION_RECALL_AUDIT.filter(
      (item) => item.classification === "linked_learning_verified",
    );

    expect(learningVerified).toHaveLength(11);
    expect(
      learningVerified.every(
        (item) =>
          reviewedIds.has(item.id) &&
          !item.blockers.includes("held_source_missing"),
      ),
    ).toBe(true);
    expect(linkedLearningVerified).toHaveLength(17);
    expect(
      linkedLearningVerified.every(
        (item) =>
          reviewedIds.has(item.id) &&
          item.relatedContentIds.length > 0 &&
          !item.blockers.includes("held_source_missing"),
      ),
    ).toBe(true);
    expect(
      PRACTICAL_QUESTION_RECALL_AUDIT.filter((item) =>
        item.blockers.includes("held_source_missing"),
      ),
    ).toHaveLength(0);
    expect(
      PRACTICAL_RECALL_EVIDENCE_REVIEWS.every(
        (review) =>
          review.exactExamPromptFound === false &&
          review.publicAnswerAuthorized === false,
      ),
    ).toBe(true);
    expect(
      PRACTICAL_RECALL_EVIDENCE_REVIEWS.filter(
        (review) =>
          review.outcome === "learning_source_verified_prompt_missing",
      ).every(
        (review) =>
          review.sources.length > 0 &&
          review.learningPoint !== null &&
          review.memoryTip !== null,
      ),
    ).toBe(true);
    expect(PRACTICAL_RECALL_EVIDENCE_REVIEWS).toHaveLength(29);
    expect(
      getPublicPracticalRecallRegistry()
        .find((item) => item.id === "recall:2026-round2:brake-lining")
        ?.sourceLinks.some(
          (source) => source.authorityLabel === "공식 NCS 학습모듈",
        ),
    ).toBe(true);
    expect(
      getPublicPracticalRecallRegistry()
        .find((item) => item.id === "recall:2026-05-10:36")
        ?.sourceLinks.some((source) => source.title.includes("BIPM")),
    ).toBe(true);
  });

  it("adds study guidance to every promotable occurrence and external visuals to photo topics", async () => {
    const registry = getPublicPracticalRecallRegistry();
    const withoutStudyGuide = registry
      .filter((item) => item.learningPoint === null || item.memoryTip === null)
      .map((item) => item.id);

    expect(Object.keys(PRACTICAL_RECALL_STUDY_GUIDES)).toHaveLength(25);
    expect(withoutStudyGuide).toEqual([]);
    expect(Object.keys(PRACTICAL_RECALL_REFERENCE_VISUALS)).toHaveLength(4);
    expect(
      registry.find((item) => item.id === "recall:2026-round2:brake-lining")
        ?.referenceVisual,
    ).toBeNull();
    expect(
      Object.values(PRACTICAL_RECALL_REFERENCE_VISUALS).every(
        (visual) =>
          visual.src.startsWith("/practical/recall-reference/") &&
          visual.sourceUrl.startsWith("https://") &&
          visual.license.length > 0 &&
          visual.usageBoundary.includes("아니"),
      ),
    ).toBe(true);
    for (const visual of Object.values(PRACTICAL_RECALL_REFERENCE_VISUALS)) {
      const asset = await readFile(
        path.join(process.cwd(), "public", visual.src.replace(/^\//, "")),
      );
      expect(asset.byteLength).toBeGreaterThan(1_000);
      expect(createHash("sha256").update(asset).digest("hex").toUpperCase()).toBe(
        visual.sha256,
      );
    }
  });

  it("resolves all five recalled answer conflicts from choices and independent rules", () => {
    expect(PRACTICAL_RECALL_ANSWER_DECISIONS).toHaveLength(5);
    expect(
      PRACTICAL_RECALL_ANSWER_DECISIONS.map((decision) => [
        decision.auditId,
        decision.resolution,
      ]),
    ).toEqual(
      expect.arrayContaining([
        ["recall:2026-round2:m18-drawing", "8 mm, 9 mm"],
        ["recall:2026-round2:blower-power", "약 12.53 hp"],
        ["recall:2026-05-10:6", "종단부 균열(크레이터 균열)"],
        [
          "recall:2026-05-10:22",
          "윤활유의 유막강도가 충분히 증가한다",
        ],
        ["recall:2026-05-10:37", "침투성이 좋다"],
      ]),
    );
    expect(
      PRACTICAL_QUESTION_RECALL_AUDIT.filter(
        (item) => item.classification === "answer_conflict_hold",
      ),
    ).toHaveLength(0);
  });

  it("exposes only public-safe evidence labels rather than private source IDs or line ranges", () => {
    const serialized = JSON.stringify(getPublicPracticalRecallRegistry());

    expect(serialized).not.toContain("KQA-");
    expect(serialized).not.toContain("sourceLineRanges");
    expect(serialized).not.toContain("answerText");
    expect(serialized).not.toContain("12.53");
    expect(serialized).not.toContain("유막강도가 충분히 증가");
  });
});

describe("public theory recall boundaries", () => {
  it("labels conditional calculations and missing exam assets without claiming an official answer", async () => {
    const theory = await readFile(
      path.join(process.cwd(), "src/data/source/notion-theory.md"),
      "utf8",
    );

    expect(theory).toContain("같은 팬·같은 유체밀도·효율 변화가 작다는 조건");
    expect(theory).toContain("복원 조건에서 교정한 계산값은 **약 12.53 hp**");
    expect(theory).toContain("토크 일정 조건이 명시된 별도 변형");
    expect(theory).toContain("실제 시험 사진과 보기 전체는 확보되지 않았다");
    expect(theory).toContain("복원 조건에서의 교정 답은 **8 mm, 9 mm**");
    expect(theory).toContain("원그림을 사용하는 상호작용형 문항은 계속 보류한다");
  });
});
