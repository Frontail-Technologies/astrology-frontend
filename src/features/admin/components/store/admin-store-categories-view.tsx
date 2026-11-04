"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Boxes, Eye, Pencil, Plus, Tags } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { categoryActiveLabels } from "@/features/store/constants/store-status";
import { useStoreCategoryList } from "@/features/store/hooks/use-store-admin";
import type { ManagedStoreCategory } from "@/features/store/types/store-admin";
import { formatDateOnly } from "../../lib/format";
import { ActivePill, CatalogMobileCard } from "../catalog/catalog-pills";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { StoreThumb } from "./store-thumb";

const productCountText = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

export function CategoryActiveBadge({ active }: { active: boolean }) {
  return <ActivePill active={active} />;
}

const rowActions = (category: ManagedStoreCategory): AdminRowAction[] => [
  { label: "Edit", icon: Pencil, href: `/admin/store/categories/${category.id}/edit` },
  { label: "View products", icon: Boxes, href: `/admin/store/products?categoryId=${category.id}` },
];

function NewCategoryButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/store/categories/new">
        <Plus aria-hidden="true" />
        New category
      </Link>
    </Button>
  );
}

export function AdminStoreCategoriesView() {
  const list = useStoreCategoryList();
  const columns = useMemo<ColumnDef<ManagedStoreCategory>[]>(
    () => [
      {
        id: "category",
        header: "Category",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-52 items-center gap-3">
            <StoreThumb src={row.original.imageUrl} />
            <div className="min-w-0">
              <Link href={`/admin/store/categories/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
                {row.original.name}
              </Link>
              {row.original.description ? <p className="max-w-80 truncate text-xs text-muted-foreground">{row.original.description}</p> : null}
            </div>
          </div>
        ),
      },
      {
        id: "products",
        header: "Products",
        enableSorting: false,
        cell: ({ row }) => (
          <Link href={`/admin/store/products?categoryId=${row.original.id}`} className="whitespace-nowrap text-sm tabular-nums hover:underline">
            {productCountText(row.original.productCount)}
          </Link>
        ),
      },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <CategoryActiveBadge active={row.original.active} /> },
      { id: "sortOrder", header: "Sort order", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.sortOrder}</span> },
      { id: "updated", header: "Updated", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{formatDateOnly(row.original.updatedAt)}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/store/categories/${row.original.id}`} label={`View ${row.original.name}`} icon={Eye} />
            <AdminRowActions label={`More actions for ${row.original.name}`} actions={rowActions(row.original)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Store categories"
      description="Groups that organise products on the storefront."
      noun="categories"
      primaryAction={<NewCategoryButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search categories…"
      filters={[{ key: "active", allLabel: "Active and inactive", options: categoryActiveLabels }]}
      emptyLabel="No store categories yet"
      emptyDescription="Create a category first, then add products to it."
      emptyIcon={Tags}
      emptyAction={<NewCategoryButton />}
      renderMobileCard={(category) => (
        <CatalogMobileCard key={category.id}>
          <div className="flex items-start gap-3">
            <StoreThumb src={category.imageUrl} className="size-11" />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/store/categories/${category.id}`} className="font-medium text-foreground hover:underline">
                {category.name}
              </Link>
              <p className="text-xs text-muted-foreground tabular-nums">{productCountText(category.productCount)}</p>
            </div>
            <AdminRowActions label={`Actions for ${category.name}`} actions={[{ label: "View", icon: Eye, href: `/admin/store/categories/${category.id}` }, ...rowActions(category)]} />
          </div>
          <CategoryActiveBadge active={category.active} />
        </CatalogMobileCard>
      )}
    />
  );
}
