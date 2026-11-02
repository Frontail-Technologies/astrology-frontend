import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { ManagedNotificationTemplate, NotificationTemplateInput } from "../types/notification-template-admin";

export function listNotificationTemplates(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedNotificationTemplate>("/notification-templates", query, signal);
}

export function getNotificationTemplate(id: string, signal?: AbortSignal) {
  return adminGet<ManagedNotificationTemplate>(`/notification-templates/${encodeId(id)}`, { signal });
}

export function createNotificationTemplate(input: NotificationTemplateInput) {
  return adminSend<ManagedNotificationTemplate>("/notification-templates", "POST", input);
}

export function updateNotificationTemplate(id: string, input: NotificationTemplateInput) {
  return adminSend<ManagedNotificationTemplate>(`/notification-templates/${encodeId(id)}`, "PATCH", input);
}

/** 409 `NOTIFICATION_TEMPLATE_ACTIVE` while the template is active. */
export function deleteNotificationTemplate(id: string) {
  return adminSend<unknown>(`/notification-templates/${encodeId(id)}`, "DELETE");
}
