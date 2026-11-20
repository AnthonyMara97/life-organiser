// The sign-in allowlist, as pure functions.
//
// Kept out of the Auth.js config so the security rule can be tested without a
// browser, a network call or a session. The config supplies the environment
// value; this file decides what it means.

/** Splits `ALLOWED_EMAILS` into normalised addresses. Empty means nobody. */
export function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

/**
 * Closed by default: a missing address or an empty allowlist rejects everyone.
 * Comparison is case-insensitive because Google treats addresses that way, and
 * a capital letter is not a different person.
 */
export function isAllowedEmail(
  email: string | null | undefined,
  raw: string | undefined,
): boolean {
  if (!email) {
    return false;
  }

  const candidate = email.trim().toLowerCase();
  if (candidate.length === 0) {
    return false;
  }

  return parseAllowlist(raw).includes(candidate);
}
