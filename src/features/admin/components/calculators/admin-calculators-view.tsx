"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Calculator, Eye, ImageOff, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { calculatorCategoryLabels, calculatorFeaturedLabels, calculatorStatusLabels, calculatorStatusVariants } from "@/features/calculators/constants/calculator-status";
import { useCalculatorList } from "@/features/calculators/hooks/use-calculator-admin";
import type { ManagedCalculator } from "@/features/calculators/types/calculator-admin";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";

function CalculatorThumb({ calculator }: { calculator: ManagedCalculator }) {
  const src = mediaDisplayUrl(calculator.imageSrc);
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
      <ImageOff className="size-4" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or external media */}
      {src ? <img src={src} alt="" className="absolute inset-0 size-full object-cover" /> : null}
    </div>
  );
}

function StatusPills({ calculator }: { calculator: ManagedCalculator }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AdminStatusBadge status={calculator.status} labels={calculatorStatusLabels} variants={calculatorStatusVariants} />
      {calculator.featured ? (
        <AdminStatusPill tone="info" dot={false}>
          Featured
        </AdminStatusPill>
      ) : null}
    </div>
  );
}

function NewCalculatorButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/calculators/new">
        <Plus aria-hidden="true" />
        New calculator
      </Link>
    </Button>
  );
}

function CalculatorMobileCard({ calculator }: { calculator: ManagedCalculator }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <CalculatorThumb calculator={calculator} />
        <div className="min-w-0 flex-1">
          <Link href={`/admin/calculators/${calculator.id}`} className="line-clamp-2 font-medium text-foreground hover:underline">
            {calculator.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{calculatorCategoryLabels[calculator.category]}</p>
        </div>
        <AdminRowActions
          label={`Actions for ${calculator.name}`}
          actions={[
            { label: "View", icon: Eye, href: `/admin/calculators/${calculator.id}` },
            { label: "Edit", icon: Pencil, href: `/admin/calculators/${calculator.id}/edit` },
          ]}
          className="-mr-1.5 -mt-1 shrink-0"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <StatusPills calculator={calculator} />
        <span className="text-xs tabular-nums text-muted-foreground">Order {calculator.sortOrder}</span>
      </div>
    </div>
  );
}

export function AdminCalculatorsView() {
  const list = useCalculatorList();
  const columns = useMemo<ColumnDef<ManagedCalculator>[]>(
    () => [
      {
        id: "calculator",
        header: "Calculator",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-56 max-w-md items-center gap-3">
            <CalculatorThumb calculator={row.original} />
            <div className="min-w-0">
              <Link href={`/admin/calculators/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
                {row.original.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{row.original.shortDescription}</p>
            </div>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{calculatorCategoryLabels[row.original.category]}</span>,
      },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <StatusPills calculator={row.original} /> },
      {
        id: "keywords",
        header: "Keywords",
        enableSorting: false,
        cell: ({ row }) => <span className="block max-w-56 truncate text-sm text-muted-foreground">{row.original.keywords.join(", ") || "None"}</span>,
      },
      { id: "sortOrder", header: "Order", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.sortOrder}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/calculators/${row.original.id}`} label={`View ${row.original.name}`} icon={Eye} />
            <AdminRowActionLink href={`/admin/calculators/${row.original.id}/edit`} label={`Edit ${row.original.name}`} icon={Pencil} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Calculators"
      description="Astrology calculators listed in the public catalog."
      noun="calculators"
      primaryAction={<NewCalculatorButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search name, description or keywords…"
      searchMaxLength={200}
      filters={[
        { key: "category", allLabel: "All categories", options: calculatorCategoryLabels },
        { key: "status", allLabel: "All statuses", options: calculatorStatusLabels },
        { key: "featured", allLabel: "Featured or not", options: calculatorFeaturedLabels },
      ]}
      emptyLabel="No calculators yet"
      emptyDescription="Add a calculator to list it in the public catalog. New ones start as “Coming soon”."
      emptyIcon={Calculator}
      emptyAction={<NewCalculatorButton />}
      renderMobileCard={(calculator) => <CalculatorMobileCard key={calculator.id} calculator={calculator} />}
    />
  );
}
