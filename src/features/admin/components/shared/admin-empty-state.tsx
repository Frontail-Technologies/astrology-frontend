import type { ReactNode } from "react";
import { BarChart3, Inbox, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Compact, illustration-free empty state. Say what is empty and, when there is one, the next step.
 *
 * - `variant="card"` (default) draws its own bordered surface, for a page-level empty list.
 * - `variant="inline"` has no surface, for inside a card, table body or panel.
 *
 * ```tsx
 * <AdminEmptyState icon={Newspaper} title="No articles yet" description="Write the first article to publish it on the site."
 *   action={<Button variant="conversion" size="sm" asChild><Link href="/admin/articles/new">New article</Link></Button>} />
 * ```
 */
export function AdminEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = "card",
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  variant?: "card" | "inline";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        variant === "card" ? "rounded-xl border border-dashed border-border bg-surface py-10" : "py-8",
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/**
 * Empty chart body: a short line instead of a large grey box. Used by every shared chart when the series is all
 * zero; height stays modest so an empty dashboard does not look broken.
 */
export function AdminChartEmpty({ label = "No data for this period", hint, className }: { label?: string; hint?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-36 flex-col items-center justify-center gap-2 text-center", className)} role="note">
      <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
        <BarChart3 className="size-4" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-foreground/80">{label}</p>
      {hint ? <p className="max-w-xs text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
