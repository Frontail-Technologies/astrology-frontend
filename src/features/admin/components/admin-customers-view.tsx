"use client";

import { getInitials } from "../lib/format";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, RotateCcw, Search, UserPlus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";
import type { Customer, CustomerAccountStatus } from "@/features/customers/types/customer";
import { CustomerMobileCard } from "./customer-mobile-card";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

const STATUS_LABELS: Record<CustomerAccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  archived: "Archived",
};
const STATUS_VARIANTS: Record<CustomerAccountStatus, "online" | "unavailable" | "muted"> = {
  active: "online",
  suspended: "unavailable",
  archived: "muted",
};

export function AdminCustomersView() {
  const { records: customers } = useCustomerRepository();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerAccountStatus>("all");

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.accountStatus === statusFilter;
      const matchesSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [customers, search, statusFilter]);

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Customer" />,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-accent text-xs font-semibold text-sidebar-primary">
                {getInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{row.original.name ?? "â€”"}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.email ?? "â€”"}</p>
            </div>
          </div>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.phone ?? "â€”"}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.accountStatus ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Status" />,
        cell: ({ row }) => {
          const status = row.original.accountStatus;
          return status ? (
            <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
          ) : (
            <span className="text-muted-foreground">â€”</span>
          );
        },
      },
      {
        id: "joined",
        accessorFn: (row) => row.createdAt ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Joined" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.createdAt
              ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(row.original.createdAt))
              : "â€”"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <Link
              href={`/admin/customers/${row.original.id}`}
              className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`View ${row.original.name ?? "customer"}`}
            >
              <Eye className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  const resultLabel = hasActiveFilters
    ? `${filtered.length} of ${customers.length}`
    : `${customers.length} customers`;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          
          <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Customers</h1>
          <span className="shrink-0 text-sm text-muted-foreground">{resultLabel}</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground">
            <UserPlus className="size-3.5" aria-hidden="true" />
            Registration opens with auth
          </span>
        </div>
      </div>

      <div className="hidden md:block">
        <AdminDataTable
          columns={columns}
          data={filtered}
          initialColumnVisibility={{ contact: false, joined: false }}
          toolbar={(table) => (
            <div className="grid gap-3 xl:grid-cols-[minmax(18.75rem,22.5rem)_1fr] xl:items-center">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or phoneâ€¦"
                  className="h-10 pl-9"
                  aria-label="Search customers"
                />
              </div>
              <div className="flex flex-row flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="h-10 min-w-36" aria-label="Filter by status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <AdminDataTableColumnVisibility table={table} />
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                    <RotateCcw aria-hidden="true" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "No customers match these filters." : "No customers yet."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
              )}
            </div>
          }
        />
      </div>

      <div className="space-y-4 md:hidden">
        <Card className="shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customersâ€¦"
                className="h-10 pl-9"
                aria-label="Search customers"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="h-10" aria-label="Filter by status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
        {filtered.length > 0 ? (
          filtered.map((customer) => <CustomerMobileCard key={customer.id} customer={customer} />)
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "No customers match these filters." : "No customers yet."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
