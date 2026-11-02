import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";

export type ChatListFilter = "status" | "flagged";
export type ChatListIdFilter = "customerUserId" | "astrologerId" | "consultationId";

/** The chats API has no free-text search and no date range. */
export const chatListConfig: AdminListConfig<ChatListFilter, ChatListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: ["open", "closed"], flagged: ["true", "false"] },
  idFilters: ["customerUserId", "astrologerId", "consultationId"],
};
