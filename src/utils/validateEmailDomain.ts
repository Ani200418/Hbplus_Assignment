/** Lower-cases, trims, and strips a leading "@" from a domain setting. */
export function normalizeDomain(domain: string | undefined | null): string {
  return (domain ?? '').trim().replace(/^@+/, '').toLowerCase();
}

// One "@", no whitespace, non-empty local part, dotted domain made of valid labels.
const EMAIL_PATTERN = /^[^\s@]+@([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+)$/i;

/**
 * True only when `email` is well formed and its domain exactly equals `allowedDomain`
 * (case-insensitive). Subdomains, suffix tricks ("not-hbplus.fit") and look-alikes
 * ("hbplus.fit.example.com") are rejected. Fails closed when no domain is configured.
 */
export function isEmailFromAllowedDomain(
  email: string | undefined | null,
  allowedDomain: string | undefined | null,
): boolean {
  const allowed = normalizeDomain(allowedDomain);
  if (!allowed || typeof email !== 'string') return false;
  const match = EMAIL_PATTERN.exec(email.trim());
  if (!match) return false;
  return match[1].toLowerCase() === allowed;
}
