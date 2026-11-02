import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ARTICLE_LIMITS, articleCategories, articleCategoryFilterOptions, articleCategoryOptions, isArticleCategoryFilter } from "./article-status.ts";

describe("article categories", () => {
  it("stores each canonical category as its own label", () => {
    for (const category of articleCategories) {
      assert.equal(articleCategoryOptions[category], category);
      assert.ok(category.length <= ARTICLE_LIMITS.category);
      assert.equal(isArticleCategoryFilter(category), true, category);
    }
  });

  it("keeps a custom URL value visible in the filter options", () => {
    assert.deepEqual(articleCategoryFilterOptions(undefined), articleCategoryOptions);
    assert.deepEqual(articleCategoryFilterOptions("Remedies"), articleCategoryOptions);
    assert.equal(articleCategoryFilterOptions("Vastu")["Vastu"], "Vastu");
  });
});
