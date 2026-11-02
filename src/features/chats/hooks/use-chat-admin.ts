"use client";

import type { AdminPage } from "@/features/admin/data/admin-list-state";
import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { ADMIN_SCOPED_LIST_LIMIT, useAdminScopedList } from "@/features/admin/data/use-admin-scoped-list";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { flagChat, getChat, listChats, requestChatTranscript, unflagChat } from "../api/chat-admin-api";
import { chatKeys } from "../queries/chat-query-keys";
import { chatListConfig } from "../state/chat-list-state";
import type { ChatFlagInput, ChatUnflagInput, TranscriptAccessInput, TranscriptMessage } from "../types/chat-admin";

export function useChatList() {
  return useAdminList(chatListConfig, chatKeys.list, listChats);
}

export function useChatDetail(id: string) {
  return useAdminDetail(chatKeys.detail(id), (signal) => getChat(id, signal), Boolean(id));
}

/**
 * Each call is a deliberate, audited disclosure: a mutation (never cached as a query, `gcTime: 0` so the response
 * leaves the mutation cache once unobserved) that is never retried. Errors render inline, not as a toast.
 */
export function useChatTranscriptAccess(chatId: string) {
  return useAdminMutation<TranscriptAccessInput, AdminPage<TranscriptMessage>>({
    mutationFn: (input) => requestChatTranscript(chatId, input),
    toastErrors: false,
    gcTime: 0,
  });
}

/** A customer's latest chat conversations (metadata only, first page). */
export function useChatsForCustomer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(chatKeys.scoped("related", "customerUserId", id ?? "", limit), listChats, { key: "customerUserId", id }, limit);
}

/** An astrologer's latest chat conversations (metadata only, first page). */
export function useChatsForAstrologer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(chatKeys.scoped("related", "astrologerId", id ?? "", limit), listChats, { key: "astrologerId", id }, limit);
}

/** The chat conversation attached to a consultation (a consultation has at most one), or `null`. */
export function useChatForConsultation(consultationId: string | null | undefined) {
  const query = useAdminScopedList(chatKeys.scoped("related", "consultationId", consultationId ?? "", 1), listChats, { key: "consultationId", id: consultationId }, 1);
  return { ...query, chat: query.items[0] ?? null };
}

/** Flags a chat for moderation follow-up. Refreshes chat metadata only; transcripts are never cached or refetched. */
export function useFlagChat(chatId: string) {
  return useAdminMutation({
    mutationFn: (input: ChatFlagInput) => flagChat(chatId, input),
    invalidate: [chatKeys.all],
    successMessage: "Chat flagged",
    toastErrors: false,
  });
}

export function useUnflagChat(chatId: string) {
  return useAdminMutation({
    mutationFn: (input: ChatUnflagInput) => unflagChat(chatId, input),
    invalidate: [chatKeys.all],
    successMessage: "Flag removed",
    toastErrors: false,
  });
}
