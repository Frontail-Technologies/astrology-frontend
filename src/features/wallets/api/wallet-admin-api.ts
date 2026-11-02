import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminWallet, AdminWalletDetail, AdminWalletTransaction, WalletAdjustmentInput, WalletTransactionType } from "../types/wallet-admin";

export function listWallets(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminWallet>("/wallets", query, signal);
}

export function getWallet(userId: string, signal?: AbortSignal) {
  return adminGet<AdminWalletDetail>(`/wallets/${encodeId(userId)}`, { signal });
}

export function listWalletLedger(userId: string, page: number, type: WalletTransactionType | "all", signal?: AbortSignal) {
  return adminList<AdminWalletTransaction>(`/wallets/${encodeId(userId)}/transactions`, { page, limit: 20, ...(type === "all" ? {} : { type }) }, signal);
}

export function adjustWallet(userId: string, input: WalletAdjustmentInput) {
  return adminSend<{ transaction: AdminWalletTransaction; replayed: boolean }>(`/wallets/${encodeId(userId)}/adjustments`, "POST", input);
}
