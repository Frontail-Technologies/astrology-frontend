"use client";

import Link from "next/link";
import { Boxes, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { storeCategoryDeleteOptions, useStoreCategoryDetail, useStoreCategoryStatusUpdate } from "@/features/store/hooks/use-store-admin";
import type { ManagedStoreCategory } from "@/features/store/types/store-admin";
import { formatDateTime } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { useConfirmAction } from "../shared/use-confirm-action";
import { DetailCover } from "../catalog/catalog-pills";
import { CategoryActiveBadge } from "./admin-store-categories-view";

function CategoryStatusControl({ category }: { category: ManagedStoreCategory }) {
  const update = useStoreCategoryStatusUpdate(category.id);
  const confirm = useConfirmAction<boolean>(update);
  const next = !category.active;
  return (
    <div className="grid gap-2">
      <p className="text-[13px] text-muted-foreground">
        {category.active ? "Shown on the storefront with its published products." : "Hidden from the storefront category list."}
      </p>
      <Button size="sm" variant="outline" className="bg-surface" disabled={update.isPending} onClick={() => confirm.open(next)}>
        {category.active ? "Deactivate" : "Activate"}
      </Button>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={next ? `Activate “${category.name}”?` : `Deactivate “${category.name}”?`}
        description={next ? "The category appears on the storefront again." : "The category is hidden from the storefront. Its products are not changed."}
        confirmLabel={next ? "Activate" : "Deactivate"}
        onConfirm={() => update.mutate({ active: next }, { onSuccess: confirm.close })}
      />
    </div>
  );
}

function TextList({ items }: { items: string[] | undefined }) {
  if (!items?.length) return <p className="text-sm text-muted-foreground">Not written yet.</p>;
  return (
    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex gap-2">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function AdminStoreCategoryDetailView({ categoryId }: { categoryId: string }) {
  const detail = useStoreCategoryDetail(categoryId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="category">
      {() => {
        const category = detail.data!;
        const details = category.details;
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={category.name}
              description={category.description ?? undefined}
              backHref="/admin/store/categories"
              backLabel="Store categories"
              meta={
                <>
                  <CategoryActiveBadge active={category.active} />
                  <span className="tabular-nums">
                    {category.productCount} {category.productCount === 1 ? "product" : "products"}
                  </span>
                </>
              }
              actions={
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/store/products?categoryId=${category.id}`}>
                      <Boxes aria-hidden="true" />
                      View products
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/store/categories/${category.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="About">
                  <TextList items={details?.about} />
                </AdminSectionCard>
                <AdminSectionCard title="Highlights">
                  <TextList items={details?.highlights} />
                </AdminSectionCard>
                <AdminSectionCard title="FAQ">
                  {details?.faq?.length ? (
                    <dl className="space-y-4">
                      {details.faq.map((entry, index) => (
                        <div key={`${index}-${entry.question}`}>
                          <dt className="text-sm font-medium text-foreground">{entry.question}</dt>
                          <dd className="mt-1 text-sm leading-6 text-muted-foreground">{entry.answer}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">No questions yet.</p>
                  )}
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail>
                <DetailCover src={category.imageUrl} alt={category.name} />
                <AdminSectionCard title="Visibility">
                  <CategoryStatusControl category={category} />
                </AdminSectionCard>
                <AdminSectionCard title="Record">
                  <div className="divide-y divide-border">
                    <DetailRow label="Products" value={<Link className="hover:underline" href={`/admin/store/products?categoryId=${category.id}`}>{category.productCount}</Link>} />
                    <DetailRow label="Sort order" value={category.sortOrder} />
                    <DetailRow label="Web address" value={<span className="break-all font-mono text-xs">{category.slug}</span>} />
                    <DetailRow label="Created" value={<span className="tabular-nums">{formatDateTime(category.createdAt)}</span>} />
                    <DetailRow label="Updated" value={<span className="tabular-nums">{formatDateTime(category.updatedAt)}</span>} />
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <AdminDeleteAction
                      id={category.id}
                      entityLabel="category"
                      {...storeCategoryDeleteOptions}
                      redirectTo="/admin/store/categories"
                      triggerClassName="w-full bg-surface text-destructive hover:text-destructive"
                      description={
                        category.productCount > 0
                          ? `This category still has ${category.productCount} product${category.productCount === 1 ? "" : "s"}. Move or delete them first; the server refuses to delete a category in use.`
                          : "The category is removed from the admin panel and the storefront."
                      }
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
