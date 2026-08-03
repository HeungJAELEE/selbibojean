import { compactGuestLearningAttempts } from "@/lib/learning/guest-attempt-storage";

type StoredPracticeQuestion = {
  external_id: string | null;
};

export const PRACTICE_SESSION_PREFIX = "seolbi:practice:";
export const PRACTICE_SESSION_STORAGE_VERSION = 1;
export const PRACTICE_SESSION_STORAGE_ERROR =
  "기기 저장 공간이 부족해 문제 세션을 저장하지 못했습니다.";

const MAX_STORED_PRACTICE_SESSIONS = 3;
const PRE_REQUEST_SESSION_LIMIT = MAX_STORED_PRACTICE_SESSIONS - 1;

type StorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>;

type StoredPracticeSessionEnvelope<T> = {
  version: typeof PRACTICE_SESSION_STORAGE_VERSION;
  savedAt: string;
  session: T;
};

type StoredSessionMetadata = {
  key: string;
  savedAt: number;
};

function isQuotaExceeded(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const name = "name" in error ? String(error.name) : "";
  const code = "code" in error ? Number(error.code) : 0;
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    code === 22 ||
    code === 1014
  );
}

function ownedSessionMetadata(storage: StorageLike): StoredSessionMetadata[] {
  const entries: StoredSessionMetadata[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(PRACTICE_SESSION_PREFIX)) continue;
    const raw = storage.getItem(key);
    let savedAt = 0;
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "version" in parsed &&
          parsed.version === PRACTICE_SESSION_STORAGE_VERSION &&
          "savedAt" in parsed &&
          typeof parsed.savedAt === "string"
        ) {
          savedAt = Date.parse(parsed.savedAt) || 0;
        }
      } catch {
        // Corrupt owned entries are oldest and are removed first.
      }
    }
    entries.push({ key, savedAt });
  }
  return entries.sort(
    (left, right) =>
      right.savedAt - left.savedAt || left.key.localeCompare(right.key),
  );
}

export function compactPracticeSessionStorage(
  storage: StorageLike,
  maxSessions = MAX_STORED_PRACTICE_SESSIONS,
) {
  const entries = ownedSessionMetadata(storage);
  for (const entry of entries.slice(Math.max(0, maxSessions))) {
    storage.removeItem(entry.key);
  }
}

export function preparePracticeSessionStorage(storage: StorageLike) {
  compactPracticeSessionStorage(storage, PRE_REQUEST_SESSION_LIMIT);
  try {
    compactGuestLearningAttempts(storage);
  } catch (error) {
    if (!isQuotaExceeded(error)) throw error;
  }
}

export function savePracticeSession<T>(
  storage: StorageLike,
  sessionId: string,
  session: T,
  now: Date = new Date(),
) {
  const key = `${PRACTICE_SESSION_PREFIX}${sessionId}`;
  const envelope: StoredPracticeSessionEnvelope<T> = {
    version: PRACTICE_SESSION_STORAGE_VERSION,
    savedAt: now.toISOString(),
    session,
  };
  const serialized = JSON.stringify(envelope);

  compactPracticeSessionStorage(storage, PRE_REQUEST_SESSION_LIMIT);
  try {
    storage.setItem(key, serialized);
  } catch (error) {
    if (!isQuotaExceeded(error)) throw error;
    compactPracticeSessionStorage(storage, PRE_REQUEST_SESSION_LIMIT);
    try {
      compactGuestLearningAttempts(storage);
    } catch (compactionError) {
      if (!isQuotaExceeded(compactionError)) throw compactionError;
    }
    try {
      storage.setItem(key, serialized);
    } catch (retryError) {
      if (isQuotaExceeded(retryError)) {
        throw new Error(PRACTICE_SESSION_STORAGE_ERROR);
      }
      throw retryError;
    }
  }
  compactPracticeSessionStorage(storage, MAX_STORED_PRACTICE_SESSIONS);
}

export function loadPracticeSession<T>(
  storage: StorageLike,
  sessionId: string,
): T | null {
  const raw = storage.getItem(`${PRACTICE_SESSION_PREFIX}${sessionId}`);
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "version" in parsed &&
    parsed.version === PRACTICE_SESSION_STORAGE_VERSION &&
    "session" in parsed
  ) {
    return parsed.session as T;
  }
  return parsed as T;
}

export function removePracticeSession(
  storage: StorageLike,
  sessionId: string,
) {
  storage.removeItem(`${PRACTICE_SESSION_PREFIX}${sessionId}`);
}

export function hasCompletePracticeQuestionMapping(
  selectedQuestionIds: readonly string[],
  storedQuestions: readonly StoredPracticeQuestion[],
) {
  const storedExternalIds = new Set(
    storedQuestions
      .map((question) => question.external_id)
      .filter((externalId): externalId is string => Boolean(externalId)),
  );

  return selectedQuestionIds.every((questionId) =>
    storedExternalIds.has(questionId),
  );
}
