import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { emptyFaqForm, faqFormSchema, faqFormToInput, faqToFormValues } from "./faq-form.ts";

describe("faq form", () => {
  it("rejects an empty category and short text", () => {
    const result = faqFormSchema.safeParse({ ...emptyFaqForm, question: "Hi", answer: "No" });
    assert.equal(result.success, false);
    const paths = result.error!.issues.map((issue) => issue.path[0]).sort();
    assert.deepEqual(paths, ["answer", "category", "question"]);
  });

  it("trims text and converts the sort order to a number", () => {
    const values = { category: "wallet" as const, question: "  How do I add money?  ", answer: " Use UPI. Done. ", sortOrder: " 3 ", active: false };
    assert.equal(faqFormSchema.safeParse(values).success, true);
    assert.deepEqual(faqFormToInput(values), { category: "wallet", question: "How do I add money?", answer: "Use UPI. Done.", sortOrder: 3, active: false });
  });

  it("round-trips a saved FAQ", () => {
    const faq = { id: "1", category: "orders" as const, question: "Where is my order?", answer: "Open My orders.", sortOrder: 2, active: true, createdAt: "", updatedAt: "" };
    assert.deepEqual(faqFormToInput(faqToFormValues(faq)), { category: "orders", question: faq.question, answer: faq.answer, sortOrder: 2, active: true });
  });
});
