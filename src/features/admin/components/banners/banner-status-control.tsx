"use client";

import { Button } from "@/components/ui/button";
import { bannerStatuses, bannerStatusDescriptions, bannerStatusLabels, bannerStatusVariants } from "@/features/banners/constants/banner-status";
import { useBannerStatusUpdate } from "@/features/banners/hooks/use-banner-admin";
import type { ManagedBanner, BannerStatus } from "@/features/banners/types/banner-admin";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";

const actionLabels: Record<BannerStatus, string> = { published: "Publish", draft: "Move to draft", archived: "Archive" };

/** Explicit status buttons (the banner API has no transition guard, so every other status is offered), each confirmed. */
export function BannerStatusControl({ banner }: { banner: ManagedBanner }) {
  const update = useBannerStatusUpdate(banner.id);
  const confirm = useConfirmAction<BannerStatus>(update);
  const target = confirm.target;
  return (
    <AdminSectionCard title="Status" actions={<AdminStatusBadge status={banner.status} labels={bannerStatusLabels} variants={bannerStatusVariants} />}>
      <p className="text-sm text-muted-foreground">{bannerStatusDescriptions[banner.status]}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {bannerStatuses
          .filter((status) => status !== banner.status)
          .map((status) => (
            <Button key={status} type="button" size="sm" variant={status === "published" ? "conversion" : "outline"} className={status === "published" ? undefined : "bg-surface"} disabled={update.isPending} onClick={() => confirm.open(status)}>
              {actionLabels[status]}
            </Button>
          ))}
      </div>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={target ? `${actionLabels[target]}?` : ""}
        description={target ? bannerStatusDescriptions[target] : ""}
        confirmLabel={target ? actionLabels[target] : "Confirm"}
        onConfirm={() => {
          if (target) update.mutate(target, { onSuccess: confirm.close });
        }}
      />
    </AdminSectionCard>
  );
}
