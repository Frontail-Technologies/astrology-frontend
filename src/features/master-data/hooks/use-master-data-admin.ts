"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { isUuid, type AdminListState } from "@/features/admin/data/admin-list-state";
import { useAdminDetail, useAdminQuery } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import {
  createMasterData,
  deleteMasterData,
  getMasterData,
  listMasterData,
  listPublicStates,
  setMasterDataActive,
  updateMasterData,
} from "../api/master-data-admin-api";
import { masterDataKeys } from "../queries/master-data-query-keys";
import { masterDataListConfigs, type MasterDataListFilter, type MasterDataListIdFilter } from "../state/master-data-list-state";
import type { MasterDataEntity, MasterDataWriteInput } from "../types/master-data-admin";

/** Admin lists and public pickers (for example astrologer expertise) both refresh after a change. */
const invalidateAll = [masterDataKeys.all, masterDataKeys.publicAll];

export function useMasterDataList(entity: MasterDataEntity) {
  const listKey = useCallback((state: AdminListState<MasterDataListFilter, MasterDataListIdFilter>) => masterDataKeys.list(entity, state), [entity]);
  const fetchPage = useCallback((query: Record<string, string | number>, signal: AbortSignal) => listMasterData(entity, query, signal), [entity]);
  return useAdminList(masterDataListConfigs[entity], listKey, fetchPage);
}

export function useMasterDataDetail(entity: MasterDataEntity, key: string | null) {
  return useAdminDetail(masterDataKeys.detail(entity, key ?? ""), (signal) => getMasterData(entity, key ?? "", signal), Boolean(key));
}

/** Count of active or inactive entries: one `limit=1` request reading `total`. */
export function useMasterDataCount(entity: MasterDataEntity, active: boolean) {
  const query = useAdminQuery(masterDataKeys.count(entity, active), (signal) => listMasterData(entity, { page: 1, limit: 1, active: String(active) }, signal));
  return { ...query, total: query.data?.total ?? null };
}

/**
 * First 100 entries (active and inactive) for parent pickers and parent-name lookups (countries for states, states
 * for cities). `truncated` is true when more exist.
 */
export function useMasterDataOptions(entity: MasterDataEntity, enabled = true) {
  const query = useAdminQuery(masterDataKeys.options(entity), (signal) => listMasterData(entity, { page: 1, limit: 100 }, signal), enabled);
  return { ...query, items: query.data?.items ?? [], truncated: Boolean(query.data && query.data.total > query.data.items.length) };
}

/** Public active states of a country (city editor cascade). Disabled until a country is chosen. */
export function usePublicStates(countryId: string) {
  return useQuery({
    queryKey: masterDataKeys.publicStates(countryId),
    queryFn: ({ signal }) => listPublicStates(countryId, signal),
    enabled: isUuid(countryId),
  });
}

export function useCreateMasterData(entity: MasterDataEntity, singular: string) {
  return useAdminMutation({
    mutationFn: (input: MasterDataWriteInput) => createMasterData(entity, input),
    invalidate: invalidateAll,
    successMessage: `${singular} created`,
    toastErrors: false,
  });
}

export function useUpdateMasterData(entity: MasterDataEntity, key: string, singular: string) {
  return useAdminMutation({
    mutationFn: (input: MasterDataWriteInput) => updateMasterData(entity, key, input),
    invalidate: invalidateAll,
    successMessage: `${singular} saved`,
    toastErrors: false,
  });
}

export function useMasterDataStatus(entity: MasterDataEntity) {
  return useAdminMutation({
    mutationFn: ({ key, active }: { key: string; active: boolean }) => setMasterDataActive(entity, key, active),
    invalidate: invalidateAll,
    successMessage: (record) => `${record.name} ${record.active ? "activated" : "deactivated"}`,
    toastErrors: false,
  });
}

/** Props for `AdminDeleteAction` (views never import the API or keys directly). */
export function useMasterDataDeleteProps(entity: MasterDataEntity) {
  return {
    mutationFn: (key: string) => deleteMasterData(entity, key),
    invalidate: invalidateAll,
    remove: (key: string) => [masterDataKeys.detail(entity, key)],
  };
}
