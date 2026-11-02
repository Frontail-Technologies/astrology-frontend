import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { ChatListFilter, ChatListIdFilter } from "../state/chat-list-state";

const keys = createAdminQueryKeys("chats");

/** Transcripts deliberately have no query key: they are never cached. */
export const chatKeys = {
  ...keys,
  list: (state: AdminListState<ChatListFilter, ChatListIdFilter>) => keys.list(state),
};
