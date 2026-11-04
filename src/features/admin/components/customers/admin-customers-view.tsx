"use client";

import { useMemo } from "react";
import { Eye, Users } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { customerStatusLabels, customerStatusVariants } from "@/features/customers/constants/customer-status";
import { useCustomerList } from "@/features/customers/hooks/use-customer-admin";
import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import type { Customer } from "@/features/customers/types/customer";
import { formatDateOnly } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { CustomerIdentity, CustomerMobileCard } from "./customer-mobile-card";

/** Customers list: search, status filter and pagination run on the server; state lives in the URL. */
export function AdminCustomersView() {
  const list = useCustomerList();

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <CustomerIdentity customer={row.original} className="min-w-48" />,
      },
      {
        id: "contact",
        header: "Phone",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.phone ? (
            <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{row.original.phone}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Not added</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.accountStatus;
          return status ? <AdminStatusBadge status={status} labels={customerStatusLabels} variants={customerStatusVariants} /> : <span className="text-sm text-muted-foreground">Unknown</span>;
        },
      },
      {
        id: "joined",
        header: "Joined",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{row.original.createdAt ? formatDateOnly(row.original.createdAt) : "Unknown"}</span>,
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const label = personPrimaryLabel(row.original);
          return (
            <div className="flex justify-end gap-0.5">
              <AdminRowActionLink href={`/admin/customers/${row.original.id}`} label={`View ${label}`} icon={Eye} />
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Customers"
      description="People who signed up on the site. Customers register themselves."
      noun="customers"
      list={list}
      columns={columns}
      searchPlaceholder="Search by name, email or phone…"
      searchMaxLength={200}
      filters={[{ key: "status", allLabel: "All statuses", options: customerStatusLabels }]}
      emptyLabel="No customers yet"
      emptyDescription="Customers appear here as soon as they create an account on the site."
      emptyIcon={Users}
      renderMobileCard={(customer) => <CustomerMobileCard key={customer.id} customer={customer} />}
    />
  );
}
