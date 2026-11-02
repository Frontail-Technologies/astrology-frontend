import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAdminListState, toAdminListQuery } from "../../admin/data/admin-list-state.ts";
import { articleListConfig } from "../state/article-list-state.ts";
import type { ManagedArticle } from "../types/article-admin.ts";
import { articleFormToInput, articleParagraphs, articleTagChoices, articleToFormValues, isFutureInstant } from "./article-form.ts";

const article: ManagedArticle = {
  id: "a1",
  title: "Title",
  slug: "title",
  excerpt: null,
  content: "Body",
  heroImageUrl: "/uploads/a.png",
  category: null,
  authorName: "Asha",
  status: "draft",
  publishedAt: null,
  scheduledAt: null,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  tags: [{ id: "t1", name: "Vedic", slug: "vedic" }],
  allowedTransitions: ["published", "scheduled", "archived"],
};

describe("article form mapping", () => {
  it("round-trips an article and turns empty optional text into null", () => {
    const values = articleToFormValues(article);
    assert.deepEqual(values, { title: "Title", excerpt: "", content: "Body", heroImageUrl: "/uploads/a.png", category: "", authorName: "Asha", tagIds: ["t1"] });
    assert.deepEqual(articleFormToInput({ ...values, title: "  New  ", excerpt: "  ", category: " Guides ", tagIds: ["t1", "t1", "t2"] }), {
      title: "New",
      excerpt: null,
      content: "Body",
      heroImageUrl: "/uploads/a.png",
      category: "Guides",
      authorName: "Asha",
      tagIds: ["t1", "t2"],
    });
  });

  it("keeps attached tags that are no longer active, flagged inactive", () => {
    const choices = articleTagChoices(
      [
        { id: "t2", name: "Remedies", slug: "remedies", active: true },
        { id: null, name: "ignored", slug: "ignored", active: true },
      ],
      article.tags,
    );
    assert.deepEqual(choices, [
      { id: "t2", name: "Remedies", slug: "remedies", active: true },
      { id: "t1", name: "Vedic", slug: "vedic", active: false },
    ]);
  });

  it("splits content into plain-text paragraphs", () => {
    assert.deepEqual(articleParagraphs("One\r\nline two\n\n\n  Two  \n \nThree"), ["One\nline two", "Two", "Three"]);
    assert.deepEqual(articleParagraphs("<b>raw</b>"), ["<b>raw</b>"]);
  });
});

describe("article list state", () => {
  const params = (query: string) => new URLSearchParams(query);
  it("accepts free-form category text and tag slugs, rejects invalid values", () => {
    const state = parseAdminListState(params("status=scheduled&category=Relationships&tag=vedic-basics"), articleListConfig);
    assert.deepEqual(state.filters, { status: "scheduled", category: "Relationships", tag: "vedic-basics" });
    assert.deepEqual(toAdminListQuery(state, articleListConfig), { page: 1, limit: 20, status: "scheduled", category: "Relationships", tag: "vedic-basics" });
    const bad = parseAdminListState(params("status=live&category=%20x&tag=Not%20A%20Slug"), articleListConfig);
    assert.deepEqual(bad.filters, {});
  });
});

describe("schedule time", () => {
  it("must be a valid future instant", () => {
    const now = Date.parse("2026-11-01T00:00:00.000Z");
    assert.equal(isFutureInstant("2026-11-01T05:31:00.000+05:30", now), true);
    assert.equal(isFutureInstant("2026-11-01T05:29:00.000+05:30", now), false);
    assert.equal(isFutureInstant(null, now), false);
    assert.equal(isFutureInstant("nope", now), false);
  });
});
