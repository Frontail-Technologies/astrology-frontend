"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { ADMIN_SCOPED_LIST_LIMIT, useAdminScopedList } from "@/features/admin/data/use-admin-scoped-list";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { getChatSession, listChatSessions } from "../api/chat-session-admin-api";
import { chatSessionKeys } from "../queries/chat-session-query-keys";
import { chatSessionListConfig } from "../state/chat-session-list-state";

export function useChatSessionList() {
  return useAdminList(chatSessionListConfig, chatSessionKeys.list, listChatSessions);
}

export function useChatSessionDetail(id: string) {
  return useAdminDetail(chatSessionKeys.detail(id), (signal) => getChatSession(id, signal), Boolean(id));
}

/** A customer's latest billed chat sessions (first page) for related panels. */
export function useChatSessionsForCustomer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(chatSessionKeys.scoped("related", "customerUserId", id ?? "", limit), listChatSessions, { key: "customerUserId", id }, limit);
}

/** An astrologer's latest billed chat sessions (first page) for related panels. */
export function useChatSessionsForAstrologer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(chatSessionKeys.scoped("related", "astrologerId", id ?? "", limit), listChatSessions, { key: "astrologerId", id }, limit);
}

/** The paid chat session of one consultation (the backend allows at most one). */
export function useChatSessionForConsultation(consultationId: string | null | undefined) {
  const list = useAdminScopedList(chatSessionKeys.scoped("related", "consultationId", consultationId ?? "", 1), listChatSessions, { key: "consultationId", id: consultationId }, 1);
  return { ...list, session: list.items[0] ?? null };
}
