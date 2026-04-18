/**
 * True if the string is a usable http(s) URL for outbound links (excludes bare placeholder hosts).
 */
export function isUsableHttpUrl(raw) {
  if (raw == null || typeof raw !== 'string') return false;
  const s = raw.trim();
  if (!s || s === '#' || s === '/') return false;
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./i, '');
    if (host === 'github.com' && (!u.pathname || u.pathname === '/')) return false;
    return true;
  } catch {
    return false;
  }
}
