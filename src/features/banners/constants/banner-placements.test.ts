import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BANNER_PLACEMENT_PATTERN, bannerPlacementFilterOptions, bannerPlacementLabel, bannerPlacementLabels, isBannerPlacementFilter } from "./banner-status.ts";

describe("banner placements", () => {
  it("canonical keys satisfy the backend placement rule", () => {
    for (const key of Object.keys(bannerPlacementLabels)) {
      assert.equal(BANNER_PLACEMENT_PATTERN.test(key), true, key);
      assert.equal(isBannerPlacementFilter(key), true, key);
    }
  });

  it("covers every public area and keeps the original keys", () => {
    for (const key of ["homepage_hero", "homepage_secondary", "store_top", "pooja_top", "consultation_top", "horoscope_top"]) {
      assert.equal(Object.hasOwn(bannerPlacementLabels, key), true, key);
    }
    for (const area of ["site_", "homepage_", "astrolog", "horoscope_", "pooja_", "store_", "calculator", "article"]) {
      assert.equal(Object.keys(bannerPlacementLabels).some((key) => key.startsWith(area)), true, area);
    }
  });

  it("labels canonical keys and shows custom keys as written", () => {
    assert.equal(bannerPlacementLabel("homepage_hero"), "Homepage hero");
    assert.equal(bannerPlacementLabel("diwali_strip"), "diwali_strip");
    assert.equal(bannerPlacementLabel("constructor"), "constructor");
  });

  it("keeps a custom URL value visible in the filter options", () => {
    assert.deepEqual(bannerPlacementFilterOptions(undefined), bannerPlacementLabels);
    assert.deepEqual(bannerPlacementFilterOptions("store_top"), bannerPlacementLabels);
    const custom = bannerPlacementFilterOptions("home_hero");
    assert.equal(custom.home_hero, "home_hero");
    assert.equal(Object.keys(custom).length, Object.keys(bannerPlacementLabels).length + 1);
    assert.equal(Object.keys(bannerPlacementFilterOptions("toString")).includes("toString"), true);
  });
});
