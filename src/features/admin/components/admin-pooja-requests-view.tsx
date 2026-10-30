"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { CalendarClock, Eye, Inbox } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePoojaRequestRepository, type PoojaRequest, type PoojaRequestStatus } from "@/features/pooja-requests/pooja-requests";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";
import { AdminMetricCard } from "./shared/admin-metric-card";
import { AdminListScaffold, AdminPageHeader, DetailRow, dateOnly, dateTime, money } from "./shared/admin-list-scaffold";

const statusLabels: Record<PoojaRequestStatus, string> = { requested: "Requested", confirmed: "Confirmed", scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" };
const statusVariants: Record<PoojaRequestStatus, "pending" | "verified" | "gold" | "online" | "muted"> = { requested: "pending", confirmed: "verified", scheduled: "gold", completed: "online", cancelled: "muted" };

export function AdminPoojaRequestsView() {
  const { records, ready } = usePoojaRequestRepository();
  const poojaOptions = useMemo(() => Object.fromEntries(records.map((item) => [item.poojaSlug, item.poojaTitle])), [records]);
  const newCount = records.filter((item) => item.status === "requested").length;
  const upcoming = records.filter((item) => item.status === "scheduled").length;

  const columns = useMemo<ColumnDef<PoojaRequest>[]>(() => [
    { id: "request", header: "Request", cell: ({ row }) => <div><p className="font-mono text-xs font-semibold">{row.original.id}</p><p className="text-xs text-muted-foreground">{dateTime(row.original.createdAt)}</p></div> },
    { accessorKey: "poojaTitle", header: "Pooja", cell: ({ row }) => <Link className="font-medium hover:underline" href={`/admin/poojas/${row.original.poojaSlug}`}>{row.original.poojaTitle}</Link> },
    { accessorKey: "customerName", header: "Customer", cell: ({ row }) => <div><Link className="hover:underline" href={`/admin/customers/${row.original.customerId}`}>{row.original.customerName}</Link><p className="text-xs text-muted-foreground">{row.original.phone}</p></div> },
    { id: "date", header: "Date", cell: ({ row }) => <span className="whitespace-nowrap text-xs">{row.original.scheduledAt ? dateTime(row.original.scheduledAt) : row.original.requestedDate ? `Preferred ${dateOnly(row.original.requestedDate)}` : "Flexible"}</span> },
    { id: "amount", header: "Amount", cell: ({ row }) => <span className="font-medium">{money(row.original.amountInPaise)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={statusVariants[row.original.status]}>{statusLabels[row.original.status]}</Badge> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex justify-end"><Link href={`/admin/pooja-requests/${row.original.id}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${row.original.id}`} title="View request"><Eye className="size-4" /></Link></div> },
  ], []);

  if (!ready) return <div className="min-h-40" />;

  return (
    <AdminListScaffold
      title="Pooja requests"
      description="Confirm, schedule and complete pooja bookings."
      summary={<div className="grid gap-3 sm:grid-cols-2"><AdminMetricCard label="New requests" value={newCount} secondary="Awaiting confirmation" icon={Inbox} tone="amber" /><AdminMetricCard label="Scheduled" value={upcoming} secondary="Upcoming poojas" icon={CalendarClock} tone="blue" /></div>}
      records={records}
      columns={columns}
      searchPlaceholder="Search request, customer or phone"
      searchText={(item) => `${item.id} ${item.customerName} ${item.phone} ${item.poojaTitle}`}
      filters={[
        { id: "status", allLabel: "All statuses", options: statusLabels, match: (item, value) => item.status === value },
        { id: "pooja", allLabel: "All poojas", options: poojaOptions, match: (item, value) => item.poojaSlug === value },
      ]}
      emptyLabel="No pooja requests match the current filters."
      renderMobileCard={(item) => (
        <Link key={item.id} href={`/admin/pooja-requests/${item.id}`} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="flex justify-between gap-3"><span className="font-medium">{item.poojaTitle}</span><Badge variant={statusVariants[item.status]}>{statusLabels[item.status]}</Badge></div>
          <p className="mt-1 text-sm">{item.customerName}</p>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{item.scheduledAt ? dateTime(item.scheduledAt) : item.requestedDate ? `Preferred ${dateOnly(item.requestedDate)}` : "Flexible"}</span><span className="font-medium text-foreground">{money(item.amountInPaise)}</span></div>
        </Link>
      )}
    />
  );
}

export function AdminPoojaRequestDetailView({ requestId }: { requestId: string }) {
  const { getById, ready, setStatus, schedule } = usePoojaRequestRepository();
  const [scheduling, setScheduling] = useState(false);
  const [when, setWhen] = useState("");
  if (!ready) return <div className="min-h-40" />;
  const request = getById(requestId);
  if (!request) notFound();

  const open = request.status !== "completed" && request.status !== "cancelled";
  const change = (status: PoojaRequestStatus) => { setStatus(request.id, status); toast.success(`Request ${statusLabels[status].toLowerCase()}`); };
  const saveSchedule = () => { if (!when) return; schedule(request.id, new Date(when).toISOString()); toast.success("Pooja scheduled"); setScheduling(false); };

  return (
    <section className="mx-auto max-w-[1200px] space-y-4">
      <AdminPageHeader
        title={request.poojaTitle}
        description={`Request ${request.id}`}
        backHref="/admin/pooja-requests"
        backLabel="Pooja requests"
        actions={open ? (
          <>
            {request.status === "requested" ? <Button size="sm" variant="outline" onClick={() => change("confirmed")}>Confirm</Button> : null}
            <Button size="sm" variant="outline" onClick={() => { setWhen(request.scheduledAt ? request.scheduledAt.slice(0, 16) : request.requestedDate ? `${request.requestedDate}T06:00` : ""); setScheduling(true); }}>{request.scheduledAt ? "Reschedule" : "Schedule"}</Button>
            {request.status === "scheduled" ? <Button size="sm" className="!bg-primary !text-primary-foreground hover:!bg-primary/90" onClick={() => change("completed")}>Mark completed</Button> : null}
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => change("cancelled")}>Cancel</Button>
          </>
        ) : null}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Booking</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailRow label="Status" value={<Badge variant={statusVariants[request.status]}>{statusLabels[request.status]}</Badge>} />
              <DetailRow label="Preferred date" value={request.requestedDate ? dateOnly(request.requestedDate) : "Flexible"} />
              <DetailRow label="Scheduled for" value={request.scheduledAt ? dateTime(request.scheduledAt) : "Not scheduled"} />
              <DetailRow label="Amount" value={money(request.amountInPaise)} />
              <DetailRow label="Requested" value={dateTime(request.createdAt)} />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Address</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{request.address}</p></CardContent>
          </Card>
          {request.notes ? <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle>Customer notes</CardTitle></CardHeader><CardContent><p className="text-sm">{request.notes}</p></CardContent></Card> : null}
        </div>
        <AdminDetailStickyRail>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailRow label="Name" value={<Link className="hover:underline" href={`/admin/customers/${request.customerId}`}>{request.customerName}</Link>} />
              <DetailRow label="Phone" value={request.phone} />
              <DetailRow label="Email" value={request.email ?? "-"} />
            </CardContent>
          </Card>
        </AdminDetailStickyRail>
      </div>
      <Dialog open={scheduling} onOpenChange={setScheduling}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule pooja</DialogTitle>
            <DialogDescription>The customer will see this date and time on their booking.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5"><Label htmlFor="pooja-when">Date and time</Label><Input id="pooja-when" type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduling(false)}>Cancel</Button>
            <Button disabled={!when} className="!bg-primary !text-primary-foreground hover:!bg-primary/90" onClick={saveSchedule}>Save schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
