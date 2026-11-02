import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import type { InsightTone } from "@/features/admin/insights/tones";
import { cn } from "@/lib/utils";

/**
 * Secondary metric card (reports, store overview, detail summaries). Monochrome icon tile and a fixed minimum
 * height so a grid row lines up; the label never truncates, `secondary` is clamped to one line (full text in
 * `title`). `tone` is accepted for compatibility and not rendered: colour belongs to status, not to metrics.
 */
export function AdminMetricCard({
  label,
  value,
  secondary,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  secondary?: string;
  icon: LucideIcon;
  /** @deprecated Ignored. Metric cards are monochrome. */
  tone?: InsightTone;
  href?: string;
}) {
  const card = (
    <div className={cn("flex h-full min-h-[104px] items-start gap-3.5 rounded-xl border border-border bg-surface p-4", href && "transition-colors group-hover:border-foreground/20")}>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground/65">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-5 text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold leading-7 tracking-tight tabular-nums text-foreground">{value}</p>
        {secondary ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground" title={secondary}>
            {secondary}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!href) return card;
  return (
    <Link
      href={href}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${label}: ${value}${secondary ? `, ${secondary}` : ""}`}
    >
      {card}
    </Link>
  );
}
