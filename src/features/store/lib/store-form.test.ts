import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAdminListState, toAdminListQuery } from "../../admin/data/admin-list-state.ts";
import { storeProductListConfig } from "../state/store-list-state.ts";
import type { ManagedStoreCategory, ManagedStoreProduct, StoreProductMedia } from "../types/store-admin.ts";
import {
  categoryToFormValues,
  formToCategoryInput,
  formToCategoryUpdate,
  formToProductInput,
  galleryToProductMedia,
  parseWholeNumber,
  productMediaToGallery,
  productToFormValues,
} from "./store-form.ts";

const media: StoreProductMedia[] = [
  { id: "m2", url: "/uploads/b.webp", alt: null, isPrimary: false, sortOrder: 1 },
  { id: "m1", url: "/uploads/a.webp", alt: "Front", isPrimary: true, sortOrder: 0 },
];

describe("product media mapping", () => {
  it("sorts API media and fills a missing alt", () => {
    assert.deepEqual(productMediaToGallery(media), [
      { url: "/uploads/a.webp", alt: "Front", isPrimary: true },
      { url: "/uploads/b.webp", alt: "", isPrimary: false },
    ]);
  });

  it("promotes the first image when none is primary", () => {
    assert.equal(productMediaToGallery([{ ...media[0], isPrimary: false }])[0].isPrimary, true);
  });

  it("keeps ids of existing rows by URL, nulls blank alt and allows one primary", () => {
    const result = galleryToProductMedia(
      [
        { url: "/uploads/b.webp", alt: "  ", isPrimary: true },
        { url: "/uploads/new.webp", alt: " New ", isPrimary: true },
        { url: "/uploads/a.webp", alt: "Front", isPrimary: false },
      ],
      media,
    );
    assert.deepEqual(result, [
      { id: "m2", url: "/uploads/b.webp", alt: null, isPrimary: true },
      { url: "/uploads/new.webp", alt: "New", isPrimary: false },
      { id: "m1", url: "/uploads/a.webp", alt: "Front", isPrimary: false },
    ]);
  });

  it("uses each existing id once for duplicate URLs", () => {
    const result = galleryToProductMedia(
      [
        { url: "/uploads/a.webp", alt: "", isPrimary: true },
        { url: "/uploads/a.webp", alt: "", isPrimary: false },
      ],
      [media[1]],
    );
    assert.equal(result[0].id, "m1");
    assert.equal("id" in result[1], false);
  });
});

describe("product form", () => {
  const product: ManagedStoreProduct = {
    id: "p",
    name: "Rudraksha mala",
    slug: "rudraksha-mala",
    shortDescription: "Short",
    description: "Long",
    categoryId: "c",
    pricePaise: 149_900,
    inventoryTracked: true,
    inventoryQuantity: 4,
    featured: false,
    catalogStatus: "published",
    details: { overview: ["One"], specifications: [{ label: "Beads", value: "108" }] },
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    currency: "INR",
    category: { id: "c", name: "Malas", slug: "malas" },
    availability: { status: "in_stock", purchasable: true },
    media,
  };

  it("round-trips a product", () => {
    const input = formToProductInput(productToFormValues(product), product.media);
    assert.equal(input.inventoryQuantity, 4);
    assert.equal(input.categoryId, "c");
    assert.deepEqual(input.details, { overview: ["One"], highlights: [], specifications: [{ label: "Beads", value: "108" }], careInstructions: [], faq: [] });
    assert.deepEqual(
      input.media.map((item) => item.id),
      ["m1", "m2"],
    );
  });

  it("drops the quantity for untracked products and maps no category to null", () => {
    const values = { ...productToFormValues(product), inventoryTracked: false, categoryId: "" };
    const input = formToProductInput(values);
    assert.equal(input.inventoryQuantity, null);
    assert.equal(input.categoryId, null);
  });

  it("starts a new product as an untracked draft", () => {
    const values = productToFormValues(null);
    assert.equal(values.catalogStatus, "draft");
    assert.equal(values.inventoryTracked, false);
    assert.deepEqual(values.media, []);
  });
});

describe("category form", () => {
  const category: ManagedStoreCategory = {
    id: "c",
    name: "Malas",
    slug: "malas",
    description: null,
    imageUrl: null,
    details: { about: ["About"], faq: [{ question: "Q", answer: "A" }] },
    active: false,
    sortOrder: 3,
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    productCount: 2,
  };

  it("round-trips details and omits active on update", () => {
    const values = categoryToFormValues(category);
    assert.equal(values.sortOrder, "3");
    const input = formToCategoryInput(values);
    assert.deepEqual(input.details, { about: ["About"], highlights: [], faq: [{ question: "Q", answer: "A" }] });
    assert.equal(input.active, false);
    assert.equal("active" in formToCategoryUpdate(values), false);
  });

  it("sends null details when every list is empty", () => {
    const values = categoryToFormValues(null);
    values.details.about = [{ text: "  " }];
    assert.equal(formToCategoryInput(values).details, null);
    assert.equal(formToCategoryInput(values).sortOrder, 0);
  });

  it("parses whole numbers", () => {
    assert.equal(parseWholeNumber(""), null);
    assert.equal(parseWholeNumber("12"), 12);
    assert.ok(Number.isNaN(parseWholeNumber("1.2")));
  });
});

describe("product list state", () => {
  it("accepts a UUID category filter", () => {
    const id = "33333333-3333-4333-8333-333333333333";
    const state = parseAdminListState(new URLSearchParams(`categoryId=${id}&catalogStatus=coming_soon&featured=false`), storeProductListConfig);
    assert.deepEqual(toAdminListQuery(state, storeProductListConfig), { page: 1, limit: 20, categoryId: id, catalogStatus: "coming_soon", featured: "false" });
  });
});
