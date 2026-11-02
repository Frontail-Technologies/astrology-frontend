"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";

import { normalizeAdminError, shouldRetryAdminRead } from "./admin-errors";

/** Single read with the shared retry policy and normalized errors. */
export function useAdminDetail<T>(queryKey: QueryKey, fetcher: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetcher(signal),
    enabled,
    retry: shouldRetryAdminRead,
  });
  return {
    data: query.data ?? null,
    ready: !query.isPending,
    isFetching: query.isFetching,
    error: query.error ? normalizeAdminError(query.error) : null,
    reload: () => {
      void query.refetch();
    },
  };
}

/**
 * Name for non-detail reads (summaries, ledgers, entity-scoped lists). Identical behaviour and return shape to
 * `useAdminDetail`, which stays exported for detail screens.
 */
export const useAdminQuery = useAdminDetail;
