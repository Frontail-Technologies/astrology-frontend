"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import { useModerateProductReview, useProductReviewDetail } from "@/features/product-reviews/hooks/use-product-review-admin";
import { REVIEW_ERROR_HINTS, REVIEW_NOTE_REQUIRED, reviewStatusLabels, reviewStatusVariants, reviewTransitionLabels } from "@/features/reviews/constants/review-status";
import type { AdminReviewStatus } from "@/features/reviews/types/review-admin";
import { formatDateTime } from "../../lib/format";
import { ReviewRating } from "../reviews/admin-reviews-view";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { AdminTransitionActions } from "../shared/admin-transition-actions";

/** The product-review API stores notes up to 500 characters. */
const NOTE_MAX = 500;

type NoteDraft = { target: AdminReviewStatus | null; text: string };

export function AdminProductReviewDetailView({ reviewId }: { reviewId: string }) {
  const detail = useProductReviewDetail(reviewId);
  const moderate = useModerateProductReview(reviewId);
  const [draft, setDraft] = useState<NoteDraft>({ target: null, text: "" });
  const noteFor = (target: AdminReviewStatus) => (draft.target === target ? draft.text : "");
  const hint = moderate.error?.code ? (REVIEW_ERROR_HINTS[moderate.error.code] ?? (moderate.error.code === "REVIEW_CHANGED" ? moderate.error.message : undefined)) : undefined;

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="review">
      {() => {
        const review = detail.data!;
        const customerLabel = personPrimaryLabel(review.customer);
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`Review of ${review.product.name}`}
              description={`By ${customerLabel}`}
              backHref="/admin/product-reviews"
              backLabel="Product reviews"
              meta={
                <>
                  <AdminStatusBadge status={review.status} labels={reviewStatusLabels} variants={reviewStatusVariants} />
                  <span className="tabular-nums">Submitted {formatDateTime(review.createdAt)}</span>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Review" actions={<ReviewRating rating={review.rating} />}>
                  <p className="whitespace-pre-line wrap-break-word text-sm leading-6">{review.body}</p>
                </AdminSectionCard>
                <AdminSectionCard title="Moderation">
                  <div className="divide-y divide-border">
                    <DetailRow label="Status" value={reviewStatusLabels[review.status]} />
                    <DetailRow label="Last changed" value={<span className="tabular-nums">{formatDateTime(review.updatedAt)}</span>} />
                  </div>
                  {review.moderationNote ? (
                    <div className="mt-3 rounded-[calc(var(--radius)-2px)] bg-muted p-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Moderation note</p>
                      <p className="whitespace-pre-line wrap-break-word text-sm">{review.moderationNote}</p>
                    </div>
                  ) : null}
                  <div className="mt-4 border-t border-border pt-4">
                    <AdminTransitionActions
                      allowed={review.allowedTransitions}
                      labels={reviewTransitionLabels}
                      variants={{ approved: "conversion", rejected: "destructive" }}
                      order={["approved", "reported", "rejected"]}
                      descriptions={{
                        approved: "The review appears on the product page in the app.",
                        rejected: "The review is hidden from customers.",
                        reported: "The review is hidden while it is investigated.",
                      }}
                      mutation={moderate}
                      finalStateText="No further moderation is available for this review."
                      isConfirmDisabled={(target) => REVIEW_NOTE_REQUIRED.includes(target) && noteFor(target).trim() === ""}
                      onConfirm={(target, _reason, close) => {
                        const note = noteFor(target).trim();
                        moderate.mutate(
                          { status: target, ...(note ? { moderationNote: note } : {}) },
                          {
                            onSuccess: () => {
                              setDraft({ target: null, text: "" });
                              close();
                            },
                          },
                        );
                      }}
                    >
                      {(target) => {
                        const required = REVIEW_NOTE_REQUIRED.includes(target);
                        return (
                          <div className="grid gap-1.5">
                            <Label htmlFor="product-moderation-note">
                              Moderation note {required ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">(optional)</span>}
                            </Label>
                            <Textarea
                              id="product-moderation-note"
                              value={noteFor(target)}
                              onChange={(event) => setDraft({ target, text: event.target.value })}
                              maxLength={NOTE_MAX}
                              disabled={moderate.isPending}
                              placeholder={required ? "Why is this review being hidden? For example: abusive language." : "Optional internal note"}
                            />
                            <p className="text-xs text-muted-foreground">
                              {noteFor(target).trim().length}/{NOTE_MAX} · internal, not shown to the customer.
                            </p>
                            {hint ? <p className="rounded-[calc(var(--radius)-2px)] border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null}
                          </div>
                        );
                      }}
                    </AdminTransitionActions>
                  </div>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail>
                <AdminSectionCard title="Product">
                  <div className="divide-y divide-border">
                    <DetailRow label="Product" value={<Link className="hover:underline" href={`/admin/store/products/${review.product.id}`}>{review.product.name}</Link>} />
                    <DetailRow
                      label="Verified purchase"
                      value={
                        <span className="inline-flex items-center gap-1 text-success">
                          <BadgeCheck className="size-4" aria-hidden="true" />
                          Yes
                        </span>
                      }
                    />
                    <DetailRow label="Order" value={<Link className="font-mono text-[13px] hover:underline" href={`/admin/orders/${review.order.id}`}>{review.order.orderNumber}</Link>} />
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Customer">
                  <div className="divide-y divide-border">
                    <DetailRow label="Name" value={<Link className="hover:underline" href={`/admin/customers/${review.customer.id}`}>{customerLabel}</Link>} />
                    {review.customer.phone ? <DetailRow label="Phone" value={<span className="tabular-nums">{review.customer.phone}</span>} /> : null}
                    {review.customer.email ? <DetailRow label="Email" value={<span className="break-all">{review.customer.email}</span>} /> : null}
                  </div>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
