"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Eye, ImageOff, Images, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import {
  bannerDateStateLabels,
  bannerLinkTypeLabels,
  bannerPlacementFilterOptions,
  bannerPlacementLabel,
  bannerStatusLabels,
  bannerStatusVariants,
} from "@/features/banners/constants/banner-status";
import { useBannerList } from "@/features/banners/hooks/use-banner-admin";
import type { ManagedBanner } from "@/features/banners/types/banner-admin";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { formatOptionalDateTime } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

function BannerThumb({ banner }: { banner: ManagedBanner }) {
  const src = mediaDisplayUrl(banner.imageUrl);
  return (
    <div className="relative flex h-11 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
      <ImageOff className="size-4" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or external media */}
      {src ? <img src={src} alt="" className="absolute inset-0 size-full object-cover" /> : null}
    </div>
  );
}

function bannerScheduleText(banner: Pick<ManagedBanner, "startsAt" | "endsAt">) {
  if (!banner.startsAt && !banner.endsAt) return "Always (no schedule)";
  return `${formatOptionalDateTime(banner.startsAt, "Any time")} → ${formatOptionalDateTime(banner.endsAt, "No end")}`;
}

function NewBannerButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/banners/new">
        <Plus aria-hidden="true" />
        New banner
      </Link>
    </Button>
  );
}

function BannerMobileCard({ banner }: { banner: ManagedBanner }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <BannerThumb banner={banner} />
        <div className="min-w-0 flex-1">
          <Link href={`/admin/banners/${banner.id}`} className="line-clamp-2 font-medium text-foreground hover:underline">
            {banner.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {bannerPlacementLabel(banner.placement)} · Order {banner.sortOrder}
          </p>
        </div>
        <AdminRowActions
          label={`Actions for ${banner.title}`}
          actions={[
            { label: "View", icon: Eye, href: `/admin/banners/${banner.id}` },
            { label: "Edit", icon: Pencil, href: `/admin/banners/${banner.id}/edit` },
          ]}
          className="-mr-1.5 -mt-1 shrink-0"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <AdminStatusBadge status={banner.status} labels={bannerStatusLabels} variants={bannerStatusVariants} />
        <span className="text-xs tabular-nums text-muted-foreground">{bannerScheduleText(banner)}</span>
      </div>
    </div>
  );
}

export function AdminBannersView() {
  const list = useBannerList();
  const currentPlacement = list.state.filters.placement;
  const placementOptions = useMemo(() => bannerPlacementFilterOptions(currentPlacement), [currentPlacement]);
  const columns = useMemo<ColumnDef<ManagedBanner>[]>(
    () => [
      {
        id: "banner",
        header: "Banner",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-64 max-w-md items-center gap-3">
            <BannerThumb banner={row.original} />
            <div className="min-w-0">
              <Link href={`/admin/banners/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
                {row.original.title}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{row.original.subtitle ?? "No subtitle"}</p>
            </div>
          </div>
        ),
      },
      {
        id: "placement",
        header: "Placement",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{bannerPlacementLabel(row.original.placement)}</span>,
      },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={bannerStatusLabels} variants={bannerStatusVariants} /> },
      {
        id: "schedule",
        header: "Schedule",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{bannerScheduleText(row.original)}</span>,
      },
      {
        id: "link",
        header: "Link",
        enableSorting: false,
        cell: ({ row }) => <span className="block max-w-48 truncate text-sm text-muted-foreground">{row.original.linkValue ?? bannerLinkTypeLabels.none}</span>,
      },
      { id: "sortOrder", header: "Order", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.sortOrder}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/banners/${row.original.id}`} label={`View ${row.original.title}`} icon={Eye} />
            <AdminRowActionLink href={`/admin/banners/${row.original.id}/edit`} label={`Edit ${row.original.title}`} icon={Pencil} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Banners"
      description="Promotional banners and where they appear on the site."
      noun="banners"
      primaryAction={<NewBannerButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search title or subtitle…"
      searchMaxLength={200}
      filters={[
        { key: "placement", allLabel: "All placements", options: placementOptions },
        { key: "status", allLabel: "All statuses", options: bannerStatusLabels },
        { key: "dateState", allLabel: "Any schedule", options: bannerDateStateLabels },
      ]}
      initialColumnVisibility={{ link: false }}
      emptyLabel="No banners yet"
      emptyDescription="Create a banner, choose where it shows, then publish it."
      emptyIcon={Images}
      emptyAction={<NewBannerButton />}
      renderMobileCard={(banner) => <BannerMobileCard key={banner.id} banner={banner} />}
    />
  );
}
