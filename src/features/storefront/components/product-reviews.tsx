"use client";

import { Star } from "lucide-react";

import { useReviewRepository } from "@/features/reviews/hooks/use-review-repository";
import type { StoreProduct } from "@/features/store/types/store";

/** Renders only approved reviews that exist for this product. Nothing is shown when there are none. */
export function ProductReviews({ product }: { product: StoreProduct }) {
  const { records } = useReviewRepository();
  const reviews = records.filter(
    (review) =>
      review.status === "approved" &&
      review.targetType === "product" &&
      (review.targetId === product.id || review.targetId === product.slug),
  );

  if (!reviews.length) return null;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section aria-labelledby="product-reviews">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id="product-reviews" className="text-xl font-semibold text-foreground sm:text-2xl">
          Customer reviews
        </h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{average.toFixed(1)}</span> out of 5 · {reviews.length}{" "}
          {reviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>
      <ul className="mt-4 space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-xl border border-border bg-surface p-4">
            <p className="flex items-center gap-1 text-gold-500" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className={index < review.rating ? "size-4 fill-current" : "size-4 text-border"} aria-hidden="true" />
              ))}
            </p>
            {review.title ? <p className="mt-2 text-sm font-semibold text-foreground">{review.title}</p> : null}
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{review.comment}</p>
            <p className="mt-2 text-xs text-muted-foreground">{review.customerName}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
