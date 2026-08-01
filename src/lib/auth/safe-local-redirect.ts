const LOCAL_REDIRECT_ORIGIN = "https://local.invalid";

export function safeLocalRedirect(
  value: string | null | undefined,
  fallback = "/",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (
    value.includes("\\") ||
    decoded.includes("\\") ||
    decoded.startsWith("//")
  ) {
    return fallback;
  }

  const parsed = new URL(value, LOCAL_REDIRECT_ORIGIN);
  if (parsed.origin !== LOCAL_REDIRECT_ORIGIN) {
    return fallback;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
