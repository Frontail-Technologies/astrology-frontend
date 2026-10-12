"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useMemo } from "react";

import { Container } from "@/components/layout/container";
import { ArticleVisual } from "@/features/articles/components/article-visual";
import { useArticleRepository } from "@/features/articles/hooks/use-article-repository";
import { SectionHeading } from "./section-heading";

export function AstrologyGuidesSection() {
  const { records, ready } = useArticleRepository();
  const articles = useMemo(
    () =>
      records
        .filter((article) => article.status === "published")
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.updatedAt).getTime() -
            new Date(a.publishedAt ?? a.updatedAt).getTime(),
        )
        .slice(0, 3),
    [records],
  );

  return (
    <section
      id="astrology-guides"
      aria-labelledby="astrology-guides-heading"
      className="text-foreground"
    >
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <SectionHeading
          eyebrow="Learn"
          title="Astrology Guides"
          headingId="astrology-guides-heading"
          description="Practical guides to understand charts, zodiac signs, compatibility and planetary influences."
          action={
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-conversion-500 hover:text-conversion-600"
              href="/articles"
            >
              View all articles <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        />

        {!ready ? (
          <div
            aria-label="Loading articles"
            className="mt-7 grid gap-5 sm:mt-8 md:grid-cols-3 md:gap-6"
          >
            {[0, 1, 2].map((item) => (
              <div className="h-80 animate-pulse rounded-lg bg-surface-muted" key={item} />
            ))}
          </div>
        ) : articles.length ? (
          <div className="mt-7 grid gap-5 sm:mt-8 md:grid-cols-3 md:gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface"
              >
                <Link
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400"
                  href={`/articles/${article.slug}`}
                >
                  <ArticleVisual
                    alt=""
                    className="aspect-[16/9]"
                    src={article.heroImage}
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
                    {article.category}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">
                    <Link
                      className="outline-none transition-colors hover:text-gold-500 focus-visible:text-gold-500 dark:hover:text-gold-300"
                      href={`/articles/${article.slug}`}
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-muted-foreground">
                    {article.excerpt}
                  </p>
                  <Link
                    className="mt-auto inline-flex items-center gap-2 pt-4 text-[13px] font-semibold text-conversion-500 hover:text-conversion-600"
                    href={`/articles/${article.slug}`}
                  >
                    Read article <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border px-5 text-center">
            <BookOpen aria-hidden="true" className="size-6 text-gold-500" />
            <h3 className="mt-3 font-display text-2xl font-semibold">No published articles yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Published guides will appear here when available.</p>
          </div>
        )}
      </Container>
    </section>
  );
}
