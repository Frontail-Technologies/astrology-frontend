import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type {
  ManagedStoreCategory,
  ManagedStoreProduct,
  StoreCategoryInput,
  StoreCategoryStatusInput,
  StoreLowStockReport,
  StoreProductInput,
  StoreProductStatusInput,
} from "../types/store-admin";

/* categories */

export function listStoreCategories(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedStoreCategory>("/store/categories", query, signal);
}

export function getStoreCategory(id: string, signal?: AbortSignal) {
  return adminGet<ManagedStoreCategory>(`/store/categories/${encodeId(id)}`, { signal });
}

export function createStoreCategory(input: StoreCategoryInput) {
  return adminSend<ManagedStoreCategory>("/store/categories", "POST", input);
}

export function updateStoreCategory(id: string, input: Omit<StoreCategoryInput, "active">) {
  return adminSend<ManagedStoreCategory>(`/store/categories/${encodeId(id)}`, "PATCH", input);
}

export function updateStoreCategoryStatus(id: string, input: StoreCategoryStatusInput) {
  return adminSend<ManagedStoreCategory>(`/store/categories/${encodeId(id)}/status`, "PATCH", input);
}

/** 409 STORE_CATEGORY_IN_USE while the category has products. */
export function deleteStoreCategory(id: string) {
  return adminSend<{ deleted: true }>(`/store/categories/${encodeId(id)}`, "DELETE");
}

/* products */

export function listStoreProducts(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedStoreProduct>("/store/products", query, signal);
}

export function getStoreProduct(id: string, signal?: AbortSignal) {
  return adminGet<ManagedStoreProduct>(`/store/products/${encodeId(id)}`, { signal });
}

export function createStoreProduct(input: StoreProductInput) {
  return adminSend<ManagedStoreProduct>("/store/products", "POST", input);
}

export function updateStoreProduct(id: string, input: StoreProductInput) {
  return adminSend<ManagedStoreProduct>(`/store/products/${encodeId(id)}`, "PATCH", input);
}

export function updateStoreProductStatus(id: string, input: StoreProductStatusInput) {
  return adminSend<ManagedStoreProduct>(`/store/products/${encodeId(id)}/status`, "PATCH", input);
}

export function deleteStoreProduct(id: string) {
  return adminSend<{ deleted: true }>(`/store/products/${encodeId(id)}`, "DELETE");
}

/** Low-stock list and threshold from the store report (default range; the stock list does not depend on it). */
export function getStoreLowStock(signal?: AbortSignal) {
  return adminGet<StoreLowStockReport>("/reports/store", { signal });
}
