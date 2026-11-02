import { z } from "zod";

import { STORE_LIMITS, catalogStatuses } from "@/features/store/constants/store-status";
import type { StoreProductFormValues } from "@/features/store/lib/store-form";
import { faqRowsSchema, textRowsSchema } from "./store-category-editor-schema";

/** Mirrors `productCreateBodySchema` in `api/src/modules/store/store.validation.ts`; blank rows are dropped on submit. */
export const storeProductEditorSchema: z.ZodType<StoreProductFormValues, StoreProductFormValues> = z
  .object({
    name: z.string().trim().min(2, { error: "Enter a name (at least 2 characters)." }).max(180, { error: "Keep the name under 180 characters." }),
    shortDescription: z.string().max(500, { error: "Keep it under 500 characters." }),
    description: z.string().max(10_000, { error: "Keep the description under 10,000 characters." }),
    categoryId: z.string(),
    pricePaise: z
      .number({ error: "Enter a valid amount." })
      .int()
      .nonnegative({ error: "Price cannot be negative." })
      .max(STORE_LIMITS.maxPricePaise, { error: "Price is too high." })
      .nullable(),
    inventoryTracked: z.boolean(),
    inventoryQuantity: z.string(),
    featured: z.boolean(),
    catalogStatus: z.enum(catalogStatuses),
    details: z.object({
      overview: textRowsSchema(2000),
      highlights: textRowsSchema(300),
      specifications: z
        .array(z.object({ label: z.string().max(80, { error: "Keep labels under 80 characters." }), value: z.string().max(300) }))
        .max(STORE_LIMITS.maxSpecifications)
        .superRefine((rows, context) => {
          rows.forEach((row, index) => {
            if (row.label.trim() && !row.value.trim()) context.addIssue({ code: "custom", path: [index, "value"], message: "Enter a value." });
            if (!row.label.trim() && row.value.trim()) context.addIssue({ code: "custom", path: [index, "label"], message: "Enter a label." });
          });
        }),
      careInstructions: textRowsSchema(500),
      faq: faqRowsSchema,
    }),
    media: z
      .array(z.object({ url: z.string().min(1), alt: z.string().max(300, { error: "Keep alt text under 300 characters." }), isPrimary: z.boolean() }))
      .max(STORE_LIMITS.maxMedia, { error: `Use at most ${STORE_LIMITS.maxMedia} images.` }),
  })
  .superRefine((values, context) => {
    if (!values.inventoryTracked) return;
    const text = values.inventoryQuantity.trim();
    if (!/^\d+$/.test(text) || Number(text) > STORE_LIMITS.maxInventory) {
      context.addIssue({ code: "custom", path: ["inventoryQuantity"], message: "Enter the units in stock (a whole number)." });
    }
  });
