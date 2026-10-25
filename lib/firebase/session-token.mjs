// Only a freshness hint. Firebase still verifies every token used for access.
export function tokenExpiresAt(token) {
  try {
    const payload = token.split('.')[1];
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return Number.isSafeInteger(exp) && exp > 0 ? exp * 1000 : 0;
  } catch { return 0; }
}
export function usableSessionToken(token, now = Date.now()) {
  return typeof token === 'string' && tokenExpiresAt(token) > now + 30000;
}
export function sessionCookieAge(token, now = Date.now()) {
  return Math.max(0, Math.min(3500, Math.floor((tokenExpiresAt(token) - now) / 1000) - 30));
}
