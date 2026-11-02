/** Admin shapes for `/admin/reviews` (backend `toAdminReview`). Separate from the public-site `types/review.ts`. */
export type AdminReviewStatus = "pending" | "approved" | "rejected" | "reported";
export type AdminReviewTargetType = "astrologer" | "pooja" | "product";

export type AdminReviewTarget = { type: AdminReviewTargetType; id: string; name: string | null; slug: string | null };

export type AdminReview = {
  id: string;
  customerUserId: string;
  astrologerId: string | null;
  consultationId: string | null;
  poojaId: string | null;
  productId: string | null;
  orderId: string | null;
  poojaRequestId: string | null;
  targetType: AdminReviewTargetType;
  rating: number;
  title: string | null;
  body: string;
  status: AdminReviewStatus;
  moderationNote: string | null;
  moderatedAt: string | null;
  moderatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  target: AdminReviewTarget;
  customer: { id: string; email: string; name: string | null } | null;
  astrologer: { id: string; displayName: string; slug: string } | null;
  /** True when the linked consultation completed. */
  verifiedSession: boolean;
  consultationStatus: string | null;
  allowedTransitions: AdminReviewStatus[];
};

/** `PATCH /admin/reviews/:id/status`. The note is 1–1000 characters (trimmed) or null. */
export type ReviewModerationInput = { status: AdminReviewStatus; moderationNote?: string | null };
