import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isoToLocalInput, localInputToIso, sameInstant } from "./admin-datetime.ts";
import { hasValuePath, mapAdminFieldErrors, normalizeFieldPath } from "./admin-field-errors.ts";
import { addGalleryImages, moveGalleryImage, normalizeGallery, removeGalleryImage, setGalleryAlt, setGalleryPrimary } from "./admin-gallery.ts";
import { normalizeAdminError } from "./admin-errors.ts";
import { toLocalIsoWithOffset } from "./admin-list-state.ts";
import {
  adminRangeQuery,
  isValidCustomRange,
  parseAdminRange,
  resolveAdminRange,
  serializeAdminRange,
  suggestGranularity,
} from "./admin-range.ts";
import { buildTransitionActions, humanizeStatus, isFinalState } from "./admin-transitions.ts";
import {
  isStorableImageUrl,
  normalizeImageUrlInput,
  resolveMediaUrl,
  validateImageFile,
} from "../../media/media-constraints.ts";

describe("admin field error mapping", () => {
  it("normalizes server paths", () => {
    assert.equal(normalizeFieldPath("body.name"), "name");
    assert.equal(normalizeFieldPath("name"), "name");
    assert.equal(normalizeFieldPath("items[0].alt"), "items.0.alt");
    assert.equal(normalizeFieldPath("query.from"), "from");
    assert.equal(normalizeFieldPath(""), "");
  });

  it("maps errors produced by normalizeAdminError to fields", () => {
    const error = normalizeAdminError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid request",
      details: [
        { path: ["body", "name"], message: "Required" },
        { path: ["body", "content", "overview", 0], message: "Too short" },
        { path: [], message: "Starts must be before ends" },
      ],
    });
    const values = { name: "", content: { overview: ["x"] } };
    const mapped = mapAdminFieldErrors(error.fieldErrors, { isField: (path) => hasValuePath(values, path) });
    assert.deepEqual(mapped.fields, [
      { name: "name", message: "Required" },
      { name: "content.overview.0", message: "Too short" },
    ]);
    assert.deepEqual(mapped.formMessages, ["Starts must be before ends"]);
  });

  it("falls back to the nearest parent field and to form messages", () => {
    const values = { tags: [] as string[], title: "a" };
    const mapped = mapAdminFieldErrors(
      [
        { path: "tags.3", message: "Unknown tag" },
        { path: "slug", message: "Slug taken" },
        { path: "title", message: "First" },
        { path: "title", message: "Second" },
      ],
      { isField: (path) => hasValuePath(values, path) },
    );
    assert.deepEqual(mapped.fields, [
      { name: "tags", message: "Unknown tag" },
      { name: "title", message: "First" },
    ]);
    assert.deepEqual(mapped.formMessages, ["Slug taken"]);
  });

  it("applies aliases and keeps paths without a predicate", () => {
    const mapped = mapAdminFieldErrors([{ path: "categoryIds.1", message: "Bad" }, { path: "x.y", message: "Y" }], {
      fieldAliases: { categoryIds: "categories" },
    });
    assert.deepEqual(mapped.fields, [
      { name: "categories", message: "Bad" },
      { name: "x.y", message: "Y" },
    ]);
  });

  it("detects value paths including null leaves", () => {
    assert.equal(hasValuePath({ a: { b: null } }, "a.b"), true);
    assert.equal(hasValuePath({ a: [1, 2] }, "a.1"), true);
    assert.equal(hasValuePath({ a: [1, 2] }, "a.2"), false);
    assert.equal(hasValuePath({ a: 1 }, "a.b"), false);
  });
});

