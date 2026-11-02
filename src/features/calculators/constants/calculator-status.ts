import type { CalculatorCategory, CalculatorStatus } from "../types/calculator-admin.ts";

export const calculatorCategoryLabels: Record<CalculatorCategory, string> = {
  relationships: "Relationships",
  "birth-chart": "Birth chart",
  dosha: "Dosha",
  numerology: "Numerology",
  remedies: "Remedies",
};

export const calculatorStatuses = ["available", "coming-soon", "archived"] as const satisfies readonly CalculatorStatus[];
export const calculatorStatusLabels: Record<CalculatorStatus, string> = { available: "Available", "coming-soon": "Coming soon", archived: "Archived" };
export const calculatorStatusVariants: Record<CalculatorStatus, "online" | "pending" | "muted"> = { available: "online", "coming-soon": "pending", archived: "muted" };
export const calculatorStatusDescriptions: Record<CalculatorStatus, string> = {
  available: "Listed on the public site as usable.",
  "coming-soon": "Listed on the public site as coming soon.",
  archived: "Hidden from the public catalog.",
};

export const calculatorFeaturedLabels: Record<"true" | "false", string> = { true: "Featured", false: "Not featured" };

/** Field limits mirrored from `calculator.validation.ts`. */
export const CALCULATOR_LIMITS = {
  name: [2, 180],
  shortDescription: 2_000,
  keyword: 80,
  keywords: 50,
  intro: 2_000,
  howItWorksItem: 1_000,
  howItWorks: 30,
  submitLabel: 120,
  privacyNote: 1_000,
  sortOrder: 100_000,
} as const;
