/**
 * Supabase returns AuthSessionMissingError when no auth cookie/session exists.
 * That is the normal guest state, not an infrastructure failure.
 */
export function isAuthSessionMissingError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "AuthSessionMissingError",
  );
}
