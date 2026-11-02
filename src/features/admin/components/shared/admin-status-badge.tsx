import type { ReactNode } from "react";

import type { BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { adminToneClasses, badgeVariantTone, type AdminTone } from "./admin-tone";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/**
 * Soft status pill: dot + label, semantic colour only.
 *
 * `<AdminStatusPill tone="success">Active</AdminStatusPill>`
 */
export function AdminStatusPill({
  tone = "neutral",
  children,
  dot = true,
  className,
}: {
  tone?: AdminTone;
  children: ReactNode;
  /** Hide the leading dot (for example inside dense chips). */
  dot?: boolean;
  className?: string;
}) {
  const classes = adminToneClasses[tone];
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium ring-1 ring-inset",
        classes.pill,
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 shrink-0 rounded-full", classes.dot)} aria-hidden="true" /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

/**
 * Status pill driven by a domain's `labels` / `variants` maps (from `features/<domain>/constants`). Badge variants
 * map to semantic tones through `badgeVariantTone`; pass `tones` to override per status.
 */
export function AdminStatusBadge<S extends string>({
  status,
  labels,
  variants,
  tones,
  className,
}: {
  status: S;
  labels: Record<S, string>;
  variants?: Record<S, BadgeVariant>;
  tones?: Partial<Record<S, AdminTone>>;
  className?: string;
}) {
  const tone = tones?.[status] ?? (variants ? badgeVariantTone[variants[status]] : undefined) ?? "neutral";
  return (
    <AdminStatusPill tone={tone} className={className}>
      {labels[status] ?? status}
    </AdminStatusPill>
  );
}
