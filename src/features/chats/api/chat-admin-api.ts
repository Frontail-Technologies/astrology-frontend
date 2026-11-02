import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminPage } from "@/features/admin/data/admin-list-state";
import type { AdminConversation, ChatFlagInput, ChatUnflagInput, TranscriptAccessInput, TranscriptMessage } from "../types/chat-admin";

export function listChats(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminConversation>("/chats", query, signal);
}

export function getChat(id: string, signal?: AbortSignal) {
  return adminGet<AdminConversation>(`/chats/${encodeId(id)}`, { signal });
}

/** Reason-required, audited disclosure (the audit is written before anything is returned). */
export function requestChatTranscript(chatId: string, input: TranscriptAccessInput) {
  return adminSend<AdminPage<TranscriptMessage>>(`/chats/${encodeId(chatId)}/transcript`, "POST", input);
}

/** Moderation flag (metadata only; audited). 409 `CHAT_ALREADY_FLAGGED`. */
export function flagChat(chatId: string, input: ChatFlagInput) {
  return adminSend<AdminConversation>(`/chats/${encodeId(chatId)}/flag`, "POST", input);
}

/** 409 `CHAT_NOT_FLAGGED`. */
export function unflagChat(chatId: string, input: ChatUnflagInput) {
  return adminSend<AdminConversation>(`/chats/${encodeId(chatId)}/unflag`, "POST", input);
}
