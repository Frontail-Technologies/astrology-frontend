/** Admin shapes for `/admin/coupons`. Separate from the legacy demo `types/coupon.ts`. */
export type CouponDiscountType = "fixed" | "percentage";
/** `consultations` applies to consultation bookings; it carries no category/product ids. */
export type CouponScope = "all_products" | "selected_categories" | "selected_products" | "consultations";
export type CouponDateState = "upcoming" | "active" | "expired";

/** `GET /admin/coupons` item and detail (backend `toAdminCoupon`). */
export type ManagedCoupon = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: CouponDiscountType;
  /** Paise for `fixed`, 1-100 for `percentage`. */
  discountValue: number;
  maxDiscountPaise: number | null;
  minOrderPaise: number | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  /** Shown on the offers screen of the customer app (unlisted codes still work when typed). */
  listed: boolean;
  scope: CouponScope;
  /** `#RRGGBB` or null. */
  color: string | null;
  createdAt: string;
  updatedAt: string;
  categoryIds: string[];
  productIds: string[];
  /** Redemptions so far. */
  usageCount: number;
};

export type CouponInput = {
  code: string;
  name: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountPaise: number | null;
  minOrderPaise: number | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  listed: boolean;
  scope: CouponScope;
  categoryIds: string[];
  productIds: string[];
  color: string | null;
};

export type CouponStatusInput = { active: boolean };
