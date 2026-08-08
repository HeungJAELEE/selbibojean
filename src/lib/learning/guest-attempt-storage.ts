export const GUEST_ATTEMPTS_KEY = "seolbi:guest-attempts";
export const GUEST_ATTEMPTS_CHANGED_EVENT = "seolbi:guest-attempts-changed";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type GuestLearningAttempt = {
  clientAttemptId?: string;
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
            clientAttemptId:
              typeof item.clientAttemptId === "string" &&
              UUID_PATTERN.test(item.clientAttemptId)
                ? item.clientAttemptId
                : undefined,
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
