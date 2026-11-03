export type ChatSessionMode = "chat" | "voice";
export type ChatSessionStatus = "pending" | "active" | "ended" | "insufficient_balance" | "cancelled";

/** `GET /admin/chat-sessions` item and detail. The API returns participant ids only, no names. */
export type AdminChatSession = {
  id: string;
  consultationId: string;
  conversationId: string | null;
  customerUserId: string;
  astrologerId: string;
  status: ChatSessionStatus;
  /** Billed chat, or a LiveKit voice call. */
  mode: ChatSessionMode;
  /** Voice calls only: whether each party is connected right now. */
  call?: { customerConnected: boolean; astrologerConnected: boolean };
  pricePerMinutePaise: number;
  billingUnitSeconds: number;
  startedAt: string | null;
  endedAt: string | null;
  billableSeconds: number;
  chargedPaise: number;
  endReason: string | null;
};
