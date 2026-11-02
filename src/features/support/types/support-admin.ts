export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high";
export type TicketCategory = "consultation" | "order" | "payment" | "pooja" | "account" | "technical" | "other";

/** `GET /admin/support/tickets` item. */
export type AdminTicket = {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  relatedEntity: { type: string; id: string } | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  customer: { id: string; email: string | null } | null;
  /** Next statuses the server state machine allows (server-provided; the server still re-validates). */
  allowedTransitions: TicketStatus[];
};

export type AdminTicketMessage = { id: string; senderType: string; senderUserId: string | null; body: string; internal: boolean; createdAt: string };

/** Detail and the response of every support mutation. */
export type AdminTicketDetail = AdminTicket & { messages: AdminTicketMessage[] };
