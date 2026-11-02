"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { auditActionGroup, auditActionTone, auditActionVerb, auditEntityHref, auditEntityLabel, auditRoleLabels } from "@/features/audit-logs/constants/audit-log-labels";
import { useAuditLogDetail } from "@/features/audit-logs/hooks/use-audit-log-admin";
import { auditMetadataEntries, buildAuditDiff, formatAuditValue, visibleAuditRows, type AuditDiffRow } from "@/features/audit-logs/lib/audit-diff";
import type { AdminAuditLog } from "@/features/audit-logs/types/audit-log-admin";
import { formatDateTime } from "../../lib/format";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminStatusPill } from "../shared/admin-status-badge";

const KIND_LABELS: Record<AuditDiffRow["kind"], string> = { added: "Added", removed: "Removed", changed: "Changed", unchanged: "Unchanged" };

function ChangeTable({ before, after }: { before: unknown; after: unknown }) {
  const [showUnchanged, setShowUnchanged] = useState(false);
  const rows = buildAuditDiff(before, after);
  const visible = visibleAuditRows(rows, showUnchanged);
  const hidden = rows.length - visibleAuditRows(rows, false).length;
  if (!rows.length) return <p className="text-sm text-muted-foreground">No before/after snapshot was recorded for this entry.</p>;
  return (
    <div className="space-y-2">
      {visible.length ? (
        <div className="overflow-hidden rounded-md border border-border text-sm">
          <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>Field</span>
            <span>Before</span>
            <span>After</span>
          </div>
          {visible.map((row) => (
            <div key={row.key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-t border-border px-3 py-2">
              <span className="break-all font-mono text-xs">
                {row.key}
                <span className="sr-only"> ({KIND_LABELS[row.kind]})</span>
              </span>
              <span className={`break-all font-mono text-xs ${row.kind === "unchanged" ? "text-muted-foreground" : "text-muted-foreground line-through decoration-error/50"}`}>
                {formatAuditValue(row.before)}
              </span>
              <span className={`break-all font-mono text-xs ${row.kind === "unchanged" ? "text-muted-foreground" : "font-medium text-foreground"}`}>{formatAuditValue(row.after)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No field values changed.</p>
      )}
      {hidden > 0 ? (
        <Button variant="ghost" size="sm" onClick={() => setShowUnchanged((value) => !value)}>
          {showUnchanged ? "Hide unchanged fields" : `Show ${hidden} unchanged field${hidden === 1 ? "" : "s"}`}
        </Button>
      ) : null}
    </div>
  );
}

function EntryBody({ log }: { log: AdminAuditLog }) {
  const href = auditEntityHref(log);
  const role = log.actor?.role ?? log.actorRole;
  const metadata = auditMetadataEntries(log.metadata);
  return (
    <div className="space-y-5 px-4 pb-6">
      <div className="divide-y divide-border">
        <DetailRow label="When" value={formatDateTime(log.createdAt)} />
        <DetailRow
          label="Actor"
          value={
            log.actor ? (
              <span className="break-all">
                {log.actor.name ? `${log.actor.name} · ` : ""}
                {log.actor.email}
              </span>
            ) : log.actorUserId ? (
              "Deleted user"
            ) : (
              "System"
            )
          }
        />
        {role ? <DetailRow label="Role" value={auditRoleLabels[role]} /> : null}
        <DetailRow label="Entity type" value={auditEntityLabel(log.entityType)} />
        <DetailRow
          label="Record"
          value={
            href ? (
              <Link href={href} className="inline-flex items-center gap-1 hover:underline">
                {log.entityLabel ?? "Open record"}
                <ExternalLink className="size-3" aria-hidden="true" />
              </Link>
            ) : (
              (log.entityLabel ?? "—")
            )
          }
        />
      </div>
      {metadata.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Details</h3>
          <dl className="overflow-hidden rounded-md border border-border text-sm">
            {metadata.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] gap-2 border-t border-border px-3 py-2 first:border-t-0">
                <dt className="break-all font-mono text-xs text-muted-foreground">{key}</dt>
                <dd className="break-all font-mono text-xs">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Changes</h3>
        <ChangeTable before={log.before} after={log.after} />
      </div>
      <Collapsible className="rounded-[calc(var(--radius)-2px)] border border-border">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Technical details
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border px-3 pb-3">
          <div className="divide-y divide-border">
            <DetailRow label="Action key" value={<span className="break-all font-mono text-xs">{log.action}</span>} />
            {log.entityId ? <DetailRow label="Record ID" value={<span className="break-all font-mono text-xs">{log.entityId}</span>} /> : null}
            <DetailRow label="IP address" value={<span className="font-mono text-xs">{log.ipAddress ?? "Not recorded"}</span>} />
            <DetailRow label="Entry ID" value={<span className="break-all font-mono text-xs">{log.id}</span>} />
          </div>
          {log.userAgent ? (
            <div className="space-y-1 pt-2">
              <p className="text-[13px] text-muted-foreground">Browser</p>
              <p className="break-all rounded-md bg-muted p-2 font-mono text-xs text-muted-foreground">{log.userAgent}</p>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/** Side sheet for one audit entry: uses the list row when it is on the current page, otherwise fetches it by id. */
export function AuditLogDetailSheet({ entryId, initial, onClose }: { entryId: string | null; initial: AdminAuditLog | null; onClose: () => void }) {
  const detail = useAuditLogDetail(entryId, !initial);
  const log = initial ?? detail.data;
  return (
    <Sheet open={Boolean(entryId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{log ? `${auditActionGroup(log.action)}: ${auditActionVerb(log.action).toLowerCase()}` : "Audit entry"}</SheetTitle>
          <SheetDescription asChild={Boolean(log)}>
            {log ? (
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusPill tone={auditActionTone(log.action)}>{auditActionVerb(log.action)}</AdminStatusPill>
                <span className="tabular-nums">{formatDateTime(log.createdAt)}</span>
              </div>
            ) : (
              "Loading entry…"
            )}
          </SheetDescription>
        </SheetHeader>
        {log ? (
          <EntryBody key={log.id} log={log} />
        ) : detail.invalidId || detail.error ? (
          <div className="px-4">
            {detail.invalidId || !detail.error || detail.error.kind === "not_found" || detail.error.kind === "validation" ? (
              <p className="text-sm text-muted-foreground">This audit entry does not exist.</p>
            ) : (
              <AdminErrorState error={detail.error} onRetry={detail.reload} title="Could not load this entry" />
            )}
          </div>
        ) : (
          <p role="status" className="px-4 text-sm text-muted-foreground">
            Loading entry…
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
