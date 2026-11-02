"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { createCoupon, deleteCoupon, getCoupon, listCoupons, updateCoupon, updateCouponStatus } from "../api/coupon-admin-api";
import { couponKeys } from "../queries/coupon-query-keys";
import { couponListConfig } from "../state/coupon-list-state";
import type { CouponInput, CouponStatusInput } from "../types/coupon-admin";

export function useCouponList() {
  return useAdminList(couponListConfig, couponKeys.list, listCoupons);
}

export function useCouponDetail(id: string) {
  return useAdminDetail(couponKeys.detail(id), (signal) => getCoupon(id, signal), Boolean(id));
}

export function useCreateCoupon() {
  return useAdminMutation({
    mutationFn: (input: CouponInput) => createCoupon(input),
    invalidate: [couponKeys.all],
    successMessage: "Coupon created",
    toastErrors: false,
  });
}

export function useUpdateCoupon(id: string) {
  return useAdminMutation({
    mutationFn: (input: CouponInput) => updateCoupon(id, input),
    invalidate: [couponKeys.all],
    successMessage: "Coupon saved",
    toastErrors: false,
  });
}

export function useCouponStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (input: CouponStatusInput) => updateCouponStatus(id, input),
    invalidate: [couponKeys.all],
    successMessage: (result) => (result.active ? "Coupon activated" : "Coupon deactivated"),
    toastErrors: false,
  });
}

export const couponDeleteOptions = {
  mutationFn: deleteCoupon,
  invalidate: [couponKeys.all],
  remove: (id: string) => [couponKeys.detail(id)],
};
