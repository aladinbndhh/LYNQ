/** Reserved subdomains — cannot be used by organisations */
export const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'mail',
  'ftp',
  'cdn',
  'static',
  'admin',
  'dashboard',
  'billing',
  'stripe',
  'webhook',
  'hooks',
]);

const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])?$/;

export function normalizeSubdomain(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidSubdomain(s: string): boolean {
  const n = normalizeSubdomain(s);
  if (n.length < 3 || n.length > 40) return false;
  if (!SUBDOMAIN_RE.test(n)) return false;
  if (RESERVED_SUBDOMAINS.has(n)) return false;
  return true;
}

export function parseOrgSubdomain(host: string, rootDomain: string): string | null {
  const h = host.split(':')[0].toLowerCase();
  const root = rootDomain.toLowerCase();
  if (!h.endsWith(`.${root}`)) return null;
  const sub = h.slice(0, -(root.length + 1));
  if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null;
  return sub;
}
