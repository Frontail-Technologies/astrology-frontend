import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatLoginPhone, isLoginPhone, normalizeLoginPhone } from "./astrologer-phone.ts";

describe("astrologer login phone", () => {
  it("adds +91 to Indian mobile numbers typed without a country code", () => {
    assert.equal(normalizeLoginPhone("98765 43210"), "+919876543210");
    assert.equal(normalizeLoginPhone("09876543210"), "+919876543210");
    assert.equal(normalizeLoginPhone("919876543210"), "+919876543210");
    assert.equal(normalizeLoginPhone("+91 (98765) 43210"), "+919876543210");
  });

  it("keeps international numbers and rejects invalid ones", () => {
    assert.equal(normalizeLoginPhone("+44 20 7946 0958"), "+442079460958");
    assert.equal(isLoginPhone("+442079460958"), true);
    assert.equal(isLoginPhone("12345"), false);
    assert.equal(isLoginPhone("+0123456789"), false);
  });

  it("formats Indian mobiles for display", () => {
    assert.equal(formatLoginPhone("+919876543210"), "+91 98765 43210");
    assert.equal(formatLoginPhone("+442079460958"), "+442079460958");
  });
});
