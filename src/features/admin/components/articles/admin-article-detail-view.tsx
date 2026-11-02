"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { articleStatusLabels, articleStatusVariants } from "@/features/articles/constants/article-status";
import { articleDeleteOptions, useArticleDetail } from "@/features/articles/hooks/use-article-admin";
import { articleParagraphs } from "@/features/articles/lib/article-form";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { formatDateTime, formatOptionalDateTime } from "../../lib/format";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { ArticleStatusPanel } from "./article-status-panel";

export function AdminArticleDetailView({ id }: { id: string }) {
  const detail = useArticleDetail(id);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="article">
      {() => {
        const article = detail.data!;
        const hero = mediaDisplayUrl(article.heroImageUrl);
        const paragraphs = articleParagraphs(article.content);
        const dateMeta =
          article.status === "scheduled"
            ? `Scheduled for ${formatOptionalDateTime(article.scheduledAt)}`
            : article.publishedAt
              ? `Published ${formatOptionalDateTime(article.publishedAt)}`
              : `Updated ${formatDateTime(article.updatedAt)}`;
        return (
          <section className="space-y-5">
            <AdminPageHeader
              title={article.title}
              backHref="/admin/articles"
              backLabel="Articles"
              meta={
                <>
                  <AdminStatusBadge status={article.status} labels={articleStatusLabels} variants={articleStatusVariants} />
                  <span className="tabular-nums">{dateMeta}</span>
                </>
              }
              actions={
                <>
                  {article.status === "published" ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/articles/${article.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink aria-hidden="true" />
                        Public page
                      </Link>
                    </Button>
                  ) : null}
                  <AdminDeleteAction
                    id={article.id}
                    entityLabel="article"
                    {...articleDeleteOptions}
                    redirectTo="/admin/articles"
                    triggerClassName="bg-surface text-destructive hover:text-destructive"
                  />
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/articles/${article.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <article className="min-w-0 space-y-5">
                {hero ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or external media */}
                    <img src={hero} alt="" className="aspect-[16/7] w-full object-cover" />
                  </div>
                ) : null}
                <AdminSectionCard title="Content">
                  {article.excerpt ? <p className="mb-4 border-l-2 border-border pl-3 text-sm italic leading-6 text-muted-foreground">{article.excerpt}</p> : null}
                  {/* Plain text only: stored content is never injected as HTML. */}
                  <div className="max-w-prose space-y-3 text-sm leading-7 text-foreground">
                    {paragraphs.map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AdminSectionCard>
              </article>
              <AdminDetailStickyRail className="space-y-5">
                <ArticleStatusPanel article={article} />
                <AdminSectionCard title="Details">
                  <div className="divide-y divide-border">
                    <DetailRow label="Category" value={article.category ?? "Uncategorised"} />
                    <DetailRow label="Author" value={article.authorName ?? "Not set"} />
                    <DetailRow label="Address" value={<span className="break-all">/articles/{article.slug}</span>} />
                    <DetailRow label="Created" value={formatDateTime(article.createdAt)} />
                    <DetailRow label="Updated" value={formatDateTime(article.updatedAt)} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {article.tags.length ? (
                      article.tags.map((tag) => (
                        <AdminStatusPill key={tag.id} tone="neutral" dot={false}>
                          {tag.name}
                        </AdminStatusPill>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No tags</span>
                    )}
                  </div>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </section>
        );
      }}
    </AdminDetailFrame>
  );
}
