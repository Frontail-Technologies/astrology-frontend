import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Heading for a group of cards on a page (dashboard, reports, overviews). Not a card itself.
 *
 * `<AdminSectionHeading title="Finance" description="Payments created in the selected range" action={…} />`
 */
export function AdminSectionHeading({
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-4 gap-y-2", className)}>
      <div className="min-w-0">
        <Tag className="text-[15px] font-semibold leading-6 text-foreground">{title}</Tag>
        {description ? <p className="text-[13px] text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
