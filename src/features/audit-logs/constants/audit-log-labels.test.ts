import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { auditActionPickerOptions, auditActionTone, auditEntityPickerOptions } from "./audit-log-labels.ts";
import { auditActionValues, auditEntityTypeValues } from "../types/audit-log-admin.ts";

describe("audit picker options", () => {
  it("lists every action once, grouped by entity and labelled without raw keys", () => {
    assert.equal(auditActionPickerOptions.length, auditActionValues.length);
    assert.equal(new Set(auditActionPickerOptions.map((option) => option.value)).size, auditActionValues.length);
    const groups = auditActionPickerOptions.map((option) => option.description ?? "");
    assert.deepEqual(groups, [...groups].sort((a, b) => a.localeCompare(b)));
    for (const option of auditActionPickerOptions) {
      assert.doesNotMatch(option.label, /[._]/);
      assert.doesNotMatch(option.description ?? "", /[._]/);
    }
    const scheduled = auditActionPickerOptions.find((option) => option.value === "pooja_request.scheduled");
    assert.deepEqual(scheduled, { value: "pooja_request.scheduled", label: "Scheduled", description: "Pooja request" });
  });

  it("lists every entity type with a human label", () => {
    assert.equal(auditEntityPickerOptions.length, auditEntityTypeValues.length);
    assert.ok(auditEntityPickerOptions.every((option) => !option.label.includes("_")));
  });

  it("maps actions to semantic tones", () => {
    assert.equal(auditActionTone("coupon.deleted"), "danger");
    assert.equal(auditActionTone("chat.transcript_accessed"), "warning");
    assert.equal(auditActionTone("coupon.created"), "info");
    assert.equal(auditActionTone("coupon.updated"), "neutral");
  });
});
