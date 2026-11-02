import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CalculatorDetail, ManagedCalculator } from "../types/calculator-admin.ts";
import { calculatorFormSchema, calculatorFormToInput, calculatorToFormValues, emptyCalculatorForm, mergeCalculatorDetail, parseKeywords } from "./calculator-form.ts";

const detail: CalculatorDetail = {
  form: "love-compatibility",
  intro: "Old intro",
  sections: [{ title: "You", fields: [{ key: "name", label: "Name", type: "text", required: true }] }],
  submitLabel: "Check",
  privacyNote: "Private",
  howItWorks: ["One", "Two"],
  resultSections: ["Summary"],
  relatedSlugs: ["kundli-matching"],
};

describe("calculator detail merge", () => {
  it("updates edited keys and keeps the others unchanged", () => {
    const merged = mergeCalculatorDetail(detail, { intro: " New intro ", howItWorks: [{ text: "A" }, { text: " " }, { text: "B" }], submitLabel: "", privacyNote: "Private" });
    assert.deepEqual(merged, {
      form: "love-compatibility",
      intro: "New intro",
      sections: detail.sections,
      privacyNote: "Private",
      howItWorks: ["A", "B"],
      resultSections: ["Summary"],
      relatedSlugs: ["kundli-matching"],
    });
  });

  it("returns null when nothing is left and creates detail from scratch", () => {
    assert.equal(mergeCalculatorDetail({ intro: "x" }, { intro: "", howItWorks: [], submitLabel: "", privacyNote: "" }), null);
    assert.equal(mergeCalculatorDetail(null, { intro: "", howItWorks: [], submitLabel: "", privacyNote: "" }), null);
    assert.deepEqual(mergeCalculatorDetail(null, { intro: "Hi", howItWorks: [], submitLabel: "", privacyNote: "" }), { intro: "Hi" });
  });
});

describe("calculator form", () => {
  it("parses keywords without duplicates", () => {
    assert.deepEqual(parseKeywords("Love, love ,marriage\nGuna,, "), ["Love", "marriage", "Guna"]);
  });

  it("round-trips a calculator into the API body", () => {
    const calculator: ManagedCalculator = {
      id: "c1",
      name: "Love Compatibility",
      slug: "love-compatibility",
      shortDescription: "Short",
      category: "relationships",
      imageSrc: "/assets/x.png",
      keywords: ["love", "marriage"],
      featured: true,
      status: "available",
      detail,
      sortOrder: 2,
      createdAt: "",
      updatedAt: "",
    };
    const values = calculatorToFormValues(calculator);
    assert.equal(values.keywords, "love, marriage");
    assert.deepEqual(calculatorFormToInput(values, calculator.detail), {
      name: "Love Compatibility",
      shortDescription: "Short",
      category: "relationships",
      imageSrc: "/assets/x.png",
      keywords: ["love", "marriage"],
      featured: true,
      sortOrder: 2,
      detail,
    });
  });

  it("requires category, image and a whole sort order", () => {
    const result = calculatorFormSchema.safeParse({ ...emptyCalculatorForm, name: "Tool", shortDescription: "Desc", sortOrder: "1.5" });
    assert.deepEqual(result.error?.issues.map((issue) => issue.path.join(".")).sort(), ["category", "imageSrc", "sortOrder"]);
  });
});
