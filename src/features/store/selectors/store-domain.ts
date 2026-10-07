import { canonicalProductCategories } from "../data/categories";
import { canonicalProducts } from "../data/products";
import type { ProductCatalogStatus, ProductCategory, ProductManagementStatus, StoreProduct } from "../types/store";

export const LOW_STOCK_THRESHOLD = 5;

const catalogLabels: Record<ProductCatalogStatus, string> = {
  available: "Available",
  "coming-soon": "Coming soon",
  unavailable: "Unavailable",
};
const managementLabels: Record<ProductManagementStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

export const getProductBySlug = (slug: string) => canonicalProducts.find((p) => p.slug === slug);
export const getCategoryBySlug = (slug: string) => canonicalProductCategories.find((c) => c.slug === slug);
export const getProductCategory = (product: StoreProduct, categories = canonicalProductCategories) =>
  categories.find((c) => c.id === product.categoryId);
export const getProductPrimaryImage = (product: StoreProduct) => product.media[0];
export const getCategoryProductCount = (category: ProductCategory, products = canonicalProducts) =>
  products.filter((p) => p.categoryId === category.id).length;
export const formatStorePrice = (priceInPaise?: number, currency: "INR" = "INR") =>
  priceInPaise === undefined
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: priceInPaise % 100 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(
        priceInPaise / 100,
      );
export const getProductCatalogStatusLabel = (status?: ProductCatalogStatus) =>
  status ? catalogLabels[status] : "Not configured";
export const getProductManagementStatusLabel = (status?: ProductManagementStatus) =>
  status ? managementLabels[status] : "Not configured";

export const isLowStock = (product: StoreProduct) =>
  product.inventory?.trackInventory === true &&
  product.inventory.stockQuantity !== undefined &&
  product.inventory.stockQuantity <= LOW_STOCK_THRESHOLD;
