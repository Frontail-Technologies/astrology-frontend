"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Banknote, Coins, Eye, HandCoins, Landmark, ReceiptIndianRupee, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { earningStatusLabels, earningStatusVariants } from "@/features/earnings/constants/earning-status";
import { useEarningDetail, useEarningList, useEarningSummary } from "@/features/earnings/hooks/use-earning-admin";
import type { AdminEarning } from "@/features/earnings/types/earning-admin";
import { formatDateTime, formatINR, formatOptionalDateTime } from "../../lib/format";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame, AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

function SummaryCards() {
  const summary = useEarningSummary();
  if (!summary.data) return null;
  const cards = [
    { label: "Total billed", value: summary.data.grossRevenuePaise, icon: ReceiptIndianRupee },
    { label: "Platform revenue", value: summary.data.platformRevenuePaise, icon: Landmark },
    { label: "Still to pay astrologers", value: summary.data.astrologerPayablePaise, icon: HandCoins },
    { label: "Paid out", value: summary.data.paidPaise, icon: Banknote },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <AdminMetricCard key={card.label} label={card.label} value={formatINR(card.value)} icon={card.icon} />
      ))}
    </div>
  );
}

const astrologerName = (earning: AdminEarning) => earning.astrologer?.displayName ?? "Astrologer";

const rowActions = (earning: AdminEarning): AdminRowAction[] => [
  { label: "View earning", icon: Eye, href: `/admin/earnings/${earning.id}` },
  { label: "View astrologer", icon: UserRound, href: `/admin/astrologers/${earning.astrologerId}` },
];

/** Astrologer earnings ledger (read-only; earnings are created by chat billing and settled through payouts). */
export function AdminEarningsView() {
  const list = useEarningList();
  const columns = useMemo<ColumnDef<AdminEarning>[]>(
    () => [
      {
        id: "astrologer",
        header: "Astrologer",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-40">
            <Link className="block truncate font-medium hover:underline" href={`/admin/earnings/${row.original.id}`}>
              {astrologerName(row.original)}
            </Link>
            <p className="text-xs tabular-nums text-muted-foreground">{formatDateTime(row.original.createdAt)}</p>
          </div>
        ),
      },
      { id: "gross", header: "Billed", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatINR(row.original.grossAmountPaise)}</span> },
      { id: "fee", header: "Platform fee", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatINR(row.original.platformFeePaise)}</span> },
      { id: "net", header: "Astrologer share", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm font-medium tabular-nums">{formatINR(row.original.astrologerEarningPaise)}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={earningStatusLabels} variants={earningStatusVariants} /> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/earnings/${row.original.id}`} label="View earning" icon={Eye} />
            <AdminRowActions label="More actions" actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );
  return (
    <AdminServerList
      title="Earnings"
      description="Each astrologer's share of paid consultations, settled through payouts."
      noun="earnings"
      summary={<SummaryCards />}
      list={list}
      dateRange
      idFilterLabels={{ astrologerId: "Astrologer", consultationId: "Consultation", chatSessionId: "Chat session" }}
      idFilterName={(key, rows) => (key === "astrologerId" ? rows[0]?.astrologer?.displayName : null)}
      columns={columns}
      filters={[{ key: "status", allLabel: "All statuses", options: earningStatusLabels }]}
      emptyLabel="No earnings yet"
      emptyDescription="Earnings are recorded automatically when paid consultations are billed."
      emptyIcon={Coins}
      renderMobileCard={(earning) => (
        <article key={earning.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/earnings/${earning.id}`} className="block truncate font-medium hover:underline">
                {astrologerName(earning)}
              </Link>
              <p className="text-xs tabular-nums text-muted-foreground">
                {formatINR(earning.astrologerEarningPaise)} of {formatINR(earning.grossAmountPaise)}
              </p>
            </div>
            <AdminRowActions label="Earning actions" actions={rowActions(earning)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">{formatDateTime(earning.createdAt)}</p>
            <AdminStatusBadge status={earning.status} labels={earningStatusLabels} variants={earningStatusVariants} />
          </div>
        </article>
      )}
    />
  );
}

export function AdminEarningDetailView({ earningId }: { earningId: string }) {
  const detail = useEarningDetail(earningId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="earning">
      {() => {
        const earning = detail.data!;
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`${formatINR(earning.astrologerEarningPaise)} earning`}
              backHref="/admin/earnings"
              backLabel="Earnings"
              meta={
                <>
                  <AdminStatusBadge status={earning.status} labels={earningStatusLabels} variants={earningStatusVariants} />
                  <span>{astrologerName(earning)}</span>
                  <span className="tabular-nums">{formatDateTime(earning.createdAt)}</span>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Breakdown">
                  <div className="divide-y divide-border">
                    <DetailRow label="Billed to customer" value={<span className="tabular-nums">{formatINR(earning.grossAmountPaise)}</span>} />
                    <DetailRow
                      label={`Platform fee (${(earning.commissionRateBps / 100).toFixed(2).replace(/\.00$/, "")}%)`}
                      value={<span className="tabular-nums">−{formatINR(earning.platformFeePaise)}</span>}
                    />
                    <div className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span className="font-semibold">Astrologer share</span>
                      <span className="text-base font-semibold tabular-nums">{formatINR(earning.astrologerEarningPaise)}</span>
                    </div>
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Dates">
                  <div className="divide-y divide-border">
                    <DetailRow label="Recorded" value={<span className="tabular-nums">{formatDateTime(earning.createdAt)}</span>} />
                    <DetailRow label="Can be paid out from" value={<span className="tabular-nums">{formatOptionalDateTime(earning.availableAt, "Not set")}</span>} />
                  </div>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Related records">
                  <div className="divide-y divide-border">
                    <DetailRow label="Astrologer" value={<Link className="hover:underline" href={`/admin/astrologers/${earning.astrologerId}`}>{astrologerName(earning)}</Link>} />
                    <DetailRow
                      label="Customer"
                      value={
                        earning.customer ? (
                          <Link className="break-all hover:underline" href={`/admin/customers/${earning.customer.userId}`}>
                            {earning.customer.email ?? "View customer"}
                          </Link>
                        ) : (
                          "Not linked"
                        )
                      }
                    />
                    {earning.consultationId ? <DetailRow label="Consultation" value={<Link className="hover:underline" href={`/admin/consultations/${earning.consultationId}`}>View consultation</Link>} /> : null}
                    {earning.chatSessionId ? <DetailRow label="Chat session" value={<Link className="hover:underline" href={`/admin/chat-sessions/${earning.chatSessionId}`}>View session</Link>} /> : null}
                  </div>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
