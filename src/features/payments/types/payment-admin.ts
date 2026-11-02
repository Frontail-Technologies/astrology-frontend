import type { AdminPage } from "../../admin/data/admin-list-state.ts";

export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled";

/** `GET /admin/payments` item and detail (raw payment row). */
export type AdminPayment = {
  id: string;
  customerUserId: string;
  orderId: string | null;
  consultationId: string | null;
  walletId: string | null;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  providerStatus: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  method: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  paidAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Append-only manual/external refund record. */
export type AdminRefund = {
  id: string;
  paymentId: string;
  orderId: string | null;
  consultationId: string | null;
  walletTransactionId: string | null;
  amountPaise: number;
  currency: string;
  method: "manual_external";
  status: "recorded";
  reason: string;
  externalReference: string | null;
  notes: string | null;
  createdBy: { id: string; email: string | null };
  createdAt: string;
};

export type PaymentRefundSummary = {
  paymentId: string;
  paymentStatus: PaymentStatus;
  amountPaise: number;
  currency: string;
  refundedPaise: number;
  refundablePaise: number;
  refunds: AdminPage<AdminRefund>;
};

export type RecordRefundInput = { amountPaise: number; reason: string; externalReference?: string | null; notes?: string | null; idempotencyKey: string };

/** Payments behind an order or consultation. */
export type PaymentEntityFilter = { orderId: string } | { consultationId: string };
