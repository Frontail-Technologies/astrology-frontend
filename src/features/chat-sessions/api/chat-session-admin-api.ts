import { adminGet, adminList, encodeId } from "@/features/admin/data/admin-api";
import type { AdminChatSession } from "../types/chat-session-admin";

export function listChatSessions(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminChatSession>("/chat-sessions", query, signal);
}

export function getChatSession(id: string, signal?: AbortSignal) {
  return adminGet<AdminChatSession>(`/chat-sessions/${encodeId(id)}`, { signal });
}
