import { z } from "zod";

import { STORE_LIMITS } from "@/features/store/constants/store-status";
import type { StoreCategoryFormValues } from "@/features/store/lib/store-form";

/** Mirrors `categoryCreateBodySchema` in `api/src/modules/store/store.validation.ts`; blank rows are dropped on submit. */
const textRows = (maxLength: number) =>
  z.array(z.object({ text: z.string().max(maxLength, { error: `Keep this under ${maxLength.toLocaleString("en-IN")} characters.` }) })).max(STORE_LIMITS.maxListItems, {
    error: `Use at most ${STORE_LIMITS.maxListItems} items.`,
  });

export const faqRowsSchema = z
  .array(z.object({ question: z.string().max(300), answer: z.string().max(2000) }))
  .max(STORE_LIMITS.maxListItems)
  .superRefine((rows, context) => {
    rows.forEach((row, index) => {
      if (row.question.trim() && !row.answer.trim()) context.addIssue({ code: "custom", path: [index, "answer"], message: "Enter an answer." });
      if (!row.question.trim() && row.answer.trim()) context.addIssue({ code: "custom", path: [index, "question"], message: "Enter a question." });
    });
  });

export const textRowsSchema = textRows;

export const storeCategoryEditorSchema: z.ZodType<StoreCategoryFormValues, StoreCategoryFormValues> = z.object({
  name: z.string().trim().min(2, { error: "Enter a name (at least 2 characters)." }).max(120, { error: "Keep the name under 120 characters." }),
  description: z.string().max(2000, { error: "Keep the description under 2,000 characters." }),
  imageUrl: z.string().nullable(),
  sortOrder: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= STORE_LIMITS.maxSortOrder), {
      error: `Use a whole number from 0 to ${STORE_LIMITS.maxSortOrder.toLocaleString("en-IN")}.`,
    }),
  active: z.boolean(),
  details: z.object({ about: textRows(2000), highlights: textRows(300), faq: faqRowsSchema }),
});
