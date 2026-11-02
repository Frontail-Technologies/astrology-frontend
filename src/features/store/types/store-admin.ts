/** Admin shapes for `/admin/store/*`. Separate from the storefront's `types/store.ts`. */
export type CatalogStatus = "draft" | "published" | "coming_soon" | "unavailable";
export type ProductAvailabilityStatus = "in_stock" | "out_of_stock" | "available" | "coming_soon" | "unavailable";

export type StoreFaqEntry = { question: string; answer: string };

export type StoreCategoryDetails = {
  about?: string[];
  highlights?: string[];
  faq?: StoreFaqEntry[];
};

/** `GET /admin/store/categories` item and detail (backend `toAdminCategory`). */
export type ManagedStoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  details: StoreCategoryDetails | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Non-deleted products in the category. */
  productCount: number;
};

export type StoreCategoryInput = {
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  details: StoreCategoryDetails | null;
  /** Create only; later changes go through `PATCH /categories/:id/status`. */
  active?: boolean;
};

export type StoreCategoryStatusInput = { active: boolean };

export type StoreProductDetails = {
  overview?: string[];
  highlights?: string[];
  specifications?: { label: string; value: string }[];
  careInstructions?: string[];
  faq?: StoreFaqEntry[];
};

export type StoreProductMedia = { id: string; url: string; alt: string | null; isPrimary: boolean; sortOrder: number };
export type StoreProductMediaInput = { id?: string; url: string; alt: string | null; isPrimary: boolean };

/** `GET /admin/store/products` item and detail (backend `toAdminProduct`). */
export type ManagedStoreProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string | null;
  pricePaise: number | null;
  inventoryTracked: boolean;
  inventoryQuantity: number | null;
  featured: boolean;
  catalogStatus: CatalogStatus;
  details: StoreProductDetails;
  createdAt: string;
  updatedAt: string;
  currency: "INR";
  category: { id: string; name: string; slug: string } | null;
  availability: { status: ProductAvailabilityStatus; purchasable: boolean };
  media: StoreProductMedia[];
};

export type StoreProductInput = {
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string | null;
  pricePaise: number | null;
  inventoryTracked: boolean;
  inventoryQuantity: number | null;
  featured: boolean;
  catalogStatus: CatalogStatus;
  details: StoreProductDetails;
  media: StoreProductMediaInput[];
};

export type StoreProductStatusInput = { catalogStatus?: CatalogStatus; featured?: boolean };

/** The part of `GET /admin/reports/store` the store overview uses. */
export type StoreLowStockReport = {
  lowStock: { productId: string; name: string; slug: string; inventoryQuantity: number }[];
  lowStockThreshold: number;
};
