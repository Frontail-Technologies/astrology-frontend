"use client";

import Link from "next/link";

import { paymentPurpose, paymentStatusLabels, paymentStatusVariants } from "@/features/payments/constants/payment-status";
import { usePaymentsForCustomer } from "@/features/payments/hooks/use-payment-admin";
import { chatSessionStatusLabels, chatSessionStatusVariants } from "@/features/chat-sessions/constants/chat-session-status";
import { useChatSessionsForCustomer } from "@/features/chat-sessions/hooks/use-chat-session-admin";
import { chatStatusLabels, chatStatusVariants } from "@/features/chats/constants/chat-status";
import { useChatsForCustomer } from "@/features/chats/hooks/use-chat-admin";
import { ticketStatusLabels, ticketStatusVariants } from "@/features/support/constants/support-status";
import { useTicketsForCustomer } from "@/features/support/hooks/use-support-admin";
import { useWalletForCustomer } from "@/features/wallets/hooks/use-wallet-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminRelatedList, AdminRelatedRow } from "../shared/admin-related-list";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminStatusBadge } from "../shared/admin-status-badge";

function WalletCard({ customerId }: { customerId: string }) {
  const wallet = useWalletForCustomer(customerId);
  return (
    <AdminSectionCard
      title="Wallet"
      actions={
        wallet.data ? (
          <Link href={`/admin/wallets/${customerId}`} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
            Open ledger
          </Link>
        ) : null
      }
    >
      {!wallet.ready ? (
        <p className="text-sm text-muted-foreground" role="status">Loading…</p>
      ) : wallet.error?.kind === "not_found" ? (
        <p className="text-sm text-muted-foreground">No wallet yet. One is created with the first top-up.</p>
      ) : wallet.error ? (
        <p className="text-sm text-destructive">{wallet.error.message}</p>
      ) : wallet.data ? (
        <div>
          <p className="text-[13px] text-muted-foreground">Current balance</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{formatINR(wallet.data.balancePaise)}</p>
        </div>
      ) : null}
    </AdminSectionCard>
  );
}

/** Customer side panels: wallet, chats, paid chat sessions, payments and support tickets, each filtered on the server. */
export function CustomerRelatedPanels({ customerId }: { customerId: string }) {
  const chats = useChatsForCustomer(customerId);
  const sessions = useChatSessionsForCustomer(customerId);
  const tickets = useTicketsForCustomer(customerId);
  const payments = usePaymentsForCustomer(customerId);
  return (
    <>
      <WalletCard customerId={customerId} />
      <AdminRelatedList
        title="Chats"
        list={chats}
        viewAllHref={`/admin/chats?customerUserId=${customerId}`}
        emptyLabel="No chats yet."
        renderItem={(chat) => (
          <AdminRelatedRow
            href={`/admin/chats/${chat.id}`}
            primary={`With ${chat.astrologer.displayName}`}
            secondary={chat.lastMessage ? formatDateTime(chat.lastMessage.createdAt) : "No messages"}
            trailing={<AdminStatusBadge status={chat.status} labels={chatStatusLabels} variants={chatStatusVariants} />}
          />
        )}
      />
      <AdminRelatedList
        title="Paid chat sessions"
        list={sessions}
        viewAllHref={`/admin/chat-sessions?customerUserId=${customerId}`}
        emptyLabel="No paid chat sessions yet."
        renderItem={(session) => (
          <AdminRelatedRow
            href={`/admin/chat-sessions/${session.id}`}
            primary={`${formatINR(session.chargedPaise)} charged`}
            secondary={session.startedAt ? formatDateTime(session.startedAt) : "Not started"}
            trailing={<AdminStatusBadge status={session.status} labels={chatSessionStatusLabels} variants={chatSessionStatusVariants} />}
          />
        )}
      />
      <AdminRelatedList
        title="Payments"
        list={payments}
        viewAllHref={`/admin/payments?customerUserId=${customerId}`}
        emptyLabel="No payments yet."
        renderItem={(payment) => (
          <AdminRelatedRow
            href={`/admin/payments/${payment.id}`}
            primary={`${formatINR(payment.amountPaise)} · ${paymentPurpose(payment)}`}
            secondary={formatDateTime(payment.createdAt)}
            trailing={<AdminStatusBadge status={payment.status} labels={paymentStatusLabels} variants={paymentStatusVariants} />}
          />
        )}
      />
      <AdminRelatedList
        title="Support tickets"
        list={tickets}
        viewAllHref={`/admin/support?customerUserId=${customerId}`}
        emptyLabel="No support tickets."
        renderItem={(ticket) => (
          <AdminRelatedRow
            href={`/admin/support/${ticket.id}`}
            primary={ticket.subject}
            secondary={formatDateTime(ticket.updatedAt)}
            trailing={<AdminStatusBadge status={ticket.status} labels={ticketStatusLabels} variants={ticketStatusVariants} />}
          />
        )}
      />
    </>
  );
}
