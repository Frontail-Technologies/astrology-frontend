"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarClock, Eye, MessagesSquare, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { chatFlagFilterLabels, chatSenderLabel, chatStatusLabels, chatStatusVariants } from "@/features/chats/constants/chat-status";
import { useChatList } from "@/features/chats/hooks/use-chat-admin";
import type { AdminConversation } from "@/features/chats/types/chat-admin";
import { consultationStatusLabels } from "@/features/consultations/constants/consultation-status";
import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import { formatDateTime } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";

export function ChatFlaggedBadge({ chat }: { chat: Pick<AdminConversation, "flaggedAt"> }) {
  if (!chat.flaggedAt) return null;
  return <AdminStatusPill tone="warning">Flagged</AdminStatusPill>;
}

const lastActivity = (chat: AdminConversation) => (chat.lastMessage ? `${formatDateTime(chat.lastMessage.createdAt)} · ${chatSenderLabel(chat.lastMessage.senderRole)}` : "No messages yet");

const rowActions = (chat: AdminConversation) => [
  { label: "View chat details", icon: Eye, href: `/admin/chats/${chat.id}` },
  { label: "View consultation", icon: CalendarClock, href: `/admin/consultations/${chat.consultationId}` },
  { label: "View customer", icon: UserRound, href: `/admin/customers/${chat.customer.id}` },
];

/** Chat metadata list. Message content is never shown here; transcripts require an audited, reason-gated request. */
export function AdminChatsView() {
  const list = useChatList();
  const columns = useMemo<ColumnDef<AdminConversation>[]>(
    () => [
      {
        id: "participants",
        header: "Participants",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-48">
            <p className="truncate font-medium">{personPrimaryLabel(row.original.customer)}</p>
            <p className="truncate text-xs text-muted-foreground">with {row.original.astrologer.displayName}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Chat",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <AdminStatusBadge status={row.original.status} labels={chatStatusLabels} variants={chatStatusVariants} />
            <ChatFlaggedBadge chat={row.original} />
          </div>
        ),
      },
      {
        id: "consultation",
        header: "Consultation",
        enableSorting: false,
        cell: ({ row }) => (
          <Link className="whitespace-nowrap text-sm hover:underline" href={`/admin/consultations/${row.original.consultationId}`}>
            {consultationStatusLabels[row.original.consultationStatus]}
          </Link>
        ),
      },
      { id: "lastActivity", header: "Last message", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{lastActivity(row.original)}</span> },
      { id: "unread", header: "Unread", enableSorting: false, cell: ({ row }) => <span className="tabular-nums">{row.original.unreadCount}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/chats/${row.original.id}`} label="View chat details" icon={Eye} />
            <AdminRowActions label="More actions" actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Chats"
      description="Conversation details only. Message content stays private unless opened with a recorded reason."
      noun="chats"
      list={list}
      idFilterLabels={{ customerUserId: "Customer", astrologerId: "Astrologer", consultationId: "Consultation" }}
      idFilterName={(key, rows) => (key === "customerUserId" ? rows[0]?.customer.email : key === "astrologerId" ? rows[0]?.astrologer.displayName : null)}
      columns={columns}
      filters={[
        { key: "status", allLabel: "All chats", options: chatStatusLabels },
        { key: "flagged", allLabel: "Any flag status", options: chatFlagFilterLabels },
      ]}
      emptyLabel="No chats yet"
      emptyDescription="Chats start when a customer's chat consultation begins."
      emptyIcon={MessagesSquare}
      renderMobileCard={(chat) => (
        <article key={chat.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/chats/${chat.id}`} className="block truncate font-medium hover:underline">
                {personPrimaryLabel(chat.customer)}
              </Link>
              <p className="truncate text-xs text-muted-foreground">with {chat.astrologer.displayName}</p>
            </div>
            <AdminRowActions label="Chat actions" actions={rowActions(chat)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">{lastActivity(chat)}</p>
            <div className="flex flex-wrap gap-1.5">
              <AdminStatusBadge status={chat.status} labels={chatStatusLabels} variants={chatStatusVariants} />
              <ChatFlaggedBadge chat={chat} />
            </div>
          </div>
        </article>
      )}
    />
  );
}
