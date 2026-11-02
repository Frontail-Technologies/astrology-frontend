import type { ChatSessionStatus } from "../types/chat-session-admin.ts";

export const chatSessionStatusLabels: Record<ChatSessionStatus, string> = { pending: "Pending", active: "Active", ended: "Ended", insufficient_balance: "Insufficient balance", cancelled: "Cancelled" };
export const chatSessionStatusVariants: Record<ChatSessionStatus, "pending" | "online" | "verified" | "unavailable" | "muted"> = { pending: "pending", active: "online", ended: "verified", insufficient_balance: "unavailable", cancelled: "muted" };

/** Why a paid chat session ended (backend `endReason`); unknown values fall back to a readable form. */
export const chatSessionEndReasonLabels: Record<string, string> = {
  ended_by_customer: "Ended by the customer",
  ended_by_astrologer: "Ended by the astrologer",
  insufficient_balance: "Wallet balance ran out",
};
export const chatSessionEndReasonLabel = (reason: string) => chatSessionEndReasonLabels[reason] ?? reason.charAt(0).toUpperCase() + reason.slice(1).replace(/[_-]+/g, " ");
