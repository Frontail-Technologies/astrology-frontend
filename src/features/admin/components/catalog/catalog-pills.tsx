import type { ReactNode } from "react";
import { Star } from "lucide-react";

import { mediaDisplayUrl } from "@/features/media/media-url";
import { cn } from "@/lib/utils";
import { AdminStatusPill } from "../shared/admin-status-badge";

/**
 * Small, colour-safe pills shared by the catalog domains (poojas, store, coupons, master data). Featured and
 * "Primary" are markers, not statuses, so they stay neutral; active/inactive uses the semantic success/neutral tones.
 */
export function FeaturedPill({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full bg-muted px-2.5 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-border", className)}>
      <Star className="size-3 fill-current text-muted-foreground" aria-hidden="true" />
      Featured
    </span>
  );
}

export function MarkerPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center whitespace-nowrap rounded-full bg-muted px-2 text-[11px] font-medium text-secondary-foreground ring-1 ring-inset ring-border", className)}>
      {children}
    </span>
  );
}

export function ActivePill({ active, activeLabel = "Active", inactiveLabel = "Inactive" }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return <AdminStatusPill tone={active ? "success" : "neutral"}>{active ? activeLabel : inactiveLabel}</AdminStatusPill>;
}

/** Mobile list card surface (kit: `rounded-xl border bg-surface p-4`, no shadow). */
export function CatalogMobileCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-3 rounded-xl border border-border bg-surface p-4", className)}>{children}</div>;
}

/** Cover image panel for detail rails (falls back to nothing when there is no image). */
export function DetailCover({ src, alt = "" }: { src: string | null | undefined; alt?: string }) {
  const url = mediaDisplayUrl(src ?? null);
  if (!url) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or external media */}
      <img src={url} alt={alt} className="aspect-video w-full object-cover" />
    </div>
  );
}
