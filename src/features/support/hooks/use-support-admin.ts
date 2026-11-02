"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { ADMIN_SCOPED_LIST_LIMIT, useAdminScopedList } from "@/features/admin/data/use-admin-scoped-list";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { addInternalNote, getTicket, listTickets, replyToTicket, updateTicketPriority, updateTicketStatus } from "../api/support-admin-api";
import { supportKeys } from "../queries/support-query-keys";
import { supportListConfig } from "../state/support-list-state";
import type { AdminTicketDetail, TicketPriority, TicketStatus } from "../types/support-admin";

export function useTicketList() {
  return useAdminList(supportListConfig, supportKeys.list, listTickets);
}

export function useTicketDetail(id: string) {
  return useAdminDetail(supportKeys.detail(id), (signal) => getTicket(id, signal), Boolean(id));
}

/** Every support mutation returns the full ticket; list and detail are refreshed from the server afterwards. */
function useTicketMutation<TInput>(send: (input: TInput) => Promise<AdminTicketDetail>, successMessage: string) {
  return useAdminMutation({ mutationFn: send, invalidate: [supportKeys.all], successMessage, toastErrors: false });
}

export function useReplyToTicket(id: string) {
  return useTicketMutation((body: string) => replyToTicket(id, body), "Reply sent to the customer");
}

export function useAddInternalNote(id: string) {
  return useTicketMutation((body: string) => addInternalNote(id, body), "Internal note added");
}

export function useUpdateTicketStatus(id: string) {
  return useTicketMutation((status: TicketStatus) => updateTicketStatus(id, status), "Ticket status updated");
}

export function useUpdateTicketPriority(id: string) {
  return useTicketMutation((priority: TicketPriority) => updateTicketPriority(id, priority), "Ticket priority updated");
}

/** A customer's latest support tickets (first page) for related panels. */
export function useTicketsForCustomer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(supportKeys.scoped("related", "customerUserId", id ?? "", limit), listTickets, { key: "customerUserId", id }, limit);
}
