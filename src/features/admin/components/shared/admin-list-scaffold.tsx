"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import type { RowData } from "@tanstack/react-table";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./admin-data-table";

export const money = (amountInPaise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amountInPaise / 100);
export const dateTime = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
export const dateOnly = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
export const duration = (seconds: number) => `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function AdminPageHeader({ title, description, backHref, backLabel, actions }: { title: string; description?: string; backHref?: string; backLabel?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {backHref ? (
          <Link href={backHref} className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="font-sans text-xl font-semibold">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export type ListFilter<T> = { id: string; allLabel: string; options: Record<string, string>; match: (record: T, value: string) => boolean };

export function AdminListScaffold<T extends RowData>({
  title,
  description,
  actions,
  summary,
  records,
  columns,
  searchPlaceholder,
  searchText,
  filters = [],
  initialColumnVisibility,
  emptyLabel,
  renderMobileCard,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  summary?: ReactNode;
  records: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder: string;
  searchText: (record: T) => string;
  filters?: ListFilter<T>[];
  initialColumnVisibility?: Record<string, boolean>;
  emptyLabel: string;
  renderMobileCard: (record: T) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const filtered = useMemo(
    () =>
      records.filter(
        (record) =>
          (!query || searchText(record).toLowerCase().includes(query.toLowerCase())) &&
          filters.every((filter) => !values[filter.id] || values[filter.id] === "all" || filter.match(record, values[filter.id])),
      ),
    [filters, query, records, searchText, values],
  );

  const controls = (
    <>
      <div className="relative min-w-56 flex-1">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
      </div>
      {filters.map((filter) => (
        <Select key={filter.id} value={values[filter.id] ?? "all"} onValueChange={(value) => setValues((current) => ({ ...current, [filter.id]: value }))}>
          <SelectTrigger className="h-9 w-40 bg-surface" aria-label={filter.allLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{filter.allLabel}</SelectItem>
            {Object.entries(filter.options).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </>
  );

  return (
    <section className="space-y-4">
      <AdminPageHeader title={title} description={description} actions={actions} />
      {summary}
      <div className="hidden md:block">
        <AdminDataTable
          columns={columns}
          data={filtered}
          emptyState={<span>{emptyLabel}</span>}
          initialColumnVisibility={initialColumnVisibility}
          toolbar={(table) => (
            <div className="flex flex-wrap items-center gap-2">
              {controls}
              <AdminDataTableColumnVisibility table={table} />
            </div>
          )}
        />
      </div>
      <div className="grid gap-3 md:hidden">
        <div className="flex flex-wrap gap-2">{controls}</div>
        {filtered.length ? filtered.map(renderMobileCard) : <p className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>}
      </div>
    </section>
  );
}
