"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import { Coins, Eye, Landmark, Percent, Wallet } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEarningRepository } from "@/features/finance/hooks/use-finance-repositories";
import type { Earning, EarningStatus } from "@/features/finance/types/finance";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";
import { AdminMetricCard } from "./shared/admin-metric-card";
import { AdminListScaffold, AdminPageHeader, DetailRow, dateTime, money } from "./shared/admin-list-scaffold";

const statusLabels: Record<EarningStatus, string> = { pending: "Pending", available: "Available", "paid-out": "Paid out" };
const statusVariants: Record<EarningStatus, "pending" | "online" | "muted"> = { pending: "pending", available: "online", "paid-out": "muted" };
const modeLabels: Record<Earning["mode"], string> = { chat: "Chat", call: "Call", video: "Video" };

export function AdminEarningsView() {
  const { records, ready } = useEarningRepository();
  const totals = useMemo(() => records.reduce((acc, item) => ({ gross: acc.gross + item.grossInPaise, commission: acc.commission + item.commissionInPaise, available: acc.available + (item.status === "available" ? item.netInPaise : 0), paid: acc.paid + (item.status === "paid-out" ? item.netInPaise : 0) }), { gross: 0, commission: 0, available: 0, paid: 0 }), [records]);
  const astrologerOptions = useMemo(() => Object.fromEntries(records.map((item) => [item.astrologerId, item.astrologerName])), [records]);

  const columns = useMemo<ColumnDef<Earning>[]>(() => [
    { id: "earning", header: "Earning", cell: ({ row }) => <div><p className="font-mono text-xs font-semibold">{row.original.id}</p><p className="text-xs text-muted-foreground">{row.original.consultationId}</p></div> },
    { accessorKey: "astrologerName", header: "Astrologer", cell: ({ row }) => <Link className="font-medium hover:underline" href={`/admin/astrologers/${row.original.astrologerId}`}>{row.original.astrologerName}</Link> },
    { id: "mode", header: "Mode", cell: ({ row }) => modeLabels[row.original.mode] },
    { id: "gross", header: "Gross", cell: ({ row }) => money(row.original.grossInPaise) },
    { id: "commission", header: "Commission", cell: ({ row }) => <span className="text-muted-foreground">−{money(row.original.commissionInPaise)}</span> },
    { id: "net", header: "Net", cell: ({ row }) => <span className="font-medium">{money(row.original.netInPaise)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={statusVariants[row.original.status]}>{statusLabels[row.original.status]}</Badge> },
    { id: "date", header: "Date", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{dateTime(row.original.createdAt)}</span> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex justify-end"><Link href={`/admin/earnings/${row.original.id}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${row.original.id}`} title="View earning"><Eye className="size-4" /></Link></div> },
  ], []);

  if (!ready) return <div className="min-h-40" />;

  return (
    <AdminListScaffold
      title="Earnings"
      description="Per-consultation astrologer earnings after platform commission."
      summary={<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminMetricCard label="Gross billed" value={money(totals.gross)} icon={Coins} tone="blue" /><AdminMetricCard label="Platform commission" value={money(totals.commission)} icon={Percent} tone="violet" /><AdminMetricCard label="Available to astrologers" value={money(totals.available)} icon={Wallet} tone="green" href="/admin/payouts" /><AdminMetricCard label="Paid out" value={money(totals.paid)} icon={Landmark} tone="neutral" /></div>}
      records={records}
      columns={columns}
      searchPlaceholder="Search earning, astrologer or consultation"
      searchText={(item) => `${item.id} ${item.astrologerName} ${item.consultationId}`}
      filters={[
        { id: "status", allLabel: "All statuses", options: statusLabels, match: (item, value) => item.status === value },
        { id: "astrologer", allLabel: "All astrologers", options: astrologerOptions, match: (item, value) => item.astrologerId === value },
      ]}
      emptyLabel="No earnings match the current filters."
      renderMobileCard={(item) => (
        <Link key={item.id} href={`/admin/earnings/${item.id}`} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="flex justify-between gap-3"><span className="font-medium">{item.astrologerName}</span><Badge variant={statusVariants[item.status]}>{statusLabels[item.status]}</Badge></div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{modeLabels[item.mode]} · {item.consultationId}</span><span className="font-medium text-foreground">{money(item.netInPaise)}</span></div>
        </Link>
      )}
    />
  );
}

export function AdminEarningDetailView({ earningId }: { earningId: string }) {
  const { getById, ready } = useEarningRepository();
  if (!ready) return <div className="min-h-40" />;
  const earning = getById(earningId);
  if (!earning) notFound();
  const rate = earning.grossInPaise ? Math.round((earning.commissionInPaise / earning.grossInPaise) * 100) : 0;

  return (
    <section className="mx-auto max-w-[1200px] space-y-4">
      <AdminPageHeader title={`Earning ${earning.id}`} backHref="/admin/earnings" backLabel="Earnings" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle>Breakdown</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow label="Gross billed" value={money(earning.grossInPaise)} />
            <DetailRow label={`Platform commission (${rate}%)`} value={`−${money(earning.commissionInPaise)}`} />
            <DetailRow label="Net to astrologer" value={<span className="text-base">{money(earning.netInPaise)}</span>} />
            <DetailRow label="Status" value={<Badge variant={statusVariants[earning.status]}>{statusLabels[earning.status]}</Badge>} />
            <DetailRow label="Mode" value={modeLabels[earning.mode]} />
            <DetailRow label="Recorded" value={dateTime(earning.createdAt)} />
          </CardContent>
        </Card>
        <AdminDetailStickyRail>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Linked records</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailRow label="Astrologer" value={<Link className="hover:underline" href={`/admin/astrologers/${earning.astrologerId}`}>{earning.astrologerName}</Link>} />
              <DetailRow label="Consultation" value={<Link className="font-mono text-xs hover:underline" href={`/admin/consultations/${earning.consultationId}`}>{earning.consultationId}</Link>} />
              <DetailRow label="Payout" value={earning.payoutId ? <Link className="font-mono text-xs hover:underline" href={`/admin/payouts/${earning.payoutId}`}>{earning.payoutId}</Link> : "Not paid out"} />
            </CardContent>
          </Card>
        </AdminDetailStickyRail>
      </div>
    </section>
  );
}
