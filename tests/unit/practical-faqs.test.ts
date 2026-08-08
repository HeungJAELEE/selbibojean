import { describe, expect, it } from "vitest";

import {
  getPracticalFaqsForTab,
  PRACTICAL_FAQS,
} from "@/data/source/practical-faqs";
import { PRACTICAL_TRAINING_RESOURCES } from "@/data/source/practical-training-resources";

describe("practical FAQs", () => {
  it("uses unique IDs and complete public-facing answers", () => {
    expect(new Set(PRACTICAL_FAQS.map((faq) => faq.id)).size).toBe(
      PRACTICAL_FAQS.length,
    );
    expect(new Set(PRACTICAL_FAQS.map((faq) => faq.question)).size).toBe(
      PRACTICAL_FAQS.length,
    );

    for (const faq of PRACTICAL_FAQS) {
      expect(faq.question.trim()).not.toBe("");
      expect(faq.shortAnswer.trim()).not.toBe("");
      expect(faq.details.length).toBeGreaterThan(0);
      expect(faq.details.every((detail) => detail.trim().length > 0)).toBe(
        true,
      );
    }
  });

  it("routes preparation and test-center questions to separate tabs", () => {
    const prepFaqs = getPracticalFaqsForTab("prep");
    const centerFaqs = getPracticalFaqsForTab("centers");

    expect(prepFaqs.length).toBeGreaterThan(0);
    expect(centerFaqs.length).toBeGreaterThan(0);
    expect(prepFaqs.every((faq) => faq.relatedTab === "prep")).toBe(true);
    expect(centerFaqs.every((faq) => faq.relatedTab === "centers")).toBe(true);
    expect(
      centerFaqs.every((faq) => faq.category === "test_center"),
    ).toBe(true);
  });

  it("keeps chat, AI, and missing-attachment claims behind an explicit HOLD boundary", () => {
    const chatAnswerFaq = PRACTICAL_FAQS.find(
      (faq) => faq.id === "faq-chat-ai-answer-trust",
    );
    const missingAttachmentFaq = PRACTICAL_FAQS.find(
      (faq) => faq.id === "faq-missing-chat-attachments",
    );

    expect(chatAnswerFaq?.shortAnswer).toContain("HOLD");
    expect(missingAttachmentFaq?.shortAnswer).toContain("복원할 수 없습니다");
    expect(missingAttachmentFaq?.details.join(" ")).toContain(
      "임의로 붙여 공개하지 않습니다",
    );
  });

  it("references only known official training resource IDs", () => {
    const resourceIds = new Set(
      PRACTICAL_TRAINING_RESOURCES.map((resource) => resource.id),
    );

    for (const faq of PRACTICAL_FAQS) {
      for (const resourceId of faq.sourceResourceIds) {
        expect(resourceIds.has(resourceId)).toBe(true);
      }
    }
  });

  it("uses the requested non-promotional regional education wording", () => {
    const regionalFaq = PRACTICAL_FAQS.find(
      (faq) => faq.id === "faq-regional-training-search",
    );

    expect(regionalFaq?.shortAnswer).toContain(
      "이 지역에 이런 교육 경로가 있으니 참고해보세요",
    );
    expect(regionalFaq?.shortAnswer).toContain("기관 공식 페이지");
  });

  it("explains that ended official courses remain as separate historical records", () => {
    const endedTrainingFaq = PRACTICAL_FAQS.find(
      (faq) => faq.id === "faq-ended-training-link",
    );

    expect(endedTrainingFaq?.shortAnswer).toContain(
      "과거 교육장소·종료 과정 기록",
    );
    expect(endedTrainingFaq?.shortAnswer).toContain("새 일정");
    expect(endedTrainingFaq?.sourceResourceIds).toContain(
      "asan-kopo-seolbi-welding-2026-history",
    );
  });
});
