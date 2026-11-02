import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { couponActiveLabels, couponDateStateLabels, couponDiscountTypeLabels } from "../constants/coupon-status.ts";

export type CouponListFilter = "active" | "discountType" | "dateState";

export const couponListConfig: AdminListConfig<CouponListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 180,
  filters: { active: Object.keys(couponActiveLabels), discountType: Object.keys(couponDiscountTypeLabels), dateState: Object.keys(couponDateStateLabels) },
};
