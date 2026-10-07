import type { ConsultationMode } from "@/features/astrologers/types/astrologer";

export type ConversationStatus = "open" | "closed" | "flagged";
export type ConversationSenderType = "customer" | "astrologer" | "system";
export type ConversationAttachment = { type: "image" | "document"; name: string; url?: string };
export type ConversationMessage = { id: string; senderType: ConversationSenderType; senderId?: string; content: string; createdAt: string; attachment?: ConversationAttachment };
export type InternalNote = { id: string; content: string; createdAt: string; author: string };
export type Conversation = {
  id: string;
  customerId: string;
  astrologerId: string;
  consultationId?: string;
  mode: ConsultationMode;
  status: ConversationStatus;
  startedAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessagePreview?: string;
  messages: ConversationMessage[];
  internalNotes: InternalNote[];
  flagReason?: "Abuse" | "Spam" | "Privacy concern" | "Payment dispute" | "Other";
  flaggedAt?: string;
};
