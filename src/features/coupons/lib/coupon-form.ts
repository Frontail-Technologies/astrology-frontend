/**
 * Coupon editor form <-> API mapping and the scope/discount rules the server enforces. Pure (no React, no `@/`
 * aliases) so it runs under `node --test`.
 */
import type { CouponDisplayState } from "../constants/coupon-status.ts";
import type { CouponDiscountType, CouponInput, CouponScope, ManagedCoupon } from "../types/coupon-admin.ts";

export type CouponFormValues = {
  code: string;
  name: string;
  description: string;
  discountType: CouponDiscountType;
  /** Paise for `fixed`, whole percent for `percentage`; `NaN` while the typed text is invalid. */
  discountValue: number | null;
  maxDiscountPaise: number | null;
  minOrderPaise: number | null;
  /** Whole numbers as typed; "" = no limit. */
  usageLimit: string;
  perCustomerLimit: string;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  scope: CouponScope;
  categoryIds: string[];
  productIds: string[];
  /** `#RRGGBB` or "" for none. */
  color: string;
};

export type CouponIssue = { path: keyof CouponFormValues; message: string };

export const COUPON_CODE_PATTERN = /^[A-Z0-9_-]+$/;
export const COUPON_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** Upper-cases and strips spaces, as typed into the code field. */
export function normalizeCouponCode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "");
}

/** Whole number as typed: `null` for empty, `NaN` for anything else that is not a positive whole number. */
export function parseLimit(text: string): number | null {
  const value = text.trim();
  if (value === "") return null;
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : Number.NaN;
}

/** Scope rules (mirrors the API): scoped coupons need ids of their kind only; other scopes carry none. */
export function validateCouponScope(values: Pick<CouponFormValues, "scope" | "categoryIds" | "productIds">): CouponIssue[] {
  const issues: CouponIssue[] = [];
  if (values.scope === "selected_categories" && values.categoryIds.length === 0) issues.push({ path: "categoryIds", message: "Select at least one category." });
  if (values.scope === "selected_products" && values.productIds.length === 0) issues.push({ path: "productIds", message: "Select at least one product." });
  return issues;
}

/** Discount, limits and validity window rules (mirrors the API). */
export function validateCouponRules(values: CouponFormValues): CouponIssue[] {
  const issues: CouponIssue[] = [...validateCouponScope(values)];
  const value = values.discountValue;
  if (value === null || !Number.isInteger(value) || value <= 0) {
    issues.push({ path: "discountValue", message: values.discountType === "percentage" ? "Enter a whole percentage from 1 to 100." : "Enter a discount amount above ₹0." });
  } else if (values.discountType === "percentage" && value > 100) {
    issues.push({ path: "discountValue", message: "Enter a whole percentage from 1 to 100." });
  }
  if (Number.isNaN(parseLimit(values.usageLimit))) issues.push({ path: "usageLimit", message: "Use a whole number above 0, or leave empty for no limit." });
  if (Number.isNaN(parseLimit(values.perCustomerLimit))) issues.push({ path: "perCustomerLimit", message: "Use a whole number above 0, or leave empty for no limit." });
  if (values.startsAt && values.endsAt && new Date(values.startsAt).getTime() >= new Date(values.endsAt).getTime()) {
    issues.push({ path: "endsAt", message: "The end must be after the start." });
  }
  return issues;
}

/**
 * Ids are sent only for the matching scope (switching scope keeps the selection in the form but never sends it).
 * The maximum discount only applies to percentage coupons.
 */
export function formToCouponInput(values: CouponFormValues): CouponInput {
  const description = values.description.trim();
  return {
    code: normalizeCouponCode(values.code.trim()),
    name: values.name.trim(),
    description: description || null,
    discountType: values.discountType,
    discountValue: values.discountValue ?? 0,
    maxDiscountPaise: values.discountType === "percentage" ? values.maxDiscountPaise : null,
    minOrderPaise: values.minOrderPaise,
    usageLimit: parseLimit(values.usageLimit),
    perCustomerLimit: parseLimit(values.perCustomerLimit),
    startsAt: values.startsAt,
    endsAt: values.endsAt,
    active: values.active,
    scope: values.scope,
    categoryIds: values.scope === "selected_categories" ? [...new Set(values.categoryIds)] : [],
    productIds: values.scope === "selected_products" ? [...new Set(values.productIds)] : [],
    color: values.color ? values.color.toUpperCase() : null,
  };
}

export function couponToFormValues(coupon: ManagedCoupon | null | undefined): CouponFormValues {
  return {
    code: coupon?.code ?? "",
    name: coupon?.name ?? "",
    description: coupon?.description ?? "",
    discountType: coupon?.discountType ?? "percentage",
    discountValue: coupon?.discountValue ?? null,
    maxDiscountPaise: coupon?.maxDiscountPaise ?? null,
    minOrderPaise: coupon?.minOrderPaise ?? null,
    usageLimit: coupon?.usageLimit ? String(coupon.usageLimit) : "",
    perCustomerLimit: coupon?.perCustomerLimit ? String(coupon.perCustomerLimit) : "",
    startsAt: coupon?.startsAt ?? null,
    endsAt: coupon?.endsAt ?? null,
    active: coupon?.active ?? true,
    scope: coupon?.scope ?? "all_products",
    categoryIds: coupon?.categoryIds ?? [],
    productIds: coupon?.productIds ?? [],
    color: coupon?.color ?? "",
  };
}

/** What an admin sees at a glance: switched off, not started, running, ended, or out of redemptions. */
export function couponDisplayState(
  coupon: Pick<ManagedCoupon, "active" | "startsAt" | "endsAt" | "usageLimit" | "usageCount">,
  now: Date = new Date(),
): CouponDisplayState {
  if (!coupon.active) return "inactive";
  const time = now.getTime();
  if (coupon.endsAt && new Date(coupon.endsAt).getTime() <= time) return "expired";
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return "exhausted";
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > time) return "upcoming";
  return "running";
}

/** Random readable code such as `OFFER7K2Q` (no ambiguous 0/O/1/I). */
export function generateCouponCode(prefix = "OFFER", random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let index = 0; index < 4; index += 1) suffix += alphabet[Math.floor(random() * alphabet.length)];
  return `${prefix}${suffix}`;
}
