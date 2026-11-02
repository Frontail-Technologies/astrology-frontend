import type { AdminConversation } from "../types/chat-admin.ts";

export const chatStatusVariants: Record<AdminConversation["status"], "online" | "muted"> = { open: "online", closed: "muted" };
export const chatStatusLabels: Record<AdminConversation["status"], string> = { open: "Open", closed: "Closed" };

export const TRANSCRIPT_PAGE_SIZE = 50;

export const chatFlagFilterLabels: Record<"true" | "false", string> = { true: "Flagged", false: "Not flagged" };

/** Optional unflag reason limits (the flag reason uses ADMIN_REASON, 10–500). */
export const CHAT_UNFLAG_REASON_MAX = 500;

export const CHAT_FLAG_ERROR_HINTS: Record<string, string> = {
  CHAT_ALREADY_FLAGGED: "Another admin flagged this chat in the meantime. Close the dialog to see the current flag.",
  CHAT_NOT_FLAGGED: "This chat is no longer flagged. Close the dialog to see its current state.",
};

/** Human labels for message sender roles (unknown roles fall back to a capitalised value). */
export const chatSenderLabels: Record<string, string> = { customer: "Customer", astrologer: "Astrologer", admin: "Admin", system: "System" };
export const chatSenderLabel = (role: string) => chatSenderLabels[role] ?? role.charAt(0).toUpperCase() + role.slice(1).replace(/[_-]+/g, " ");
