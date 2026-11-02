"use client";

import { useAdminDetail, useAdminQuery } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { adjustWallet, getWallet, listWalletLedger, listWallets } from "../api/wallet-admin-api";
import { walletKeys } from "../queries/wallet-query-keys";
import { walletListConfig } from "../state/wallet-list-state";
import type { WalletAdjustmentInput, WalletTransactionType } from "../types/wallet-admin";

export function useWalletList() {
  return useAdminList(walletListConfig, walletKeys.list, listWallets);
}

export function useWalletDetail(userId: string) {
  return useAdminDetail(walletKeys.detail(userId), (signal) => getWallet(userId, signal), Boolean(userId));
}

export function useWalletLedger(userId: string, page: number, type: WalletTransactionType | "all") {
  return useAdminQuery(walletKeys.ledger(userId, page, type), (signal) => listWalletLedger(userId, page, type, signal));
}

/** A customer's wallet for related panels; the wallet detail is keyed by user id, so this shares its cache. */
export function useWalletForCustomer(customerUserId: string) {
  return useWalletDetail(customerUserId);
}

/** Controlled credit/debit; the balance only changes through an append-only, audited ledger entry. */
export function useAdjustWallet(userId: string) {
  return useAdminMutation({
    mutationFn: (input: WalletAdjustmentInput) => adjustWallet(userId, input),
    invalidate: [walletKeys.all],
    successMessage: (result) => (result.replayed ? "This adjustment was already recorded" : "Wallet adjusted"),
    toastErrors: false,
  });
}
