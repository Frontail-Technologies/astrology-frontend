import { z } from "zod";

import { COUPON_LIMITS, couponDiscountTypes, couponScopes } from "@/features/coupons/constants/coupon-status";
import { COUPON_CODE_PATTERN, COUPON_COLOR_PATTERN, normalizeCouponCode, validateCouponRules, type CouponFormValues } from "@/features/coupons/lib/coupon-form";

const paise = z
  .number({ error: "Enter a valid amount." })
  .int()
  .nonnegative({ error: "Amount cannot be negative." })
  .max(COUPON_LIMITS.maxPaise, { error: "Amount is too high." })
  .nullable();

/** Mirrors `createCouponBodySchema` in `api/src/modules/coupons/coupon.validation.ts`. */
export const couponEditorSchema: z.ZodType<CouponFormValues, CouponFormValues> = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, { error: "Use at least 2 characters." })
      .max(64, { error: "Use at most 64 characters." })
      .refine((value) => COUPON_CODE_PATTERN.test(normalizeCouponCode(value)), { error: "Use letters, numbers, hyphens and underscores only." }),
    name: z.string().trim().min(1, { error: "Enter a name." }).max(180, { error: "Keep the name under 180 characters." }),
    description: z.string().max(5000, { error: "Keep the description under 5,000 characters." }),
    discountType: z.enum(couponDiscountTypes),
    // NaN (invalid text) passes here so `validateCouponRules` reports one friendly message.
    discountValue: z.union([z.number(), z.nan(), z.null()]),
    maxDiscountPaise: paise,
    minOrderPaise: paise,
    usageLimit: z.string(),
    perCustomerLimit: z.string(),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
    active: z.boolean(),
    scope: z.enum(couponScopes),
    categoryIds: z.array(z.string()).max(COUPON_LIMITS.maxCategories, { error: `Select at most ${COUPON_LIMITS.maxCategories} categories.` }),
    productIds: z.array(z.string()).max(COUPON_LIMITS.maxProducts, { error: `Select at most ${COUPON_LIMITS.maxProducts} products.` }),
    color: z.string().refine((value) => value === "" || COUPON_COLOR_PATTERN.test(value), { error: "Use a #RRGGBB colour." }),
  })
  .superRefine((values, context) => {
    for (const issue of validateCouponRules(values)) context.addIssue({ code: "custom", path: [issue.path], message: issue.message });
  });
