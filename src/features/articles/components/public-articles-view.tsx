"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useArticleRepository } from "@/features/articles/hooks/use-article-repository";
import { cn } from "@/lib/utils";
import { ArticleVisual } from "./article-visual";

const ALL = "All";

function formatDate(value?: string) {
  if (!value) return "Publication date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function PublicArticlesView() {
  const { records, ready } = useArticleRepository();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [tag, setTag] = useState(ALL);

  const published = useMemo(
    () =>
      records
        .filter((article) => article.status === "published")
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.updatedAt).getTime() -
            new Date(a.publishedAt ?? a.updatedAt).getTime(),
        ),
    [records],
  );
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(published.map((article) => article.category)))],
    [published],
  );
  const tags = useMemo(
    () => [ALL, ...Array.from(new Set(published.flatMap((article) => article.tags))).sort()],
    [published],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return published.filter((article) => {
      const matchesQuery =
        !normalized ||
        [article.title, article.excerpt, article.category, article.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return (
        matchesQuery &&
        (category === ALL || article.category === category) &&
        (tag === ALL || article.tags.includes(tag))
      );
    });
  }, [category, published, query, tag]);
  const hasFilters = query.trim() || category !== ALL || tag !== ALL;

  return (
    <main className="min-h-[70vh] bg-background text-foreground">
      <section className="border-b border-border bg-surface-muted">
        <Container className="max-w-[1440px] py-12 sm:py-16 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500 dark:text-gold-300">
            Learn
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Astrology articles and practical guides
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Read published guidance on charts, planetary cycles, spiritual practices, and reflective astrology.
          </p>
        </Container>
      </section>

      <Container className="max-w-[1440px] py-10 sm:py-12 lg:py-16">
        <div className="space-y-5 border-b border-border pb-7">
          <label className="relative block max-w-2xl">
            <span className="sr-only">Search articles</span>
            <Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 rounded-lg bg-surface pl-12 pr-4"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search published articles"
              value={query}
            />
          </label>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Categories</p>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((item) => (
                <button
                  className={cn(
                    "min-h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                    category === item
                      ? "border-conversion-500 bg-conversion-500 text-white dark:text-midnight-950"
                      : "border-border bg-surface text-muted-foreground hover:border-gold-500/50 hover:text-foreground",
                  )}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tags</span>
            {tags.map((item) => (
              <button
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  tag === item
                    ? "border-gold-500/50 bg-gold-300/25 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
                key={item}
                onClick={() => setTag(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {!ready ? (
          <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading articles">
            {[0, 1, 2].map((item) => (
              <div className="h-80 animate-pulse rounded-lg bg-surface-muted" key={item} />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <article className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface" key={article.id}>
                <Link className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400" href={`/articles/${article.slug}`}>
                  <ArticleVisual alt="" className="aspect-[16/9]" src={article.heroImage} />
                </Link>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-[0.12em] text-gold-500 dark:text-gold-300">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">
                    <Link className="outline-none transition-colors hover:text-gold-500 focus-visible:text-gold-500 dark:hover:text-gold-300" href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
                  <Link className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-conversion-500 outline-none hover:text-conversion-600 focus-visible:underline" href={`/articles/${article.slug}`}>
                    Read article <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center sm:py-24">
            <span className="grid size-14 place-items-center rounded-full bg-gold-300/20 text-gold-500"><BookOpen aria-hidden="true" className="size-6" /></span>
            <h2 className="mt-5 font-display text-3xl font-semibold">{published.length ? "No articles match" : "No published articles yet"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{published.length ? "Try a different search, category, or tag." : "Published articles will appear here when they are available."}</p>
            {hasFilters ? (
              <Button className="mt-6" onClick={() => { setQuery(""); setCategory(ALL); setTag(ALL); }} variant="outline">
                <X aria-hidden="true" /> Clear filters
              </Button>
            ) : null}
          </div>
        )}
      </Container>
    </main>
  );
}
