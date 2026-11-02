import type { ConsultationStatus } from "../../consultations/types/consultation-admin.ts";

/**
 * `GET /admin/chats` item and detail (backend `toAdminConversation`). Metadata only: message content is never part
 * of this shape and is disclosed solely through the audited transcript endpoint.
 */
export type AdminConversation = {
  id: string;
  consultationId: string;
  status: "open" | "closed";
  consultationStatus: ConsultationStatus;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: { senderRole: string; createdAt: string } | null;
  customer: { id: string; email: string | null };
  astrologer: { id: string; displayName: string; slug: string };
  /** Moderation flag (metadata only). All three are null while the chat is not flagged. */
  flaggedAt: string | null;
  flagReason: string | null;
  flaggedBy: { id: string; email: string } | null;
};

/** `POST /admin/chats/:id/flag` (reason 10–500, trimmed). */
export type ChatFlagInput = { reason: string };
/** `POST /admin/chats/:id/unflag` (optional reason 1–500). */
export type ChatUnflagInput = { reason?: string };

export type TranscriptAccessInput = { reason: string; page?: number; limit?: number; order?: "asc" | "desc" };

export type TranscriptMessage = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};
