import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { reviewRatingLabels, reviewStatusLabels, reviewTargetLabels } from "../constants/review-status.ts";

export type ReviewListFilter = "status" | "targetType" | "rating";
export type ReviewListIdFilter = "astrologerId" | "poojaId" | "productId";

export const reviewListConfig: AdminListConfig<ReviewListFilter, ReviewListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  filters: { status: Object.keys(reviewStatusLabels), targetType: Object.keys(reviewTargetLabels), rating: Object.keys(reviewRatingLabels) },
  idFilters: ["astrologerId", "poojaId", "productId"],
};
