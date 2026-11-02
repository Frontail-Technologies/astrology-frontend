import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminPayment, AdminRefund, PaymentEntityFilter, PaymentRefundSummary, RecordRefundInput } from "../types/payment-admin";

export function listPayments(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminPayment>("/payments", query, signal);
}

export function getPayment(id: string, signal?: AbortSignal) {
  return adminGet<AdminPayment>(`/payments/${encodeId(id)}`, { signal });
}

export function listEntityPayments(filter: PaymentEntityFilter, signal?: AbortSignal) {
  return adminList<AdminPayment>("/payments", { ...filter, page: 1, limit: 20 }, signal);
}

export function getPaymentRefunds(paymentId: string, signal?: AbortSignal) {
  return adminGet<PaymentRefundSummary>(`/payments/${encodeId(paymentId)}/refunds`, { query: { limit: 100 }, signal });
}

export function listEntityRefunds(filter: PaymentEntityFilter, signal?: AbortSignal) {
  return adminList<AdminRefund>("/refunds", { ...filter, page: 1, limit: 100 }, signal);
}

export function recordRefund(paymentId: string, input: RecordRefundInput) {
  return adminSend<{ refund: AdminRefund; replayed: boolean }>(`/payments/${encodeId(paymentId)}/refunds`, "POST", input);
}
