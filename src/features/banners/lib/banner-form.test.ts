import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAdminListState } from "../../admin/data/admin-list-state.ts";
import { bannerListConfig } from "../state/banner-list-state.ts";
import { bannerFormSchema, bannerFormToInput, bannerLinkError, bannerWindowError, emptyBannerForm, isSafeInternalPath } from "./banner-form.ts";

describe("banner link validation", () => {
  it("mirrors the backend internal-path rule", () => {
    for (const ok of ["/pooja", "/store/products?x=1#top", "/a/b-c"]) assert.equal(isSafeInternalPath(ok), true, ok);
    for (const bad of ["pooja", "//evil.com", "/a b", "/a\\b", "/a/../b", "/%2e%2e/x", "/%E0%A4%A"]) assert.equal(isSafeInternalPath(bad), false, bad);
  });

  it("requires a value matching the link type", () => {
    assert.equal(bannerLinkError("none", "/ignored"), null);
    assert.match(bannerLinkError("internal", " ") ?? "", /site path/);
    assert.equal(bannerLinkError("internal", " /pooja "), null);
    assert.ok(bannerLinkError("internal", "https://x.com"));
    assert.equal(bannerLinkError("external", "https://example.com/offer"), null);
    assert.ok(bannerLinkError("external", "javascript:alert(1)"));
    assert.ok(bannerLinkError("external", "/pooja"));
  });

  it("requires the end strictly after the start", () => {
    assert.equal(bannerWindowError(null, "2026-11-01T00:00:00.000+05:30"), null);
    assert.equal(bannerWindowError("2026-11-01T00:00:00.000+05:30", "2026-11-02T00:00:00.000+05:30"), null);
    assert.ok(bannerWindowError("2026-11-01T00:00:00.000+05:30", "2026-10-31T18:30:00.000Z"));
  });
});

describe("banner form", () => {
  const valid = { ...emptyBannerForm, title: "Diwali", imageUrl: "/uploads/d.png", placement: "homepage" };

  it("validates conditional link and schedule fields", () => {
    assert.equal(bannerFormSchema.safeParse(valid).success, true);
    const internal = bannerFormSchema.safeParse({ ...valid, linkType: "internal", linkValue: "" });
    assert.equal(internal.success, false);
    assert.deepEqual(internal.error?.issues.map((issue) => issue.path.join(".")), ["linkValue"]);
    const window = bannerFormSchema.safeParse({ ...valid, startsAt: "2026-11-02T00:00:00.000Z", endsAt: "2026-11-01T00:00:00.000Z" });
    assert.deepEqual(window.error?.issues.map((issue) => issue.path.join(".")), ["endsAt"]);
    assert.equal(bannerFormSchema.safeParse({ ...valid, placement: "Home Page" }).success, false);
    assert.equal(bannerFormSchema.safeParse({ ...valid, imageUrl: null }).success, false);
  });

  it("maps to the API body (null link value for no-link banners)", () => {
    assert.deepEqual(bannerFormToInput({ ...valid, subtitle: "  ", altText: " Lamp ", linkType: "none", linkValue: "/stale", sortOrder: " 3 " }), {
      title: "Diwali",
      subtitle: null,
      imageUrl: "/uploads/d.png",
      mobileImageUrl: null,
      altText: "Lamp",
      placement: "homepage",
      linkType: "none",
      linkValue: null,
      startsAt: null,
      endsAt: null,
      sortOrder: 3,
    });
    assert.equal(bannerFormToInput({ ...valid, linkType: "external", linkValue: " https://x.com " }).linkValue, "https://x.com");
  });

  it("list state accepts placement slugs only", () => {
    assert.deepEqual(parseAdminListState(new URLSearchParams("placement=home_page&dateState=upcoming"), bannerListConfig).filters, { placement: "home_page", dateState: "upcoming" });
    assert.deepEqual(parseAdminListState(new URLSearchParams("placement=Home&dateState=soon"), bannerListConfig).filters, {});
  });
});
