import { z } from "zod";

import { poojaCategories } from "@/features/pooja/data/poojas";
import type { PoojaDefinition } from "@/features/pooja/types/pooja";
import { poojaManagementStatusValues, poojaServiceStatusValues } from "@/features/pooja/types/pooja";

const trimmedRequired = (message: string) => z.string().trim().min(1, { error: message });
const amountPattern = /^\d+(\.\d{1,2})?$/;
const integerPattern = /^\d+$/;

export const poojaManagementStatusFormValues = ["not-configured", ...poojaManagementStatusValues] as const;

const categoryValues = poojaCategories.filter((option) => option.value !== "all").map((option) => option.value);

export const poojaEditorSchema = z.object({
  name: trimmedRequired("Enter a name."),
  imageSrc: trimmedRequired("Provide an image URL or application asset path.").refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    { error: "Use an image URL or an application asset path." },
  ),
  shortDescription: trimmedRequired("Enter a short description."),
  categories: z.array(z.string().refine((value) => categoryValues.includes(value as typeof categoryValues[number]), { error: "Choose a valid category." })).min(1, { error: "Choose at least one category." }),
  featured: z.boolean(),
  status: z.enum(poojaServiceStatusValues),
  overview: z.array(z.object({ text: trimmedRequired("Overview paragraphs cannot be empty.") })).min(1, { error: "Add at least one overview paragraph." }),
  quickFacts: z.array(z.object({ label: trimmedRequired("Enter a fact label."), value: trimmedRequired("Enter a fact value.") })).min(1, { error: "Add at least one quick fact." }),
  ritualSteps: z.array(z.object({ title: trimmedRequired("Enter a step title."), description: trimmedRequired("Enter a step description.") })).min(1, { error: "Add at least one ritual step." }),
  requiredDetails: z.array(z.object({ text: trimmedRequired("Required details cannot be empty.") })).min(1, { error: "Add at least one required detail." }),
  preparationNotes: z.array(z.object({ text: trimmedRequired("Preparation notes cannot be empty.") })).min(1, { error: "Add at least one preparation note." }),
  optionalSectionEnabled: z.boolean(),
  optionalSectionTitle: z.string().trim(),
  optionalSectionBody: z.array(z.object({ text: z.string().trim() })),
  estimatedDurationMinutes: z.string().trim().refine((value) => value === "" || (integerPattern.test(value) && Number(value) <= 1440), { error: "Use whole minutes from 0 to 1440." }),
  priceInRupees: z.string().trim().refine((value) => value === "" || amountPattern.test(value), { error: "Use a valid INR amount." }),
  managementStatus: z.enum(poojaManagementStatusFormValues),
}).superRefine((values, context) => {
  if (!values.optionalSectionEnabled) return;
  if (!values.optionalSectionTitle) context.addIssue({ code: "custom", path: ["optionalSectionTitle"], message: "Enter an optional section title." });
  if (!values.optionalSectionBody.some((item) => item.text)) context.addIssue({ code: "custom", path: ["optionalSectionBody"], message: "Add at least one optional content paragraph." });
});

export type PoojaEditorValues = z.infer<typeof poojaEditorSchema>;

export type PoojaEditorPayload = {
  pooja: Omit<PoojaDefinition, "management"> & {
    management?: Pick<NonNullable<PoojaDefinition["management"]>, "managementStatus" | "estimatedDurationMinutes" | "priceInPaise" | "currency">;
  };
  imageUpload?: File;
};

export function getPoojaEditorDefaults(pooja: PoojaDefinition): PoojaEditorValues {
  return {
    name: pooja.name,
    imageSrc: pooja.imageSrc,
    shortDescription: pooja.shortDescription,
    categories: [...pooja.categories],
    featured: Boolean(pooja.featured),
    status: pooja.status,
    overview: pooja.detail.overview.map((text) => ({ text })),
    quickFacts: pooja.detail.quickFacts.map((fact) => ({ ...fact })),
    ritualSteps: pooja.detail.ritualSteps.map((step) => ({ ...step })),
    requiredDetails: pooja.detail.requiredDetails.map((text) => ({ text })),
    preparationNotes: pooja.detail.preparationNotes.map((text) => ({ text })),
    optionalSectionEnabled: Boolean(pooja.detail.optionalSection),
    optionalSectionTitle: pooja.detail.optionalSection?.title ?? "",
    optionalSectionBody: pooja.detail.optionalSection?.body.map((text) => ({ text })) ?? [],
    estimatedDurationMinutes: pooja.management?.estimatedDurationMinutes?.toString() ?? "",
    priceInRupees: pooja.management?.priceInPaise === undefined ? "" : (pooja.management.priceInPaise / 100).toFixed(2).replace(/\.00$/, ""),
    managementStatus: pooja.management?.managementStatus ?? "not-configured",
  };
}

export function toPoojaEditorPayload(pooja: PoojaDefinition, values: PoojaEditorValues, imageUpload?: File): PoojaEditorPayload {
  const optionalSection = values.optionalSectionEnabled
    ? { title: values.optionalSectionTitle.trim(), body: values.optionalSectionBody.map((item) => item.text.trim()).filter(Boolean) }
    : undefined;
  const management = {
    managementStatus: values.managementStatus === "not-configured" ? undefined : values.managementStatus,
    estimatedDurationMinutes: values.estimatedDurationMinutes === "" ? undefined : Number(values.estimatedDurationMinutes),
    priceInPaise: values.priceInRupees === "" ? undefined : Math.round(Number(values.priceInRupees) * 100),
    currency: values.priceInRupees === "" ? undefined : "INR" as const,
  };

  return {
    pooja: {
      slug: pooja.slug,
      name: values.name.trim(),
      imageSrc: values.imageSrc.trim(),
      shortDescription: values.shortDescription.trim(),
      categories: values.categories as PoojaDefinition["categories"],
      featured: values.featured || undefined,
      status: values.status,
      detail: {
        eyebrow: pooja.detail.eyebrow,
        overview: values.overview.map((item) => item.text.trim()).filter(Boolean),
        quickFacts: values.quickFacts.map((item) => ({ label: item.label.trim(), value: item.value.trim() })).filter((item) => item.label && item.value),
        ritualSteps: values.ritualSteps.map((item) => ({ title: item.title.trim(), description: item.description.trim() })).filter((item) => item.title && item.description),
        requiredDetails: values.requiredDetails.map((item) => item.text.trim()).filter(Boolean),
        preparationNotes: values.preparationNotes.map((item) => item.text.trim()).filter(Boolean),
        relatedSlugs: pooja.detail.relatedSlugs,
        optionalSection,
      },
      management: management.managementStatus || management.estimatedDurationMinutes !== undefined || management.priceInPaise !== undefined ? management : undefined,
    },
    imageUpload,
  };
}
