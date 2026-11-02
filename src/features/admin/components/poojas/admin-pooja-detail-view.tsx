"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { ClipboardList, ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { poojaStatusLabels, poojaStatusVariants } from "@/features/poojas/constants/pooja-status";
import { poojaDeleteOptions, usePoojaDetail, usePoojaOptions } from "@/features/poojas/hooks/use-pooja-admin";
import type { ManagedPooja } from "@/features/poojas/types/pooja-admin";
import { formatDateOnly, formatDateTime, formatINR } from "../../lib/format";
import { DetailCover, FeaturedPill } from "../catalog/catalog-pills";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { PoojaStatusControl } from "./pooja-status-control";

const Empty = () => <p className="text-sm text-muted-foreground">Not written yet.</p>;

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <Empty />;
  return (
    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex gap-2">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return <AdminSectionCard title={title}>{children}</AdminSectionCard>;
}

function RelatedPoojas({ slugs }: { slugs: string[] }) {
  const options = usePoojaOptions(slugs.length > 0);
  const bySlug = useMemo(() => new Map((options.data ?? []).map((pooja) => [pooja.slug, pooja])), [options.data]);
  if (!slugs.length) return null;
  return (
    <ContentSection title="Related poojas">
      <ul className="flex flex-wrap gap-2">
        {slugs.map((slug) => {
          const match = bySlug.get(slug);
          return (
            <li key={slug}>
              {match ? (
                <Link href={`/admin/poojas/${match.id}`} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-sm hover:bg-muted">
                  {match.name}
                </Link>
              ) : (
                <span className="inline-flex h-8 items-center rounded-full border border-dashed border-border px-3 text-sm text-muted-foreground" title={slug}>
                  {options.isPending ? "Loading…" : `${slug} (not found)`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </ContentSection>
  );
}

function PoojaContentPanels({ pooja }: { pooja: ManagedPooja }) {
  const content = pooja.content;
  return (
    <>
      <ContentSection title="Overview">
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          {content?.eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{content.eyebrow}</p> : null}
          <p className="font-medium text-foreground">{pooja.shortDescription}</p>
          <p className="whitespace-pre-line">{pooja.description}</p>
          {content?.overview.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
        </div>
      </ContentSection>
      <ContentSection title="Quick facts">
        {content?.quickFacts.length ? (
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {content.quickFacts.map((fact, index) => (
              <div key={`${index}-${fact.label}`} className="border-b border-border pb-3">
                <dt className="text-xs font-medium text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Empty />
        )}
      </ContentSection>
      <ContentSection title="Ritual process">
        {content?.ritualSteps.length ? (
          <ol className="space-y-4">
            {content.ritualSteps.map((step, index) => (
              <li key={`${index}-${step.title}`} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">{index + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Empty />
        )}
      </ContentSection>
      <div className="grid gap-5 md:grid-cols-2">
        <ContentSection title="Required details">
          <BulletList items={content?.requiredDetails ?? []} />
        </ContentSection>
        <ContentSection title="Preparation">
          <BulletList items={content?.preparationNotes ?? []} />
        </ContentSection>
      </div>
      <RelatedPoojas slugs={content?.relatedSlugs ?? []} />
      {content?.optionalSection ? (
        <ContentSection title={content.optionalSection.title}>
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            {content.optionalSection.body.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
          </div>
        </ContentSection>
      ) : null}
    </>
  );
}

export function AdminPoojaDetailView({ poojaId }: { poojaId: string }) {
  const detail = usePoojaDetail(poojaId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="pooja">
      {() => {
        const pooja = detail.data!;
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={pooja.name}
              description={pooja.categories.map((category) => category.name).join(", ") || pooja.category.name}
              backHref="/admin/poojas"
              backLabel="Poojas"
              meta={
                <>
                  <AdminStatusBadge status={pooja.status} labels={poojaStatusLabels} variants={poojaStatusVariants} />
                  {pooja.featured ? <FeaturedPill /> : null}
                  <span className="tabular-nums">Updated {formatDateOnly(pooja.updatedAt)}</span>
                </>
              }
              actions={
                <>
                  {pooja.status === "published" ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/pooja/${pooja.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink aria-hidden="true" />
                        Public page
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/poojas/${pooja.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <PoojaContentPanels pooja={pooja} />
              </div>
              <AdminDetailStickyRail>
                <DetailCover src={pooja.imageUrl} alt={pooja.name} />
                <AdminSectionCard title="Publication">
                  <PoojaStatusControl id={pooja.id} name={pooja.name} status={pooja.status} />
                </AdminSectionCard>
                <AdminSectionCard title="Service">
                  <div className="divide-y divide-border">
                    <DetailRow label="Price" value={<span className="tabular-nums">{pooja.pricePaise === null ? "On request" : formatINR(pooja.pricePaise)}</span>} />
                    <DetailRow label="Duration" value={pooja.durationMinutes === null ? "Varies" : `${pooja.durationMinutes} min`} />
                    <DetailRow label="Primary category" value={pooja.category.name} />
                    <DetailRow label="Featured" value={pooja.featured ? "Yes" : "No"} />
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-surface">
                    <Link href={`/admin/pooja-requests?pooja=${pooja.id}`}>
                      <ClipboardList aria-hidden="true" />
                      View requests for this pooja
                    </Link>
                  </Button>
                </AdminSectionCard>
                <AdminSectionCard title="Record">
                  <div className="divide-y divide-border">
                    <DetailRow label="Public address" value={<span className="break-all font-mono text-xs">/pooja/{pooja.slug}</span>} />
                    <DetailRow label="Created" value={<span className="tabular-nums">{formatDateTime(pooja.createdAt)}</span>} />
                    <DetailRow label="Updated" value={<span className="tabular-nums">{formatDateTime(pooja.updatedAt)}</span>} />
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <AdminDeleteAction
                      id={pooja.id}
                      entityLabel="pooja"
                      {...poojaDeleteOptions}
                      redirectTo="/admin/poojas"
                      triggerClassName="w-full bg-surface text-destructive hover:text-destructive"
                      description="The pooja is removed from the admin panel and the public site. Existing requests keep their copy of the pooja name and price."
                    />
                  </div>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
