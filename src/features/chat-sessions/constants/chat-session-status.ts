import type { ChatSessionMode, ChatSessionStatus } from "../types/chat-session-admin.ts";

export const chatSessionStatusLabels: Record<ChatSessionStatus, string> = { pending: "Pending", active: "Active", ended: "Ended", insufficient_balance: "Insufficient balance", cancelled: "Cancelled" };
export const chatSessionStatusVariants: Record<ChatSessionStatus, "pending" | "online" | "verified" | "unavailable" | "muted"> = { pending: "pending", active: "online", ended: "verified", insufficient_balance: "unavailable", cancelled: "muted" };

/** Why a paid chat session ended (backend `endReason`); unknown values fall back to a readable form. */
export const chatSessionEndReasonLabels: Record<string, string> = {
  ended_by_customer: "Ended by the customer",
  ended_by_astrologer: "Ended by the astrologer",
  insufficient_balance: "Wallet balance ran out",
  customer_ended: "Ended by the customer",
  astrologer_ended: "Ended by the astrologer",
  not_connected: "Call never connected (not billed)",
};

export const chatSessionModeLabels: Record<ChatSessionMode, string> = { chat: "Chat", voice: "Voice call" };
export const chatSessionEndReasonLabel = (reason: string) => chatSessionEndReasonLabels[reason] ?? reason.charAt(0).toUpperCase() + reason.slice(1).replace(/[_-]+/g, " ");
