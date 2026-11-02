"use client";

import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";

import { useAdminDetail, useAdminQuery } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import {
  createStoreCategory,
  createStoreProduct,
  deleteStoreCategory,
  deleteStoreProduct,
  getStoreCategory,
  getStoreLowStock,
  getStoreProduct,
  listStoreCategories,
  listStoreProducts,
  updateStoreCategory,
  updateStoreCategoryStatus,
  updateStoreProduct,
  updateStoreProductStatus,
} from "../api/store-admin-api";
import { storeCategoryKeys, storeProductKeys } from "../queries/store-query-keys";
import { storeCategoryListConfig, storeProductListConfig } from "../state/store-list-state";
import type { StoreCategoryInput, StoreCategoryStatusInput, StoreProductInput, StoreProductStatusInput } from "../types/store-admin";

/* categories */

export function useStoreCategoryList() {
  return useAdminList(storeCategoryListConfig, storeCategoryKeys.list, listStoreCategories);
}

export function useStoreCategoryDetail(id: string) {
  return useAdminDetail(storeCategoryKeys.detail(id), (signal) => getStoreCategory(id, signal), Boolean(id));
}

/** All categories (active and inactive, first 100 by sort order) for pickers and the product category filter. */
export function useStoreCategoryOptions(enabled = true) {
  return useQuery({
    queryKey: storeCategoryKeys.options(),
    queryFn: ({ signal }) => listStoreCategories({ page: 1, limit: 100 }, signal),
    select: (page) => page.items,
    staleTime: 60_000,
    enabled,
  });
}

export function useCreateStoreCategory() {
  return useAdminMutation({
    mutationFn: (input: StoreCategoryInput) => createStoreCategory(input),
    invalidate: [storeCategoryKeys.all],
    successMessage: "Category created",
    toastErrors: false,
  });
}

export function useUpdateStoreCategory(id: string) {
  return useAdminMutation({
    mutationFn: (input: Omit<StoreCategoryInput, "active">) => updateStoreCategory(id, input),
    // Product rows embed the category name.
    invalidate: [storeCategoryKeys.all, storeProductKeys.all],
    successMessage: "Category saved",
    toastErrors: false,
  });
}

export function useStoreCategoryStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (input: StoreCategoryStatusInput) => updateStoreCategoryStatus(id, input),
    invalidate: [storeCategoryKeys.all],
    successMessage: (result) => (result.active ? "Category activated" : "Category deactivated"),
    toastErrors: false,
  });
}

export const storeCategoryDeleteOptions = {
  mutationFn: deleteStoreCategory,
  invalidate: [storeCategoryKeys.all],
  remove: (id: string) => [storeCategoryKeys.detail(id)],
};

/* products */

export function useStoreProductList() {
  return useAdminList(storeProductListConfig, storeProductKeys.list, listStoreProducts);
}

export function useStoreProductDetail(id: string) {
  return useAdminDetail(storeProductKeys.detail(id), (signal) => getStoreProduct(id, signal), Boolean(id));
}

export function useCreateStoreProduct() {
  return useAdminMutation({
    mutationFn: (input: StoreProductInput) => createStoreProduct(input),
    invalidate: [storeProductKeys.all, storeCategoryKeys.all],
    successMessage: "Product created",
    toastErrors: false,
  });
}

export function useUpdateStoreProduct(id: string) {
  return useAdminMutation({
    mutationFn: (input: StoreProductInput) => updateStoreProduct(id, input),
    invalidate: [storeProductKeys.all, storeCategoryKeys.all],
    successMessage: "Product saved",
    toastErrors: false,
  });
}

export function useStoreProductStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (input: StoreProductStatusInput) => updateStoreProductStatus(id, input),
    invalidate: [storeProductKeys.all],
    successMessage: "Product updated",
    toastErrors: false,
  });
}

export const storeProductDeleteOptions = {
  mutationFn: deleteStoreProduct,
  // Category product counts change too.
  invalidate: [storeProductKeys.all, storeCategoryKeys.all],
  remove: (id: string) => [storeProductKeys.detail(id)],
};

/** Server search over products (first 20 matches) for pickers such as coupon scope. */
export function useStoreProductSearch(search: string, enabled = true) {
  return useQuery({
    queryKey: storeProductKeys.search(search),
    queryFn: ({ signal }) => listStoreProducts({ page: 1, limit: 20, ...(search ? { search } : {}) }, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Product details for a set of ids (names for selected chips). */
export function useStoreProductsByIds(ids: readonly string[]) {
  return useQueries({
    queries: ids.map((id) => ({ queryKey: storeProductKeys.detail(id), queryFn: ({ signal }: { signal: AbortSignal }) => getStoreProduct(id, signal), staleTime: 60_000 })),
  });
}

/* overview */

function useProductCount(filter: Record<string, string>) {
  return useQuery({
    queryKey: storeProductKeys.count(filter),
    queryFn: ({ signal }) => listStoreProducts({ page: 1, limit: 1, ...filter }, signal),
    select: (page) => page.total,
  });
}

/** Real counts for the store overview, each from a `limit=1` list request. */
export function useStoreOverviewCounts() {
  const products = useProductCount({});
  const published = useProductCount({ catalogStatus: "published" });
  const featured = useProductCount({ featured: "true" });
  const drafts = useProductCount({ catalogStatus: "draft" });
  const categories = useQuery({
    queryKey: storeCategoryKeys.scoped("count"),
    queryFn: ({ signal }) => listStoreCategories({ page: 1, limit: 1 }, signal),
    select: (page) => page.total,
  });
  return { products, published, featured, drafts, categories };
}

export function useStoreLowStock() {
  return useAdminQuery(storeProductKeys.lowStock(), (signal) => getStoreLowStock(signal));
}

/** Most recently updated products (the list API's default order) for the overview. */
export function useRecentStoreProducts() {
  return useAdminQuery(storeProductKeys.scoped("recent"), (signal) => listStoreProducts({ page: 1, limit: 5 }, signal));
}
