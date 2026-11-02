"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { paymentPurpose, paymentStatusLabels, paymentStatusVariants } from "@/features/payments/constants/payment-status";
import { usePaymentDetail } from "@/features/payments/hooks/use-payment-admin";
import { formatDateTime, formatINR, formatOptionalDateTime } from "../../lib/format";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { PaymentRefundPanel } from "./admin-refunds";
import { paymentChannel } from "./admin-payments-view";

export function AdminPaymentDetailView({ paymentId }: { paymentId: string }) {
  const detail = usePaymentDetail(paymentId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="payment">
      {() => {
        const payment = detail.data!;
        const target = payment.orderId ? (
          <Link className="hover:underline" href={`/admin/orders/${payment.orderId}`}>View order</Link>
        ) : payment.consultationId ? (
          <Link className="hover:underline" href={`/admin/consultations/${payment.consultationId}`}>View consultation</Link>
        ) : (
          <Link className="hover:underline" href={`/admin/wallets/${payment.customerUserId}`}>View wallet</Link>
        );
        const timeline = [
          { label: "Created", value: payment.createdAt },
          { label: "Paid", value: payment.paidAt },
          { label: "Failed", value: payment.failedAt },
          { label: "Cancelled", value: payment.cancelledAt },
        ].filter((step) => step.label === "Created" || step.value);
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`${formatINR(payment.amountPaise)} payment`}
              backHref="/admin/payments"
              backLabel="Payments"
              meta={
                <>
                  <AdminStatusBadge status={payment.status} labels={paymentStatusLabels} variants={paymentStatusVariants} />
                  <span>{paymentPurpose(payment)}</span>
                  <span className="tabular-nums">{formatDateTime(payment.createdAt)}</span>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Payment">
                  <div className="divide-y divide-border">
                    <DetailRow label="Amount" value={<span className="tabular-nums">{formatINR(payment.amountPaise)}</span>} />
                    <DetailRow label="For" value={<span>{paymentPurpose(payment)} · {target}</span>} />
                    <DetailRow label="Customer" value={<Link className="hover:underline" href={`/admin/customers/${payment.customerUserId}`}>View customer</Link>} />
                    <DetailRow label="Paid with" value={paymentChannel(payment)} />
                  </div>
                  {payment.failureMessage ? (
                    <div className="mt-4 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
                      <p className="mb-0.5 text-[13px] font-medium text-destructive">Why it failed</p>
                      <p>{payment.failureMessage}</p>
                    </div>
                  ) : null}
                </AdminSectionCard>
                <AdminSectionCard title="Timeline">
                  <ol className="divide-y divide-border">
                    {timeline.map((step) => (
                      <li key={step.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <span className="text-muted-foreground">{step.label}</span>
                        <span className="font-medium tabular-nums">{formatOptionalDateTime(step.value)}</span>
                      </li>
                    ))}
                  </ol>
                </AdminSectionCard>
                <details className="group rounded-xl border border-border bg-surface">
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true" />
                    Technical details
                    <span className="text-[13px] font-normal text-muted-foreground">For matching with the payment provider</span>
                  </summary>
                  <div className="divide-y divide-border px-5 pb-4">
                    <DetailRow label="Provider order ID" value={<span className="break-all font-mono text-xs">{payment.providerOrderId ?? "None"}</span>} />
                    <DetailRow label="Provider payment ID" value={<span className="break-all font-mono text-xs">{payment.providerPaymentId ?? "None"}</span>} />
                    <DetailRow label="Provider status" value={<span className="font-mono text-xs">{payment.providerStatus ?? "None"}</span>} />
                    {payment.failureCode ? <DetailRow label="Failure code" value={<span className="font-mono text-xs">{payment.failureCode}</span>} /> : null}
                    <DetailRow label="Currency" value={payment.currency} />
                    <DetailRow label="Payment ID" value={<span className="break-all font-mono text-xs">{payment.id}</span>} />
                  </div>
                </details>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <PaymentRefundPanel paymentId={payment.id} isWalletTopup={Boolean(payment.walletId)} />
              </AdminDetailStickyRail>
            </div>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
