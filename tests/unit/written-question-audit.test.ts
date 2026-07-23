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
});
