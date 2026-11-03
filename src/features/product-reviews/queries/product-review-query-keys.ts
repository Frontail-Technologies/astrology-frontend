import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { ProductReviewListFilter, ProductReviewListIdFilter } from "../state/product-review-list-state";

const keys = createAdminQueryKeys("product-reviews");

export const productReviewKeys = {
  ...keys,
  list: (state: AdminListState<ProductReviewListFilter, ProductReviewListIdFilter>) => keys.list(state),
};
