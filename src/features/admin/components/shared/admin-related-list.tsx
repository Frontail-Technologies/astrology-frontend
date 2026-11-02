"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { AdminError } from "@/features/admin/data/admin-errors";
import { AdminSectionCard } from "./admin-section-card";
import { AdminErrorState } from "./admin-list-states";

/** Result shape of `useAdminScopedList` (first page of a list filtered to one related entity). */
export type RelatedListModel<T> = { ready: boolean; error: AdminError | null; reload: () => void; items: T[]; total: number };

/**
 * Side-panel card listing a few records related to the current entity (for example a customer's tickets), with a
 * "View all" link to the full list pre-filtered by URL. Read-only; all filtering happens on the server.
 */
export function AdminRelatedList<T extends { id: string }>({
  title,
  list,
  viewAllHref,
  emptyLabel,
  renderItem,
}: {
  title: string;
  list: RelatedListModel<T>;
  viewAllHref: string;
  emptyLabel: string;
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <AdminSectionCard
      title={title}
      actions={
        list.total > list.items.length ? (
          <Link href={viewAllHref} className="text-xs font-medium normal-case text-muted-foreground hover:text-foreground hover:underline">
            View all {list.total}
          </Link>
        ) : null
      }
    >
      {!list.ready ? (
        <p className="text-sm text-muted-foreground" role="status">Loading…</p>
      ) : list.error ? (
        <AdminErrorState error={list.error} onRetry={list.reload} title={`Could not load ${title.toLowerCase()}`} />
      ) : list.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border">
          {list.items.map((item) => (
            <li key={item.id} className="py-2.5 text-sm">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </AdminSectionCard>
  );
}

/** One row: linked primary text, secondary line, and a trailing element (usually a status badge or amount). */
export function AdminRelatedRow({ href, primary, secondary, trailing }: { href: string; primary: ReactNode; secondary?: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <Link href={href} className="block truncate font-medium hover:underline">
          {primary}
        </Link>
        {secondary ? <p className="truncate text-xs text-muted-foreground">{secondary}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
