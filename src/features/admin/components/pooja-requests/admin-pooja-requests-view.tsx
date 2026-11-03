"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import { ClipboardList, Eye, Flame, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { isUuid } from "@/features/admin/data/admin-list-state";
import { poojaRequestStatusLabels, poojaRequestStatusVariants } from "@/features/pooja-requests/constants/pooja-request-status";
import { usePoojaRequestList } from "@/features/pooja-requests/hooks/use-pooja-request-admin";
import type { ManagedPoojaRequest } from "@/features/pooja-requests/types/pooja-request-admin";
import { poojaStatusLabels } from "@/features/poojas/constants/pooja-status";
import { usePoojaOptions } from "@/features/poojas/hooks/use-pooja-admin";
import { formatDateOnly, formatDateTime, formatINR } from "../../lib/format";
import { CatalogMobileCard } from "../catalog/catalog-pills";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

function whenText(request: ManagedPoojaRequest) {
  if (request.scheduledStartAt) return formatDateTime(request.scheduledStartAt);
  if (request.requestedDate) return `Preferred ${formatDateOnly(request.requestedDate)}`;
  return "Flexible date";
}

const amountText = (request: ManagedPoojaRequest) => (request.pricePaise === null ? "On request" : formatINR(request.pricePaise));

/**
 * Pooja filter: a searchable list of poojas (first 100 from the admin poojas list). The API's `pooja` filter takes a
 * pooja id (or a name fragment), so the pooja id is stored in the URL. A legacy text value from an old link still
 * applies and is shown as typed.
 */
function PoojaFilter({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  const poojas = usePoojaOptions();
  const options = useMemo(
    () => (poojas.data ?? []).map((pooja) => ({ value: pooja.id, label: pooja.name, description: pooja.status === "published" ? undefined : poojaStatusLabels[pooja.status] })),
    [poojas.data],
  );
  return (
    <AdminCombobox
      value={value}
      onValueChange={onChange}
      options={options}
      loading={poojas.isPending}
      placeholder={poojas.isError ? "Poojas unavailable" : "All poojas"}
      searchPlaceholder="Search poojas…"
      emptyText="No poojas match."
      selectedLabel={value ? (isUuid(value) ? "Selected pooja" : value) : undefined}
      clearable
      className="w-full md:w-56"
    />
  );
}

export function AdminPoojaRequestsView() {
  const list = usePoojaRequestList();
  const { apply } = list;
  const poojaFilter = list.state.filters.pooja ?? null;
  const setPoojaFilter = useCallback((value: string | null) => apply({ filters: { pooja: value } }), [apply]);

  const columns = useMemo<ColumnDef<ManagedPoojaRequest>[]>(
    () => [
      {
        id: "pooja",
        header: "Pooja",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-44">
            <Link href={`/admin/pooja-requests/${row.original.id}`} className="font-medium text-foreground hover:underline">
              {row.original.poojaName}
            </Link>
            <p className="text-xs text-muted-foreground tabular-nums">
              {row.original.packageName ? `${row.original.packageName} · ` : ""}Requested {formatDateTime(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="text-sm">{row.original.customerName || row.original.email || row.original.phone}</p>
            <p className="text-xs text-muted-foreground">{row.original.phone}</p>
          </div>
        ),
      },
      { id: "city", header: "City", enableSorting: false, cell: ({ row }) => <span className="text-sm text-muted-foreground">{`${row.original.city}, ${row.original.state}`}</span> },
      { id: "when", header: "Date", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{whenText(row.original)}</span> },
      { id: "amount", header: "Amount", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm font-medium tabular-nums">{amountText(row.original)}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={poojaRequestStatusLabels} variants={poojaRequestStatusVariants} /> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/pooja-requests/${row.original.id}`} label={`View request for ${row.original.poojaName} by ${row.original.customerName}`} icon={Eye} />
            <AdminRowActions
              label={`More actions for this ${row.original.poojaName} request`}
              actions={[
                { label: "Open pooja", icon: Flame, href: `/admin/poojas/${row.original.poojaId}` },
                { label: "Open customer", icon: UserRound, href: `/admin/customers/${row.original.customerUserId}` },
              ]}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Pooja requests"
      description="Requests from customers to have a pooja performed."
      noun="requests"
      toolbarExtras={<PoojaFilter value={poojaFilter} onChange={setPoojaFilter} />}
      extraActiveCount={poojaFilter ? 1 : 0}
      list={list}
      columns={columns}
      searchPlaceholder="Customer name, phone or email…"
      searchMaxLength={320}
      filters={[{ key: "status", allLabel: "All statuses", options: poojaRequestStatusLabels }]}
      dateRange
      initialColumnVisibility={{ city: false }}
      emptyLabel="No pooja requests yet"
      emptyDescription="Requests appear here when customers ask for a published pooja."
      emptyIcon={ClipboardList}
      renderMobileCard={(request) => (
        <CatalogMobileCard key={request.id} className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/pooja-requests/${request.id}`} className="font-medium text-foreground hover:underline">
                {request.poojaName}
              </Link>
              <p className="truncate text-sm text-muted-foreground">
                {request.customerName} · {request.city}
                {request.packageName ? ` · ${request.packageName}` : ""}
              </p>
            </div>
            <AdminStatusBadge status={request.status} labels={poojaRequestStatusLabels} variants={poojaRequestStatusVariants} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{whenText(request)}</span>
            <span className="font-medium text-foreground">{amountText(request)}</span>
          </div>
        </CatalogMobileCard>
      )}
    />
  );
}
