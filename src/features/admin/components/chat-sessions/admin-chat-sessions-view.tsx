"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarClock, Eye, MessagesSquare, Timer, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { chatSessionEndReasonLabel, chatSessionStatusLabels, chatSessionStatusVariants } from "@/features/chat-sessions/constants/chat-session-status";
import { useChatSessionDetail, useChatSessionList } from "@/features/chat-sessions/hooks/use-chat-session-admin";
import type { AdminChatSession } from "@/features/chat-sessions/types/chat-session-admin";
import { formatDuration, formatINR, formatOptionalDateTime } from "../../lib/format";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame, AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

const rowActions = (session: AdminChatSession): AdminRowAction[] => [
  { label: "View session", icon: Eye, href: `/admin/chat-sessions/${session.id}` },
  { label: "View consultation", icon: CalendarClock, href: `/admin/consultations/${session.consultationId}` },
  { label: "View customer", icon: UserRound, href: `/admin/customers/${session.customerUserId}` },
  { label: "View astrologer", icon: UserRound, href: `/admin/astrologers/${session.astrologerId}` },
];

/** Paid chat billing sessions (read-only). The API returns participant ids only, so rows link to their records. */
export function AdminChatSessionsView() {
  const list = useChatSessionList();
  const columns = useMemo<ColumnDef<AdminChatSession>[]>(
    () => [
      {
        id: "charged",
        header: "Session",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-40">
            <Link href={`/admin/chat-sessions/${row.original.id}`} className="block font-medium tabular-nums hover:underline">
              {formatINR(row.original.chargedPaise)} charged
            </Link>
            <p className="text-xs tabular-nums text-muted-foreground">{formatOptionalDateTime(row.original.startedAt, "Not started")}</p>
          </div>
        ),
      },
      { id: "rate", header: "Rate", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatINR(row.original.pricePerMinutePaise)} per min</span> },
      { id: "billed", header: "Billed time", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDuration(row.original.billableSeconds)}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={chatSessionStatusLabels} variants={chatSessionStatusVariants} /> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/chat-sessions/${row.original.id}`} label="View session" icon={Eye} />
            <AdminRowActions label="More actions" actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );
  return (
    <AdminServerList
      title="Chat sessions"
      description="Per-minute billing for paid chat consultations."
      noun="sessions"
      list={list}
      dateRange
      idFilterLabels={{ customerUserId: "Customer", astrologerId: "Astrologer", consultationId: "Consultation" }}
      columns={columns}
      filters={[{ key: "status", allLabel: "All statuses", options: chatSessionStatusLabels }]}
      emptyLabel="No paid chat sessions yet"
      emptyDescription="Sessions appear when a paid chat consultation starts billing."
      emptyIcon={Timer}
      renderMobileCard={(session) => (
        <article key={session.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/admin/chat-sessions/${session.id}`} className="font-medium tabular-nums hover:underline">
              {formatINR(session.chargedPaise)} charged
            </Link>
            <AdminRowActions label="Session actions" actions={rowActions(session)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatOptionalDateTime(session.startedAt, "Not started")} · {formatDuration(session.billableSeconds)} at {formatINR(session.pricePerMinutePaise)}/min
            </p>
            <AdminStatusBadge status={session.status} labels={chatSessionStatusLabels} variants={chatSessionStatusVariants} />
          </div>
        </article>
      )}
    />
  );
}

export function AdminChatSessionDetailView({ sessionId }: { sessionId: string }) {
  const detail = useChatSessionDetail(sessionId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="chat session">
      {() => {
        const session = detail.data!;
        const link = (href: string, label: string) => (
          <Link className="hover:underline" href={href}>
            {label}
          </Link>
        );
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`${formatINR(session.chargedPaise)} chat session`}
              backHref="/admin/chat-sessions"
              backLabel="Chat sessions"
              meta={
                <>
                  <AdminStatusBadge status={session.status} labels={chatSessionStatusLabels} variants={chatSessionStatusVariants} />
                  <span className="tabular-nums">Started {formatOptionalDateTime(session.startedAt, "not yet")}</span>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Billing">
                  <div className="divide-y divide-border">
                    <DetailRow label="Rate" value={<span className="tabular-nums">{formatINR(session.pricePerMinutePaise)} per minute</span>} />
                    <DetailRow label="Billed in steps of" value={<span className="tabular-nums">{session.billingUnitSeconds} seconds</span>} />
                    <DetailRow label="Billable time" value={<span className="tabular-nums">{formatDuration(session.billableSeconds)}</span>} />
                    <DetailRow label="Charged" value={<span className="tabular-nums">{formatINR(session.chargedPaise)}</span>} />
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Timing">
                  <div className="divide-y divide-border">
                    <DetailRow label="Started" value={<span className="tabular-nums">{formatOptionalDateTime(session.startedAt, "Not yet")}</span>} />
                    <DetailRow label="Ended" value={<span className="tabular-nums">{formatOptionalDateTime(session.endedAt, "Not yet")}</span>} />
                    <DetailRow label="How it ended" value={session.endReason ? chatSessionEndReasonLabel(session.endReason) : "Still running or not started"} />
                  </div>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Related records">
                  <div className="divide-y divide-border">
                    <DetailRow label="Customer" value={link(`/admin/customers/${session.customerUserId}`, "View customer")} />
                    <DetailRow label="Astrologer" value={link(`/admin/astrologers/${session.astrologerId}`, "View astrologer")} />
                    <DetailRow label="Consultation" value={link(`/admin/consultations/${session.consultationId}`, "View consultation")} />
                    {session.conversationId ? (
                      <DetailRow
                        label="Chat"
                        value={
                          <Link className="inline-flex items-center gap-1.5 hover:underline" href={`/admin/chats/${session.conversationId}`}>
                            <MessagesSquare className="size-3.5" aria-hidden="true" />
                            View chat details
                          </Link>
                        }
                      />
                    ) : null}
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
