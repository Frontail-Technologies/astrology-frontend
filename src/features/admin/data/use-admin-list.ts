"use client";

import { keepPreviousData, useQuery, type QueryKey } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { normalizeAdminError, shouldRetryAdminRead } from "./admin-errors";
import {
  parseAdminListState,
  serializeAdminListState,
  toAdminListQuery,
  updateAdminListState,
  type AdminListConfig,
  type AdminListPatch,
  type AdminListState,
  type AdminPage,
} from "./admin-list-state";

const SEARCH_DEBOUNCE_MS = 300;

export type AdminPageFetcher<T> = (query: Record<string, string | number>, signal: AbortSignal) => Promise<AdminPage<T>>;

/** List state lives in the URL (shareable, back/forward-safe). Search input is debounced before it hits the URL. */
export function useAdminListState<F extends string, I extends string = string>(config: AdminListConfig<F, I>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => parseAdminListState(searchParams, config), [searchParams, config]);
  const [searchInput, setSearchInput] = useState(state.search);
  const [syncedSearch, setSyncedSearch] = useState(state.search);
  if (syncedSearch !== state.search) {
    setSyncedSearch(state.search);
    setSearchInput(state.search);
  }

  const apply = useCallback(
    (patch: AdminListPatch<F, I>) => {
      const next = updateAdminListState(state, patch);
      const query = serializeAdminListState(next, config);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [config, pathname, router, state],
  );

  useEffect(() => {
    if (searchInput.trim() === state.search) return;
    const timer = setTimeout(() => apply({ search: searchInput.trim() }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [apply, searchInput, state.search]);

  const clear = useCallback(() => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { state, searchInput, setSearchInput, apply, clear };
}

/**
 * Server-paginated list query. The previous page stays visible while the next loads; changing state aborts the
 * superseded request via the query signal, so stale responses never overwrite newer ones.
 */
export function useAdminListQuery<T, F extends string, I extends string = string>(
  key: (state: AdminListState<F, I>) => QueryKey,
  fetchPage: AdminPageFetcher<T>,
  state: AdminListState<F, I>,
  /** When given, the API query is re-validated against it and search goes to `config.searchParam`. */
  config?: AdminListConfig<F, I>,
) {
  const query = useQuery({
    queryKey: key(state),
    queryFn: ({ signal }) => fetchPage(toAdminListQuery(state, config), signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryAdminRead,
  });
  return {
    page: query.data ?? null,
    items: query.data?.items ?? [],
    isInitialLoading: query.isPending,
    isFetching: query.isFetching,
    isPlaceholder: query.isPlaceholderData,
    error: query.error ? normalizeAdminError(query.error) : null,
    retry: () => {
      void query.refetch();
    },
  };
}

/**
 * A domain's whole list hook: URL state from `config` plus the server-paginated query keyed by `listKey`.
 * Returns exactly what spreading `useAdminListState` and `useAdminListQuery` returned before.
 */
export function useAdminList<T, F extends string, I extends string = string>(
  config: AdminListConfig<F, I>,
  listKey: (state: AdminListState<F, I>) => QueryKey,
  fetchPage: AdminPageFetcher<T>,
) {
  const list = useAdminListState(config);
  const query = useAdminListQuery(listKey, fetchPage, list.state, config);
  return { ...list, ...query };
}
