import type { BadgeProps } from "@/components/ui/badge";

/** Semantic status tones for admin pills and indicators. Nothing else gets colour. */
export type AdminTone = "success" | "warning" | "danger" | "info" | "neutral";

export const adminToneClasses: Record<AdminTone, { pill: string; dot: string; text: string }> = {
  success: { pill: "bg-[color-mix(in_srgb,var(--success)_10%,white)] text-[var(--success-ink)] ring-[color-mix(in_srgb,var(--success)_22%,transparent)]", dot: "bg-success", text: "text-success" },
  warning: { pill: "bg-[color-mix(in_srgb,var(--warning)_11%,white)] text-[var(--warning-ink)] ring-[color-mix(in_srgb,var(--warning)_25%,transparent)]", dot: "bg-warning", text: "text-warning" },
  danger: { pill: "bg-[color-mix(in_srgb,var(--error)_9%,white)] text-[var(--danger-ink)] ring-[color-mix(in_srgb,var(--error)_22%,transparent)]", dot: "bg-error", text: "text-error" },
  info: { pill: "bg-[color-mix(in_srgb,var(--info)_9%,white)] text-[var(--info-ink)] ring-[color-mix(in_srgb,var(--info)_22%,transparent)]", dot: "bg-info", text: "text-info" },
  neutral: { pill: "bg-muted text-secondary-foreground ring-border", dot: "bg-[var(--chart-neutral)]", text: "text-muted-foreground" },
};

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/**
 * Domain constants still describe statuses with shared `Badge` variants. Admin renders them as semantic pills:
 * this is the single mapping, so every domain reads the same.
 */
export const badgeVariantTone: Record<BadgeVariant, AdminTone> = {
  online: "success",
  verified: "info",
  gold: "info",
  pending: "warning",
  saffron: "warning",
  popular: "warning",
  unavailable: "danger",
  muted: "neutral",
  outline: "neutral",
  default: "neutral",
};
