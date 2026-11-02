"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ExternalLink, Eye, ImageOff, Newspaper, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { articleCategoryFilterOptions, articleStatusLabels, articleStatusVariants } from "@/features/articles/constants/article-status";
import { useArticleList, useArticleTags } from "@/features/articles/hooks/use-article-admin";
import type { ManagedArticle } from "@/features/articles/types/article-admin";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { formatDateOnly, formatOptionalDateTime } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

function ArticleThumb({ article }: { article: ManagedArticle }) {
  const src = mediaDisplayUrl(article.heroImageUrl);
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
      <ImageOff className="size-4" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or external media */}
      {src ? <img src={src} alt="" className="absolute inset-0 size-full object-cover" /> : null}
    </div>
  );
}

/** When the article goes (or went) live: publish time, else the scheduled time. */
function publishLabel(article: ManagedArticle) {
  if (article.status === "scheduled") return `Scheduled ${formatOptionalDateTime(article.scheduledAt)}`;
  return formatOptionalDateTime(article.publishedAt, "Not published");
}

/** Secondary row actions (the eye icon opens the article). */
function articleRowActions(article: ManagedArticle): AdminRowAction[] {
  const actions: AdminRowAction[] = [{ label: "Edit", icon: Pencil, href: `/admin/articles/${article.id}/edit` }];
  if (article.status === "published") actions.push({ label: "Open public page", icon: ExternalLink, href: `/articles/${article.slug}` });
  return actions;
}

function NewArticleButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/articles/new">
        <Plus aria-hidden="true" />
        New article
      </Link>
    </Button>
  );
}

function ArticleMobileCard({ article }: { article: ManagedArticle }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <ArticleThumb article={article} />
        <div className="min-w-0 flex-1">
          <Link href={`/admin/articles/${article.id}`} className="line-clamp-2 font-medium text-foreground hover:underline">
            {article.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{[article.category, article.authorName].filter(Boolean).join(" · ") || "Uncategorised"}</p>
        </div>
        <AdminRowActions
          label={`Actions for ${article.title}`}
          actions={[{ label: "View", icon: Eye, href: `/admin/articles/${article.id}` }, ...articleRowActions(article)]}
          className="-mr-1.5 -mt-1 shrink-0"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <AdminStatusBadge status={article.status} labels={articleStatusLabels} variants={articleStatusVariants} />
        <span className="text-xs tabular-nums text-muted-foreground">{publishLabel(article)}</span>
      </div>
    </div>
  );
}

export function AdminArticlesView() {
  const list = useArticleList();
  const tags = useArticleTags();
  const currentCategory = list.state.filters.category;
  const currentTag = list.state.filters.tag;
  const categoryOptions = useMemo(() => articleCategoryFilterOptions(currentCategory), [currentCategory]);
  const tagOptions = useMemo(() => {
    const options: Record<string, string> = Object.fromEntries((tags.data ?? []).map((tag) => [tag.slug, tag.name]));
    // A tag set through a link stays selectable even when it is not in the loaded tag list.
    if (currentTag && !Object.hasOwn(options, currentTag)) options[currentTag] = currentTag;
    return options;
  }, [tags.data, currentTag]);

  const columns = useMemo<ColumnDef<ManagedArticle>[]>(
    () => [
      {
        id: "article",
        header: "Article",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-64 max-w-md items-center gap-3">
            <ArticleThumb article={row.original} />
            <div className="min-w-0">
              <Link href={`/admin/articles/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
                {row.original.title}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{row.original.excerpt || `/${row.original.slug}`}</p>
            </div>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{row.original.category ?? "Uncategorised"}</span>,
      },
      {
        id: "tags",
        header: "Tags",
        enableSorting: false,
        cell: ({ row }) => <span className="block max-w-48 truncate text-sm text-muted-foreground">{row.original.tags.map((tag) => tag.name).join(", ") || "No tags"}</span>,
      },
      { id: "author", header: "Author", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{row.original.authorName ?? "Not set"}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={articleStatusLabels} variants={articleStatusVariants} /> },
      {
        id: "publish",
        header: "Publish date",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{publishLabel(row.original)}</span>,
      },
      {
        id: "updated",
        header: "Updated",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateOnly(row.original.updatedAt)}</span>,
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/articles/${row.original.id}`} label={`View ${row.original.title}`} icon={Eye} />
            <AdminRowActions label={`More actions for ${row.original.title}`} actions={articleRowActions(row.original)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Articles"
      description="Editorial articles published on the site."
      noun="articles"
      primaryAction={<NewArticleButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search title, excerpt or content…"
      searchMaxLength={240}
      filters={[
        { key: "status", allLabel: "All statuses", options: articleStatusLabels },
        { key: "category", allLabel: "All categories", options: categoryOptions },
        { key: "tag", allLabel: tags.isPending ? "Loading tags…" : "All tags", options: tagOptions },
      ]}
      initialColumnVisibility={{ tags: false, updated: false }}
      emptyLabel="No articles yet"
      emptyDescription="Write the first article. New articles stay as drafts until you publish them."
      emptyIcon={Newspaper}
      emptyAction={<NewArticleButton />}
      renderMobileCard={(article) => <ArticleMobileCard key={article.id} article={article} />}
    />
  );
}
