"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Eye, LifeBuoy, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { ticketCategoryLabels, ticketPriorityLabels, ticketPriorityVariants, ticketStatusLabels, ticketStatusVariants } from "@/features/support/constants/support-status";
import { useTicketList } from "@/features/support/hooks/use-support-admin";
import type { AdminTicket } from "@/features/support/types/support-admin";
import { formatDateTime } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

const customerLabel = (ticket: AdminTicket) => ticket.customer?.email ?? "Customer";

const rowActions = (ticket: AdminTicket): AdminRowAction[] => [
  { label: "Open ticket", icon: Eye, href: `/admin/support/${ticket.id}` },
  ...(ticket.customer ? [{ label: "View customer", icon: UserRound, href: `/admin/customers/${ticket.customer.id}` }] : []),
];

export function AdminSupportView() {
  const list = useTicketList();
  const columns = useMemo<ColumnDef<AdminTicket>[]>(
    () => [
      {
        id: "subject",
        header: "Ticket",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-56 max-w-md">
            <Link href={`/admin/support/${row.original.id}`} className="block truncate font-medium hover:underline">
              {row.original.subject}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {customerLabel(row.original)} · {ticketCategoryLabels[row.original.category]}
            </p>
          </div>
        ),
      },
      { id: "category", header: "Category", enableSorting: false, cell: ({ row }) => <span className="text-sm text-muted-foreground">{ticketCategoryLabels[row.original.category]}</span> },
      { id: "priority", header: "Priority", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.priority} labels={ticketPriorityLabels} variants={ticketPriorityVariants} /> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={ticketStatusLabels} variants={ticketStatusVariants} /> },
      { id: "updated", header: "Updated", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateTime(row.original.updatedAt)}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/support/${row.original.id}`} label={`Open ticket ${row.original.subject}`} icon={Eye} />
            <AdminRowActions label="More actions" actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );
  return (
    <AdminServerList
      title="Support"
      description="Help requests from customers. Reply, add internal notes and track progress."
      noun="tickets"
      list={list}
      idFilterLabels={{ customerUserId: "Customer" }}
      idFilterName={(_key, rows) => rows[0]?.customer?.email}
      columns={columns}
      searchPlaceholder="Search subject or customer…"
      filters={[
        { key: "status", allLabel: "All statuses", options: ticketStatusLabels },
        { key: "priority", allLabel: "All priorities", options: ticketPriorityLabels },
        { key: "category", allLabel: "All categories", options: ticketCategoryLabels },
      ]}
      initialColumnVisibility={{ category: false }}
      emptyLabel="No support tickets yet"
      emptyDescription="Tickets appear here when customers contact support from their account."
      emptyIcon={LifeBuoy}
      renderMobileCard={(ticket) => (
        <article key={ticket.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/support/${ticket.id}`} className="line-clamp-2 font-medium hover:underline">
                {ticket.subject}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {customerLabel(ticket)} · {ticketCategoryLabels[ticket.category]}
              </p>
            </div>
            <AdminRowActions label="Ticket actions" actions={rowActions(ticket)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">Updated {formatDateTime(ticket.updatedAt)}</p>
            <div className="flex flex-wrap gap-1.5">
              <AdminStatusBadge status={ticket.status} labels={ticketStatusLabels} variants={ticketStatusVariants} />
              <AdminStatusBadge status={ticket.priority} labels={ticketPriorityLabels} variants={ticketPriorityVariants} />
            </div>
          </div>
        </article>
      )}
    />
  );
}
