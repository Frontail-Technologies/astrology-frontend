import type { AdminReviewStatus } from "../../reviews/types/review-admin.ts";

/** `GET /admin/product-reviews` item and detail: reviews customers leave on store products they received. */
export type AdminProductReview = {
  id: string;
  rating: number;
  body: string;
  status: AdminReviewStatus;
  moderationNote: string | null;
  createdAt: string;
  updatedAt: string;
  product: { id: string; name: string; slug: string };
  /** Customers who signed up with a phone number have no email. */
  customer: { id: string; name: string | null; email: string | null; phone: string | null };
  /** The delivered order that made this a verified purchase. */
  order: { id: string; orderNumber: string };
  allowedTransitions: Exclude<AdminReviewStatus, "pending">[];
};

export type ProductReviewModerationInput = {
  status: Exclude<AdminReviewStatus, "pending">;
  moderationNote?: string | null;
};
