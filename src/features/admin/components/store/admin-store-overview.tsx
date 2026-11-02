"use client";

import Link from "next/link";
import { AlertTriangle, Boxes, FilePen, PackageCheck, PackagePlus, PackageSearch, Star, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { catalogStatusLabels, catalogStatusVariants } from "@/features/store/constants/store-status";
import { useRecentStoreProducts, useStoreLowStock, useStoreOverviewCounts } from "@/features/store/hooks/use-store-admin";
import { formatINR } from "../../lib/format";
import { AdminEmptyState } from "../shared/admin-empty-state";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminSectionHeading } from "../shared/admin-section-heading";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { productImage } from "./admin-store-products-view";
import { StoreThumb } from "./store-thumb";

/** `…` while loading, `—` when the count could not be loaded. */
const countValue = (query: { data?: number; isPending: boolean; isError: boolean }) => (query.isError ? "—" : query.isPending ? "…" : (query.data ?? 0));

export function AdminStoreOverview() {
  const counts = useStoreOverviewCounts();
  const lowStock = useStoreLowStock();
  const recent = useRecentStoreProducts();
  const lowStockItems = lowStock.data?.lowStock ?? [];
  const threshold = lowStock.data?.lowStockThreshold;

  return (
    <section className="space-y-6">
      <h1 className="sr-only">Store</h1>
      <AdminSectionHeading
        title="Catalog at a glance"
        description="Counts come straight from the product and category lists."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="bg-surface">
              <Link href="/admin/store/categories/new">
                <Tags aria-hidden="true" />
                New category
              </Link>
            </Button>
            <Button asChild variant="conversion" size="sm">
              <Link href="/admin/store/products/new">
                <PackagePlus aria-hidden="true" />
                New product
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <AdminMetricCard label="Products" value={countValue(counts.products)} icon={Boxes} href="/admin/store/products" />
        <AdminMetricCard label="Published" value={countValue(counts.published)} icon={PackageCheck} href="/admin/store/products?catalogStatus=published" />
        <AdminMetricCard label="Drafts" value={countValue(counts.drafts)} icon={FilePen} href="/admin/store/products?catalogStatus=draft" />
        <AdminMetricCard label="Featured" value={countValue(counts.featured)} icon={Star} href="/admin/store/products?featured=true" />
        <AdminMetricCard label="Categories" value={countValue(counts.categories)} icon={Tags} href="/admin/store/categories" />
        <AdminMetricCard
          label="Low stock"
          value={lowStock.error ? "—" : lowStock.ready ? lowStockItems.length : "…"}
          secondary={threshold !== undefined ? `${threshold} units or fewer` : undefined}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdminSectionCard
          title="Recently updated products"
          flush
          actions={
            <Link href="/admin/store/products" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
              View all
            </Link>
          }
        >
          {recent.error ? (
            <div className="p-5">
              <AdminErrorState error={recent.error} onRetry={recent.reload} title="Could not load products" />
            </div>
          ) : !recent.ready ? (
            <p className="px-5 py-6 text-sm text-muted-foreground" role="status">
              Loading products…
            </p>
          ) : !recent.data?.items.length ? (
            <AdminEmptyState
              variant="inline"
              icon={PackageSearch}
              title="No products yet"
              description="Add the first product to start the storefront catalog."
              action={
                <Button asChild variant="outline" size="sm" className="bg-surface">
                  <Link href="/admin/store/products/new">New product</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {recent.data.items.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <StoreThumb src={productImage(product)} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/store/products/${product.id}`} className="block truncate text-sm font-medium hover:underline">
                      {product.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{product.category?.name ?? "Uncategorized"}</p>
                  </div>
                  <span className="hidden shrink-0 text-sm tabular-nums sm:inline">{product.pricePaise === null ? "Not priced" : formatINR(product.pricePaise)}</span>
                  <AdminStatusBadge status={product.catalogStatus} labels={catalogStatusLabels} variants={catalogStatusVariants} className="shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Low stock" description={threshold !== undefined ? `Tracked products with ${threshold} units or fewer.` : undefined} flush className="self-start">
          {lowStock.error ? (
            <div className="p-5">
              <AdminErrorState error={lowStock.error} onRetry={lowStock.reload} title="Could not load stock levels" />
            </div>
          ) : !lowStock.ready ? (
            <p className="px-5 py-6 text-sm text-muted-foreground" role="status">
              Loading stock levels…
            </p>
          ) : lowStockItems.length === 0 ? (
            <AdminEmptyState variant="inline" icon={PackageCheck} title="Stock looks healthy" description="No tracked product is running low." />
          ) : (
            <ul className="divide-y divide-border">
              {lowStockItems.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <Link href={`/admin/store/products/${item.productId}`} className="min-w-0 truncate text-sm font-medium hover:underline">
                    {item.name}
                  </Link>
                  <AdminStatusPill tone={item.inventoryQuantity === 0 ? "danger" : "warning"} className="shrink-0 tabular-nums">
                    {item.inventoryQuantity === 0 ? "Out of stock" : `${item.inventoryQuantity} left`}
                  </AdminStatusPill>
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>
      </div>
    </section>
  );
}
