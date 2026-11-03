"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { getProductReview, listProductReviews, moderateProductReview } from "../api/product-review-admin-api";
import { productReviewKeys } from "../queries/product-review-query-keys";
import { productReviewListConfig } from "../state/product-review-list-state";
import type { ProductReviewModerationInput } from "../types/product-review-admin";

export function useProductReviewList() {
  return useAdminList(productReviewListConfig, productReviewKeys.list, listProductReviews);
}

export function useProductReviewDetail(id: string) {
  return useAdminDetail(productReviewKeys.detail(id), (signal) => getProductReview(id, signal), Boolean(id));
}

export function useModerateProductReview(id: string) {
  return useAdminMutation({
    mutationFn: (input: ProductReviewModerationInput) => moderateProductReview(id, input),
    invalidate: [productReviewKeys.all],
    successMessage: "Review moderated",
    toastErrors: false,
  });
}
