import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { ChatSessionListFilter, ChatSessionListIdFilter } from "../state/chat-session-list-state";

const keys = createAdminQueryKeys("chat-sessions");

export const chatSessionKeys = {
  ...keys,
  list: (state: AdminListState<ChatSessionListFilter, ChatSessionListIdFilter>) => keys.list(state),
};
