"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ClipboardList, ExternalLink, Eye, Flame, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { poojaFeaturedLabels, poojaStatusLabels, poojaStatusVariants } from "@/features/poojas/constants/pooja-status";
import { usePoojaCategories, usePoojaList } from "@/features/poojas/hooks/use-pooja-admin";
import type { ManagedPooja } from "@/features/poojas/types/pooja-admin";
import { formatDateOnly, formatINR } from "../../lib/format";
import { CatalogMobileCard, FeaturedPill } from "../catalog/catalog-pills";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { PoojaThumb } from "./pooja-thumb";

const priceText = (pooja: ManagedPooja) => (pooja.pricePaise === null ? "Price on request" : formatINR(pooja.pricePaise));
const durationText = (pooja: ManagedPooja) => (pooja.durationMinutes === null ? "Duration varies" : `${pooja.durationMinutes} min`);
const categoryText = (pooja: ManagedPooja) => pooja.categories.map((category) => category.name).join(", ") || pooja.category.name;

function StatusPills({ pooja }: { pooja: ManagedPooja }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AdminStatusBadge status={pooja.status} labels={poojaStatusLabels} variants={poojaStatusVariants} />
      {pooja.featured ? <FeaturedPill /> : null}
    </div>
  );
}

function rowActions(pooja: ManagedPooja): AdminRowAction[] {
  return [
    { label: "Edit", icon: Pencil, href: `/admin/poojas/${pooja.id}/edit` },
    { label: "View requests", icon: ClipboardList, href: `/admin/pooja-requests?pooja=${pooja.id}` },
    ...(pooja.status === "published" ? [{ label: "Open public page", icon: ExternalLink, href: `/pooja/${pooja.slug}` }] : []),
  ];
}

function NewPoojaButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/poojas/new">
        <Plus aria-hidden="true" />
        New pooja
      </Link>
    </Button>
  );
}

export function AdminPoojasView() {
  const list = usePoojaList();
  const categories = usePoojaCategories();
  const categoryOptions = useMemo(() => Object.fromEntries((categories.data ?? []).map((category) => [category.id, category.name])), [categories.data]);

  const columns = useMemo<ColumnDef<ManagedPooja>[]>(
    () => [
      {
        id: "pooja",
        header: "Pooja",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-56 items-center gap-3">
            <PoojaThumb src={row.original.imageUrl} />
            <div className="min-w-0">
              <Link href={`/admin/poojas/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
                {row.original.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{categoryText(row.original)}</p>
            </div>
          </div>
        ),
      },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <StatusPills pooja={row.original} /> },
      { id: "price", header: "Price", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums">{priceText(row.original)}</span> },
      { id: "duration", header: "Duration", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{durationText(row.original)}</span> },
      { id: "updated", header: "Updated", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{formatDateOnly(row.original.updatedAt)}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/poojas/${row.original.id}`} label={`View ${row.original.name}`} icon={Eye} />
            <AdminRowActions label={`More actions for ${row.original.name}`} actions={rowActions(row.original)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Poojas"
      description="Rituals listed on the site and open for requests when published."
      noun="poojas"
      primaryAction={<NewPoojaButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search poojas…"
      searchMaxLength={180}
      filters={[
        { key: "categoryId", allLabel: categories.isError ? "Categories unavailable" : "All categories", options: categoryOptions },
        { key: "status", allLabel: "All statuses", options: poojaStatusLabels },
        { key: "featured", allLabel: "Featured or not", options: poojaFeaturedLabels },
      ]}
      initialColumnVisibility={{ duration: false }}
      emptyLabel="No poojas yet"
      emptyDescription="Create the first pooja. It starts as a draft until you publish it."
      emptyIcon={Flame}
      emptyAction={<NewPoojaButton />}
      renderMobileCard={(pooja) => (
        <CatalogMobileCard key={pooja.id}>
          <div className="flex items-start gap-3">
            <PoojaThumb src={pooja.imageUrl} className="size-11" />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/poojas/${pooja.id}`} className="font-medium text-foreground hover:underline">
                {pooja.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{categoryText(pooja)}</p>
            </div>
            <AdminRowActions label={`Actions for ${pooja.name}`} actions={[{ label: "View", icon: Eye, href: `/admin/poojas/${pooja.id}` }, ...rowActions(pooja)]} />
          </div>
          <StatusPills pooja={pooja} />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{durationText(pooja)}</span>
            <span className="font-medium text-foreground">{priceText(pooja)}</span>
          </div>
        </CatalogMobileCard>
      )}
    />
  );
}
