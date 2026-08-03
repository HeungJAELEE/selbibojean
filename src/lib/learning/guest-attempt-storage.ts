export const GUEST_ATTEMPTS_KEY = "seolbi:guest-attempts";
export const GUEST_ATTEMPTS_CHANGED_EVENT = "seolbi:guest-attempts-changed";
export const MAX_GUEST_LEARNING_ATTEMPTS = 500;

type GuestStorage = Pick<Storage, "getItem" | "setItem">;

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
      .slice(-MAX_GUEST_LEARNING_ATTEMPTS);
  } catch {
    return [];
  }
}

export function compactGuestLearningAttempts(storage: GuestStorage) {
  const raw = storage.getItem(GUEST_ATTEMPTS_KEY);
  if (!raw) return;
  let needsCompaction = false;
  try {
    const parsed: unknown = JSON.parse(raw);
    needsCompaction =
      Array.isArray(parsed) &&
      parsed.length > MAX_GUEST_LEARNING_ATTEMPTS;
  } catch {
    return;
  }
  if (!needsCompaction) return;
  const attempts = parseGuestLearningAttempts(raw);
  storage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function appendGuestLearningAttempt(
  storage: GuestStorage,
  attempt: GuestLearningAttempt,
) {
  const attempts = [
    ...parseGuestLearningAttempts(storage.getItem(GUEST_ATTEMPTS_KEY)),
    attempt,
  ].slice(-MAX_GUEST_LEARNING_ATTEMPTS);
  storage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function notifyGuestAttemptsChanged() {
  window.dispatchEvent(new Event(GUEST_ATTEMPTS_CHANGED_EVENT));
}
