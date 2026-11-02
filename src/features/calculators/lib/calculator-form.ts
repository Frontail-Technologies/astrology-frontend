import { z } from "zod";

import { CALCULATOR_LIMITS } from "../constants/calculator-status.ts";
import type { CalculatorCategory, CalculatorDetail, CalculatorInput, ManagedCalculator } from "../types/calculator-admin.ts";

/** Calculator editor values. `keywords` is comma-separated text; `howItWorks` rows are objects for `useFieldArray`. */
export type CalculatorFormValues = {
  name: string;
  shortDescription: string;
  category: CalculatorCategory | "";
  imageSrc: string | null;
  keywords: string;
  featured: boolean;
  sortOrder: string;
  intro: string;
  howItWorks: { text: string }[];
  submitLabel: string;
  privacyNote: string;
};

export const emptyCalculatorForm: CalculatorFormValues = {
  name: "",
  shortDescription: "",
  category: "",
  imageSrc: null,
  keywords: "",
  featured: false,
  sortOrder: "0",
  intro: "",
  howItWorks: [],
  submitLabel: "",
  privacyNote: "",
};

/** Comma/newline separated keywords → trimmed, de-duplicated (case-insensitive) list. */
export function parseKeywords(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of text.split(/[,\n]/)) {
    const keyword = raw.trim();
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    result.push(keyword);
  }
  return result;
}

const max = (limit: number) => z.string().trim().max(limit, { error: `Use at most ${limit} characters.` });

export const calculatorFormSchema = z.object({
  name: z.string().trim().min(CALCULATOR_LIMITS.name[0], { error: "Enter a name (at least 2 characters)." }).max(CALCULATOR_LIMITS.name[1]),
  shortDescription: z.string().trim().min(1, { error: "Enter a short description." }).max(CALCULATOR_LIMITS.shortDescription),
  category: z.union([z.enum(["relationships", "birth-chart", "dosha", "numerology", "remedies"]), z.literal("")]).refine((value) => value !== "", { error: "Choose a category." }),
  imageSrc: z.string().nullable().refine((value) => Boolean(value), { error: "Add a calculator image." }),
  keywords: z.string().superRefine((value, context) => {
    const keywords = parseKeywords(value);
    if (keywords.length > CALCULATOR_LIMITS.keywords) context.addIssue({ code: "custom", message: `Use at most ${CALCULATOR_LIMITS.keywords} keywords.` });
    if (keywords.some((keyword) => keyword.length > CALCULATOR_LIMITS.keyword)) context.addIssue({ code: "custom", message: `Each keyword can have at most ${CALCULATOR_LIMITS.keyword} characters.` });
  }),
  featured: z.boolean(),
  sortOrder: z.string().trim().regex(/^\d{1,6}$/, { error: "Enter a whole number." }).refine((value) => Number(value) <= CALCULATOR_LIMITS.sortOrder, { error: `At most ${CALCULATOR_LIMITS.sortOrder}.` }),
  intro: max(CALCULATOR_LIMITS.intro),
  howItWorks: z.array(z.object({ text: max(CALCULATOR_LIMITS.howItWorksItem) })).max(CALCULATOR_LIMITS.howItWorks, { error: `Use at most ${CALCULATOR_LIMITS.howItWorks} steps.` }),
  submitLabel: max(CALCULATOR_LIMITS.submitLabel),
  privacyNote: max(CALCULATOR_LIMITS.privacyNote),
});

export function calculatorToFormValues(calculator: ManagedCalculator): CalculatorFormValues {
  const detail = calculator.detail ?? {};
  return {
    name: calculator.name,
    shortDescription: calculator.shortDescription,
    category: calculator.category,
    imageSrc: calculator.imageSrc,
    keywords: calculator.keywords.join(", "),
    featured: calculator.featured,
    sortOrder: String(calculator.sortOrder),
    intro: detail.intro ?? "",
    howItWorks: (detail.howItWorks ?? []).map((text) => ({ text })),
    submitLabel: detail.submitLabel ?? "",
    privacyNote: detail.privacyNote ?? "",
  };
}

/**
 * Merges the edited detail keys into the stored detail. Keys the editor does not manage (`form`, `sections`,
 * `resultSections`, `relatedSlugs`) are kept unchanged; an emptied text key or an empty step list is removed.
 * Returns `null` when nothing is left.
 */
export function mergeCalculatorDetail(previous: CalculatorDetail | null, values: Pick<CalculatorFormValues, "intro" | "howItWorks" | "submitLabel" | "privacyNote">): CalculatorDetail | null {
  const detail: CalculatorDetail = { ...(previous ?? {}) };
  const setText = (key: "intro" | "submitLabel" | "privacyNote", value: string) => {
    const trimmed = value.trim();
    if (trimmed) detail[key] = trimmed;
    else delete detail[key];
  };
  setText("intro", values.intro);
  setText("submitLabel", values.submitLabel);
  setText("privacyNote", values.privacyNote);
  const steps = values.howItWorks.map((step) => step.text.trim()).filter(Boolean);
  if (steps.length) detail.howItWorks = steps;
  else delete detail.howItWorks;
  return Object.keys(detail).length ? detail : null;
}

export function calculatorFormToInput(values: CalculatorFormValues, previousDetail: CalculatorDetail | null): CalculatorInput {
  return {
    name: values.name.trim(),
    shortDescription: values.shortDescription.trim(),
    category: values.category as CalculatorCategory,
    imageSrc: values.imageSrc ?? "",
    keywords: parseKeywords(values.keywords),
    featured: values.featured,
    sortOrder: Number(values.sortOrder.trim()),
    detail: mergeCalculatorDetail(previousDetail, values),
  };
}
