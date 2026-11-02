/**
 * Store category / product editor form <-> API mapping. Pure (no React, no `@/` aliases) so it runs under
 * `node --test`. String lists are `{ text }` rows (react-hook-form field arrays need objects); blank rows are
 * dropped on submit.
 */
import type {
  CatalogStatus,
  ManagedStoreCategory,
  ManagedStoreProduct,
  StoreCategoryDetails,
  StoreCategoryInput,
  StoreFaqEntry,
  StoreProductDetails,
  StoreProductInput,
  StoreProductMedia,
  StoreProductMediaInput,
} from "../types/store-admin.ts";

export type TextRow = { text: string };
/** Same shape as the admin gallery field's items (`AdminGalleryImage`). */
export type GalleryImage = { url: string; alt: string; isPrimary: boolean };

const rows = (items: readonly string[] | undefined): TextRow[] => (items ?? []).map((text) => ({ text }));
const texts = (items: readonly TextRow[]): string[] => items.map((item) => item.text.trim()).filter(Boolean);
const faqRows = (items: readonly StoreFaqEntry[] | undefined) => (items ?? []).map((entry) => ({ question: entry.question, answer: entry.answer }));
const faqEntries = (items: readonly StoreFaqEntry[]) =>
  items.map((entry) => ({ question: entry.question.trim(), answer: entry.answer.trim() })).filter((entry) => entry.question || entry.answer);

/** Whole number as typed ("" = empty). Returns `null` for empty, `NaN` for anything that is not a whole number. */
export function parseWholeNumber(text: string): number | null {
  const value = text.trim();
  if (value === "") return null;
  return /^\d+$/.test(value) ? Number(value) : Number.NaN;
}

/* ----------------------------------------------------------------------------------------------- categories */

export type StoreCategoryFormValues = {
  name: string;
  description: string;
  imageUrl: string | null;
  sortOrder: string;
  /** Create only. */
  active: boolean;
  details: { about: TextRow[]; highlights: TextRow[]; faq: StoreFaqEntry[] };
};

export function categoryToFormValues(category: ManagedStoreCategory | null | undefined): StoreCategoryFormValues {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? null,
    sortOrder: String(category?.sortOrder ?? 0),
    active: category?.active ?? true,
    details: {
      about: rows(category?.details?.about),
      highlights: rows(category?.details?.highlights),
      faq: faqRows(category?.details?.faq),
    },
  };
}

/** `null` when every list is empty (the API stores "no landing content"). */
export function formToCategoryDetails(details: StoreCategoryFormValues["details"]): StoreCategoryDetails | null {
  const about = texts(details.about);
  const highlights = texts(details.highlights);
  const faq = faqEntries(details.faq);
  if (!about.length && !highlights.length && !faq.length) return null;
  return { about, highlights, faq };
}

export function formToCategoryInput(values: StoreCategoryFormValues): StoreCategoryInput {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    description: description || null,
    imageUrl: values.imageUrl,
    sortOrder: parseWholeNumber(values.sortOrder) ?? 0,
    details: formToCategoryDetails(values.details),
    active: values.active,
  };
}

export function formToCategoryUpdate(values: StoreCategoryFormValues): Omit<StoreCategoryInput, "active"> {
  const input: Partial<StoreCategoryInput> = formToCategoryInput(values);
  delete input.active;
  return input as Omit<StoreCategoryInput, "active">;
}

/* ------------------------------------------------------------------------------------------------- products */

export type StoreProductFormValues = {
  name: string;
  shortDescription: string;
  description: string;
  /** "" = uncategorized. */
  categoryId: string;
  pricePaise: number | null;
  inventoryTracked: boolean;
  inventoryQuantity: string;
  featured: boolean;
  catalogStatus: CatalogStatus;
  details: {
    overview: TextRow[];
    highlights: TextRow[];
    specifications: { label: string; value: string }[];
    careInstructions: TextRow[];
    faq: StoreFaqEntry[];
  };
  media: GalleryImage[];
};

/** API media (sorted by `sortOrder`) -> gallery items; a missing alt becomes "". */
export function productMediaToGallery(media: readonly StoreProductMedia[]): GalleryImage[] {
  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
  const images = sorted.map((item) => ({ url: item.url, alt: item.alt ?? "", isPrimary: item.isPrimary }));
  if (images.length && !images.some((image) => image.isPrimary)) images[0] = { ...images[0], isPrimary: true };
  return images;
}

/**
 * Gallery items -> API media in display order. Existing media rows keep their `id` (matched by URL, each id used
 * once) so the server updates them instead of recreating them; blank alt becomes `null`; at most one primary.
 */
export function galleryToProductMedia(images: readonly GalleryImage[], existing: readonly StoreProductMedia[] = []): StoreProductMediaInput[] {
  const available = [...existing];
  let primarySeen = false;
  return images.map((image) => {
    const index = available.findIndex((item) => item.url === image.url);
    const id = index === -1 ? undefined : available.splice(index, 1)[0].id;
    const isPrimary = image.isPrimary && !primarySeen;
    if (isPrimary) primarySeen = true;
    const alt = image.alt.trim();
    return { ...(id ? { id } : {}), url: image.url, alt: alt || null, isPrimary };
  });
}

export function productToFormValues(product: ManagedStoreProduct | null | undefined): StoreProductFormValues {
  const details = product?.details ?? {};
  return {
    name: product?.name ?? "",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? "",
    pricePaise: product?.pricePaise ?? null,
    inventoryTracked: product?.inventoryTracked ?? false,
    inventoryQuantity: product?.inventoryQuantity === null || product?.inventoryQuantity === undefined ? "" : String(product.inventoryQuantity),
    featured: product?.featured ?? false,
    catalogStatus: product?.catalogStatus ?? "draft",
    details: {
      overview: rows(details.overview),
      highlights: rows(details.highlights),
      specifications: (details.specifications ?? []).map((spec) => ({ label: spec.label, value: spec.value })),
      careInstructions: rows(details.careInstructions),
      faq: faqRows(details.faq),
    },
    media: productMediaToGallery(product?.media ?? []),
  };
}

export function formToProductDetails(details: StoreProductFormValues["details"]): StoreProductDetails {
  return {
    overview: texts(details.overview),
    highlights: texts(details.highlights),
    specifications: details.specifications
      .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.label || spec.value),
    careInstructions: texts(details.careInstructions),
    faq: faqEntries(details.faq),
  };
}

export function formToProductInput(values: StoreProductFormValues, existingMedia: readonly StoreProductMedia[] = []): StoreProductInput {
  const quantity = parseWholeNumber(values.inventoryQuantity);
  return {
    name: values.name.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    categoryId: values.categoryId || null,
    pricePaise: values.pricePaise,
    inventoryTracked: values.inventoryTracked,
    // Untracked products keep no quantity; tracked ones require one (validated by the form schema).
    inventoryQuantity: values.inventoryTracked ? quantity : null,
    featured: values.featured,
    catalogStatus: values.catalogStatus,
    details: formToProductDetails(values.details),
    media: galleryToProductMedia(values.media, existingMedia),
  };
}
