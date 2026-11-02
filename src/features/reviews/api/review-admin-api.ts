import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminReview, ReviewModerationInput } from "../types/review-admin";

export function listReviews(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminReview>("/reviews", query, signal);
}

export function getReview(id: string, signal?: AbortSignal) {
  return adminGet<AdminReview>(`/reviews/${encodeId(id)}`, { signal });
}

/** Server re-validates the transition (409 `INVALID_REVIEW_TRANSITION`). */
export function moderateReview(id: string, input: ReviewModerationInput) {
  return adminSend<AdminReview>(`/reviews/${encodeId(id)}/status`, "PATCH", input);
}
