"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Eye, ExternalLink, Filter, ScrollText, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import {
  auditActionGroup,
  auditActionLabel,
  auditActionPickerOptions,
  auditActionTone,
  auditActionVerb,
  auditEntityHref,
  auditEntityLabel,
  auditEntityPickerOptions,
  auditRoleLabels,
} from "@/features/audit-logs/constants/audit-log-labels";
import { useAuditLogList } from "@/features/audit-logs/hooks/use-audit-log-admin";
import type { AdminAuditLog } from "@/features/audit-logs/types/audit-log-admin";
import { formatDateTime } from "../../lib/format";
import { CatalogMobileCard } from "../catalog/catalog-pills";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusPill } from "../shared/admin-status-badge";
import { AuditLogDetailSheet } from "./audit-log-detail-sheet";

const ENTRY_PARAM = "entry";

export function auditActorName(log: AdminAuditLog) {
  if (log.actor) return log.actor.name ?? log.actor.email;
  return log.actorUserId ? "Deleted user" : "System";
}

export function auditActorRole(log: AdminAuditLog) {
  const role = log.actor?.role ?? log.actorRole;
  return role ? auditRoleLabels[role] : null;
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span className="inline-flex min-w-0 flex-col gap-0.5" title={auditActionLabel(action)}>
      <AdminStatusPill tone={auditActionTone(action)}>{auditActionVerb(action)}</AdminStatusPill>
      <span className="truncate pl-0.5 text-xs text-muted-foreground">{auditActionGroup(action)}</span>
    </span>
  );
}

function entryActions(log: AdminAuditLog, apply: (patch: { ids: Partial<Record<"actorUserId" | "entityId", string | null>> }) => void): AdminRowAction[] {
  const href = auditEntityHref(log);
  return [
    ...(log.entityId ? [{ label: "All entries for this record", icon: Filter, onSelect: () => apply({ ids: { entityId: log.entityId } }) }] : []),
    ...(log.actorUserId ? [{ label: "All changes by this person", icon: UserRound, onSelect: () => apply({ ids: { actorUserId: log.actorUserId } }) }] : []),
    ...(href ? [{ label: "Open record", icon: ExternalLink, href }] : []),
  ];
}

/** Read-only audit trail. Server filters only (the API has no free-text search); entries open in a side sheet. */
export function AdminAuditLogsView() {
  const list = useAuditLogList();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get(ENTRY_PARAM);
  const { apply } = list;

  const setEntry = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set(ENTRY_PARAM, id);
      else params.delete(ENTRY_PARAM);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const columns = useMemo<ColumnDef<AdminAuditLog>[]>(
    () => [
      {
        id: "time",
        header: "Time",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <time dateTime={row.original.createdAt} className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{formatDateTime(row.original.createdAt)}</time>,
      },
      {
        id: "actor",
        header: "Actor",
        enableSorting: false,
        cell: ({ row }) => {
          const log = row.original;
          const role = auditActorRole(log);
          return (
            <div className="min-w-40">
              {log.actorUserId ? (
                <button
                  type="button"
                  className="text-left font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => apply({ ids: { actorUserId: log.actorUserId } })}
                  title="Show only this actor's changes"
                >
                  {auditActorName(log)}
                </button>
              ) : (
                <p className="font-medium">{auditActorName(log)}</p>
              )}
              <p className="truncate text-xs text-muted-foreground">
                {log.actor?.name ? `${log.actor.email}` : null}
                {log.actor?.name && role ? " · " : null}
                {role}
              </p>
            </div>
          );
        },
      },
      { id: "action", header: "Action", enableSorting: false, cell: ({ row }) => <ActionBadge action={row.original.action} /> },
      {
        id: "entity",
        header: "Entity",
        enableSorting: false,
        cell: ({ row }) => {
          const log = row.original;
          const href = auditEntityHref(log);
          return (
            <div className="min-w-40 max-w-64">
              <p className="text-xs text-muted-foreground">{auditEntityLabel(log.entityType)}</p>
              {href ? (
                <Link href={href} className="inline-flex max-w-full items-center gap-1 truncate text-sm hover:underline">
                  <span className="truncate">{log.entityLabel ?? "Open record"}</span>
                  <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                </Link>
              ) : (
                <p className="truncate text-sm">{log.entityLabel ?? "—"}</p>
              )}
            </div>
          );
        },
      },
      { id: "ip", header: "IP", enableSorting: false, cell: ({ row }) => <span className="font-mono text-xs">{row.original.ipAddress ?? "—"}</span> },
      {
        id: "actions",
        header: () => <span>Details</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <Button variant="ghost" size="icon" className="size-8 min-h-8 text-muted-foreground hover:text-foreground" aria-label="View entry details" onClick={() => setEntry(row.original.id)}>
              <Eye className="size-4" aria-hidden="true" />
            </Button>
            <AdminRowActions label="More actions for this entry" actions={entryActions(row.original, apply)} />
          </div>
        ),
      },
    ],
    [apply, setEntry],
  );

  const selectedFromPage = list.items.find((item) => item.id === selectedId) ?? null;
  const actionFilter = list.state.filters.action ?? null;
  const entityFilter = list.state.filters.entityType ?? null;


  return (
    <>
      <AdminServerList
        title="Audit log"
        description="A read-only record of changes made in the admin panel, newest first."
        noun="entries"
        list={list}
        columns={columns}
        toolbarExtras={
          <>
            <AdminCombobox
              value={actionFilter}
              onValueChange={(value) => apply({ filters: { action: value } })}
              options={auditActionPickerOptions}
              placeholder="All actions"
              searchPlaceholder="Search actions or areas…"
              emptyText="No actions match."
              selectedLabel={actionFilter ? auditActionLabel(actionFilter) : undefined}
              clearable
              className="w-full md:w-56"
            />
            <AdminCombobox
              value={entityFilter}
              onValueChange={(value) => apply({ filters: { entityType: value } })}
              options={auditEntityPickerOptions}
              placeholder="All record types"
              searchPlaceholder="Search record types…"
              emptyText="No record types match."
              clearable
              className="w-full md:w-48"
            />
          </>
        }
        dateRange
        idFilterLabels={{ actorUserId: "Actor", entityId: "Record" }}
        idFilterName={(key, rows) => (key === "actorUserId" ? (rows[0]?.actor?.name ?? rows[0]?.actor?.email) : rows[0]?.entityLabel)}
        extraActiveCount={(actionFilter ? 1 : 0) + (entityFilter ? 1 : 0)}
        emptyLabel="No audit entries yet"
        emptyDescription="Changes made by admins appear here automatically."
        emptyIcon={ScrollText}
        renderMobileCard={(log) => (
          <CatalogMobileCard key={log.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <ActionBadge action={log.action} />
                <time dateTime={log.createdAt} className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(log.createdAt)}
                </time>
              </div>
              <p className="truncate text-sm">
                <span className="text-muted-foreground">{auditEntityLabel(log.entityType)}: </span>
                {log.entityLabel ?? "—"}
              </p>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs text-muted-foreground">
                  {auditActorName(log)}
                  {auditActorRole(log) ? ` · ${auditActorRole(log)}` : ""}
                </p>
                <Button variant="outline" size="sm" className="bg-surface" onClick={() => setEntry(log.id)}>
                  View
                </Button>
              </div>
          </CatalogMobileCard>
        )}
      />
      <AuditLogDetailSheet entryId={selectedId} initial={selectedFromPage} onClose={() => setEntry(null)} />
    </>
  );
}
