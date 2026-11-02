"use client";

import { walletKeys } from "@/features/wallets/queries/wallet-query-keys";
import { ADMIN_SCOPED_LIST_LIMIT, useAdminScopedList } from "@/features/admin/data/use-admin-scoped-list";
import { useAdminDetail, useAdminQuery } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { getPayment, getPaymentRefunds, listEntityPayments, listEntityRefunds, listPayments, recordRefund } from "../api/payment-admin-api";
import { paymentKeys, refundKeys } from "../queries/payment-query-keys";
import { paymentListConfig } from "../state/payment-list-state";
import type { PaymentEntityFilter, RecordRefundInput } from "../types/payment-admin";

const entityId = (filter: PaymentEntityFilter) => ("orderId" in filter ? filter.orderId : filter.consultationId);

export function usePaymentList() {
  return useAdminList(paymentListConfig, paymentKeys.list, listPayments);
}

export function usePaymentDetail(id: string) {
  return useAdminDetail(paymentKeys.detail(id), (signal) => getPayment(id, signal), Boolean(id));
}

/** Payments behind an order or consultation (normally one; a failed attempt can precede the successful one). */
export function useEntityPayments(filter: PaymentEntityFilter) {
  return useAdminQuery(paymentKeys.forEntity(entityId(filter)), (signal) => listEntityPayments(filter, signal));
}

export function usePaymentRefunds(paymentId: string) {
  return useAdminQuery(refundKeys.forPayment(paymentId), (signal) => getPaymentRefunds(paymentId, signal), Boolean(paymentId));
}

export function useRefundHistory(filter: PaymentEntityFilter) {
  return useAdminQuery(refundKeys.forEntity(entityId(filter)), (signal) => listEntityRefunds(filter, signal));
}

export function useRecordRefund(paymentId: string) {
  return useAdminMutation({
    mutationFn: (input: RecordRefundInput) => recordRefund(paymentId, input),
    invalidate: [refundKeys.all, paymentKeys.all, walletKeys.all],
    successMessage: (result) => (result.replayed ? "This refund was already recorded" : "Manual refund recorded"),
    toastErrors: false,
  });
}

/** A customer's latest payments (first page) for related panels. */
export function usePaymentsForCustomer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(paymentKeys.scoped("related", "customerUserId", id ?? "", limit), listPayments, { key: "customerUserId", id }, limit);
}
