import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminTicket, AdminTicketDetail, TicketPriority, TicketStatus } from "../types/support-admin";

const ticketPath = (id: string) => `/support/tickets/${encodeId(id)}`;

export function listTickets(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminTicket>("/support/tickets", query, signal);
}

export function getTicket(id: string, signal?: AbortSignal) {
  return adminGet<AdminTicketDetail>(ticketPath(id), { signal });
}

/** Replying to a closed ticket returns 409 TICKET_CLOSED; an admin reply moves an open ticket to in_progress. */
export function replyToTicket(id: string, body: string) {
  return adminSend<AdminTicketDetail>(`${ticketPath(id)}/messages`, "POST", { body });
}

/** Internal notes are admin-only and allowed on closed tickets. */
export function addInternalNote(id: string, body: string) {
  return adminSend<AdminTicketDetail>(`${ticketPath(id)}/internal-notes`, "POST", { body });
}

export function updateTicketStatus(id: string, status: TicketStatus) {
  return adminSend<AdminTicketDetail>(`${ticketPath(id)}/status`, "PATCH", { status });
}

export function updateTicketPriority(id: string, priority: TicketPriority) {
  return adminSend<AdminTicketDetail>(`${ticketPath(id)}/priority`, "PATCH", { priority });
}
