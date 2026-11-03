import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminProductReview, ProductReviewModerationInput } from "../types/product-review-admin";

export function listProductReviews(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminProductReview>("/product-reviews", query, signal);
}

export function getProductReview(id: string, signal?: AbortSignal) {
  return adminGet<AdminProductReview>(`/product-reviews/${encodeId(id)}`, { signal });
}

/** Server re-validates the transition (409 `INVALID_REVIEW_TRANSITION`, 409 `REVIEW_CHANGED`). */
export function moderateProductReview(id: string, input: ProductReviewModerationInput) {
  return adminSend<AdminProductReview>(`/product-reviews/${encodeId(id)}/status`, "PATCH", input);
}
