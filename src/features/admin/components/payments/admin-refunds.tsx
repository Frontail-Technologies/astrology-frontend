"use client";

import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_REASON } from "@/features/admin/data/admin-reason";
import { rupeesToPaise } from "@/features/admin/lib/money";
import { newIdempotencyKey } from "@/features/admin/data/idempotency";
import { MANUAL_REFUND_NOTICE, REFUND_ERROR_HINTS, paymentStatusLabels, paymentStatusVariants } from "@/features/payments/constants/payment-status";
import { useEntityPayments, usePaymentRefunds, useRecordRefund, useRefundHistory } from "@/features/payments/hooks/use-payment-admin";
import type { AdminRefund } from "@/features/payments/types/payment-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";

export function RefundHistoryTable({ refunds }: { refunds: AdminRefund[] }) {
  if (refunds.length === 0) return <p className="text-sm text-muted-foreground">No refunds recorded yet.</p>;
  return (
    <ul className="divide-y divide-border">
      {refunds.map((refund) => (
        <li key={refund.id} className="space-y-1 py-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium tabular-nums">{formatINR(refund.amountPaise)}</span>
            <AdminStatusPill tone="neutral" dot={false}>Recorded manually</AdminStatusPill>
          </div>
          <p className="text-muted-foreground">{refund.reason}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(refund.createdAt)} · by {refund.createdBy.email ?? "an admin"}
            {refund.externalReference ? ` · reference ${refund.externalReference}` : ""}
            {refund.walletTransactionId ? " · wallet debited" : ""}
          </p>
          {refund.notes ? <p className="whitespace-pre-line text-xs text-muted-foreground">Notes: {refund.notes}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** Refund summary, history and the "Record manual refund" action for one payment. */
export function PaymentRefundPanel({ paymentId, isWalletTopup }: { paymentId: string; isWalletTopup: boolean }) {
  const summary = usePaymentRefunds(paymentId);
  const mutation = useRecordRefund(paymentId);
  const [open, setOpen] = useState(false);
  const [attemptKey, setAttemptKey] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const data = summary.data;
  const amountPaise = rupeesToPaise(amount);
  const amountError = amount && (amountPaise === null || amountPaise <= 0) ? "Enter a positive amount in rupees (up to 2 decimals)." : amountPaise && data && amountPaise > data.refundablePaise ? `At most ${formatINR(data.refundablePaise)} can be refunded.` : null;
  const hint = mutation.error?.code ? REFUND_ERROR_HINTS[mutation.error.code] : undefined;

  return (
    <>
      <AdminSectionCard
        title="Refunds"
        contentClassName="space-y-3"
        actions={
          data && data.refundablePaise > 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="bg-surface"
              onClick={() => {
                setAttemptKey(newIdempotencyKey());
                setAmount("");
                setReference("");
                setNotes("");
                setOpen(true);
              }}
            >
              Record refund
            </Button>
          ) : null
        }
      >
        {!summary.ready ? (
          <p className="text-sm text-muted-foreground" role="status">Loading refunds…</p>
        ) : summary.error ? (
          <AdminErrorState error={summary.error} onRetry={summary.reload} title="Could not load refunds" />
        ) : data ? (
          <>
            <dl className="grid grid-cols-3 gap-2 rounded-[calc(var(--radius)-2px)] bg-muted p-3 text-sm">
              {[
                { label: "Paid", value: data.amountPaise },
                { label: "Refunded", value: data.refundedPaise },
                { label: "Can refund", value: data.refundablePaise },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="truncate font-semibold tabular-nums">{formatINR(item.value)}</dd>
                </div>
              ))}
            </dl>
            {data.paymentStatus !== "succeeded" ? <p className="text-xs text-muted-foreground">Only succeeded payments can be refunded (this one is {paymentStatusLabels[data.paymentStatus].toLowerCase()}).</p> : null}
            <RefundHistoryTable refunds={data.refunds.items} />
          </>
        ) : null}
      </AdminSectionCard>

      <AdminConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) mutation.reset();
        }}
        title="Record a manual refund?"
        description={MANUAL_REFUND_NOTICE}
        confirmLabel="Record refund"
        destructive
        reason={{ ...ADMIN_REASON, placeholder: "For example: Refunded by NEFT after cancelled pooja, ticket ST-2041" }}
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={!amountPaise || Boolean(amountError)}
        onConfirm={(reason) => {
          if (!reason || !amountPaise) return;
          mutation.mutate(
            { amountPaise, reason, externalReference: reference.trim() || null, notes: notes.trim() || null, idempotencyKey: attemptKey },
            { onSuccess: () => setOpen(false) },
          );
        }}
      >
        <div className="flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {isWalletTopup
              ? "This payment was a wallet top-up: recording the refund also debits the customer's wallet through the ledger."
              : "The payment provider is not contacted. The customer's order or consultation status is not changed."}
          </span>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="refund-amount">Amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground" aria-hidden="true">₹</span>
            <Input id="refund-amount" inputMode="decimal" className="pl-7 tabular-nums" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={mutation.isPending} placeholder={data ? `Up to ${formatINR(data.refundablePaise)}` : undefined} />
          </div>
          {amountError ? <p className="text-xs text-destructive">{amountError}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="refund-reference">External reference (optional)</Label>
          <Input id="refund-reference" value={reference} maxLength={120} onChange={(event) => setReference(event.target.value)} disabled={mutation.isPending} placeholder="Bank or provider refund reference" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="refund-notes">Notes (optional)</Label>
          <Textarea id="refund-notes" rows={2} value={notes} maxLength={1000} onChange={(event) => setNotes(event.target.value)} disabled={mutation.isPending} />
        </div>
        {hint ? <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null}
      </AdminConfirmDialog>
    </>
  );
}

/** Refund history for an order or consultation, with links to the payment where refunds are recorded. */
export function PaymentRefundsForEntity({ filter }: { filter: { orderId: string } | { consultationId: string } }) {
  const history = useRefundHistory(filter);
  const paymentsQuery = useEntityPayments(filter);
  return (
    <AdminSectionCard title="Payments and refunds" contentClassName="space-y-3">
        {paymentsQuery.error ? <AdminErrorState error={paymentsQuery.error} onRetry={paymentsQuery.reload} title="Could not load payments" /> : null}
        {paymentsQuery.data?.items.length ? (
          <ul className="divide-y divide-border">
            {paymentsQuery.data.items.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">{formatINR(payment.amountPaise)}</span>
                  <AdminStatusBadge status={payment.status} labels={paymentStatusLabels} variants={paymentStatusVariants} />
                </span>
                <Link href={`/admin/payments/${payment.id}`} className="text-sm font-medium hover:underline">
                  {payment.status === "succeeded" ? "Open payment to refund" : "Open payment"}
                </Link>
              </li>
            ))}
          </ul>
        ) : paymentsQuery.ready && !paymentsQuery.error ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : null}
        {history.error ? <AdminErrorState error={history.error} onRetry={history.reload} title="Could not load refunds" /> : history.data ? <RefundHistoryTable refunds={history.data.items} /> : null}
    </AdminSectionCard>
  );
}
