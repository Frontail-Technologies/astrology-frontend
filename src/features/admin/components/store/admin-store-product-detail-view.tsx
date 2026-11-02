"use client";

import Link from "next/link";
import { ExternalLink, Pencil, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  availabilityLabels,
  availabilityVariants,
  catalogStatusDescriptions,
  catalogStatusLabels,
  catalogStatusVariants,
  catalogStatuses,
} from "@/features/store/constants/store-status";
import { storeProductDeleteOptions, useStoreProductDetail, useStoreProductStatusUpdate } from "@/features/store/hooks/use-store-admin";
import type { ManagedStoreProduct, StoreProductStatusInput } from "@/features/store/types/store-admin";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";
import { FeaturedPill, MarkerPill } from "../catalog/catalog-pills";

const statusActionLabels = { draft: "Move to draft", published: "Publish", coming_soon: "Mark coming soon", unavailable: "Mark unavailable" } as const;

function confirmCopy(product: ManagedStoreProduct, change: StoreProductStatusInput) {
  if (change.catalogStatus) {
    return { title: `${statusActionLabels[change.catalogStatus]}?`, description: catalogStatusDescriptions[change.catalogStatus], label: statusActionLabels[change.catalogStatus] };
  }
  return change.featured
    ? { title: `Feature “${product.name}”?`, description: "Featured products are highlighted on the storefront.", label: "Feature" }
    : { title: `Remove “${product.name}” from featured?`, description: "The product stays listed; it is no longer highlighted.", label: "Unfeature" };
}

function ProductStatusControl({ product }: { product: ManagedStoreProduct }) {
  const update = useStoreProductStatusUpdate(product.id);
  const confirm = useConfirmAction<StoreProductStatusInput>(update);
  const copy = confirm.target ? confirmCopy(product, confirm.target) : null;
  return (
    <div className="grid gap-3">
      <p className="text-[13px] text-muted-foreground">{catalogStatusDescriptions[product.catalogStatus]}</p>
      <div className="flex flex-wrap gap-2">
        {catalogStatuses
          .filter((status) => status !== product.catalogStatus)
          .map((status) => (
            <Button
              key={status}
              size="sm"
              variant={status === "published" ? "conversion" : "outline"}
              className={status === "published" ? undefined : "bg-surface"}
              disabled={update.isPending}
              onClick={() => confirm.open({ catalogStatus: status })}
            >
              {statusActionLabels[status]}
            </Button>
          ))}
      </div>
      <Button size="sm" variant="ghost" className="justify-start" disabled={update.isPending} onClick={() => confirm.open({ featured: !product.featured })}>
        <Star className={product.featured ? "fill-current" : undefined} aria-hidden="true" />
        {product.featured ? "Remove from featured" : "Feature this product"}
      </Button>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={copy?.title ?? ""}
        description={copy?.description ?? ""}
        confirmLabel={copy?.label ?? "Confirm"}
        onConfirm={() => {
          if (confirm.target) update.mutate(confirm.target, { onSuccess: confirm.close });
        }}
      />
    </div>
  );
}

function TextList({ title, items }: { title: string; items: string[] | undefined }) {
  if (!items?.length) return null;
  return (
    <AdminSectionCard title={title}>
      <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex gap-2">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </AdminSectionCard>
  );
}

