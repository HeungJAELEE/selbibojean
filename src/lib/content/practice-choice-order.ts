import { createHash } from "node:crypto";

export function orderPracticeChoices<T extends { id: string }>(
  choices: T[],
  sessionSeed: number,
  questionVariantId: string,
  shuffleChoices: boolean,
) {
  if (!shuffleChoices) return [...choices];

  return [...choices].sort((left, right) => {
    const leftRank = sha256Rank(
      sessionSeed,
      questionVariantId,
      left.id,
    );
    const rightRank = sha256Rank(
      sessionSeed,
      questionVariantId,
      right.id,
    );
    return leftRank.localeCompare(rightRank) || left.id.localeCompare(right.id);
  });
}

function sha256Rank(
  sessionSeed: number,
  questionVariantId: string,
  choiceId: string,
) {
  return createHash("sha256")
    .update(`${sessionSeed}\u0000${questionVariantId}\u0000${choiceId}`, "utf8")
    .digest("hex");
}
