"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { ADMIN_SCOPED_LIST_LIMIT, useAdminScopedList } from "@/features/admin/data/use-admin-scoped-list";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { earningKeys } from "@/features/earnings/queries/earning-query-keys";
import { createPayout, getPayout, listPayouts, updatePayoutStatus } from "../api/payout-admin-api";
import { payoutStatusLabels } from "../constants/payout-status";
import { payoutKeys } from "../queries/payout-query-keys";
import { payoutListConfig } from "../state/payout-list-state";
import type { CreatePayoutInput, PayoutStatusInput } from "../types/payout-admin";

export function usePayoutList() {
  return useAdminList(payoutListConfig, payoutKeys.list, listPayouts);
}

export function usePayoutDetail(id: string) {
  return useAdminDetail(payoutKeys.detail(id), (signal) => getPayout(id, signal), Boolean(id));
}

export function useCreatePayout() {
  return useAdminMutation({
    mutationFn: (input: CreatePayoutInput) => createPayout(input),
    invalidate: [payoutKeys.all, earningKeys.all],
    successMessage: "Payout created",
    toastErrors: false,
  });
}

export function useUpdatePayoutStatus(id: string) {
  return useAdminMutation({
    mutationFn: (input: PayoutStatusInput) => updatePayoutStatus(id, input),
    invalidate: [payoutKeys.all, earningKeys.all],
    successMessage: (payout) => `Payout marked ${payoutStatusLabels[payout.status].toLowerCase()}`,
    toastErrors: false,
  });
}

/** An astrologer's latest payouts (first page) for related panels. */
export function usePayoutsForAstrologer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(payoutKeys.scoped("related", "astrologerId", id ?? "", limit), listPayouts, { key: "astrologerId", id }, limit);
}
