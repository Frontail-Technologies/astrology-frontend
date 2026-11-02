/** Admin shapes for `/admin/calculators`. Separate from the public-site `types/calculator.ts`. */
export type CalculatorCategory = "relationships" | "birth-chart" | "dosha" | "numerology" | "remedies";
export type CalculatorStatus = "available" | "coming-soon" | "archived";

export type CalculatorDetailField = {
  key: string;
  label: string;
  type: "text" | "date" | "time" | "place" | "number" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

/** Stored detail JSON (every key optional). The editor changes intro/howItWorks/submitLabel/privacyNote only. */
export type CalculatorDetail = {
  form?: string;
  intro?: string;
  sections?: { title?: string; fields: CalculatorDetailField[] }[];
  submitLabel?: string;
  privacyNote?: string;
  howItWorks?: string[];
  resultSections?: string[];
  relatedSlugs?: string[];
};

/** `GET /admin/calculators` item and detail (backend `toCalculator`). */
export type ManagedCalculator = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  category: CalculatorCategory;
  imageSrc: string;
  keywords: string[];
  featured: boolean;
  status: CalculatorStatus;
  detail: CalculatorDetail | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** Create and `PATCH /:id` body (status changes use `/status`). */
export type CalculatorInput = {
  name: string;
  shortDescription: string;
  category: CalculatorCategory;
  imageSrc: string;
  keywords: string[];
  featured: boolean;
  detail: CalculatorDetail | null;
  sortOrder: number;
};
