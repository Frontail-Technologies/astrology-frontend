export type StoreCurrency = "INR";

export type ProductCatalogStatus = "available" | "coming-soon" | "unavailable";
export type ProductManagementStatus = "draft" | "active" | "archived";
export type ProductCategoryManagementStatus = "draft" | "active" | "archived";

export type ProductMedia = {
  id?: string;
  src: string;
  alt?: string;
};

export type ProductPricing = {
  priceInPaise?: number;
  currency: StoreCurrency;
};

export type StoreFaq = { question: string; answer: string };

/** Optional public editorial content. Managed by the future Admin API. */
export type ProductDetails = {
  overview?: string[];
  highlights?: string[];
  specifications?: Array<{ label: string; value: string }>;
  careInstructions?: string[];
  faq?: StoreFaq[];
};

export type CategoryDetails = {
  about?: string[];
  highlights?: string[];
  faq?: StoreFaq[];
};

export type ProductInventory = {
  trackInventory?: boolean;
  stockQuantity?: number;
};

/** Future-facing content record. Records are owned by the Admin API, not this frontend. */
export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description?: string;
  categoryId?: string;
  media: ProductMedia[];
  pricing: ProductPricing;
  inventory?: ProductInventory;
  featured?: boolean;
  catalogStatus?: ProductCatalogStatus;
  managementStatus?: ProductManagementStatus;
  details?: ProductDetails;
};

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageSrc?: string;
  managementStatus?: ProductCategoryManagementStatus;
  details?: CategoryDetails;
};

export const productCatalogStatusValues = ["available", "coming-soon", "unavailable"] as const;
export const productManagementStatusValues = ["draft", "active", "archived"] as const;
