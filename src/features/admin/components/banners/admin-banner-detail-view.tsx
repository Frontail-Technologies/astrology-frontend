"use client";

import Link from "next/link";
import { ImageOff, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bannerLinkTypeLabels, bannerPlacementLabel, bannerStatusLabels, bannerStatusVariants } from "@/features/banners/constants/banner-status";
import { bannerDeleteOptions, useBannerDetail } from "@/features/banners/hooks/use-banner-admin";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { cn } from "@/lib/utils";
import { formatDateTime, formatOptionalDateTime } from "../../lib/format";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { BannerStatusControl } from "./banner-status-control";

function BannerImage({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  const display = mediaDisplayUrl(src);
  if (!display) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-2 text-center text-xs text-muted-foreground", className)}>
        <ImageOff className="mr-1.5 size-4 shrink-0" aria-hidden="true" />
        Uses the desktop image
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- uploaded or external media
  return <img src={display} alt={alt} className={cn("rounded-lg border border-border bg-muted object-cover", className)} />;
}

export function AdminBannerDetailView({ id }: { id: string }) {
  const detail = useBannerDetail(id);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="banner">
      {() => {
        const banner = detail.data!;
        const alt = banner.altText ?? "";
        return (
          <section className="space-y-5">
            <AdminPageHeader
              title={banner.title}
              backHref="/admin/banners"
              backLabel="Banners"
              meta={
                <>
                  <AdminStatusBadge status={banner.status} labels={bannerStatusLabels} variants={bannerStatusVariants} />
                  <span>{bannerPlacementLabel(banner.placement)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Updated {formatDateTime(banner.updatedAt)}</span>
                </>
              }
              actions={
                <>
                  <AdminDeleteAction
                    id={banner.id}
                    entityLabel="banner"
                    {...bannerDeleteOptions}
                    redirectTo="/admin/banners"
                    triggerClassName="bg-surface text-destructive hover:text-destructive"
                  />
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/banners/${banner.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Preview">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
                    <figure className="min-w-0 space-y-1.5">
                      <BannerImage src={banner.imageUrl} alt={alt} className="aspect-[16/6] w-full" />
                      <figcaption className="text-xs text-muted-foreground">Desktop</figcaption>
                    </figure>
                    <figure className="w-36 space-y-1.5 sm:w-auto">
                      <BannerImage src={banner.mobileImageUrl} alt={alt} className="aspect-[3/4] w-full" />
                      <figcaption className="text-xs text-muted-foreground">Mobile</figcaption>
                    </figure>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="font-medium">{banner.title}</p>
                    {banner.subtitle ? <p className="whitespace-pre-line text-sm text-muted-foreground">{banner.subtitle}</p> : null}
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Placement and link">
                  <div className="divide-y divide-border">
                    <DetailRow label="Placement" value={bannerPlacementLabel(banner.placement)} />
                    <DetailRow label="Sort order" value={<span className="tabular-nums">{banner.sortOrder}</span>} />
                    <DetailRow label="Link type" value={bannerLinkTypeLabels[banner.linkType]} />
                    {banner.linkValue ? <DetailRow label="Link" value={<span className="break-all">{banner.linkValue}</span>} /> : null}
                    <DetailRow label="Alt text" value={banner.altText ?? "Not set"} />
                  </div>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <BannerStatusControl banner={banner} />
                <AdminSectionCard title="Schedule">
                  <div className="divide-y divide-border">
                    <DetailRow label="Starts" value={formatOptionalDateTime(banner.startsAt, "Immediately")} />
                    <DetailRow label="Ends" value={formatOptionalDateTime(banner.endsAt, "No end")} />
                    <DetailRow label="Created" value={formatDateTime(banner.createdAt)} />
                    <DetailRow label="Updated" value={formatDateTime(banner.updatedAt)} />
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
