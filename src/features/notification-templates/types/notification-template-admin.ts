/** Admin shapes for `/admin/notification-templates`. */
export type NotificationChannel = "email" | "sms" | "whatsapp" | "push";
export type NotificationTemplateStatus = "active" | "inactive" | "draft";

/** Raw template record. `variables` is computed by the server from `{{lower_snake}}` placeholders. */
export type ManagedNotificationTemplate = {
  id: string;
  name: string;
  channel: NotificationChannel;
  event: string;
  subject: string | null;
  content: string;
  status: NotificationTemplateStatus;
  variables: string[];
  createdAt: string;
  updatedAt: string;
};

/** Create and `PATCH /:id` body (status is a normal field on this API). */
export type NotificationTemplateInput = {
  name: string;
  channel: NotificationChannel;
  event: string;
  subject: string | null;
  content: string;
  status: NotificationTemplateStatus;
};
