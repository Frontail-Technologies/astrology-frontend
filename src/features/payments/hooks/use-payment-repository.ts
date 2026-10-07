"use client";

import { useCallback } from "react";
import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { paymentSeed } from "../data/payments";
import type { PaymentRefund, PaymentTransaction } from "../types/payment";

const STORE_KEY = "astrology-admin-payments-v1";

export function usePaymentRepository() {
  const store = useMockRepository<PaymentTransaction>(STORE_KEY, paymentSeed);
  const refund = useCallback((id: string, amountInPaise: number, reason: string, note?: string) => {
    const payment = store.getById(id);
    if (!payment) throw new Error("Payment not found");
    const refunded = payment.refundedAmountInPaise ?? 0;
    if (amountInPaise <= 0 || amountInPaise > payment.amountInPaise - refunded) throw new Error("Invalid refund amount");
    const refundRecord: PaymentRefund = { id: `rfnd_${Date.now()}`, amountInPaise, reason, note: note || undefined, createdAt: new Date().toISOString() };
    const nextRefunded = refunded + amountInPaise;
    store.update({ ...payment, refundedAmountInPaise: nextRefunded, refunds: [...(payment.refunds ?? []), refundRecord], status: nextRefunded === payment.amountInPaise ? "refunded" : "partially-refunded" });
  }, [store]);
  return { ...store, refund };
}
