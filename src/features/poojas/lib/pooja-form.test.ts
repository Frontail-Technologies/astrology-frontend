import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAdminListState, toAdminListQuery } from "../../admin/data/admin-list-state.ts";
import { poojaListConfig } from "../state/pooja-list-state.ts";
import type { ManagedPooja, PoojaContent } from "../types/pooja-admin.ts";
import {
  contentToForm,
  emptyPoojaContentForm,
  formToContent,
  formValuesToPoojaInput,
  formValuesToPoojaUpdate,
  makePrimaryCategory,
  moveCategory,
  poojaToFormValues,
  toggleCategoryId,
} from "./pooja-form.ts";

const content: PoojaContent = {
  eyebrow: "Home ritual",
  overview: ["First paragraph", "Second paragraph"],
  quickFacts: [{ label: "Duration", value: "90 minutes" }],
  ritualSteps: [{ title: "Sankalp", description: "Statement of intention" }],
  requiredDetails: ["Full name"],
  preparationNotes: ["Fresh flowers"],
  relatedSlugs: ["ganesh-pooja"],
  optionalSection: { title: "Significance", body: ["Paragraph"] },
};

const pooja: ManagedPooja = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Satyanarayan Pooja",
  slug: "satyanarayan-pooja",
  shortDescription: "Short",
  description: "Long",
  categoryId: "c-primary",
  imageUrl: "/uploads/a.webp",
  pricePaise: 250000,
  durationMinutes: 120,
  status: "published",
  featured: true,
  content,
  dailyCapacity: 5,
  bookingLeadDays: 3,
  bookingWindowDays: 45,
  preferredTithis: ["Shukla Ekadashi"],
  preferredNakshatras: [],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
  category: { id: "c-primary", name: "Prosperity", slug: "prosperity" },
  categories: [
    { id: "c-other", name: "Family", slug: "family", isPrimary: false },
    { id: "c-primary", name: "Prosperity", slug: "prosperity", isPrimary: true },
  ],
};

describe("pooja content <-> form", () => {
  it("round-trips full content", () => {
    assert.deepEqual(formToContent(contentToForm(content)), content);
  });

  it("maps null content to an empty form and an empty form back to null", () => {
    assert.deepEqual(contentToForm(null), emptyPoojaContentForm());
    assert.equal(formToContent(emptyPoojaContentForm()), null);
  });

  it("trims values, drops blank rows and omits a blank eyebrow and a disabled optional section", () => {
    const form = contentToForm(content);
    form.eyebrow = "   ";
    form.overview = [{ text: "  kept  " }, { text: "   " }];
    form.quickFacts = [{ label: " ", value: " " }, { label: "Samagri", value: " Included " }];
    form.ritualSteps = [];
    form.optionalSectionEnabled = false;
    const result = formToContent(form);
    assert.ok(result);
    assert.equal("eyebrow" in result, false);
    assert.equal("optionalSection" in result, false);
    assert.deepEqual(result.overview, ["kept"]);
    assert.deepEqual(result.quickFacts, [{ label: "Samagri", value: "Included" }]);
  });

  it("keeps content that only has an optional section", () => {
    const form = emptyPoojaContentForm();
    form.optionalSectionEnabled = true;
    form.optionalSection = { title: " Note ", body: [{ text: "Body" }, { text: "" }] };
    assert.deepEqual(formToContent(form), { overview: [], quickFacts: [], ritualSteps: [], requiredDetails: [], preparationNotes: [], relatedSlugs: [], optionalSection: { title: "Note", body: ["Body"] } });
  });
});

describe("pooja form values", () => {
  it("puts the primary category first and stringifies the duration", () => {
    const values = poojaToFormValues(pooja);
    assert.deepEqual(values.categoryIds, ["c-primary", "c-other"]);
    assert.equal(values.durationMinutes, "120");
    assert.equal(values.content.eyebrow, "Home ritual");
  });

  it("builds create and update payloads", () => {
    const values = poojaToFormValues(pooja);
    values.durationMinutes = " ";
    values.name = "  Renamed ";
    const create = formValuesToPoojaInput(values);
    assert.equal(create.name, "Renamed");
    assert.equal(create.durationMinutes, null);
    assert.equal(create.status, "published");
    assert.deepEqual(create.content, content);
    const update = formValuesToPoojaUpdate(values);
    assert.equal("status" in update, false);
    assert.deepEqual(update.categoryIds, ["c-primary", "c-other"]);
  });

  it("defaults a new pooja to draft with empty values", () => {
    const values = poojaToFormValues(null);
    assert.equal(values.status, "draft");
    assert.deepEqual(values.categoryIds, []);
    assert.equal(formValuesToPoojaInput(values).content, null);
  });
});

describe("category ordering", () => {
  it("toggles, promotes and moves categories", () => {
    assert.deepEqual(toggleCategoryId(["a"], "b"), ["a", "b"]);
    assert.deepEqual(toggleCategoryId(["a", "b"], "a"), ["b"]);
    assert.deepEqual(makePrimaryCategory(["a", "b", "c"], "c"), ["c", "a", "b"]);
    assert.deepEqual(makePrimaryCategory(["a"], "z"), ["a"]);
    assert.deepEqual(moveCategory(["a", "b", "c"], 2, -1), ["a", "c", "b"]);
    assert.deepEqual(moveCategory(["a", "b"], 0, -1), ["a", "b"]);
  });
});

describe("pooja list state", () => {
  it("accepts any UUID as categoryId and drops other values", () => {
    const id = "22222222-2222-4222-8222-222222222222";
    const state = parseAdminListState(new URLSearchParams(`categoryId=${id}&status=published&featured=true`), poojaListConfig);
    assert.deepEqual(toAdminListQuery(state, poojaListConfig), { page: 1, limit: 20, categoryId: id, status: "published", featured: "true" });
    const bad = parseAdminListState(new URLSearchParams("categoryId=nope&status=archived"), poojaListConfig);
    assert.deepEqual(bad.filters, {});
  });
});
