"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { createPooja, deletePooja, getPooja, listPoojaCategories, listPoojas, updatePooja, updatePoojaStatus } from "../api/pooja-admin-api";
import { poojaKeys } from "../queries/pooja-query-keys";
import { poojaListConfig } from "../state/pooja-list-state";
import type { PoojaInput, PoojaStatusInput } from "../types/pooja-admin";

export function usePoojaList() {
  return useAdminList(poojaListConfig, poojaKeys.list, listPoojas);
}

export function usePoojaDetail(id: string) {
  return useAdminDetail(poojaKeys.detail(id), (signal) => getPooja(id, signal), Boolean(id));
}

export function useCreatePooja() {
  return useAdminMutation({
    mutationFn: (input: PoojaInput) => createPooja(input),
    invalidate: [poojaKeys.all],
    successMessage: "Pooja created",
    toastErrors: false,
  });
}

export function useUpdatePooja(id: string) {
  return useAdminMutation({
    mutationFn: (input: Omit<PoojaInput, "status">) => updatePooja(id, input),
    invalidate: [poojaKeys.all],
    successMessage: "Pooja saved",
    toastErrors: false,
  });
}

export function usePoojaStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (input: PoojaStatusInput) => updatePoojaStatus(id, input),
    invalidate: [poojaKeys.all],
    successMessage: "Pooja status updated",
    toastErrors: false,
  });
}

/** Props for `AdminDeleteAction` (keeps the api/keys out of views). */
export const poojaDeleteOptions = {
  mutationFn: deletePooja,
  invalidate: [poojaKeys.all],
  remove: (id: string) => [poojaKeys.detail(id)],
};

/** First 100 poojas (any status) for pickers: the pooja-request filter and related poojas in the editor. */
export function usePoojaOptions(enabled = true) {
  return useQuery({
    queryKey: poojaKeys.scoped("options"),
    queryFn: ({ signal }) => listPoojas({ page: 1, limit: 100 }, signal),
    select: (page) => page.items,
    staleTime: 60_000,
    enabled,
  });
}

/** Active pooja categories for the editor and the list filter. */
export function usePoojaCategories() {
  return useQuery({ queryKey: poojaKeys.categories(), queryFn: ({ signal }) => listPoojaCategories(signal), staleTime: 5 * 60_000 });
}
