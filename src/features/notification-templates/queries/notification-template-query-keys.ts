import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { NotificationTemplateListFilter } from "../state/notification-template-list-state";

const keys = createAdminQueryKeys("notification-templates");

export const notificationTemplateKeys = {
  ...keys,
  list: (state: AdminListState<NotificationTemplateListFilter, never>) => keys.list(state),
};
