import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { personInitials, personPrimaryLabel, personSecondaryLabel } from "./customer-display.ts";

describe("customer display helpers", () => {
  it("falls back from name to email to phone for the primary label", () => {
    assert.equal(personPrimaryLabel({ name: "Asha Rao", email: "asha@example.com" }), "Asha Rao");
    assert.equal(personPrimaryLabel({ name: "  ", email: "asha@example.com" }), "asha@example.com");
    assert.equal(personPrimaryLabel({ phone: "+91 98765 43210" }), "+91 98765 43210");
    assert.equal(personPrimaryLabel({}), "Customer");
    assert.equal(personPrimaryLabel({}, "Unknown"), "Unknown");
  });

  it("never repeats the primary label in the secondary line", () => {
    assert.equal(personSecondaryLabel({ name: "Asha", email: "asha@example.com" }), "asha@example.com");
    assert.equal(personSecondaryLabel({ name: "Asha", phone: "123" }), "123");
    assert.equal(personSecondaryLabel({ email: "asha@example.com", phone: "123" }), "123");
    assert.equal(personSecondaryLabel({ email: "asha@example.com" }), null);
    assert.equal(personSecondaryLabel({ phone: "123" }), null);
  });

  it("derives initials from name, email or phone and never returns a question mark", () => {
    assert.equal(personInitials({ name: "Asha Devi Rao" }), "AR");
    assert.equal(personInitials({ name: "asha" }), "AS");
    assert.equal(personInitials({ email: "ravi.kumar@example.com" }), "RK");
    assert.equal(personInitials({ email: "ravi_k+test@example.com" }), "RT");
    assert.equal(personInitials({ email: "anil@example.com" }), "AN");
    assert.equal(personInitials({ phone: "+91 98765 43210" }), "10");
    assert.equal(personInitials({}), "CU");
    assert.equal(personInitials({ email: "...@example.com" }), "CU");
  });
});
