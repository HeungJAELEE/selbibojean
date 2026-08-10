import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  buildMismatchQueueMarkdown,
  buildMismatchReviewQueue,
  type QuestionAudit,
  type QuestionLinkageSource,
  type RoundAudit,
} from "../../scripts/audit-cbt-round-fidelity";

const qualificationKey = "facility-maintenance-engineer-current" as const;

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function makeQuestionAudit(
  overrides: Partial<QuestionAudit> = {},
): QuestionAudit {
  return {
    externalId: "2007-4-Q94",
    canonicalId: "U-777",
    questionNumber: 94,
    sourceUrl: "https://cbtbank.kr/exam/de20070902",
    status: "stem_and_choices_mismatch",
    stemFidelity: "mismatch",
    choicesFidelity: "mismatch",
    answerMatches: false,
    source: {
      questionNumber: 94,
      stem: "원문 지문",
      choices: ["원문 보기 1", "원문 보기 2", "원문 보기 3", "원문 보기 4"],
      answerIndex: 2,
      imageUrls: ["https://cbtbank.kr/assets/q94.png"],
    },
    current: {
      stem: "현재 지문",
      choices: ["현재 보기 1", "현재 보기 2", "현재 보기 3", "현재 보기 4"],
      answerIndex: 1,
    },
    ...overrides,
  };
}

function makeRound(
  questions: QuestionAudit[],
  sourceUrl = "https://cbtbank.kr/exam/de20070902?ref=old#q94",
): RoundAudit {
  return {
    sessionLabel: "2007년 4회",
    sourceUrl,
    sourceHost: "cbtbank.kr",
    expectedVariantCount: questions.length,
    capturedQuestionCount: questions.length,
    pageTitle: "설비보전기사 기출문제",
    status: "audited",
    error: null,
    counts: {
      exact: 0,
      normalized_exact: 0,
      stem_mismatch: 0,
      choices_mismatch: 0,
      stem_and_choices_mismatch: questions.length,
      answer_mismatch: 0,
      source_question_missing: 0,
      source_unreachable: 0,
    },
    questions,
  };
}

function makeLinkageSource(): QuestionLinkageSource {
  return {
    variants: [
      {
        externalId: "2007-4-Q94",
        canonicalId: "U-777",
        relationship: "고유문항",
        year: 2007,
        sessionLabel: "4회",
        questionNumber: 94,
        conceptAlias: "유압펌프 소음",
        subjectCode: 1,
        stem: "현재 지문",
        choices: ["현재 보기 1", "현재 보기 2", "현재 보기 3", "현재 보기 4"],
        answer: "②",
        explanation: "현재 해설",
        sourceUrl: "https://cbtbank.kr/exam/de20070902",
        reviewStatus: "확정",
        verificationNote: "",
      },
    ],
    questions: [
      {
        id: "U-777",
        subjectId: "subject-1",
        conceptGroupId: "s1-g03",
        conceptId: "concept-pump-noise",
        lessonId: "lesson-pump-noise",
        lessonAnchor: "diagnosis",
      } as QuestionLinkageSource["questions"][number],
    ],
    conceptGroups: [
      {
        id: "s1-g03",
        subjectId: "subject-1",
        order: 3,
        title: "유압 펌프",
        keywords: ["캐비테이션", "에어레이션"],
      },
    ],
    lessons: [
      {
        id: "lesson-pump-noise",
        title: "유압펌프 소음 진단",
        aliases: ["펌프 이상음"],
      } as QuestionLinkageSource["lessons"][number],
    ],
  };
}

