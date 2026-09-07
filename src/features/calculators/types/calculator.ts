export type CalculatorCategory =
  | "relationships"
  | "birth-chart"
  | "dosha"
  | "numerology"
  | "remedies";

export type CalculatorFieldType =
  | "text"
  | "date"
  | "time"
  | "place"
  | "number"
  | "select";

export type CalculatorFieldDefinition = {
  key: string;
  label: string;
  type: CalculatorFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type CalculatorFormSection = {
  title?: string;
  fields: CalculatorFieldDefinition[];
};

/**
 * Per-tool detail configuration. Drives the `/calculators/[slug]` screen.
 *
 * `form` names the bespoke form component that owns validation and layout —
 * calculator detail pages share the workspace shell, NOT an identical generic
 * form (see DEVELOPMENT_RULES / spec). `sections` documents the tool's input
 * architecture for future engine work; it is not a runtime form renderer.
 */
export type CalculatorDetailDefinition = {
  form: "love-compatibility";
  intro?: string;
  sections: CalculatorFormSection[];
  submitLabel: string;
  privacyNote: string;
  howItWorks: string[];
  /** Result-structure labels shown as a pending preview (no interpretation). */
  resultSections: string[];
  relatedSlugs: string[];
};

export type CalculatorDefinition = {
  slug: string;
  name: string;
  shortDescription: string;
  category: CalculatorCategory;
  imageSrc: string;
  keywords: string[];
  featured?: boolean;
  status: "available" | "coming-soon";
  detail?: CalculatorDetailDefinition;
};

export type CalculatorCategoryValue = "all" | CalculatorCategory;

export type CalculatorCategoryOption = {
  value: CalculatorCategoryValue;
  label: string;
};
