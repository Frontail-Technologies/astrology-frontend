import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fromInput, settingOptions, specFor, toInput } from "./settings-fields.ts";

describe("settings field conversion", () => {
  it("converts shipping rupees to paise and back", () => {
    const spec = specFor("store.standardShippingPaise");
    assert.deepEqual(fromInput(spec, "49.50"), { value: 4_950 });
    assert.equal(toInput(spec, 4_950), "49.50");
  });

  it("treats empty nullable fields as null and required fields as errors", () => {
    assert.deepEqual(fromInput(specFor("store.freeShippingThresholdPaise"), ""), { value: null });
    assert.deepEqual(fromInput(specFor("general.supportEmail"), " "), { value: null });
    assert.ok("error" in fromInput(specFor("general.siteName"), ""));
  });

  it("maps commission percent to basis points", () => {
    const spec = specFor("consultations.platformCommissionBps");
    assert.deepEqual(fromInput(spec, "20"), { value: 2_000 });
    assert.deepEqual(fromInput(spec, "12.5"), { value: 1_250 });
    assert.equal(toInput(spec, 2_000), "20");
    assert.ok("error" in fromInput(spec, "abc"));
  });

  it("rejects non-integers and keeps unknown keys read-only", () => {
    assert.ok("error" in fromInput(specFor("content.defaultPageSize"), "2.5"));
    assert.equal(specFor("payments.razorpaySecret").kind, "readonly");
    assert.ok("error" in fromInput(specFor("store.currency"), "USD"));
  });
});

describe("setting select options", () => {
  it("offers page size presets and keeps an unlisted current value selectable", () => {
    const spec = specFor("content.defaultPageSize");
    assert.equal(settingOptions(spec, "20")?.["20"], "20 per page");
    const withCurrent = settingOptions(spec, "15");
    assert.equal(withCurrent?.["15"], "15 (current)");
    assert.deepEqual(fromInput(spec, "24"), { value: 24 });
  });

  it("returns null for specs without options", () => {
    assert.equal(settingOptions(specFor("general.siteName"), "Astro"), null);
  });
});

describe("specFor fallback", () => {
  it("labels unknown keys in plain words, never as the raw key", () => {
    assert.equal(specFor("store.someNewSetting").label, "Some new setting");
    assert.equal(specFor("store.lowStockThreshold").label, "Low-stock alert at");
  });
});
