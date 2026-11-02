"use client";

import { couponDisplayLabels, couponDisplayVariants, couponScopeLabels } from "@/features/coupons/constants/coupon-status";
import { couponDisplayState } from "@/features/coupons/lib/coupon-form";
import type { ManagedCoupon } from "@/features/coupons/types/coupon-admin";
import { formatDateOnly, formatINR } from "../../lib/format";
import { AdminStatusBadge } from "../shared/admin-status-badge";

export function discountText(coupon: Pick<ManagedCoupon, "discountType" | "discountValue">) {
  return coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `${formatINR(coupon.discountValue)} off`;
}

export function validityText(coupon: Pick<ManagedCoupon, "startsAt" | "endsAt">) {
  if (!coupon.startsAt && !coupon.endsAt) return "No end date";
  if (!coupon.startsAt) return `Until ${formatDateOnly(coupon.endsAt!)}`;
  if (!coupon.endsAt) return `From ${formatDateOnly(coupon.startsAt)}`;
  return `${formatDateOnly(coupon.startsAt)} – ${formatDateOnly(coupon.endsAt)}`;
}

export function usageText(coupon: Pick<ManagedCoupon, "usageCount" | "usageLimit">) {
  return coupon.usageLimit === null ? `${coupon.usageCount} used` : `${coupon.usageCount} / ${coupon.usageLimit}`;
}

export function scopeText(coupon: Pick<ManagedCoupon, "scope" | "categoryIds" | "productIds">) {
  if (coupon.scope === "selected_categories") return `${coupon.categoryIds.length} ${coupon.categoryIds.length === 1 ? "category" : "categories"}`;
  if (coupon.scope === "selected_products") return `${coupon.productIds.length} ${coupon.productIds.length === 1 ? "product" : "products"}`;
  return couponScopeLabels[coupon.scope];
}

export function CouponStateBadge({ coupon }: { coupon: Parameters<typeof couponDisplayState>[0] }) {
  return <AdminStatusBadge status={couponDisplayState(coupon)} labels={couponDisplayLabels} variants={couponDisplayVariants} />;
}

/** Small colour dot; falls back to the theme border colour when the coupon has no colour. */
export function CouponSwatch({ color, className = "size-2.5" }: { color: string | null; className?: string }) {
  return <span className={`${className} inline-block shrink-0 rounded-full border border-border`} style={color ? { backgroundColor: color, borderColor: color } : undefined} aria-hidden="true" />;
}
