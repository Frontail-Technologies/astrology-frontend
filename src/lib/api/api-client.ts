import { ApiError, type ApiErrorPayload } from "./api-error";
import { clearStoredTokens, getStoredTokens, setStoredTokens } from "./auth-storage";

type ApiSuccess<T> = { success: true; data: T };
type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
  retryAfterRefresh?: boolean;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
let refreshRequest: Promise<boolean> | null = null;

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as ApiSuccess<T> | ApiErrorPayload | null;
  if (!response.ok || !payload || payload.success === false) {
    const error = payload && payload.success === false ? payload.error : null;
    throw new ApiError(
      response.status,
      error?.code ?? "INVALID_API_RESPONSE",
      error?.message ?? "The server returned an invalid response",
      error?.details,
    );
  }
  return payload.data;
}

async function refreshSession() {
  if (refreshRequest) return refreshRequest;
  refreshRequest = (async () => {
    const tokens = getStoredTokens();
    if (!tokens) return false;
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      const next = await parseResponse<StoredAuthResult>(response);
      setStoredTokens(next);
      return true;
    } catch {
      clearStoredTokens();
      return false;
    }
  })().finally(() => {
    refreshRequest = null;
  });
  return refreshRequest;
}

export type ApiUser = {
  id: string;
  email: string;
  phone: string | null;
  role: "customer" | "astrologer" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
};

export type StoredAuthResult = {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, authenticated = true, retryAfterRefresh = true, headers, ...requestInit } = options;
  const tokens = authenticated ? getStoredTokens() : null;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("accept", "application/json");
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) requestHeaders.set("content-type", "application/json");
  if (tokens) requestHeaders.set("authorization", `Bearer ${tokens.accessToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...requestInit,
    headers: requestHeaders,
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  if (authenticated && response.status === 401 && retryAfterRefresh && await refreshSession()) {
    return apiRequest<T>(path, { ...options, retryAfterRefresh: false });
  }
  return parseResponse<T>(response);
}

export function apiLogin(email: string, password: string) {
  return apiRequest<StoredAuthResult>("/auth/login", {
    method: "POST",
    body: { email, password },
    authenticated: false,
  });
}

export async function apiLogout() {
  const tokens = getStoredTokens();
  if (!tokens) return;
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      body: { refreshToken: tokens.refreshToken },
      authenticated: false,
    });
  } finally {
    clearStoredTokens();
  }
}
