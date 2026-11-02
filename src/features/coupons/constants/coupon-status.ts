import type { CouponDateState, CouponDiscountType, CouponScope } from "../types/coupon-admin.ts";

export const couponDiscountTypes = ["percentage", "fixed"] as const satisfies readonly CouponDiscountType[];
export const couponScopes = ["all_products", "selected_categories", "selected_products", "consultations"] as const satisfies readonly CouponScope[];

export const couponDiscountTypeLabels: Record<CouponDiscountType, string> = { percentage: "Percentage", fixed: "Fixed amount" };
export const couponActiveLabels = { true: "Active", false: "Inactive" } as const;
export const couponDateStateLabels: Record<CouponDateState, string> = { upcoming: "Upcoming", active: "Running now", expired: "Expired" };

export const couponScopeLabels: Record<CouponScope, string> = {
  all_products: "All store products",
  selected_categories: "Selected categories",
  selected_products: "Selected products",
  consultations: "Consultations",
};
export const couponScopeDescriptions: Record<CouponScope, string> = {
  all_products: "Applies to every product in a store order.",
  selected_categories: "Applies only to products in the chosen store categories.",
  selected_products: "Applies only to the chosen products.",
  consultations: "Applies to consultation bookings instead of store orders.",
};

/** Display state derived from `active`, the validity window and the usage limit. */
export type CouponDisplayState = "inactive" | "upcoming" | "running" | "expired" | "exhausted";
export const couponDisplayLabels: Record<CouponDisplayState, string> = {
  inactive: "Inactive",
  upcoming: "Scheduled",
  running: "Active",
  expired: "Expired",
  exhausted: "Limit reached",
};
export const couponDisplayVariants: Record<CouponDisplayState, "muted" | "pending" | "online" | "unavailable"> = {
  inactive: "muted",
  upcoming: "pending",
  running: "online",
  expired: "unavailable",
  exhausted: "unavailable",
};

/** Muted brand-safe swatches for the coupon accent colour. */
export const couponColorPalette = [
  { name: "Saffron", value: "#C76A35" },
  { name: "Gold", value: "#B47A1F" },
  { name: "Maroon", value: "#A33D3D" },
  { name: "Rose", value: "#A54D67" },
  { name: "Green", value: "#477F63" },
  { name: "Blue", value: "#467DA8" },
  { name: "Indigo", value: "#3F3D8F" },
  { name: "Slate", value: "#64748B" },
] as const;

export const COUPON_LIMITS = { maxCategories: 100, maxProducts: 500, maxPaise: 2_000_000_000, maxCount: 2_000_000_000 } as const;

export const COUPON_ERROR_HINTS: Record<string, string> = {
  COUPON_CODE_EXISTS: "This code is already used by another coupon (including deleted ones). Choose a different code.",
  INVALID_COUPON_SCOPE_REFERENCE: "One of the selected categories or products no longer exists. Review the selection.",
  INVALID_COUPON_SCOPE: "The selection does not match the chosen scope.",
  INVALID_COUPON_CONFIGURATION: "Check the discount value and the validity window.",
};
