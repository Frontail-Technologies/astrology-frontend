"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useMemo } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { useArticleRepository } from "@/features/articles/hooks/use-article-repository";
import { ArticleVisual } from "./article-visual";

function formatDate(value?: string) {
  if (!value) return "Publication date unavailable";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export function PublicArticleDetail({ slug }: { slug: string }) {
  const { records, ready } = useArticleRepository();
  const article = records.find((item) => item.slug === slug && item.status === "published");
  const related = useMemo(() => {
    if (!article) return [];
    return records
      .filter((item) => item.status === "published" && item.id !== article.id)
      .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
      .slice(0, 3);
  }, [article, records]);

  if (!ready) {
    return <main className="min-h-[70vh] animate-pulse bg-background"><Container className="max-w-5xl py-16"><div className="h-10 w-2/3 rounded bg-surface-muted" /><div className="mt-8 aspect-[16/7] rounded-lg bg-surface-muted" /></Container></main>;
  }

  if (!article) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-background px-4 text-center">
        <div className="max-w-lg py-20">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold-300/20 text-gold-500"><BookOpen aria-hidden="true" className="size-6" /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold-500">Article unavailable</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">This article could not be found</h1>
          <p className="mt-3 leading-7 text-muted-foreground">It may be unpublished, scheduled for later, or no longer available.</p>
          <Button asChild className="mt-7" variant="conversion"><Link href="/articles"><ArrowLeft aria-hidden="true" /> Browse published articles</Link></Button>
        </div>
      </main>
    );
  }

  const paragraphs = article.content.split(/\n\s*\n/).filter(Boolean);

  return (
    <main className="bg-background text-foreground">
      <Container className="max-w-5xl pb-14 pt-8 sm:pb-20 sm:pt-12">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" href="/articles"><ArrowLeft aria-hidden="true" className="size-4" /> All articles</Link>
        <header className="mt-8 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500 dark:text-gold-300">{article.category}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>By {article.author ?? "Astrology editorial team"}</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </div>
        </header>

        <ArticleVisual alt={`${article.title} hero image`} className="mt-9 aspect-[16/8] rounded-lg sm:mt-12" sizes="(max-width: 1024px) 100vw, 960px" src={article.heroImage} />

        <article className="mx-auto max-w-3xl py-10 sm:py-14">
          <div className="space-y-6 font-serif text-lg leading-8 text-foreground/85 sm:text-xl sm:leading-9">
            {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}
          </div>
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {article.tags.map((tag) => <span className="rounded-full border border-gold-500/25 bg-gold-300/15 px-3 py-1 text-xs font-medium" key={tag}>#{tag}</span>)}
          </div>
        </article>
      </Container>

      <section aria-labelledby="related-articles-heading" className="border-t border-border bg-surface-muted">
        <Container className="max-w-[1440px] py-12 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500">Continue reading</p><h2 className="mt-2 font-display text-3xl font-semibold" id="related-articles-heading">Related articles</h2></div>
            <Link className="hidden items-center gap-2 text-sm font-semibold text-conversion-500 sm:inline-flex" href="/articles">View all <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          {related.length ? (
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <article className="rounded-lg border border-border bg-surface p-5" key={item.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-500">{item.category}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-tight"><Link className="hover:text-gold-500" href={`/articles/${item.slug}`}>{item.title}</Link></h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
                </article>
              ))}
            </div>
          ) : <p className="mt-7 text-sm text-muted-foreground">No other published articles are available yet.</p>}
        </Container>
      </section>
    </main>
  );
}
