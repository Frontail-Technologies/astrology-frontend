import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { isNotificationEventFilter, notificationChannelLabels, notificationTemplateStatusLabels } from "../constants/notification-template-status.ts";

export type NotificationTemplateListFilter = "channel" | "status" | "event";

export const notificationTemplateListConfig: AdminListConfig<NotificationTemplateListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 200,
  filters: {
    channel: Object.keys(notificationChannelLabels),
    status: Object.keys(notificationTemplateStatusLabels),
    event: isNotificationEventFilter,
  },
};