describe("admin datetime conversion", () => {
  it("round-trips a local input value", () => {
    const iso = localInputToIso("2026-11-01T09:30");
    assert.ok(iso);
    assert.equal(iso, toLocalIsoWithOffset(new Date(2026, 10, 1, 9, 30)));
    assert.equal(isoToLocalInput(iso), "2026-11-01T09:30");
  });

  it("converts an ISO value in another offset to local wall time", () => {
    const date = new Date("2026-11-01T04:00:00.000Z");
    const expected = isoToLocalInput(toLocalIsoWithOffset(date));
    assert.equal(isoToLocalInput("2026-11-01T04:00:00.000Z"), expected);
    assert.ok(sameInstant(localInputToIso(expected), date.toISOString()));
  });

  it("rejects empty and invalid values", () => {
    for (const value of ["", null, undefined, "2026-02-30T10:00", "2026-11-01", "2026-11-01T25:00", "abc"]) {
      assert.equal(localInputToIso(value), null, String(value));
    }
    assert.equal(isoToLocalInput(null), "");
    assert.equal(isoToLocalInput("not a date"), "");
  });

  it("compares instants", () => {
    assert.equal(sameInstant(null, ""), true);
    assert.equal(sameInstant("2026-11-01T00:00:00.000Z", "2026-11-01T05:30:00.000+05:30"), true);
    assert.equal(sameInstant("2026-11-01T00:00:00.000Z", null), false);
  });
});

describe("admin range presets", () => {
  const now = new Date(2026, 10, 15, 14, 0, 0);

  it("resolves presets to whole local days", () => {
    const range = resolveAdminRange({ preset: "7d", customFrom: "", customTo: "" }, now);
    assert.equal(range.from, toLocalIsoWithOffset(new Date(2026, 10, 9, 0, 0, 0, 0)));
    assert.equal(range.to, toLocalIsoWithOffset(new Date(2026, 10, 15, 23, 59, 59, 999)));
    assert.equal(range.days, 7);
    assert.equal(range.granularity, "day");
    assert.equal(resolveAdminRange({ preset: "90d", customFrom: "", customTo: "" }, now).granularity, "week");
  });

  it("resolves a valid custom range and falls back to 30d otherwise", () => {
    const custom = resolveAdminRange({ preset: "custom", customFrom: "2025-01-01", customTo: "2025-12-31" }, now);
    assert.equal(custom.preset, "custom");
    assert.equal(custom.days, 365);
    assert.equal(custom.granularity, "month");
    assert.equal(custom.from, toLocalIsoWithOffset(new Date(2025, 0, 1)));
    const reversed = resolveAdminRange({ preset: "custom", customFrom: "2026-02-01", customTo: "2026-01-01" }, now);
    assert.equal(reversed.preset, "30d");
    assert.equal(reversed.days, 30);
    assert.deepEqual(Object.keys(adminRangeQuery({ preset: "7d", customFrom: "", customTo: "" }, now)), ["from", "to"]);
  });

  it("validates custom ranges (ordered, real dates, at most two years)", () => {
    assert.equal(isValidCustomRange("2026-01-01", "2026-01-01"), true);
    assert.equal(isValidCustomRange("2026-02-30", "2026-03-01"), false);
    assert.equal(isValidCustomRange("2023-01-01", "2026-01-01"), false);
    assert.equal(isValidCustomRange("", "2026-01-01"), false);
  });

  it("suggests granularity", () => {
    assert.equal(suggestGranularity(31), "day");
    assert.equal(suggestGranularity(32), "week");
    assert.equal(suggestGranularity(183), "month");
  });

  it("parses and serializes URL state", () => {
    const params = (text: string) => new URLSearchParams(text);
    assert.deepEqual(parseAdminRange(params("range=7d")), { preset: "7d", customFrom: "", customTo: "" });
    assert.deepEqual(parseAdminRange(params("range=custom&from=2026-01-01&to=2026-01-31")), {
      preset: "custom",
      customFrom: "2026-01-01",
      customTo: "2026-01-31",
    });
    assert.equal(parseAdminRange(params("range=custom&from=bad")).preset, "30d");
    assert.equal(parseAdminRange(params("range=1y")).preset, "30d");
    assert.equal(serializeAdminRange({ preset: "30d", customFrom: "", customTo: "" }).toString(), "");
    assert.equal(serializeAdminRange({ preset: "7d", customFrom: "", customTo: "" }).toString(), "range=7d");
    assert.equal(
      serializeAdminRange({ preset: "custom", customFrom: "2026-01-01", customTo: "2026-01-31" }).toString(),
      "range=custom&from=2026-01-01&to=2026-01-31",
    );
  });
});

