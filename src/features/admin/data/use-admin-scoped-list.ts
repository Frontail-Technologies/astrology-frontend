"use client";

import type { QueryKey } from "@tanstack/react-query";

import { isUuid, type AdminPage } from "./admin-list-state";
import type { AdminPageFetcher } from "./use-admin-list";
import { useAdminQuery } from "./use-admin-detail";

export const ADMIN_SCOPED_LIST_LIMIT = 5;

/**
 * First page of a list filtered to one related entity (for example a customer's consultations), for side panels.
 * Disabled until `id` is a UUID, so an invalid id never reaches the API. Shared retry policy via `useAdminQuery`.
 * Returns the `useAdminQuery` shape plus `items` and `total` shortcuts; `ready` is true while disabled.
 */
export function useAdminScopedList<T>(
  queryKey: QueryKey,
  fetchPage: AdminPageFetcher<T>,
  filter: { key: string; id: string | null | undefined },
  limit = ADMIN_SCOPED_LIST_LIMIT,
) {
  const enabled = isUuid(filter.id);
  const query = useAdminQuery<AdminPage<T>>(queryKey, (signal) => fetchPage({ page: 1, limit, [filter.key]: filter.id ?? "" }, signal), enabled);
  // A disabled query (no valid id) is "ready" with no items rather than loading forever.
  return { ...query, ready: enabled ? query.ready : true, items: query.data?.items ?? [], total: query.data?.total ?? 0 };
}
