import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ManagedCoupon } from "../types/coupon-admin.ts";
import {
  couponDisplayState,
  couponToFormValues,
  formToCouponInput,
  generateCouponCode,
  normalizeCouponCode,
  parseLimit,
  validateCouponRules,
  validateCouponScope,
  type CouponFormValues,
} from "./coupon-form.ts";

const base = (): CouponFormValues => ({ ...couponToFormValues(null), code: "diwali-10", name: "Diwali", discountValue: 10 });

describe("coupon scope validation", () => {
  it("requires ids for scoped coupons only", () => {
    assert.deepEqual(validateCouponScope({ scope: "all_products", categoryIds: [], productIds: [] }), []);
    assert.deepEqual(validateCouponScope({ scope: "consultations", categoryIds: [], productIds: [] }), []);
    assert.deepEqual(validateCouponScope({ scope: "selected_categories", categoryIds: [], productIds: ["p"] }), [{ path: "categoryIds", message: "Select at least one category." }]);
    assert.deepEqual(validateCouponScope({ scope: "selected_products", categoryIds: ["c"], productIds: [] }), [{ path: "productIds", message: "Select at least one product." }]);
    assert.deepEqual(validateCouponScope({ scope: "selected_products", categoryIds: [], productIds: ["p"] }), []);
  });

  it("sends only the ids that match the scope", () => {
    const values = { ...base(), categoryIds: ["c1"], productIds: ["p1", "p1"] };
    assert.deepEqual(formToCouponInput({ ...values, scope: "selected_products" }).productIds, ["p1"]);
    assert.deepEqual(formToCouponInput({ ...values, scope: "selected_products" }).categoryIds, []);
    assert.deepEqual(formToCouponInput({ ...values, scope: "selected_categories" }).productIds, []);
    const consultations = formToCouponInput({ ...values, scope: "consultations" });
    assert.deepEqual([consultations.categoryIds, consultations.productIds], [[], []]);
    const all = formToCouponInput({ ...values, scope: "all_products" });
    assert.deepEqual([all.categoryIds, all.productIds], [[], []]);
  });
});

describe("coupon rules", () => {
  it("checks the discount value per type", () => {
    assert.deepEqual(validateCouponRules(base()), []);
    assert.equal(validateCouponRules({ ...base(), discountValue: 101 })[0]?.path, "discountValue");
    assert.equal(validateCouponRules({ ...base(), discountValue: Number.NaN })[0]?.path, "discountValue");
    assert.equal(validateCouponRules({ ...base(), discountValue: null })[0]?.path, "discountValue");
    assert.deepEqual(validateCouponRules({ ...base(), discountType: "fixed", discountValue: 50_000 }), []);
  });

  it("checks limits and the validity window", () => {
    assert.equal(validateCouponRules({ ...base(), usageLimit: "0" })[0]?.path, "usageLimit");
    assert.equal(validateCouponRules({ ...base(), perCustomerLimit: "1.5" })[0]?.path, "perCustomerLimit");
    const window = { startsAt: "2026-11-02T10:00:00.000+05:30", endsAt: "2026-11-02T10:00:00.000+05:30" };
    assert.equal(validateCouponRules({ ...base(), ...window })[0]?.path, "endsAt");
    assert.deepEqual(validateCouponRules({ ...base(), ...window, endsAt: "2026-11-03T10:00:00.000+05:30" }), []);
  });

  it("parses limits", () => {
    assert.equal(parseLimit(""), null);
    assert.equal(parseLimit(" 25 "), 25);
    assert.ok(Number.isNaN(parseLimit("-1")));
  });
});

describe("coupon payload", () => {
  it("normalizes text, colour and drops the cap for fixed coupons", () => {
    const input = formToCouponInput({ ...base(), code: " diwali 10 ", description: "  ", color: "#c76a35", discountType: "fixed", discountValue: 5000, maxDiscountPaise: 100, usageLimit: "100" });
    assert.equal(input.code, "DIWALI10");
    assert.equal(input.description, null);
    assert.equal(input.color, "#C76A35");
    assert.equal(input.maxDiscountPaise, null);
    assert.equal(input.usageLimit, 100);
    assert.equal(input.perCustomerLimit, null);
    assert.equal(formToCouponInput({ ...base(), color: "" }).color, null);
  });

  it("round-trips an existing coupon", () => {
    const coupon: ManagedCoupon = {
      id: "c",
      code: "SAVE",
      name: "Save",
      description: null,
      discountType: "percentage",
      discountValue: 15,
      maxDiscountPaise: 20_000,
      minOrderPaise: 100_000,
      usageLimit: 50,
      perCustomerLimit: 1,
      startsAt: null,
      endsAt: "2026-12-31T18:29:59.000Z",
      active: true,
      scope: "selected_categories",
      color: "#467DA8",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
      categoryIds: ["c1"],
      productIds: [],
      usageCount: 3,
    };
    const expected: Partial<ManagedCoupon> = { ...coupon };
    for (const key of ["id", "createdAt", "updatedAt", "usageCount"] as const) delete expected[key];
    assert.deepEqual(formToCouponInput(couponToFormValues(coupon)), expected);
  });

  it("normalizes and generates codes", () => {
    assert.equal(normalizeCouponCode("ab c-1"), "ABC-1");
    assert.equal(generateCouponCode("X", () => 0), "XAAAA");
    assert.match(generateCouponCode(), /^OFFER[A-Z2-9]{4}$/);
  });
});

describe("coupon display state", () => {
  const now = new Date("2026-11-01T12:00:00.000Z");
  const coupon = { active: true, startsAt: null, endsAt: null, usageLimit: null, usageCount: 0 };
  it("derives the state", () => {
    assert.equal(couponDisplayState(coupon, now), "running");
    assert.equal(couponDisplayState({ ...coupon, active: false }, now), "inactive");
    assert.equal(couponDisplayState({ ...coupon, startsAt: "2026-11-02T00:00:00.000Z" }, now), "upcoming");
    assert.equal(couponDisplayState({ ...coupon, endsAt: "2026-11-01T00:00:00.000Z" }, now), "expired");
    assert.equal(couponDisplayState({ ...coupon, usageLimit: 3, usageCount: 3 }, now), "exhausted");
  });
});
