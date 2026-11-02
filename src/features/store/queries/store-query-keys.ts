import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { StoreCategoryListFilter, StoreProductListFilter } from "../state/store-list-state";

const categories = createAdminQueryKeys("store-categories");
const products = createAdminQueryKeys("store-products");

export const storeCategoryKeys = {
  ...categories,
  list: (state: AdminListState<StoreCategoryListFilter, never>) => categories.list(state),
  /** Every category (first 100) for pickers and filters. */
  options: () => categories.scoped("options"),
};

export const storeProductKeys = {
  ...products,
  list: (state: AdminListState<StoreProductListFilter, never>) => products.list(state),
  search: (search: string) => products.scoped("search", search),
  /** Counts for the store overview (`limit=1` pages, only `total` is read). */
  count: (filter: Record<string, string>) => products.scoped("count", filter),
  lowStock: () => products.scoped("low-stock"),
};
