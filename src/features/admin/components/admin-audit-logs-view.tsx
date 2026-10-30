"use client";

import { useMemo, useState } from "react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuditLogRepository, type AuditLog } from "@/features/audit-logs/audit-logs";
import { AdminListScaffold, DetailRow, dateTime } from "./shared/admin-list-scaffold";

const verb = (action: string) => action.split(".").pop()?.replace(/_/g, " ") ?? action;

function ChangeTable({ before, after }: { before?: Record<string, unknown> | null; after?: Record<string, unknown> | null }) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
  if (!keys.length) return <p className="text-sm text-muted-foreground">No field changes recorded.</p>;
  const show = (value: unknown) => (value === undefined ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value));
  return (
    <div className="overflow-hidden rounded-md border border-border text-sm">
      <div className="grid grid-cols-3 bg-surface-muted px-3 py-2 text-xs font-medium text-muted-foreground"><span>Field</span><span>Before</span><span>After</span></div>
      {keys.map((key) => (
        <div key={key} className="grid grid-cols-3 gap-2 border-t border-border px-3 py-2">
          <span className="font-mono text-xs">{key}</span>
          <span className="break-all font-mono text-xs text-muted-foreground">{show(before?.[key])}</span>
          <span className="break-all font-mono text-xs">{show(after?.[key])}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminAuditLogsView() {
  const { records, ready } = useAuditLogRepository();
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const sorted = useMemo(() => [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [records]);
  const entityOptions = useMemo(() => Object.fromEntries(records.map((item) => [item.entityType, item.entityType.replace(/_/g, " ")])), [records]);
  const actorOptions = useMemo(() => Object.fromEntries(records.map((item) => [item.actorEmail, item.actorName])), [records]);

  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    { id: "when", header: "When", cell: ({ row }) => <span className="whitespace-nowrap text-xs">{dateTime(row.original.createdAt)}</span> },
    { accessorKey: "actorName", header: "Actor", cell: ({ row }) => <div><p className="font-medium">{row.original.actorName}</p><p className="text-xs text-muted-foreground">{row.original.actorEmail}</p></div> },
    { id: "action", header: "Action", cell: ({ row }) => <Badge variant="outline" className="capitalize">{verb(row.original.action)}</Badge> },
    { id: "entity", header: "Entity", cell: ({ row }) => <div><p className="text-xs capitalize">{row.original.entityType.replace(/_/g, " ")}</p><p className="font-mono text-xs text-muted-foreground">{row.original.entityId}</p></div> },
    { id: "summary", header: "Summary", cell: ({ row }) => <span className="text-sm">{row.original.summary}</span> },
    { id: "ip", header: "IP", cell: ({ row }) => <span className="font-mono text-xs">{row.original.ip}</span> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setSelected(row.original)}>Details</Button></div> },
  ], []);

  if (!ready) return <div className="min-h-40" />;

  return (
    <>
      <AdminListScaffold
        title="Audit log"
        description="Every admin change, who made it and what changed. Read-only."
        records={sorted}
        columns={columns}
        searchPlaceholder="Search summary, entity or actor"
        searchText={(item) => `${item.summary} ${item.entityId} ${item.actorName} ${item.action}`}
        filters={[
          { id: "entity", allLabel: "All entities", options: entityOptions, match: (item, value) => item.entityType === value },
          { id: "actor", allLabel: "All admins", options: actorOptions, match: (item, value) => item.actorEmail === value },
        ]}
        initialColumnVisibility={{ ip: false }}
        emptyLabel="No audit entries match the current filters."
        renderMobileCard={(item) => (
          <button key={item.id} type="button" onClick={() => setSelected(item)} className="rounded-lg border border-border bg-surface p-4 text-left shadow-sm">
            <div className="flex justify-between gap-3"><span className="text-sm font-medium">{item.summary}</span><Badge variant="outline" className="shrink-0 capitalize">{verb(item.action)}</Badge></div>
            <p className="mt-2 text-xs text-muted-foreground">{item.actorName} · {dateTime(item.createdAt)}</p>
          </button>
        )}
      />
      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.summary}</SheetTitle>
                <SheetDescription className="font-mono text-xs">{selected.action}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="divide-y divide-border">
                  <DetailRow label="Actor" value={`${selected.actorName} (${selected.actorEmail})`} />
                  <DetailRow label="Entity" value={<span className="font-mono text-xs">{selected.entityType}/{selected.entityId}</span>} />
                  <DetailRow label="When" value={dateTime(selected.createdAt)} />
                  <DetailRow label="IP address" value={<span className="font-mono text-xs">{selected.ip}</span>} />
                  <DetailRow label="Entry ID" value={<span className="font-mono text-xs">{selected.id}</span>} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Changes</h3>
                  <ChangeTable before={selected.before} after={selected.after} />
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
