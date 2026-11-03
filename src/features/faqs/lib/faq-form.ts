import { z } from "zod";

import { FAQ_LIMITS } from "../constants/faq-status.ts";
import type { FaqCategory, FaqInput, ManagedFaq } from "../types/faq-admin.ts";

export type FaqFormValues = {
  category: FaqCategory | "";
  question: string;
  answer: string;
  sortOrder: string;
  active: boolean;
};

export const emptyFaqForm: FaqFormValues = { category: "", question: "", answer: "", sortOrder: "0", active: true };

const { question, answer, sortOrder } = FAQ_LIMITS;

export const faqFormSchema = z.object({
  category: z.enum(["consultations", "wallet", "orders", "poojas", "account"], { error: "Choose the help section." }),
  question: z.string().trim().min(question[0], { error: "Write the question (at least 5 characters)." }).max(question[1]),
  answer: z.string().trim().min(answer[0], { error: "Write the answer (at least 5 characters)." }).max(answer[1]),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Use a whole number, 0 or more." })
    .refine((value) => Number(value) <= sortOrder, { error: `Use ${sortOrder.toLocaleString("en-IN")} or less.` }),
  active: z.boolean(),
});

export function faqToFormValues(faq: ManagedFaq): FaqFormValues {
  return { category: faq.category, question: faq.question, answer: faq.answer, sortOrder: String(faq.sortOrder), active: faq.active };
}

/** API body; the schema has already rejected an empty category. */
export function faqFormToInput(values: FaqFormValues): FaqInput {
  return {
    category: values.category as FaqCategory,
    question: values.question.trim(),
    answer: values.answer.trim(),
    sortOrder: Number(values.sortOrder.trim()),
    active: values.active,
  };
}
