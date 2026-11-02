import type { AdminReviewStatus, AdminReviewTarget, AdminReviewTargetType } from "../types/review-admin.ts";

export const reviewStatusLabels: Record<AdminReviewStatus, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected", reported: "Reported" };
export const reviewStatusVariants: Record<AdminReviewStatus, "pending" | "online" | "unavailable" | "saffron"> = {
  pending: "pending",
  approved: "online",
  rejected: "unavailable",
  reported: "saffron",
};

export const reviewTargetLabels: Record<AdminReviewTargetType, string> = { astrologer: "Astrologer", pooja: "Pooja", product: "Product" };

export const reviewRatingLabels: Record<string, string> = { "5": "5 stars", "4": "4 stars", "3": "3 stars", "2": "2 stars", "1": "1 star" };

/** Button labels for the server's `allowedTransitions`. */
export const reviewTransitionLabels: Record<AdminReviewStatus, string> = { approved: "Approve", rejected: "Reject", reported: "Mark reported", pending: "Back to pending" };

/** Targets that must carry a moderation note (the API accepts it optionally; the admin UI asks for one). */
export const REVIEW_NOTE_REQUIRED: readonly AdminReviewStatus[] = ["rejected", "reported"];
export const REVIEW_NOTE_MAX = 1000;

/** Admin route of the reviewed entity. */
export function reviewTargetHref(target: Pick<AdminReviewTarget, "type" | "id">): string {
  if (target.type === "product") return `/admin/store/products/${target.id}`;
  if (target.type === "pooja") return `/admin/poojas/${target.id}`;
  return `/admin/astrologers/${target.id}`;
}

export const REVIEW_ERROR_HINTS: Record<string, string> = {
  INVALID_REVIEW_TRANSITION: "This review changed in the meantime. Close the dialog to see its current status.",
};
