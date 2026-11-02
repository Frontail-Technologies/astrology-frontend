import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Card for a chart, distribution or table on the dashboard and reports. Header row: title (+ optional
 * description) left, `action` right (range select, toggle, "View all" link). `flush` removes body padding.
 */
export function AdminInsightCard({
  title,
  description,
  action,
  children,
  className,
  flush = false,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-xl border border-border bg-surface", className)} aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-6 text-foreground">{title}</h2>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className={cn("min-w-0 flex-1", flush ? "p-0" : "p-5")}>{children}</div>
    </section>
  );
}
