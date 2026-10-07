export type CouponDiscountType = "percentage" | "flat";
export type CouponStatus = "draft" | "active" | "scheduled" | "inactive" | "expired";
export type CouponApplicability = "all-services" | "consultations" | "poojas" | "store-products";
export type Coupon = { id: string; code: string; title: string; description?: string; color?: string; discountType: CouponDiscountType; discountValue: number; minimumOrderAmountInPaise?: number; maximumDiscountInPaise?: number; usageLimit?: number; usageCount: number; perUserLimit?: number; applicableTo: CouponApplicability; status: CouponStatus; startsAt?: string; endsAt?: string; createdAt: string; updatedAt: string; };
