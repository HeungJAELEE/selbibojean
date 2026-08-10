import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PRACTICAL_CONCEPT_EDITORIAL } from "@/data/source/practical-concept-editorial";
import {
  PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS,
  PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_BY_QUESTION_ID,
  PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_REVIEWS,
  PRACTICAL_WRITTEN_GPT_EDITORIAL_META,
} from "@/data/source/practical-written-gpt-editorial";
import { PRACTICAL_WRITTEN_EXAM_CARD_SEEDS } from "@/data/source/practical-written-exam-cards";
import type { PracticalContent } from "@/lib/domain/practical-types";

const content = await readFile(
  path.join(process.cwd(), "src/data/generated/practical-content.json"),
  "utf8",
).then((value) => JSON.parse(value) as PracticalContent);

const seededPastQuestionIds = new Set(
  PRACTICAL_WRITTEN_EXAM_CARD_SEEDS.flatMap((card) => card.pastQuestionIds),
);
const uncoveredPublishedPastQuestionIds = content.questions
  .filter(
    (question) =>
      question.kind === "past" &&
      question.contentStatus === "published" &&
      !seededPastQuestionIds.has(question.id),
  )
  .map((question) => question.id)
  .sort();

const bannedGenericPhrases = [
  "문제에서 요구한 명칭·조건·관계를 답안 키워드와 연결합니다.",
  "기출 답안을 외운 뒤 숫자·순서·설비가 바뀐 예상문제로 다시 확인합니다.",
  "같은 분야의 용어나 조건을 사용해 정답처럼 보일 수 있으므로",
  "요구 동사와 조건을 먼저 표시합니다.",
];

describe("single-session GPT practical written editorial", () => {
  it("covers every published past question not owned by a curated card", () => {
    expect(PRACTICAL_WRITTEN_GPT_EDITORIAL_META.terminalMarker).toBe(
      "END_PRACTICAL_WRITTEN_FILL",
    );
    expect(PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_REVIEWS).toHaveLength(41);
    expect(uncoveredPublishedPastQuestionIds).toHaveLength(40);
    expect(
      PRACTICAL_WRITTEN_GPT_EDITORIAL_META.localResolution.appliedCardReviews,
    ).toBe(40);
    expect(
      PRACTICAL_WRITTEN_GPT_EDITORIAL_META.localResolution
        .preservedCuratedCardReviews,
    ).toBe(1);
    expect(
      PRACTICAL_WRITTEN_GPT_EDITORIAL_META.localResolution.resolvedBlockers,
    ).toHaveLength(5);
    expect(
      [...PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_BY_QUESTION_ID.keys()].sort(),
    ).toEqual(uncoveredPublishedPastQuestionIds);
  });

  it("replaces filler prose with question-specific learning content", () => {
    const reasoningFingerprints = new Set<string>();

    for (const [
      questionId,
      editorial,
    ] of PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_BY_QUESTION_ID) {
      expect(editorial.recognitionPoints.length, questionId).toBeGreaterThan(0);
      expect(editorial.recognitionPoints.length, questionId).toBeLessThanOrEqual(
        3,
      );
      expect(editorial.reasoningSummary.length, questionId).toBeGreaterThan(0);
      expect(editorial.answerSkeleton.length, questionId).toBeGreaterThan(0);
      expect(editorial.commonWrongAnswers.length, questionId).toBeGreaterThan(
        0,
      );
      expect(editorial.commonWrongAnswers.length, questionId).toBeLessThanOrEqual(
        3,
      );
      expect(editorial.variationAxes.length, questionId).toBeGreaterThan(0);
      expect(editorial.variationAxes.length, questionId).toBeLessThanOrEqual(4);
      expect(editorial.conceptBridge.definitionSupport.length, questionId).toBeGreaterThan(
        20,
      );
      expect(editorial.conceptBridge.backgroundSupport.length, questionId).toBeGreaterThan(
        20,
      );
      expect(editorial.conceptBridge.examPattern.length, questionId).toBeGreaterThan(
        15,
      );

      const allLearnerText = JSON.stringify(editorial);
      for (const phrase of bannedGenericPhrases) {
        expect(allLearnerText, `${questionId} still contains filler`).not.toContain(
          phrase,
        );
      }

      const reasoningFingerprint = editorial.reasoningSummary.join("|");
      expect(
        reasoningFingerprints.has(reasoningFingerprint),
        `${questionId} duplicates another card reasoning`,
      ).toBe(false);
      reasoningFingerprints.add(reasoningFingerprint);
    }
  });

  it("keeps all seventeen concept reviews bound to existing editorial concepts", () => {
    expect(PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS).toHaveLength(17);
    expect(
      new Set(
        PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS.map((item) => item.conceptId),
      ).size,
    ).toBe(17);

    for (const review of PRACTICAL_CONCEPT_ENHANCEMENT_REVIEWS) {
      expect(
        PRACTICAL_CONCEPT_EDITORIAL[review.conceptId],
        `${review.conceptId} has no source editorial`,
      ).toBeDefined();
      expect(review.definition.length, review.conceptId).toBeGreaterThan(20);
      expect(review.principle.length, review.conceptId).toBeGreaterThan(40);
      expect(review.examFormats.length, review.conceptId).toBeGreaterThan(0);
      expect(review.requiredKeywords.length, review.conceptId).toBeGreaterThan(
        0,
      );
    }
  });

  it("keeps the GHS card aligned with the eight-symbol prompt", () => {
    const ghs = PRACTICAL_WRITTEN_EXAM_CARD_EDITORIAL_BY_QUESTION_ID.get(
      "P-2025-1-Q09",
    );

    expect(ghs).toBeDefined();
    expect(JSON.stringify(ghs)).not.toContain("느낌표");
    expect(ghs?.reasoningSummary.join(" ")).toContain("인체 실루엣");
    expect(ghs?.reasoningSummary.join(" ")).toContain("환경");
  });
});
