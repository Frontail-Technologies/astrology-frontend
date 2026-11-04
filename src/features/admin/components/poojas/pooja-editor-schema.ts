import { z } from "zod";

import { POOJA_LIMITS, poojaStatuses } from "@/features/poojas/constants/pooja-status";
import type { PoojaFormValues } from "@/features/poojas/lib/pooja-form";

/** Client validation mirroring `api/src/modules/poojas/pooja.validation.ts`; blank rows are dropped on submit. */
const textRow = z.object({ text: z.string().max(1000, { error: "Keep this under 1,000 characters." }) });
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const rowList = z.array(textRow).max(POOJA_LIMITS.maxContentItems, { error: `Use at most ${POOJA_LIMITS.maxContentItems} items.` });

const contentSchema = z
  .object({
    eyebrow: z.string().max(120, { error: "Keep the eyebrow under 120 characters." }),
    overview: rowList,
    quickFacts: z
      .array(z.object({ label: z.string().max(100, { error: "Keep labels under 100 characters." }), value: z.string().max(1000) }))
      .max(POOJA_LIMITS.maxContentItems),
    ritualSteps: z
      .array(z.object({ title: z.string().max(160, { error: "Keep titles under 160 characters." }), description: z.string().max(1000) }))
      .max(POOJA_LIMITS.maxContentItems),
    requiredDetails: rowList,
    preparationNotes: rowList,
    relatedSlugs: z
      .array(z.object({ text: z.string().trim().refine((value) => value === "" || slugPattern.test(value), { error: "Use a pooja slug such as ganesh-pooja." }) }))
      .max(POOJA_LIMITS.maxRelatedSlugs, { error: `Use at most ${POOJA_LIMITS.maxRelatedSlugs} related poojas.` }),
    optionalSectionEnabled: z.boolean(),
    optionalSection: z.object({ title: z.string().max(160), body: rowList }),
  })
  .superRefine((content, context) => {
    content.quickFacts.forEach((fact, index) => {
      const label = fact.label.trim();
      const value = fact.value.trim();
      if (label && !value) context.addIssue({ code: "custom", path: ["quickFacts", index, "value"], message: "Enter a value." });
      if (!label && value) context.addIssue({ code: "custom", path: ["quickFacts", index, "label"], message: "Enter a label." });
    });
    content.ritualSteps.forEach((step, index) => {
      const title = step.title.trim();
      const description = step.description.trim();
      if (title && !description) context.addIssue({ code: "custom", path: ["ritualSteps", index, "description"], message: "Describe this step." });
      if (!title && description) context.addIssue({ code: "custom", path: ["ritualSteps", index, "title"], message: "Give this step a title." });
    });
    if (content.optionalSectionEnabled) {
      if (!content.optionalSection.title.trim()) context.addIssue({ code: "custom", path: ["optionalSection", "title"], message: "Enter a section title." });
      if (!content.optionalSection.body.some((row) => row.text.trim())) {
        context.addIssue({ code: "custom", path: ["optionalSection", "body"], message: "Add at least one paragraph." });
      }
    }
  });

export const poojaEditorSchema: z.ZodType<PoojaFormValues, PoojaFormValues> = z.object({
  name: z.string().trim().min(2, { error: "Enter a name (at least 2 characters)." }).max(180, { error: "Keep the name under 180 characters." }),
  shortDescription: z.string().trim().min(1, { error: "Enter a short description." }).max(500, { error: "Keep it under 500 characters." }),
  description: z.string().trim().min(1, { error: "Enter a description." }).max(50_000),
  categoryIds: z
    .array(z.string())
    .min(1, { error: "Choose at least one category." })
    .max(POOJA_LIMITS.maxCategories, { error: `Choose at most ${POOJA_LIMITS.maxCategories} categories.` }),
  imageUrl: z.string().nullable(),
  pricePaise: z
    .number({ error: "Enter a valid amount." })
    .int()
    .nonnegative({ error: "Price cannot be negative." })
    .max(100_000_000, { error: "Price is too high." })
    .nullable(),
  durationMinutes: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= POOJA_LIMITS.maxDurationMinutes), {
      error: `Use whole minutes from 1 to ${POOJA_LIMITS.maxDurationMinutes}.`,
    }),
  dailyCapacity: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 10_000), { error: "Use a whole number from 1 to 10,000, or leave it empty for no limit." }),
  bookingLeadDays: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value) && Number(value) <= 60, { error: "Use whole days from 0 to 60." }),
  bookingWindowDays: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 365, { error: "Use whole days from 1 to 365." }),
  preferredTithis: z.array(z.string()).max(30),
  preferredNakshatras: z.array(z.string()).max(27),
  featured: z.boolean(),
  status: z.enum(poojaStatuses),
  content: contentSchema,
});
