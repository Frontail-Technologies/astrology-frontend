"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { articleStatusLabels } from "@/features/articles/data/articles";
import { useArticleRepository } from "@/features/articles/hooks/use-article-repository";

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not set";

export function AdminArticleDetailView({ slug }: { slug: string }) {
  const { getBySlug, ready } = useArticleRepository();
  if (!ready) return null;
  const article = getBySlug(slug);
  if (!article) notFound();
  return <section className="mx-auto max-w-6xl space-y-4"><header className="flex flex-wrap items-start justify-between gap-3"><div><Link href="/admin/articles" className="text-xs text-muted-foreground hover:text-foreground">Articles</Link><div className="mt-1 flex flex-wrap items-center gap-2"><h1 className="font-sans text-xl font-semibold">{article.title}</h1><Badge variant={article.status === "published" ? "online" : article.status === "scheduled" ? "pending" : "muted"}>{articleStatusLabels[article.status]}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{article.category}</p></div><Button asChild size="sm" className="!bg-primary !text-primary-foreground"><Link href={`/admin/articles/${article.slug}/edit`}><Pencil />Edit</Link></Button></header>{article.heroImage ? <div className="aspect-[16/5] max-h-72 overflow-hidden rounded-lg border border-border bg-muted"><img src={article.heroImage} alt="" className="size-full object-cover" /></div> : null}<div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]"><div className="space-y-4"><Card><CardHeader><CardTitle>Content</CardTitle></CardHeader><CardContent className="space-y-4"><p className="font-medium leading-6">{article.excerpt}</p>{article.content.split(/\n\n+/).map((paragraph, index) => <p key={index} className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{paragraph}</p>)}</CardContent></Card><Card><CardHeader><CardTitle>Tags</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{article.tags.length ? article.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>) : <span className="text-sm text-muted-foreground">No tags</span>}</CardContent></Card></div><aside className="space-y-4 lg:sticky lg:top-4"><Card><CardHeader><CardTitle>Publishing</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-xs text-muted-foreground">Status</p><p>{articleStatusLabels[article.status]}</p></div><div><p className="text-xs text-muted-foreground">Published</p><p>{formatDate(article.publishedAt)}</p></div><div><p className="text-xs text-muted-foreground">Scheduled</p><p>{formatDate(article.scheduledAt)}</p></div></CardContent></Card><Card><CardHeader><CardTitle>Metadata</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-xs text-muted-foreground">Author</p><p>{article.author ?? "Not assigned"}</p></div><div><p className="text-xs text-muted-foreground">Slug</p><p className="break-all">/{article.slug}</p></div><div><p className="text-xs text-muted-foreground">Updated</p><p>{formatDate(article.updatedAt)}</p></div></CardContent></Card></aside></div></section>;
}
