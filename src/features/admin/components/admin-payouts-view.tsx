"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, Eye, Plus, Wallet } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEarningRepository, usePayoutRepository } from "@/features/finance/hooks/use-finance-repositories";
import type { Payout, PayoutStatus } from "@/features/finance/types/finance";
import { AdminMetricCard } from "./shared/admin-metric-card";
import { AdminListScaffold, dateOnly, dateTime, money } from "./shared/admin-list-scaffold";

export const payoutStatusLabels: Record<PayoutStatus, string> = { pending: "Pending", processing: "Processing", paid: "Paid", failed: "Failed", cancelled: "Cancelled" };
export const payoutStatusVariants: Record<PayoutStatus, "pending" | "verified" | "online" | "unavailable" | "muted"> = { pending: "pending", processing: "verified", paid: "online", failed: "unavailable", cancelled: "muted" };

export function AdminPayoutsView() {
  const { records, ready, createPayout } = usePayoutRepository();
  const earnings = useEarningRepository();
  const [open, setOpen] = useState(false);

  const astrologers = useMemo(() => {
    const map = new Map<string, { name: string; available: number }>();
    for (const item of earnings.records) {
      const entry = map.get(item.astrologerId) ?? { name: item.astrologerName, available: 0 };
      if (item.status === "available") entry.available += item.netInPaise;
      map.set(item.astrologerId, entry);
    }
    return [...map.entries()].map(([id, value]) => ({ id, ...value }));
  }, [earnings.records]);

  const pendingTotal = records.filter((item) => item.status === "pending" || item.status === "processing").reduce((sum, item) => sum + item.amountInPaise, 0);
  const paidTotal = records.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amountInPaise, 0);
  const availableTotal = astrologers.reduce((sum, item) => sum + item.available, 0);

  const columns = useMemo<ColumnDef<Payout>[]>(() => [
    { id: "payout", header: "Payout", cell: ({ row }) => <div className="min-w-32"><p className="font-mono text-xs font-semibold">{row.original.id}</p><p className="text-xs text-muted-foreground">{dateOnly(row.original.periodStart)} – {dateOnly(row.original.periodEnd)}</p></div> },
    { accessorKey: "astrologerName", header: "Astrologer", cell: ({ row }) => <Link className="font-medium hover:underline" href={`/admin/astrologers/${row.original.astrologerId}`}>{row.original.astrologerName}</Link> },
    { id: "amount", header: "Amount", cell: ({ row }) => <span className="font-medium">{money(row.original.amountInPaise)}</span> },
    { id: "method", header: "Account", cell: ({ row }) => <span className="text-xs">{row.original.accountLabel}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={payoutStatusVariants[row.original.status]}>{payoutStatusLabels[row.original.status]}</Badge> },
    { id: "reference", header: "Reference", cell: ({ row }) => <span className="font-mono text-xs">{row.original.reference ?? "-"}</span> },
    { id: "updated", header: "Updated", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{dateTime(row.original.updatedAt)}</span> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex justify-end"><Link href={`/admin/payouts/${row.original.id}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${row.original.id}`} title="View payout"><Eye className="size-4" /></Link></div> },
  ], []);

  if (!ready || !earnings.ready) return <div className="min-h-40" />;

  return (
    <>
      <AdminListScaffold
        title="Payouts"
        description="Settle astrologer earnings and track transfer status."
        actions={<Button size="sm" className="!bg-primary !text-primary-foreground hover:!bg-primary/90" onClick={() => setOpen(true)}><Plus className="size-4" />Create payout</Button>}
        summary={<div className="grid gap-3 sm:grid-cols-3"><AdminMetricCard label="Ready to pay out" value={money(availableTotal)} secondary="Available astrologer earnings" icon={Wallet} tone="green" /><AdminMetricCard label="In progress" value={money(pendingTotal)} secondary="Pending and processing" icon={Clock} tone="amber" /><AdminMetricCard label="Paid" value={money(paidTotal)} secondary="Settled payouts" icon={Wallet} tone="blue" /></div>}
        records={records}
        columns={columns}
        searchPlaceholder="Search payout, astrologer or reference"
        searchText={(item) => `${item.id} ${item.astrologerName} ${item.reference ?? ""}`}
        filters={[{ id: "status", allLabel: "All statuses", options: payoutStatusLabels, match: (item, value) => item.status === value }]}
        initialColumnVisibility={{ reference: false }}
        emptyLabel="No payouts match the current filters."
        renderMobileCard={(item) => (
          <Link key={item.id} href={`/admin/payouts/${item.id}`} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex justify-between gap-3"><span className="font-medium">{item.astrologerName}</span><Badge variant={payoutStatusVariants[item.status]}>{payoutStatusLabels[item.status]}</Badge></div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{dateOnly(item.periodStart)} – {dateOnly(item.periodEnd)}</span><span className="font-medium text-foreground">{money(item.amountInPaise)}</span></div>
          </Link>
        )}
      />
      <CreatePayoutDialog
        open={open}
        onOpenChange={setOpen}
        astrologers={astrologers}
        onCreate={(input) => {
          const payout = createPayout(input);
          toast.success(`Payout ${payout.id} created`);
          setOpen(false);
        }}
      />
    </>
  );
}

function CreatePayoutDialog({ open, onOpenChange, astrologers, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; astrologers: { id: string; name: string; available: number }[]; onCreate: (input: Omit<Payout, "id" | "status" | "createdAt" | "updatedAt">) => void }) {
  const [astrologerId, setAstrologerId] = useState("");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [method, setMethod] = useState<Payout["method"]>("bank-transfer");
  const [accountLabel, setAccountLabel] = useState("");
  const [note, setNote] = useState("");
  const selected = astrologers.find((item) => item.id === astrologerId);
  const paise = Math.round(Number(amount) * 100);
  const valid = Boolean(selected && paise > 0 && periodStart && periodEnd && periodStart <= periodEnd && accountLabel.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create payout</DialogTitle>
          <DialogDescription>Record a settlement for an astrologer&apos;s available earnings.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Astrologer</Label>
            <Select value={astrologerId} onValueChange={(value) => { setAstrologerId(value); const match = astrologers.find((item) => item.id === value); if (match?.available) setAmount(String(match.available / 100)); }}>
              <SelectTrigger><SelectValue placeholder="Select astrologer" /></SelectTrigger>
              <SelectContent>{astrologers.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} · {money(item.available)} available</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="payout-amount">Amount (₹)</Label><Input id="payout-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label htmlFor="payout-from">Period from</Label><Input id="payout-from" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="payout-to">Period to</Label><Input id="payout-to" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Method</Label><Select value={method} onValueChange={(value) => setMethod(value as Payout["method"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bank-transfer">Bank transfer</SelectItem><SelectItem value="upi">UPI</SelectItem></SelectContent></Select></div>
            <div className="grid gap-1.5"><Label htmlFor="payout-account">Account</Label><Input id="payout-account" placeholder={method === "upi" ? "name@bank" : "Bank •••• 1234"} value={accountLabel} onChange={(event) => setAccountLabel(event.target.value)} /></div>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="payout-note">Note</Label><Textarea id="payout-note" className="min-h-16" value={note} onChange={(event) => setNote(event.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!valid} className="!bg-primary !text-primary-foreground hover:!bg-primary/90" onClick={() => selected && onCreate({ astrologerId: selected.id, astrologerName: selected.name, amountInPaise: paise, periodStart, periodEnd, method, accountLabel: accountLabel.trim(), note: note.trim() || undefined })}>Create payout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
