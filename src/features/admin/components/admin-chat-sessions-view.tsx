"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import { Activity, Coins, Eye, Timer } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChatSessionRepository } from "@/features/finance/hooks/use-finance-repositories";
import type { ChatSession, ChatSessionStatus } from "@/features/finance/types/finance";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";
import { AdminMetricCard } from "./shared/admin-metric-card";
import { AdminListScaffold, AdminPageHeader, DetailRow, dateTime, duration, money } from "./shared/admin-list-scaffold";

const statusLabels: Record<ChatSessionStatus, string> = { active: "Active", ended: "Ended", "insufficient-balance": "Balance exhausted" };
const statusVariants: Record<ChatSessionStatus, "online" | "muted" | "pending"> = { active: "online", ended: "muted", "insufficient-balance": "pending" };
const endReasonLabels: Record<NonNullable<ChatSession["endReason"]>, string> = { "customer-ended": "Ended by customer", "astrologer-ended": "Ended by astrologer", "balance-exhausted": "Wallet balance exhausted", timeout: "Timed out" };

export function AdminChatSessionsView() {
  const { records, ready } = useChatSessionRepository();
  const active = records.filter((item) => item.status === "active").length;
  const billed = useMemo(() => records.reduce((sum, item) => sum + item.chargedInPaise, 0), [records]);
  const seconds = useMemo(() => records.reduce((sum, item) => sum + item.billableSeconds, 0), [records]);

  const columns = useMemo<ColumnDef<ChatSession>[]>(() => [
    { id: "session", header: "Session", cell: ({ row }) => <div><p className="font-mono text-xs font-semibold">{row.original.id}</p><p className="text-xs text-muted-foreground">{row.original.consultationId}</p></div> },
    { accessorKey: "customerName", header: "Customer", cell: ({ row }) => <Link className="font-medium hover:underline" href={`/admin/customers/${row.original.customerId}`}>{row.original.customerName}</Link> },
    { accessorKey: "astrologerName", header: "Astrologer", cell: ({ row }) => <Link className="hover:underline" href={`/admin/astrologers/${row.original.astrologerId}`}>{row.original.astrologerName}</Link> },
    { id: "rate", header: "Rate", cell: ({ row }) => <span className="text-xs">{money(row.original.ratePerMinuteInPaise)}/min</span> },
    { id: "duration", header: "Billed time", cell: ({ row }) => duration(row.original.billableSeconds) },
    { id: "charged", header: "Charged", cell: ({ row }) => <span className="font-medium">{money(row.original.chargedInPaise)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={statusVariants[row.original.status]}>{statusLabels[row.original.status]}</Badge> },
    { id: "started", header: "Started", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{dateTime(row.original.startedAt)}</span> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex justify-end"><Link href={`/admin/chat-sessions/${row.original.id}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${row.original.id}`} title="View session"><Eye className="size-4" /></Link></div> },
  ], []);

  if (!ready) return <div className="min-h-40" />;

  return (
    <AdminListScaffold
      title="Chat sessions"
      description="Per-minute billing for paid chat consultations."
      summary={<div className="grid gap-3 sm:grid-cols-3"><AdminMetricCard label="Active now" value={active} icon={Activity} tone="green" /><AdminMetricCard label="Billed time" value={duration(seconds)} icon={Timer} tone="blue" /><AdminMetricCard label="Charged" value={money(billed)} icon={Coins} tone="violet" /></div>}
      records={records}
      columns={columns}
      searchPlaceholder="Search session, customer or astrologer"
      searchText={(item) => `${item.id} ${item.customerName} ${item.astrologerName} ${item.consultationId}`}
      filters={[{ id: "status", allLabel: "All statuses", options: statusLabels, match: (item, value) => item.status === value }]}
      emptyLabel="No chat sessions match the current filters."
      renderMobileCard={(item) => (
        <Link key={item.id} href={`/admin/chat-sessions/${item.id}`} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="flex justify-between gap-3"><span className="font-medium">{item.customerName} → {item.astrologerName}</span><Badge variant={statusVariants[item.status]}>{statusLabels[item.status]}</Badge></div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{duration(item.billableSeconds)}</span><span className="font-medium text-foreground">{money(item.chargedInPaise)}</span></div>
        </Link>
      )}
    />
  );
}

export function AdminChatSessionDetailView({ sessionId }: { sessionId: string }) {
  const { getById, ready } = useChatSessionRepository();
  if (!ready) return <div className="min-h-40" />;
  const session = getById(sessionId);
  if (!session) notFound();

  return (
    <section className="mx-auto max-w-[1200px] space-y-4">
      <AdminPageHeader title={`Chat session ${session.id}`} backHref="/admin/chat-sessions" backLabel="Chat sessions" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle>Billing</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow label="Status" value={<Badge variant={statusVariants[session.status]}>{statusLabels[session.status]}</Badge>} />
            <DetailRow label="Rate" value={`${money(session.ratePerMinuteInPaise)} per minute`} />
            <DetailRow label="Billed time" value={duration(session.billableSeconds)} />
            <DetailRow label="Charged" value={<span className="text-base">{money(session.chargedInPaise)}</span>} />
            <DetailRow label="Started" value={dateTime(session.startedAt)} />
            <DetailRow label="Ended" value={session.endedAt ? dateTime(session.endedAt) : "In progress"} />
            <DetailRow label="End reason" value={session.endReason ? endReasonLabels[session.endReason] : "-"} />
          </CardContent>
        </Card>
        <AdminDetailStickyRail>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Linked records</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailRow label="Customer" value={<Link className="hover:underline" href={`/admin/customers/${session.customerId}`}>{session.customerName}</Link>} />
              <DetailRow label="Astrologer" value={<Link className="hover:underline" href={`/admin/astrologers/${session.astrologerId}`}>{session.astrologerName}</Link>} />
              <DetailRow label="Consultation" value={<Link className="font-mono text-xs hover:underline" href={`/admin/consultations/${session.consultationId}`}>{session.consultationId}</Link>} />
              <DetailRow label="Conversation" value={<Link className="font-mono text-xs hover:underline" href={`/admin/chats/${session.conversationId}`}>{session.conversationId}</Link>} />
              <DetailRow label="Wallet" value={<Link className="hover:underline" href={`/admin/wallets/${session.customerId}`}>View wallet</Link>} />
            </CardContent>
          </Card>
        </AdminDetailStickyRail>
      </div>
    </section>
  );
}
