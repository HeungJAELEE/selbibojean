export const GUEST_ATTEMPTS_KEY = "seolbi:guest-attempts";
export const GUEST_ATTEMPTS_CHANGED_EVENT = "seolbi:guest-attempts-changed";

export type GuestLearningAttempt = {
  questionId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  selfRating: "unknown" | "unsure" | "known";
  attemptKind: "initial" | "retry";
  attemptedAt?: string;
  dueAt?: string;
};

export function parseGuestLearningAttempts(
  raw: string | null,
): GuestLearningAttempt[] {
  if (!raw) return [];

  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];

    return value
      .flatMap((item): GuestLearningAttempt[] => {
        if (
          typeof item !== "object" ||
          item === null ||
          typeof item.questionId !== "string" ||
          typeof item.selectedChoiceId !== "string" ||
          typeof item.isCorrect !== "boolean" ||
          (item.selfRating !== "unknown" &&
            item.selfRating !== "unsure" &&
            item.selfRating !== "known") ||
          (item.attemptKind !== undefined &&
            item.attemptKind !== "initial" &&
            item.attemptKind !== "retry")
        ) {
          return [];
        }

        return [
          {
            questionId: item.questionId,
            selectedChoiceId: item.selectedChoiceId,
            isCorrect: item.isCorrect,
            selfRating: item.selfRating,
            attemptKind: item.attemptKind ?? "initial",
            attemptedAt:
              typeof item.attemptedAt === "string"
                ? item.attemptedAt
                : undefined,
            dueAt: typeof item.dueAt === "string" ? item.dueAt : undefined,
          },
        ];
      })
      .slice(-500);
  } catch {
    return [];
  }
}

export function notifyGuestAttemptsChanged() {
  window.dispatchEvent(new Event(GUEST_ATTEMPTS_CHANGED_EVENT));
}
