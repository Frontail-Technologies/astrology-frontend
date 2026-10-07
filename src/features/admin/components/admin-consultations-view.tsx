"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, RotateCcw, Search } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { astrologers } from "@/features/astrologers/data/astrologers";
import { useConsultationRepository } from "@/features/consultations/hooks/use-consultation-repository";
import type { Consultation, ConsultationBookingStatus, ConsultationPaymentStatus } from "@/features/consultations/types/consultation";
import { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";
import { ConsultationMobileCard } from "./consultation-mobile-card";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

const BOOKING_LABELS: Record<ConsultationBookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};
const BOOKING_VARIANTS: Record<ConsultationBookingStatus, "pending" | "online" | "verified" | "unavailable"> = {
  pending: "pending",
  confirmed: "online",
  completed: "verified",
  cancelled: "unavailable",
};
const PAYMENT_LABELS: Record<ConsultationPaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};
const PAYMENT_VARIANTS: Record<ConsultationPaymentStatus, "pending" | "online" | "unavailable" | "muted"> = {
  pending: "pending",
  paid: "online",
  failed: "unavailable",
  refunded: "muted",
};

export function AdminConsultationsView() {
  const { records: consultations } = useConsultationRepository();
  const { records: customers } = useCustomerRepository();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ConsultationBookingStatus>("all");

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return consultations.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.bookingStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const customer = customers.find((cu) => cu.id === c.customerId);
      const astrologer = astrologers.find((a) => a.id === c.astrologerId);
      return (
        customer?.name?.toLowerCase().includes(q) ||
        astrologer?.name?.toLowerCase().includes(q) ||
        c.mode?.toLowerCase().includes(q) ||
        false
      );
    });
  }, [consultations, customers, search, statusFilter]);

  const columns = useMemo<ColumnDef<Consultation>[]>(
    () => [
      {
        id: "customer",
        accessorFn: (row) => customers.find((c) => c.id === row.customerId)?.name ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Customer" />,
        enableHiding: false,
        cell: ({ row }) => {
          const c = customers.find((cu) => cu.id === row.original.customerId);
          return (
            <div className="min-w-36">
              <p className="font-medium text-foreground">{c?.name ?? "â€”"}</p>
              <p className="text-xs text-muted-foreground">{c?.email ?? ""}</p>
            </div>
          );
        },
      },
      {
        id: "astrologer",
        accessorFn: (row) => astrologers.find((a) => a.id === row.astrologerId)?.name ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Astrologer" />,
        cell: ({ row }) => {
          const a = astrologers.find((ast) => ast.id === row.original.astrologerId);
          return <span className="text-sm">{a?.name ?? "â€”"}</span>;
        },
      },
      {
        id: "mode",
        header: "Mode",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">{row.original.mode ?? "â€”"}</Badge>
        ),
      },
      {
        id: "scheduled",
        accessorFn: (row) => row.scheduledAt ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Scheduled" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.scheduledAt
              ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.original.scheduledAt))
              : "â€”"}
          </span>
        ),
      },
      {
        id: "bookingStatus",
        accessorFn: (row) => row.bookingStatus ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Status" />,
        cell: ({ row }) => {
          const s = row.original.bookingStatus;
          return s ? (
            <Badge variant={BOOKING_VARIANTS[s]}>{BOOKING_LABELS[s]}</Badge>
          ) : (
            <span className="text-muted-foreground">â€”</span>
          );
        },
      },
      {
        id: "paymentStatus",
        accessorFn: (row) => row.paymentStatus ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Payment" />,
        cell: ({ row }) => {
          const s = row.original.paymentStatus;
          return s ? (
            <Badge variant={PAYMENT_VARIANTS[s]}>{PAYMENT_LABELS[s]}</Badge>
          ) : (
            <span className="text-muted-foreground">â€”</span>
          );
        },
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <Link
              href={`/admin/consultations/${row.original.id}`}
              className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`View consultation ${row.original.id}`}
            >
              <Eye className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ),
      },
    ],
    [customers],
  );

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  const resultLabel = hasActiveFilters
    ? `${filtered.length} of ${consultations.length}`
    : `${consultations.length} consultations`;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          
          <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Consultations</h1>
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">{resultLabel}</span>
        </div>
      </div>

      <div className="hidden md:block">
        <AdminDataTable
          columns={columns}
          data={filtered}
          initialColumnVisibility={{ mode: false, scheduled: false }}
          toolbar={(table) => (
            <div className="grid gap-3 xl:grid-cols-[minmax(18.75rem,22.5rem)_1fr] xl:items-center">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by customer, astrologer or modeâ€¦"
                  className="h-10 pl-9"
                  aria-label="Search consultations"
                />
              </div>
              <div className="flex flex-row flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="h-10 min-w-36" aria-label="Filter by status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                {hasActiveFilters ? "No consultations match these filters." : "No consultations on record."}
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
                placeholder="Search consultationsâ€¦"
                className="h-10 pl-9"
                aria-label="Search consultations"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="h-10" aria-label="Filter by status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
          filtered.map((consultation) => {
            const customer = customers.find((c) => c.id === consultation.customerId);
            const astrologer = astrologers.find((a) => a.id === consultation.astrologerId);
            return (
              <ConsultationMobileCard
                key={consultation.id}
                consultation={consultation}
                customerName={customer?.name ?? consultation.customerId}
                astrologerName={astrologer?.name ?? consultation.astrologerId}
              />
            );
          })
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "No consultations match these filters." : "No consultations on record."}
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
