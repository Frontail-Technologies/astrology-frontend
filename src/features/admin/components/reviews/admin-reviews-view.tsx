"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BadgeCheck, Eye, MessageSquareText, Star } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reviewRatingLabels, reviewStatusLabels, reviewStatusVariants, reviewTargetLabels } from "@/features/reviews/constants/review-status";
import { useReviewList } from "@/features/reviews/hooks/use-review-admin";
import type { AdminReview } from "@/features/reviews/types/review-admin";
import { formatDateOnly } from "../../lib/format";
import { CatalogMobileCard } from "../catalog/catalog-pills";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

export function ReviewRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm tabular-nums" aria-label={`${rating} out of 5`}>
      <Star className="size-3.5 fill-current text-muted-foreground" aria-hidden="true" />
      {rating}
    </span>
  );
}

const targetName = (review: AdminReview) => review.target.name ?? "Unavailable";
const customerName = (review: AdminReview) => review.customer?.name ?? review.customer?.email ?? "Deleted customer";

/** Reviews moderation queue: server search (title, body) with status tabs and type/rating filters. */
export function AdminReviewsView() {
  const list = useReviewList();
  const status = list.state.filters.status ?? "all";
  const columns = useMemo<ColumnDef<AdminReview>[]>(
    () => [
      {
        id: "target",
        header: "Reviewed",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-44">
            <p className="truncate font-medium">{targetName(row.original)}</p>
            <p className="text-xs text-muted-foreground">{reviewTargetLabels[row.original.targetType]}</p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="truncate text-sm">{customerName(row.original)}</p>
            {row.original.customer?.name ? <p className="truncate text-xs text-muted-foreground">{row.original.customer.email}</p> : null}
          </div>
        ),
      },
      { id: "rating", header: "Rating", enableSorting: false, cell: ({ row }) => <ReviewRating rating={row.original.rating} /> },
      {
        id: "review",
        header: "Review",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="max-w-72">
            {row.original.title ? <p className="truncate text-sm font-medium">{row.original.title}</p> : null}
            <p className="truncate text-xs text-muted-foreground">{row.original.body}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <AdminStatusBadge status={row.original.status} labels={reviewStatusLabels} variants={reviewStatusVariants} />
            {row.original.verifiedSession ? <BadgeCheck className="size-4 text-success" aria-label="Verified customer" /> : null}
          </div>
        ),
      },
      { id: "date", header: "Submitted", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{formatDateOnly(row.original.createdAt)}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <AdminRowActionLink href={`/admin/reviews/${row.original.id}`} label={`Moderate review by ${customerName(row.original)}`} icon={Eye} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Reviews & ratings"
      description="Customer reviews of astrologers, poojas and products. New reviews wait here for moderation."
      noun="reviews"
      list={list}
      columns={columns}
      searchPlaceholder="Search review title or text…"
      summary={
        <Tabs value={status} onValueChange={(value) => list.apply({ filters: { status: value === "all" ? null : value } })} className="-mx-1 overflow-x-auto px-1">
          <TabsList variant="line" aria-label="Moderation status">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(reviewStatusLabels).map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      filters={[
        { key: "targetType", allLabel: "All types", options: reviewTargetLabels },
        { key: "rating", allLabel: "All ratings", options: reviewRatingLabels },
      ]}
      idFilterLabels={{ astrologerId: "Astrologer", poojaId: "Pooja", productId: "Product" }}
      idFilterName={(_key, rows) => rows[0]?.target.name}
      initialColumnVisibility={{ date: false }}
      emptyLabel="No reviews yet"
      emptyDescription="Reviews appear here as customers submit them."
      emptyIcon={MessageSquareText}
      renderMobileCard={(review) => (
        <CatalogMobileCard key={review.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/admin/reviews/${review.id}`} className="font-medium hover:underline">
                  {targetName(review)}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {reviewTargetLabels[review.targetType]} · {customerName(review)}
                </p>
              </div>
              <AdminStatusBadge status={review.status} labels={reviewStatusLabels} variants={reviewStatusVariants} />
            </div>
            <div className="flex items-center gap-3">
              <ReviewRating rating={review.rating} />
              <span className="text-xs text-muted-foreground">{formatDateOnly(review.createdAt)}</span>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{review.title ? `${review.title} — ` : ""}{review.body}</p>
        </CatalogMobileCard>
      )}
    />
  );
}
