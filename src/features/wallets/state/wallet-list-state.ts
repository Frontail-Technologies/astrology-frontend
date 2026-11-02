import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";

export type WalletListFilter = never;

/** The wallets API names its free-text filter `user` (email or phone). */
export const walletListConfig: AdminListConfig<WalletListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchParam: "user",
  filters: {} as Record<never, readonly string[]>,
};
