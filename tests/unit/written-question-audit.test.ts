import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  applyWrittenQuestionAuditManifest,
  isHighRiskPublicQuestion,
  parseWrittenQuestionAuditManifest,
} from "@/lib/content/written-question-audit";
import { isPublishableQuestion } from "@/lib/domain/practice";
import { mergeApprovedWeldingProcessContent } from "@/lib/content/welding-process-approved";
import { mergeApprovedWeldingSafetyContent } from "@/lib/content/welding-safety-approved";
import { normalizeCanonicalTaxonomy } from "@/lib/content/taxonomy-normalization";
import { mergeReviewedCbtVariants } from "@/lib/content/reviewed-cbt-variants";
import type { GeneratedContent } from "@/lib/domain/types";

const source = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "src/data/generated/content.json"),
    "utf8",
  ),
) as GeneratedContent;
const content = mergeApprovedWeldingProcessContent(
  mergeApprovedWeldingSafetyContent(normalizeCanonicalTaxonomy(source)),
);
const manifest = parseWrittenQuestionAuditManifest(
  JSON.parse(
    readFileSync(
      path.join(
        process.cwd(),
        "src/data/generated/written-question-audit.json",
      ),
      "utf8",
    ),
  ),
);

describe("written question audit manifest", () => {
  it("records a disposition for all 257 runtime review-queue questions", () => {
    const reviewQueue = content.questions.filter(
      (question) => question.contentStatus !== "published",
    );
    const auditedIds = new Set(
      manifest.entries
        .filter((entry) => entry.scope === "review_queue")
        .map((entry) => entry.questionId),
    );

    expect(reviewQueue).toHaveLength(257);
    expect(manifest.counts.reviewQueueExpected).toBe(257);
    expect(manifest.counts.reviewQueueAudited).toBe(257);
    expect(reviewQueue.every((question) => auditedIds.has(question.id))).toBe(
      true,
    );
  });

  it("freezes every detected high-risk public question in the audit scope", () => {
    const expectedIds = content.questions
      .filter(isHighRiskPublicQuestion)
      .map((question) => question.id)
      .sort();
    const auditedIds = manifest.entries
      .filter((entry) => entry.scope === "high_risk_public")
      .map((entry) => entry.questionId)
      .sort();

    expect(auditedIds).toEqual(expectedIds);
    expect(auditedIds.length).toBeGreaterThan(0);
  });

  it("records a completed decision and next action for every review-queue question", () => {
    const reviewEntries = manifest.entries.filter(
      (entry) => entry.scope === "review_queue",
    );
    const approved = reviewEntries.filter(
      (entry) =>
        entry.auditDisposition === "verified" ||
        entry.auditDisposition === "cbt_corrected",
    );
    const held = reviewEntries.filter((entry) =>
      entry.auditDisposition.startsWith("held_"),
    );

    expect(approved.length).toBeGreaterThan(0);
    expect(held.length).toBeGreaterThan(0);
    expect(approved.length + held.length).toBe(reviewEntries.length);
    expect(reviewEntries.every((entry) => entry.reviewNote.length > 0)).toBe(
      true,
    );
    expect(reviewEntries.every((entry) => entry.nextAction.length > 0)).toBe(
      true,
    );
    expect(
      approved.every(
        (entry) =>
          Boolean(entry.reviewRationale) &&
          entry.reviewChoiceFeedback?.length === 4,
      ),
    ).toBe(true);
  });

  it("requires evidence and a verified answer before any audit approval", () => {
    const approved = manifest.entries.filter(
      (entry) =>
        entry.auditDisposition === "verified" ||
        entry.auditDisposition === "cbt_corrected",
    );

    expect(
      approved.every(
        (entry) =>
          entry.evidenceLevel !== null &&
          entry.evidenceUrls.length > 0 &&
          entry.verifiedAnswer !== null,
      ),
    ).toBe(true);
  });

  it("applies nested audit data without mutating the source snapshot", () => {
    const first = manifest.entries[0];
    const original = content.questions.find(
      (question) => question.id === first.questionId,
    );
    const overlaid = applyWrittenQuestionAuditManifest(content, manifest);
    const audited = overlaid.questions.find(
      (question) => question.id === first.questionId,
    ) as (typeof overlaid.questions)[number] & {
      audit?: { auditDisposition: string };
    };

    expect(original).not.toHaveProperty("audit");
    expect(audited.audit?.auditDisposition).toBe(first.auditDisposition);
  });

  it("promotes only approved decisions and keeps held decisions blocked", () => {
    const overlaid = applyWrittenQuestionAuditManifest(content, manifest);
    const approvedIds = new Set(
      manifest.entries
        .filter(
          (entry) =>
            entry.auditDisposition === "verified" ||
            entry.auditDisposition === "cbt_corrected",
        )
        .map((entry) => entry.questionId),
    );
    const heldIds = new Set(
      manifest.entries
        .filter((entry) => entry.auditDisposition.startsWith("held_"))
        .map((entry) => entry.questionId),
    );

    expect(
      overlaid.questions
        .filter((question) => approvedIds.has(question.id))
        .every(
          (question) =>
            question.contentStatus === "published" &&
            question.publication?.readiness === "ready",
        ),
    ).toBe(true);
    expect(
      overlaid.questions
        .filter((question) => heldIds.has(question.id))
        .some(isPublishableQuestion),
    ).toBe(false);
  });

  it("does not let an older accepted audit override a newer CBT non-scoring gate", () => {
    const reviewed = mergeReviewedCbtVariants(source);
    const overlaid = applyWrittenQuestionAuditManifest(reviewed, manifest);

    for (const canonicalId of ["U-1161", "U-1166", "U-1089"]) {
      const question = overlaid.questions.find(
        (candidate) => candidate.id === canonicalId,
      );
      const lesson = overlaid.lessons.find(
        (candidate) => candidate.id === question?.lessonId,
      );
      expect(question?.audit?.auditDisposition).toBe(
        "held_answer_conflict",
      );
      expect(question?.contentStatus).toBe("in_review");
      expect(question?.publication).toMatchObject({
        readiness: "blocked",
        blockers: expect.arrayContaining(["answer_conflict"]),
      });
      expect(lesson?.contentStatus).toBe("in_review");
      expect(lesson?.publication?.readiness).toBe("blocked");
    }
  });

  it("preserves the newer runtime-validation hold over an older accepted audit", () => {
    const reviewed = mergeReviewedCbtVariants(source);
    const overlaid = applyWrittenQuestionAuditManifest(reviewed, manifest);
    const question = overlaid.questions.find((candidate) => candidate.id === "U-478");

    expect(question?.audit?.auditDisposition).toBe("held_runtime_validation");
    expect(question?.contentStatus).toBe("in_review");
    expect(question?.publication).toMatchObject({
      readiness: "blocked",
      blockers: expect.arrayContaining(["mapping_unverified"]),
    });
  });

  it("keeps audit evidence internally while removing it from learner lesson copy", () => {
    const overlaid = applyWrittenQuestionAuditManifest(content, manifest);
    const lesson = overlaid.lessons.find(
      (candidate) => candidate.id === "welding-safety-b33-st30-05",
    );
    const examPoint = lesson?.blocks.find(
      (block) => block.kind === "exam_point",
    );
    const learnerCopy = lesson?.blocks
      .map((block) => `${block.title}\n${block.body}`)
      .join("\n");
    const auditedQuestion = manifest.entries.find(
      (entry) => entry.questionId === "welding-safety-b33-ws31-q001",
    );

    expect(examPoint?.body).toContain("**질문**");
    expect(examPoint?.body).toContain("**판단 기준**");
    expect(examPoint?.body).not.toContain("welding-safety-b33-ws31-q001");
    expect(learnerCopy).not.toContain("감사 승인 근거");
    expect(learnerCopy).not.toContain("최종 검수일");
    expect(auditedQuestion?.evidenceUrls.length).toBeGreaterThan(0);
    expect(auditedQuestion?.reviewedAt).toBeTruthy();
  });

  it("does not let an accepted audit override mapping_unverified", () => {
    const original = source.questions.find((question) => question.id === "U-478");
    expect(original).toBeDefined();
    const blocked = {
      ...original!,
      contentStatus: "in_review" as const,
      publication: {
        readiness: "blocked" as const,
        blockers: ["mapping_unverified" as const],
      },
    };
    const gatedContent = {
      ...source,
      questions: source.questions.map((question) =>
        question.id === blocked.id ? blocked : question,
      ),
    };
    const accepted = {
      schemaVersion: 1 as const,
      generatedAt: "2026-08-08T00:00:00.000Z",
      sourceGeneratedAt: "2026-08-08T00:00:00.000Z",
      sourceSha256: "0".repeat(64),
      counts: {
        reviewQueueExpected: 1,
        reviewQueueAudited: 1,
        highRiskPublicAudited: 0,
        verified: 1,
        cbtCorrected: 0,
        held: 0,
      },
      entries: [
        {
          questionId: blocked.id,
          scope: "review_queue" as const,
          sourceContentStatus: "in_review" as const,
          auditDisposition: "verified" as const,
          evidenceLevel: "primary" as const,
          cbtAnswer: blocked.answerText,
          verifiedAnswer: blocked.answerText,
          evidenceUrls: ["https://example.com/primary"],
          reviewNote: "mapping repair is still pending",
          nextAction: "complete canonical mapping validation",
          assetStatus: "not_required" as const,
          reviewRationale: blocked.explanation,
          reviewedAt: "2026-08-08T00:00:00.000Z",
        },
      ],
    };
    const result = applyWrittenQuestionAuditManifest(gatedContent, accepted);
    const question = result.questions.find(
      (candidate) => candidate.id === blocked.id,
    );
    expect(question?.contentStatus).toBe("in_review");
    expect(question?.publication).toMatchObject({
      readiness: "blocked",
      blockers: ["mapping_unverified"],
    });
  });

});
