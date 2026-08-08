import { createHash } from "node:crypto";

import type {
  PracticalVisualUsage,
  PracticalVisualAid,
  PracticalVisualFrame,
  PublicPracticalSequenceVisualAid,
  PublicPracticalQuestion,
} from "@/lib/domain/practical-types";
import { isValidSequencePermutation } from "@/lib/practical-sequence";

function createPracticalSequenceFrameToken(
  questionId: string,
  visualAidId: string,
  frameId: string,
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        "practical-sequence-v1",
        questionId,
        visualAidId,
        frameId,
      ]),
    )
    .digest("base64url")
    .slice(0, 24);
}

function frameTokenEntries(questionId: string, visualAid: PracticalVisualAid) {
  return visualAid.frames.map((frame) => [
    createPracticalSequenceFrameToken(questionId, visualAid.id, frame.id),
    frame,
  ] as const);
}

export function getPracticalPromptVisualUsage(
  question: Pick<
    PublicPracticalQuestion,
    "kind" | "examEvidenceStatus"
  >,
): PracticalVisualUsage {
  // A reconstructed past question is still a past-exam prompt.  Returning
  // `concept_explanation` here allowed self-authored teaching diagrams to be
  // rendered before submission as though they were the recalled stimulus.
  // The visual policy must therefore decide whether an exact, source-governed
  // past prompt is available; otherwise the learner sees no prompt visual.
  return question.kind === "past"
    ? "past_exam_prompt"
    : "variant_exam_prompt";
}

export function toPracticalSequenceFrameTokens(
  questionId: string,
  visualAid: PracticalVisualAid,
  frameIds: string[],
): string[] | null {
  const canonicalIds = visualAid.frames.map((frame) => frame.id);
  if (!isValidSequencePermutation(frameIds, canonicalIds)) return null;

  const tokenByFrameId = new Map(
    frameTokenEntries(questionId, visualAid).map(([token, frame]) => [
      frame.id,
      token,
    ]),
  );
  return frameIds.map((frameId) => tokenByFrameId.get(frameId)!);
}

export function resolvePracticalSequenceFrameTokens(
  questionId: string,
  visualAid: PracticalVisualAid,
  frameTokens: string[],
): string[] | null {
  const frameIdByToken = new Map(
    frameTokenEntries(questionId, visualAid).map(([token, frame]) => [
      token,
      frame.id,
    ]),
  );
  const frameIds = frameTokens.map((token) => frameIdByToken.get(token));
  if (frameIds.some((frameId) => frameId === undefined)) return null;

  const resolved = frameIds as string[];
  return isValidSequencePermutation(
    resolved,
    visualAid.frames.map((frame) => frame.id),
  )
    ? resolved
    : null;
}

export function findPracticalSequenceFrameByToken(
  questionId: string,
  visualAid: PracticalVisualAid,
  frameToken: string,
): PracticalVisualFrame | undefined {
  return frameTokenEntries(questionId, visualAid).find(
    ([token]) => token === frameToken,
  )?.[1];
}

export function toPublicPracticalSequenceVisualAid({
  questionId,
  visualAid,
  frameIds,
}: {
  questionId: string;
  visualAid: PracticalVisualAid;
  frameIds: string[];
}): PublicPracticalSequenceVisualAid {
  const frameById = new Map(
    visualAid.frames.map((frame) => [frame.id, frame] as const),
  );
  const frameTokens = toPracticalSequenceFrameTokens(
    questionId,
    visualAid,
    frameIds,
  );
  if (!frameTokens) {
    throw new Error(`Invalid public sequence frame order: ${questionId}`);
  }

  return {
    layout:
      visualAid.id === "ncs-drive-unit-assembly-process-sequence"
        ? "horizontal-portrait-strip"
        : "grid",
    frames: frameIds.map((frameId, index) => {
      const frame = frameById.get(frameId)!;
      const token = frameTokens[index];
      return {
        id: token,
        imageUrl: `/api/practical/sequence-frame/${encodeURIComponent(
          questionId,
        )}/${token}`,
        promptAltText: frame.promptAltText,
        captionBeforeAnswer: frame.captionBeforeAnswer,
      };
    }),
  };
}
