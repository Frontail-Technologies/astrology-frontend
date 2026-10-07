"use client";

import { useCallback } from "react";
import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { conversationSeedData } from "../data/conversations";
import type { Conversation } from "../types/conversation";

export function useConversationRepository() {
  const repository = useMockRepository<Conversation>("astrology-admin-conversations-v1", conversationSeedData);
  const save = useCallback((record: Conversation) => repository.update({ ...record, updatedAt: new Date().toISOString() }), [repository]);
  return {
    ...repository,
    markRead: (record: Conversation) => save({ ...record, unreadCount: 0 }),
    close: (record: Conversation) => save({ ...record, status: "closed" }),
    reopen: (record: Conversation) => save({ ...record, status: "open", flagReason: undefined, flaggedAt: undefined }),
    flag: (record: Conversation, reason: NonNullable<Conversation["flagReason"]>) => save({ ...record, status: "flagged", flagReason: reason, flaggedAt: new Date().toISOString() }),
    unflag: (record: Conversation) => save({ ...record, status: "open", flagReason: undefined, flaggedAt: undefined }),
    addInternalNote: (record: Conversation, content: string) => save({ ...record, internalNotes: [...record.internalNotes, { id: `note-${Date.now()}`, content, createdAt: new Date().toISOString(), author: "Admin" }] }),
  };
}
