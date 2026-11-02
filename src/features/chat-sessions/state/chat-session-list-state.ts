import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { chatSessionStatusLabels } from "../constants/chat-session-status.ts";

export type ChatSessionListFilter = "status";
export type ChatSessionListIdFilter = "customerUserId" | "astrologerId" | "consultationId";

export const chatSessionListConfig: AdminListConfig<ChatSessionListFilter, ChatSessionListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: Object.keys(chatSessionStatusLabels) },
  idFilters: ["customerUserId", "astrologerId", "consultationId"],
  dateRange: true,
};
