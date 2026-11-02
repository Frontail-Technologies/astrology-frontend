import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type AdminKpiTrend = "up" | "down" | "flat";

/**
 * Headline KPI (dashboard top row: at most four). Fixed height so a row always aligns. The label never truncates
 * (it may wrap to two lines); `secondary` is clamped to one line with the full text in `title`.
 *
 * `comparison` renders only when given, and must come from real data (for example "₹1,200 today"). `trend` only
 * colours the comparison; never pass a trend you cannot compute.
 *
 * ```tsx
 * <AdminKpiCard label="Orders today" value={12} icon={ShoppingBag}
 *   secondary="3 pending · 2 processing" href="/admin/orders" />
 * ```
 */
export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  secondary,
  comparison,
  trend,
  href,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  secondary?: string;
  comparison?: string;
  trend?: AdminKpiTrend;
  href?: string;
  /** Extra context for assistive technology / hover (for example how "today" is counted). */
  hint?: string;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null;
  const body = (
    <div
      className={cn(
        "flex h-full min-h-[124px] flex-col rounded-xl border border-border bg-surface p-4 transition-colors sm:min-h-[136px] sm:p-5",
        href && "group-hover:border-foreground/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-5 text-muted-foreground" title={hint}>
          {label}
        </p>
        {Icon ? (
          <span className="hidden size-8 shrink-0 place-items-center rounded-lg border border-border text-foreground/60 sm:grid">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 break-words text-2xl font-semibold leading-8 tracking-tight tabular-nums text-foreground sm:text-[28px]">{value}</p>
      <div className="mt-auto flex min-w-0 flex-col items-start gap-0.5 pt-2 text-xs sm:flex-row sm:items-center sm:gap-2">
        {comparison ? (
          <span
            className={cn(
              "inline-flex max-w-full shrink-0 items-center gap-0.5 truncate font-medium",
              trend === "up" ? "text-success" : trend === "down" ? "text-error" : "text-foreground/80",
            )}
          >
            {TrendIcon ? <TrendIcon className="size-3.5" aria-hidden="true" /> : null}
            {comparison}
          </span>
        ) : null}
        {secondary ? (
          <span className="w-full min-w-0 truncate text-muted-foreground sm:w-auto" title={secondary}>
            {secondary}
          </span>
        ) : null}
        {href ? <ChevronRight className="ml-auto hidden size-3.5 sm:block shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /> : null}
      </div>
    </div>
  );

  if (!href) return body;
  return (
    <Link
      href={href}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={[label, typeof value === "string" || typeof value === "number" ? String(value) : null, comparison, secondary].filter(Boolean).join(", ")}
    >
      {body}
    </Link>
  );
}
