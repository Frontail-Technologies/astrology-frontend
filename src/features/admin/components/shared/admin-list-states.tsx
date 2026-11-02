"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminError } from "@/features/admin/data/admin-errors";
import type { AdminPage } from "@/features/admin/data/admin-list-state";
import { cn } from "@/lib/utils";

/** Shared Admin list states: loading, error with retry, empty, and server pagination. */
export function AdminListLoading({ label, rows = 6 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function AdminErrorState({ error, onRetry, title = "Could not load this data" }: { error: AdminError; onRetry?: () => void; title?: string }) {
  const canRetry = onRetry && error.kind !== "forbidden" && error.kind !== "not_found" && error.kind !== "validation";
  return (
    <Card>
      <CardContent role="alert" className="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-[color-mix(in_srgb,var(--error)_9%,white)] text-destructive">
          <AlertTriangle className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        {canRetry ? (
          <Button variant="outline" size="sm" className="bg-surface" onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * Server pagination footer: "Showing 21 to 40 of 132 customers" + Previous / Next. Logic unchanged: buttons are
 * disabled at the ends and while a page is loading.
 */
export function AdminPagination<T>({
  page,
  isFetching,
  onPageChange,
  noun,
  className,
}: {
  page: AdminPage<T>;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  noun: string;
  className?: string;
}) {
  if (page.total === 0) return null;
  const first = (page.page - 1) * page.limit + 1;
  const last = Math.min(page.page * page.limit, page.total);
  const totalPages = Math.max(page.totalPages, 1);
  const number = new Intl.NumberFormat("en-IN");
  return (
    <nav aria-label={`${noun} pages`} className={cn("flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground", className)}>
      <p aria-live="polite">
        Showing <span className="font-medium tabular-nums text-foreground">{number.format(first)}</span> to{" "}
        <span className="font-medium tabular-nums text-foreground">{number.format(last)}</span> of{" "}
        <span className="font-medium tabular-nums text-foreground">{number.format(page.total)}</span> {noun}
        {isFetching ? <span className="sr-only"> (updating)</span> : null}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden tabular-nums sm:inline">
          Page {page.page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" className="h-8 min-h-8 bg-surface px-3" disabled={page.page <= 1 || isFetching} onClick={() => onPageChange(page.page - 1)} aria-label="Previous page">
          <ChevronLeft aria-hidden="true" />
          Previous
        </Button>
        <Button variant="outline" size="sm" className="h-8 min-h-8 bg-surface px-3" disabled={page.page >= page.totalPages || isFetching} onClick={() => onPageChange(page.page + 1)} aria-label="Next page">
          Next
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