describe("CBT round fidelity mismatch review queue", () => {
  it("uses source URL, question number, and source hashes instead of year replacement", () => {
    const audit = makeQuestionAudit();
    const first = buildMismatchReviewQueue(
      [makeRound([audit])],
      makeLinkageSource(),
      qualificationKey,
      "2026-08-05T00:00:00.000Z",
    );
    const second = buildMismatchReviewQueue(
      [makeRound([audit])],
      makeLinkageSource(),
      qualificationKey,
      "2026-08-06T00:00:00.000Z",
    );

    expect(first.entries).toHaveLength(1);
    expect(first.entries[0].matchKey).toEqual({
      qualificationKey,
      roundUrl: "https://cbtbank.kr/exam/de20070902",
      questionNumber: 94,
      stemSha256: sha256("원문 지문"),
      choicesSha256: sha256(
        JSON.stringify(["원문 보기 1", "원문 보기 2", "원문 보기 3", "원문 보기 4"]),
      ),
      hashBasis: "source_exact",
    });
    expect(first.entries[0].reviewKeySha256).toBe(
      second.entries[0].reviewKeySha256,
    );
  });

  it("keeps stem, choices, answer, and image review states independent", () => {
    const queue = buildMismatchReviewQueue(
      [makeRound([makeQuestionAudit()])],
      makeLinkageSource(),
      qualificationKey,
      "2026-08-05T00:00:00.000Z",
    );

    expect(queue.entries[0].statuses).toEqual({
      stem: "mismatch",
      choices: "mismatch",
      answer: "mismatch",
      image: "source_image_present_review_pending",
    });
    expect(queue.summary).toEqual({
      stemMismatch: 1,
      choicesMismatch: 1,
      answerMismatch: 1,
      imageReviewRequired: 1,
      unreachable: 0,
    });
  });

  it("carries concept keywords and exact lesson linkage into the review packet", () => {
    const queue = buildMismatchReviewQueue(
      [makeRound([makeQuestionAudit()])],
      makeLinkageSource(),
      qualificationKey,
      "2026-08-05T00:00:00.000Z",
    );

    expect(queue.entries[0].conceptKeywords).toEqual([
      "유압펌프 소음",
      "유압 펌프",
      "캐비테이션",
      "에어레이션",
      "유압펌프 소음 진단",
      "펌프 이상음",
    ]);
    expect(queue.entries[0].lessonLinkage).toEqual({
      subjectId: "subject-1",
      conceptGroupId: "s1-g03",
      conceptId: "concept-pump-noise",
      lessonId: "lesson-pump-noise",
      lessonAnchor: "diagnosis",
      href: "/written/theory/lesson-pump-noise#diagnosis",
    });
  });

  it("preserves exact source text by excluding it unless an image still needs review", () => {
    const exactWithoutImage = makeQuestionAudit({
      status: "exact",
      stemFidelity: "exact",
      choicesFidelity: "exact",
      answerMatches: true,
      source: {
        questionNumber: 94,
        stem: "원문 지문",
        choices: ["원문 보기 1", "원문 보기 2", "원문 보기 3", "원문 보기 4"],
        answerIndex: 1,
        imageUrls: [],
      },
      current: {
        stem: "원문 지문",
        choices: ["원문 보기 1", "원문 보기 2", "원문 보기 3", "원문 보기 4"],
        answerIndex: 1,
      },
    });
    const exactWithImage = makeQuestionAudit({
      ...exactWithoutImage,
      externalId: "2007-4-Q95",
      questionNumber: 95,
      source: {
        ...exactWithoutImage.source!,
        questionNumber: 95,
        imageUrls: ["https://cbtbank.kr/assets/q95.png"],
      },
    });

    const source = makeLinkageSource();
    source.variants.push({
      ...source.variants[0],
      externalId: "2007-4-Q95",
      questionNumber: 95,
    });
    const queue = buildMismatchReviewQueue(
      [makeRound([exactWithoutImage, exactWithImage])],
      source,
      qualificationKey,
      "2026-08-05T00:00:00.000Z",
    );

    expect(queue.entries.map((entry) => entry.externalId)).toEqual([
      "2007-4-Q95",
    ]);
    expect(queue.entries[0].statuses.image).toBe(
      "source_image_present_review_pending",
    );
  });

  it("falls back to current hashes without pretending unreachable content is source exact", () => {
    const unreachable = makeQuestionAudit({
      status: "source_unreachable",
      stemFidelity: "unreachable",
      choicesFidelity: "unreachable",
      answerMatches: null,
      source: null,
    });
    const queue = buildMismatchReviewQueue(
      [makeRound([unreachable])],
      makeLinkageSource(),
      qualificationKey,
      "2026-08-05T00:00:00.000Z",
    );

    expect(queue.entries[0].matchKey.hashBasis).toBe("current_fallback");
    expect(queue.entries[0].sourceHashes).toEqual({
      stemSha256: null,
      choicesSha256: null,
    });
    expect(queue.entries[0].statuses.answer).toBe("unreachable");
    expect(queue.entries[0].statuses.image).toBe("unreachable");
  });

  it("documents the full identity contract and round-level mismatch counts", () => {
    const queue = buildMismatchReviewQueue(
      [makeRound([makeQuestionAudit()])],
      makeLinkageSource(),
      qualificationKey,
      "2026-08-05T00:00:00.000Z",
    );
    const markdown = buildMismatchQueueMarkdown(queue);

    expect(markdown).toContain(
      "자격 키 + 회차 URL + 문항번호 + 원문 지문 SHA-256 + 원문 보기 SHA-256",
    );
    expect(markdown).toContain("연도만으로 치환하지 않으며");
    expect(markdown).toContain("https://cbtbank.kr/exam/de20070902");
  });
});
