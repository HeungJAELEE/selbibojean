import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import content from "@/data/generated/content.json";
import reconstruction from "@/data/generated/cbt-source-reconstruction.json";
import formatFixtures from "../../tests/fixtures/cbt-source-format-regression.json";

const dataset = reconstruction as unknown as {
  sourceCounts: {
    variants: number;
    sessions: number;
    selectedQuestionsCaptured: number;
    sourceImages: number;
    reachableSourceImages: number;
    publicationReady: number;
    publicationHolds: number;
  };
  sessions: Array<{
    duplicateSelectedQuestionNumbers: number[];
    missingSelectedQuestionNumbers: number[];
    selectedCapturedCount: number;
    expectedVariantCount: number;
  }>;
  records: Array<{
    externalId: string;
    canonicalId: string;
    questionNumber: number | null;
    registeredSourceUrl: string;
    sourceCaptureStatus: string;
    source: {
      exactStem: string;
      exactChoices: string[];
      answerIndex: number | null;
      stemSha256: string;
      orderedChoicesSha256: string;
      imageObservations?: Array<{ reachable: boolean }>;
    };
    variantChoiceIds: string[];
    theoryLink: {
      lessonId: string;
      lessonAnchor: string;
      conceptGroupId: string;
      conceptId: string;
    } | null;
    answerEvidence: string;
    publicationStatus: string;
    publicationHoldReasons: string[];
  }>;
};

const generated = content as typeof content;
const variantsById = new Map(
  generated.variants.map((variant) => [variant.externalId, variant]),
);
const questionsById = new Map(
  generated.questions.map((question) => [question.id, question]),
);
const recordsById = new Map(
  dataset.records.map((record) => [record.externalId, record]),
);

describe("CBT source reconstruction ledger", () => {
  it("reconciles all 2,384 registered variants without changing their identities", () => {
    expect(dataset.sourceCounts.variants).toBe(generated.variants.length);
    expect(dataset.sourceCounts.selectedQuestionsCaptured).toBe(
      generated.variants.length,
    );
    expect(dataset.records).toHaveLength(generated.variants.length);
    expect(new Set(dataset.records.map((record) => record.externalId)).size).toBe(
      dataset.records.length,
    );

    for (const record of dataset.records) {
      const variant = variantsById.get(record.externalId);
      expect(variant).toBeDefined();
      expect(record.canonicalId).toBe(variant?.canonicalId);
      expect(record.questionNumber).toBe(variant?.questionNumber);
      expect(record.registeredSourceUrl).toBe(variant?.sourceUrl);
      expect(record.sourceCaptureStatus).toBe("captured");
      expect(record.source.exactStem.trim().length).toBeGreaterThan(0);
      expect(record.source.exactChoices.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("keeps every unreviewed restored variant behind the publication gate", () => {
    expect(dataset.sourceCounts.publicationReady).toBe(0);
    expect(dataset.sourceCounts.publicationHolds).toBe(dataset.records.length);

    for (const record of dataset.records) {
      expect(record.publicationStatus).toBe("hold");
      expect(record.answerEvidence).toBe("unknown");
      expect(record.publicationHoldReasons).toEqual(
        expect.arrayContaining([
          "source_answer_review_required",
          "source_direct_solution_review_required",
          "source_choice_feedback_review_required",
          "source_theory_link_review_required",
        ]),
      );
    }
  });

  it("preserves canonical lesson and concept identities while using deterministic source choice IDs", () => {
    for (const record of dataset.records) {
      const question = questionsById.get(record.canonicalId);
      expect(question).toBeDefined();
      expect(record.theoryLink).toEqual({
        lessonId: question?.lessonId,
        lessonAnchor: question?.lessonAnchor,
        conceptGroupId: question?.conceptGroupId,
        conceptId: question?.conceptId,
      });
      expect(record.variantChoiceIds).toEqual(
        record.source.exactChoices.map(
          (_, index) => `${record.externalId}-source-c${index + 1}`,
        ),
      );
    }
  });

  it("captures every selected session without duplicate or missing question numbers", () => {
    expect(dataset.sourceCounts.sessions).toBe(27);
    for (const session of dataset.sessions) {
      expect(session.duplicateSelectedQuestionNumbers).toEqual([]);
      expect(session.missingSelectedQuestionNumbers).toEqual([]);
      expect(session.selectedCapturedCount).toBe(session.expectedVariantCount);
    }
  });

  it("keeps all captured source images reachable", () => {
    expect(dataset.sourceCounts.sourceImages).toBeGreaterThan(0);
    expect(dataset.sourceCounts.reachableSourceImages).toBe(
      dataset.sourceCounts.sourceImages,
    );
    expect(
      dataset.records
        .flatMap((record) => record.source.imageObservations ?? [])
        .every((image) => image.reachable),
    ).toBe(true);
  });

  it("preserves source superscript and subscript formatting for regression fixtures", () => {
    for (const fixture of formatFixtures) {
      const record = recordsById.get(fixture.externalId);
      expect(record?.source.exactStem).toBe(fixture.sourceExactStem);
      expect(record?.source.exactChoices).toEqual(fixture.sourceExactChoices);
      expect(record?.source.answerIndex).toBe(fixture.sourceAnswerIndex);
    }
  });

  it("exposes the reconstruction ledger only through a server-only repository", () => {
    const source = readFileSync(
      path.join(
        process.cwd(),
        "src/lib/content/cbt-source-reconstruction.ts",
      ),
      "utf8",
    );
    expect(source).toMatch(/^import\s+["']server-only["'];/m);
  });
});
