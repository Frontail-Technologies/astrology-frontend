import type { AdminPage } from "../../admin/data/admin-list-state.ts";

export type WalletTransactionType = "credit" | "debit" | "refund" | "adjustment";

export type AdminWalletTransaction = {
  id: string;
  walletId: string;
  userId: string;
  type: WalletTransactionType;
  reason: "razorpay_topup" | "consultation_chat" | "refund" | "admin_adjustment";
  amountPaise: number;
  balanceBeforePaise: number;
  balanceAfterPaise: number;
  referenceType: string | null;
  referenceId: string | null;
  metadata: { direction?: "credit" | "debit"; reference?: string | null } | null;
  adminNote: string | null;
  createdBy: { id: string; email: string | null } | null;
  createdAt: string;
};

export type AdminWallet = { id: string; userId: string; balancePaise: number; email: string; phone: string | null; createdAt: string; updatedAt: string };
export type AdminWalletDetail = AdminWallet & { currency: string; transactions: AdminPage<AdminWalletTransaction> };

export type WalletAdjustmentInput = { direction: "credit" | "debit"; amountPaise: number; reason: string; reference?: string | null; idempotencyKey: string };
