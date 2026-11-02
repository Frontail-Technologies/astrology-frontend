import { isUuid, type AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { catalogStatusLabels, categoryActiveLabels, productFeaturedLabels } from "../constants/store-status.ts";

export type StoreCategoryListFilter = "active";
export type StoreProductListFilter = "categoryId" | "catalogStatus" | "featured";


export const storeCategoryListConfig: AdminListConfig<StoreCategoryListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  filters: { active: Object.keys(categoryActiveLabels) },
};

export const storeProductListConfig: AdminListConfig<StoreProductListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  filters: { categoryId: isUuid, catalogStatus: Object.keys(catalogStatusLabels), featured: Object.keys(productFeaturedLabels) },
};
