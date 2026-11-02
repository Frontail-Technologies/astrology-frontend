"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Eye, ShoppingBag, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { orderStatusLabels, orderStatusVariants } from "@/features/orders/constants/order-status";
import { useOrderList } from "@/features/orders/hooks/use-order-admin";
import type { AdminOrder } from "@/features/orders/types/order-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

const itemCount = (order: AdminOrder) => order.items.reduce((sum, item) => sum + item.quantity, 0);
const itemsLabel = (order: AdminOrder) => {
  const count = itemCount(order);
  return count === 1 ? "1 item" : `${count} items`;
};

const rowActions = (order: AdminOrder): AdminRowAction[] => [
  { label: "View order", icon: Eye, href: `/admin/orders/${order.id}` },
  { label: "View customer", icon: UserRound, href: `/admin/customers/${order.customer.id}` },
];

export function AdminOrdersView() {
  const list = useOrderList();
  const columns = useMemo<ColumnDef<AdminOrder>[]>(
    () => [
      {
        id: "order",
        header: "Order",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-44">
            <Link href={`/admin/orders/${row.original.id}`} className="block font-medium tabular-nums hover:underline">
              {row.original.orderNumber}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{row.original.customer.email}</p>
          </div>
        ),
      },
      { id: "items", header: "Items", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{itemsLabel(row.original)}</span> },
      { id: "total", header: "Total", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm font-medium tabular-nums">{formatINR(row.original.totalPaise)}</span> },
      { id: "placed", header: "Placed", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateTime(row.original.placedAt ?? row.original.createdAt)}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={orderStatusLabels} variants={orderStatusVariants} /> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/orders/${row.original.id}`} label={`View order ${row.original.orderNumber}`} icon={Eye} />
            <AdminRowActions label={`More actions for ${row.original.orderNumber}`} actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Orders"
      description="Store orders placed by customers."
      noun="orders"
      list={list}
      dateRange
      columns={columns}
      searchPlaceholder="Search by order number…"
      filters={[{ key: "status", allLabel: "All statuses", options: orderStatusLabels }]}
      initialColumnVisibility={{ items: false }}
      emptyLabel="No orders yet"
      emptyDescription="Orders appear here when customers check out from the store."
      emptyIcon={ShoppingBag}
      renderMobileCard={(order) => (
        <article key={order.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/orders/${order.id}`} className="block font-medium tabular-nums hover:underline">
                {order.orderNumber}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{order.customer.email}</p>
            </div>
            <AdminRowActions label={`Actions for ${order.orderNumber}`} actions={rowActions(order)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatDateTime(order.placedAt ?? order.createdAt)} · {itemsLabel(order)} · {formatINR(order.totalPaise)}
            </p>
            <AdminStatusBadge status={order.status} labels={orderStatusLabels} variants={orderStatusVariants} />
          </div>
        </article>
      )}
    />
  );
}
