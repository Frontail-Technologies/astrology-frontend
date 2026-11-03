import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { chatSessionModeLabels, chatSessionStatusLabels } from "../constants/chat-session-status.ts";

export type ChatSessionListFilter = "status" | "mode";
export type ChatSessionListIdFilter = "customerUserId" | "astrologerId" | "consultationId";

export const chatSessionListConfig: AdminListConfig<ChatSessionListFilter, ChatSessionListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: Object.keys(chatSessionStatusLabels), mode: Object.keys(chatSessionModeLabels) },
  idFilters: ["customerUserId", "astrologerId", "consultationId"],
  dateRange: true,
};
