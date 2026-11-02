import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { paymentMethodLabel, paymentProviderLabel } from "./payment-status.ts";

describe("payment labels", () => {
  it("labels known providers and methods", () => {
    assert.equal(paymentProviderLabel("razorpay"), "Razorpay");
    assert.equal(paymentMethodLabel("upi"), "UPI");
    assert.equal(paymentMethodLabel("netbanking"), "Net banking");
  });

  it("makes unknown values readable", () => {
    assert.equal(paymentProviderLabel("cash_free"), "Cash free");
    assert.equal(paymentMethodLabel("bank-cheque"), "Bank cheque");
  });
});
