"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ExternalLink, Eye, Package, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { availabilityLabels, availabilityVariants, catalogStatusLabels, catalogStatusVariants, productFeaturedLabels } from "@/features/store/constants/store-status";
import { useStoreCategoryOptions, useStoreProductList } from "@/features/store/hooks/use-store-admin";
import type { ManagedStoreProduct } from "@/features/store/types/store-admin";
import { formatDateOnly, formatINR } from "../../lib/format";
import { CatalogMobileCard, FeaturedPill } from "../catalog/catalog-pills";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { StoreThumb } from "./store-thumb";

export const productImage = (product: ManagedStoreProduct) => (product.media.find((item) => item.isPrimary) ?? product.media[0])?.url ?? null;
const priceText = (product: ManagedStoreProduct) => (product.pricePaise === null ? "Not priced" : formatINR(product.pricePaise));
const stockText = (product: ManagedStoreProduct) => (product.inventoryTracked ? `${product.inventoryQuantity ?? 0} in stock` : "Stock not tracked");

function StatusPills({ product }: { product: ManagedStoreProduct }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AdminStatusBadge status={product.catalogStatus} labels={catalogStatusLabels} variants={catalogStatusVariants} />
      {product.featured ? <FeaturedPill /> : null}
    </div>
  );
}

const rowActions = (product: ManagedStoreProduct): AdminRowAction[] => [
  { label: "Edit", icon: Pencil, href: `/admin/store/products/${product.id}/edit` },
  ...(product.catalogStatus !== "draft" ? [{ label: "Open on storefront", icon: ExternalLink, href: `/shop/product/${product.slug}` }] : []),
];

function NewProductButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/store/products/new">
        <Plus aria-hidden="true" />
        New product
      </Link>
    </Button>
  );
}

export function AdminStoreProductsView() {
  const list = useStoreProductList();
  const { apply } = list;
  const categories = useStoreCategoryOptions();
  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((category) => ({ value: category.id, label: category.name, description: category.active ? undefined : "Inactive" })),
    [categories.data],
  );
  const categoryId = list.state.filters.categoryId ?? null;

  const columns = useMemo<ColumnDef<ManagedStoreProduct>[]>(
    () => [
      {
        id: "product",
        header: "Product",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-56 items-center gap-3">
            <StoreThumb src={productImage(row.original)} />
            <div className="min-w-0">
              <Link href={`/admin/store/products/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
                {row.original.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{row.original.category?.name ?? "Uncategorized"}</p>
            </div>
          </div>
        ),
      },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <StatusPills product={row.original} /> },
      {
        id: "availability",
        header: "Availability",
        enableSorting: false,
        cell: ({ row }) => <AdminStatusBadge status={row.original.availability.status} labels={availabilityLabels} variants={availabilityVariants} />,
      },
      { id: "price", header: "Price", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums">{priceText(row.original)}</span> },
      { id: "stock", header: "Stock", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{stockText(row.original)}</span> },
      { id: "updated", header: "Updated", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{formatDateOnly(row.original.updatedAt)}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/store/products/${row.original.id}`} label={`View ${row.original.name}`} icon={Eye} />
            <AdminRowActions label={`More actions for ${row.original.name}`} actions={rowActions(row.original)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Products"
      description="Items sold in the store."
      noun="products"
      primaryAction={<NewProductButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search products…"
      filters={[
        { key: "catalogStatus", allLabel: "All statuses", options: catalogStatusLabels },
        { key: "featured", allLabel: "Featured or not", options: productFeaturedLabels },
      ]}
      toolbarExtras={
        <AdminCombobox
          value={categoryId}
          onValueChange={(value) => apply({ filters: { categoryId: value } })}
          options={categoryOptions}
          loading={categories.isPending}
          placeholder={categories.isError ? "Categories unavailable" : "All categories"}
          searchPlaceholder="Search categories…"
          emptyText="No categories match."
          selectedLabel="Selected category"
          clearable
          className="w-full md:w-52"
        />
      }
      extraActiveCount={categoryId ? 1 : 0}
      initialColumnVisibility={{ updated: false }}
      emptyLabel="No products yet"
      emptyDescription="Add a product, then publish it when it is priced and ready to sell."
      emptyIcon={Package}
      emptyAction={<NewProductButton />}
      renderMobileCard={(product) => (
        <CatalogMobileCard key={product.id}>
          <div className="flex items-start gap-3">
            <StoreThumb src={productImage(product)} className="size-11" />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/store/products/${product.id}`} className="font-medium text-foreground hover:underline">
                {product.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{product.category?.name ?? "Uncategorized"}</p>
            </div>
            <AdminRowActions label={`Actions for ${product.name}`} actions={[{ label: "View", icon: Eye, href: `/admin/store/products/${product.id}` }, ...rowActions(product)]} />
          </div>
          <StatusPills product={product} />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{stockText(product)}</span>
            <span className="font-medium text-foreground">{priceText(product)}</span>
          </div>
        </CatalogMobileCard>
      )}
    />
  );
}
