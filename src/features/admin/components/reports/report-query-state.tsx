"use client";

import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { AdminError } from "@/features/admin/data/admin-errors";
import { AdminErrorState } from "../shared/admin-list-states";

type QueryLike<T> = { data: T | null; ready: boolean; error: AdminError | null; reload: () => void };

export function ReportLoading({ label = "Loading report", cards = 6 }: { label?: string; cards?: number }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, i) => (
          <Skeleton key={i} className="h-[84px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

/** Loading / error (with retry) / data for one or more report reads. Renders `children` only when all have data. */
export function ReportQueryState<T extends readonly QueryLike<unknown>[]>({
  queries,
  label,
  loading,
  children,
}: {
  queries: T;
  label: string;
  loading?: ReactNode;
  children: (data: { [K in keyof T]: NonNullable<T[K]["data"]> }) => ReactNode;
}) {
  const failed = queries.find((query) => query.error);
  if (failed?.error) {
    return <AdminErrorState error={failed.error} onRetry={() => queries.forEach((query) => query.error && query.reload())} title={`Could not load ${label}`} />;
  }
  if (queries.some((query) => !query.ready || query.data === null)) return <>{loading ?? <ReportLoading label={`Loading ${label}`} />}</>;
  return <>{children(queries.map((query) => query.data) as { [K in keyof T]: NonNullable<T[K]["data"]> })}</>;
}
