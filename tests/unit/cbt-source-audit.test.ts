import { describe, expect, it } from "vitest";
import {
  canPublishCbtAnswer,
  canPublishCbtQuestion,
  classifyContentFidelity,
  isSingleCaptureAnswerUncontested,
  normalizeCbtExactText,
  type CbtPublicationDecisionInput,
} from "@/lib/content/cbt-source-audit";
import {
  CBT_EXAM_TRACKS,
  matchCbtExamTrackByPageTitle,
} from "@/data/source/cbt-exam-tracks";

const approved: CbtPublicationDecisionInput = {
  canonicalQuestionId: "question-1",
  trackIdentityStatus: "matched",
  sourceAuthority: "mirror_capture",
  contentFidelity: "normalized_exact",
  assetStatus: "not_required",
  auditResolution: "approved",
  answerEvidence: "single_capture_uncontested",
  answerChoiceId: "choice-2",
  answerChoiceQuestionId: "question-1",
};

describe("CBT source audit publication boundary", () => {
  it("keeps all seven immutable exam-track keys", () => {
    expect(CBT_EXAM_TRACKS.map((track) => track.key)).toEqual([
      "facility-maintenance-engineer-current",
      "facility-maintenance-engineer-legacy",
      "facility-maintenance-industrial-current",
      "mechanical-maintenance-industrial-legacy",
      "welding-engineer",
      "welding-industrial-engineer",
      "welding-craftsman",
    ]);
  });

  it("does not guess current versus legacy from an ambiguous title", () => {
    expect(matchCbtExamTrackByPageTitle("설비보전기사 기출문제")).toBeNull();
    expect(matchCbtExamTrackByPageTitle("용접기능사 기출문제")?.key).toBe(
      "welding-craftsman",
    );
  });

  it("normalizes only Unicode and layout whitespace", () => {
    expect(normalizeCbtExactText("  가\r\n나\t  다  ")).toBe("가\n나 다");
    expect(classifyContentFidelity("가\r\n나  다", "가\n나 다")).toBe(
      "normalized_exact",
    );
    expect(classifyContentFidelity("압력은 증가", "압력은 감소")).toBe(
      "mismatch",
    );
  });

  it("requires matched identity, approved fidelity, and usable assets", () => {
    expect(canPublishCbtQuestion(approved)).toBe(true);
    expect(
      canPublishCbtQuestion({ ...approved, trackIdentityStatus: "ambiguous" }),
    ).toBe(false);
    expect(
      canPublishCbtQuestion({ ...approved, assetStatus: "rights_hold" }),
    ).toBe(false);
  });

  it("publishes only stable-choice answers with accepted evidence", () => {
    expect(canPublishCbtAnswer(approved)).toBe(true);
    expect(
      canPublishCbtAnswer({ ...approved, answerEvidence: "conflict" }),
    ).toBe(false);
    expect(canPublishCbtAnswer({ ...approved, answerChoiceId: null })).toBe(
      false,
    );
    expect(
      canPublishCbtAnswer({
        ...approved,
        answerChoiceQuestionId: "question-elsewhere",
      }),
    ).toBe(false);
  });

  it("accepts a single reconstruction only when every conflict check passes", () => {
    const check = {
      hasExplicitAnswer: true,
      opposingEvidenceFound: false,
      internalContradictionFound: false,
      calculationOrUnitConflictFound: false,
      matchingStableChoiceIds: ["choice-3"],
    };
    expect(isSingleCaptureAnswerUncontested(check)).toBe(true);
    expect(
      isSingleCaptureAnswerUncontested({
        ...check,
        opposingEvidenceFound: true,
      }),
    ).toBe(false);
    expect(
      isSingleCaptureAnswerUncontested({
        ...check,
        matchingStableChoiceIds: ["choice-2", "choice-3"],
      }),
    ).toBe(false);
  });
});
