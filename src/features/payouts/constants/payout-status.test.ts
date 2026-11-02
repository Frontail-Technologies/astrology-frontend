import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { payoutFailureReasonLabel, payoutFailureReasonLabels, payoutProviderLabel, payoutProviderLabels } from "./payout-status.ts";

describe("payout option labels", () => {
  it("labels known providers and failure reasons", () => {
    assert.equal(payoutProviderLabel("upi"), "UPI");
    assert.equal(payoutProviderLabel("bank_transfer"), "Bank transfer");
    assert.equal(payoutFailureReasonLabel("bank_rejected"), "Rejected by the bank");
  });

  it("shows custom stored values as written", () => {
    assert.equal(payoutProviderLabel("HDFC manual"), "HDFC manual");
    assert.equal(payoutFailureReasonLabel("Wrong IFSC"), "Wrong IFSC");
  });

  it("keeps keys inside the API length limits", () => {
    for (const key of Object.keys(payoutProviderLabels)) assert.ok(key.length >= 1 && key.length <= 40, key);
    for (const key of Object.keys(payoutFailureReasonLabels)) assert.ok(key.length >= 1 && key.length <= 160, key);
  });
});
