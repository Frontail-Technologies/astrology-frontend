import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { WalletTransactionType } from "../types/wallet-admin";
import type { WalletListFilter } from "../state/wallet-list-state";

const keys = createAdminQueryKeys("wallets");

export const walletKeys = {
  ...keys,
  list: (state: AdminListState<WalletListFilter, never>) => keys.list(state),
  /** Wallets are keyed by the owner's user id. */
  detail: (userId: string) => keys.detail(userId),
  ledger: (userId: string, page: number, type: WalletTransactionType | "all") => [...keys.detail(userId), "ledger", page, type] as const,
};