describe("admin transitions", () => {
  it("orders, labels and flags server transitions", () => {
    const actions = buildTransitionActions(["cancelled", "confirmed", "cancelled", "in_progress"] as const, {
      labels: { cancelled: "Cancel", confirmed: "Confirm" },
      variants: { cancelled: "destructive" },
      descriptions: { cancelled: "The customer is notified." },
      requiresReason: ["cancelled"],
      order: ["confirmed", "cancelled"],
    });
    assert.deepEqual(actions, [
      { target: "confirmed", label: "Confirm", variant: "outline", requiresReason: false },
      { target: "cancelled", label: "Cancel", variant: "destructive", description: "The customer is notified.", requiresReason: true },
      { target: "in_progress", label: "In progress", variant: "outline", requiresReason: false },
    ]);
  });

  it("detects final states and humanizes", () => {
    assert.equal(isFinalState([]), true);
    assert.equal(isFinalState(undefined), true);
    assert.equal(isFinalState(["open"]), false);
    assert.equal(humanizeStatus("awaiting_payment"), "Awaiting payment");
    assert.deepEqual(buildTransitionActions([], { labels: {} }), []);
    assert.equal(buildTransitionActions(["a", "b"], { labels: {}, requiresReason: (target) => target === "b" })[1].requiresReason, true);
  });
});

describe("admin gallery operations", () => {
  const img = (url: string, isPrimary = false) => ({ url, alt: "", isPrimary });

  it("keeps exactly one primary", () => {
    assert.deepEqual(normalizeGallery([img("a"), img("b")]).map((i) => i.isPrimary), [true, false]);
    assert.deepEqual(normalizeGallery([img("a", true), img("b", true)]).map((i) => i.isPrimary), [true, false]);
    assert.deepEqual(normalizeGallery([]), []);
  });

  it("adds within max, removes, moves and sets primary", () => {
    let gallery = addGalleryImages([], [img("a"), img("b"), img("c", true)], 2);
    assert.deepEqual(gallery.map((i) => [i.url, i.isPrimary]), [["a", true], ["b", false]]);
    gallery = setGalleryPrimary(gallery, 1);
    assert.deepEqual(gallery.map((i) => i.isPrimary), [false, true]);
    gallery = moveGalleryImage(gallery, 1, -1);
    assert.deepEqual(gallery.map((i) => [i.url, i.isPrimary]), [["b", true], ["a", false]]);
    assert.deepEqual(moveGalleryImage(gallery, 0, -1).map((i) => i.url), ["b", "a"]);
    gallery = removeGalleryImage(gallery, 0);
    assert.deepEqual(gallery.map((i) => [i.url, i.isPrimary]), [["a", true]]);
    assert.equal(setGalleryAlt(gallery, 0, "Front")[0].alt, "Front");
  });
});

describe("media constraints", () => {
  it("validates files", () => {
    assert.equal(validateImageFile({ type: "image/png", size: 1000 }), null);
    assert.match(validateImageFile({ type: "image/gif", size: 1000 }) ?? "", /JPEG/);
    assert.match(validateImageFile({ type: "image/webp", size: 6 * 1024 * 1024 }) ?? "", /5 MB/);
  });

  it("accepts only root paths and http(s) URLs", () => {
    assert.equal(normalizeImageUrlInput(" /uploads/a.webp "), "/uploads/a.webp");
    assert.equal(normalizeImageUrlInput("https://cdn.example.com/a.png"), "https://cdn.example.com/a.png");
    for (const value of ["blob:http://x/1", "data:image/png;base64,AA", "javascript:alert(1)", "//evil.com/a", "a.png", "/a b.png", ""]) {
      assert.equal(normalizeImageUrlInput(value), null, value);
    }
    assert.equal(isStorableImageUrl("data:image/png;base64,AA"), false);
  });

  it("resolves API upload paths against the API origin", () => {
    assert.equal(resolveMediaUrl("/uploads/a.webp", "http://api:4000/"), "http://api:4000/uploads/a.webp");
    assert.equal(resolveMediaUrl("/assets/a.webp", "http://api:4000"), "/assets/a.webp");
    assert.equal(resolveMediaUrl("https://x.test/a.webp", "http://api:4000"), "https://x.test/a.webp");
    assert.equal(resolveMediaUrl("blob:abc", "http://api:4000"), null);
  });
});
