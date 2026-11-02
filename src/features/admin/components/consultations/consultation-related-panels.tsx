"use client";

import { chatSessionStatusLabels, chatSessionStatusVariants } from "@/features/chat-sessions/constants/chat-session-status";
import { useChatSessionForConsultation } from "@/features/chat-sessions/hooks/use-chat-session-admin";
import { chatStatusLabels, chatStatusVariants } from "@/features/chats/constants/chat-status";
import { useChatForConsultation } from "@/features/chats/hooks/use-chat-admin";
import { earningStatusLabels, earningStatusVariants } from "@/features/earnings/constants/earning-status";
import { useEarningsForConsultation } from "@/features/earnings/hooks/use-earning-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminRelatedList, AdminRelatedRow } from "../shared/admin-related-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

/** Consultation side panels: its chat (metadata only), its paid chat session and the earnings it produced. */
export function ConsultationRelatedPanels({ consultationId }: { consultationId: string }) {
  const chat = useChatForConsultation(consultationId);
  const earnings = useEarningsForConsultation(consultationId);
  const session = useChatSessionForConsultation(consultationId);
  return (
    <>
      <AdminRelatedList
        title="Chat"
        list={chat}
        viewAllHref={`/admin/chats?consultationId=${consultationId}`}
        emptyLabel="No chat for this consultation yet."
        renderItem={(item) => (
          <AdminRelatedRow
            href={`/admin/chats/${item.id}`}
            primary="Open chat details"
            secondary={item.lastMessage ? `Last message ${formatDateTime(item.lastMessage.createdAt)}` : "No messages"}
            trailing={<AdminStatusBadge status={item.status} labels={chatStatusLabels} variants={chatStatusVariants} />}
          />
        )}
      />
      <AdminRelatedList
        title="Paid chat session"
        list={session}
        viewAllHref={`/admin/chat-sessions?consultationId=${consultationId}`}
        emptyLabel="No paid chat session."
        renderItem={(item) => (
          <AdminRelatedRow
            href={`/admin/chat-sessions/${item.id}`}
            primary={`${formatINR(item.chargedPaise)} charged`}
            secondary={item.startedAt ? `Started ${formatDateTime(item.startedAt)}` : "Not started"}
            trailing={<AdminStatusBadge status={item.status} labels={chatSessionStatusLabels} variants={chatSessionStatusVariants} />}
          />
        )}
      />
      <AdminRelatedList
        title="Earnings"
        list={earnings}
        viewAllHref={`/admin/earnings?consultationId=${consultationId}`}
        emptyLabel="No earnings recorded."
        renderItem={(earning) => (
          <AdminRelatedRow
            href={`/admin/earnings/${earning.id}`}
            primary={formatINR(earning.astrologerEarningPaise)}
            secondary={`of ${formatINR(earning.grossAmountPaise)} · ${formatDateTime(earning.createdAt)}`}
            trailing={<AdminStatusBadge status={earning.status} labels={earningStatusLabels} variants={earningStatusVariants} />}
          />
        )}
      />
    </>
  );
}
