"use client";

import { MessageSquareQuote, Star } from "lucide-react";
import { useMemo } from "react";

import { Container } from "@/components/layout/container";
import { useReviewRepository } from "@/features/reviews/hooks/use-review-repository";
import { SectionHeading } from "./section-heading";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function HomepageReviews() {
  const { records, ready } = useReviewRepository();
  const reviews = useMemo(
    () =>
      records
        .filter((review) => review.status === "approved")
        .sort(
          (a, b) =>
            b.rating - a.rating ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3),
    [records],
  );

  return (
    <section
      id="reviews"
      aria-labelledby="homepage-reviews-heading"
      className="border-y border-gold-500/10 bg-surface-muted/45 text-foreground dark:border-gold-400/10 dark:bg-espresso-900/30"
    >
      <Container className="max-w-[1440px] py-11 sm:py-13 lg:py-14">
        <SectionHeading
          eyebrow="Customer feedback"
          headingId="homepage-reviews-heading"
          title="Real people. Real experiences."
          description="Approved feedback from recent astrology, pooja, and store experiences."
        />

        {!ready ? (
          <div className="mt-7 grid gap-4 md:grid-cols-3" aria-label="Loading reviews">
            {[0, 1, 2].map((item) => (
              <div className="h-56 animate-pulse rounded-lg bg-white/70 dark:bg-espresso-900" key={item} />
            ))}
          </div>
        ) : reviews.length ? (
          <div className="mt-7 grid gap-4 md:grid-cols-3 md:gap-5">
            {reviews.map((review) => (
              <article
                className="flex min-w-0 flex-col rounded-lg border border-gold-500/16 bg-white p-5 dark:border-gold-400/16 dark:bg-espresso-900 sm:p-6"
                key={review.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-300/25 text-xs font-bold text-foreground dark:bg-gold-400/12 dark:text-gold-300">
                      {initials(review.customerName)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{review.customerName}</h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {review.targetName} · <span className="capitalize">{review.targetType}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        aria-hidden="true"
                        className={index < review.rating ? "size-3.5 fill-gold-500 text-gold-500" : "size-3.5 text-border"}
                        key={index}
                      />
                    ))}
                  </div>
                </div>
                {review.title ? <p className="mt-5 font-semibold">{review.title}</p> : null}
                <blockquote className="mt-4 text-sm leading-6 text-foreground/78">
                  “{review.comment}”
                </blockquote>
                <time className="mt-auto pt-5 text-xs text-muted-foreground" dateTime={review.createdAt}>
                  {formatDate(review.createdAt)}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-7 flex items-center gap-3 rounded-lg border border-dashed border-gold-500/20 bg-white/55 px-4 py-5 dark:border-gold-400/18 dark:bg-espresso-900/60">
            <MessageSquareQuote aria-hidden="true" className="size-5 shrink-0 text-gold-500 dark:text-gold-300" />
            <p className="text-sm text-muted-foreground">
              Reviews will appear here as consultations are completed.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
