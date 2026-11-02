import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Admin content card: sentence-case title, optional one-line description, actions on the right. Solid white
 * surface, hairline border, no shadow. Use `flush` when the body is a table or a divided list that should touch
 * the card edges.
 *
 * ```tsx
 * <AdminSectionCard title="Contact" description="Shown only to admins." actions={<Button size="xs" variant="ghost">Edit</Button>}>
 *   …
 * </AdminSectionCard>
 * ```
 */
export function AdminSectionCard({
  title,
  description,
  actions,
  children,
  flush = false,
  className,
  headerClassName,
  contentClassName,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Rendered beside the title. */
  actions?: ReactNode;
  children: ReactNode;
  /** Body without padding (tables, divided lists). */
  flush?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-border bg-surface text-foreground", className)}>
      <div className={cn("flex items-start justify-between gap-3 px-5 pt-4", flush ? "border-b border-border pb-3.5" : "pb-3", headerClassName)}>
        <div className="min-w-0">
          <h2 className="font-sans text-[15px] font-semibold leading-6 text-foreground">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      <div className={cn(flush ? "p-0" : "px-5 pb-5", contentClassName)}>{children}</div>
    </section>
  );
}
