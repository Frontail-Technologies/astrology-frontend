"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Eye, MessageSquareQuote, Package, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import { useProductReviewList } from "@/features/product-reviews/hooks/use-product-review-admin";
import type { AdminProductReview } from "@/features/product-reviews/types/product-review-admin";
import { reviewRatingLabels, reviewStatusLabels, reviewStatusVariants } from "@/features/reviews/constants/review-status";
import { formatDateOnly } from "../../lib/format";
import { ReviewRating } from "../reviews/admin-reviews-view";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

const reviewer = (review: AdminProductReview) => personPrimaryLabel(review.customer);

function rowActions(review: AdminProductReview) {
  return [
    { label: "View review", icon: Eye, href: `/admin/product-reviews/${review.id}` },
    { label: "Open product", icon: Package, href: `/admin/store/products/${review.product.id}` },
    { label: "Open customer", icon: UserRound, href: `/admin/customers/${review.customer.id}` },
  ];
}

function ProductReviewMobileCard({ review }: { review: AdminProductReview }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/product-reviews/${review.id}`} className="block truncate font-medium text-foreground hover:underline">
            {review.product.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">by {reviewer(review)}</p>
        </div>
        <AdminRowActions label={`Actions for the review of ${review.product.name}`} actions={rowActions(review)} className="-mr-1.5 -mt-1 shrink-0" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{review.body}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AdminStatusBadge status={review.status} labels={reviewStatusLabels} variants={reviewStatusVariants} />
          <ReviewRating rating={review.rating} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{formatDateOnly(review.createdAt)}</span>
      </div>
    </div>
  );
}

/** Moderation queue for reviews customers leave on delivered store products (written from the mobile app). */
export function AdminProductReviewsView() {
  const list = useProductReviewList();
  const columns = useMemo<ColumnDef<AdminProductReview>[]>(
    () => [
      {
        id: "product",
        header: "Product",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-48 max-w-xs">
            <Link href={`/admin/product-reviews/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
              {row.original.product.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">Order {row.original.order.orderNumber}</p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        enableSorting: false,
        cell: ({ row }) => <span className="block max-w-48 truncate text-sm">{reviewer(row.original)}</span>,
      },
      { id: "rating", header: "Rating", enableSorting: false, cell: ({ row }) => <ReviewRating rating={row.original.rating} /> },
      {
        id: "review",
        header: "Review",
        enableSorting: false,
        cell: ({ row }) => <p className="line-clamp-2 min-w-64 max-w-md text-sm text-muted-foreground">{row.original.body}</p>,
      },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={reviewStatusLabels} variants={reviewStatusVariants} /> },
      {
        id: "submitted",
        header: "Submitted",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateOnly(row.original.createdAt)}</span>,
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/product-reviews/${row.original.id}`} label={`View the review of ${row.original.product.name}`} icon={Eye} />
            <AdminRowActions label={`More actions for the review of ${row.original.product.name}`} actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Product reviews"
      description="Reviews customers leave on products they received. New reviews wait here for moderation."
      noun="reviews"
      list={list}
      columns={columns}
      filters={[
        { key: "status", allLabel: "All statuses", options: reviewStatusLabels },
        { key: "rating", allLabel: "All ratings", options: reviewRatingLabels },
      ]}
      idFilterLabels={{ productId: "Product" }}
      idFilterName={(_key, rows) => rows[0]?.product.name}
      emptyLabel="No product reviews yet"
      emptyDescription="Customers can review a product after it has been delivered to them."
      emptyIcon={MessageSquareQuote}
      renderMobileCard={(review) => <ProductReviewMobileCard key={review.id} review={review} />}
    />
  );
}
