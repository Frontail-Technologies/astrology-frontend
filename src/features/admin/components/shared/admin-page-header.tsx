import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Admin screen heading.
 *
 * - `title` is the page `<h1>`. On a navigation item's own page the shell hides it visually (the top bar shows
 *   the title) and keeps it for screen readers; detail and editor pages show it.
 * - `description` one plain sentence; `count` renders a quiet number pill beside the title.
 * - `meta` sits under the title (status pills, ids, dates). `actions` are secondary (outline/ghost buttons);
 *   `primaryAction` is the single committed action (saffron `conversion` button) and always renders last.
 *
 * ```tsx
 * <AdminPageHeader
 *   title={customer.name}
 *   backHref="/admin/customers" backLabel="Customers"
 *   meta={<AdminStatusBadge status={customer.accountStatus} labels={…} variants={…} />}
 *   actions={<Button variant="outline" size="sm">Suspend</Button>}
 *   primaryAction={<Button variant="conversion" size="sm">Save changes</Button>}
 * />
 * ```
 */
export function AdminPageHeader({
  title,
  description,
  count,
  backHref,
  backLabel,
  meta,
  actions,
  primaryAction,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  count?: number | string;
  backHref?: string;
  backLabel?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  primaryAction?: ReactNode;
  className?: string;
}) {
  const hasActions = Boolean(actions || primaryAction);
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0 flex-1 basis-72">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {backLabel ?? "Back"}
          </Link>
        ) : null}
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="min-w-0 break-words font-sans text-[22px] font-semibold leading-7 tracking-tight text-foreground sm:text-2xl">{title}</h1>
          {count !== undefined ? (
            <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium tabular-nums text-muted-foreground">{count}</span>
          ) : null}
        </div>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
        {meta ? <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{meta}</div> : null}
      </div>
      {hasActions ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
          {primaryAction}
        </div>
      ) : null}
    </header>
  );
}
