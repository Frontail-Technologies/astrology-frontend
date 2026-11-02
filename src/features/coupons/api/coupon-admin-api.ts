import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { CouponInput, CouponStatusInput, ManagedCoupon } from "../types/coupon-admin";

export function listCoupons(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedCoupon>("/coupons", query, signal);
}

export function getCoupon(id: string, signal?: AbortSignal) {
  return adminGet<ManagedCoupon>(`/coupons/${encodeId(id)}`, { signal });
}

/** 409 COUPON_CODE_EXISTS / INVALID_COUPON_SCOPE_REFERENCE. */
export function createCoupon(input: CouponInput) {
  return adminSend<ManagedCoupon>("/coupons", "POST", input);
}

export function updateCoupon(id: string, input: CouponInput) {
  return adminSend<ManagedCoupon>(`/coupons/${encodeId(id)}`, "PATCH", input);
}

export function updateCouponStatus(id: string, input: CouponStatusInput) {
  return adminSend<ManagedCoupon>(`/coupons/${encodeId(id)}/status`, "PATCH", input);
}

export function deleteCoupon(id: string) {
  return adminSend<{ deleted: true }>(`/coupons/${encodeId(id)}`, "DELETE");
}
