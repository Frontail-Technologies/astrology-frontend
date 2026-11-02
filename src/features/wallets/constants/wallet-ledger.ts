import type { AdminWalletTransaction, WalletTransactionType } from "../types/wallet-admin.ts";

export const walletTransactionLabels: Record<WalletTransactionType, string> = { credit: "Top-up", debit: "Consultation charge", refund: "Refund", adjustment: "Admin adjustment" };

/** Signed effect on the balance, derived from the ledger's own before/after balances. */
export const walletDelta = (entry: AdminWalletTransaction) => entry.balanceAfterPaise - entry.balanceBeforePaise;
