import { apiRequest } from "@/lib/api/api-client";

import { buildQueryString, type AdminPage } from "./admin-list-state";

/**
 * Typed Admin API access over the existing authenticated `apiRequest` (same tokens, refresh and envelope parsing;
 * no second auth flow). All Admin paths are relative to `/admin`.
 */
type Query = Record<string, string | number | boolean | null | undefined>;

export function adminGet<T>(path: string, options: { query?: Query; signal?: AbortSignal } = {}) {
  return apiRequest<T>(`/admin${path}${buildQueryString(options.query ?? {})}`, { signal: options.signal });
}

export function adminList<T>(path: string, query: Query, signal?: AbortSignal) {
  return adminGet<AdminPage<T>>(path, { query, signal });
}

export function adminSend<T>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown) {
  return apiRequest<T>(`/admin${path}`, { method, ...(body !== undefined ? { body } : {}) });
}

export const encodeId = (id: string) => encodeURIComponent(id);
