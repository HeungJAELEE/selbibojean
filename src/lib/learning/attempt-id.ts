import { createHash } from "node:crypto";

const LEGACY_ATTEMPT_NAMESPACE = Buffer.from(
  "6ba7b8109dad11d180b400c04fd430c8",
  "hex",
);

export type LegacyAttemptIdentity = {
  questionId: string;
  selectedChoiceId: string;
  selfRating: string;
  attemptKind: string;
  attemptedAt?: string;
  dueAt?: string;
};

export function deriveLegacyAttemptId(attempt: LegacyAttemptIdentity) {
  const name = JSON.stringify([
    "seolbi-guest-attempt-v1",
    attempt.questionId,
    attempt.selectedChoiceId,
    attempt.selfRating,
    attempt.attemptKind,
    attempt.attemptedAt ?? null,
    attempt.dueAt ?? null,
  ]);
  const bytes = createHash("sha1")
    .update(LEGACY_ATTEMPT_NAMESPACE)
    .update(name)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
