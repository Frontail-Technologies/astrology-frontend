"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarClock, Eye, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { consultationModeLabels, consultationRequestKindLabels, consultationStatusLabels, consultationStatusVariants } from "@/features/consultations/constants/consultation-status";
import { useConsultationList } from "@/features/consultations/hooks/use-consultation-admin";
import type { AdminConsultation } from "@/features/consultations/types/consultation-admin";
import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { CustomerIdentity } from "../customers/customer-mobile-card";

const when = (consultation: AdminConsultation) => consultation.scheduledStartAt ?? consultation.requestedStartAt ?? consultation.requestedAt;

const rowActions = (consultation: AdminConsultation) => [
  { label: "View consultation", icon: Eye, href: `/admin/consultations/${consultation.id}` },
  { label: "View customer", icon: UserRound, href: `/admin/customers/${consultation.customer.id}` },
  { label: "View astrologer", icon: UserRound, href: `/admin/astrologers/${consultation.astrologer.id}` },
];

/** Consultations list: status and mode filters run on the server (the API has no free-text search). */
export function AdminConsultationsView() {
  const list = useConsultationList();
  const columns = useMemo<ColumnDef<AdminConsultation>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <CustomerIdentity customer={row.original.customer} href={`/admin/customers/${row.original.customer.id}`} className="min-w-48" />,
      },
      {
        id: "astrologer",
        header: "Astrologer",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-36">
            <Link href={`/admin/astrologers/${row.original.astrologer.id}`} className="block truncate text-sm font-medium hover:underline">
              {row.original.astrologer.displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.consultationMode.name}
              {row.original.requestKind === "instant" ? " · Instant" : ""}
            </p>
          </div>
        ),
      },
      { id: "when", header: "When", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateTime(when(row.original))}</span> },
      { id: "price", header: "Price", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums">{formatINR(row.original.pricePaise)}</span> },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={consultationStatusLabels} variants={consultationStatusVariants} />,
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/consultations/${row.original.id}`} label={`View consultation with ${row.original.astrologer.displayName}`} icon={Eye} />
            <AdminRowActions label="More actions" actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Consultations"
      description="Bookings between customers and astrologers."
      noun="consultations"
      list={list}
      dateRange
      idFilterLabels={{ astrologerId: "Astrologer", customerUserId: "Customer" }}
      idFilterName={(key, rows) => (key === "astrologerId" ? rows[0]?.astrologer.displayName : (rows[0]?.customer.email ?? rows[0]?.customer.phone))}
      columns={columns}
      filters={[
        { key: "status", allLabel: "All statuses", options: consultationStatusLabels },
        { key: "mode", allLabel: "All modes", options: consultationModeLabels },
        { key: "requestKind", allLabel: "Instant or scheduled", options: consultationRequestKindLabels },
      ]}
      emptyLabel="No consultations yet"
      emptyDescription="Consultations appear here when customers book an astrologer."
      emptyIcon={CalendarClock}
      renderMobileCard={(consultation) => (
        <article key={consultation.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/consultations/${consultation.id}`} className="block truncate font-medium hover:underline">
                {personPrimaryLabel(consultation.customer)}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                with {consultation.astrologer.displayName} · {consultation.consultationMode.name}
              </p>
            </div>
            <AdminRowActions label="Consultation actions" actions={rowActions(consultation)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatDateTime(when(consultation))} · {formatINR(consultation.pricePaise)}
            </p>
            <AdminStatusBadge status={consultation.status} labels={consultationStatusLabels} variants={consultationStatusVariants} />
          </div>
        </article>
      )}
    />
  );
}
