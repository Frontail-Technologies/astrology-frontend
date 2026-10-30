const ACCESS_TOKEN_KEY = "astrology-admin-access-token";
const REFRESH_TOKEN_KEY = "astrology-admin-refresh-token";
export const ADMIN_SESSION_CHANGED_EVENT = "astrology-admin-session-changed";

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

function storage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function getStoredTokens(): StoredTokens | null {
  const target = storage();
  const accessToken = target?.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = target?.getItem(REFRESH_TOKEN_KEY);
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function setStoredTokens(tokens: StoredTokens) {
  const target = storage();
  target?.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  target?.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
}

export function clearStoredTokens() {
  const target = storage();
  target?.removeItem(ACCESS_TOKEN_KEY);
  target?.removeItem(REFRESH_TOKEN_KEY);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
}

export function hasStoredSession() {
  return Boolean(getStoredTokens());
}

export function subscribeToAdminSession(listener: () => void) {
  window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, listener);
  return () => window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, listener);
}
