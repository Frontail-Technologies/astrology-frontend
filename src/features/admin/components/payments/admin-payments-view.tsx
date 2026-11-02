"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CreditCard, Eye, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { paymentMethodLabel, paymentProviderLabel, paymentPurpose, paymentStatusLabels, paymentStatusVariants } from "@/features/payments/constants/payment-status";
import { usePaymentList } from "@/features/payments/hooks/use-payment-admin";
import type { AdminPayment } from "@/features/payments/types/payment-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

export const paymentChannel = (payment: Pick<AdminPayment, "provider" | "method">) =>
  `${paymentProviderLabel(payment.provider)}${payment.method ? ` · ${paymentMethodLabel(payment.method)}` : ""}`;

const rowActions = (payment: AdminPayment): AdminRowAction[] => [
  { label: "View payment", icon: Eye, href: `/admin/payments/${payment.id}` },
  { label: "View customer", icon: UserRound, href: `/admin/customers/${payment.customerUserId}` },
];

/** Payments ledger (read-only). Refunds are recorded per payment as manual/external records. */
export function AdminPaymentsView() {
  const list = usePaymentList();
  const columns = useMemo<ColumnDef<AdminPayment>[]>(
    () => [
      {
        id: "amount",
        header: "Payment",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-40">
            <Link href={`/admin/payments/${row.original.id}`} className="block font-medium tabular-nums hover:underline">
              {formatINR(row.original.amountPaise)}
            </Link>
            <p className="text-xs text-muted-foreground">{paymentPurpose(row.original)}</p>
          </div>
        ),
      },
      { id: "provider", header: "Paid with", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{paymentChannel(row.original)}</span> },
      { id: "created", header: "Created", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateTime(row.original.createdAt)}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={paymentStatusLabels} variants={paymentStatusVariants} /> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/payments/${row.original.id}`} label="View payment" icon={Eye} />
            <AdminRowActions label="More actions" actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Payments"
      description="Every payment customers made for consultations, store orders and wallet top-ups."
      noun="payments"
      list={list}
      dateRange
      idFilterLabels={{ customerUserId: "Customer" }}
      columns={columns}
      searchPlaceholder="Search by customer email or phone…"
      filters={[{ key: "status", allLabel: "All statuses", options: paymentStatusLabels }]}
      emptyLabel="No payments yet"
      emptyDescription="Payments appear here as customers check out."
      emptyIcon={CreditCard}
      renderMobileCard={(payment) => (
        <article key={payment.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/payments/${payment.id}`} className="block font-medium tabular-nums hover:underline">
                {formatINR(payment.amountPaise)}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{paymentPurpose(payment)} · {paymentChannel(payment)}</p>
            </div>
            <AdminRowActions label="Payment actions" actions={rowActions(payment)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">{formatDateTime(payment.createdAt)}</p>
            <AdminStatusBadge status={payment.status} labels={paymentStatusLabels} variants={paymentStatusVariants} />
          </div>
        </article>
      )}
    />
  );
}
