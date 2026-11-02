"use client";

import Link from "next/link";
import { Check, Copy, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { couponDiscountTypeLabels, couponScopeDescriptions, couponScopeLabels } from "@/features/coupons/constants/coupon-status";
import { couponDeleteOptions, useCouponDetail, useCouponStatusUpdate } from "@/features/coupons/hooks/use-coupon-admin";
import type { ManagedCoupon } from "@/features/coupons/types/coupon-admin";
import { useStoreCategoryOptions, useStoreProductsByIds } from "@/features/store/hooks/use-store-admin";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { formatDateTime, formatINR, formatOptionalDateTime } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { useConfirmAction } from "../shared/use-confirm-action";
import { CouponStateBadge, CouponSwatch, discountText, usageText, validityText } from "./coupon-display";

function CouponStatusControl({ coupon }: { coupon: ManagedCoupon }) {
  const update = useCouponStatusUpdate(coupon.id);
  const confirm = useConfirmAction<boolean>(update);
  const next = !coupon.active;
  return (
    <div className="grid gap-2">
      <p className="text-[13px] text-muted-foreground">{coupon.active ? "Customers can redeem this coupon within its validity window." : "Customers cannot redeem this coupon."}</p>
      <Button
        size="sm"
        variant={next ? "conversion" : "outline"}
        className={next ? undefined : "bg-surface"}
        disabled={update.isPending}
        onClick={() => confirm.open(next)}
      >
        {coupon.active ? "Deactivate" : "Activate"}
      </Button>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={next ? `Activate ${coupon.code}?` : `Deactivate ${coupon.code}?`}
        description={next ? "The coupon can be redeemed again within its validity window and limits." : "The coupon stops working immediately. Past redemptions are not affected."}
        confirmLabel={next ? "Activate" : "Deactivate"}
        onConfirm={() => update.mutate({ active: next }, { onSuccess: confirm.close })}
      />
    </div>
  );
}

function ScopeList({ coupon }: { coupon: ManagedCoupon }) {
  const categories = useStoreCategoryOptions(coupon.scope === "selected_categories");
  const products = useStoreProductsByIds(coupon.scope === "selected_products" ? coupon.productIds : []);
  if (coupon.scope === "selected_categories") {
    const names = new Map((categories.data ?? []).map((category) => [category.id, category.name]));
    return (
      <ul className="flex flex-wrap gap-1.5">
        {coupon.categoryIds.map((id) => (
          <li key={id}>
            <Link href={`/admin/store/categories/${id}`} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-sm hover:bg-muted">
              {names.get(id) ?? (categories.isPending ? "Loading…" : "Unavailable category")}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  if (coupon.scope === "selected_products") {
    return (
      <ul className="flex flex-wrap gap-1.5">
        {coupon.productIds.map((id, index) => (
          <li key={id}>
            <Link href={`/admin/store/products/${id}`} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-sm hover:bg-muted">
              {products[index]?.data?.name ?? (products[index]?.isError ? "Unavailable product" : "Loading…")}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

export function AdminCouponDetailView({ couponId }: { couponId: string }) {
  const detail = useCouponDetail(couponId);
  const { copied, copy } = useCopyToClipboard({ label: "Coupon code" });
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="coupon">
      {() => {
        const coupon = detail.data!;
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={<span className="font-mono tracking-wide">{coupon.code}</span>}
              description={coupon.name}
              backHref="/admin/coupons"
              backLabel="Coupons"
              meta={
                <>
                  <CouponSwatch color={coupon.color} className="size-3" />
                  <CouponStateBadge coupon={coupon} />
                  <span className="tabular-nums">{validityText(coupon)}</span>
                </>
              }
              actions={
                <>
                  <Button variant="ghost" size="sm" onClick={() => void copy(coupon.code)}>
                    {copied === coupon.code ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    Copy code
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/coupons/${coupon.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Offer">
                  <p className="text-2xl font-semibold tabular-nums">
                    {discountText(coupon)}
                  </p>
                  {coupon.description ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{coupon.description}</p> : null}
                  <div className="mt-4 divide-y divide-border">
                    <DetailRow label="Type" value={couponDiscountTypeLabels[coupon.discountType]} />
                    {coupon.discountType === "percentage" ? <DetailRow label="Maximum discount" value={coupon.maxDiscountPaise === null ? "No cap" : formatINR(coupon.maxDiscountPaise)} /> : null}
                    <DetailRow label="Minimum order" value={coupon.minOrderPaise === null ? "None" : formatINR(coupon.minOrderPaise)} />
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Applies to">
                  <p className="text-sm font-medium">{couponScopeLabels[coupon.scope]}</p>
                  <p className="mb-3 text-[13px] text-muted-foreground">{couponScopeDescriptions[coupon.scope]}</p>
                  <ScopeList coupon={coupon} />
                </AdminSectionCard>
                <AdminSectionCard title="Validity & usage">
                  <div className="divide-y divide-border">
                    <DetailRow label="Starts" value={formatOptionalDateTime(coupon.startsAt, "Immediately")} />
                    <DetailRow label="Ends" value={formatOptionalDateTime(coupon.endsAt, "No end date")} />
                    <DetailRow label="Redemptions" value={usageText(coupon)} />
                    <DetailRow label="Per customer" value={coupon.perCustomerLimit === null ? "No limit" : coupon.perCustomerLimit} />
                  </div>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail>
                <AdminSectionCard title="Status">
                  <CouponStatusControl coupon={coupon} />
                </AdminSectionCard>
                <AdminSectionCard title="Record">
                  <div className="divide-y divide-border">
                    <DetailRow label="Created" value={<span className="tabular-nums">{formatDateTime(coupon.createdAt)}</span>} />
                    <DetailRow label="Updated" value={<span className="tabular-nums">{formatDateTime(coupon.updatedAt)}</span>} />
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <AdminDeleteAction
                      id={coupon.id}
                      entityLabel="coupon"
                      {...couponDeleteOptions}
                      redirectTo="/admin/coupons"
                      triggerClassName="w-full bg-surface text-destructive hover:text-destructive"
                      description={`Customers can no longer use ${coupon.code}. Past redemptions stay on their orders, and the code cannot be reused for a new coupon.`}
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
