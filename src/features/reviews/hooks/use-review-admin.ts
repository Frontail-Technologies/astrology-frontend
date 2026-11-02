"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { getReview, listReviews, moderateReview } from "../api/review-admin-api";
import { reviewKeys } from "../queries/review-query-keys";
import { reviewListConfig } from "../state/review-list-state";
import type { ReviewModerationInput } from "../types/review-admin";

export function useReviewList() {
  return useAdminList(reviewListConfig, reviewKeys.list, listReviews);
}

export function useReviewDetail(id: string) {
  return useAdminDetail(reviewKeys.detail(id), (signal) => getReview(id, signal), Boolean(id));
}

export function useModerateReview(id: string) {
  return useAdminMutation({
    mutationFn: (input: ReviewModerationInput) => moderateReview(id, input),
    invalidate: [reviewKeys.all],
    successMessage: "Review moderated",
    toastErrors: false,
  });
}
