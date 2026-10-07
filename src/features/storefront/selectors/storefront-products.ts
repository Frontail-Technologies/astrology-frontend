import { formatStorePrice } from "@/features/store/selectors/store-domain";
import type { ProductCategory, StoreProduct } from "@/features/store/types/store";

export type StoreSort = "featured" | "price-asc" | "price-desc" | "name";

export const storeSortOptions: Array<{ value: StoreSort; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name" },
];

export type StoreFilters = {
  availability: "all" | "available" | "coming-soon";
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
};

export const emptyStoreFilters: StoreFilters = { availability: "all" };

// ── Visibility ──────────────────────────────────────────────────────────────

export const isCategoryPublic = (category: ProductCategory) => category.managementStatus === "active";

/** A product page is public when it is active and its category (if any) is public. */
export const isProductPublic = (product: StoreProduct, categories: ProductCategory[]) => {
  if (product.managementStatus !== "active") return false;
  if (!product.categoryId) return true;
  const category = categories.find((item) => item.id === product.categoryId);
  return category ? isCategoryPublic(category) : false;
};

/** Listings additionally hide products that are explicitly unavailable. */
export const isProductListed = (product: StoreProduct, categories: ProductCategory[]) =>
  isProductPublic(product, categories) && product.catalogStatus !== "unavailable";

export const getPublicCategories = (categories: ProductCategory[]) => categories.filter(isCategoryPublic);

export const getListedProducts = (products: StoreProduct[], categories: ProductCategory[]) =>
  products.filter((product) => isProductListed(product, categories));

// ── Selection ───────────────────────────────────────────────────────────────

export const getCategoryProducts = (products: StoreProduct[], categoryId: string) =>
  products.filter((product) => product.categoryId === categoryId);

export function getFeaturedProducts(listed: StoreProduct[], limit = 4) {
  const featured = listed.filter((product) => product.featured);
  const fallback = listed.filter((product) => !product.featured && product.catalogStatus === "available");
  return [...featured, ...fallback].slice(0, limit);
}

export function getRelatedProducts(product: StoreProduct, listed: StoreProduct[], limit = 4) {
  const others = listed.filter((item) => item.id !== product.id);
  const sameCategory = others.filter((item) => item.categoryId === product.categoryId);
  const fallback = others.filter((item) => item.categoryId !== product.categoryId && item.catalogStatus === "available");
  return [...sameCategory, ...fallback].slice(0, limit);
}

export function searchProducts(listed: StoreProduct[], categories: ProductCategory[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listed;
  return listed.filter((product) => {
    const category = categories.find((item) => item.id === product.categoryId);
    return [product.name, product.shortDescription, category?.name].some((value) => value?.toLowerCase().includes(q));
  });
}

// ── Filtering and sorting ───────────────────────────────────────────────────

export function filterProducts(products: StoreProduct[], filters: StoreFilters) {
  return products.filter((product) => {
    if (filters.inStockOnly && !getProductAvailability(product).purchasable) return false;
    if (filters.featuredOnly && !product.featured) return false;
    if (filters.availability !== "all" && product.catalogStatus !== filters.availability) return false;
    const price = product.pricing.priceInPaise;
    if (filters.minPrice !== undefined && (price === undefined || price < filters.minPrice * 100)) return false;
    if (filters.maxPrice !== undefined && (price === undefined || price > filters.maxPrice * 100)) return false;
    return true;
  });
}

export function sortProducts(products: StoreProduct[], sort: StoreSort) {
  const list = [...products];
  const price = (product: StoreProduct) => product.pricing.priceInPaise;
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity));
    case "price-desc":
      return list.sort((a, b) => (price(b) ?? -Infinity) - (price(a) ?? -Infinity));
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

export function getPriceBoundsInRupees(products: StoreProduct[]) {
  const prices = products.flatMap((product) => (product.pricing.priceInPaise === undefined ? [] : [product.pricing.priceInPaise]));
  if (!prices.length) return null;
  return { min: Math.floor(Math.min(...prices) / 100), max: Math.ceil(Math.max(...prices) / 100) };
}

export const countActiveFilters = (filters: StoreFilters) =>
  Number(filters.availability !== "all") + Number(filters.minPrice !== undefined) + Number(filters.maxPrice !== undefined);

export const hasAnyFilter = (filters: StoreFilters) =>
  countActiveFilters(filters) > 0 || Boolean(filters.inStockOnly) || Boolean(filters.featuredOnly);

// ── Presentation semantics ──────────────────────────────────────────────────

export const formatProductPrice = (product: StoreProduct) =>
  product.pricing.priceInPaise === undefined ? null : formatStorePrice(product.pricing.priceInPaise);

export type ProductAvailability = {
  label: string;
  tone: "positive" | "neutral" | "negative";
  purchasable: boolean;
};

export function getProductAvailability(product: StoreProduct): ProductAvailability {
  if (product.catalogStatus === "unavailable") return { label: "Currently unavailable", tone: "negative", purchasable: false };
  if (product.catalogStatus === "coming-soon") return { label: "Coming soon", tone: "neutral", purchasable: false };
  if (product.inventory?.trackInventory) {
    return (product.inventory.stockQuantity ?? 0) > 0
      ? { label: "In stock", tone: "positive", purchasable: true }
      : { label: "Out of stock", tone: "negative", purchasable: false };
  }
  return { label: "Available", tone: "positive", purchasable: true };
}

// ── Purchase rules (single source for PDP and Cart) ─────────────────────────

/** Maximum purchasable quantity. undefined means inventory is not tracked (no limit). */
export const getMaxQuantity = (product: StoreProduct): number | undefined =>
  product.inventory?.trackInventory ? Math.max(0, product.inventory.stockQuantity ?? 0) : undefined;

export const hasPurchasablePrice = (product: StoreProduct) =>
  product.pricing.priceInPaise !== undefined && product.pricing.priceInPaise > 0;

export const isProductPurchasable = (product: StoreProduct) =>
  hasPurchasablePrice(product) && getProductAvailability(product).purchasable;
