import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GeneratedContent } from "@/lib/domain/types";
import { weldingSafetyReviewDatasetSchema } from "@/lib/content/welding-safety-supplement";

const reviewDataset = weldingSafetyReviewDatasetSchema.parse(
  JSON.parse(
    await readFile(
      path.join(process.cwd(), "src/data/generated/welding-safety-review.json"),
      "utf8",
    ),
  ),
);
const publicDataset = JSON.parse(
  await readFile(path.join(process.cwd(), "src/data/generated/content.json"), "utf8"),
) as GeneratedContent;

describe("33rd welding safety workbook reconciliation", () => {
  it("matches the workbook and report totals", () => {
    expect(reviewDataset.status).toBe("imported");
    expect(reviewDataset.batch).toBe(33);
    expect(reviewDataset.counts).toMatchObject({
      importedQuestions: 283,
      importedLessons: 30,
      importedReviewQueueEntries: 150,
      importedRounds: 25,
      completedRounds: 25,
      excludedRows: 0,
      duplicateRows: 0,
      invalidRows: 0,
    });
    expect(reviewDataset.rounds.every(
      (round) => round.collectionStatus === "안전패턴 검토완료",
    )).toBe(true);
  });

  it("keeps every safety question blocked until the publication gates pass", () => {
    expect(reviewDataset.questions).toHaveLength(283);
    expect(reviewDataset.questions.every(
      (question) =>
        question.publicationStatus === "blocked" &&
        question.blockers.includes("answer_unverified") &&
        question.blockers.includes("authoritative_source_required") &&
        question.blockers.includes("choice_feedback_required") &&
        question.blockers.includes("theory_link_required"),
    )).toBe(true);
    expect(reviewDataset.questions.filter((question) => question.reviewPriority !== null)).toHaveLength(150);
    expect(reviewDataset.questions.filter((question) => !question.authoritativeSourceUrl)).toHaveLength(33);
  });

  it("keeps IDs, stems, answers, and category families internally consistent", () => {
    expect(new Set(reviewDataset.questions.map((question) => question.id)).size).toBe(283);
    expect(new Set(reviewDataset.questions.map((question) => question.stem)).size).toBe(283);
    expect(reviewDataset.questions.every(
      (question) =>
        question.choices.length === 4 &&
        question.correctChoiceIndex >= 0 &&
        question.answer.includes(question.choices[question.correctChoiceIndex]),
    )).toBe(true);

    const counts = reviewDataset.questions.reduce<Record<string, number>>((totals, question) => {
      totals[question.categoryFamily] = (totals[question.categoryFamily] ?? 0) + 1;
      return totals;
    }, {});
    expect(counts).toEqual({
      "감전·전기설비": 61,
      "보호구·광선·열·비산": 33,
      "화기작업·화재·폭발": 44,
      "가스용기·조정기·호스": 72,
      "용접흄·환기·질식": 33,
      "장비점검·작업관리": 40,
    });
  });

  it("does not silently expand the current public question bank", () => {
    expect(publicDataset.questions.filter((question) => question.contentStatus === "published")).toHaveLength(1314);
    expect(reviewDataset.counts.siteDuplicateCandidates).toBe(0);
    expect(reviewDataset.questions.some(
      (candidate) => publicDataset.questions.some((question) => question.id === candidate.id),
    )).toBe(false);
  });
});
