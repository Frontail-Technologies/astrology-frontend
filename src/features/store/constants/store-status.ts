import type { CatalogStatus, ProductAvailabilityStatus } from "../types/store-admin.ts";

export const catalogStatuses = ["draft", "published", "coming_soon", "unavailable"] as const satisfies readonly CatalogStatus[];

export const catalogStatusLabels: Record<CatalogStatus, string> = {
  draft: "Draft",
  published: "Published",
  coming_soon: "Coming soon",
  unavailable: "Unavailable",
};
export const catalogStatusVariants: Record<CatalogStatus, "muted" | "online" | "pending" | "unavailable"> = {
  draft: "muted",
  published: "online",
  coming_soon: "pending",
  unavailable: "unavailable",
};
export const catalogStatusDescriptions: Record<CatalogStatus, string> = {
  draft: "Hidden from the storefront.",
  published: "Listed on the storefront; purchasable when priced and in stock.",
  coming_soon: "Listed on the storefront but cannot be bought yet.",
  unavailable: "Listed as unavailable; cannot be bought.",
};

export const availabilityLabels: Record<ProductAvailabilityStatus, string> = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  available: "Available",
  coming_soon: "Coming soon",
  unavailable: "Unavailable",
};
export const availabilityVariants: Record<ProductAvailabilityStatus, "online" | "unavailable" | "pending" | "muted"> = {
  in_stock: "online",
  out_of_stock: "unavailable",
  available: "online",
  coming_soon: "pending",
  unavailable: "muted",
};

export const categoryActiveLabels = { true: "Active", false: "Inactive" } as const;
export const productFeaturedLabels = { true: "Featured", false: "Not featured" } as const;

export const STORE_LIMITS = {
  maxMedia: 20,
  maxListItems: 20,
  maxSpecifications: 30,
  maxSortOrder: 100_000,
  maxInventory: 1_000_000,
  maxPricePaise: 1_000_000_000,
} as const;

/** 409 when deleting a category that still has products. */
export const STORE_CATEGORY_IN_USE = "STORE_CATEGORY_IN_USE";
