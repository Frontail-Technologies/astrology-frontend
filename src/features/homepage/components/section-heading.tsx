import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  headingId: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Shared homepage section header. Mechanics only — the section bodies below it
 * intentionally differ in composition.
 */
export function SectionHeading({
  eyebrow,
  title,
  headingId,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-xl">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-gold-400/50" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
            {eyebrow}
          </span>
        </div>
        <h2
          id={headingId}
          className="mt-3 text-[26px] font-semibold leading-tight sm:text-3xl lg:text-[32px]"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
