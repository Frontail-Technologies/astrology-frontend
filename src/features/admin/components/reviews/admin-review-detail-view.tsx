"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  REVIEW_ERROR_HINTS,
  REVIEW_NOTE_MAX,
  REVIEW_NOTE_REQUIRED,
  reviewStatusLabels,
  reviewStatusVariants,
  reviewTargetHref,
  reviewTargetLabels,
  reviewTransitionLabels,
} from "@/features/reviews/constants/review-status";
import { useModerateReview, useReviewDetail } from "@/features/reviews/hooks/use-review-admin";
import { consultationStatusLabels } from "@/features/consultations/constants/consultation-status";
import type { AdminReviewStatus } from "@/features/reviews/types/review-admin";
import { formatDateTime, formatOptionalDateTime } from "../../lib/format";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { AdminTransitionActions } from "../shared/admin-transition-actions";
import { ReviewRating } from "./admin-reviews-view";

/** Note text is tied to the dialog target, so it never carries over between actions. */
type NoteDraft = { target: AdminReviewStatus | null; text: string };

export function AdminReviewDetailView({ reviewId }: { reviewId: string }) {
  const detail = useReviewDetail(reviewId);
  const moderate = useModerateReview(reviewId);
  const [draft, setDraft] = useState<NoteDraft>({ target: null, text: "" });
  const noteFor = (target: AdminReviewStatus) => (draft.target === target ? draft.text : "");
  const hint = moderate.error?.code ? REVIEW_ERROR_HINTS[moderate.error.code] : undefined;

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="review">
      {() => {
        const review = detail.data!;
        const targetLabel = review.target.name ?? `an unavailable ${reviewTargetLabels[review.target.type].toLowerCase()}`;
        const customerLabel = review.customer ? (review.customer.name ?? review.customer.email) : "a deleted customer";
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={review.title ?? `Review of ${targetLabel}`}
              description={`${reviewTargetLabels[review.targetType]} review by ${customerLabel}`}
              backHref="/admin/reviews"
              backLabel="Reviews & ratings"
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
                  {review.title ? <h2 className="mb-2 font-sans text-base font-semibold">{review.title}</h2> : null}
                  <p className="whitespace-pre-line wrap-break-word text-sm leading-6">{review.body}</p>
                  
                </AdminSectionCard>
                <AdminSectionCard title="Moderation">
                  <div className="divide-y divide-border">
                    <DetailRow label="Status" value={reviewStatusLabels[review.status]} />
                    <DetailRow label="Moderated" value={formatOptionalDateTime(review.moderatedAt)} />
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
                        approved: "The review becomes visible on the public site.",
                        rejected: "The review is hidden from the public site.",
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
                            <Label htmlFor="moderation-note">
                              Moderation note {required ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">(optional)</span>}
                            </Label>
                            <Textarea
                              id="moderation-note"
                              value={noteFor(target)}
                              onChange={(event) => setDraft({ target, text: event.target.value })}
                              maxLength={REVIEW_NOTE_MAX}
                              disabled={moderate.isPending}
                              placeholder={required ? "Why is this review being hidden? For example: contains personal contact details." : "Optional internal note"}
                            />
                            <p className="text-xs text-muted-foreground">
                              {noteFor(target).trim().length}/{REVIEW_NOTE_MAX} · internal, not shown to the customer.
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
                <AdminSectionCard title="Reviewed">
                  <div className="divide-y divide-border">
                    <DetailRow label="Type" value={reviewTargetLabels[review.target.type]} />
                    <DetailRow
                      label={reviewTargetLabels[review.target.type]}
                      value={
                        <Link className="hover:underline" href={reviewTargetHref(review.target)}>
                          {targetLabel}
                        </Link>
                      }
                    />
                    {review.target.type !== "astrologer" && review.astrologer ? (
                      <DetailRow label="Astrologer" value={<Link className="hover:underline" href={`/admin/astrologers/${review.astrologer.id}`}>{review.astrologer.displayName}</Link>} />
                    ) : null}
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Customer">
                  {review.customer ? (
                    <div className="divide-y divide-border">
                      <DetailRow label="Name" value={<Link className="hover:underline" href={`/admin/customers/${review.customer.id}`}>{review.customer.name ?? review.customer.email}</Link>} />
                      <DetailRow label="Email" value={<span className="break-all">{review.customer.email}</span>} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">This customer account no longer exists.</p>
                  )}
                </AdminSectionCard>
                <AdminSectionCard title="Verification">
                  <div className="divide-y divide-border">
                    <DetailRow
                      label="Verified customer"
                      value={
                        review.verifiedSession ? (
                          <span className="inline-flex items-center gap-1 text-success">
                            <BadgeCheck className="size-4" aria-hidden="true" />
                            Yes
                          </span>
                        ) : (
                          "No"
                        )
                      }
                    />
                    {review.consultationId ? (
                      <DetailRow
                        label="Consultation"
                        value={
                          <Link className="hover:underline" href={`/admin/consultations/${review.consultationId}`}>
                            {review.consultationStatus ? (consultationStatusLabels[review.consultationStatus as keyof typeof consultationStatusLabels] ?? "View consultation") : "View consultation"}
                          </Link>
                        }
                      />
                    ) : null}
                    {review.orderId ? <DetailRow label="Order" value={<Link className="hover:underline" href={`/admin/orders/${review.orderId}`}>View order</Link>} /> : null}
                    {review.poojaRequestId ? (
                      <DetailRow label="Pooja request" value={<Link className="hover:underline" href={`/admin/pooja-requests/${review.poojaRequestId}`}>View request</Link>} />
                    ) : null}
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
