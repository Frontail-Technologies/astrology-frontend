import type { AdminListState } from "./admin-list-state";

/** Query-key factory for API-backed Admin domains. Every key starts with "admin" so sign-out clears them all. */
export const adminKeys = {
  all: ["admin"] as const,
  domain: (domain: string) => ["admin", domain] as const,
  list: <F extends string, I extends string = string>(domain: string, state: AdminListState<F, I>) => ["admin", domain, "list", state] as const,
  detail: (domain: string, id: string) => ["admin", domain, "detail", id] as const,
};

/**
 * Per-domain key factory. Everything lives under `["admin", domain]`, so invalidating `all` refreshes the domain's
 * lists, details and scoped reads, and sign-out (`["admin"]`) clears it.
 *
 * - `all`               `["admin", domain]`
 * - `list(state)`       `["admin", domain, "list", state]`
 * - `detail(id)`        `["admin", domain, "detail", id]`
 * - `scoped(...parts)`  `["admin", domain, ...parts]` (summaries, ledgers, related-entity panels)
 */
export function createAdminQueryKeys<D extends string>(domain: D) {
  return {
    all: ["admin", domain] as const,
    list: <F extends string, I extends string = string>(state: AdminListState<F, I>) => ["admin", domain, "list", state] as const,
    detail: (id: string) => ["admin", domain, "detail", id] as const,
    scoped: <const P extends readonly unknown[]>(...parts: P) => ["admin", domain, ...parts] as const,
  };
}

export type AdminQueryKeys<D extends string = string> = ReturnType<typeof createAdminQueryKeys<D>>;
