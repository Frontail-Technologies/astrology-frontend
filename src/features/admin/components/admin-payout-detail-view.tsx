"use client";

import Link from "next/link";
import { useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEarningRepository, usePayoutRepository } from "@/features/finance/hooks/use-finance-repositories";
import type { PayoutStatus } from "@/features/finance/types/finance";
import { payoutStatusLabels, payoutStatusVariants } from "./admin-payouts-view";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";
import { AdminPageHeader, DetailRow, dateOnly, dateTime, money } from "./shared/admin-list-scaffold";

const transitions: Record<PayoutStatus, { status: PayoutStatus; label: string; destructive?: boolean }[]> = {
  pending: [{ status: "processing", label: "Mark processing" }, { status: "cancelled", label: "Cancel payout", destructive: true }],
  processing: [{ status: "paid", label: "Mark paid" }, { status: "failed", label: "Mark failed", destructive: true }],
  failed: [{ status: "pending", label: "Retry" }],
  paid: [],
  cancelled: [],
};

export function AdminPayoutDetailView({ payoutId }: { payoutId: string }) {
  const { getById, ready, setStatus } = usePayoutRepository();
  const earnings = useEarningRepository();
  const [target, setTarget] = useState<{ status: PayoutStatus; label: string; destructive?: boolean } | null>(null);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  if (!ready || !earnings.ready) return <div className="min-h-40" />;
  const payout = getById(payoutId);
  if (!payout) notFound();
  const linked = earnings.records.filter((item) => item.payoutId === payout.id);

  const confirm = () => {
    if (!target) return;
    setStatus(payout.id, target.status, { reference: reference.trim() || payout.reference, note: note.trim() || payout.note });
    toast.success(`Payout ${payoutStatusLabels[target.status].toLowerCase()}`);
    setTarget(null);
  };

  return (
    <section className="mx-auto max-w-[1200px] space-y-4">
      <AdminPageHeader
        title={`Payout ${payout.id}`}
        backHref="/admin/payouts"
        backLabel="Payouts"
        actions={transitions[payout.status].map((item) => (
          <Button key={item.status} size="sm" variant={item.destructive ? "outline" : "default"} className={item.destructive ? "text-destructive" : "!bg-primary !text-primary-foreground hover:!bg-primary/90"} onClick={() => { setReference(payout.reference ?? ""); setNote(""); setTarget(item); }}>
            {item.label}
          </Button>
        ))}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Payout information</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailRow label="Amount" value={money(payout.amountInPaise)} />
              <DetailRow label="Period" value={`${dateOnly(payout.periodStart)} – ${dateOnly(payout.periodEnd)}`} />
              <DetailRow label="Status" value={<Badge variant={payoutStatusVariants[payout.status]}>{payoutStatusLabels[payout.status]}</Badge>} />
              <DetailRow label="Method" value={payout.method === "upi" ? "UPI" : "Bank transfer"} />
              <DetailRow label="Account" value={payout.accountLabel} />
              <DetailRow label="Reference" value={<span className="font-mono text-xs">{payout.reference ?? "-"}</span>} />
              <DetailRow label="Created" value={dateTime(payout.createdAt)} />
              <DetailRow label="Last updated" value={dateTime(payout.updatedAt)} />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Included earnings</CardTitle></CardHeader>
            <CardContent>
              {linked.length ? (
                <div className="divide-y divide-border">
                  {linked.map((item) => (
                    <Link key={item.id} href={`/admin/earnings/${item.id}`} className="flex justify-between gap-3 py-3 text-sm hover:text-primary">
                      <span><span className="font-mono text-xs font-semibold">{item.id}</span><span className="ml-2 text-muted-foreground">{item.consultationId} · {item.mode}</span></span>
                      <span className="font-medium">{money(item.netInPaise)}</span>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No earnings are linked to this payout yet.</p>}
            </CardContent>
          </Card>
          {payout.note ? <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle>Note</CardTitle></CardHeader><CardContent><p className="text-sm">{payout.note}</p></CardContent></Card> : null}
        </div>
        <AdminDetailStickyRail>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Astrologer</CardTitle></CardHeader>
            <CardContent><Link href={`/admin/astrologers/${payout.astrologerId}`} className="font-medium hover:underline">{payout.astrologerName}</Link><p className="mt-1 text-xs text-muted-foreground">Astrologer profile</p></CardContent>
          </Card>
        </AdminDetailStickyRail>
      </div>
      <Dialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.label}</DialogTitle>
            <DialogDescription>{money(payout.amountInPaise)} to {payout.astrologerName}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {target?.status === "processing" || target?.status === "paid" ? <div className="grid gap-1.5"><Label htmlFor="payout-ref">Transfer reference (UTR)</Label><Input id="payout-ref" value={reference} onChange={(event) => setReference(event.target.value)} /></div> : null}
            <div className="grid gap-1.5"><Label htmlFor="payout-status-note">Note</Label><Textarea id="payout-status-note" className="min-h-16" value={note} onChange={(event) => setNote(event.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Back</Button>
            <Button variant={target?.destructive ? "destructive" : "default"} className={target?.destructive ? undefined : "!bg-primary !text-primary-foreground hover:!bg-primary/90"} onClick={confirm}>{target?.label}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
