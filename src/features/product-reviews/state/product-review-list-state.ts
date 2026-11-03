import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { reviewRatingLabels, reviewStatusLabels } from "../../reviews/constants/review-status.ts";

export type ProductReviewListFilter = "status" | "rating";
export type ProductReviewListIdFilter = "productId";

export const productReviewListConfig: AdminListConfig<ProductReviewListFilter, ProductReviewListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  filters: { status: Object.keys(reviewStatusLabels), rating: Object.keys(reviewRatingLabels) },
  idFilters: ["productId"],
};
