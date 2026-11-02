import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { CouponListFilter } from "../state/coupon-list-state";

const keys = createAdminQueryKeys("coupons");

export const couponKeys = {
  ...keys,
  list: (state: AdminListState<CouponListFilter, never>) => keys.list(state),
};
