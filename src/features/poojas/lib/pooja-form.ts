/**
 * Pooja editor form <-> API mapping. Pure (no React, no `@/` aliases) so it runs under `node --test`.
 *
 * String lists are held as `{ text }` rows because react-hook-form field arrays need objects; every field has a
 * default so server field errors (`content.overview.0`, `categoryIds`) map onto the form.
 */
import type { ManagedPooja, PoojaContent, PoojaInput, PoojaStatus } from "../types/pooja-admin.ts";

export type TextRow = { text: string };

export type PoojaContentForm = {
  eyebrow: string;
  overview: TextRow[];
  quickFacts: { label: string; value: string }[];
  ritualSteps: { title: string; description: string }[];
  requiredDetails: TextRow[];
  preparationNotes: TextRow[];
  relatedSlugs: TextRow[];
  optionalSectionEnabled: boolean;
  optionalSection: { title: string; body: TextRow[] };
};

export type PoojaFormValues = {
  name: string;
  shortDescription: string;
  description: string;
  /** First id = primary category. */
  categoryIds: string[];
  imageUrl: string | null;
  pricePaise: number | null;
  /** Whole minutes as typed; "" = not set. */
  durationMinutes: string;
  featured: boolean;
  /** Initial status (create only; later changes go through the status endpoint). */
  status: PoojaStatus;
  content: PoojaContentForm;
};

const rows = (items: readonly string[] | undefined): TextRow[] => (items ?? []).map((text) => ({ text }));
const texts = (items: readonly TextRow[]): string[] => items.map((item) => item.text.trim()).filter(Boolean);

export function emptyPoojaContentForm(): PoojaContentForm {
  return {
    eyebrow: "",
    overview: [],
    quickFacts: [],
    ritualSteps: [],
    requiredDetails: [],
    preparationNotes: [],
    relatedSlugs: [],
    optionalSectionEnabled: false,
    optionalSection: { title: "", body: [] },
  };
}

export function contentToForm(content: PoojaContent | null | undefined): PoojaContentForm {
  if (!content) return emptyPoojaContentForm();
  return {
    eyebrow: content.eyebrow ?? "",
    overview: rows(content.overview),
    quickFacts: (content.quickFacts ?? []).map((fact) => ({ label: fact.label, value: fact.value })),
    ritualSteps: (content.ritualSteps ?? []).map((step) => ({ title: step.title, description: step.description })),
    requiredDetails: rows(content.requiredDetails),
    preparationNotes: rows(content.preparationNotes),
    relatedSlugs: rows(content.relatedSlugs),
    optionalSectionEnabled: Boolean(content.optionalSection),
    optionalSection: { title: content.optionalSection?.title ?? "", body: rows(content.optionalSection?.body) },
  };
}

/**
 * Trims every value and drops blank rows. Returns `null` when nothing is written (no eyebrow, every list empty and
 * no optional section), which the API stores as "no content".
 */
export function formToContent(form: PoojaContentForm): PoojaContent | null {
  const eyebrow = form.eyebrow.trim();
  const content: PoojaContent = {
    overview: texts(form.overview),
    quickFacts: form.quickFacts
      .map((fact) => ({ label: fact.label.trim(), value: fact.value.trim() }))
      .filter((fact) => fact.label || fact.value),
    ritualSteps: form.ritualSteps
      .map((step) => ({ title: step.title.trim(), description: step.description.trim() }))
      .filter((step) => step.title || step.description),
    requiredDetails: texts(form.requiredDetails),
    preparationNotes: texts(form.preparationNotes),
    relatedSlugs: texts(form.relatedSlugs),
  };
  if (eyebrow) content.eyebrow = eyebrow;
  if (form.optionalSectionEnabled) {
    content.optionalSection = { title: form.optionalSection.title.trim(), body: texts(form.optionalSection.body) };
  }
  const empty =
    !content.eyebrow &&
    !content.optionalSection &&
    [content.overview, content.quickFacts, content.ritualSteps, content.requiredDetails, content.preparationNotes, content.relatedSlugs].every(
      (list) => list.length === 0,
    );
  return empty ? null : content;
}

export function poojaToFormValues(pooja: ManagedPooja | null | undefined): PoojaFormValues {
  if (!pooja) {
    return {
      name: "",
      shortDescription: "",
      description: "",
      categoryIds: [],
      imageUrl: null,
      pricePaise: null,
      durationMinutes: "",
      featured: false,
      status: "draft",
      content: emptyPoojaContentForm(),
    };
  }
  const primary = pooja.categories.find((category) => category.isPrimary)?.id ?? pooja.category?.id ?? pooja.categoryId;
  const others = pooja.categories.map((category) => category.id).filter((id) => id !== primary);
  return {
    name: pooja.name,
    shortDescription: pooja.shortDescription,
    description: pooja.description,
    categoryIds: primary ? [primary, ...others] : others,
    imageUrl: pooja.imageUrl,
    pricePaise: pooja.pricePaise,
    durationMinutes: pooja.durationMinutes === null ? "" : String(pooja.durationMinutes),
    featured: pooja.featured,
    status: pooja.status,
    content: contentToForm(pooja.content),
  };
}

/** Create payload (includes the initial `status`). */
export function formValuesToPoojaInput(values: PoojaFormValues): PoojaInput {
  const duration = values.durationMinutes.trim();
  return {
    name: values.name.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    categoryIds: [...new Set(values.categoryIds)],
    imageUrl: values.imageUrl,
    pricePaise: values.pricePaise,
    durationMinutes: duration === "" ? null : Number(duration),
    featured: values.featured,
    content: formToContent(values.content),
    status: values.status,
  };
}

/** Update payload: same fields, status excluded (the status endpoint owns it). */
export function formValuesToPoojaUpdate(values: PoojaFormValues): Omit<PoojaInput, "status"> {
  const input: Partial<PoojaInput> = formValuesToPoojaInput(values);
  delete input.status;
  return input as Omit<PoojaInput, "status">;
}

/** Adds or removes a category; the first selected stays primary. */
export function toggleCategoryId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

/** Moves `id` to the front (primary). No-op when it is not selected. */
export function makePrimaryCategory(ids: readonly string[], id: string): string[] {
  if (!ids.includes(id)) return [...ids];
  return [id, ...ids.filter((item) => item !== id)];
}

/** Moves the category at `index` by `delta` positions (clamped). */
export function moveCategory(ids: readonly string[], index: number, delta: number): string[] {
  const target = Math.min(ids.length - 1, Math.max(0, index + delta));
  if (index < 0 || index >= ids.length || target === index) return [...ids];
  const next = [...ids];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
