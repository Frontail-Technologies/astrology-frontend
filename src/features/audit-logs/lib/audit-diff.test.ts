import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { auditActionLabel, auditActionOptions, auditEntityHref, auditEntityOptions } from "../constants/audit-log-labels.ts";
import { auditActionValues, auditEntityTypeValues } from "../types/audit-log-admin.ts";
import { auditMetadataEntries, auditValuesEqual, buildAuditDiff, formatAuditValue, stableStringify, visibleAuditRows } from "./audit-diff.ts";

describe("buildAuditDiff", () => {
  it("returns no rows when both sides are empty", () => {
    assert.deepEqual(buildAuditDiff(null, null), []);
    assert.deepEqual(buildAuditDiff(undefined, null), []);
  });

  it("classifies changed, unchanged, added and removed fields in first-seen order", () => {
    const rows = buildAuditDiff({ status: "pending", name: "A", gone: 1 }, { status: "approved", name: "A", fresh: true });
    assert.deepEqual(rows, [
      { key: "status", before: "pending", after: "approved", kind: "changed" },
      { key: "name", before: "A", after: "A", kind: "unchanged" },
      { key: "gone", before: 1, after: undefined, kind: "removed" },
      { key: "fresh", before: undefined, after: true, kind: "added" },
    ]);
  });

  it("marks every field added on create (null before) and removed on delete (null after)", () => {
    assert.deepEqual(
      buildAuditDiff(null, { code: "X" }).map((row) => row.kind),
      ["added"],
    );
    assert.deepEqual(
      buildAuditDiff({ code: "X", active: false }, null).map((row) => row.kind),
      ["removed", "removed"],
    );
  });

  it("compares nested values structurally, ignoring key order", () => {
    const rows = buildAuditDiff({ details: { a: 1, b: [1, 2] } }, { details: { b: [1, 2], a: 1 } });
    assert.equal(rows[0].kind, "unchanged");
    assert.equal(buildAuditDiff({ list: [1, 2] }, { list: [2, 1] })[0].kind, "changed");
  });

  it("treats explicit null and a missing key differently", () => {
    assert.equal(buildAuditDiff({ note: null }, {})[0].kind, "removed");
    assert.equal(buildAuditDiff({ note: null }, { note: "x" })[0].kind, "changed");
  });

  it("falls back to a single value row for scalars and arrays", () => {
    assert.deepEqual(buildAuditDiff(5, 7), [{ key: "value", before: 5, after: 7, kind: "changed" }]);
    assert.deepEqual(buildAuditDiff(null, [1]), [{ key: "value", before: undefined, after: [1], kind: "added" }]);
  });
});

describe("audit diff helpers", () => {
  it("filters unchanged rows unless requested", () => {
    const rows = buildAuditDiff({ a: 1, b: 2 }, { a: 1, b: 3 });
    assert.deepEqual(
      visibleAuditRows(rows, false).map((row) => row.key),
      ["b"],
    );
    assert.equal(visibleAuditRows(rows, true).length, 2);
  });

  it("stringifies stably and compares values", () => {
    assert.equal(stableStringify({ b: 1, a: { d: 2, c: 3 } }), '{"a":{"c":3,"d":2},"b":1}');
    assert.equal(auditValuesEqual({ a: 1 }, { a: 1 }), true);
    assert.equal(auditValuesEqual(undefined, null), false);
  });

  it("formats values for display", () => {
    assert.equal(formatAuditValue(undefined), "—");
    assert.equal(formatAuditValue(null), "null");
    assert.equal(formatAuditValue(""), '""');
    assert.equal(formatAuditValue(12), "12");
    assert.equal(formatAuditValue(false), "false");
    assert.equal(formatAuditValue({ a: [1] }), '{"a":[1]}');
  });

  it("lists metadata entries", () => {
    assert.deepEqual(auditMetadataEntries(null), []);
    assert.deepEqual(auditMetadataEntries({ entity: "tags", key: "k" }), [
      ["entity", "tags"],
      ["key", "k"],
    ]);
    assert.deepEqual(auditMetadataEntries("x"), [["value", "x"]]);
  });
});

describe("audit labels and links", () => {
  it("labels every action and entity type", () => {
    assert.equal(Object.keys(auditActionOptions).length, auditActionValues.length);
    assert.equal(Object.keys(auditEntityOptions).length, auditEntityTypeValues.length);
    assert.equal(auditActionLabel("pooja_request.status_changed"), "Pooja request · Status changed");
    assert.equal(auditActionLabel("chat.transcript_accessed"), "Chat · Transcript viewed");
    assert.equal(auditActionLabel("support.admin_replied"), "Support ticket · Admin replied");
  });

  const id = "6f1c2e2a-1b7d-4c55-9a51-0e6a1c1f8b10";
  it("links records with admin routes", () => {
    assert.equal(auditEntityHref({ entityType: "review", entityId: id, metadata: null, before: null, after: null }), `/admin/reviews/${id}`);
    assert.equal(auditEntityHref({ entityType: "product", entityId: id, metadata: null, before: null, after: null }), `/admin/store/products/${id}`);
    assert.equal(auditEntityHref({ entityType: "settings", entityId: null, metadata: null, before: null, after: null }), "/admin/settings");
    assert.equal(auditEntityHref({ entityType: "media", entityId: id, metadata: null, before: null, after: null }), null);
    assert.equal(auditEntityHref({ entityType: "review", entityId: null, metadata: null, before: null, after: null }), null);
  });

  it("links master data via metadata and wallets via the owner id", () => {
    assert.equal(
      auditEntityHref({ entityType: "master_data", entityId: null, metadata: { entity: "consultation-modes", key: "chat" }, before: null, after: null }),
      "/admin/master-data/consultation-modes/chat/edit",
    );
    assert.equal(auditEntityHref({ entityType: "master_data", entityId: id, metadata: { entity: "nope", key: id }, before: null, after: null }), null);
    assert.equal(auditEntityHref({ entityType: "wallet", entityId: id, metadata: null, before: null, after: { userId: "u1" } }), "/admin/wallets/u1");
  });
});
