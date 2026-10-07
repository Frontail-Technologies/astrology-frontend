"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { articleCategories, articleStatusLabels } from "@/features/articles/data/articles";
import { useArticleRepository } from "@/features/articles/hooks/use-article-repository";
import type { Article, ArticleStatus } from "@/features/articles/types/article";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";

const statuses: Array<"all" | ArticleStatus> = ["all", "draft", "scheduled", "published", "archived"];
const badgeVariant = (status: ArticleStatus) => status === "published" ? "online" : status === "scheduled" ? "pending" : status === "archived" ? "muted" : "outline";
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Not set";
const primaryClass = "!bg-primary !text-primary-foreground hover:!bg-primary/90";

function ArticleActions({ article, onDelete }: { article: Article; onDelete: () => void }) {
  return <div className="flex items-center justify-end gap-1"><Link href={`/admin/articles/${article.slug}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${article.title}`} title="View article"><Eye className="size-4" /></Link><Link href={`/admin/articles/${article.slug}/edit`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`Edit ${article.title}`} title="Edit article"><Pencil className="size-4" /></Link><Button variant="ghost" size="sm" className="size-8 p-0 text-destructive hover:text-destructive" aria-label={`Delete ${article.title}`} title="Delete article" onClick={onDelete}><Trash2 /></Button></div>;
}

export function AdminArticlesView() {
  const { records, remove } = useArticleRepository();
  const [status, setStatus] = useState<"all" | ArticleStatus>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [target, setTarget] = useState<Article | null>(null);
  const filtered = useMemo(() => records.filter((article) => (status === "all" || article.status === status) && (category === "all" || article.category === category) && (!query || `${article.title} ${article.slug} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase()))), [category, query, records, status]);
  const columns = useMemo<ColumnDef<Article>[]>(() => [
    { id: "article", header: "Article", cell: ({ row }) => <div className="flex min-w-72 items-center gap-3"><div className="size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">{row.original.heroImage ? <img src={row.original.heroImage} alt="" className="size-full object-cover" /> : null}</div><div className="min-w-0"><p className="truncate font-medium">{row.original.title}</p><p className="truncate text-xs text-muted-foreground">/{row.original.slug}</p></div></div> },
    { accessorKey: "category", header: "Category" },
    { id: "author", header: "Author", cell: ({ row }) => row.original.author ?? <span className="text-muted-foreground">Not assigned</span> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={badgeVariant(row.original.status)}>{articleStatusLabels[row.original.status]}</Badge> },
    { id: "publishDate", header: "Publish date", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(row.original.publishedAt ?? row.original.scheduledAt)}</span> },
    { id: "updated", header: "Updated", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <ArticleActions article={row.original} onDelete={() => setTarget(row.original)} /> },
  ], []);

  return <section className="space-y-4"><header className="flex flex-wrap items-end justify-between gap-3"><div className="flex items-center gap-3"><div><h1 className="font-sans text-xl font-semibold">Articles</h1><p className="text-sm text-muted-foreground">Manage editorial guides and astrology content.</p></div></div><Button asChild size="sm" className={primaryClass}><Link href="/admin/articles/new"><Plus />New Article</Link></Button></header><Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}><TabsList variant="line">{statuses.map((item) => <TabsTrigger key={item} value={item} >{item === "all" ? "All" : articleStatusLabels[item]}</TabsTrigger>)}</TabsList></Tabs><div className="hidden md:block"><AdminDataTable columns={columns} data={filtered} emptyState={<span>No articles match the current filters.</span>} toolbar={(table) => <div className="flex flex-wrap items-center gap-2"><div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" /></div><Select value={category} onValueChange={setCategory}><SelectTrigger className="h-9 w-44 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{articleCategories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><AdminDataTableColumnVisibility table={table} /></div>} /></div><div className="space-y-3 md:hidden"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" /></div><Select value={category} onValueChange={setCategory}><SelectTrigger className="h-9 w-full bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{articleCategories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>{filtered.map((article) => <Card key={article.id}><CardContent className="flex items-start gap-3 p-3"><div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">{article.heroImage ? <img src={article.heroImage} alt="" className="size-full object-cover" /> : null}</div><div className="min-w-0 flex-1"><p className="font-medium">{article.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{article.category}</p><div className="mt-2 flex items-center justify-between gap-2"><Badge variant={badgeVariant(article.status)}>{articleStatusLabels[article.status]}</Badge><ArticleActions article={article} onDelete={() => setTarget(article)} /></div></div></CardContent></Card>)}</div><AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete article?</AlertDialogTitle><AlertDialogDescription>This removes the article from the local editorial catalog.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (target) { remove(target.id); setTarget(null); toast.success("Article deleted"); } }}>Delete article</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>;
}