function Gallery({ product }: { product: ManagedStoreProduct }) {
  const media = [...product.media].sort((a, b) => a.sortOrder - b.sortOrder);
  if (!media.length) return <p className="text-sm text-muted-foreground">No images yet. Add them from the editor.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {media.map((item) => {
        const url = mediaDisplayUrl(item.url);
        return (
          <figure key={item.id} className="space-y-1">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or external media */}
              {url ? <img src={url} alt={item.alt ?? ""} className="size-full object-cover" /> : null}
              {item.isPrimary ? <MarkerPill className="absolute left-1.5 top-1.5 bg-surface">Primary</MarkerPill> : null}
            </div>
            <figcaption className="truncate text-xs text-muted-foreground">{item.alt || "No alt text"}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}

export function AdminStoreProductDetailView({ productId }: { productId: string }) {
  const detail = useStoreProductDetail(productId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="product">
      {() => {
        const product = detail.data!;
        const details = product.details;
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={product.name}
              description={product.category?.name ?? "Uncategorized"}
              backHref="/admin/store/products"
              backLabel="Products"
              meta={
                <>
                  <AdminStatusBadge status={product.catalogStatus} labels={catalogStatusLabels} variants={catalogStatusVariants} />
                  <AdminStatusBadge status={product.availability.status} labels={availabilityLabels} variants={availabilityVariants} />
                  {product.featured ? <FeaturedPill /> : null}
                  <span className="tabular-nums">Updated {formatDateTime(product.updatedAt)}</span>
                </>
              }
              actions={
                <>
                  {product.catalogStatus !== "draft" ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/shop/product/${product.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink aria-hidden="true" />
                        Storefront
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/store/products/${product.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Images">
                  <Gallery product={product} />
                </AdminSectionCard>
                <AdminSectionCard title="Description">
                  <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                    {product.shortDescription ? <p className="font-medium text-foreground">{product.shortDescription}</p> : null}
                    {product.description ? <p className="whitespace-pre-line">{product.description}</p> : <p>No description yet.</p>}
                  </div>
                </AdminSectionCard>
                <TextList title="Overview" items={details.overview} />
                <TextList title="Highlights" items={details.highlights} />
                {details.specifications?.length ? (
                  <AdminSectionCard title="Specifications">
                    <div className="divide-y divide-border">
                      {details.specifications.map((spec, index) => (
                        <DetailRow key={`${index}-${spec.label}`} label={spec.label} value={spec.value} />
                      ))}
                    </div>
                  </AdminSectionCard>
                ) : null}
                <TextList title="Care instructions" items={details.careInstructions} />
                {details.faq?.length ? (
                  <AdminSectionCard title="FAQ">
                    <dl className="space-y-4">
                      {details.faq.map((entry, index) => (
                        <div key={`${index}-${entry.question}`}>
                          <dt className="text-sm font-medium text-foreground">{entry.question}</dt>
                          <dd className="mt-1 text-sm leading-6 text-muted-foreground">{entry.answer}</dd>
                        </div>
                      ))}
                    </dl>
                  </AdminSectionCard>
                ) : null}
              </div>
              <AdminDetailStickyRail>
                <AdminSectionCard title="Catalog status">
                  <ProductStatusControl product={product} />
                </AdminSectionCard>
                <AdminSectionCard title="Pricing & stock">
                  <div className="divide-y divide-border">
                    <DetailRow label="Price" value={<span className="tabular-nums">{product.pricePaise === null ? "Not priced" : formatINR(product.pricePaise)}</span>} />
                    <DetailRow label="Purchasable" value={product.availability.purchasable ? "Yes" : "No"} />
                    <DetailRow label="Inventory" value={<span className="tabular-nums">{product.inventoryTracked ? `${product.inventoryQuantity ?? 0} units` : "Not tracked"}</span>} />
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Record">
                  <div className="divide-y divide-border">
                    <DetailRow label="Category" value={product.category ? <Link className="hover:underline" href={`/admin/store/categories/${product.category.id}`}>{product.category.name}</Link> : "Uncategorized"} />
                    <DetailRow label="Web address" value={<span className="break-all font-mono text-xs">{product.slug}</span>} />
                    <DetailRow label="Created" value={<span className="tabular-nums">{formatDateTime(product.createdAt)}</span>} />
                    <DetailRow label="Updated" value={<span className="tabular-nums">{formatDateTime(product.updatedAt)}</span>} />
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <AdminDeleteAction
                      id={product.id}
                      entityLabel="product"
                      {...storeProductDeleteOptions}
                      redirectTo="/admin/store/products"
                      triggerClassName="w-full bg-surface text-destructive hover:text-destructive"
                      description="The product is removed from the admin panel and the storefront. Past orders keep their line items."
                    />
                  </div>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
